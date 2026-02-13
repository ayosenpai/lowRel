import React from 'react';
import Image from 'next/image';

const HeroSale = () => {
  const heroAsset = "/products/img (6).png";

  return (
    <section className="relative w-full overflow-hidden bg-black">
      <div className="relative h-[80vh] min-h-[500px] w-full md:h-[85vh] lg:h-[100vh]">
        <div className="absolute inset-0">
          <Image
            src={heroAsset}
            alt="Winter Sale - Model with ice cross"
            fill
            priority
            className="object-cover object-[86%_center] md:object-center lg:object-center"
            sizes="100vw"
            loading="eager"
          />
        </div>


        <div className="absolute inset-0 bg-black/10 pointer-events-none" />


      </div>

      <div className="w-full h-[1px] bg-[#333333]" />
    </section>
  );
};

export default HeroSale;
