'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Instagram, Youtube, ChevronDown, ChevronUp, Mail, Smartphone } from 'lucide-react';

const Footer = () => {

  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleSection = (title: string) => {
    setExpandedSections(prev =>
      prev.includes(title)
        ? prev.filter(section => section !== title)
        : [...prev, title]
    );
  };

  const footerLinks = {
    'MY ACCOUNT': [
      { label: 'TRACK MY ORDER', href: '/account' },
      { label: 'ORDER HISTORY', href: '/account' },
      { label: 'START A RETURN', href: '/help/returns' },
      { label: 'WISHLIST', href: '/pages/wishlist' },
    ],
    'HELP': [
      { label: 'FAQS', href: '/help/faqs' },
      { label: 'SHIPPING', href: '/help/shipping' },
      { label: 'RETURNS', href: '/help/returns' },
      { label: 'SIZE GUIDE', href: '/help/size-guide' },
      { label: 'CONTACT US', href: '/help/contact' },
    ],
    'ABOUT US': [
      { label: 'ABOUT US', href: '/help/about' },
      { label: 'BRAND RESPONSIBILITY', href: '#' },
      { label: 'Low Religion Magazine', href: '#' },
    ],

  };

  return (
    <footer className="w-full bg-black text-white pt-[60px] pb-[40px] font-sans" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div className="container mx-auto px-5 lg:px-10">
        {/* Newsletter Section - Always visible */}
        <div className="mb-8 md:mb-12">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="lowrel-header text-[10px] font-black mb-4 uppercase" style={{ padding: "16px 0px 6px", marginBottom: "10px" }}>O' LORD, THY FASHION GOT ME</h2>
            <p className="text-[12px] mb-4 md:mb-6 text-gray-400">Get 15% off your first order + early access to new drops and restocks.</p>
          </div>
          <div className="max-w-xs md:max-w-sm mx-auto">
            <div className="flex border border-gray-700">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-3 py-2 bg-black text-white text-sm placeholder:text-gray-500 focus:outline-none"
              />
              <button className="px-3 py-2 bg-black text-white font-bold text-xs hover:bg-gray-900 transition-colors tracking-[0.5px] uppercase border-l border-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Main Footer Links - Responsive */}
        <div className="mb-8 md:mb-12">
          {/* Mobile: Expandable Sections */}
          <div className="md:hidden">
            <div className="border-b border-gray-800"></div>
            {Object.entries(footerLinks).map(([title, links]) => {
              const isExpanded = expandedSections.includes(title);
              const isLastSection = title === 'FOR YOU';
              return (
                <div key={title} className={isLastSection ? "" : "border-b border-gray-800"}>
                  <button
                    onClick={() => toggleSection(title)}
                    className="w-full py-0.1 flex justify-between items-center text-left hover:text-white transition-colors"
                  >
                    <span className="lowrel-header text-[10px] font-black uppercase" style={{ padding: "16px 0px 6px", marginBottom: "10px" }}>{title}</span>
                    <span className="text-[14px] text-white-400">{isExpanded ? '−' : '+'}</span>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ease-out ${isExpanded ? 'max-h-60' : 'max-h-0'}`}>
                    <div className={`transform transition-all duration-500 ease-out ${isExpanded ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                      <ul className="pb-3" style={{ lineHeight: '1.1' }}>
                        {links.map((link) => (
                          <li key={link.label}>
                            <a
                              href={link.href}
                              className="lowrel-link text-[10px] font-black uppercase text-gray-400 hover:text-white transition-colors" style={{ padding: "4px 0px" }}
                            >
                              {link.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop: Separate Columns */}
          <div className="hidden md:grid md:grid-cols-4 gap-y-4">
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title} className="flex flex-col space-y-2">
                <h3 className="lowrel-header text-[10px] font-black uppercase" style={{ padding: "16px 0px 6px", marginBottom: "10px" }}>
                  {title}
                </h3>
                <ul className="flex flex-col" style={{ lineHeight: '1.1' }}>
                  {links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="lowrel-link text-[10px] font-black text-gray-400 hover:text-white transition-colors" style={{ padding: "4px 0px" }}
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>


        {/* Social Icons & App Downloads */}
        <div className="mb-8 md:mb-12 flex flex-col items-center">
          {/* Social Icons */}
          <div className="flex justify-center items-center space-x-6 mb-10">
            <a href="#" className="text-white hover:text-gray-400 transition-colors">
              <Instagram size={20} strokeWidth={1.5} />
            </a>
            <a href="#" className="text-white hover:text-gray-400 transition-colors">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.06-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.03 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.9-.32-1.98-.23-2.81.33-.85.51-1.44 1.43-1.58 2.41-.16 1.02.21 2.07.94 2.79.af.55 1.5.83 2.3.61 1.05-.24 1.91-1.1 2.21-2.13.12-.44.13-.89.12-1.34V.02z" />
              </svg>
            </a>
            <a href="#" className="text-white hover:text-gray-400 transition-colors">
              <Youtube size={20} strokeWidth={1.5} />
            </a>
            <a href="#" className="text-white hover:text-gray-400 transition-colors">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.261 7.929-7.261 4.162 0 7.398 2.967 7.398 6.93 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.034-1.002 2.331-1.492 3.127C9.358 23.82 10.635 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
              </svg>
            </a>
          </div>

        </div>

        {/* Bottom Legal Bar */}
        <div className="pt-4 md:pt-6 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-4 md:space-x-6 text-center">
              <a href="/help/privacy" className="text-[8px] md:text-[9px] tracking-[0.15em] uppercase font-bold hover:text-white transition-colors" style={{ fontFamily: "'CatamaranOmnisend', sans-serif", fontWeight: 700, letterSpacing: '0.05em', lineHeight: '1.1' }}>
                PRIVACY POLICY
              </a>
              <a href="/help/terms" className="text-[8px] md:text-[9px] tracking-[0.15em] uppercase font-bold hover:text-white transition-colors" style={{ fontFamily: "'CatamaranOmnisend', sans-serif", fontWeight: 700, letterSpacing: '0.05em', lineHeight: '1.1' }}>
                TERMS OF USE
              </a>
            </div>
            <div className="text-[8px] md:text-[9px] tracking-[0.05em] uppercase font-normal text-gray-500">
              COPYRIGHT © 2026 LOW RELIGION
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;