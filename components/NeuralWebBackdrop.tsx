'use client';

/**
 * ⚠ FLAGGED COMPONENT — see SPIDERSPINS_TODO.md Sprint D
 *
 * This is the neural-network three.js pattern you shared, spider-reskinned.
 * It is HEAVIER than the current hero (adds ~120 KB + continuous GPU work).
 * It's NOT mounted by default anywhere. To enable, set `data-neural-web="1"`
 * on the wrapping <html> or pass `enabled={true}` as a prop.
 *
 * Rollback: delete the single usage from app/page.tsx, or flip the env var,
 * or run `git checkout v2-checkpoint-before-sprint-a` in site-v2/. The
 * Vercel dashboard also lets you promote any previous deployment back to
 * production with one click — no code change required.
 *
 * Implementation: crystalline-sphere formation only (helix/fractal dropped),
 * OrbitControls disabled, auto-rotate 0.15×, density scales on GPU tier.
 */

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { getGPUTier } from 'detect-gpu';

type NodeDef = { pos: THREE.Vector3; level: number; size: number };

export default function NeuralWebBackdrop({
  enabled = false,
  intensity = 0.6,
}: {
  enabled?: boolean;
  intensity?: number;
}) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [run, setRun] = useState(enabled);

  // Also read data-neural-web="1" from <html> to enable without a rebuild
  useEffect(() => {
    if (enabled) {
      setRun(true);
      return;
    }
    try {
      if (document.documentElement.dataset.neuralWeb === '1') setRun(true);
    } catch {}
  }, [enabled]);

  useEffect(() => {
    if (!run) return;
    const mount = mountRef.current;
    if (!mount) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      let tier = 2;
      try {
        const res = await getGPUTier();
        tier = res.tier || 2;
        if (res.tier === 0) return; // skip on low-end entirely
      } catch {}
      if (cancelled) return;

      const densityFactor = tier >= 3 ? 0.7 : tier === 2 ? 0.5 : 0.35;

      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x050505, 0.006);

      const camera = new THREE.PerspectiveCamera(
        60,
        mount.clientWidth / mount.clientHeight,
        0.1,
        1000
      );
      camera.position.set(0, 4, 30);
      camera.lookAt(0, 0, 0);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      renderer.setClearColor(0x000000, 0);
      mount.appendChild(renderer.domElement);

      // Crystalline-sphere node generation — wine/strike palette
      const nodes: NodeDef[] = [];
      const rootNode = { pos: new THREE.Vector3(0, 0, 0), level: 0, size: 2.0 };
      nodes.push(rootNode);

      const layers = 5;
      const goldenRatio = (1 + Math.sqrt(5)) / 2;
      for (let layer = 1; layer <= layers; layer++) {
        const radius = layer * 3.6;
        const numPoints = Math.max(6, Math.floor(layer * 12 * densityFactor));
        for (let i = 0; i < numPoints; i++) {
          const phi = Math.acos(1 - (2 * (i + 0.5)) / numPoints);
          const theta = (2 * Math.PI * i) / goldenRatio;
          const pos = new THREE.Vector3(
            radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.sin(phi) * Math.sin(theta),
            radius * Math.cos(phi)
          );
          nodes.push({ pos, level: layer, size: 0.8 + Math.random() * 0.4 });
        }
      }

      // Connections: each node → 3 nearest previous-layer nodes
      const connections: [number, number][] = [];
      nodes.forEach((n, idx) => {
        if (n.level === 0) return;
        const prev = nodes
          .map((m, mi) => ({ m, mi }))
          .filter(({ m }) => m.level === n.level - 1)
          .sort(
            (a, b) =>
              n.pos.distanceTo(a.m.pos) - n.pos.distanceTo(b.m.pos)
          )
          .slice(0, 3);
        for (const { mi } of prev) {
          connections.push([idx, mi]);
        }
      });

      // Points geometry
      const positions = new Float32Array(nodes.length * 3);
      const sizes = new Float32Array(nodes.length);
      const colors = new Float32Array(nodes.length * 3);
      const wineColor = new THREE.Color(0x8b1a1a);
      const strikeColor = new THREE.Color(0xef4444);
      const silkColor = new THREE.Color(0xe8e8e8);
      nodes.forEach((n, i) => {
        positions[i * 3] = n.pos.x;
        positions[i * 3 + 1] = n.pos.y;
        positions[i * 3 + 2] = n.pos.z;
        sizes[i] = n.size;
        const t = Math.random();
        const c =
          t < 0.6 ? wineColor : t < 0.92 ? strikeColor : silkColor;
        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
      });

      const pointsGeo = new THREE.BufferGeometry();
      pointsGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      pointsGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
      pointsGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const pointsMat = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uTime: { value: 0 } },
        vertexShader: `
          attribute float size;
          attribute vec3 color;
          uniform float uTime;
          varying vec3 vColor;
          void main() {
            vColor = color;
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            float breathe = sin(uTime * 0.6 + position.x * 0.2) * 0.15 + 0.85;
            gl_PointSize = size * breathe * (450.0 / -mv.z);
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: `
          varying vec3 vColor;
          void main() {
            vec2 c = gl_PointCoord - 0.5;
            float d = length(c);
            if (d > 0.5) discard;
            float a = 1.0 - smoothstep(0.0, 0.5, d);
            gl_FragColor = vec4(vColor, a * 0.85);
          }`,
      });
      const points = new THREE.Points(pointsGeo, pointsMat);
      scene.add(points);

      // Connections geometry (simple lines)
      const linePositions: number[] = [];
      const lineColors: number[] = [];
      for (const [a, b] of connections) {
        const na = nodes[a];
        const nb = nodes[b];
        linePositions.push(na.pos.x, na.pos.y, na.pos.z, nb.pos.x, nb.pos.y, nb.pos.z);
        const ac = new THREE.Color(colors[a * 3], colors[a * 3 + 1], colors[a * 3 + 2]);
        const bc = new THREE.Color(colors[b * 3], colors[b * 3 + 1], colors[b * 3 + 2]);
        lineColors.push(ac.r * 0.7, ac.g * 0.7, ac.b * 0.7);
        lineColors.push(bc.r * 0.7, bc.g * 0.7, bc.b * 0.7);
      }
      const lineGeo = new THREE.BufferGeometry();
      lineGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePositions), 3));
      lineGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(lineColors), 3));
      const lineMat = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.35 * intensity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const lines = new THREE.LineSegments(lineGeo, lineMat);
      scene.add(lines);

      // Render loop — slow auto-rotate, IntersectionObserver to pause offscreen
      let raf = 0;
      let inView = true;
      const start = performance.now();
      const animate = () => {
        if (!inView) {
          raf = 0;
          return;
        }
        const elapsed = (performance.now() - start) / 1000;
        (pointsMat.uniforms.uTime.value as number) = elapsed;
        scene.rotation.y = elapsed * 0.05;
        scene.rotation.x = Math.sin(elapsed * 0.12) * 0.08;
        renderer.render(scene, camera);
        raf = requestAnimationFrame(animate);
      };
      raf = requestAnimationFrame(animate);

      const io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting && !inView) {
              inView = true;
              if (!raf) raf = requestAnimationFrame(animate);
            } else if (!entry.isIntersecting) {
              inView = false;
            }
          }
        },
        { rootMargin: '100px' }
      );
      io.observe(mount);

      const onResize = () => {
        if (!mount) return;
        const w = Math.max(1, mount.clientWidth);
        const h = Math.max(1, mount.clientHeight);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', onResize);

      cleanup = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener('resize', onResize);
        io.disconnect();
        renderer.dispose();
        pointsGeo.dispose();
        pointsMat.dispose();
        lineGeo.dispose();
        lineMat.dispose();
        if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      };
    })();

    return () => {
      cancelled = true;
      if (cleanup) cleanup();
    };
  }, [run, intensity]);

  if (!run) return null;

  return (
    <div
      ref={mountRef}
      aria-hidden
      className="absolute inset-0 pointer-events-none"
      style={{ opacity: intensity }}
    />
  );
}
