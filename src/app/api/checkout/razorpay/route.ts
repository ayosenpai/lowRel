import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { identifyCustomer } from '@/lib/actions/crm';

const razorpay = new Razorpay({
    key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { amount, currency = 'USD', receipt, customer } = body;

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

        // Razorpay amount is in the smallest currency unit (e.g., cents for USD, paise for INR)
        const options = {
            amount: Math.round(amount * 100),
            currency: currency,
            receipt: receipt,
            notes: {
                customer_id: customerId || 'guest',
            }
        };

        const order = await razorpay.orders.create(options);

        return NextResponse.json({ ...order, customerId });
    } catch (error: any) {
        console.error('Razorpay Order Creation Error:', error);
        return NextResponse.json(
            { error: 'Failed to create Razorpay order' },
            { status: 500 }
        );
    }
}
