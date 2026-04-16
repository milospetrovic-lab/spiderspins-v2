'use client';

import { useEffect, useRef } from 'react';

// Connecting-particle "constellation". Unified visual on both form factors —
// silk-white nodes with silk threads. Mobile just has a lower count + tap
// bursts (radial push) instead of cursor pull.
//
// Single 2D canvas, one rAF loop. Auto-pauses via IntersectionObserver when
// scrolled out of the hero, and on tab hide. Reduced-motion users get nothing.

type P = { x: number; y: number; vx: number; vy: number };
type Burst = { x: number; y: number; t: number };

export default function WebParticleNet() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    let touch = false;
    try {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      touch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
    } catch {}

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Unified palette: silk-white nodes + silk threads.
    // Mobile reduces count + link distance; no cursor interaction but tap
    // triggers a radial burst that nudges nearby nodes outward.
    const COUNT = touch ? 36 : 78;
    const LINK_DIST = touch ? 110 : 130;
    const MOUSE_DIST = 190;
    const NODE_COLOR = 'rgba(232,232,232,0.72)';
    const LINK_COLOR = (a: number) => `rgba(200,200,200,${a.toFixed(3)})`;
    const NODE_RADIUS = 1.4;
    const LINK_WIDTH = 0.55;
    const LINK_ALPHA_MAX = touch ? 0.38 : 0.35;

    const dpr = Math.min(window.devicePixelRatio || 1, touch ? 1.5 : 2);
    let w = 0;
    let h = 0;

    const resize = () => {
      const r = wrap.getBoundingClientRect();
      w = r.width;
      h = r.height;
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
        vx: (Math.random() - 0.5) * (touch ? 0.22 : 0.32),
        vy: (Math.random() - 0.5) * (touch ? 0.22 : 0.32),
      });
    }
    const bursts: Burst[] = [];

    let mouseX = -9999;
    let mouseY = -9999;

    // Mouse interaction only on desktop (touch can't hover)
    const onMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      mouseX = e.clientX - r.left;
      mouseY = e.clientY - r.top;
    };
    const onLeave = () => {
      mouseX = -9999;
      mouseY = -9999;
    };

    let raf = 0;
    let inView = true;

    const tick = () => {
      if (!inView) {
        raf = 0;
        return;
      }
      ctx.clearRect(0, 0, w, h);

      // decay tap bursts
      for (let i = bursts.length - 1; i >= 0; i--) {
        bursts[i].t += 1;
        if (bursts[i].t > 60) bursts.splice(i, 1);
      }

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        // mouse pull (desktop only)
        if (!touch && mouseX > -1000) {
          const mdx = mouseX - p.x;
          const mdy = mouseY - p.y;
          const md = Math.hypot(mdx, mdy);
          if (md < MOUSE_DIST && md > 0) {
            const f = (1 - md / MOUSE_DIST) * 0.18;
            p.x += (mdx / md) * f;
            p.y += (mdy / md) * f;
          }
        }

        // tap-burst push (touch): radial shove, decays with burst age
        for (const b of bursts) {
          const bdx = p.x - b.x;
          const bdy = p.y - b.y;
          const bd = Math.hypot(bdx, bdy);
          const reach = 150;
          if (bd < reach && bd > 0) {
            const decay = 1 - b.t / 60;
            const f = (1 - bd / reach) * 1.2 * decay;
            p.x += (bdx / bd) * f;
            p.y += (bdy / bd) * f;
          }
        }

        ctx.fillStyle = NODE_COLOR;
        ctx.beginPath();
        ctx.arc(p.x, p.y, NODE_RADIUS, 0, Math.PI * 2);
        ctx.fill();
      }

      // inter-particle silk threads
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK_DIST * LINK_DIST) {
            const d = Math.sqrt(d2);
            const alpha = (1 - d / LINK_DIST) * LINK_ALPHA_MAX;
            ctx.strokeStyle = LINK_COLOR(alpha);
            ctx.lineWidth = LINK_WIDTH;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        // red silk thread to cursor (desktop only)
        if (!touch && mouseX > -1000) {
          const cdx = a.x - mouseX;
          const cdy = a.y - mouseY;
          const cd = Math.hypot(cdx, cdy);
          if (cd < MOUSE_DIST) {
            const alpha = (1 - cd / MOUSE_DIST) * 0.85;
            ctx.strokeStyle = `rgba(239,68,68,${alpha.toFixed(3)})`;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(mouseX, mouseY);
            ctx.stroke();
          }
        }
      }

      // red dew at cursor (desktop only)
      if (!touch && mouseX > -1000) {
        ctx.fillStyle = 'rgba(239,68,68,0.85)';
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(239,68,68,0.18)';
        ctx.beginPath();
        ctx.arc(mouseX, mouseY, 12, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // pause when scrolled out of hero
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            if (!inView) {
              inView = true;
              if (!raf) raf = requestAnimationFrame(tick);
            }
          } else {
            inView = false;
          }
        }
      },
      { rootMargin: '50px' }
    );
    io.observe(wrap);

    const onVis = () => {
      if (document.hidden) {
        inView = false;
      } else {
        const r = wrap.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) {
          inView = true;
          if (!raf) raf = requestAnimationFrame(tick);
        }
      }
    };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('resize', resize);

    // Tap-burst listener (touch only) — fires a radial shove at tap point and
    // piggy-backs on the existing spiderspins:burst event so ConfettiCannon
    // gets a small red dew celebration.
    const onTap = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      if (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      ) {
        return;
      }
      bursts.push({ x: e.clientX - r.left, y: e.clientY - r.top, t: 0 });
      if (!raf && inView) raf = requestAnimationFrame(tick);
    };
    if (touch) {
      wrap.addEventListener('pointerdown', onTap);
    } else {
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerleave', onLeave);
    }

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('resize', resize);
      if (touch) {
        wrap.removeEventListener('pointerdown', onTap);
      } else {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerleave', onLeave);
      }
    };
  }, []);

  return (
    <div ref={wrapRef} aria-hidden className="absolute inset-0 pointer-events-none">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
