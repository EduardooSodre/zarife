'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

export function ParallaxBanner() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const ticking = useRef(false);
  const [mounted, setMounted] = useState(false);
  const [useParallax, setUseParallax] = useState(true);
  const parallaxFactorRef = useRef(0.5);
  const [smallParallax, setSmallParallax] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Decide whether to enable parallax on this device
    const mmSmall = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(max-width: 768px)');
    const mmReduce = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');

    // If user prefers reduced motion, disable parallax entirely
    if (mmReduce && mmReduce.matches) {
      setUseParallax(false);
      return;
    }

    // Adjust parallax factor for smaller screens to keep motion subtle and performant
    if (mmSmall && mmSmall.matches) {
      // Increase the small-screen factor so the effect is visible on mobile
      // while keeping motion subtle for performance.
      parallaxFactorRef.current = 0.12;
      setSmallParallax(true);
      setUseParallax(true);
    } else {
      parallaxFactorRef.current = 0.5;
      setSmallParallax(false);
      setUseParallax(true);
    }

    const handleScroll = () => {
      if (!containerRef.current) return;
      if (!ticking.current) {
        ticking.current = true;
        const y = window.scrollY;
        const factor = parallaxFactorRef.current;
        requestAnimationFrame(() => {
          if (containerRef.current) {
            containerRef.current.style.transform = `translate3d(0, ${y * factor}px, 0)`;
          }
          ticking.current = false;
        });
      }
    };

    // Listen to both scroll and touchmove on mobile so the transform
    // updates during touch-driven scrolling as well.
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('touchmove', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('touchmove', handleScroll);
    };
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

  // If parallax disabled (reduced motion), render a simpler static image with lower quality
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
          className={`object-cover object-center ${smallParallax ? 'banner-zoom' : ''}`}
          priority
          quality={90}
          sizes="100vw"
        />
      </div>
    </div>
  );
}
