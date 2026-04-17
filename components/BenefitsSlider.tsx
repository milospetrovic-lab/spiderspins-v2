'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const VOID = 0x050505;
const STRIKE = 0xef4444;
const VENOM = 0xb91c1c;

const benefits = [
  {
    num: '01',
    headline: 'Patient Pacing',
    tagline: 'No countdowns. No panic.',
    body:
      'Volatility rating and payout profile are published on every game. No hidden choke points.',
    stat: { label: 'Style', value: 'Calm' },
  },
  {
    num: '02',
    headline: '500+ Games',
    tagline: 'The full spectrum in one place.',
    body:
      'Penny slots to high-stakes live tables. Updated weekly with titles from 80+ providers.',
    stat: { label: 'Titles', value: '500+' },
  },
  {
    num: '03',
    headline: '8K+ Colony',
    tagline: 'The web is a community.',
    body:
      'Telegram, Discord, weekly tournaments. Patient players sharing the long game, not algorithms.',
    stat: { label: 'Members', value: '8,000+' },
  },
  {
    num: '04',
    headline: '$1.8M / month',
    tagline: 'Payouts on silk.',
    body:
      'Withdrawals clear in an average of 3 minutes on crypto rails. No throttle, no surprise holds.',
    stat: { label: 'Paid / mo', value: '$1.8M' },
  },
  {
    num: '05',
    headline: 'Patient VIP',
    tagline: 'Every thread rewards.',
    body:
      'Hatchling to Empress — the longer you weave, the more the web gives back. No sprint required.',
    stat: { label: 'Tiers', value: '5' },
  },
];

const FACE_ROTATIONS: Record<number, [number, number, number]> = {
  1: [0, 0, 0],
  2: [0, -Math.PI / 2, 0],
  3: [Math.PI / 2, 0, 0],
  4: [-Math.PI / 2, 0, 0],
  5: [0, Math.PI / 2, 0],
  6: [Math.PI, 0, 0],
};

const pipPositions: Record<number, [number, number][]> = {
  1: [[0, 0]],
  2: [[-0.25, -0.25], [0.25, 0.25]],
  3: [[-0.25, -0.25], [0, 0], [0.25, 0.25]],
  4: [[-0.25, -0.25], [0.25, -0.25], [-0.25, 0.25], [0.25, 0.25]],
  5: [[-0.25, -0.25], [0.25, -0.25], [0, 0], [-0.25, 0.25], [0.25, 0.25]],
  6: [[-0.25, -0.25], [0.25, -0.25], [-0.25, 0], [0.25, 0], [-0.25, 0.25], [0.25, 0.25]],
};

const faceDefs: {
  val: number;
  dir: [number, number, number];
  up: [number, number, number];
}[] = [
  { val: 1, dir: [0, 0, 1], up: [0, 1, 0] },
  { val: 6, dir: [0, 0, -1], up: [0, 1, 0] },
  { val: 2, dir: [1, 0, 0], up: [0, 1, 0] },
  { val: 5, dir: [-1, 0, 0], up: [0, 1, 0] },
  { val: 3, dir: [0, 1, 0], up: [0, 0, -1] },
  { val: 4, dir: [0, -1, 0], up: [0, 0, 1] },
];

function useRoundedBoxGeometry() {
  return useMemo(() => {
    const geo = new THREE.BoxGeometry(1, 1, 1, 6, 6, 6);
    const pos = geo.attributes.position;
    const r = 0.52;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const len = Math.sqrt(x * x + y * y + z * z);
      if (len > r) {
        const scale = r / len;
        const t = 0.22;
        pos.setXYZ(i, x * (1 - t) + x * scale * t, y * (1 - t) + y * scale * t, z * (1 - t) + z * scale * t);
      }
    }
    geo.computeVertexNormals();
    return geo;
  }, []);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function Die({
  face,
  position,
  scale = 1,
  accent,
}: {
  face: number;
  position: [number, number, number];
  scale?: number;
  accent: number;
}) {
  const group = useRef<THREE.Group>(null);
  const bodyGeo = useRoundedBoxGeometry();
  const edgeGeo = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(1.01, 1.01, 1.01)), []);
  const tumble = useRef<{
    active: boolean;
    start: number;
    duration: number;
    from: [number, number, number];
    to: [number, number, number];
  }>({ active: false, start: 0, duration: 900, from: [0, 0, 0], to: [0, 0, 0] });
  const prevFace = useRef(face);
  const idleOffset = useMemo(() => Math.random() * Math.PI * 2, []);
  const { pointer } = useThree();

  useEffect(() => {
    if (face === prevFace.current) return;
    const g = group.current;
    if (!g) return;
    const target = FACE_ROTATIONS[face];
    tumble.current = {
      active: true,
      start: performance.now(),
      duration: 900,
      from: [g.rotation.x, g.rotation.y, g.rotation.z],
      to: [target[0], target[1] + Math.PI * 4, target[2]],
    };
    prevFace.current = face;
  }, [face]);

  // Set initial rotation on mount
  useEffect(() => {
    const g = group.current;
    if (!g) return;
    const target = FACE_ROTATIONS[face];
    g.rotation.set(target[0], target[1], target[2]);
    prevFace.current = face;
    // only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame(() => {
    const g = group.current;
    if (!g) return;

    if (tumble.current.active) {
      const elapsed = performance.now() - tumble.current.start;
      const t = Math.min(elapsed / tumble.current.duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      g.rotation.x = lerp(tumble.current.from[0], tumble.current.to[0], ease);
      g.rotation.y = lerp(tumble.current.from[1], tumble.current.to[1], ease);
      g.rotation.z = lerp(tumble.current.from[2], tumble.current.to[2], ease);
      g.position.y = position[1] + Math.sin(t * Math.PI) * 0.35;
      if (t >= 1) {
        tumble.current.active = false;
        // Snap rotation to target face cleanly
        const t2 = FACE_ROTATIONS[face];
        g.rotation.x = t2[0];
        g.rotation.y = t2[1];
        g.rotation.z = t2[2];
      }
    } else {
      // subtle idle float + pointer lean
      const now = performance.now() * 0.001 + idleOffset;
      g.position.y = position[1] + Math.sin(now * 0.8) * 0.07;
      const base = FACE_ROTATIONS[face];
      g.rotation.x = base[0] + pointer.y * 0.15;
      g.rotation.y = base[1] + pointer.x * 0.2;
      g.rotation.z = base[2];
    }
    g.position.x = position[0];
    g.position.z = position[2];
    g.scale.setScalar(scale);
  });

  return (
    <group ref={group}>
      <mesh geometry={bodyGeo} castShadow>
        <meshStandardMaterial
          color={VOID}
          metalness={0.7}
          roughness={0.22}
          emissive={accent}
          emissiveIntensity={0.2}
        />
      </mesh>
      <lineSegments geometry={edgeGeo}>
        <lineBasicMaterial color={VENOM} transparent opacity={0.55} />
      </lineSegments>
      {faceDefs.map((f) =>
        pipPositions[f.val].map(([px, py], i) => {
          const d = f.dir;
          const u = f.up;
          const rVec: [number, number, number] = [
            u[1] * d[2] - u[2] * d[1],
            u[2] * d[0] - u[0] * d[2],
            u[0] * d[1] - u[1] * d[0],
          ];
          const pipPos: [number, number, number] = [
            d[0] * 0.5 + rVec[0] * px + u[0] * py,
            d[1] * 0.5 + rVec[1] * px + u[1] * py,
            d[2] * 0.5 + rVec[2] * px + u[2] * py,
          ];
          return (
            <mesh key={`${f.val}-${i}`} position={pipPos}>
              <sphereGeometry args={[0.065, 14, 14]} />
              <meshStandardMaterial
                color={STRIKE}
                metalness={0.3}
                roughness={0.3}
                emissive={STRIKE}
                emissiveIntensity={0.8}
              />
            </mesh>
          );
        })
      )}
    </group>
  );
}

function Scene({ face }: { face: number }) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[4, 6, 4]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight color={'#ef4444'} intensity={3.6} distance={12} position={[-3, 2, 3]} />
      <pointLight color={'#b91c1c'} intensity={1.4} distance={10} position={[3, -1, -3]} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.4, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <shadowMaterial transparent opacity={0.35} />
      </mesh>

      <Die face={face} position={[-1.1, 0.1, 0.6]} scale={2.3} accent={STRIKE} />
      <Die face={face} position={[1.7, -0.3, -1.2]} scale={1.6} accent={VENOM} />
    </>
  );
}

export default function BenefitsSlider() {
  const [i, setI] = useState(0);
  const total = benefits.length;
  const current = benefits[i];
  const face = i + 1;
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  const next = () => setI((x) => (x + 1) % total);
  const prev = () => setI((x) => (x - 1 + total) % total);

  // autoplay pause — the slider is strategic: advance only on click / arrows
  // Keyboard arrows for accessibility
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pause the R3F canvas when offscreen
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) setInView(e.isIntersecting);
      },
      { rootMargin: '100px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section id="benefits" className="relative z-10 py-24 md:py-32 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-[1.15fr_1fr] gap-8 md:gap-12 items-center">
        {/* LEFT — heading + benefit card */}
        <div>
          <p className="font-mono text-silk-dim text-[11px] uppercase tracking-[0.42em] mb-5">
            Why SpiderSpins
          </p>
          <h2 className="font-display font-black text-silk leading-[0.9] text-[clamp(3rem,8vw,6rem)] mb-4">
            Benefits.
          </h2>
          <p className="max-w-md font-display font-light text-silk-dim text-base md:text-lg mb-6">
            Built for players who read the web. Patient, precise, and earned.
          </p>

          {/* pagination dots */}
          <div className="flex items-center gap-2 mb-7" role="tablist" aria-label="Benefits">
            {benefits.map((_, idx) => (
              <button
                key={idx}
                role="tab"
                aria-selected={idx === i}
                aria-label={`Benefit ${idx + 1}`}
                onClick={() => setI(idx)}
                className={[
                  'hover-target h-2 rounded-full transition-all duration-400',
                  idx === i ? 'w-10 bg-strike' : 'w-2 bg-web hover:bg-web-light',
                ].join(' ')}
              />
            ))}
          </div>

          {/* benefit card */}
          <div
            key={current.num}
            className="benefit-card relative rounded-xl border border-web/70 bg-cave/70 p-6 md:p-7 overflow-hidden"
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-70"
              style={{
                background:
                  'radial-gradient(ellipse 60% 80% at 100% 0%, rgba(185,28,28,0.08), transparent 60%)',
              }}
            />
            <div className="relative flex items-start gap-4">
              <span className="shrink-0 inline-flex items-center justify-center w-14 h-14 rounded-md border border-strike/40 bg-strike/10 font-mono text-strike text-lg font-bold">
                {current.num}
              </span>
              <div>
                <h3 className="font-display font-extrabold text-silk text-2xl md:text-3xl leading-tight">
                  {current.headline}
                </h3>
                <p className="mt-1 font-display text-strike text-sm md:text-base">
                  {current.tagline}
                </p>
              </div>
            </div>
            <p className="relative mt-4 font-display font-normal text-silk/85 text-[16px] leading-relaxed max-w-lg">
              {current.body}
            </p>

            {/* progress + arrows */}
            <div className="relative mt-6 flex items-center gap-4">
              <div className="flex-1 h-[2px] bg-web/70 rounded-full overflow-hidden">
                <div
                  className="h-full bg-strike transition-all duration-500 ease-out"
                  style={{ width: `${((i + 1) / total) * 100}%` }}
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={prev}
                  aria-label="Previous benefit"
                  className="hover-target w-9 h-9 rounded-full border border-web/80 hover:border-strike/70 text-silk-dim hover:text-strike transition-colors flex items-center justify-center"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
                </button>
                <button
                  onClick={next}
                  aria-label="Next benefit"
                  className="hover-target w-9 h-9 rounded-full border border-strike/60 bg-strike/10 text-strike hover:bg-strike/20 transition-colors flex items-center justify-center"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — dice stage.
            Mobile: tight 3:2 canvas + inline pill row underneath (no empty floor).
            Desktop: tall stage with floating absolute pills (unchanged). */}
        <div ref={stageRef} className="relative md:min-h-[640px]">
          {/* Canvas — gets natural mobile height via aspect; absolute on desktop */}
          <div className="relative aspect-[3/2] md:aspect-auto md:absolute md:inset-0">
            {/* Desktop-only floating pills */}
            <div className="hidden md:block absolute top-6 left-6 z-[5] rounded-lg border border-strike/40 bg-cave/80 backdrop-blur-md px-3 py-2 shadow-strike-glow">
              <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-silk-dim">House edge</div>
              <div className="font-display font-bold text-strike text-lg leading-none">0.5%</div>
            </div>
            <div className="hidden md:block absolute bottom-12 right-6 z-[5] rounded-lg border border-venom/40 bg-cave/80 backdrop-blur-md px-3 py-2">
              <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-silk-dim">{current.stat.label}</div>
              <div className="font-display font-bold text-strike text-lg leading-none">{current.stat.value}</div>
            </div>
            <div className="hidden md:block pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 z-[5] font-mono text-[10px] uppercase tracking-[0.3em] text-shadow">
              Click dice to advance →
            </div>

            {/* Canvas */}
            <button
              onClick={next}
              aria-label="Next benefit"
              className="hover-target absolute inset-0 overflow-visible cursor-pointer bg-transparent border-0 outline-none"
            >
              <Canvas
                shadows
                dpr={[1, 2]}
                camera={{ position: [0, 3.4, 9.5], fov: 42 }}
                gl={{ antialias: true, alpha: true }}
                frameloop={inView ? 'always' : 'never'}
                style={{ width: '100%', height: '100%', background: 'transparent' }}
              >
                <Suspense fallback={null}>
                  <Scene face={face} />
                </Suspense>
              </Canvas>
            </button>
          </div>

          {/* Mobile-only inline pill row + hint — fills the empty floor */}
          <div className="md:hidden mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-strike/40 bg-cave/80 px-3 py-2.5">
              <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-silk-dim">House edge</div>
              <div className="font-display font-bold text-strike text-lg leading-none">0.5%</div>
            </div>
            <div className="rounded-lg border border-venom/40 bg-cave/80 px-3 py-2.5">
              <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-silk-dim">{current.stat.label}</div>
              <div className="font-display font-bold text-strike text-lg leading-none">{current.stat.value}</div>
            </div>
          </div>
          <div className="md:hidden mt-3 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-shadow">
            Tap dice to advance →
          </div>
        </div>
      </div>
    </section>
  );
}
