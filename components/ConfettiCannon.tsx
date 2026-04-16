'use client';

import { useEffect, useRef } from 'react';

// Drag-to-draw silk → release → spider-themed particle burst.
// Custom canvas renderer (not tsparticles) — spider web crosses, mini spiders,
// strike dew dots, and fang triangles in the brand palette.

type Part = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  g: number;
  life: number;
  maxLife: number;
  rot: number;
  rotV: number;
  size: number;
  kind: number; // 0=web, 1=spider, 2=strike dot, 3=fang
  alpha: number;
};

const PALETTE = ['#ef4444', '#b91c1c', '#e8e8e8', '#c4a265'];

function drawGlyph(
  ctx: CanvasRenderingContext2D,
  kind: number,
  size: number,
  color: string
) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.1;
  switch (kind) {
    case 0: {
      // web cross — classic spider-web intersection
      ctx.beginPath();
      ctx.moveTo(-size, 0);
      ctx.lineTo(size, 0);
      ctx.moveTo(0, -size);
      ctx.lineTo(0, size);
      ctx.moveTo(-size * 0.7, -size * 0.7);
      ctx.lineTo(size * 0.7, size * 0.7);
      ctx.moveTo(size * 0.7, -size * 0.7);
      ctx.lineTo(-size * 0.7, size * 0.7);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.22, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 1: {
      // mini spider — 6 legs + body + abdomen + red mark
      ctx.lineWidth = 0.9;
      const legs: [number, number][] = [
        [-size * 1.3, -size * 0.9],
        [-size * 1.5, 0],
        [-size * 1.3, size * 0.9],
        [size * 1.3, -size * 0.9],
        [size * 1.5, 0],
        [size * 1.3, size * 0.9],
      ];
      ctx.strokeStyle = color;
      for (const [lx, ly] of legs) {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(lx, ly);
        ctx.stroke();
      }
      // body + abdomen
      ctx.fillStyle = '#050505';
      ctx.beginPath();
      ctx.ellipse(0, 0, size * 0.55, size * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // red hourglass speck
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(0, -size * 0.1, size * 0.12, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 2: {
      // strike dew dot — red dot with halo
      ctx.globalAlpha *= 0.35;
      ctx.beginPath();
      ctx.arc(0, 0, size * 1.9, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha /= 0.35;
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.85, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case 3: {
      // fang triangle — sharp downward wedge
      ctx.beginPath();
      ctx.moveTo(-size, -size);
      ctx.lineTo(size, -size);
      ctx.lineTo(0, size * 1.2);
      ctx.closePath();
      ctx.stroke();
      break;
    }
  }
}

export default function ConfettiCannon({
  scope = 'viewport',
}: {
  scope?: 'section' | 'viewport';
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const particlesRef = useRef<Part[]>([]);
  const rafRef = useRef<number | null>(null);
  const dragRef = useRef<{
    active: boolean;
    x0: number;
    y0: number;
    x: number;
    y: number;
    thread: SVGGElement | null;
    anchor: SVGGElement | null;
  }>({ active: false, x0: 0, y0: 0, x: 0, y: 0, thread: null, anchor: null });

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    const svg = svgRef.current;
    if (!host || !canvas || !svg) return;

    // Touch devices: skip the global drag-to-draw listeners entirely.
    // The pointermove handler firing on every scroll-touch was the main
    // cause of the post-hero scroll lag on mobile. Programmatic burst
    // (via window CustomEvent 'spiderspins:burst') still works.
    let isTouch = false;
    try {
      isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
    } catch {}

    const ctx = canvas.getContext('2d')!;
    const dpr = Math.min(window.devicePixelRatio, 2);

    const resize = () => {
      const r = host.getBoundingClientRect();
      canvas.width = r.width * dpr;
      canvas.height = r.height * dpr;
      canvas.style.width = r.width + 'px';
      canvas.style.height = r.height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      svg.setAttribute('viewBox', `0 0 ${r.width} ${r.height}`);
      svg.style.width = r.width + 'px';
      svg.style.height = r.height + 'px';
    };
    resize();
    window.addEventListener('resize', resize);

    const toLocal = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    const tick = () => {
      const r = host.getBoundingClientRect();
      ctx.clearRect(0, 0, r.width, r.height);
      let alive = 0;
      for (const p of particlesRef.current) {
        if (p.life >= p.maxLife) continue;
        p.life++;
        p.vy += p.g;
        p.vx *= 0.995;
        p.vy *= 0.995;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.rotV;
        const life01 = p.life / p.maxLife;
        const a = Math.pow(1 - life01, 1.8);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = p.alpha * a;
        const color = PALETTE[p.kind % PALETTE.length];
        drawGlyph(ctx, p.kind, p.size, color);
        ctx.restore();
        alive++;
      }
      if (alive > 0) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = null;
      }
    };

    const ensureRaf = () => {
      if (!rafRef.current) rafRef.current = requestAnimationFrame(tick);
    };

    const explode = (cx: number, cy: number, distance: number) => {
      const count = Math.round(Math.max(18, Math.min(160, distance / 3.5)));
      const speedBase = Math.min(22, 5 + distance / 35);
      for (let i = 0; i < count; i++) {
        const ang = Math.random() * Math.PI * 2;
        const speed = speedBase * (0.45 + Math.random() * 1.3);
        // Distribution: 45% webs, 18% dots, 22% fangs, 15% spiders
        const roll = Math.random();
        const kind = roll < 0.45 ? 0 : roll < 0.63 ? 2 : roll < 0.85 ? 3 : 1;
        particlesRef.current.push({
          x: cx,
          y: cy,
          vx: Math.cos(ang) * speed,
          vy: Math.sin(ang) * speed - speedBase * 0.35,
          g: 0.28 + Math.random() * 0.14,
          life: 0,
          maxLife: 80 + Math.random() * 55,
          rot: Math.random() * Math.PI * 2,
          rotV: (Math.random() - 0.5) * 0.26,
          size: 4 + Math.random() * 9,
          kind,
          alpha: 0.92,
        });
      }
      ensureRaf();
    };

    const isTouchDevice = () => {
      try {
        return window.matchMedia('(hover: none), (pointer: coarse)').matches;
      } catch {
        return false;
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        target.closest('a, button, input, select, textarea, [role="button"], label')
      )
        return;
      const r = host.getBoundingClientRect();
      if (
        e.clientX < r.left ||
        e.clientX > r.right ||
        e.clientY < r.top ||
        e.clientY > r.bottom
      )
        return;

      // On touch devices, restrict the cannon to the final CTA section.
      // Desktop users can still drag anywhere.
      if (isTouchDevice()) {
        const cta = document.getElementById('enter');
        if (!cta) return;
        const cr = cta.getBoundingClientRect();
        if (
          e.clientX < cr.left ||
          e.clientX > cr.right ||
          e.clientY < cr.top ||
          e.clientY > cr.bottom
        )
          return;
      }
      const p = toLocal(e);
      const d = dragRef.current;
      d.active = true;
      d.x0 = p.x;
      d.y0 = p.y;
      d.x = p.x;
      d.y = p.y;

      const SVG_NS = 'http://www.w3.org/2000/svg';

      // "Nety" silk thread — group with:
      //   - main dashed silk strand (solid core)
      //   - two ghost parallel strands at perpendicular offsets
      //   - 3 small web-cross glyphs at equal spacing along the path
      // Rebuilt every pointermove.
      const thread = document.createElementNS(SVG_NS, 'g');
      thread.setAttribute('class', 'drag-thread');
      svg.appendChild(thread);
      d.thread = thread;

      // Drag anchor — a radial silk-web node (symmetric, no rotation needed)
      const anchor = document.createElementNS(SVG_NS, 'g');
      anchor.setAttribute('transform', `translate(${p.x}, ${p.y}) scale(1)`);
      anchor.setAttribute('opacity', '0.95');
      anchor.setAttribute(
        'style',
        'filter: drop-shadow(0 0 8px rgba(239,68,68,0.55));'
      );

      const SPOKES = 8;
      // 8 radiating silk threads (unit coords; scale handled by transform)
      for (let i = 0; i < SPOKES; i++) {
        const ang = (i / SPOKES) * Math.PI * 2;
        const x2 = Math.cos(ang) * 9;
        const y2 = Math.sin(ang) * 9;
        const spoke = document.createElementNS(SVG_NS, 'line');
        spoke.setAttribute('x1', '0');
        spoke.setAttribute('y1', '0');
        spoke.setAttribute('x2', x2.toFixed(2));
        spoke.setAttribute('y2', y2.toFixed(2));
        spoke.setAttribute('stroke', '#e8e8e8');
        spoke.setAttribute('stroke-width', '0.7');
        spoke.setAttribute('stroke-linecap', 'round');
        spoke.setAttribute('opacity', '0.75');
        anchor.appendChild(spoke);
      }

      // Outer octagon ring (wine)
      const octPts: string[] = [];
      for (let i = 0; i < SPOKES; i++) {
        const ang = (i / SPOKES) * Math.PI * 2;
        octPts.push(
          `${(Math.cos(ang) * 9).toFixed(2)},${(Math.sin(ang) * 9).toFixed(2)}`
        );
      }
      const outerRing = document.createElementNS(SVG_NS, 'polygon');
      outerRing.setAttribute('points', octPts.join(' '));
      outerRing.setAttribute('fill', 'none');
      outerRing.setAttribute('stroke', '#b91c1c');
      outerRing.setAttribute('stroke-width', '0.9');
      outerRing.setAttribute('stroke-linejoin', 'round');
      outerRing.setAttribute('opacity', '0.9');
      anchor.appendChild(outerRing);

      // Inner octagon ring (strike)
      const innerPts: string[] = [];
      for (let i = 0; i < SPOKES; i++) {
        const ang = (i / SPOKES) * Math.PI * 2;
        innerPts.push(
          `${(Math.cos(ang) * 4.4).toFixed(2)},${(Math.sin(ang) * 4.4).toFixed(2)}`
        );
      }
      const innerRing = document.createElementNS(SVG_NS, 'polygon');
      innerRing.setAttribute('points', innerPts.join(' '));
      innerRing.setAttribute('fill', 'none');
      innerRing.setAttribute('stroke', '#ef4444');
      innerRing.setAttribute('stroke-width', '0.7');
      innerRing.setAttribute('stroke-linejoin', 'round');
      innerRing.setAttribute('opacity', '0.75');
      anchor.appendChild(innerRing);

      // Center red dew drop with soft halo
      const halo = document.createElementNS(SVG_NS, 'circle');
      halo.setAttribute('cx', '0');
      halo.setAttribute('cy', '0');
      halo.setAttribute('r', '3.2');
      halo.setAttribute('fill', '#ef4444');
      halo.setAttribute('opacity', '0.22');
      anchor.appendChild(halo);

      const core = document.createElementNS(SVG_NS, 'circle');
      core.setAttribute('cx', '0');
      core.setAttribute('cy', '0');
      core.setAttribute('r', '1.8');
      core.setAttribute('fill', '#ef4444');
      anchor.appendChild(core);

      svg.appendChild(anchor);
      d.anchor = anchor;
    };

    const SVG_NS = 'http://www.w3.org/2000/svg';

    const rebuildThread = (
      grp: SVGGElement,
      x1: number,
      y1: number,
      x2: number,
      y2: number
    ) => {
      // clear previous children
      while (grp.firstChild) grp.removeChild(grp.firstChild);

      const dx = x2 - x1;
      const dy = y2 - y1;
      const dist = Math.hypot(dx, dy);
      if (dist < 2) return;
      const nx = -dy / dist;
      const ny = dx / dist;
      const off = Math.min(5, 1.5 + dist / 80);

      // Main silk strand (dashed silk-white)
      const main = document.createElementNS(SVG_NS, 'line');
      main.setAttribute('x1', x1.toFixed(1));
      main.setAttribute('y1', y1.toFixed(1));
      main.setAttribute('x2', x2.toFixed(1));
      main.setAttribute('y2', y2.toFixed(1));
      main.setAttribute('stroke', '#e8e8e8');
      main.setAttribute('stroke-width', '1.1');
      main.setAttribute('stroke-dasharray', '5 3');
      main.setAttribute('stroke-linecap', 'round');
      main.setAttribute('opacity', '0.9');
      grp.appendChild(main);

      // Two ghost strands offset perpendicular to the main line
      for (const sign of [-1, 1]) {
        const ox = nx * off * sign;
        const oy = ny * off * sign;
        const ghost = document.createElementNS(SVG_NS, 'line');
        ghost.setAttribute('x1', (x1 + ox).toFixed(1));
        ghost.setAttribute('y1', (y1 + oy).toFixed(1));
        ghost.setAttribute('x2', (x2 + ox * 0.35).toFixed(1));
        ghost.setAttribute('y2', (y2 + oy * 0.35).toFixed(1));
        ghost.setAttribute('stroke', '#aaaaaa');
        ghost.setAttribute('stroke-width', '0.55');
        ghost.setAttribute('opacity', '0.45');
        grp.appendChild(ghost);
      }

      // Small red dew dots at 1/3 and 2/3 along the thread
      for (const t of [0.35, 0.68]) {
        const cx = x1 + dx * t;
        const cy = y1 + dy * t;
        const halo = document.createElementNS(SVG_NS, 'circle');
        halo.setAttribute('cx', cx.toFixed(1));
        halo.setAttribute('cy', cy.toFixed(1));
        halo.setAttribute('r', '3.2');
        halo.setAttribute('fill', '#ef4444');
        halo.setAttribute('opacity', '0.2');
        grp.appendChild(halo);
        const dot = document.createElementNS(SVG_NS, 'circle');
        dot.setAttribute('cx', cx.toFixed(1));
        dot.setAttribute('cy', cy.toFixed(1));
        dot.setAttribute('r', '1.2');
        dot.setAttribute('fill', '#ef4444');
        dot.setAttribute('opacity', '0.9');
        grp.appendChild(dot);
      }

      // Small web-cross glyphs perpendicular to main at 25%, 50%, 75%
      for (const t of [0.25, 0.5, 0.75]) {
        const cx = x1 + dx * t;
        const cy = y1 + dy * t;
        const len = 3.6;
        // cross along perpendicular
        const cr = document.createElementNS(SVG_NS, 'line');
        cr.setAttribute('x1', (cx - nx * len).toFixed(1));
        cr.setAttribute('y1', (cy - ny * len).toFixed(1));
        cr.setAttribute('x2', (cx + nx * len).toFixed(1));
        cr.setAttribute('y2', (cy + ny * len).toFixed(1));
        cr.setAttribute('stroke', '#bdbdbd');
        cr.setAttribute('stroke-width', '0.6');
        cr.setAttribute('stroke-linecap', 'round');
        cr.setAttribute('opacity', '0.65');
        grp.appendChild(cr);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      const d = dragRef.current;
      if (!d.active) return;
      const p = toLocal(e);
      d.x = p.x;
      d.y = p.y;
      if (d.thread) {
        rebuildThread(d.thread, d.x0, d.y0, p.x, p.y);
      }
      if (d.anchor) {
        const dx = p.x - d.x0;
        const dy = p.y - d.y0;
        const dist = Math.hypot(dx, dy);
        // Symmetric web-node — scale only, no rotation
        const scale = Math.min(3.2, 1 + dist / 75);
        d.anchor.setAttribute(
          'transform',
          `translate(${d.x0}, ${d.y0}) scale(${scale.toFixed(2)})`
        );
      }
    };

    const endDrag = () => {
      const d = dragRef.current;
      if (!d.active) return;
      const dx = d.x - d.x0;
      const dy = d.y - d.y0;
      const dist = Math.hypot(dx, dy);
      if (d.thread) d.thread.remove();
      if (d.anchor) d.anchor.remove();
      d.thread = null;
      d.anchor = null;
      d.active = false;
      explode(d.x0, d.y0, Math.max(dist, 80));
    };

    // Programmatic burst — triggered via window CustomEvent
    // { detail: { x, y, dist } } with viewport coordinates
    const onBurst = (e: Event) => {
      const detail = (e as CustomEvent).detail || {};
      const x = typeof detail.x === 'number' ? detail.x : window.innerWidth / 2;
      const y = typeof detail.y === 'number' ? detail.y : window.innerHeight / 2;
      const dist = typeof detail.dist === 'number' ? detail.dist : 1500;
      const r = host.getBoundingClientRect();
      explode(x - r.left, y - r.top, dist);
    };

    // Only attach drag listeners on non-touch devices.
    if (!isTouch) {
      window.addEventListener('pointerdown', onPointerDown);
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', endDrag);
      window.addEventListener('pointercancel', endDrag);
    }
    // Burst listener stays on every device so the cashier "Paid" celebration
    // and 404 mini-game victory still trigger confetti.
    window.addEventListener('spiderspins:burst' as any, onBurst);

    return () => {
      window.removeEventListener('resize', resize);
      if (!isTouch) {
        window.removeEventListener('pointerdown', onPointerDown);
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', endDrag);
        window.removeEventListener('pointercancel', endDrag);
      }
      window.removeEventListener('spiderspins:burst' as any, onBurst);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={hostRef}
      aria-hidden
      className={
        scope === 'section'
          ? 'absolute inset-0 pointer-events-none z-[8]'
          : 'fixed inset-0 pointer-events-none z-[8]'
      }
      style={{ touchAction: 'none' }}
    >
      <svg
        ref={svgRef}
        className="absolute inset-0 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
      />
    </div>
  );
}
