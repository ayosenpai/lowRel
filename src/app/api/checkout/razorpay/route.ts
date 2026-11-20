import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { identifyCustomer } from '@/lib/actions/crm';
import {
    computeOrderTotals,
    createPendingOrder,
    markOrderPaid,
    verifyRazorpaySignature,
    OrderValidationError,
    type OrderItemInput,
} from '@/lib/orders';

const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// POST: Create a Razorpay order (amount is recomputed server-side)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            items,
            discountCode,
            customer,
            shippingAddress,
        }: {
            items?: OrderItemInput[];
            discountCode?: string | null;
            customer?: { email?: string; firstName?: string; lastName?: string; phone?: string };
            shippingAddress?: Record<string, unknown> | null;
        } = body || {};

        if (!items || items.length === 0) {
            return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
        }

        if (!customer?.email) {
            return NextResponse.json({ error: 'Customer email is required' }, { status: 400 });
        }

        // 1. Recompute totals from the database — never trust the client amount
        const totals = await computeOrderTotals(items, discountCode);

        // Razorpay's minimum charge is 100 paise (₹1)
        if (totals.total < 100) {
            return NextResponse.json(
                { error: 'Order total is below the minimum payable amount' },
                { status: 400 }
            );
        }

        // 2. Identify/Create Customer Profile & Stitch Session
        const customerId = await identifyCustomer({
            email: customer.email,
            firstName: customer.firstName,
            lastName: customer.lastName,
            phone: customer.phone,
        });

        const receipt = `receipt_${Date.now()}`;

        // 3. Create the Razorpay order
        const order = await razorpay.orders.create({
            amount: totals.total,
            currency: totals.currency,
            receipt,
            notes: {
                customer_id: customerId || 'guest',
            },
        });

        // 4. Persist a pending order immediately so a paid payment can never
        //    disappear if the shopper closes the tab before confirmation.
        //    Fail closed: if we cannot persist the order, do not let the
        //    shopper pay into an unrecorded order.
        await createPendingOrder({
            razorpayOrderId: order.id,
            amount: totals.total,
            currency: totals.currency,
            customerId,
            discountCode: totals.discountCode ?? null,
            shippingAddress: shippingAddress ?? null,
            lines: totals.lines,
        });

        return NextResponse.json({
            id: order.id,
            amount: order.amount,
            currency: order.currency,
            customerId,
        });
    } catch (error: any) {
        if (error instanceof OrderValidationError) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        console.error('Razorpay Order Creation Error:', error?.error || error?.message || error);

        const errorMessage = error?.error?.description || error?.message || 'Failed to create Razorpay order';
        const statusCode = error?.statusCode || 500;

        return NextResponse.json(
            { error: errorMessage },
            { status: statusCode }
        );
    }
}

// GET: Check whether a given order has been paid (used for session recovery
// after mobile redirects back to the checkout page)
export async function GET(request: NextRequest) {
    try {
        const orderId = request.nextUrl.searchParams.get('order_id');
        if (!orderId) {
            return NextResponse.json({ error: 'Missing order_id' }, { status: 400 });
        }

        const order = await razorpay.orders.fetch(orderId);
        const paid = order.amount_paid > 0;

        return NextResponse.json({ orderId, paid });
    } catch (error: any) {
        console.error('Razorpay order status check error:', error?.error || error?.message || error);
        return NextResponse.json(
            { error: 'Could not fetch order status' },
            { status: 500 }
        );
    }
}

// PUT: Verify the Razorpay signature, then mark the order paid (idempotent).
// The webhook provides the same guarantee server-side if the browser never
// comes back.
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return NextResponse.json(
                { error: 'Missing payment verification parameters' },
                { status: 400 }
            );
        }

        const isValid = verifyRazorpaySignature({
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
        });

        if (!isValid) {
            console.error('Payment verification failed: signature mismatch');
            return NextResponse.json(
                { error: 'Payment verification failed', verified: false },
                { status: 400 }
            );
        }

        const result = await markOrderPaid(razorpay_order_id, razorpay_payment_id);

        return NextResponse.json({
            verified: true,
            orderRecorded: !result.missing,
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            amount: result.order?.totalAmount,
            currency: result.order?.currency,
        });
    } catch (error: any) {
        console.error('Payment Verification Error:', error);
        return NextResponse.json(
            { error: 'Payment verification failed' },
            { status: 500 }
        );
    }
}
