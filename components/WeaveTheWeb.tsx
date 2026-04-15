'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type Anchor = {
  id: number;
  angle: number;
  radius: number;
  x: number;
  y: number;
  broken: boolean;
  patched: boolean;
};

const GAME_SECONDS = 22;
const RING_COUNT = 3;

function buildAnchors(size: number): Anchor[] {
  const cx = size / 2;
  const cy = size / 2;
  const anchors: Anchor[] = [];
  let id = 0;
  for (let r = 1; r <= RING_COUNT; r++) {
    const radius = (r / RING_COUNT) * (size * 0.42);
    const spokes = 6 + r * 2; // 8, 10, 12
    for (let s = 0; s < spokes; s++) {
      const angle = (s / spokes) * Math.PI * 2 + r * 0.18;
      anchors.push({
        id: id++,
        angle,
        radius,
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
        broken: Math.random() < 0.55,
        patched: false,
      });
    }
  }
  return anchors;
}

export default function WeaveTheWeb() {
  const [size, setSize] = useState(420);
  const [anchors, setAnchors] = useState<Anchor[]>([]);
  const [status, setStatus] = useState<'ready' | 'playing' | 'won' | 'lost'>('ready');
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const [streak, setStreak] = useState(0);
  const timerRef = useRef<number | null>(null);

  const brokenTotal = useMemo(
    () => anchors.filter((a) => a.broken).length,
    [anchors]
  );
  const patchedTotal = useMemo(
    () => anchors.filter((a) => a.broken && a.patched).length,
    [anchors]
  );

  // Responsive size
  useEffect(() => {
    const sync = () => {
      const cap = Math.min(window.innerWidth - 48, 520);
      setSize(Math.max(300, cap));
    };
    sync();
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, []);

  // Rebuild anchors whenever size changes
  useEffect(() => {
    if (status === 'playing') return; // don't reshuffle mid-game
    setAnchors(buildAnchors(size));
  }, [size, status]);

  // Win condition
  useEffect(() => {
    if (status !== 'playing') return;
    if (brokenTotal > 0 && patchedTotal === brokenTotal) {
      setStatus('won');
      if (timerRef.current) window.clearInterval(timerRef.current);
      try {
        window.dispatchEvent(
          new CustomEvent('spiderspins:burst', {
            detail: {
              x: window.innerWidth / 2,
              y: window.innerHeight / 2,
              dist: 1400,
            },
          })
        );
      } catch {}
    }
  }, [patchedTotal, brokenTotal, status]);

  const start = () => {
    setAnchors(buildAnchors(size));
    setStreak(0);
    setTimeLeft(GAME_SECONDS);
    setStatus('playing');
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (timerRef.current) window.clearInterval(timerRef.current);
          setStatus('lost');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const reset = () => {
    setStatus('ready');
    setTimeLeft(GAME_SECONDS);
    setStreak(0);
    if (timerRef.current) window.clearInterval(timerRef.current);
    setAnchors(buildAnchors(size));
  };

  const tap = (id: number) => {
    if (status !== 'playing') return;
    setAnchors((arr) => {
      const next = arr.map((a) => {
        if (a.id !== id) return a;
        if (!a.broken || a.patched) return a;
        return { ...a, patched: true };
      });
      return next;
    });
    setStreak((s) => s + 1);
  };

  const cx = size / 2;
  const cy = size / 2;

  return (
    <div className="mt-10 flex flex-col items-center gap-4">
      {/* HUD */}
      <div className="flex items-center gap-4 font-mono text-[11px] uppercase tracking-[0.28em]">
        <span className="text-silk-dim">Time</span>
        <span
          className={[
            'font-bold tabular-nums',
            timeLeft < 6 ? 'text-strike' : 'text-silk',
          ].join(' ')}
          style={{
            textShadow: timeLeft < 6 ? '0 0 10px rgba(239,68,68,0.6)' : 'none',
          }}
        >
          {timeLeft.toString().padStart(2, '0')}s
        </span>
        <span className="text-shadow">·</span>
        <span className="text-silk-dim">Patched</span>
        <span className="text-strike font-bold tabular-nums">
          {patchedTotal} / {brokenTotal}
        </span>
        <span className="text-shadow">·</span>
        <span className="text-silk-dim">Streak</span>
        <span className="text-fang font-bold tabular-nums">{streak}</span>
      </div>

      {/* Stage */}
      <div
        className="relative rounded-2xl border border-web/60 bg-cave/40"
        style={{ width: size, height: size }}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="block"
          style={{ touchAction: 'manipulation' }}
        >
          <defs>
            <radialGradient id="weaveGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(185,28,28,0.22)" />
              <stop offset="70%" stopColor="rgba(185,28,28,0)" />
            </radialGradient>
          </defs>
          <circle cx={cx} cy={cy} r={size * 0.45} fill="url(#weaveGlow)" />

          {/* Base web rings */}
          {[0.2, 0.3, 0.42].map((r, i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={size * r}
              fill="none"
              stroke="#2a2a2a"
              strokeWidth="1"
            />
          ))}

          {/* Spokes — solid where patched, dashed where not */}
          {anchors.map((a) => {
            const intact = !a.broken || a.patched;
            return (
              <line
                key={'spoke-' + a.id}
                x1={cx}
                y1={cy}
                x2={a.x}
                y2={a.y}
                stroke={intact ? '#aaa' : '#333'}
                strokeWidth={intact ? 0.9 : 0.6}
                strokeDasharray={intact ? undefined : '4 5'}
                opacity={intact ? 0.75 : 0.4}
              />
            );
          })}

          {/* Anchors */}
          {anchors.map((a) => {
            const isPatchedBroken = a.broken && a.patched;
            const isBroken = a.broken && !a.patched;
            const fill = isBroken
              ? '#ef4444'
              : isPatchedBroken
              ? '#c4a265'
              : '#888';
            const r = isBroken ? 6 : 4.2;
            return (
              <g
                key={'a-' + a.id}
                onPointerDown={() => tap(a.id)}
                style={{
                  cursor: isBroken && status === 'playing' ? 'pointer' : 'default',
                }}
              >
                {isBroken && (
                  <circle
                    cx={a.x}
                    cy={a.y}
                    r={r * 2.4}
                    fill="rgba(239,68,68,0.22)"
                  >
                    <animate
                      attributeName="r"
                      values={`${r * 1.6};${r * 2.8};${r * 1.6}`}
                      dur="1.6s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.22;0.05;0.22"
                      dur="1.6s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
                <circle
                  cx={a.x}
                  cy={a.y}
                  r={r}
                  fill={fill}
                  stroke={isPatchedBroken ? '#c4a265' : 'none'}
                  strokeWidth={isPatchedBroken ? 1 : 0}
                  style={{
                    filter: isBroken
                      ? 'drop-shadow(0 0 6px rgba(239,68,68,0.6))'
                      : isPatchedBroken
                      ? 'drop-shadow(0 0 6px rgba(196,162,101,0.6))'
                      : 'none',
                  }}
                />
              </g>
            );
          })}

          {/* Center spider */}
          <g transform={`translate(${cx}, ${cy})`}>
            <g stroke="#e8e8e8" strokeWidth="1" strokeLinecap="round">
              <path d="M0 0 L-10 -7 L-13 -5" />
              <path d="M0 0 L-12 -1 L-15 1" />
              <path d="M0 0 L-12 5 L-15 7" />
              <path d="M0 0 L-9 9 L-12 11" />
              <path d="M0 0 L10 -7 L13 -5" />
              <path d="M0 0 L12 -1 L15 1" />
              <path d="M0 0 L12 5 L15 7" />
              <path d="M0 0 L9 9 L12 11" />
            </g>
            <circle cx="0" cy="-3.5" r="2.6" fill="#050505" stroke="#e8e8e8" strokeWidth="0.7" />
            <ellipse cx="0" cy="3.5" rx="4.2" ry="5" fill="#050505" stroke="#e8e8e8" strokeWidth="0.7" />
            <path d="M-2 2 L2 2 L-1 5 L1 5 L-2 8 L2 8" stroke="#ef4444" strokeWidth="1" fill="none" />
          </g>
        </svg>

        {/* Overlay state panels */}
        {status === 'ready' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-void/75 backdrop-blur-sm rounded-2xl text-center px-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-silk-dim mb-2">
              Mini-game · demo
            </div>
            <div className="font-display font-extrabold text-silk text-2xl md:text-3xl leading-tight mb-2">
              Weave the Web
            </div>
            <p className="text-silk-dim text-sm max-w-xs leading-relaxed mb-5">
              Tap every red anchor before time runs out. Patch them all and
              the silk rewards you.
            </p>
            <button
              onClick={start}
              className="hover-target inline-flex items-center px-6 py-3 bg-venom hover:bg-strike transition-colors text-silk font-display uppercase tracking-[0.2em] text-xs shadow-strike-glow"
            >
              Start · {GAME_SECONDS}s
            </button>
          </div>
        )}

        {status === 'won' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-void/82 backdrop-blur-sm rounded-2xl text-center px-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-fang mb-2">
              ● web restored
            </div>
            <div className="font-display font-extrabold text-silk text-2xl md:text-3xl leading-tight mb-2">
              The silk holds.
            </div>
            <p className="text-silk-dim text-sm max-w-xs mb-4">
              +50 silk threads credited to your Colony profile (demo).
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={reset}
                className="hover-target inline-flex items-center px-5 py-2.5 border border-strike/60 bg-strike/10 text-strike font-display uppercase tracking-[0.2em] text-xs rounded-md"
              >
                Play again
              </button>
              <a
                href="/"
                className="hover-target inline-flex items-center px-5 py-2.5 border border-web hover:border-web-light text-silk-dim hover:text-silk font-display uppercase tracking-[0.2em] text-xs rounded-md transition-colors"
              >
                Back to web
              </a>
            </div>
          </div>
        )}

        {status === 'lost' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-void/82 backdrop-blur-sm rounded-2xl text-center px-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-strike mb-2">
              ● time's up
            </div>
            <div className="font-display font-extrabold text-silk text-2xl md:text-3xl leading-tight mb-2">
              The web breaks.
            </div>
            <p className="text-silk-dim text-sm max-w-xs mb-4">
              You patched {patchedTotal} of {brokenTotal} anchors. The spider
              is patient — try again.
            </p>
            <button
              onClick={reset}
              className="hover-target inline-flex items-center px-5 py-2.5 border border-strike/60 bg-strike/10 text-strike font-display uppercase tracking-[0.2em] text-xs rounded-md"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-shadow max-w-md text-center">
        Demo — no real stakes. One full web per visit counts toward your Colony reward streak.
      </p>
    </div>
  );
}
