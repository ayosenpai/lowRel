'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

interface HeroSaleProps {
  mediaType?: 'video' | 'image';
  videoUrl?: string;
  videoWebmUrl?: string;
  imageUrl?: string;
  height?: 'screen' | 'large' | 'medium';
  headline?: string;
  subheadline?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

const HEIGHT_CLASSES: Record<NonNullable<HeroSaleProps['height']>, string> = {
  screen: 'h-[90vh] min-h-[600px] md:h-[85vh] lg:h-[100vh]',
  large: 'h-[75vh] min-h-[520px]',
  medium: 'h-[55vh] min-h-[400px]',
};

const HeroSale = ({
  mediaType = 'video',
  videoUrl = '/hero/hero.mp4',
  videoWebmUrl = '/hero/hero.webm',
  imageUrl = '',
  height = 'screen',
  headline = '',
  subheadline = '',
  ctaLabel = '',
  ctaHref = '',
}: HeroSaleProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [still, setStill] = useState<string | null>(null);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const isVideo = mediaType === 'video' && Boolean(videoUrl);

  useEffect(() => {
    if (!isVideo) return;
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
  }, [isVideo, videoUrl]);

  return (
    <section className="relative w-full overflow-hidden">
      <div className={`relative w-full ${HEIGHT_CLASSES[height] ?? HEIGHT_CLASSES.screen}`}>
        {isVideo ? (
          <>
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

            {/* Video layered above. MP4 first (valid, seekable, universal); WebM as fallback. */}
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
                <source src={videoUrl} type="video/mp4" />
                {videoWebmUrl ? <source src={videoWebmUrl} type="video/webm" /> : null}
              </video>
            </div>
          </>
        ) : imageUrl ? (
          <img src={imageUrl} alt={headline || ''} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-[#0F172A]" />
        )}

        <div className="absolute inset-0 bg-black/10 pointer-events-none" />

        {(headline || subheadline || (ctaLabel && ctaHref)) && (
          <div className="absolute inset-0 z-10 flex items-center justify-center p-6">
            <div className="pointer-events-none max-w-2xl text-center text-white">
              {headline && (
                <h1 className="text-4xl font-black uppercase leading-[0.95] tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)] md:text-6xl lg:text-7xl">
                  {headline}
                </h1>
              )}
              {subheadline && (
                <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.22em] drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] md:text-sm">
                  {subheadline}
                </p>
              )}
              {ctaLabel && ctaHref && (
                <Link
                  href={ctaHref}
                  className="pointer-events-auto mt-7 inline-block border border-white bg-white px-9 py-3.5 text-[11px] font-black uppercase tracking-[0.2em] text-black transition-colors hover:bg-black hover:text-white"
                >
                  {ctaLabel}
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroSale;
