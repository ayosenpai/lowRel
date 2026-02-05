"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const HeroSale = () => {
  const heroAsset = "/products/img (6).png";

  return (
    <section className="relative w-full overflow-hidden bg-black">
      <div className="relative h-[60vh] min-h-[500px] w-full md:h-[85vh] lg:h-[100vh]">
        <motion.div
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <Image
            src={heroAsset}
            alt="Winter Sale - Model with ice cross"
            fill
            priority
            className="object-cover object-[86%_center] md:object-center lg:object-center"
            sizes="100vw"
          />
        </motion.div>

        <div className="absolute inset-0 bg-black/10 pointer-events-none" />


      </div>

      <div className="w-full h-[1px] bg-[#333333]" />
    </section>
  );
};

export default HeroSale;
