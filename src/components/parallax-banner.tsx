'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

export function ParallaxBanner() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const ticking = useRef(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      if (!containerRef.current) return;
      if (!ticking.current) {
        ticking.current = true;
        const y = window.scrollY;
        // schedule transform on next animation frame
        requestAnimationFrame(() => {
          if (containerRef.current) {
            // move at half speed
            containerRef.current.style.transform = `translate3d(0, ${y * 0.5}px, 0)`;
          }
          ticking.current = false;
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Evitar problemas de hidratação: renderiza imagem para SSR then apply transforms on client
  if (!mounted) {
    return (
      <div className="absolute inset-0">
        <div className="absolute inset-0">
          <Image
            src="/banner.jpg"
            alt="Zarife Fashion Banner"
            fill
            className="object-cover object-center scale-110"
            priority
            quality={100}
            sizes="100vw"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0">
      <div
        ref={containerRef}
        className="absolute inset-0 will-change-transform"
        style={{ transform: 'translate3d(0,0,0)' }}
      >
        <Image
          src="/banner.jpg"
          alt="Zarife Fashion Banner"
          fill
          className="object-cover object-center scale-110"
          priority
          quality={100}
          sizes="100vw"
        />
      </div>
    </div>
  );
}
