'use client';

import { useCart } from '@/lib/cart-context';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import Link from 'next/link';
import BackButton from '@/components/ui/back-button';
import { trackEvent } from '@/lib/actions/analytics';
import SupabaseImage from '@/components/SupabaseImage';

export default function CartPage() {
  const { state, dispatch } = useCart();

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      dispatch({ type: 'REMOVE_FROM_CART', payload: id });
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
    }
  };

  const removeItem = (id: string) => {
    const item = state.items.find(i => i.id === id);
    dispatch({ type: 'REMOVE_FROM_CART', payload: id });
    if (item) {
      trackEvent({
        eventType: 'remove_from_cart',
        payload: {
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        }
      });
    }
  };

  const handleBeginCheckout = () => {
    trackEvent({
      eventType: 'begin_checkout',
      payload: {
        itemCount: state.items.length,
        total: state.total,
        currency: state.items[0]?.currency,
        items: state.items.map(i => ({ id: i.id, name: i.name, quantity: i.quantity }))
      }
    });
  };

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-[#d8a4bc] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-black mb-4">Your Cart</h1>
          <p className="text-black mb-8">Your cart is empty</p>
          <Link
            href="/collections/all"
            className="inline-block bg-black text-[#d8a4bc] px-8 py-3 uppercase font-bold tracking-wider hover:bg-gray-800 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#d8a4bc] py-8">
      <div className="container mx-auto px-5 lg:px-10">
        <div className="mb-8">
          <BackButton />
          <h1 className="text-3xl font-bold text-black mb-4">Your Cart</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {state.items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-black text-[#d8a4bc] p-4 flex gap-4"
              >
                <div className="relative w-24 h-32 bg-gray-100">
                  <SupabaseImage
                    src={item.images[0]}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg">{item.name}</h3>
                      <p className="text-sm opacity-80">{item.symbol || '$'} {item.price?.toFixed(2)}</p>
                      {item.size && <p className="text-sm opacity-80">Size: {item.size}</p>}
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1 hover:bg-gray-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 border border-[#d8a4bc] flex items-center justify-center hover:bg-gray-800 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-12 text-center font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 border border-[#d8a4bc] flex items-center justify-center hover:bg-gray-800 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                    <span className="ml-auto font-bold">
                      {item.symbol || '$'} {((item.price || 0) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="bg-black text-[#d8a4bc] p-6 h-fit">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{state.items[0]?.symbol || '$'} {state.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>Calculated at checkout</span>
              </div>
            </div>

            <div className="border-t border-[#d8a4bc] pt-4 mb-6">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{state.items[0]?.symbol || '$'} {state.total.toFixed(2)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              onClick={handleBeginCheckout}
              className="w-full bg-[#d8a4bc] text-black py-3 uppercase font-bold tracking-wider text-center block hover:bg-[#c293a0] transition-colors"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
