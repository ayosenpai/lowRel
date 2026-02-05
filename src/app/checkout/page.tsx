'use client';

import { useCart } from '@/lib/cart-context';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CreditCard, Truck, Shield, Check, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { trackEvent } from '@/lib/actions/analytics';

import { useCheckout } from '@/lib/checkout-context';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const { state } = useCart();
  const { checkoutData, updateCheckoutData } = useCheckout();
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    updateCheckoutData({
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    trackEvent({
      eventType: 'begin_checkout',
      payload: {
        total: state.total,
        step: 'information'
      }
    });
    router.push('/checkout/payment');
  };

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-5 font-sans">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Your cart is empty</h1>
          <p className="text-gray-500">Add some items to your cart to continue with checkout.</p>
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
              <span className="text-black font-semibold">Information</span>
              <ChevronRight size={12} className="md:w-3.5 md:h-3.5" />
              <span className="text-gray-400">Payment</span>
            </nav>

            <form onSubmit={handleSubmit} className="space-y-8 md:space-y-12">
              <section className="space-y-4 md:space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg md:text-xl font-bold text-gray-900">Contact</h2>
                  <Link href="/login" className="text-xs text-gray-500 hover:text-black underline">Log in</Link>
                </div>
                <input
                  required
                  type="email"
                  name="email"
                  value={checkoutData.email}
                  onChange={handleInputChange}
                  placeholder="Email address"
                  className="w-full bg-white border border-gray-200 rounded-lg py-3 md:py-4 px-4 text-sm md:text-base outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                />
              </section>

              <section className="space-y-4 md:space-y-6">
                <h2 className="text-lg md:text-xl font-bold text-gray-900">Shipping address</h2>
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <input
                    required
                    type="text"
                    name="firstName"
                    value={checkoutData.firstName}
                    onChange={handleInputChange}
                    placeholder="First name"
                    className="w-full bg-white border border-gray-200 rounded-lg py-3 md:py-4 px-4 text-sm md:text-base outline-none focus:border-black transition-all"
                  />
                  <input
                    required
                    type="text"
                    name="lastName"
                    value={checkoutData.lastName}
                    onChange={handleInputChange}
                    placeholder="Last name"
                    className="w-full bg-white border border-gray-200 rounded-lg py-3 md:py-4 px-4 text-sm md:text-base outline-none focus:border-black transition-all"
                  />
                </div>
                <input
                  required
                  type="text"
                  name="address"
                  value={checkoutData.address}
                  onChange={handleInputChange}
                  placeholder="Address"
                  className="w-full bg-white border border-gray-200 rounded-lg py-3 md:py-4 px-4 text-sm md:text-base outline-none focus:border-black transition-all"
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                  <input
                    required
                    type="text"
                    name="city"
                    value={checkoutData.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    className="w-full bg-white border border-gray-200 rounded-lg py-3 md:py-4 px-4 text-sm md:text-base outline-none focus:border-black transition-all"
                  />
                  <input
                    required
                    type="text"
                    name="postalCode"
                    value={checkoutData.postalCode}
                    onChange={handleInputChange}
                    placeholder="ZIP code"
                    className="w-full bg-white border border-gray-200 rounded-lg py-3 md:py-4 px-4 text-sm md:text-base outline-none focus:border-black transition-all"
                  />
                  <select
                    name="country"
                    value={checkoutData.country}
                    onChange={handleInputChange}
                    className="w-full bg-white border border-gray-200 rounded-lg py-3 md:py-4 px-4 text-sm md:text-base outline-none focus:border-black transition-all appearance-none"
                  >
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="India">India</option>
                  </select>
                </div>
                <input
                  required
                  type="tel"
                  name="phone"
                  value={checkoutData.phone}
                  onChange={handleInputChange}
                  placeholder="Phone number for delivery"
                  className="w-full bg-white border border-gray-200 rounded-lg py-3 md:py-4 px-4 text-sm md:text-base outline-none focus:border-black transition-all"
                />
              </section>

              <div className="pt-4 md:pt-6">
                <button
                  type="submit"
                  className="w-full bg-black text-white py-4 md:py-5 rounded-lg font-bold text-sm md:text-lg hover:bg-gray-800 transition-all shadow-lg active:scale-[0.99] flex items-center justify-center gap-3"
                >
                  Continue to payment
                  <ArrowRight size={18} />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Order Summary - Right (40%) */}
        <div className="lg:w-[40%] bg-gray-50 px-4 py-8 md:p-12 lg:p-20 order-1 lg:order-2">
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
                        <span className="absolute -top-2 -right-2 bg-gray-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-gray-500 uppercase tracking-widest">{item.symbol || '$'} {item.price}</p>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-gray-900">{item.symbol || '$'} {((item.price || 0) * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              {/* Total Calculation */}
              <div className="space-y-3 pt-6 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-bold text-gray-900">{state.items[0]?.symbol || '$'} {state.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-400 italic">Calculated at next step</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Estimated taxes</span>
                  <span className="font-bold text-gray-900">{state.items[0]?.symbol || '$'} {(state.total * 0.08).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold pt-6 border-t border-gray-200 text-gray-900">
                  <span>Total</span>
                  <div className="text-right">
                    <span className="text-xs text-gray-400 mr-2 uppercase tracking-widest">USD</span>
                    <span>{state.items[0]?.symbol || '$'} {(state.total * 1.08).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
}
