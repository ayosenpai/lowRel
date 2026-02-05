"use client";

import React, { useState } from "react";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
    }
  };

  return (
    <section className="bg-[#d8a4bc] text-black py-[60px] md:py-[80px] px-5 flex flex-col items-center justify-center border-t border-black">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="max-w-[1280px] w-full flex flex-col items-center text-center"
      >
        <div className="mb-6">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="white"
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8 md:w-10 md:h-10"
          >
            <path d="M12 0L14.5 9.5H24L16.5 15.5L19 24L12 18.5L5 24L7.5 15.5L0 9.5H9.5L12 0Z" />
          </svg>
        </div>

        <h2 className="text-[20px] md:text-[24px] font-bold uppercase tracking-[0.05em] mb-2 leading-tight">
          THE GOOD STUFF, STRAIGHT TO U
        </h2>

        <p className="text-[12px] md:text-[13px] text-gray-400 mb-8 max-w-[400px]">
          {isSubscribed 
            ? "Thank you! Check your email for some love from us" 
            : "Get 15% off your first order + early access to new drops and restocks."}
        </p>

        {!isSubscribed ? (
          <form 
            onSubmit={handleSubmit} 
            className="flex w-full max-w-[440px] border border-white"
          >
            <input
              type="email"
              placeholder="Enter your email"
              required
              className="flex-grow bg-white text-black px-4 py-3 text-[14px] outline-none placeholder:text-gray-500 placeholder:uppercase rounded-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              type="submit"
              className="bg-[#d8a4bc] text-black w-[50px] flex items-center justify-center border-l border-black hover:bg-black hover:text-[#d8a4bc] transition-colors rounded-none"
              aria-label="Subscribe"
            >
              <ChevronRight className="w-5 h-5" strokeWidth={2} />
            </button>
          </form>
        ) : (
          <div className="text-[14px] font-medium border border-black px-8 py-3 uppercase tracking-wider">
            Thank you!
          </div>
        )}
      </motion.div>
    </section>
  );
}
