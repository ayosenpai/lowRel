"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, X } from "lucide-react";
import { useCart } from '@/lib/cart-context';
import { createClient } from '@/lib/supabase/client';
import SearchOverlay from '@/components/ui/search-overlay';

interface HeaderProps {
  variant?: 'default' | 'solid';
}

const supabase = createClient();

const Header = ({ variant = 'default' }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showEmptyCartPopup, setShowEmptyCartPopup] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { state, dispatch } = useCart();

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

  // Disable body scroll when menu or cart is open
  useEffect(() => {
    if (isMenuOpen || state.isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen, state.isOpen]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 10);

      // Hide/Show logic
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
      } else {
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
    close: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/18eed3e2-8b5f-4ae4-a107-ec6bc29922d3-us-mingalondon-com/assets/svgs/close-icon-white.svg"
  };

  const navLinks = [
    { name: 'New In', href: '/collections/new-in' },
    { name: 'Shop', href: '/collections/all' },
    { name: 'Winter Sale', href: '/collections/sale', highlight: true }
  ];

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-[100]">
        {/* Announcement Bar */}
        <div
          style={{
            transform: isVisible ? 'translateY(0)' : 'translateY(-100%)',
            transition: 'transform 0.3s ease-out'
          }}
          className="w-full bg-[#d8a4bc] h-[30px] flex items-center justify-center border-b border-black absolute top-0 z-50"
        >
          <span className="text-[10px] text-black font-bold tracking-[0.1em] uppercase">
            USE CODE "FAMILY15" FOR 15% OFF
          </span>
        </div>

        {/* Main Navigation */}
        <nav
          style={{
            transform: `translateY(${isVisible ? (isVisible && lastScrollY < 30 ? 30 : 0) : -100}px)`,
            transition: 'transform 0.3s ease-out, background-color 0.3s, border-color 0.3s'
          }}
          className={`w-full h-[64px] flex items-center justify-between px-5 xl:px-10 border-b absolute top-0 ${isSolid ? "bg-black border-[#333333]" : "bg-transparent border-transparent"}`}
        >
          {/* Left: Mobile Menu & Logo */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="lg:hidden flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
            >
              <Image src={navAssets.menu} alt="Menu" width={20} height={20} className="w-5 h-5" />
            </button>

            <Link href="/" className="block">
              <Image src={navAssets.logo} alt="Low Religion Logo" width={180} height={45} priority className="h-[28px] w-auto lg:h-[38px]" />
            </Link>
          </div>

          {/* Center: Main Links */}
          <div className="hidden lg:flex items-center gap-8 translate-x-12">
            {navLinks.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="relative text-[13px] font-bold tracking-[0.1em] uppercase group text-black"
              >
                {item.name}
                <span className="absolute -bottom-1 left-0 w-0 h-[2px] transition-all group-hover:w-full bg-black" />
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
              <div key={i} className="hover:scale-110 active:scale-95 transition-transform">
                {item.alt === 'Bag' ? (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      dispatch({ type: 'TOGGLE_CART' });
                    }}
                    className="flex items-center justify-center p-1 relative"
                  >
                    <ShoppingBag
                      className="w-[22px] h-[20px] xl:w-[26px] xl:h-[22px] text-white"
                      fill={state.items.length > 0 ? "white" : "none"}
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
                    <Image src={item.icon!} alt={item.alt} width={26} height={22} className="w-[22px] h-[20px] xl:w-[26px] xl:h-[22px]" />
                  </button>
                ) : (
                  <Link href={item.href!} className="flex items-center justify-center p-1 relative">
                    <Image src={item.icon!} alt={item.alt} width={26} height={22} className="w-[22px] h-[20px] xl:w-[26px] xl:h-[22px]" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </nav>
      </header>

      {/* Popups and Side Menu using pure CSS transitions for lightweight hydration */}
      <div
        className={`fixed inset-0 bg-black/50 z-[200] transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={() => setIsMenuOpen(false)}
      />

      <div
        className={`fixed top-0 left-0 w-[90%] max-w-[400px] h-full bg-white text-black z-[201] transition-transform duration-300 ease-out flex flex-col shadow-2xl ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-6 border-b border-black">
          <span className="text-xl font-bold uppercase tracking-tighter">Menu</span>
          <button onClick={() => setIsMenuOpen(false)} className="p-1 hover:rotate-90 transition-transform duration-300">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-8 px-6 space-y-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className={`block text-3xl font-black uppercase tracking-tight py-2 transition-all duration-300 hover:tracking-wide ${link.highlight ? 'text-[#ff69b4]' : 'text-black'}`}
            >
              {link.name}
            </Link>
          ))}
          <Link
            href="/collections/all"
            onClick={() => setIsMenuOpen(false)}
            className="block text-3xl font-black uppercase tracking-tight py-2 transition-all duration-300 hover:tracking-wide text-gray-400 hover:text-black"
          >
            New Arrivals
          </Link>

          <div className="pt-12 mt-8 border-t border-gray-100 space-y-4">
            <Link href={user ? "/account" : "/login"} className="block text-sm uppercase font-bold tracking-widest hover:text-[#d8a4bc]">
              {user ? "My Account" : "Sign In / Register"}
            </Link>
            <Link href="/pages/wishlist" className="block text-sm uppercase font-bold tracking-widest hover:text-[#d8a4bc]">
              Wishlist
            </Link>
            <Link href="/help" className="block text-sm uppercase font-bold tracking-widest hover:text-[#d8a4bc]">
              Help & Support
            </Link>
            <div className="pt-8 text-[10px] text-gray-400 uppercase tracking-widest">
              Shipping to: United States ($)
            </div>
          </div>
        </div>
      </div>

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export default Header;
