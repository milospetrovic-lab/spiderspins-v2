'use client';

import { useEffect, useRef, useState } from 'react';
import { lottieSpiderData } from './lottieSpider';

export default function Preloader() {
  const [phase, setPhase] = useState<'show' | 'fade' | 'gone'>(() => {
    if (typeof window === 'undefined') return 'show';
    try {
      if (window.location.search.includes('nopreload=1')) return 'gone';
    } catch {}
    return 'show';
  });
  const [progress, setProgress] = useState(0);
  const lottieRef = useRef<HTMLDivElement | null>(null);

  // Load Lottie spider-web animation while preloader is on screen
  useEffect(() => {
    if (phase === 'gone') return;
    const el = lottieRef.current;
    if (!el) return;
    let anim: any = null;
    let cancelled = false;
    (async () => {
      try {
        const lottie = (await import('lottie-web')).default;
        if (cancelled || !el) return;
        anim = lottie.loadAnimation({
          container: el,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          animationData: lottieSpiderData as any,
        });
      } catch {
        // lottie optional — preloader still functions without it
      }
    })();
    return () => {
      cancelled = true;
      if (anim) anim.destroy();
    };
  }, [phase]);

  useEffect(() => {
    // Only show on initial session visit
    const seen = typeof window !== 'undefined' && sessionStorage.getItem('spiderspins_loaded');
    if (seen) {
      setPhase('gone');
      return;
    }

    const total = 1200;
    const start = performance.now();
    let raf = 0;
    const tick = () => {
      const t = Math.min((performance.now() - start) / total, 1);
      setProgress(t);
      if (t < 1) raf = requestAnimationFrame(tick);
      else {
        setTimeout(() => setPhase('fade'), 260);
        setTimeout(() => {
          setPhase('gone');
          try {
            sessionStorage.setItem('spiderspins_loaded', '1');
          } catch {}
        }, 1060);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  if (phase === 'gone') return null;

  return (
    <div
      aria-hidden={phase === 'fade'}
      className={[
        'fixed inset-0 z-[200] flex items-center justify-center bg-void overflow-hidden pointer-events-auto transition-opacity duration-[800ms]',
        phase === 'fade' ? 'opacity-0' : 'opacity-100',
      ].join(' ')}
      style={{
        background:
          'radial-gradient(ellipse at 50% 50%, #0a0a0a 0%, #050505 70%)',
      }}
    >
      {/* subtle water shimmer behind the web */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-50 preload-water"
        style={{
          background:
            'radial-gradient(circle at 30% 40%, rgba(185,28,28,0.06) 0%, transparent 40%), radial-gradient(circle at 70% 60%, rgba(239,68,68,0.05) 0%, transparent 45%)',
        }}
      />

      {/* concentric silk web drawing outward */}
      <svg
        viewBox="0 0 600 600"
        className="absolute w-[min(80vmin,800px)] h-[min(80vmin,800px)]"
        aria-hidden
      >
        <defs>
          <radialGradient id="preGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(239,68,68,0.35)" />
            <stop offset="70%" stopColor="rgba(185,28,28,0.02)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <rect x="0" y="0" width="600" height="600" fill="url(#preGlow)" />
        <g fill="none" stroke="#888" strokeWidth="0.4" opacity="0.55">
          {Array.from({ length: 16 }).map((_, i) => {
            const a = (i / 16) * Math.PI * 2;
            const x = 300 + Math.cos(a) * 290;
            const y = 300 + Math.sin(a) * 290;
            const delay = 0.03 * i;
            return (
              <line
                key={'s' + i}
                x1="300"
                y1="300"
                x2={x.toFixed(1)}
                y2={y.toFixed(1)}
                strokeDasharray="300"
                strokeDashoffset="300"
                style={{
                  animation: `preload-draw 1.4s cubic-bezier(0.22,1,0.36,1) ${delay}s forwards`,
                }}
              />
            );
          })}
          {[70, 130, 195, 260].map((r, i) => {
            const pts: string[] = [];
            const spokes = 16;
            for (let s = 0; s < spokes; s++) {
              const a = (s / spokes) * Math.PI * 2;
              const wobble = 0.985 + Math.sin(i) * 0.01;
              pts.push(
                `${(300 + Math.cos(a) * r * wobble).toFixed(1)},${(300 + Math.sin(a) * r * wobble).toFixed(1)}`
              );
            }
            const dashLen = 2 * Math.PI * r;
            return (
              <polygon
                key={'r' + i}
                points={pts.join(' ')}
                strokeDasharray={dashLen}
                strokeDashoffset={dashLen}
                style={{
                  animation: `preload-draw 1.5s cubic-bezier(0.22,1,0.36,1) ${0.25 + i * 0.12}s forwards`,
                }}
              />
            );
          })}
        </g>
        {/* red dew dots at intersections */}
        <g>
          {Array.from({ length: 16 }).map((_, i) => {
            const a = (i / 16) * Math.PI * 2;
            const r = 195;
            const x = 300 + Math.cos(a) * r;
            const y = 300 + Math.sin(a) * r;
            return (
              <circle
                key={'d' + i}
                cx={x}
                cy={y}
                r="1.5"
                fill="#ef4444"
                style={{
                  animation: `preload-dot 0.6s ease-out ${0.6 + i * 0.04}s forwards`,
                  opacity: 0,
                }}
              />
            );
          })}
        </g>
      </svg>

      {/* Lottie spider intro overlay — rendered at center on top of SVG web */}
      <div
        ref={lottieRef}
        aria-hidden
        className="absolute z-[1]"
        style={{
          width: 'min(220px, 44vmin)',
          height: 'min(220px, 44vmin)',
          pointerEvents: 'none',
        }}
      />

      {/* brand + progress */}
      <div className="relative z-10 flex flex-col items-center gap-5 px-6">
        <div className="flex items-center gap-3">
          <span className="block w-2.5 h-2.5 rounded-full bg-strike shadow-[0_0_14px_#ef4444] animate-pulse" />
          <span className="font-display font-light tracking-[0.4em] text-silk uppercase text-sm md:text-base">
            SpiderSpins
          </span>
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.38em] text-silk-dim">
          Weaving the web
        </div>
        <div className="w-[min(260px,70vw)] h-[2px] bg-web/60 overflow-hidden rounded-full">
          <div
            className="h-full bg-strike"
            style={{
              width: `${Math.round(progress * 100)}%`,
              transition: 'width 80ms linear',
              boxShadow: '0 0 10px rgba(239,68,68,0.5)',
            }}
          />
        </div>
        <div className="font-mono text-[10px] tracking-[0.3em] text-shadow tabular-nums">
          {String(Math.round(progress * 100)).padStart(3, '0')} %
        </div>
      </div>

      {/* corner brackets (sci-fi) */}
      <span className="pre-corner tl" />
      <span className="pre-corner tr" />
      <span className="pre-corner bl" />
      <span className="pre-corner br" />
    </div>
  );
}
