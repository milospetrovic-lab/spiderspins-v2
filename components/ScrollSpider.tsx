'use client';

import { useEffect, useRef, useState } from 'react';

type Chip = {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  rotV: number;
  color: string;
  life: number;
  maxLife: number;
};

const CHIP_COLORS = ['#ef4444', '#b91c1c', '#c4a265', '#e8e8e8', '#050505'];

export default function ScrollSpider() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const bodyRef = useRef<HTMLSpanElement | null>(null);
  const [chips, setChips] = useState<Chip[]>([]);
  const [exploding, setExploding] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    let raf = 0;
    const update = () => {
      const h = document.documentElement;
      const scrolled = h.scrollTop;
      const total = Math.max(1, h.scrollHeight - h.clientHeight);
      const pct = Math.min(1, Math.max(0, scrolled / total));
      const topVh = -8 + pct * 90;
      wrap.style.setProperty('--sy', `${topVh}vh`);
      wrap.style.setProperty('--tl', `${Math.max(0, topVh + 8)}vh`);
      const driftX = Math.sin(pct * Math.PI * 3) * 14;
      wrap.style.setProperty('--sx', `${driftX}px`);
      raf = 0;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', update);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Chip physics tick
  useEffect(() => {
    if (chips.length === 0) return;
    let raf = 0;
    const tick = () => {
      setChips((arr) =>
        arr
          .map((c) => ({
            ...c,
            vy: c.vy + 0.35, // gravity
            vx: c.vx * 0.992,
            x: c.x + c.vx,
            y: c.y + c.vy,
            rot: c.rot + c.rotV,
            life: c.life + 1,
          }))
          .filter((c) => c.life < c.maxLife)
      );
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [chips.length]);

  const explode = (ev: React.MouseEvent | React.TouchEvent) => {
    if (exploding) return;
    const body = bodyRef.current;
    if (!body) return;
    const rect = body.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const newChips: Chip[] = [];
    const count = 22;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 9;
      newChips.push({
        id: Date.now() + i,
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4, // initial upward thrust
        rot: Math.random() * Math.PI * 2,
        rotV: (Math.random() - 0.5) * 0.35,
        color: CHIP_COLORS[(Math.random() * CHIP_COLORS.length) | 0],
        life: 0,
        maxLife: 65 + Math.floor(Math.random() * 40),
      });
    }
    setChips((c) => [...c, ...newChips]);
    setExploding(true);
    // Also fire the global confetti burst for the spider-glyph layer
    try {
      window.dispatchEvent(
        new CustomEvent('spiderspins:burst', {
          detail: { x: cx, y: cy, dist: 900 },
        })
      );
    } catch {}
    // Respawn after 1.6s
    window.setTimeout(() => setExploding(false), 1600);
  };

  return (
    <>
      <div
        ref={wrapRef}
        aria-hidden
        className="scroll-spider"
        style={
          {
            '--sy': '-10vh',
            '--tl': '0vh',
            '--sx': '0px',
          } as React.CSSProperties
        }
      >
        <span className="scroll-spider-thread" />
        <span
          ref={bodyRef}
          className={[
            'scroll-spider-body pointer-events-auto cursor-pointer transition-opacity duration-500',
            exploding ? 'opacity-0' : 'opacity-100',
          ].join(' ')}
          onClick={explode}
          onTouchStart={explode}
          role="button"
          aria-label="Tap to explode spider into casino chips"
          title="Tap the spider"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
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
            <path d="M10.5 13 L13.5 13 L11.5 15 L12.5 15 L10.5 17 L13.5 17" stroke="#ef4444" strokeWidth="0.9" fill="none" />
          </svg>
        </span>
      </div>

      {/* Casino chips flying */}
      {chips.length > 0 && (
        <div
          aria-hidden
          className="fixed inset-0 pointer-events-none z-[46]"
          style={{ overflow: 'hidden' }}
        >
          {chips.map((c) => {
            const life01 = c.life / c.maxLife;
            const alpha = Math.pow(1 - life01, 1.8);
            return (
              <span
                key={c.id}
                style={{
                  position: 'absolute',
                  left: c.x - 8,
                  top: c.y - 8,
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background:
                    c.color === '#050505'
                      ? 'radial-gradient(circle at 35% 35%, #222, #050505)'
                      : `radial-gradient(circle at 35% 35%, ${c.color}cc, ${c.color})`,
                  boxShadow: `0 0 6px ${c.color}88, inset 0 0 4px rgba(0,0,0,0.6)`,
                  border: '1.5px solid rgba(255,255,255,0.15)',
                  opacity: alpha,
                  transform: `rotate(${c.rot}rad)`,
                  willChange: 'transform, opacity',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    inset: '3px',
                    borderRadius: '50%',
                    border: '1px dashed rgba(255,255,255,0.35)',
                  }}
                />
              </span>
            );
          })}
        </div>
      )}
    </>
  );
}
