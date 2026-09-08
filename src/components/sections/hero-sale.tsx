'use client';

import { useEffect, useRef, useState } from 'react';

const HeroSale = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [still, setStill] = useState<string | null>(null);
  const [videoPlaying, setVideoPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Capture a still frame from the video itself for the placeholder
    const captureStill = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        setStill(canvas.toDataURL('image/jpeg', 0.7));
      } catch {
        /* ignore */
      }
    };

    video.addEventListener('loadeddata', captureStill, { once: true });
    return () => video.removeEventListener('loadeddata', captureStill);
  }, []);

  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative h-[90vh] min-h-[600px] w-full md:h-[85vh] lg:h-[100vh]">
        {/* Still captured from the video itself, shown only until playback starts */}
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${videoPlaying ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
          {still ? (
            <img src={still} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-[#0F172A]" />
          )}
        </div>

        {/* Video layered above. MP4 first (valid, seekable, universal); WebM as
            fallback. Native `loop` is the single restart mechanism. */}
        <div className="absolute inset-0">
          <video
            ref={videoRef}
            suppressHydrationWarning
            className="h-full w-full object-cover object-[50%_center] md:object-center lg:object-center"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            onPlaying={() => setVideoPlaying(true)}
          >
            <source src="/hero/hero.mp4" type="video/mp4" />
            <source src="/hero/hero.webm" type="video/webm" />
          </video>
        </div>

        <div className="absolute inset-0 bg-black/10 pointer-events-none" />
      </div>
    </section>
  );
};

export default HeroSale;
