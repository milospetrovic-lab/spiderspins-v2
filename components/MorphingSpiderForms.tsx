'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { getGPUTier } from 'detect-gpu';

// Morphing Spider Forms — interactive particle stage that visualizes the five
// VIP species from the Menagerie. Click (or Next) to morph between shapes.
// Each species binds to its tier palette; turbulent Bezier path + noise drift
// gives the swarm a living, web-silk feel.

type Species = {
  key: string;
  name: string;
  tier: string;
  role: string;
  color: number; // base color
  accent: number; // rim/accent
};

// Per-tier colors — spec values (cold → warm → gold).
// Widow color stays LOCKED per spec.
const SPECIES: Species[] = [
  {
    key: 'hatchling',
    name: 'Hatchling',
    tier: 'TIER 1 · FIRST THREAD',
    role: 'Patient hunter. No web. Eight eyes, watching.',
    color: 0xa8a8b0, // cold silver
    accent: 0xe8e8e8,
  },
  {
    key: 'hunter',
    name: 'Hunter',
    tier: 'TIER 2 · THE CHASE',
    role: 'Classic round web. Symmetry. The textbook spider.',
    color: 0xd97272, // light red (first weaving)
    accent: 0xef4444,
  },
  {
    key: 'weaver',
    name: 'Weaver',
    tier: 'TIER 3 · THE SPIRAL',
    role: 'Architect. The funnel tunnels into the dark.',
    color: 0xb91c1c, // venom red (deepening)
    accent: 0x2a0505,
  },
  {
    key: 'widow',
    name: 'Widow',
    tier: 'TIER 4 · THE MARK',
    role: 'The flagship. Red hourglass. Respected.',
    color: 0xef4444, // locked per spec
    accent: 0xef4444,
  },
  {
    key: 'empress',
    name: 'Empress',
    tier: 'TIER 5 · THE THRONE',
    role: 'Largest spider on earth. Golden silk. Bespoke.',
    color: 0xffd700, // pure gold
    accent: 0xfff4a3,
  },
];

// ---------- Shape generators — each returns Float32Array of N*3 ----------

const SCALE = 160;

function shapeHatchling(N: number): Float32Array {
  // Wolf spider — compact body, 8 glowing eyes on cephalothorax (signature),
  // 8 short legs splayed low (stalker pose, not a web-weaver).
  const arr = new Float32Array(N * 3);
  // Proportions: 12% ceph, 15% abd, 18% eight eyes, 55% eight legs
  const nCeph = Math.floor(N * 0.12);
  const nAbd = Math.floor(N * 0.15);
  const nEyes = Math.floor(N * 0.18);
  const nLegs = N - nCeph - nAbd - nEyes;
  const perLeg = Math.floor(nLegs / 8);
  const perEye = Math.floor(nEyes / 8);

  let idx = 0;
  // Cephalothorax — compact front disc
  for (let i = 0; i < nCeph; i++) {
    const u = Math.random() * Math.PI * 2;
    const v = Math.acos(2 * Math.random() - 1);
    arr[idx * 3] = Math.sin(v) * Math.cos(u) * SCALE * 0.14;
    arr[idx * 3 + 1] = Math.sin(v) * Math.sin(u) * SCALE * 0.11 + SCALE * 0.14;
    arr[idx * 3 + 2] = Math.cos(v) * SCALE * 0.11;
    idx++;
  }
  // Abdomen — small rear
  for (let i = 0; i < nAbd; i++) {
    const u = Math.random() * Math.PI * 2;
    const v = Math.acos(2 * Math.random() - 1);
    arr[idx * 3] = Math.sin(v) * Math.cos(u) * SCALE * 0.16;
    arr[idx * 3 + 1] = Math.sin(v) * Math.sin(u) * SCALE * 0.18 - SCALE * 0.10;
    arr[idx * 3 + 2] = Math.cos(v) * SCALE * 0.14;
    idx++;
  }
  // 8 eyes: 2-2-2-2 wolf-spider arrangement on the cephalothorax front
  const eyes = [
    { x: -0.05, y: 0.28, r: 0.025 }, // row 1 PM — small
    { x:  0.05, y: 0.28, r: 0.025 },
    { x: -0.12, y: 0.22, r: 0.040 }, // row 2 PL — wider
    { x:  0.12, y: 0.22, r: 0.040 },
    { x: -0.07, y: 0.17, r: 0.030 }, // row 3 AL — close
    { x:  0.07, y: 0.17, r: 0.030 },
    { x: -0.09, y: 0.10, r: 0.055 }, // row 4 AM — HUGE
    { x:  0.09, y: 0.10, r: 0.055 },
  ];
  for (let e = 0; e < 8; e++) {
    for (let i = 0; i < perEye; i++) {
      const a = Math.random() * Math.PI * 2;
      // 60% disc, 40% gaussian tight for pupil glow (row-4 eyes read brightest)
      const tight = Math.random() < (e >= 6 ? 0.55 : 0.35);
      const r = tight
        ? (Math.random() + Math.random()) * 0.25 * eyes[e].r * SCALE
        : Math.sqrt(Math.random()) * eyes[e].r * SCALE;
      arr[idx * 3] = eyes[e].x * SCALE + Math.cos(a) * r;
      arr[idx * 3 + 1] = eyes[e].y * SCALE + Math.sin(a) * r;
      arr[idx * 3 + 2] = (e >= 6 ? 6 : 2) + (Math.random() - 0.5) * 3;
      idx++;
    }
  }
  // 8 short legs — wolf spiders have compact, robust legs splayed low for running
  const legDirs: [number, number][] = [
    [-1, 0.5], [-1, 0.15], [-1, -0.2], [-1, -0.5],
    [1, 0.5], [1, 0.15], [1, -0.2], [1, -0.5],
  ];
  for (let leg = 0; leg < 8; leg++) {
    const [sx, ay] = legDirs[leg];
    const bx = sx * SCALE * 0.09;
    const by = ay * SCALE * 0.05 + SCALE * 0.02;
    // Knee — close to body, slightly out-and-down (low stance)
    const kx = sx * SCALE * 0.38;
    const ky = by - SCALE * 0.04;
    // Tip — shorter reach than widow (wolf legs are thicker, shorter)
    const tx = sx * SCALE * 0.62;
    const ty = ay * SCALE * 0.30 - SCALE * 0.05;
    for (let i = 0; i < perLeg; i++) {
      const t = i / Math.max(perLeg - 1, 1);
      const x = (1 - t) * (1 - t) * bx + 2 * (1 - t) * t * kx + t * t * tx;
      const y = (1 - t) * (1 - t) * by + 2 * (1 - t) * t * ky + t * t * ty;
      arr[idx * 3] = x;
      arr[idx * 3 + 1] = y;
      arr[idx * 3 + 2] = (Math.random() - 0.5) * 8;
      idx++;
    }
  }
  while (idx < N) {
    arr[idx * 3] = (Math.random() - 0.5) * SCALE * 1.6;
    arr[idx * 3 + 1] = (Math.random() - 0.5) * SCALE * 1.0;
    arr[idx * 3 + 2] = 0;
    idx++;
  }
  return arr;
}

function shapeHunter(N: number): Float32Array {
  // Orb web: center hub + 8 radial spokes + 5 concentric rings.
  // Spec: 80 hub + 1000 spokes + 1920 rings = 3000. Scaled proportionally to N.
  const arr = new Float32Array(N * 3);
  const hubShare = 80 / 3000;
  const spokeShare = 1000 / 3000;
  const ringShare = 1920 / 3000;
  const nHub = Math.max(24, Math.round(N * hubShare));
  const nSpoke = Math.round(N * spokeShare);
  const nRing = N - nHub - nSpoke;

  let idx = 0;
  // Center hub — tight cluster
  for (let i = 0; i < nHub; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = Math.random() * SCALE * 0.03;
    arr[idx * 3] = Math.cos(a) * r;
    arr[idx * 3 + 1] = Math.sin(a) * r;
    arr[idx * 3 + 2] = (Math.random() - 0.5) * 6;
    idx++;
  }
  // 8 spokes from center to outer edge
  const NUM_SPOKES = 8;
  const perSpoke = Math.floor(nSpoke / NUM_SPOKES);
  for (let s = 0; s < NUM_SPOKES; s++) {
    const ang = (s / NUM_SPOKES) * Math.PI * 2;
    for (let i = 0; i < perSpoke; i++) {
      const t = i / perSpoke;
      const r = (0.03 + t * 0.60) * SCALE;
      const jitter = (Math.random() - 0.5) * 0.008 * SCALE;
      const perpX = -Math.sin(ang) * jitter;
      const perpY = Math.cos(ang) * jitter;
      arr[idx * 3] = Math.cos(ang) * r + perpX;
      arr[idx * 3 + 1] = Math.sin(ang) * r + perpY;
      arr[idx * 3 + 2] = (Math.random() - 0.5) * 6;
      idx++;
    }
  }
  // 5 concentric rings (radii 0.15..0.63 of scale)
  const RADII = [0.15, 0.27, 0.39, 0.51, 0.63];
  const perRing = Math.floor((N - idx) / RADII.length);
  for (let ri = 0; ri < RADII.length; ri++) {
    const baseR = RADII[ri] * SCALE;
    const count = ri === RADII.length - 1 ? (N - idx) : perRing;
    for (let i = 0; i < count; i++) {
      const ang = (i / count) * Math.PI * 2 + Math.random() * 0.04;
      const r = baseR + (Math.random() - 0.5) * 0.008 * SCALE;
      arr[idx * 3] = Math.cos(ang) * r;
      arr[idx * 3 + 1] = Math.sin(ang) * r;
      arr[idx * 3 + 2] = (Math.random() - 0.5) * 8;
      idx++;
      if (idx >= N) break;
    }
    if (idx >= N) break;
  }
  // Pad any leftover
  while (idx < N) {
    const ang = Math.random() * Math.PI * 2;
    arr[idx * 3] = Math.cos(ang) * SCALE * 0.6;
    arr[idx * 3 + 1] = Math.sin(ang) * SCALE * 0.6;
    arr[idx * 3 + 2] = 0;
    idx++;
  }
  return arr;
}

function shapeWeaver(N: number): Float32Array {
  // Funnel-web spider — ambush architect. Visible fangs at front,
  // long legs angled forward for the strike, silk thread trailing back
  // into a small funnel entrance behind the body.
  const arr = new Float32Array(N * 3);
  // 14% ceph, 22% abd, 6% fangs, 8% silk trail, 50% eight legs
  const nCeph = Math.floor(N * 0.14);
  const nAbd = Math.floor(N * 0.22);
  const nFangs = Math.floor(N * 0.06);
  const nTrail = Math.floor(N * 0.08);
  const nLegs = N - nCeph - nAbd - nFangs - nTrail;
  const perLeg = Math.floor(nLegs / 8);

  let idx = 0;
  // Cephalothorax — slightly forward-leaning
  for (let i = 0; i < nCeph; i++) {
    const u = Math.random() * Math.PI * 2;
    const v = Math.acos(2 * Math.random() - 1);
    arr[idx * 3] = Math.sin(v) * Math.cos(u) * SCALE * 0.14;
    arr[idx * 3 + 1] = Math.sin(v) * Math.sin(u) * SCALE * 0.11 + SCALE * 0.10;
    arr[idx * 3 + 2] = Math.cos(v) * SCALE * 0.13;
    idx++;
  }
  // Abdomen — robust, darker rear
  for (let i = 0; i < nAbd; i++) {
    const u = Math.random() * Math.PI * 2;
    const v = Math.acos(2 * Math.random() - 1);
    arr[idx * 3] = Math.sin(v) * Math.cos(u) * SCALE * 0.22;
    arr[idx * 3 + 1] = Math.sin(v) * Math.sin(u) * SCALE * 0.24 - SCALE * 0.16;
    arr[idx * 3 + 2] = Math.cos(v) * SCALE * 0.20;
    idx++;
  }
  // Fangs — two downward spikes at front (signature funnel-web look)
  for (let i = 0; i < nFangs; i++) {
    const side = i < nFangs / 2 ? -1 : 1;
    const t = Math.random();
    // Spike curves down and slightly inward
    const x = side * SCALE * 0.06 * (1 - t * 0.5);
    const y = SCALE * 0.22 - t * SCALE * 0.10;
    arr[idx * 3] = x + (Math.random() - 0.5) * 3;
    arr[idx * 3 + 1] = y + (Math.random() - 0.5) * 2;
    arr[idx * 3 + 2] = SCALE * 0.10 + Math.random() * 4;
    idx++;
  }
  // Silk trail — particles trailing back from spinnerets into a suggested funnel
  for (let i = 0; i < nTrail; i++) {
    const t = Math.random();
    const spread = t * SCALE * 0.08;
    arr[idx * 3] = (Math.random() - 0.5) * spread;
    arr[idx * 3 + 1] = -SCALE * 0.40 - t * SCALE * 0.25;
    arr[idx * 3 + 2] = (Math.random() - 0.5) * spread;
    idx++;
  }
  // 8 legs — longer than wolf, angled forward like an ambush crouch
  const legDirs: [number, number][] = [
    [-1, 0.9], [-1, 0.45], [-1, -0.05], [-1, -0.55],
    [1, 0.9], [1, 0.45], [1, -0.05], [1, -0.55],
  ];
  for (let leg = 0; leg < 8; leg++) {
    const [sx, ay] = legDirs[leg];
    // Front legs (highest ay) reach further and higher — ambush pose
    const frontBias = ay > 0.3 ? 1.1 : 1.0;
    const bx = sx * SCALE * 0.10;
    const by = ay * SCALE * 0.06 + SCALE * 0.03;
    const kx = sx * SCALE * 0.50 * frontBias;
    const ky = by + SCALE * 0.18;
    const tx = sx * SCALE * 0.92 * frontBias;
    const ty = ay * SCALE * 0.42;
    for (let i = 0; i < perLeg; i++) {
      const t = i / Math.max(perLeg - 1, 1);
      const x = (1 - t) * (1 - t) * bx + 2 * (1 - t) * t * kx + t * t * tx;
      const y = (1 - t) * (1 - t) * by + 2 * (1 - t) * t * ky + t * t * ty;
      arr[idx * 3] = x;
      arr[idx * 3 + 1] = y;
      arr[idx * 3 + 2] = (Math.random() - 0.5) * 10;
      idx++;
    }
  }
  while (idx < N) {
    arr[idx * 3] = (Math.random() - 0.5) * SCALE * 1.8;
    arr[idx * 3 + 1] = (Math.random() - 0.5) * SCALE * 1.0;
    arr[idx * 3 + 2] = 0;
    idx++;
  }
  return arr;
}

function shapeWidow(N: number): Float32Array {
  // Body ellipsoid + abdomen ellipsoid + 8 leg curves with a knee
  const arr = new Float32Array(N * 3);
  // 15% cephalothorax, 20% abdomen, 8% red hourglass mark, 57% across 8 legs
  const nCeph = Math.floor(N * 0.15);
  const nAbd = Math.floor(N * 0.2);
  const nMark = Math.floor(N * 0.08);
  const nLegs = N - nCeph - nAbd - nMark;
  const perLeg = Math.floor(nLegs / 8);

  let idx = 0;
  // Cephalothorax — small front ellipsoid
  for (let i = 0; i < nCeph; i++) {
    const u = Math.random() * Math.PI * 2;
    const v = Math.acos(2 * Math.random() - 1);
    arr[idx * 3] = Math.sin(v) * Math.cos(u) * SCALE * 0.13;
    arr[idx * 3 + 1] = Math.sin(v) * Math.sin(u) * SCALE * 0.1 + SCALE * 0.12;
    arr[idx * 3 + 2] = Math.cos(v) * SCALE * 0.13;
    idx++;
  }
  // Abdomen — larger rear ellipsoid
  for (let i = 0; i < nAbd; i++) {
    const u = Math.random() * Math.PI * 2;
    const v = Math.acos(2 * Math.random() - 1);
    arr[idx * 3] = Math.sin(v) * Math.cos(u) * SCALE * 0.22;
    arr[idx * 3 + 1] = Math.sin(v) * Math.sin(u) * SCALE * 0.27 - SCALE * 0.18;
    arr[idx * 3 + 2] = Math.cos(v) * SCALE * 0.2;
    idx++;
  }
  // Hourglass mark on abdomen — two small triangles
  for (let i = 0; i < nMark; i++) {
    const half = i < nMark / 2 ? 1 : -1;
    const t = Math.random();
    arr[idx * 3] = (Math.random() - 0.5) * SCALE * 0.07 * (1 - t * 0.6);
    arr[idx * 3 + 1] = -SCALE * 0.18 + half * t * SCALE * 0.12;
    arr[idx * 3 + 2] = SCALE * 0.18 + Math.random() * 4;
    idx++;
  }
  // 8 legs — 4 per side, each a bent curve with a knee
  const legDirs: [number, number][] = [
    [-1, 0.7], [-1, 0.25], [-1, -0.2], [-1, -0.65],
    [1, 0.7], [1, 0.25], [1, -0.2], [1, -0.65],
  ];
  for (let leg = 0; leg < 8; leg++) {
    const [sx, ay] = legDirs[leg];
    // Base anchor at cephalothorax edge
    const bx = sx * SCALE * 0.1;
    const by = ay * SCALE * 0.05 + SCALE * 0.05;
    // Knee — mid-point out-and-up
    const kx = sx * SCALE * 0.52;
    const ky = by + SCALE * 0.15;
    // Tip
    const tx = sx * SCALE * 0.9;
    const ty = ay * SCALE * 0.45;
    for (let i = 0; i < perLeg; i++) {
      const t = i / (perLeg - 1);
      // quadratic Bezier base → knee → tip
      const x =
        (1 - t) * (1 - t) * bx + 2 * (1 - t) * t * kx + t * t * tx;
      const y =
        (1 - t) * (1 - t) * by + 2 * (1 - t) * t * ky + t * t * ty;
      arr[idx * 3] = x;
      arr[idx * 3 + 1] = y;
      arr[idx * 3 + 2] = (Math.random() - 0.5) * 10;
      idx++;
    }
  }
  // pad any remainder with a hovering halo
  for (; idx < N; idx++) {
    const a = Math.random() * Math.PI * 2;
    arr[idx * 3] = Math.cos(a) * SCALE * 0.95;
    arr[idx * 3 + 1] = Math.sin(a) * SCALE * 0.95;
    arr[idx * 3 + 2] = 0;
  }
  return arr;
}

function shapeEmpress(N: number): Float32Array {
  // Goliath Birdeater — the largest spider. Largest body proportions,
  // very long bristled legs, and gold crown-band markings on the abdomen.
  const arr = new Float32Array(N * 3);
  // 16% ceph, 28% abd, 8% gold crown bands, 48% eight long legs
  const nCeph = Math.floor(N * 0.16);
  const nAbd = Math.floor(N * 0.28);
  const nCrown = Math.floor(N * 0.08);
  const nLegs = N - nCeph - nAbd - nCrown;
  const perLeg = Math.floor(nLegs / 8);

  let idx = 0;
  // Cephalothorax — bigger than widow
  for (let i = 0; i < nCeph; i++) {
    const u = Math.random() * Math.PI * 2;
    const v = Math.acos(2 * Math.random() - 1);
    arr[idx * 3] = Math.sin(v) * Math.cos(u) * SCALE * 0.18;
    arr[idx * 3 + 1] = Math.sin(v) * Math.sin(u) * SCALE * 0.14 + SCALE * 0.12;
    arr[idx * 3 + 2] = Math.cos(v) * SCALE * 0.16;
    idx++;
  }
  // Abdomen — massive, regal proportions
  for (let i = 0; i < nAbd; i++) {
    const u = Math.random() * Math.PI * 2;
    const v = Math.acos(2 * Math.random() - 1);
    arr[idx * 3] = Math.sin(v) * Math.cos(u) * SCALE * 0.30;
    arr[idx * 3 + 1] = Math.sin(v) * Math.sin(u) * SCALE * 0.32 - SCALE * 0.18;
    arr[idx * 3 + 2] = Math.cos(v) * SCALE * 0.28;
    idx++;
  }
  // Gold crown bands — 3 horizontal rings wrapping the abdomen
  // These become the "Empress" signature: no hourglass, but regal bands.
  const bandYs = [-SCALE * 0.05, -SCALE * 0.18, -SCALE * 0.32];
  for (let i = 0; i < nCrown; i++) {
    const ring = i % 3;
    const y = bandYs[ring] + (Math.random() - 0.5) * 4;
    const ang = Math.random() * Math.PI * 2;
    // Match the abdomen's ellipsoidal radius at this y
    const rBand = SCALE * 0.30 * Math.sqrt(Math.max(0,
      1 - Math.pow((y + SCALE * 0.18) / (SCALE * 0.32), 2)));
    arr[idx * 3] = Math.cos(ang) * (rBand + 2);
    arr[idx * 3 + 1] = y;
    arr[idx * 3 + 2] = Math.sin(ang) * (rBand + 2);
    idx++;
  }
  // 8 very long elegant legs — extended regal stance
  const legDirs: [number, number][] = [
    [-1, 0.7], [-1, 0.25], [-1, -0.2], [-1, -0.65],
    [1, 0.7], [1, 0.25], [1, -0.2], [1, -0.65],
  ];
  for (let leg = 0; leg < 8; leg++) {
    const [sx, ay] = legDirs[leg];
    const bx = sx * SCALE * 0.14;
    const by = ay * SCALE * 0.06 + SCALE * 0.04;
    // Knee further out + higher for a lifted, graceful silhouette
    const kx = sx * SCALE * 0.62;
    const ky = by + SCALE * 0.22;
    // Tips reach further out than widow (biggest spider)
    const tx = sx * SCALE * 1.10;
    const ty = ay * SCALE * 0.55;
    for (let i = 0; i < perLeg; i++) {
      const t = i / Math.max(perLeg - 1, 1);
      const x = (1 - t) * (1 - t) * bx + 2 * (1 - t) * t * kx + t * t * tx;
      const y = (1 - t) * (1 - t) * by + 2 * (1 - t) * t * ky + t * t * ty;
      arr[idx * 3] = x;
      arr[idx * 3 + 1] = y;
      arr[idx * 3 + 2] = (Math.random() - 0.5) * 12;
      idx++;
    }
  }
  while (idx < N) {
    arr[idx * 3] = (Math.random() - 0.5) * SCALE * 2.2;
    arr[idx * 3 + 1] = (Math.random() - 0.5) * SCALE * 1.2;
    arr[idx * 3 + 2] = 0;
    idx++;
  }
  return arr;
}

const GENERATORS = [
  shapeHatchling,
  shapeHunter,
  shapeWeaver,
  shapeWidow,
  shapeEmpress,
];

// Simple deterministic hash noise (Perlin-lite). Returns ~[-1,1].
function hashNoise(i: number, seed: number) {
  const s = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
  return (s - Math.floor(s)) * 2 - 1;
}

export default function MorphingSpiderForms() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  // `enabled` starts null so we don't spin up a WebGL context on touch devices
  // during the first render — we wait until the capability gate resolves.
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [tier, setTier] = useState(2);
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const morphingRef = useRef(false);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  // Capability gate
  useEffect(() => {
    try {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setEnabled(false);
        return;
      }
      // Touch devices used to fall back to a static silhouette. We now enable
      // the particle stage on mobile too — the GPU tier + mobile particle cap
      // (1500 max) keeps perf in range. Truly weak devices still end up at
      // tier 0 below and fall through to the static silhouette.
    } catch {}
    let cancelled = false;
    (async () => {
      try {
        const res = await getGPUTier();
        if (!cancelled) {
          if (res.tier === 0) setEnabled(false);
          else {
            setTier(res.tier);
            setEnabled(true);
          }
        }
      } catch {
        if (!cancelled) setEnabled(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Three.js scene
  useEffect(() => {
    if (enabled !== true) return;
    const host = hostRef.current;
    if (!host) return;

    // Per spec: desktop target 3000, mobile auto-reduce to 1500 under 768px.
    // GPU tier scales inside that envelope.
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const N = isMobile
      ? (tier >= 3 ? 1500 : tier === 2 ? 1200 : 900)
      : (tier >= 3 ? 3000 : tier === 2 ? 2400 : 1600);
    const positions = new Float32Array(N * 3);
    const targets = new Float32Array(N * 3);
    const controls = new Float32Array(N * 3);
    const startCopy = new Float32Array(N * 3);

    // Initialize at shape 0
    const initial = GENERATORS[0](N);
    positions.set(initial);
    startCopy.set(initial);
    targets.set(initial);

    const scene = new THREE.Scene();
    const W = host.clientWidth;
    const H = host.clientHeight;
    const camera = new THREE.PerspectiveCamera(42, W / H, 1, 2000);
    camera.position.set(0, 0, 480);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isMobile,
      alpha: true,
      powerPreference: isMobile ? 'low-power' : 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.25 : 1.75));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);

    // Soft radial sprite for each particle
    const makeSprite = () => {
      const size = 128;
      const c = document.createElement('canvas');
      c.width = size;
      c.height = size;
      const g = c.getContext('2d')!;
      const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.3, 'rgba(255,255,255,0.55)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = grad;
      g.fillRect(0, 0, size, size);
      const t = new THREE.CanvasTexture(c);
      t.needsUpdate = true;
      return t;
    };
    const sprite = makeSprite();

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: new THREE.Color(SPECIES[0].color),
      size: 3.2,
      map: sprite,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
      opacity: 0.92,
      sizeAttenuation: true,
    });
    const points = new THREE.Points(geo, mat);
    scene.add(points);

    // Second accent layer — subset painted with accent color, additive glow
    const accentCount = Math.floor(N * 0.22);
    const accentIndices: number[] = [];
    for (let i = 0; i < accentCount; i++) {
      accentIndices.push(Math.floor(Math.random() * N));
    }
    const accentPos = new Float32Array(accentCount * 3);
    const accentGeo = new THREE.BufferGeometry();
    accentGeo.setAttribute('position', new THREE.BufferAttribute(accentPos, 3));
    const accentMat = new THREE.PointsMaterial({
      color: new THREE.Color(SPECIES[0].accent),
      size: 4.8,
      map: sprite,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
      opacity: 0.55,
      sizeAttenuation: true,
    });
    const accent = new THREE.Points(accentGeo, accentMat);
    scene.add(accent);

    let raf = 0;
    let lastT = performance.now();
    let rotY = 0;
    let rotX = 0;
    let mx = 0;
    let my = 0;

    const onMouse = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      my = ((e.clientY - r.top) / r.height - 0.5) * 2;
    };
    host.addEventListener('pointermove', onMouse);

    const animate = () => {
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;

      // Idle shimmer — small per-point sinus drift toward target
      const posAttr = geo.getAttribute('position') as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      if (!morphingRef.current) {
        for (let i = 0; i < N; i++) {
          const ix = i * 3;
          const shimmer = 0.25;
          arr[ix] += Math.sin(now * 0.0012 + i * 0.07) * shimmer * dt * 2.5;
          arr[ix + 1] += Math.cos(now * 0.0011 + i * 0.063) * shimmer * dt * 2.5;
          arr[ix + 2] += Math.sin(now * 0.0009 + i * 0.05) * shimmer * dt * 2.5;
        }
        posAttr.needsUpdate = true;
      }

      // sync accent positions to their base indices
      for (let i = 0; i < accentCount; i++) {
        const src = accentIndices[i] * 3;
        accentPos[i * 3] = arr[src];
        accentPos[i * 3 + 1] = arr[src + 1];
        accentPos[i * 3 + 2] = arr[src + 2];
      }
      (accentGeo.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true;

      // smooth cursor-driven rotation
      rotY += (mx * 0.3 - rotY) * 0.05;
      rotX += (my * -0.2 - rotX) * 0.05;
      points.rotation.y = rotY + now * 0.00008;
      points.rotation.x = rotX;
      accent.rotation.copy(points.rotation);

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);

    const onResize = () => {
      const nw = host.clientWidth;
      const nh = host.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', onResize);

    // Morph API — exposed on window so React click handler can trigger it.
    const morphTo = (next: number) => {
      if (morphingRef.current) return;
      morphingRef.current = true;

      // Snapshot start + compute targets for `next`
      const posAttr = geo.getAttribute('position') as THREE.BufferAttribute;
      const arr = posAttr.array as Float32Array;
      startCopy.set(arr);
      const tgt = GENERATORS[next](N);
      targets.set(tgt);
      // Control point per particle = mid + noise offset (turbulent bezier)
      for (let i = 0; i < N; i++) {
        const ix = i * 3;
        const mxp = (startCopy[ix] + targets[ix]) * 0.5;
        const myp = (startCopy[ix + 1] + targets[ix + 1]) * 0.5;
        const mzp = (startCopy[ix + 2] + targets[ix + 2]) * 0.5;
        const jitter = 90;
        controls[ix] = mxp + hashNoise(i, 1) * jitter;
        controls[ix + 1] = myp + hashNoise(i, 2) * jitter;
        controls[ix + 2] = mzp + hashNoise(i, 3) * jitter;
      }

      // Color tween — material color
      const fromColor = new THREE.Color((mat.color as THREE.Color).getHex());
      const toColor = new THREE.Color(SPECIES[next].color);
      const fromAccent = new THREE.Color((accentMat.color as THREE.Color).getHex());
      const toAccent = new THREE.Color(SPECIES[next].accent);

      // Burst event at section center for drama
      try {
        const r = host.getBoundingClientRect();
        window.dispatchEvent(
          new CustomEvent('spiderspins:burst', {
            detail: {
              x: r.left + r.width / 2,
              y: r.top + r.height / 2,
              dist: 720,
            },
          })
        );
      } catch {}

      const state = { t: 0 };
      gsap.to(state, {
        t: 1,
        duration: 2.2,
        ease: 'power2.inOut',
        onUpdate: () => {
          const t = state.t;
          const omt = 1 - t;
          for (let i = 0; i < N; i++) {
            const ix = i * 3;
            // quadratic bezier: (1-t)^2*A + 2(1-t)t*C + t^2*B
            arr[ix] =
              omt * omt * startCopy[ix] +
              2 * omt * t * controls[ix] +
              t * t * targets[ix];
            arr[ix + 1] =
              omt * omt * startCopy[ix + 1] +
              2 * omt * t * controls[ix + 1] +
              t * t * targets[ix + 1];
            arr[ix + 2] =
              omt * omt * startCopy[ix + 2] +
              2 * omt * t * controls[ix + 2] +
              t * t * targets[ix + 2];
          }
          posAttr.needsUpdate = true;
          (mat.color as THREE.Color).copy(fromColor).lerp(toColor, t);
          (accentMat.color as THREE.Color).copy(fromAccent).lerp(toAccent, t);
        },
        onComplete: () => {
          morphingRef.current = false;
        },
      });
    };

    // attach the morph trigger to the host element so React can call it
    (host as any).__morphTo = morphTo;

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      host.removeEventListener('pointermove', onMouse);
      geo.dispose();
      mat.dispose();
      accentGeo.dispose();
      accentMat.dispose();
      sprite.dispose();
      renderer.dispose();
      if (host.contains(renderer.domElement)) host.removeChild(renderer.domElement);
      delete (host as any).__morphTo;
    };
  }, [enabled, tier]);

  const advance = () => {
    if (morphingRef.current) return;
    const next = (activeRef.current + 1) % SPECIES.length;
    setActive(next);
    const host = hostRef.current as any;
    if (host && typeof host.__morphTo === 'function') host.__morphTo(next);
  };

  const current = SPECIES[active];
  const up = SPECIES[(active + 1) % SPECIES.length];

  return (
    <section className="relative z-10 py-24 md:py-32 px-6 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <p className="font-mono text-silk-dim text-[10px] uppercase tracking-[0.42em] mb-4">
            The Menagerie · Live
          </p>
          <h2 className="font-display font-black text-silk leading-[0.95] text-[clamp(2.2rem,6.5vw,4.5rem)]">
            Five species.{' '}
            <span className="text-strike">One web.</span>
          </h2>
          <p className="mt-4 max-w-xl mx-auto font-display font-light text-silk-dim text-sm md:text-base">
            Every tier is a different kind of spider. Tap the web to molt.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_380px] gap-6 items-stretch">
          {/* Stage */}
          <div
            onClick={advance}
            className="relative rounded-lg border border-web/60 bg-abyss/60 overflow-hidden cursor-pointer aspect-[4/3] md:aspect-auto md:h-[520px]"
            style={{
              boxShadow:
                'inset 0 0 80px rgba(239,68,68,0.06), 0 0 40px rgba(0,0,0,0.6)',
            }}
          >
            {/* scanlines + grid accents */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, transparent 0 3px, rgba(255,255,255,0.06) 3px 4px)',
              }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse 70% 55% at 50% 50%, rgba(239,68,68,0.12), transparent 70%)',
              }}
            />
            {enabled === true && (
              <div
                ref={hostRef}
                className="absolute inset-0"
                aria-hidden
              />
            )}
            {enabled === false && (
              <div className="absolute inset-0 flex items-center justify-center">
                <SpiderSilhouette color={current.color} />
              </div>
            )}

            {/* corner HUD ticks */}
            <div className="pointer-events-none absolute top-3 left-3 text-[9px] font-mono tracking-[0.35em] text-silk-dim uppercase">
              WEB · {String(active + 1).padStart(2, '0')}/05
            </div>
            <div className="pointer-events-none absolute top-3 right-3 text-[9px] font-mono tracking-[0.35em] text-silk-dim uppercase">
              {enabled ? 'LIVE' : 'STILL'}
            </div>
            <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex items-center justify-between text-[9px] font-mono tracking-[0.35em] text-shadow uppercase">
              <span>Tap to molt →</span>
              <span>Next · {up.name}</span>
            </div>
          </div>

          {/* Info panel */}
          <div className="relative rounded-lg border border-web/60 bg-cave/40 p-6 md:p-7 flex flex-col justify-between">
            <div>
              <p className="font-mono text-[10px] tracking-[0.42em] text-silk-dim uppercase mb-3">
                {current.tier}
              </p>
              <h3 className="font-display font-black text-silk text-4xl md:text-5xl leading-[0.95] mb-4">
                {current.name}
              </h3>
              <p className="font-display font-light text-silk-dim text-base leading-relaxed mb-6">
                {current.role}
              </p>

              <ul className="space-y-2">
                {SPECIES.map((s, i) => (
                  <li
                    key={s.key}
                    className={`flex items-center gap-3 font-mono text-[11px] tracking-[0.2em] uppercase transition-colors ${
                      i === active ? 'text-silk' : 'text-shadow'
                    }`}
                  >
                    <span
                      className={`h-[6px] w-[6px] rounded-full transition-all ${
                        i === active ? 'scale-125' : ''
                      }`}
                      style={{
                        background:
                          '#' +
                          s.color.toString(16).padStart(6, '0'),
                        boxShadow:
                          i === active
                            ? `0 0 12px #${s.color.toString(16).padStart(6, '0')}`
                            : 'none',
                      }}
                    />
                    <span>{s.name}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={advance}
              className="hover-target mt-6 w-full inline-flex items-center justify-between px-5 py-4 bg-venom hover:bg-strike transition-colors font-display uppercase tracking-[0.22em] text-xs text-silk"
            >
              <span>Molt to {up.name}</span>
              <span aria-hidden>↻</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// Small static SVG silhouette — shown instead of the Three.js canvas on touch
// devices + reduced-motion users.
function SpiderSilhouette({ color }: { color: number }) {
  const hex = '#' + color.toString(16).padStart(6, '0');
  return (
    <svg
      viewBox="-100 -100 200 200"
      className="w-40 h-40 opacity-80"
      aria-hidden
    >
      <g fill="none" stroke={hex} strokeWidth="1.4" strokeLinecap="round">
        {[-1, 1].flatMap((sx) =>
          [
            { ay: 18, ky: -14 },
            { ay: 6, ky: -20 },
            { ay: -6, ky: -16 },
            { ay: -20, ky: -8 },
          ].map((l, i) => (
            <path
              key={`${sx}-${i}`}
              d={`M ${sx * 10} ${l.ay / 2} Q ${sx * 46} ${l.ky} ${sx * 72} ${l.ay}`}
            />
          ))
        )}
      </g>
      <ellipse cx="0" cy="-4" rx="12" ry="14" fill={hex} opacity="0.85" />
      <ellipse cx="0" cy="18" rx="18" ry="24" fill={hex} opacity="0.95" />
      <path d="M -5 14 L 0 24 L 5 14 Z" fill="#ef4444" />
    </svg>
  );
}
