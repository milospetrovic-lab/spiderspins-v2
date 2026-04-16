'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type Variant = {
  left: string;
  size: number;
  duration: number;
  delay: number;
  dangle: number;
  depth: number;
  driftX: number;
};

const IconSpider = ({ size = 18 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g stroke="#e8e8e8" strokeWidth="0.9" strokeLinecap="round">
      <path d="M12 12 L5 6 L3 8" />
      <path d="M12 12 L4 10 L2 12" />
      <path d="M12 12 L4 14 L2 16" />
      <path d="M12 12 L5 18 L3 20" />
      <path d="M12 12 L19 6 L21 8" />
      <path d="M12 12 L20 10 L22 12" />
      <path d="M12 12 L20 14 L22 16" />
      <path d="M12 12 L19 18 L21 20" />
    </g>
    <circle cx="12" cy="9" r="2" fill="#050505" stroke="#c9c9c9" strokeWidth="0.6" />
    <ellipse cx="12" cy="14.2" rx="2.9" ry="3.4" fill="#050505" stroke="#c9c9c9" strokeWidth="0.6" />
    <path
      d="M10.5 13 L13.5 13 L11.5 15 L12.5 15 L10.5 17 L13.5 17"
      stroke="#ef4444"
      strokeWidth="0.9"
      fill="none"
    />
  </svg>
);

export default function SpiderRain() {
  const spiders = useMemo<Variant[]>(
    () =>
      [
        { left: '6%', size: 14, duration: 16, delay: 0.4, dangle: 40, depth: 0.65, driftX: 0 },
        { left: '18%', size: 22, duration: 20, delay: 3, dangle: 120, depth: 1, driftX: 14 },
        { left: '29%', size: 16, duration: 18, delay: 7, dangle: 80, depth: 0.8, driftX: -10 },
        { left: '42%', size: 12, duration: 14, delay: 1.8, dangle: 30, depth: 0.55, driftX: 6 },
        { left: '56%', size: 20, duration: 22, delay: 5, dangle: 160, depth: 1, driftX: -18 },
        { left: '68%', size: 14, duration: 17, delay: 9, dangle: 60, depth: 0.7, driftX: 0 },
        { left: '80%', size: 18, duration: 21, delay: 2.6, dangle: 110, depth: 0.9, driftX: 22 },
        { left: '92%', size: 13, duration: 17, delay: 8, dangle: 50, depth: 0.6, driftX: -8 },
      ],
    []
  );

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(true);

  // Pause CSS animations when scrolled out of hero — major mobile perf win,
  // these were running forever even after user left the section.
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
    // Also pause on tab hide
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
        'pointer-events-none absolute inset-0 overflow-hidden z-[5]',
        inView ? '' : 'is-paused',
      ].join(' ')}
    >
      {spiders.map((s, i) => (
        <div
          key={i}
          className="rain-spider absolute top-0"
          style={
            {
              left: s.left,
              animation: `spider-fall ${s.duration}s cubic-bezier(0.45,0.05,0.55,0.95) ${s.delay}s infinite`,
              // custom props consumed in keyframes
              '--dangle': `${s.dangle}vh`,
              '--depth': s.depth,
              '--drift': `${s.driftX}px`,
            } as React.CSSProperties
          }
        >
          <span
            className="rain-thread block mx-auto"
            style={{
              animation: `spider-thread ${s.duration}s cubic-bezier(0.45,0.05,0.55,0.95) ${s.delay}s infinite`,
            }}
          />
          <span
            className="rain-body block mx-auto"
            style={{
              animation: `spider-sway ${s.duration / 2.2}s ease-in-out infinite alternate`,
              opacity: s.depth,
              filter:
                'drop-shadow(0 0 5px rgba(239,68,68,0.35)) drop-shadow(0 0 12px rgba(5,5,5,0.9))',
            }}
          >
            <IconSpider size={s.size} />
          </span>
        </div>
      ))}
    </div>
  );
}
