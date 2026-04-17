'use client';

import { useEffect, useRef, useState } from 'react';

// Fixed-position reward orb in the upper-right corner.
// Click -> scrolls to #cashier (deposit). Hover -> 3D lean toward the cursor.
// Animated rotating silk ring + pulsing strike-red glow.

const TOTAL_REWARDS = 8000;

export default function RewardOrb() {
  const rootRef = useRef<HTMLAnchorElement | null>(null);
  const [remains, setRemains] = useState(TOTAL_REWARDS);

  useEffect(() => {
    // Ambient tick — one reward claimed every ~18s while the page is visible.
    // Purely visual; when hidden, freeze so the number doesn't scroll silently.
    let id: ReturnType<typeof setInterval> | null = null;
    const start = () => {
      if (id) return;
      id = setInterval(() => {
        setRemains((r) => (r > 7400 ? r - 1 : r));
      }, 18000);
    };
    const stop = () => {
      if (id) {
        clearInterval(id);
        id = null;
      }
    };
    const onVis = () => {
      if (document.hidden) stop();
      else start();
    };
    start();
    document.addEventListener('visibilitychange', onVis);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    // Skip lean effect for touch / reduced-motion users
    let touch = false;
    try {
      touch =
        window.matchMedia('(hover: none), (pointer: coarse)').matches ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {}
    if (touch) return;

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = (e.clientX - cx) / r.width; // -0.5..0.5
      const dy = (e.clientY - cy) / r.height;
      // Lean: tilt up to 18 degrees toward cursor
      const rx = (-dy * 18).toFixed(2);
      const ry = (dx * 18).toFixed(2);
      el.style.setProperty('--lean-rx', rx + 'deg');
      el.style.setProperty('--lean-ry', ry + 'deg');
    };
    const onLeave = () => {
      el.style.setProperty('--lean-rx', '0deg');
      el.style.setProperty('--lean-ry', '0deg');
    };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <a
      ref={rootRef}
      href="#cashier"
      aria-label="Claim 20% reward — deposit now"
      className="reward-orb hover-target"
      style={{
        // Sits below the nav (nav is ~64px tall) and above ScrollProgress
        position: 'fixed',
        top: 84,
        right: 18,
        zIndex: 78,
        width: 112,
        height: 112,
        transform:
          'perspective(600px) rotateX(var(--lean-rx, 0deg)) rotateY(var(--lean-ry, 0deg))',
        transformStyle: 'preserve-3d',
        transition: 'transform 240ms ease-out',
        cursor: 'pointer',
        textDecoration: 'none',
      }}
    >
      {/* Outer glow halo */}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          inset: -12,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(239,68,68,0.45) 0%, rgba(239,68,68,0) 70%)',
          filter: 'blur(4px)',
          pointerEvents: 'none',
        }}
        className="reward-orb__halo"
      />
      {/* Rotating silk ring */}
      <svg
        viewBox="0 0 120 120"
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          animation: 'rewardSpin 14s linear infinite',
        }}
      >
        <defs>
          <linearGradient id="orbRing" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#EF4444" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#B91C1C" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#EF4444" stopOpacity="0.95" />
          </linearGradient>
        </defs>
        <circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke="url(#orbRing)"
          strokeWidth="1.4"
          strokeDasharray="4 8"
          strokeLinecap="round"
        />
        <circle cx="60" cy="60" r="46" fill="none" stroke="rgba(239,68,68,0.22)" strokeWidth="0.8" />
      </svg>
      {/* Inner disc */}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          inset: 10,
          borderRadius: '50%',
          background:
            'radial-gradient(circle at 30% 25%, #1a0a0a 0%, #050505 70%)',
          boxShadow:
            'inset 0 0 20px rgba(239,68,68,0.35), 0 0 24px rgba(239,68,68,0.35)',
          border: '1px solid rgba(239,68,68,0.55)',
        }}
      />
      {/* Text content */}
      <span
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          pointerEvents: 'none',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-outfit, system-ui)',
            fontWeight: 900,
            fontSize: 20,
            lineHeight: 1,
            color: '#EF4444',
            letterSpacing: '0.02em',
            textShadow: '0 0 8px rgba(239,68,68,0.6)',
          }}
        >
          20%
        </span>
        <span
          style={{
            fontFamily: 'var(--font-space-mono, monospace)',
            fontSize: 8,
            letterSpacing: '0.22em',
            color: '#aaa',
            textTransform: 'uppercase',
            marginTop: 1,
          }}
        >
          Reward
        </span>
        <span
          style={{
            fontFamily: 'var(--font-space-mono, monospace)',
            fontSize: 9,
            color: '#e8e8e8',
            marginTop: 4,
            fontWeight: 700,
            letterSpacing: '0.05em',
          }}
        >
          {remains.toLocaleString()}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-space-mono, monospace)',
            fontSize: 7,
            letterSpacing: '0.22em',
            color: '#666',
            textTransform: 'uppercase',
          }}
        >
          Remains
        </span>
      </span>

      {/* Mini BTC icon bottom-right — hint about what this unlocks */}
      <span
        aria-hidden
        style={{
          position: 'absolute',
          right: -4,
          bottom: -4,
          width: 26,
          height: 26,
          borderRadius: '50%',
          background: '#F7931A',
          color: '#050505',
          fontSize: 14,
          fontWeight: 900,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid #050505',
          boxShadow: '0 2px 6px rgba(0,0,0,0.6)',
          fontFamily: 'var(--font-outfit, system-ui)',
        }}
      >
        ₿
      </span>

      <style jsx>{`
        @keyframes rewardSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .reward-orb:hover {
          filter: brightness(1.08);
        }
        .reward-orb:hover .reward-orb__halo {
          opacity: 1.35;
        }
        @media (prefers-reduced-motion: reduce) {
          .reward-orb svg { animation: none !important; }
        }
        @media (max-width: 640px) {
          .reward-orb { width: 92px !important; height: 92px !important; top: 72px !important; right: 10px !important; }
        }
      `}</style>
    </a>
  );
}
