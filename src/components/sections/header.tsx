"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from '@/lib/cart-context';
import { ShoppingBag, X } from "lucide-react";

import { createClient } from '@/lib/supabase/client';
import SearchOverlay from '@/components/ui/search-overlay';

interface HeaderProps {
  variant?: 'default' | 'solid';
}

const Header = ({ variant = 'default' }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showEmptyCartPopup, setShowEmptyCartPopup] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { state, dispatch } = useCart();
  const supabase = createClient();

  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Logic to determine background color
  const isSolid = variant === 'solid' || isScrolled;

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);

    if (totalItems === 0) {
      setShowEmptyCartPopup(true);
      setTimeout(() => setShowEmptyCartPopup(false), 2000);
    } else {
      window.location.href = '/cart';
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Basic scrolled state for background transparency
      setIsScrolled(currentScrollY > 10);

      // Hide/Show logic
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        // Scrolling DOWN
        setIsVisible(false);
      } else {
        // Scrolling UP
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const navAssets = {
    logo: "/assets/uni.png",
    menu: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/18eed3e2-8b5f-4ae4-a107-ec6bc29922d3-us-mingalondon-com/assets/svgs/header-menu-icon--white-2.svg",
    search: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/18eed3e2-8b5f-4ae4-a107-ec6bc29922d3-us-mingalondon-com/assets/svgs/header-search-icon--white-5.svg",
    user: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/18eed3e2-8b5f-4ae4-a107-ec6bc29922d3-us-mingalondon-com/assets/svgs/header-user-icon--white-6.svg",
    wishlist: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/18eed3e2-8b5f-4ae4-a107-ec6bc29922d3-us-mingalondon-com/assets/svgs/heart-outline-white-7.svg",
    bag: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/18eed3e2-8b5f-4ae4-a107-ec6bc29922d3-us-mingalondon-com/assets/svgs/header-bag-icon--white-8.svg",
    close: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/18eed3e2-8b5f-4ae4-a107-ec6bc29922d3-us-mingalondon-com/assets/svgs/close-icon-white.svg" // Guessing name or I'll use a lucide icon if available
  };

  const navLinks = [
    { name: 'New In', href: '/collections/new-in' },
    { name: 'Shop', href: '/collections/all' },
    { name: 'Winter Sale', href: '/collections/sale', highlight: true }
  ];

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-[100]">
        {/* Announcement Bar - Hides with header */}
        <motion.div
          animate={{ y: isVisible ? 0 : -100 }}
          transition={{ duration: 0.3 }}
          className="w-full bg-[#d8a4bc] h-[30px] flex items-center justify-center border-b border-black absolute top-0 z-50"
        >
          <span className="text-[10px] text-black font-bold tracking-[0.1em] uppercase">
            Extended Returns Until Jan 15
          </span>
        </motion.div>

        {/* Main Navigation */}
        <motion.nav
          initial={{ y: 30 }} // Starts below announcement bar
          animate={{
            y: isVisible ? 30 : -100, // Move up to hide
            backgroundColor: isSolid ? "rgba(0,0,0,1)" : "rgba(0,0,0,0)",
            borderBottomColor: isSolid ? "rgba(51,51,51,1)" : "rgba(51,51,51,0)"
          }}
          transition={{ duration: 0.3 }}
          className="w-full h-[64px] flex items-center justify-between px-5 xl:px-10 border-b transition-colors absolute top-0"
        >
          {/* Left: Mobile Menu & Logo */}
          <div className="flex items-center gap-6">
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => setIsMenuOpen(true)}
              className="lg:hidden flex items-center justify-center"
            >
              <Image
                src={navAssets.menu}
                alt="Menu"
                width={20}
                height={20}
                className="w-5 h-5"
              />
            </motion.button>

            <Link href="/" className="block">
              <Image
                src={navAssets.logo}
                alt="Low Religion Logo"
                width={180}
                height={45}
                priority
                className="h-[28px] w-auto lg:h-[38px]"
              />
            </Link>
          </div>

          {/* Center: Main Links */}
          <div className="hidden lg:flex items-center gap-8 translate-x-12">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`relative text-[13px] font-bold tracking-[0.1em] uppercase group ${item.highlight ? 'text-black' : 'text-black'}`}
              >
                {item.name}
                <motion.span
                  className={`absolute -bottom-1 left-0 w-0 h-[2px] transition-all group-hover:w-full ${item.highlight ? 'bg-black' : 'bg-black'}`}
                  transition={{ duration: 0.3 }}
                />
              </Link>
            ))}
          </div>

          {/* Right: Utility Icons */}
          <div className="flex items-center gap-4 xl:gap-6">
            {[
              { icon: navAssets.search, alt: "Search", action: () => setIsSearchOpen(true) },
              { icon: navAssets.wishlist, alt: "Wishlist", href: "/pages/wishlist" },
              { icon: navAssets.bag, alt: "Bag", href: "/cart", count: true }
            ].map((item, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {item.alt === 'Bag' ? (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      dispatch({ type: 'TOGGLE_CART' });
                    }}
                    className="flex items-center justify-center p-1 relative"
                  >
                    <ShoppingBag
                      className={`w-[22px] h-[20px] xl:w-[26px] xl:h-[22px] text-white`}
                      fill={state.items.length > 0 ? "white" : "none"} // Filled if items exist
                      strokeWidth={1.5}
                    />
                    {state.items.reduce((sum, item) => sum + item.quantity, 0) > 0 && (
                      <span className="absolute -top-1 -right-1 bg-white text-black text-[9px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                        {state.items.reduce((sum, item) => sum + item.quantity, 0)}
                      </span>
                    )}
                  </button>
                ) : item.action ? (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      item.action();
                    }}
                    className="flex items-center justify-center p-1 relative"
                  >
                    <Image
                      src={item.icon!}
                      alt={item.alt}
                      width={26}
                      height={22}
                      className="w-[22px] h-[20px] xl:w-[26px] xl:h-[22px]"
                    />
                  </button>
                ) : (
                  <Link href={item.href!} className="flex items-center justify-center p-1 relative">
                    <Image
                      src={item.icon!}
                      alt={item.alt}
                      width={26}
                      height={22}
                      className="w-[22px] h-[20px] xl:w-[26px] xl:h-[22px]"
                    />
                  </Link>
                )}
              </motion.div>
            ))}
          </div>
        </motion.nav>
      </header>

      {/* Empty Cart Popup */}
      <AnimatePresence>
        {showEmptyCartPopup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="fixed top-[72px] right-[20px] xl:right-[40px] bg-black text-white px-4 py-2 rounded-lg shadow-lg z-50"
            style={{ transformOrigin: 'top right' }}
          >
            <p className="text-xs font-medium">Nothing added yet</p>
            <div className="absolute -top-2 right-4 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-black"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Side Menu Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{
                type: "tween",
                ease: "easeOut",
                duration: 0.3
              }}
              className="fixed top-0 left-0 w-[90%] max-w-[400px] h-full bg-white text-black z-[201] lg:hidden flex flex-col shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-black">
                <span className="text-xl font-bold uppercase tracking-tighter">Menu</span>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1 hover:rotate-90 transition-transform duration-300"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="flex-1 overflow-y-auto py-8 px-6">
                <motion.div
                  className="space-y-6"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                >
                  {navLinks.map((link, index) => (
                    <motion.div
                      key={link.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + index * 0.05, duration: 0.3 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => setIsMenuOpen(false)}
                        className={`block text-3xl font-black uppercase tracking-tight py-2 transition-all duration-300 hover:tracking-wide ${link.highlight ? 'text-[#ff69b4]' : 'text-black'}`}
                      >
                        {link.name}
                      </Link>
                    </motion.div>
                  ))}

                  {/* Extra "Shop All" Link for fullness */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.3 }}
                  >
                    <Link
                      href="/collections/all"
                      onClick={() => setIsMenuOpen(false)}
                      className="block text-3xl font-black uppercase tracking-tight py-2 transition-all duration-300 hover:tracking-wide text-gray-400 hover:text-black"
                    >
                      New Arrivals
                    </Link>
                  </motion.div>
                </motion.div>

                {/* Utility Links */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                  className="pt-12 mt-8 border-t border-gray-100 space-y-4"
                >
                  <Link
                    href={user ? "/account" : "/login"}
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-sm uppercase font-bold tracking-widest hover:text-[#d8a4bc] transition-colors"
                  >
                    {user ? "My Account" : "Sign In / Register"}
                  </Link>
                  <Link
                    href="/pages/wishlist"
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-sm uppercase font-bold tracking-widest hover:text-[#d8a4bc] transition-colors"
                  >
                    Wishlist
                  </Link>
                  <Link
                    href="/help"
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-sm uppercase font-bold tracking-widest hover:text-[#d8a4bc] transition-colors"
                  >
                    Help & Support
                  </Link>

                  {/* Currency/Region placeholder could go here */}
                  <div className="pt-8">
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">Shipping to: United States ($)</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Header;
