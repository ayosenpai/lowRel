'use client';

import { useCart } from '@/lib/cart-context';
import { useCheckout } from '@/lib/checkout-context';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard, Lock, ShieldCheck, ChevronRight, ShoppingBag, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
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
    const [isLoading, setIsLoading] = useState(true);
    const [isOrderSummaryOpen, setIsOrderSummaryOpen] = useState(false);
    const recoveryChecked = useRef(false);
    const router = useRouter();

    useEffect(() => {
        // Simulate loading
        const timer = setTimeout(() => setIsLoading(false), 1500);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        // If we land here after a mobile payment redirect, the browser may have
        // reloaded this page and wiped the in-memory cart (state.items === []).
        // Recover from the snapshot we saved before opening Razorpay.
        const recover = async () => {
            if (recoveryChecked.current) return;
            recoveryChecked.current = true;

            const pending = sessionStorage.getItem('lowrel_pending_order');
            if (!pending) return;

            let snapshot: any = null;
            try {
                snapshot = JSON.parse(pending);
            } catch (e) {
                sessionStorage.removeItem('lowrel_pending_order');
                return;
            }

            // Check server-side whether the payment actually succeeded
            try {
                const res = await fetch(`/api/checkout/razorpay?order_id=${encodeURIComponent(snapshot.orderId)}`);
                const data = await res.json();

                if (res.ok && data.paid) {
                    sessionStorage.removeItem('lowrel_pending_order');
                    router.replace('/checkout/success');
                } else {
                    // Not paid — restore the cart so the user can retry
                    if (Array.isArray(snapshot.items) && snapshot.items.length) {
                        dispatch({ type: 'SET_CART', payload: snapshot.items });
                    }
                    sessionStorage.removeItem('lowrel_pending_order');
                }
            } catch (e) {
                console.error('Order recovery check failed:', e);
                if (Array.isArray(snapshot.items) && snapshot.items.length) {
                    dispatch({ type: 'SET_CART', payload: snapshot.items });
                }
                sessionStorage.removeItem('lowrel_pending_order');
            }
        };

        if (state.items.length === 0) {
            recover();
        } else {
            recoveryChecked.current = true;
        }
    }, [state.items.length, dispatch, router]);

    const handleApplyDiscount = () => {
        setApplyError('');
        const success = applyDiscount(couponInput);
        if (!success) {
            setApplyError('Invalid discount code');
        }
    };

    const subtotal = state.total;
    const discount = subtotal * discountAmount;
    const taxes = 0;
    const finalTotal = subtotal - discount;

    // Determine currency from cart items (set by region in getProducts), default to INR
    const currencyCode = state.items[0]?.currency === 'USD' ? 'USD' : 'INR';
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

    const saveOrderSnapshot = (orderId: string, paymentId: string) => {
        try {
            const snapshot = {
                orderId,
                paymentId,
                items: state.items,
                subtotal,
                discount,
                total: finalTotal,
                currency: currencyCode,
                symbol: currencySymbol,
                discountCode,
                checkout: {
                    email: checkoutData.email,
                    firstName: checkoutData.firstName,
                    lastName: checkoutData.lastName,
                    address: checkoutData.address,
                    city: checkoutData.city,
                    state: checkoutData.state,
                    postalCode: checkoutData.postalCode,
                    country: checkoutData.country,
                    phone: checkoutData.phone,
                },
            };
            sessionStorage.setItem('lowrel_order', JSON.stringify(snapshot));
        } catch (e) {
            console.error('Failed to save order snapshot:', e);
        }
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

            // Save a pending snapshot BEFORE opening Razorpay. If the browser
            // reloads this page on return (common on mobile redirects) the
            // in-memory cart is wiped; we use this to verify/recover.
            try {
                sessionStorage.setItem('lowrel_pending_order', JSON.stringify({
                    orderId: orderData.id,
                    items: state.items,
                }));
            } catch (e) {
                console.warn('Could not save pending order snapshot:', e);
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
                        sessionStorage.removeItem('lowrel_pending_order');
                        saveOrderSnapshot(response.razorpay_order_id, response.razorpay_payment_id);
                        router.push('/checkout/success');
                    } catch (err) {
                        console.error('Post-payment processing error:', err);
                        // Payment was successful but CRM/analytics failed — still redirect
                        sessionStorage.removeItem('lowrel_pending_order');
                        saveOrderSnapshot(response.razorpay_order_id, response.razorpay_payment_id);
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
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-5 font-sans">
                {/* Logo Header */}
                <div className="absolute top-8 left-8 z-10">
                    <Link href="/" className="block">
                        <Image src="/assets/uni.png" alt="Low Religion Logo" width={180} height={45} priority className="h-[28px] w-auto lg:h-[38px] brightness-0" />
                    </Link>
                </div>
                <div className="text-center space-y-6">
                    <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Session Expired</h1>
                    <p className="text-gray-500">Your cart is empty. Please return to the shop.</p>
                    <Link
                        href="/collections/all"
                        className="inline-block bg-black text-white px-10 py-4 rounded-none font-bold hover:bg-gray-800 transition-all shadow-lg active:scale-[0.98]"
                    >
                        Browse Products
                    </Link>
                </div>
            </div>
        );
    }

    // Skeleton Loading Component
    if (isLoading) {
        return (
            <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-[#d8a4bc]/20">
                {/* Header */}
                <div className="sticky top-0 z-50 bg-white border-b border-black h-[100px] flex items-center justify-center px-4">
                    <div className="w-[180px] h-[38px] bg-gray-200 animate-pulse" />
                    <div className="absolute right-4 w-5 h-5 bg-gray-200 animate-pulse" />
                </div>

                {/* Main Content */}
                <div className="max-w-[430px] mx-auto px-4 py-8 space-y-8">
                    {/* Order Summary Skeleton */}
                    <div className="border-b border-[#d8a4bc]">
                        <div className="w-full h-[60px] bg-gray-200 animate-pulse" />
                    </div>

                    {/* Contact Summary Skeleton */}
                    <div className="space-y-4">
                        <div className="h-6 w-20 bg-gray-200 animate-pulse" />
                        <div className="h-12 bg-gray-200 rounded-none animate-pulse" />
                    </div>

                    {/* Payment Section Skeleton */}
                    <div className="space-y-4">
                        <div className="h-6 w-16 bg-gray-200 animate-pulse" />
                        <div className="h-32 bg-gray-200 rounded-none animate-pulse" />
                    </div>

                    {/* Button Skeleton */}
                    <div className="h-14 bg-gray-200 rounded-none animate-pulse" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-[#d8a4bc]/20">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white border-b border-black h-[100px] flex items-center justify-center px-4">
                <Link href="/" className="block">
                    <Image src="/assets/uni.png" alt="Low Religion Logo" width={180} height={45} priority className="h-[38px] w-auto brightness-0" />
                </Link>
                <button
                    type="button"
                    onClick={() => dispatch({ type: 'TOGGLE_CART' })}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                    aria-label="Open shopping bag"
                >
                    <ShoppingBag size={20} className="text-gray-900" strokeWidth={1.5} />
                </button>
            </div>

            {/* Main Content - Centered Single Column */}
            <div className="max-w-[430px] mx-auto px-4 py-8 space-y-8">
                
                {/* Order Summary - Collapsible */}
                <div className="border-b border-[#d8a4bc]">
                    <button
                        type="button"
                        onClick={() => setIsOrderSummaryOpen(!isOrderSummaryOpen)}
                        className="w-full py-5 flex items-center justify-between bg-[#f7f7f7] px-5"
                    >
                        <div className="flex items-center gap-2">
                            <ShoppingBag size={20} className="text-gray-900" strokeWidth={1.5} />
                            <span className="text-sm font-semibold text-gray-900">Order summary</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-lg font-semibold text-gray-900">{currencySymbol} {finalTotal.toFixed(2)}</span>
                            <ChevronDown size={16} className={`text-gray-500 transition-transform ${isOrderSummaryOpen ? 'rotate-180' : ''}`} />
                        </div>
                    </button>
                    
                    {isOrderSummaryOpen && (
                        <div className="p-5 bg-[#f7f7f7] space-y-4">
                            {/* Products */}
                            <div className="space-y-4">
                                {state.items.map((item) => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="relative">
                                            <div className="w-16 h-16 bg-white border border-[#e5e5e5] rounded-none overflow-hidden shrink-0">
                                                {item.images && item.images[0] && (
                                                    <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                                                )}
                                            </div>
                                            <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] w-[22px] h-[22px] rounded-none flex items-center justify-center font-bold">
                                                {item.quantity}
                                            </span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                                            <p className="text-xs text-gray-500">{currencySymbol} {item.price}</p>
                                        </div>
                                        <p className="text-sm font-semibold text-gray-900">{currencySymbol} {((item.price || 0) * item.quantity).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Coupon Input */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={couponInput}
                                    onChange={(e) => setCouponInput(e.target.value)}
                                    placeholder="Discount code"
                                    className="flex-1 h-[52px] border border-[#dedede] rounded-none bg-white px-4 text-sm outline-none focus:border-black transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={handleApplyDiscount}
                                    disabled={!couponInput || isProcessing}
                                    className="h-[52px] px-6 bg-[#f3f3f3] rounded-none font-semibold text-sm hover:bg-[#e5e5e5] transition-all"
                                >
                                    Apply
                                </button>
                            </div>
                            {applyError && <p className="text-xs text-red-500 font-medium pl-1">{applyError}</p>}
                            {discountCode && (
                                <div className="flex items-center gap-2 bg-[#d8a4bc]/10 text-[#d8a4bc] px-3 py-2 rounded-none w-fit">
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
                    )}
                </div>

                {/* Contact & Shipping Summary */}
                <div className="space-y-4">
                    <h2 className="text-[18px] font-semibold text-gray-900">Contact</h2>
                    <div className="p-4 bg-gray-50 rounded-none border border-[#e5e5e5]">
                        <p className="text-sm text-gray-900">{checkoutData.email}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-[18px] font-semibold text-gray-900">Ship to</h2>
                    <div className="p-4 bg-gray-50 rounded-none border border-[#e5e5e5]">
                        <p className="text-sm text-gray-900">{checkoutData.firstName} {checkoutData.lastName}</p>
                        <p className="text-sm text-gray-600">{checkoutData.address}</p>
                        <p className="text-sm text-gray-600">{checkoutData.city}, {checkoutData.state} {checkoutData.postalCode}</p>
                        <p className="text-sm text-gray-600">{checkoutData.phone}</p>
                    </div>
                </div>

                <form id="payment-form" onSubmit={handleSubmit} className="space-y-8">
                    {/* Payment Section */}
                    <section className="space-y-4">
                        <h2 className="text-[18px] font-semibold text-gray-900">Payment</h2>
                        <p className="text-[14px] text-[#666]">All transactions are secure and encrypted.</p>
                        
                        <div className="border border-[#bdbdbd] rounded-none overflow-hidden">
                            <div className="bg-[#f7f7f7] h-[52px] flex items-center px-4 gap-3">
                                <div className="w-4 h-4 rounded-none border-2 border-black bg-black flex items-center justify-center">
                                    <div className="w-2 h-2 bg-white rounded-none" />
                                </div>
                                <span className="text-sm font-semibold">Razorpay Secure Payment</span>
                            </div>
                            <div className="p-4 bg-white">
                                <p className="text-sm text-gray-600">After clicking &quot;Pay Now&quot;, you will be redirected to Razorpay to complete your purchase securely.</p>
                            </div>
                        </div>
                    </section>

                    {/* Payment Error Display */}
                    {paymentError && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-50 border border-red-200 rounded-none p-4 flex items-start gap-3"
                        >
                            <div className="w-5 h-5 rounded-none bg-red-100 flex items-center justify-center shrink-0 mt-0.5">
                                <span className="text-red-600 text-xs font-bold">!</span>
                            </div>
                            <div>
                                <p className="text-sm text-red-800 font-medium">Payment Error</p>
                                <p className="text-sm text-red-600 mt-1">{paymentError}</p>
                            </div>
                        </motion.div>
                    )}

                    <div className="sticky bottom-0 z-10 -mx-4 px-4 pt-4 pb-4 bg-white border-t border-black mt-4">
                        <button
                            type="submit"
                            disabled={isProcessing}
                            className="w-full h-14 bg-black text-white rounded-none font-bold text-sm hover:bg-gray-800 transition-all disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            {isProcessing ? (
                                <div className="flex items-center justify-center gap-3">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-[9999px] animate-spin" />
                                    Processing...
                                </div>
                            ) : (
                                <><Lock size={16} /> Pay {currencySymbol} {finalTotal.toFixed(2)}</>
                            )}
                        </button>
                        <p className="text-center text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mt-2">
                            Payments secured by Razorpay
                        </p>
                    </div>
                </form>



                {/* Footer Links */}
                <div className="max-w-[430px] mx-auto px-4 py-8 space-y-2 text-sm">
                    <Link href="/help/returns" className="block text-gray-500 hover:text-black">Refund policy</Link>
                    <Link href="/help/shipping" className="block text-gray-500 hover:text-black">Shipping</Link>
                    <Link href="/help/privacy" className="block text-gray-500 hover:text-black">Privacy policy</Link>
                    <Link href="/help/terms" className="block text-gray-500 hover:text-black">Terms of service</Link>
                </div>
            </div>
        </div>
    );
}
