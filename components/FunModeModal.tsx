'use client';

import { useEffect, useRef, useState } from 'react';

// "Practice hunt" — fun/demo mode. Fake slot spin with weighted outcomes.
// Zero stakes. Pure UX hook to let visitors feel a game before depositing.

type Props = {
  open: boolean;
  onClose: () => void;
  game: { name: string; image?: string; accent: string; volatility: string } | null;
};

const SYMBOLS = ['🕷', '🕸', '🩸', '🦴', '⚱', '🗝', '🪙'];
const REELS = 3;

function spinReel(): string {
  return SYMBOLS[(Math.random() * SYMBOLS.length) | 0];
}

export default function FunModeModal({ open, onClose, game }: Props) {
  const [reels, setReels] = useState<string[]>(['🕷', '🕸', '🩸']);
  const [spinning, setSpinning] = useState(false);
  const [silkWon, setSilkWon] = useState(0);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const tickRef = useRef<number | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setReels(['🕷', '🕸', '🩸']);
      setSpinning(false);
      setSilkWon(0);
      setLastResult(null);
    }
  }, [open]);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setLastResult(null);
    const start = performance.now();
    const duration = 1400;
    const tick = () => {
      const t = (performance.now() - start) / duration;
      setReels([spinReel(), spinReel(), spinReel()]);
      if (t < 1) {
        tickRef.current = window.setTimeout(tick, 65);
      } else {
        // final outcome
        const final = [spinReel(), spinReel(), spinReel()];
        // bias: 8% triple match, 22% double match
        const roll = Math.random();
        if (roll < 0.08) {
          const sym = spinReel();
          final[0] = final[1] = final[2] = sym;
        } else if (roll < 0.3) {
          final[1] = final[0];
        }
        setReels(final);
        const triple = final[0] === final[1] && final[1] === final[2];
        const pair = !triple && (final[0] === final[1] || final[1] === final[2]);
        const won = triple ? 250 : pair ? 30 : 0;
        if (won > 0) setSilkWon((s) => s + won);
        setLastResult(
          triple ? `Triple ${final[0]} — +${won} silk` : pair ? `Pair — +${won} silk` : 'The web stays empty'
        );
        setSpinning(false);
        if (triple) {
          try {
            window.dispatchEvent(
              new CustomEvent('spiderspins:burst', {
                detail: {
                  x: window.innerWidth / 2,
                  y: window.innerHeight / 2,
                  dist: 1200,
                },
              })
            );
          } catch {}
        }
      }
    };
    tick();
  };

  useEffect(() => {
    return () => {
      if (tickRef.current) window.clearTimeout(tickRef.current);
    };
  }, []);

  if (!open || !game) return null;

  return (
    <div
      role="dialog"
      aria-label={`Fun mode · ${game.name}`}
      className="fixed inset-0 z-[155] flex items-center justify-center px-4"
    >
      <div
        onClick={onClose}
        aria-hidden
        className="absolute inset-0 bg-void/80 backdrop-blur-md"
        style={{ animation: 'fadeInBackdrop 0.24s ease-out' }}
      />
      <div
        className="relative w-full max-w-lg rounded-2xl border border-web/70 bg-cave/95 overflow-hidden"
        style={{
          boxShadow: `0 30px 80px -30px ${game.accent}a0, inset 0 0 0 1px rgba(34,34,34,0.9)`,
          animation: 'popupEnter 0.3s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        {/* Header */}
        <div className="relative h-36 overflow-hidden">
          {game.image && (
            <img src={game.image} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover opacity-55" />
          )}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, rgba(5,5,5,0.4) 0%, rgba(5,5,5,0.95) 100%)`,
            }}
          />
          <div className="relative h-full flex flex-col justify-end p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-strike shadow-[0_0_8px_#ef4444] animate-pulse" />
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-strike">Practice hunt</span>
              <span className="font-mono text-[10px] text-shadow">·</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-silk-dim">Vol · {game.volatility}</span>
            </div>
            <h3 className="font-display font-extrabold text-silk text-2xl md:text-3xl">{game.name}</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="hover-target absolute top-3 right-3 w-8 h-8 rounded-md border border-web hover:border-strike/60 bg-void/60 text-silk-dim hover:text-strike flex items-center justify-center transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6l-12 12" />
            </svg>
          </button>
        </div>

        {/* Slot stage */}
        <div className="p-6">
          <div className="rounded-xl border border-web/70 bg-void/60 p-5 grid grid-cols-3 gap-3">
            {reels.map((s, i) => (
              <div
                key={i}
                className="aspect-square rounded-lg border border-web/70 bg-cave/80 flex items-center justify-center text-5xl transition-transform duration-200"
                style={{
                  transform: spinning ? `translateY(${(i + 1) * 2}px)` : 'translateY(0)',
                  filter: spinning ? 'blur(1px)' : 'none',
                  boxShadow: spinning ? `0 0 24px -8px ${game.accent}66 inset` : 'none',
                }}
              >
                <span style={{ filter: 'drop-shadow(0 0 6px rgba(239,68,68,0.35))' }}>{s}</span>
              </div>
            ))}
          </div>

          {/* Result */}
          <div className="mt-4 h-6 text-center font-mono text-[11px] uppercase tracking-[0.28em]">
            {lastResult ? (
              <span className={lastResult.startsWith('The') ? 'text-silk-dim' : 'text-strike'}>{lastResult}</span>
            ) : (
              <span className="text-shadow">Silk earned this session</span>
            )}
          </div>

          {/* Stats */}
          <div className="mt-2 flex items-center justify-center gap-5 font-mono text-[11px]">
            <span className="text-silk-dim uppercase tracking-[0.28em]">Silk</span>
            <span className="text-strike font-bold text-lg tabular-nums">{silkWon}</span>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={spin}
              disabled={spinning}
              className="hover-target flex-1 py-3 rounded-md bg-venom hover:bg-strike transition-colors text-silk font-display uppercase tracking-[0.22em] text-xs shadow-strike-glow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {spinning ? 'Spinning…' : 'Spin (demo)'}
            </button>
            <a
              href="#cashier"
              onClick={onClose}
              className="hover-target py-3 px-4 rounded-md border border-strike/60 bg-strike/10 hover:bg-strike/20 text-strike font-display uppercase tracking-[0.22em] text-xs transition-colors"
            >
              Play for real
            </a>
          </div>

          <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.28em] text-shadow text-center">
            Demo mode — no funds at stake · math mirrors the live game
          </p>
        </div>
      </div>
    </div>
  );
}
