'use client';

import { useEffect, useRef } from 'react';

// Lightweight global particle layer for mobile. Fills the dark gaps between
// sections (user feedback: "mobile is black between sections"). Fixed to the
// viewport, single 2D canvas, ~28 red embers drifting upward. ~400 ops/frame.
//
// Skips on desktop (AmbientParticles + ParticleField3D cover that) and on
// reduced-motion users. Pauses on tab hide.

type P = { x: number; y: number; vx: number; vy: number; size: number; hue: number };

const COUNT = 28;

export default function GlobalParticles() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      // Touch-only — desktop has heavier particle systems already.
      if (!window.matchMedia('(hover: none), (pointer: coarse)').matches) return;
    } catch {
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = 0;
    let h = 0;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const particles: P[] = [];
    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.15,
        vy: -(0.12 + Math.random() * 0.2),
        size: 1.2 + Math.random() * 2.4,
        hue: Math.random() < 0.85 ? 0 : 30, // mostly red, occasional gold
      });
    }

    let raf = 0;
    let visible = !document.hidden;

    const tick = () => {
      if (!visible) {
        raf = 0;
        return;
      }
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        // re-spawn at bottom when reaches top
        if (p.y < -10) {
          p.y = h + 10;
          p.x = Math.random() * w;
        }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;

        // halo
        const haloColor =
          p.hue === 0 ? 'rgba(239,68,68,0.14)' : 'rgba(196,162,101,0.12)';
        ctx.fillStyle = haloColor;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3.5, 0, Math.PI * 2);
        ctx.fill();

        // core
        const coreColor =
          p.hue === 0 ? 'rgba(239,68,68,0.85)' : 'rgba(196,162,101,0.85)';
        ctx.fillStyle = coreColor;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onVis = () => {
      if (document.hidden) {
        visible = false;
      } else {
        visible = true;
        if (!raf) raf = requestAnimationFrame(tick);
      }
    };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="fixed inset-0 pointer-events-none z-[1]"
    />
  );
}
