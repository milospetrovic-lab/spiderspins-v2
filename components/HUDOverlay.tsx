'use client';

import { useEffect, useState } from 'react';

function useClock() {
  const [t, setT] = useState('');
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      setT(
        `${d.getUTCFullYear()}.${pad(d.getUTCMonth() + 1)}.${pad(d.getUTCDate())} · ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())} UTC`
      );
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  return t;
}

export default function HUDOverlay() {
  const clock = useClock();
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[70] hidden md:block"
    >
      {/* Corner brackets */}
      <span className="hud-corner tl" />
      <span className="hud-corner tr" />
      <span className="hud-corner bl" />
      <span className="hud-corner br" />

      {/* Left vertical tics */}
      <div className="absolute top-1/2 left-3 -translate-y-1/2 flex flex-col gap-[5px]">
        {Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            className="block bg-web-light"
            style={{
              width: i % 3 === 0 ? '14px' : '8px',
              height: '1px',
              opacity: i % 3 === 0 ? 0.55 : 0.25,
            }}
          />
        ))}
      </div>

      {/* Right vertical readout */}
      <div className="absolute top-1/2 right-3 -translate-y-1/2 flex flex-col items-end gap-2 font-mono text-[9px] uppercase tracking-[0.3em] text-silk-dim">
        <span className="text-strike">● Live</span>
        <span>SCTR · 01</span>
        <span>TIER · 04</span>
        <span className="text-fang">VIP · EMP</span>
        <div className="mt-3 flex flex-col gap-[4px]">
          {Array.from({ length: 10 }).map((_, i) => (
            <span
              key={i}
              className="block bg-web-light"
              style={{
                width: i % 3 === 0 ? '12px' : '6px',
                height: '1px',
                opacity: i % 3 === 0 ? 0.55 : 0.25,
              }}
            />
          ))}
        </div>
      </div>

      {/* Bottom-left readout strip */}
      <div className="absolute bottom-3 left-4 font-mono text-[9px] uppercase tracking-[0.32em] text-silk-dim flex items-center gap-3">
        <span className="text-strike">●</span>
        <span>SPIDERSPINS / WEB_ONLINE</span>
        <span className="text-shadow">·</span>
        <span className="tabular-nums text-silk">{clock}</span>
      </div>

      {/* Bottom-right readout strip */}
      <div className="absolute bottom-3 right-4 font-mono text-[9px] uppercase tracking-[0.32em] text-silk-dim flex items-center gap-3">
        <span className="text-fang">Widow / 04</span>
        <span className="text-shadow">·</span>
        <span>silk flux 0.86</span>
        <span className="hud-scan" />
      </div>

      {/* Scanline across full viewport */}
      <div className="hud-scanline" />
    </div>
  );
}
