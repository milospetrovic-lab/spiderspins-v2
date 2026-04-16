'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import FunModeModal from './FunModeModal';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

type Game = {
  name: string;
  tag: string;
  rtp: string;
  volatility: 'Low' | 'Medium' | 'High' | 'Extreme';
  hue: number; // base hue for generated art
  accent: string;
  theme: 'web' | 'fang' | 'silk' | 'hourglass';
  image?: string; // prototype-only: path to real provider art
};

const featured: Game = {
  name: "Widow's Web",
  tag: 'Featured · Slot',
  rtp: '96.8%',
  volatility: 'High',
  hue: 0,
  accent: '#ef4444',
  theme: 'web',
  image: '/games/fat-cat.jpg',
};

const supporting: Game[] = [
  {
    name: 'Silk Fortune',
    tag: 'Slot',
    rtp: '97.1%',
    volatility: 'Low',
    hue: 0,
    accent: '#e8e8e8',
    theme: 'silk',
    image: '/games/gemtopia.webp',
  },
  {
    name: 'Fang Frenzy',
    tag: 'Table',
    rtp: '96.2%',
    volatility: 'Medium',
    hue: 0,
    accent: '#b91c1c',
    theme: 'fang',
    image: '/games/buffalo-mania.webp',
  },
  {
    name: 'Hourglass Hunt',
    tag: 'Jackpot',
    rtp: '96.5%',
    volatility: 'Extreme',
    hue: 0,
    accent: '#c4a265',
    theme: 'hourglass',
    image: '/games/fire-dragon.webp',
  },
];

function GameArt({ theme, accent, large }: { theme: Game['theme']; accent: string; large?: boolean }) {
  // Generated SVG "poster" per theme — soft gradients, shapes, scan lines
  return (
    <svg
      viewBox="0 0 600 400"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 w-full h-full"
      aria-hidden
    >
      <defs>
        <radialGradient id={`gradA-${theme}`} cx="70%" cy="30%" r="60%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.55" />
          <stop offset="60%" stopColor={accent} stopOpacity="0.1" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`gradB-${theme}`} cx="20%" cy="80%" r="70%">
          <stop offset="0%" stopColor="#b91c1c" stopOpacity="0.32" />
          <stop offset="60%" stopColor="#500505" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#050505" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`scan-${theme}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#e8e8e8" stopOpacity="0" />
          <stop offset="50%" stopColor="#e8e8e8" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#e8e8e8" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* background gradient field */}
      <rect width="600" height="400" fill="#0a0a0a" />
      <rect width="600" height="400" fill={`url(#gradA-${theme})`} />
      <rect width="600" height="400" fill={`url(#gradB-${theme})`} />

      {/* theme-specific art */}
      {theme === 'web' && (
        <g>
          <g fill="none" stroke={accent} strokeWidth="0.5" opacity="0.55">
            {Array.from({ length: 18 }).map((_, i) => {
              const a = (i / 18) * Math.PI * 2;
              return (
                <line
                  key={i}
                  x1="420"
                  y1="160"
                  x2={420 + Math.cos(a) * 420}
                  y2={160 + Math.sin(a) * 420}
                />
              );
            })}
            {[40, 80, 130, 200, 290].map((r) => (
              <circle key={r} cx="420" cy="160" r={r} />
            ))}
          </g>
          <circle cx="420" cy="160" r="3" fill={accent} />
        </g>
      )}

      {theme === 'silk' && (
        <g fill="none" stroke="#aaa" strokeWidth="0.5" opacity="0.6">
          {Array.from({ length: 10 }).map((_, i) => (
            <path
              key={i}
              d={`M ${-60 + i * 80} 0 Q ${-30 + i * 80} 200 ${60 + i * 80} 400`}
            />
          ))}
        </g>
      )}

      {theme === 'fang' && (
        <g fill="none" stroke={accent} strokeWidth="0.6" opacity="0.6">
          <path d="M200 80 L300 320 L400 80" />
          <path d="M220 80 L300 270 L380 80" strokeWidth="0.4" />
          <path d="M250 80 L300 210 L350 80" strokeWidth="0.3" />
          <circle cx="300" cy="330" r="5" fill={accent} stroke="none" />
        </g>
      )}

      {theme === 'hourglass' && (
        <g fill="none" stroke={accent} strokeWidth="0.6" opacity="0.65">
          <path d="M180 80 L420 80 L300 200 L420 320 L180 320 L300 200 Z" />
          <circle cx="300" cy="200" r="5" fill={accent} stroke="none" />
          <path d="M220 80 L380 80 L300 180 L380 320 L220 320 L300 220 Z" strokeWidth="0.3" />
        </g>
      )}

      {/* scan band */}
      <rect
        x="0"
        y="0"
        width="600"
        height="160"
        fill={`url(#scan-${theme})`}
        className="scan-band"
        style={{ transformOrigin: 'center' }}
      />

      {/* fine grid tics */}
      <g opacity="0.18">
        {Array.from({ length: 10 }).map((_, i) => (
          <line
            key={i}
            x1={30 + i * 58}
            y1="380"
            x2={30 + i * 58}
            y2={i % 3 === 0 ? 370 : 375}
            stroke="#aaa"
            strokeWidth="0.4"
          />
        ))}
      </g>
    </svg>
  );
}

function VolPips({ level }: { level: Game['volatility'] }) {
  const count = level === 'Low' ? 1 : level === 'Medium' ? 2 : level === 'High' ? 3 : 4;
  return (
    <span className="inline-flex gap-[3px] items-center">
      {[1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className={[
            'block w-1 h-1 rounded-full',
            i <= count ? 'bg-strike' : 'bg-web',
          ].join(' ')}
        />
      ))}
    </span>
  );
}

function Card({
  game,
  featured: isFeatured,
  onTryFree,
}: {
  game: Game;
  featured?: boolean;
  onTryFree?: (g: Game) => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    if (!mq.matches) return;
    let rx = 0;
    let ry = 0;
    let tx = 0;
    let ty = 0;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      tx = -py * 6; // dampened to 6deg
      ty = px * 6;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onLeave = () => {
      tx = 0;
      ty = 0;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const tick = () => {
      rx += (tx - rx) * 0.1;
      ry += (ty - ry) * 0.1;
      el.style.transform = `perspective(1400px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
      if (Math.abs(tx - rx) > 0.05 || Math.abs(ty - ry) > 0.05) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
      }
    };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={[
        'game-card group relative rounded-2xl overflow-hidden border border-web-light/40 bg-cave/55 backdrop-blur-sm will-change-transform transition-[box-shadow,border-color] duration-300',
        isFeatured ? 'aspect-[16/9] md:aspect-[24/9]' : 'aspect-[4/5]',
      ].join(' ')}
      style={{
        transformStyle: 'preserve-3d',
        boxShadow: isFeatured
          ? '0 20px 50px -30px rgba(185,28,28,0.55), inset 0 0 40px rgba(185,28,28,0.06)'
          : '0 10px 30px -20px rgba(0,0,0,0.8)',
      }}
    >
      {/* art — Next Image (auto WebP/AVIF + responsive) when available, else generated SVG */}
      {game.image ? (
        <>
          <Image
            src={game.image}
            alt=""
            aria-hidden
            fill
            sizes={isFeatured
              ? '(max-width: 768px) 100vw, 1100px'
              : '(max-width: 768px) 100vw, 360px'}
            className="object-cover opacity-75 transition-opacity duration-400 group-hover:opacity-90"
            loading="lazy"
          />
          {/* brand-tint overlay so provider art reads as ours */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `linear-gradient(160deg, ${game.accent}33 0%, rgba(5,5,5,0.15) 38%, rgba(5,5,5,0.88) 100%)`,
              mixBlendMode: 'multiply',
            }}
          />
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(180deg, rgba(5,5,5,0) 40%, rgba(5,5,5,0.72) 85%, rgba(5,5,5,0.92) 100%)',
            }}
          />
        </>
      ) : (
        <GameArt theme={game.theme} accent={game.accent} large={isFeatured} />
      )}

      {/* HUD frame */}
      <span className="gc-corner tl" />
      <span className="gc-corner tr" />
      <span className="gc-corner bl" />
      <span className="gc-corner br" />

      {/* content */}
      <div className="relative h-full p-5 md:p-6 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-silk-dim">
            {game.tag}
          </span>
          {isFeatured && (
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-strike flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-strike shadow-[0_0_8px_#ef4444] animate-pulse" />
              Live
            </span>
          )}
        </div>

        <div>
          <h3
            className={[
              'font-display font-extrabold text-silk leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]',
              isFeatured ? 'text-3xl md:text-5xl' : 'text-xl md:text-2xl',
            ].join(' ')}
          >
            {game.name}
          </h3>
          <div className="mt-3 flex items-center gap-3 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-web/70 bg-void/60 backdrop-blur-sm">
              <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-shadow">
                RTP
              </span>
              <span className="font-mono text-xs text-silk">{game.rtp}</span>
            </span>
            <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md border border-web/70 bg-void/60 backdrop-blur-sm">
              <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-shadow">
                Vol
              </span>
              <span className="font-mono text-xs text-silk-dim">
                {game.volatility}
              </span>
              <VolPips level={game.volatility} />
            </span>
          </div>
        </div>

        <div className="absolute bottom-5 right-5 flex items-center gap-2 opacity-0 translate-y-2 transition-all duration-300 gc-play">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              if (onTryFree) onTryFree(game);
            }}
            className="hover-target inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-web-light/70 hover:border-silk/80 text-silk-dim hover:text-silk font-display text-[11px] uppercase tracking-[0.2em] transition-colors"
          >
            Try free
          </button>
          <a
            href="#cashier"
            className="hover-target inline-flex items-center gap-2 px-4 py-2 rounded-full border border-strike/60 bg-strike/10 text-strike font-display text-xs uppercase tracking-[0.22em]"
          >
            Play now
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}

export default function GameCards() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [funGame, setFunGame] = useState<Game | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      gsap.from(section.querySelectorAll('.gc-reveal'), {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: { trigger: section, start: 'top 82%' },
      });
      gsap.from(section.querySelectorAll('.game-card'), {
        y: 50,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.18,
        scrollTrigger: { trigger: section, start: 'top 72%' },
      });
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="games" className="relative z-10 py-24 md:py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 md:mb-14 flex items-end justify-between flex-wrap gap-4">
          <div>
            <p className="gc-reveal font-mono text-silk-dim text-[11px] uppercase tracking-[0.42em] mb-3">
              Spinnerets live
            </p>
            <h2 className="gc-reveal font-display font-black text-silk leading-[0.95] text-[clamp(2rem,6vw,4.2rem)]">
              The web catches <span className="text-strike">everything</span>.
            </h2>
            <p className="gc-reveal mt-4 max-w-xl font-display font-light text-silk-dim text-base md:text-lg">
              Generated art. Real math. Hover a card to see the details — the silk stays out of the way.
            </p>
          </div>
          <a
            href="#all-games"
            className="gc-reveal hover-target font-mono text-[11px] uppercase tracking-[0.28em] text-silk-dim hover:text-strike transition-colors"
          >
            All games →
          </a>
        </div>

        <div className="mb-5 md:mb-6">
          <Card game={featured} featured onTryFree={setFunGame} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {supporting.map((g) => (
            <Card key={g.name} game={g} onTryFree={setFunGame} />
          ))}
        </div>
      </div>

      <FunModeModal
        open={!!funGame}
        game={funGame}
        onClose={() => setFunGame(null)}
      />
    </section>
  );
}
