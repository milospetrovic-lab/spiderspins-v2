'use client';

import { useEffect, useState } from 'react';

// Spider-styled 404 with auto-redirect to the games section after 2.006s.
// No mini-game, no reward. A quiet dead-end that rebuilds itself.

const REDIRECT_DELAY_MS = 2006;
const REDIRECT_TARGET = '/#all-games';

export default function NotFound() {
  const [countdown, setCountdown] = useState(REDIRECT_DELAY_MS);

  useEffect(() => {
    // Tick display every ~66ms for a smooth countdown
    const start = performance.now();
    let raf = 0;
    const tick = () => {
      const elapsed = performance.now() - start;
      const remain = Math.max(0, REDIRECT_DELAY_MS - elapsed);
      setCountdown(Math.round(remain));
      if (remain > 0) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // Actual redirect
    const to = window.setTimeout(() => {
      window.location.href = REDIRECT_TARGET;
    }, REDIRECT_DELAY_MS);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(to);
    };
  }, []);

  // Seconds with 3-digit precision (2.006 -> 1.234 -> 0.000)
  const seconds = (countdown / 1000).toFixed(3);

  return (
    <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-20">
      <p className="font-mono text-silk-dim text-[11px] uppercase tracking-[0.42em] mb-6">
        404 · THE WEB HAS A GAP
      </p>

      {/* Animated spider silhouette */}
      <div className="relative w-40 h-40 mb-6" aria-hidden>
        <svg
          viewBox="-100 -100 200 200"
          className="w-full h-full"
          style={{ filter: 'drop-shadow(0 0 24px rgba(239,68,68,0.35))' }}
        >
          <g stroke="#e8e8e8" strokeWidth="1.6" strokeLinecap="round" fill="none">
            {[-1, 1].flatMap((sx) =>
              [
                { ay: 28, ky: -12 },
                { ay: 10, ky: -22 },
                { ay: -6, ky: -18 },
                { ay: -24, ky: -8 },
              ].map((l, i) => (
                <path
                  key={`${sx}-${i}`}
                  d={`M ${sx * 12} ${l.ay / 2} Q ${sx * 52} ${l.ky} ${sx * 80} ${l.ay}`}
                />
              ))
            )}
          </g>
          <ellipse cx="0" cy="-4" rx="14" ry="16" fill="#e8e8e8" opacity="0.95" />
          <ellipse cx="0" cy="22" rx="20" ry="28" fill="#e8e8e8" opacity="0.98" />
          <path d="M -6 18 L 0 30 L 6 18 Z" fill="#ef4444" />
        </svg>
        {/* ambient red pulse behind */}
        <span
          className="pointer-events-none absolute inset-0 rounded-full animate-pulse"
          style={{
            background:
              'radial-gradient(circle, rgba(239,68,68,0.18) 0%, rgba(239,68,68,0) 70%)',
          }}
        />
      </div>

      <h1 className="font-display font-black text-silk leading-[0.95] text-[clamp(2.2rem,8vw,5rem)] text-center">
        A silk thread <span className="text-strike">snapped</span>.
      </h1>
      <p className="mt-5 max-w-xl text-center font-display font-light text-silk-dim text-base md:text-lg">
        This page isn&apos;t here. The spider rebuilds.
      </p>

      {/* Countdown + redirect info */}
      <div className="mt-10 flex flex-col items-center gap-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-silk-dim">
          Returning you to the games in
        </p>
        <p className="font-mono text-strike text-3xl md:text-4xl font-bold tabular-nums">
          {seconds}s
        </p>
        <div className="w-48 h-[2px] bg-web relative overflow-hidden rounded-full mt-2">
          <span
            className="absolute left-0 top-0 h-full bg-strike"
            style={{
              width: `${((REDIRECT_DELAY_MS - countdown) / REDIRECT_DELAY_MS) * 100}%`,
              transition: 'width 60ms linear',
            }}
          />
        </div>
      </div>

      {/* Skip link */}
      <a
        href={REDIRECT_TARGET}
        className="hover-target mt-10 inline-flex items-center gap-2 px-6 py-3 bg-venom text-silk uppercase tracking-[0.18em] text-sm font-display font-medium hover:bg-strike transition-colors shadow-strike-glow"
      >
        Skip — take me now
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M5 12h14M13 5l7 7-7 7" />
        </svg>
      </a>
    </main>
  );
}
