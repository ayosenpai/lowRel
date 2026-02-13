'use client';

import { useCart } from '@/lib/cart-context';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { products } from '@/lib/data';
import { trackEvent } from '@/lib/actions/analytics';
import confetti from 'canvas-confetti';

export default function CartSidebar() {
  const { state, dispatch } = useCart();
  const [addingId, setAddingId] = useState<string | null>(null);

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
    dispatch({ type: 'TOGGLE_CART' });
  };

  const handleQuickAdd = (product: any) => {
    setAddingId(product.id);

    // Simulate a small delay for feedback
    setTimeout(() => {
      dispatch({
        type: 'ADD_TO_CART',
        payload: {
          product: product,
          size: product.category === 'Accessories' ? 'One Size' : 'M'
        }
      });

      // Celebratory confetti for the "impulse buy"
      confetti({
        particleCount: 80,
        spread: 50,
        origin: { x: 0.8, y: 0.5 },
        colors: ['#d8a4bc', '#000000', '#ffffff']
      });

      trackEvent({
        eventType: 'add_to_cart',
        payload: {
          productId: product.id,
          name: product.name,
          price: product.price,
          source: 'cart_upsell'
        }
      });

      setAddingId(null);
    }, 600);
  };

  // Recommendations (taking first 3 products for now)
  const recommendations = [products[3], products[4], products[7]]
    .filter(Boolean)
    .map(p => ({
      ...p,
      price: p.priceUSD, // Default to USD for static recommendations
      symbol: '$'
    }));

  return (
    <AnimatePresence>
      {state.isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch({ type: 'TOGGLE_CART' })}
            className="fixed inset-0 bg-black/60 z-[300] backdrop-blur-[2px]"
          />

          {/* Cart Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
            className="fixed right-0 top-0 h-full w-[90%] max-w-[420px] bg-white text-black z-[301] flex flex-col shadow-2xl font-sans"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b-[1.5px] border-black">
              <h2 className="lowrel-header text-xl uppercase">Shopping Bag</h2>
              <button
                onClick={() => dispatch({ type: 'TOGGLE_CART' })}
                className="p-1 hover:rotate-90 transition-transform duration-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {state.items.length === 0 ? (
                // Empty State
                <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                  <h3 className="lowrel-header text-lg mb-4 uppercase">Your Bag is Empty</h3>
                  <Link
                    href="/collections/all"
                    onClick={() => dispatch({ type: 'TOGGLE_CART' })}
                    className="bg-black text-white px-10 py-3.5 uppercase text-xs font-black tracking-widest transition-colors w-full"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                // Filled State - Items List
                <div className="p-6 space-y-8">
                  {state.items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex gap-5"
                    >
                      <div className="relative w-[100px] aspect-[4/5] bg-gray-100 flex-shrink-0">
                        <Image
                          src={item.images[0]}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col py-1">
                        <div className="flex justify-between items-start gap-4 mb-1">
                          <h4 className="font-black text-xs uppercase tracking-wider leading-[1.2] max-w-[160px]">
                            {item.name}
                          </h4>
                          <p className="font-black text-xs uppercase tracking-widest whitespace-nowrap">
                            {item.symbol || '$'} {item.price?.toFixed(2)}
                          </p>
                        </div>

                        {item.size && (
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                            <span>{item.size}</span>
                          </p>
                        )}

                        <div className="flex items-center gap-6 mt-auto">
                          <div className="flex items-center border-[1.5px] border-gray-200 px-1">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center hover:text-gray-400 transiition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-[11px] font-black">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center hover:text-gray-400 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-[9px] font-black uppercase tracking-[0.1em] text-gray-400 hover:text-black transition-colors border-b border-transparent hover:border-black leading-none"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Recommendations Section */}
              <div className="border-t-[1.5px] border-gray-100 mt-4 p-6 bg-gray-50/50">
                <h3 className="lowrel-link text-[11px] uppercase tracking-widest mb-8 text-black">Complete The Fit</h3>
                <div className="grid grid-cols-3 gap-3">
                  {recommendations.map((product) => (
                    <div key={product.id} className="group relative">
                      <div className="aspect-[4/5] relative bg-gray-100 mb-2 overflow-hidden">
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        {/* Quick Add Overlay */}
                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-2">
                          <button
                            onClick={() => handleQuickAdd(product)}
                            disabled={addingId === product.id}
                            className="bg-white text-black px-2 py-1.5 text-[7px] font-black uppercase tracking-widest shadow-xl hover:bg-black hover:text-white transition-all transform translate-y-2 group-hover:translate-y-0"
                          >
                            {addingId === product.id ? 'Adding...' : 'Quick Add +'}
                          </button>
                        </div>
                      </div>
                      <h4 className="text-[8px] font-black uppercase tracking-widest truncate leading-tight mb-0.5">{product.name}</h4>
                      <p className="text-[8px] text-gray-500 font-bold tracking-widest">{product.symbol || '$'} {product.price?.toFixed(2)}</p>

                      {/* Mobile Visible Button */}
                      <button
                        onClick={() => handleQuickAdd(product)}
                        disabled={addingId === product.id}
                        className="mt-2 w-full lg:hidden bg-black text-white py-1.5 text-[7px] font-bold uppercase tracking-widest transition-all active:scale-95"
                      >
                        {addingId === product.id ? 'Added!' : 'Add to Bag'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            {state.items.length > 0 && (
              <div className="border-t-[1.5px] border-black p-6 bg-white safe-bottom">
                <div className="flex justify-between items-center mb-6 px-1">
                  <span className="lowrel-header text-sm uppercase tracking-widest">Subtotal</span>
                  <span className="lowrel-header text-sm uppercase tracking-widest">{state.items[0]?.symbol || '$'} {state.total.toFixed(2)}</span>
                </div>
                <Link
                  href="/checkout"
                  onClick={handleBeginCheckout}
                  className="block w-full bg-black text-white text-center py-4 uppercase font-black tracking-[0.2em] text-sm hover:bg-gray-900 transition-colors"
                >
                  <span className="lowrel-header">Checkout</span>
                </Link>
                <div className="mt-6 text-center">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-black">No Duties for US Orders</p>
                </div>
              </div>
            )}

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
