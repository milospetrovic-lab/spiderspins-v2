'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

// Scrub-scroll transition: as the user scrolls OUT of the hero, warp rushes
// forward, hex scales through the camera, text fades up, and at ~85% progress
// we fire a centered spider burst. No pin — natural scroll continues.
export default function HeroScrollTransition() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let mq: MediaQueryList | null = null;
    try {
      mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    } catch {}
    if (mq && mq.matches) return;

    // Skip on touch devices entirely. The scroll-scrubbed timeline (scrub: 0.55
    // animating warp/hex/grid/rain/text simultaneously) was causing a visible
    // twitch on real phones when scrolling in and out of the hero — even
    // though dev-tools mobile emulation didn't reproduce it. On desktop the
    // exit animation stays cinematic; on mobile we skip it for smooth scroll.
    try {
      if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;
    } catch {}

    const heroSection =
      document.querySelector<HTMLElement>('section:first-of-type');
    if (!heroSection) return;

    let burstFired = false;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: heroSection,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.55,
          onUpdate: (self) => {
            if (!burstFired && self.progress > 0.82) {
              burstFired = true;
              try {
                window.dispatchEvent(
                  new CustomEvent('spiderspins:burst', {
                    detail: {
                      x: window.innerWidth / 2,
                      y: window.innerHeight * 0.46,
                      dist: 1600,
                    },
                  })
                );
              } catch {}
            } else if (self.progress < 0.3) {
              // allow re-firing if user scrolls back up
              burstFired = false;
            }
          },
        },
      });

      tl.to(
        '[data-intro="warp"]',
        {
          scale: 1.9,
          filter: 'blur(3.5px)',
          opacity: 0.6,
          ease: 'none',
        },
        0
      );
      tl.to(
        '[data-intro="hex"]',
        {
          scale: 2.6,
          opacity: 0,
          ease: 'none',
        },
        0
      );
      tl.to(
        '[data-intro="grid"]',
        { opacity: 0.15, ease: 'none' },
        0
      );
      tl.to(
        '[data-intro="rain"]',
        { opacity: 0, ease: 'none' },
        0
      );
      tl.to(
        '[data-intro="text"]',
        { opacity: 0, y: -60, ease: 'none' },
        0.15
      );
    }, heroSection);

    return () => ctx.revert();
  }, []);

  return null;
}
