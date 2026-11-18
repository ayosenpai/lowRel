import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { eq, and } from 'drizzle-orm';
import { db } from '@/db';
import { orders } from '@/db/schema';
import { markOrderPaid } from '@/lib/orders';

function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret || !signature) return false;

    const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
    const expectedBuf = Buffer.from(expected, 'utf8');
    const receivedBuf = Buffer.from(signature, 'utf8');

    return expectedBuf.length === receivedBuf.length && crypto.timingSafeEqual(expectedBuf, receivedBuf);
}

/**
 * Razorpay webhook endpoint.
 * Configure in Razorpay Dashboard → Settings → Webhooks:
 *   URL:    https://www.lowreligion.com/api/webhooks/razorpay
 *   Secret: RAZORPAY_WEBHOOK_SECRET (same value as the Vercel env var)
 *   Events: payment.captured, payment.failed, order.paid
 *
 * This is the authoritative server-side record of payment success: the
 * client-side confirmation is a convenience, this endpoint is the guarantee.
 */
export async function POST(request: NextRequest) {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
        console.error('[razorpay-webhook] RAZORPAY_WEBHOOK_SECRET is not configured');
        return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });
    }

    if (!verifyWebhookSignature(rawBody, signature)) {
        console.error('[razorpay-webhook] Invalid signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    let event: any;
    try {
        event = JSON.parse(rawBody);
    } catch {
        return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    try {
        switch (event?.event) {
            case 'payment.captured':
            case 'order.paid': {
                const payment = event?.payload?.payment?.entity;
                const orderId: string | undefined = payment?.order_id;
                const paymentId: string | undefined = payment?.id;

                if (orderId && paymentId) {
                    const result = await markOrderPaid(orderId, paymentId);
                    if (result.missing) {
                        console.warn(`[razorpay-webhook] No local order found for Razorpay order ${orderId}`);
                    }
                }
                break;
            }

            case 'payment.failed': {
                const payment = event?.payload?.payment?.entity;
                if (payment?.order_id) {
                    await db
                        .update(orders)
                        .set({ status: 'failed', updatedAt: new Date() })
                        .where(and(eq(orders.orderId, payment.order_id), eq(orders.status, 'pending')));
                }
                break;
            }

            default:
                // Acknowledge unhandled events so Razorpay stops retrying
                break;
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('[razorpay-webhook] Processing error:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}
