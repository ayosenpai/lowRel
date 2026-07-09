import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { identifyCustomer } from '@/lib/actions/crm';

const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// POST: Create a Razorpay order
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { amount, currency = 'INR', receipt, customer } = body;

        if (!amount || amount <= 0) {
            return NextResponse.json(
                { error: 'Invalid amount' },
                { status: 400 }
            );
        }

        // 1. Identify/Create Customer Profile & Stitch Session
        let customerId = null;
        if (customer && customer.email) {
            customerId = await identifyCustomer({
                email: customer.email,
                firstName: customer.firstName,
                lastName: customer.lastName,
                phone: customer.phone
            });
        }

        // Razorpay amount is in the smallest currency unit (paise for INR, cents for USD)
        const amountInSmallest = Math.round(amount * 100);

        const options = {
            amount: amountInSmallest,
            currency: currency,
            receipt: receipt || `receipt_${Date.now()}`,
            notes: {
                customer_id: customerId || 'guest',
            }
        };

        console.log('Creating Razorpay order with options:', {
            amount: options.amount,
            currency: options.currency,
            receipt: options.receipt,
        });

        const order = await razorpay.orders.create(options);

        console.log('Razorpay order created:', order.id);

        return NextResponse.json({ ...order, customerId });
    } catch (error: any) {
        console.error('Razorpay Order Creation Error:', error?.error || error?.message || error);

        // Return more specific error info for debugging
        const errorMessage = error?.error?.description || error?.message || 'Failed to create Razorpay order';
        const statusCode = error?.statusCode || 500;

        return NextResponse.json(
            { error: errorMessage },
            { status: statusCode }
        );
    }
}

// PUT: Verify Razorpay payment signature
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

        // Verify signature using HMAC SHA256
        const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        const isValid = generatedSignature === razorpay_signature;

        if (!isValid) {
            console.error('Payment verification failed: signature mismatch');
            return NextResponse.json(
                { error: 'Payment verification failed', verified: false },
                { status: 400 }
            );
        }

        console.log('Payment verified successfully:', razorpay_payment_id);

        return NextResponse.json({ verified: true });
    } catch (error: any) {
        console.error('Payment Verification Error:', error);
        return NextResponse.json(
            { error: 'Payment verification failed' },
            { status: 500 }
        );
    }
}
