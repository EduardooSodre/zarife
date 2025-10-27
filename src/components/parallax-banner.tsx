'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

export function ParallaxBanner() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const ticking = useRef(false);
  const [mounted, setMounted] = useState(false);
  const [useParallax, setUseParallax] = useState(true);

  useEffect(() => {
    setMounted(true);

    // Decide whether to enable parallax on this device
    const mmSmall = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 768px)');
    const mmReduce = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');

    if ((mmSmall && mmSmall.matches) || (mmReduce && mmReduce.matches)) {
      setUseParallax(false);
      return;
    }

    const handleScroll = () => {
      if (!containerRef.current) return;
      if (!ticking.current) {
        ticking.current = true;
        const y = window.scrollY;
        // choose smaller parallax factor on narrower screens
        const factor = window.innerWidth < 1024 ? 0.25 : 0.5;
        requestAnimationFrame(() => {
          if (containerRef.current) {
            containerRef.current.style.transform = `translate3d(0, ${y * factor}px, 0)`;
          }
          ticking.current = false;
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Render static image until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="absolute inset-0">
        <div className="absolute inset-0">
          <Image
            src="/banner.jpg"
            alt="Zarife Fashion Banner"
            fill
            className="object-cover object-center"
            priority
            quality={85}
            sizes="100vw"
          />
        </div>
      </div>
    );
  }

  // If parallax disabled (mobile or reduced motion), render a simpler static image with lower quality
  if (!useParallax) {
    return (
      <div className="absolute inset-0">
        <div className="absolute inset-0">
          <Image
            src="/banner.jpg"
            alt="Zarife Fashion Banner"
            fill
            className="object-cover object-center"
            priority={false}
            quality={75}
            sizes="100vw"
          />
        </div>
      </div>
    );
  }

  // Full parallax enabled
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
          className="object-cover object-center"
          priority
          quality={90}
          sizes="100vw"
        />
      </div>
    </div>
  );
}
