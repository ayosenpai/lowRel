import React from 'react';
import Image from 'next/image';

const HeroSale = () => {
  const heroAsset = "https://ojmqttdrbundpodfusoe.supabase.co/storage/v1/object/public/LR_img/T-shirts/lowrel Fe/1.webp";

  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative h-[80vh] min-h-[500px] w-full md:h-[85vh] lg:h-[100vh]">
        <div className="absolute inset-0">
          <Image
            src={heroAsset}
            alt="Winter Sale - Model with ice cross"
            fill
            priority
            className="object-cover object-[50%_center] md:object-center lg:object-center"
            sizes="100vw"
            loading="eager"
          />
        </div>


        <div className="absolute inset-0 bg-black/10 pointer-events-none" />


      </div>

    </section>
  );
};

export default HeroSale;
