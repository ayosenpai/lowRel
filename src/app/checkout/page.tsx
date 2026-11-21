'use client';

import { useCart } from '@/lib/cart-context';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CreditCard, Truck, Shield, Check, ChevronRight, ShoppingBag, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { trackEvent } from '@/lib/actions/analytics';

import { useCheckout } from '@/lib/checkout-context';
import { useRouter } from 'next/navigation';

declare global {
  interface Window {
    google?: any;
    __initGooglePlacesCheckout?: () => void;
  }
}

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

export default function CheckoutPage() {
  const { state, dispatch } = useCart();
  const { checkoutData, updateCheckoutData, discountCode, discountPercent, applyDiscount, clearDiscount } = useCheckout();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isOrderSummaryOpen, setIsOrderSummaryOpen] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [pincodeStatus, setPincodeStatus] = useState<'idle' | 'loading' | 'error' | 'success'>('idle');
  const addressInputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<any>(null);
  const lastPincodeLookupRef = useRef<string>('');

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Auto-fill city/state from Indian PIN code (no API key required)
  useEffect(() => {
    const pin = (checkoutData.postalCode || '').replace(/\D/g, '');
    if (pin.length !== 6) {
      if (pincodeStatus !== 'idle') setPincodeStatus('idle');
      return;
    }
    if (pin === lastPincodeLookupRef.current) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setPincodeStatus('loading');
        const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        const entry = Array.isArray(data) ? data[0] : null;
        const office = entry?.Status === 'Success' ? entry.PostOffice?.[0] : null;

        if (office) {
          lastPincodeLookupRef.current = pin;
          setPincodeStatus('success');
          updateCheckoutData({
            city: office.District || office.Block || office.Name || checkoutData.city,
            state: office.State || checkoutData.state,
            postalCode: pin,
          });
        } else {
          setPincodeStatus('error');
        }
      } catch (error: any) {
        if (error?.name !== 'AbortError') {
          setPincodeStatus('error');
        }
      }
    }, 350);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [checkoutData.postalCode]);

  // Optional: Google Places address autocomplete (requires NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || isLoading) return;

    const initAutocomplete = () => {
      if (!window.google?.maps?.places || !addressInputRef.current || autocompleteRef.current) return;

      const autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current, {
        componentRestrictions: { country: 'in' },
        fields: ['address_components', 'formatted_address', 'geometry', 'name'],
        types: ['address'],
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        const components: any[] = place?.address_components || [];
        const get = (type: string) =>
          components.find((c) => c.types?.includes(type))?.long_name || '';
        const getShort = (type: string) =>
          components.find((c) => c.types?.includes(type))?.short_name || '';

        const streetNumber = get('street_number');
        const route = get('route');
        const sublocality =
          get('sublocality_level_1') || get('sublocality') || get('neighborhood') || '';
        const premise = get('premise') || get('subpremise') || '';

        const line1 = [streetNumber, route].filter(Boolean).join(' ').trim();
        const addressLine = [premise, line1, sublocality].filter(Boolean).join(', ') || place?.formatted_address || place?.name || '';

        const city =
          get('locality') ||
          get('postal_town') ||
          get('administrative_area_level_2') ||
          get('sublocality_level_1') ||
          '';
        const state = get('administrative_area_level_1');
        const postalCode = get('postal_code');
        const country = get('country') || 'India';

        const updates: Record<string, string> = {};
        if (addressLine) updates.address = addressLine;
        if (city) updates.city = city;
        if (state) updates.state = state;
        if (postalCode) {
          updates.postalCode = postalCode;
          lastPincodeLookupRef.current = postalCode.replace(/\D/g, '');
        }
        if (country) updates.country = country;

        if (Object.keys(updates).length) {
          updateCheckoutData(updates);
          if (postalCode) setPincodeStatus('success');
        }
      });

      autocompleteRef.current = autocomplete;
    };

    if (window.google?.maps?.places) {
      initAutocomplete();
      return;
    }

    const existing = document.querySelector('script[data-google-places="true"]') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', initAutocomplete);
      return () => existing.removeEventListener('load', initAutocomplete);
    }

    window.__initGooglePlacesCheckout = initAutocomplete;
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places&loading=async&callback=__initGooglePlacesCheckout`;
    script.async = true;
    script.defer = true;
    script.dataset.googlePlaces = 'true';
    script.onerror = () => {
      // Fail silently; manual entry and PIN autofill still work
      console.warn('Google Places script failed to load');
    };
    document.head.appendChild(script);

    return () => {
      // keep script cached; just detach callback ref
      if (window.__initGooglePlacesCheckout === initAutocomplete) {
        delete window.__initGooglePlacesCheckout;
      }
    };
  }, [isLoading]);

  const handleApplyCoupon = async () => {
    setCouponError('');
    setIsApplyingCoupon(true);
    try {
      const success = await applyDiscount(couponInput);
      if (!success) {
        setCouponError('Invalid discount code');
      }
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponInput('');
    setCouponError('');
    clearDiscount();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      updateCheckoutData({ phone: value.replace(/\D/g, '').slice(0, 10) });
      return;
    }
    updateCheckoutData({ [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const phoneDigits = (checkoutData.phone || '').replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }
    updateCheckoutData({ phone: phoneDigits });
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
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-5 font-sans">
        {/* Logo Header */}
        <div className="absolute top-8 left-8 z-10">
          <Link href="/" className="block">
            <Image src="/assets/uni.png" alt="Low Religion Logo" width={180} height={45} priority className="h-[28px] w-auto lg:h-[38px] brightness-0" />
          </Link>
        </div>
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Your cart is empty</h1>
          <p className="text-gray-500">Add some items to your cart to continue with checkout.</p>
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
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row min-h-screen">
          
          {/* Logo Header */}
          <div className="lg:absolute lg:top-8 lg:left-8 lg:z-10 px-4 py-6 md:py-8 lg:py-0">
            <div className="w-[180px] h-[38px] bg-gray-200 animate-pulse" />
          </div>

          {/* Main Content Area - Left (60%) */}
          <div className="lg:w-[60%] px-4 py-8 md:p-12 lg:p-20 order-2 lg:order-1 border-r border-gray-100">
            <div className="max-w-xl ml-auto space-y-8 md:space-y-12">
              
              {/* Express Checkout Skeleton */}
              <div className="space-y-4">
                <div className="h-6 w-32 bg-gray-200 animate-pulse" />
                <div className="flex gap-3">
                  <div className="flex-1 h-12 bg-gray-200 rounded-none animate-pulse" />
                  <div className="flex-1 h-12 bg-gray-200 rounded-none animate-pulse" />
                </div>
                <div className="h-px bg-gray-200" />
              </div>

              {/* Contact Skeleton */}
              <div className="space-y-4">
                <div className="h-6 w-20 bg-gray-200 animate-pulse" />
                <div className="h-12 bg-gray-200 rounded-none animate-pulse" />
              </div>

              {/* Delivery Skeleton */}
              <div className="space-y-4">
                <div className="h-6 w-16 bg-gray-200 animate-pulse" />
                <div className="h-4 w-64 bg-gray-200 animate-pulse" />
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div className="h-12 bg-gray-200 rounded-none animate-pulse" />
                  <div className="h-12 bg-gray-200 rounded-none animate-pulse" />
                </div>
                <div className="h-12 bg-gray-200 rounded-none animate-pulse" />
                <div className="grid grid-cols-3 gap-3 md:gap-4">
                  <div className="h-12 bg-gray-200 rounded-none animate-pulse" />
                  <div className="h-12 bg-gray-200 rounded-none animate-pulse" />
                  <div className="h-12 bg-gray-200 rounded-none animate-pulse" />
                </div>
                <div className="h-12 bg-gray-200 rounded-none animate-pulse" />
              </div>

              {/* Shipping Method Skeleton */}
              <div className="space-y-4">
                <div className="h-6 w-32 bg-gray-200 animate-pulse" />
                <div className="h-4 w-48 bg-gray-200 animate-pulse" />
                <div className="h-16 bg-gray-200 rounded-none animate-pulse" />
              </div>

              {/* Button Skeleton */}
              <div className="h-14 bg-gray-200 rounded-none animate-pulse" />
            </div>
          </div>

          {/* Order Summary Skeleton */}
          <div className="lg:w-[40%] bg-gray-50 px-4 py-8 md:p-12 lg:p-20 order-1 lg:order-2 border-l border-gray-100">
            <div className="max-w-md space-y-8">
              <div className="h-6 w-28 bg-gray-200 animate-pulse" />
              <div className="space-y-4">
                <div className="h-20 bg-gray-200 rounded-none animate-pulse" />
                <div className="h-20 bg-gray-200 rounded-none animate-pulse" />
              </div>
              <div className="h-6 w-48 bg-gray-200 animate-pulse" />
              <div className="h-12 bg-gray-200 rounded-none animate-pulse" />
              <div className="space-y-3 pt-6 border-t border-gray-200">
                <div className="h-4 bg-gray-200 animate-pulse" />
                <div className="h-4 bg-gray-200 animate-pulse" />
                <div className="h-6 bg-gray-200 animate-pulse" />
              </div>
            </div>
          </div>
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

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[0.2em]">
          <span className="text-black">Information</span>
          <span className="w-8 h-px bg-black/40" />
          <span className="text-gray-400">Payment</span>
        </div>

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
              <span className="text-lg font-semibold text-gray-900">{state.items[0]?.symbol || '₹'} {state.total.toFixed(2)}</span>
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
                      <p className="text-xs text-gray-500">{item.symbol || '$'} {item.price}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{item.symbol || '$'} {((item.price || 0) * item.quantity).toFixed(2)}</p>
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
                  onClick={handleApplyCoupon}
                  disabled={!couponInput || isApplyingCoupon}
                  className="h-[52px] px-6 bg-[#f3f3f3] rounded-none font-semibold text-sm hover:bg-[#e5e5e5] transition-all disabled:opacity-50"
                >
                  {isApplyingCoupon ? '...' : 'Apply'}
                </button>
              </div>
              {couponError && <p className="text-xs text-red-500 font-medium pl-1">{couponError}</p>}
              {discountCode && (
                <div className="flex items-center gap-2 bg-[#d8a4bc]/10 text-[#d8a4bc] px-3 py-2 rounded-none w-fit">
                  <span className="text-xs font-bold uppercase tracking-widest">{discountCode} Applied (−{discountPercent}%)</span>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-xs hover:text-black font-bold"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">


              {/* Contact */}
              <section className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-[18px] font-semibold text-gray-900">Contact</h2>
                  <Link href="/login" className="text-[14px] text-gray-500 hover:text-black underline">Sign in</Link>
                </div>
                <div className="relative">
                  <input
                    required
                    type="email"
                    name="email"
                    value={checkoutData.email}
                    onChange={handleInputChange}
                    placeholder="Email address"
                    className="w-full h-[56px] border border-[#d8d8d8] rounded-none bg-white px-4 text-sm outline-none focus:border-black focus:border-2 transition-all"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="emailMarketing" className="w-4 h-4 border-gray-300" />
                  <label htmlFor="emailMarketing" className="text-sm text-gray-600">Email me with news and offers</label>
                </div>
              </section>

              {/* Delivery */}
              <section className="space-y-4">
                <h2 className="text-[18px] font-semibold text-gray-900">Delivery</h2>
                <p className="text-[14px] text-[#666]">This will also be used as your billing address for this order.</p>
                
                <select
                  name="country"
                  value={checkoutData.country}
                  onChange={handleInputChange}
                  className="w-full h-[52px] border border-[#dddddd] rounded-none bg-white px-4 text-sm outline-none focus:border-black transition-all appearance-none"
                >
                  <option value="India">India</option>
                </select>
                
                <div className="grid grid-cols-2 gap-3">
                  <input
                    required
                    type="text"
                    name="firstName"
                    value={checkoutData.firstName}
                    onChange={handleInputChange}
                    placeholder="First name"
                    className="w-full h-[52px] border border-[#dddddd] rounded-none bg-white px-4 text-sm outline-none focus:border-black transition-all"
                  />
                  <input
                    required
                    type="text"
                    name="lastName"
                    value={checkoutData.lastName}
                    onChange={handleInputChange}
                    placeholder="Last name"
                    className="w-full h-[52px] border border-[#dddddd] rounded-none bg-white px-4 text-sm outline-none focus:border-black transition-all"
                  />
                </div>
                
                <input
                  type="text"
                  name="company"
                  value={checkoutData.company || ''}
                  onChange={handleInputChange}
                  placeholder="Company (optional)"
                  className="w-full h-[52px] border border-[#dddddd] rounded-none bg-white px-4 text-sm outline-none focus:border-black transition-all"
                />
                
                <div className="space-y-1">
                  <input
                    ref={addressInputRef}
                    required
                    type="text"
                    name="address"
                    value={checkoutData.address}
                    onChange={handleInputChange}
                    placeholder={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? 'Search address' : 'Address'}
                    autoComplete="street-address"
                    className="w-full h-[52px] border border-[#dddddd] rounded-none bg-white px-4 text-sm outline-none focus:border-black transition-all"
                  />
                  {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
                    <p className="text-[11px] text-gray-500 px-1">Start typing to search and auto-fill your address.</p>
                  ) : null}
                </div>
                
                <input
                  type="text"
                  name="apartment"
                  value={checkoutData.apartment || ''}
                  onChange={handleInputChange}
                  placeholder="Apartment, suite, etc. (optional)"
                  className="w-full h-[52px] border border-[#dddddd] rounded-none bg-white px-4 text-sm outline-none focus:border-black transition-all"
                />
                
                <div className="grid grid-cols-2 gap-3">
                  <input
                    required
                    type="text"
                    name="city"
                    value={checkoutData.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    className="w-full h-[52px] border border-[#dddddd] rounded-none bg-white px-4 text-sm outline-none focus:border-black transition-all"
                  />
                  <select
                    required
                    name="state"
                    value={checkoutData.state || ''}
                    onChange={handleInputChange}
                    className="w-full h-[52px] border border-[#dddddd] rounded-none bg-white px-4 text-sm outline-none focus:border-black transition-all appearance-none"
                  >
                    <option value="">State</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-1">
                  <input
                    required
                    type="text"
                    name="postalCode"
                    value={checkoutData.postalCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^\d]/g, '').slice(0, 6);
                      lastPincodeLookupRef.current = '';
                      setPincodeStatus('idle');
                      updateCheckoutData({ postalCode: value });
                    }}
                    placeholder="PIN code"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    maxLength={6}
                    className="w-full h-[52px] border border-[#dddddd] rounded-none bg-white px-4 text-sm outline-none focus:border-black transition-all"
                  />
                  {pincodeStatus === 'loading' && (
                    <p className="text-[11px] text-gray-500 px-1">Looking up city and state…</p>
                  )}
                  {pincodeStatus === 'success' && (
                    <p className="text-[11px] text-gray-500 px-1">City and state auto-filled from PIN code.</p>
                  )}
                  {pincodeStatus === 'error' && (checkoutData.postalCode || '').length === 6 && (
                    <p className="text-[11px] text-gray-500 px-1">Couldn’t auto-fill from this PIN code. You can enter details manually.</p>
                  )}
                </div>
                
                <input
                  required
                  type="tel"
                  name="phone"
                  value={checkoutData.phone}
                  onChange={handleInputChange}
                  placeholder="Mobile number (10 digits)"
                  inputMode="numeric"
                  autoComplete="tel"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  title="Enter a 10-digit mobile number"
                  className="w-full h-[52px] border border-[#dddddd] rounded-none bg-white px-4 text-sm outline-none focus:border-black transition-all"
                />
              </section>

              {/* Shipping Method */}
              <section className="space-y-4">
                <h2 className="text-[18px] font-semibold text-gray-900">Shipping method</h2>
                <div className="border border-[#bdbdbd] rounded-none overflow-hidden">
                  <div className="bg-[#f7f7f7] h-[52px] flex items-center px-4 gap-3">
                    <div className="w-4 h-4 rounded-none border-2 border-black bg-black flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-none" />
                    </div>
                    <span className="text-sm font-semibold">Free standard shipping</span>
                  </div>
                  <div className="p-4 bg-white">
                    <p className="text-sm text-gray-600">5-7 business days</p>
                  </div>
                </div>
              </section>

              <div className="sticky bottom-0 z-10 -mx-4 px-4 pt-4 pb-4 bg-white border-t border-black mt-4">
                <button
                  type="submit"
                  className="w-full h-14 bg-black text-white rounded-none font-bold text-sm hover:bg-gray-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  Continue to payment <ArrowRight size={16} />
                </button>
                <p className="text-center text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 mt-2">
                  Secure checkout · Free shipping across India
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
    </div >
  );
}
