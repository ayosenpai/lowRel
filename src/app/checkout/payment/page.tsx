'use client';

import { useCart } from '@/lib/cart-context';
import { useCheckout } from '@/lib/checkout-context';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard, Lock, ShieldCheck, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { createOrderRecord } from '@/lib/actions/crm';
import { trackEvent } from '@/lib/actions/analytics';
import { useRouter } from 'next/navigation';

export default function PaymentPage() {
    const { state, dispatch } = useCart();
    const { checkoutData, discountCode, discountAmount, applyDiscount } = useCheckout();
    const [isProcessing, setIsProcessing] = useState(false);
    const [couponInput, setCouponInput] = useState('');
    const [applyError, setApplyError] = useState('');
    const [paymentError, setPaymentError] = useState('');
    const router = useRouter();

    const handleApplyDiscount = () => {
        setApplyError('');
        const success = applyDiscount(couponInput);
        if (!success) {
            setApplyError('Invalid discount code');
        }
    };

    const subtotal = state.total;
    const discount = subtotal * discountAmount;
    const taxes = (subtotal - discount) * 0.08;
    const finalTotal = subtotal - discount + taxes;

    // Determine currency from cart items
    const currencyCode = state.items[0]?.symbol === '₹' ? 'INR' : 'INR'; // Default to INR for Razorpay test keys
    const currencySymbol = currencyCode === 'INR' ? '₹' : '$';

    const loadRazorpay = (): Promise<boolean> => {
        return new Promise((resolve) => {
            // Check if already loaded
            if ((window as any).Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        setPaymentError('');

        try {
            const res = await loadRazorpay();

            if (!res) {
                setPaymentError('Razorpay SDK failed to load. Please check your internet connection.');
                setIsProcessing(false);
                return;
            }

            // Create Order on Server
            const orderRes = await fetch('/api/checkout/razorpay', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: finalTotal,
                    currency: currencyCode,
                    receipt: `receipt_${Date.now()}`,
                    customer: {
                        email: checkoutData.email,
                        firstName: checkoutData.firstName,
                        lastName: checkoutData.lastName,
                        phone: checkoutData.phone,
                    }
                }),
            });

            const orderData = await orderRes.json();

            if (!orderRes.ok || orderData.error) {
                console.error('Order creation failed:', orderData);
                setPaymentError(orderData.error || 'Could not create payment order. Please try again.');
                setIsProcessing(false);
                return;
            }

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'Low Religion',
                description: 'Order Payment',
                order_id: orderData.id,
                prefill: {
                    name: `${checkoutData.firstName} ${checkoutData.lastName}`,
                    email: checkoutData.email,
                    contact: checkoutData.phone,
                },
                theme: { color: '#000000' },
                handler: async function (response: any) {
                    try {
                        // Step 1: Verify payment signature on server
                        const verifyRes = await fetch('/api/checkout/razorpay', {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            }),
                        });

                        const verifyData = await verifyRes.json();

                        if (!verifyData.verified) {
                            setPaymentError('Payment verification failed. Please contact support.');
                            setIsProcessing(false);
                            return;
                        }

                        // Step 2: Record order in CRM (only after verified)
                        if (orderData.customerId) {
                            await createOrderRecord({
                                customerId: orderData.customerId,
                                razorpayOrderId: response.razorpay_order_id,
                                razorpayPaymentId: response.razorpay_payment_id,
                                amount: orderData.amount,
                                currency: orderData.currency,
                                items: state.items,
                                shippingAddress: {
                                    address: checkoutData.address,
                                    city: checkoutData.city,
                                    postalCode: checkoutData.postalCode,
                                    country: checkoutData.country,
                                },
                            });
                        }

                        // Step 3: Track analytics event
                        trackEvent({
                            eventType: 'purchase',
                            payload: {
                                total: finalTotal,
                                orderId: response.razorpay_order_id,
                                paymentId: response.razorpay_payment_id,
                                items: state.items.map(i => ({ id: i.id, name: i.name, quantity: i.quantity })),
                                discountCode: discountCode
                            }
                        });

                        // Step 4: Navigate to success
                        router.push('/checkout/success');
                    } catch (err) {
                        console.error('Post-payment processing error:', err);
                        // Payment was successful but CRM/analytics failed — still redirect
                        router.push('/checkout/success');
                    }
                },
                modal: {
                    ondismiss: function () {
                        setIsProcessing(false);
                    },
                },
            };

            const rzp = new (window as any).Razorpay(options);

            rzp.on('payment.failed', function (response: any) {
                console.error('Payment failed:', response.error);
                setPaymentError(
                    response.error?.description ||
                    'Payment failed. Please try again or use a different payment method.'
                );
                setIsProcessing(false);
            });

            rzp.open();
        } catch (error) {
            console.error('Payment Error:', error);
            setIsProcessing(false);
            setPaymentError('An error occurred while initializing payment. Please try again.');
        }
    };

    if (state.items.length === 0 && !isProcessing) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center p-5 font-sans">
                <div className="text-center space-y-6">
                    <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Session Expired</h1>
                    <p className="text-gray-500">Your cart is empty. Please return to the shop.</p>
                    <Link
                        href="/collections/all"
                        className="inline-block bg-black text-white px-10 py-4 rounded-full font-bold hover:bg-gray-800 transition-all shadow-lg active:scale-[0.98]"
                    >
                        Browse Products
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-[#d8a4bc]/20">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row min-h-screen">

                {/* Main Content Area - Left (60%) */}
                <div className="lg:w-[60%] px-4 py-8 md:p-12 lg:p-20 order-2 lg:order-1 border-r border-gray-100">
                    <div className="max-w-xl ml-auto">
                        <nav className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-sm text-gray-500 mb-8 md:mb-12">
                            <Link href="/cart" className="hover:text-black">Cart</Link>
                            <ChevronRight size={12} className="md:w-3.5 md:h-3.5" />
                            <Link href="/checkout" className="hover:text-black">Information</Link>
                            <ChevronRight size={12} className="md:w-3.5 md:h-3.5" />
                            <span className="text-black font-semibold">Payment</span>
                        </nav>

                        <div className="mb-12 p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Contact</span>
                                <span className="text-gray-900 font-medium">{checkoutData.email}</span>
                            </div>
                            <div className="h-px bg-gray-200" />
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Ship to</span>
                                <span className="text-gray-900 font-medium text-right max-w-[250px]">
                                    {checkoutData.address}, {checkoutData.city} {checkoutData.postalCode}
                                </span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-12">
                            <section className="space-y-6">
                                <div className="flex flex-col gap-1">
                                    <h2 className="text-xl font-bold text-gray-900">Payment</h2>
                                    <p className="text-sm text-gray-500">All transactions are secure and encrypted.</p>
                                </div>

                                <div className="border-2 border-black rounded-3xl overflow-hidden shadow-sm bg-gray-50/50 p-8 flex flex-col items-center text-center gap-6">
                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-gray-100">
                                        <Lock size={32} className="text-gray-900" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="font-bold text-lg">Secure Gateway</h3>
                                        <p className="text-sm text-gray-500 max-w-xs mx-auto">
                                            After clicking &quot;Pay Now&quot;, you will be redirected to Razorpay to complete your purchase securely.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4 opacity-70 grayscale hover:grayscale-0 transition-all">
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4" alt="Visa" />
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-4" alt="Mastercard" />
                                        <img src="https://razorpay.com/assets/razorpay-glyph.svg" className="h-4" alt="Razorpay" />
                                    </div>
                                </div>
                            </section>

                            {/* Payment Error Display */}
                            {paymentError && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3"
                                >
                                    <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                                        <span className="text-red-600 text-xs font-bold">!</span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-red-800 font-medium">Payment Error</p>
                                        <p className="text-sm text-red-600 mt-1">{paymentError}</p>
                                    </div>
                                </motion.div>
                            )}

                            <div className="space-y-6">
                                <button
                                    type="submit"
                                    disabled={isProcessing}
                                    className="w-full bg-black text-white py-5 rounded-full font-bold text-lg hover:bg-gray-800 transition-all shadow-xl active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-3 relative overflow-hidden group"
                                >
                                    {isProcessing ? (
                                        <motion.div
                                            className="flex items-center gap-3"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                        >
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Processing Securely...
                                        </motion.div>
                                    ) : (
                                        <>
                                            Pay {currencySymbol} {finalTotal.toFixed(2)}
                                            <ShieldCheck size={20} />
                                        </>
                                    )}
                                </button>
                                <Link
                                    href="/checkout"
                                    className="flex items-center justify-center gap-2 text-sm font-medium text-gray-500 hover:text-black transition-colors"
                                >
                                    <ArrowLeft size={16} />
                                    Return to information
                                </Link>
                            </div>

                            <div className="pt-12 text-center">
                                <p className="text-xs text-gray-400">Your connection is 256-bit AES encrypted</p>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Order Summary - Right (40%) */}
                <div className="lg:w-[40%] bg-gray-50 px-4 py-8 md:p-12 lg:p-20 order-1 lg:order-2 border-l border-gray-100">
                    <div className="max-w-md">
                        <div className="space-y-8">
                            {/* Product List */}
                            <div className="space-y-6 max-h-[400px] overflow-auto pr-4 custom-scrollbar">
                                {state.items.map((item) => (
                                    <div key={item.id} className="flex justify-between items-center gap-4">
                                        <div className="flex gap-4 items-center">
                                            <div className="relative">
                                                <div className="w-16 h-16 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm shrink-0">
                                                    {item.images && item.images[0] && (
                                                        <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                                                    )}
                                                </div>
                                                <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                                                    {item.quantity}
                                                </span>
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-gray-900 truncate">{item.name}</p>
                                                <p className="text-xs text-gray-500 uppercase tracking-widest">{currencySymbol} {item.price}</p>
                                            </div>
                                        </div>
                                        <p className="text-sm font-bold text-gray-900">{currencySymbol} {((item.price || 0) * item.quantity).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Discount Code Input */}
                            <div className="pt-8 border-t border-gray-200">
                                <div className="space-y-4">
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest text-[#d8a4bc]">Gift card or discount code</h3>
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            value={couponInput}
                                            onChange={(e) => setCouponInput(e.target.value)}
                                            placeholder="Enter code"
                                            className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-black transition-all text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleApplyDiscount}
                                            disabled={!couponInput || isProcessing}
                                            className="bg-black text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-800 transition-all disabled:opacity-50"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                    {applyError && <p className="text-xs text-red-500 font-medium pl-1">{applyError}</p>}
                                    {discountCode && (
                                        <div className="flex items-center gap-2 bg-[#d8a4bc]/10 text-[#d8a4bc] px-3 py-2 rounded-lg w-fit">
                                            <span className="text-xs font-bold uppercase tracking-widest">{discountCode} Applied</span>
                                            <button
                                                type="button"
                                                onClick={() => { setCouponInput(''); applyDiscount(''); }}
                                                className="text-xs hover:text-black font-bold"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Total Calculation */}
                            <div className="space-y-3 pt-6 border-t border-gray-200">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-bold text-gray-900">{currencySymbol} {subtotal.toFixed(2)}</span>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="flex justify-between text-sm text-[#d8a4bc]">
                                        <span className="font-medium">Discount (15%)</span>
                                        <span className="font-bold">-{currencySymbol} {discount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Shipping</span>
                                    <span className="text-black font-bold">FREE</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Estimated taxes</span>
                                    <span className="font-bold text-gray-900">{currencySymbol} {taxes.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-xl font-bold pt-6 border-t border-gray-200 text-gray-900">
                                    <span>Total</span>
                                    <div className="text-right">
                                        <span className="text-xs text-gray-400 mr-2 uppercase tracking-widest">{currencyCode}</span>
                                        <span>{currencySymbol} {finalTotal.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
