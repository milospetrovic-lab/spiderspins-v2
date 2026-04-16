'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

// Asymmetric dripping silk threads at the hero bottom — hangs into the next
// section instead of showing a clean horizontal edge. Animations pause when
// the wrapper scrolls out of view (mobile perf win).
export default function HeroBottomDrip() {
  const threads = useMemo(() => {
    const raw: { x: number; length: number; opacity: number; swayDur: number; swayDelay: number; dot: boolean }[] =
      [];
    for (let i = 0; i < 14; i++) {
      raw.push({
        x: 4 + Math.random() * 94,
        length: 60 + Math.random() * 220,
        opacity: 0.32 + Math.random() * 0.55,
        swayDur: 3.5 + Math.random() * 3,
        swayDelay: -Math.random() * 4,
        dot: Math.random() > 0.15,
      });
    }
    return raw;
  }, []);

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) setInView(e.isIntersecting);
      },
      { rootMargin: '50px' }
    );
    io.observe(el);
    const onVis = () => {
      if (document.hidden) setInView(false);
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className={[
        'pointer-events-none absolute left-0 right-0 bottom-0 z-[8]',
        inView ? '' : 'is-paused',
      ].join(' ')}
      style={{ height: '280px', transform: 'translateY(120px)' }}
    >
      {threads.map((t, i) => (
        <div
          key={i}
          className="drip-thread absolute top-0"
          style={{
            left: `${t.x}%`,
            height: `${t.length}px`,
            animationDuration: `${t.swayDur}s`,
            animationDelay: `${t.swayDelay}s`,
          }}
        >
          <span
            className="block w-px"
            style={{
              height: `${t.length}px`,
              background:
                'linear-gradient(to bottom, rgba(232,232,232,0) 0%, rgba(232,232,232,0.15) 30%, rgba(232,232,232,0.55) 100%)',
              opacity: t.opacity,
            }}
          />
          {t.dot && (
            <span
              className="drip-dot"
              style={{ top: `${t.length}px` }}
              aria-hidden
            />
          )}
        </div>
      ))}
    </div>
  );
}
