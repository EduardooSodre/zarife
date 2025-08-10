'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

export function ParallaxBanner() {
  const [scrollY, setScrollY] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Evitar problemas de hidratação
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
        className="absolute inset-0 will-change-transform"
        style={{
          transform: `translate3d(0, ${scrollY * 0.5}px, 0)`,
        }}
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
