'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

// ======================================================================
// Shared — brand palette + spider particle renderer
// ======================================================================

const EXPLOSION_PALETTE = ['#ef4444', '#b91c1c', '#c4a265', '#e8e8e8'];
type GlyphKind = 'web' | 'spider' | 'dot' | 'fang';

function drawGlyph(
  ctx: CanvasRenderingContext2D,
  kind: GlyphKind,
  size: number,
  color: string
) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.1;
  if (kind === 'web') {
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
  } else if (kind === 'spider') {
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
    ctx.fillStyle = '#050505';
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.55, size * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(0, -size * 0.1, size * 0.12, 0, Math.PI * 2);
    ctx.fill();
  } else if (kind === 'dot') {
    ctx.globalAlpha *= 0.35;
    ctx.beginPath();
    ctx.arc(0, 0, size * 1.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha /= 0.35;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.85, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.moveTo(-size, -size);
    ctx.lineTo(size, -size);
    ctx.lineTo(0, size * 1.2);
    ctx.closePath();
    ctx.stroke();
  }
}

function runDisintegrate(
  canvas: HTMLCanvasElement,
  rect: { width: number; height: number },
  onDone: () => void
) {
  const dpr = Math.min(window.devicePixelRatio, 2);
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';
  const ctx = canvas.getContext('2d')!;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  type P = {
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
    kind: GlyphKind;
    color: string;
    alpha: number;
  };
  const particles: P[] = [];
  const cols = Math.max(18, Math.round(rect.width / 8));
  const rows = Math.max(10, Math.round(rect.height / 8));
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const x = (i / cols) * rect.width + Math.random() * 2;
      const y = (j / rows) * rect.height + Math.random() * 2;
      const dx = x - rect.width / 2;
      const dy = y - rect.height / 2;
      const dist = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.7;
      const speed = 1 + Math.random() * 4 + dist * 0.004;
      const roll = Math.random();
      const kind: GlyphKind =
        roll < 0.4 ? 'web' : roll < 0.62 ? 'dot' : roll < 0.85 ? 'fang' : 'spider';
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        g: 0.18 + Math.random() * 0.08,
        life: 0,
        maxLife: 65 + Math.random() * 55,
        rot: Math.random() * Math.PI * 2,
        rotV: (Math.random() - 0.5) * 0.28,
        size: 2.5 + Math.random() * 5,
        kind,
        color: EXPLOSION_PALETTE[(Math.random() * EXPLOSION_PALETTE.length) | 0],
        alpha: 0.95,
      });
    }
  }
  let raf = 0;
  const drag = 0.992;
  const tick = () => {
    ctx.clearRect(0, 0, rect.width, rect.height);
    let alive = 0;
    for (const p of particles) {
      if (p.life >= p.maxLife) continue;
      p.life++;
      p.vy += p.g;
      p.vx *= drag;
      p.vy *= drag;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.rotV;
      const life01 = p.life / p.maxLife;
      const a = Math.pow(1 - life01, 1.8);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = p.alpha * a;
      drawGlyph(ctx, p.kind, p.size, p.color);
      ctx.restore();
      alive++;
    }
    if (alive > 0) raf = requestAnimationFrame(tick);
    else onDone();
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}

// ======================================================================
// Auth (demo — sessionStorage)
// ======================================================================

const AUTH_KEY = 'spiderspins_auth_user';
const DEPOSITS_KEY = 'spiderspins_deposits';
const CARD_KEY = 'spiderspins_saved_card';

type User = { email: string; name: string };
type Deposit = {
  id: string;
  when: string;
  rail: string;
  amount: number;
  cardLast4?: string;
  brand?: string;
};

function loadUser(): User | null {
  try {
    const raw = sessionStorage.getItem(AUTH_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}
function saveUser(u: User | null) {
  try {
    if (u) sessionStorage.setItem(AUTH_KEY, JSON.stringify(u));
    else sessionStorage.removeItem(AUTH_KEY);
  } catch {}
}
function loadDeposits(): Deposit[] {
  try {
    const raw = sessionStorage.getItem(DEPOSITS_KEY);
    return raw ? (JSON.parse(raw) as Deposit[]) : [];
  } catch {
    return [];
  }
}
function appendDeposit(d: Deposit) {
  try {
    const list = loadDeposits();
    list.unshift(d);
    sessionStorage.setItem(DEPOSITS_KEY, JSON.stringify(list.slice(0, 20)));
  } catch {}
}

// ======================================================================
// Brand detection
// ======================================================================

type Brand = 'visa' | 'mastercard' | 'amex' | 'unknown';

function detectBrand(num: string): Brand {
  const n = num.replace(/\s+/g, '');
  if (/^4/.test(n)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(n)) return 'mastercard';
  if (/^3[47]/.test(n)) return 'amex';
  return 'unknown';
}

function formatCardNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 19);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

function BrandBadge({ brand, size = 'sm' }: { brand: Brand; size?: 'sm' | 'lg' }) {
  const w = size === 'lg' ? 52 : 36;
  const h = size === 'lg' ? 32 : 22;
  if (brand === 'visa') {
    return (
      <span
        className="inline-flex items-center justify-center rounded-sm font-extrabold tracking-[0.12em] italic"
        style={{
          width: w,
          height: h,
          background: 'linear-gradient(135deg, #1a1f71, #0d1250)',
          color: '#f7b600',
          fontSize: size === 'lg' ? 15 : 10,
        }}
      >
        VISA
      </span>
    );
  }
  if (brand === 'mastercard') {
    return (
      <span
        className="inline-flex items-center rounded-sm overflow-hidden"
        style={{ width: w, height: h, background: '#050505' }}
      >
        <span
          className="block"
          style={{
            width: w / 2,
            height: h,
            background: '#eb001b',
            borderRadius: '50%',
            transform: `translateX(${w / 8}px)`,
          }}
        />
        <span
          className="block"
          style={{
            width: w / 2,
            height: h,
            background: '#f79e1b',
            borderRadius: '50%',
            transform: `translateX(-${w / 8}px)`,
            mixBlendMode: 'multiply',
          }}
        />
      </span>
    );
  }
  if (brand === 'amex') {
    return (
      <span
        className="inline-flex items-center justify-center rounded-sm font-extrabold tracking-[0.1em]"
        style={{
          width: w,
          height: h,
          background: '#2E77BB',
          color: '#fff',
          fontSize: size === 'lg' ? 11 : 8,
        }}
      >
        AMEX
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center justify-center rounded-sm font-mono"
      style={{
        width: w,
        height: h,
        background: '#222',
        color: '#888',
        fontSize: size === 'lg' ? 11 : 9,
      }}
    >
      ????
    </span>
  );
}

// ======================================================================
// Card Form — main interactive card (replaces static display)
// ======================================================================

type CardData = {
  number: string;
  name: string;
  expiry: string;
  cvv: string;
  remember: boolean;
};

const EMPTY_CARD: CardData = {
  number: '',
  name: '',
  expiry: '',
  cvv: '',
  remember: true,
};

function loadSavedCard(): Partial<CardData> | null {
  try {
    const raw = sessionStorage.getItem(CARD_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function saveCard(c: CardData | null) {
  try {
    if (c) {
      // Never persist CVV even in demo
      const { cvv, ...rest } = c;
      sessionStorage.setItem(CARD_KEY, JSON.stringify(rest));
    } else {
      sessionStorage.removeItem(CARD_KEY);
    }
  } catch {}
}

function CardForm({
  onSubmit,
  requireAuth,
}: {
  onSubmit: (card: CardData) => void;
  requireAuth: () => boolean;
}) {
  const [card, setCard] = useState<CardData>(EMPTY_CARD);
  const [exploding, setExploding] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const saved = loadSavedCard();
    if (saved) setCard((c) => ({ ...c, ...saved, cvv: '' }));
  }, []);

  const brand = useMemo<Brand>(() => detectBrand(card.number), [card.number]);
  const last4 = card.number.replace(/\D/g, '').slice(-4);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!card.number || !card.name || !card.expiry || !card.cvv) return;
    if (!requireAuth()) return;
    if (card.remember) {
      saveCard(card);
    } else {
      saveCard(null);
    }
    onSubmit(card);
  };

  const triggerDisintegrate = () => {
    if (exploding) return;
    const el = cardRef.current;
    const canvas = canvasRef.current;
    if (!el || !canvas) return;
    const rect = el.getBoundingClientRect();
    setExploding(true);
    runDisintegrate(
      canvas,
      { width: rect.width, height: rect.height },
      () => {
        saveCard(null);
        setCard(EMPTY_CARD);
        setExploding(false);
      }
    );
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="grid md:grid-cols-[1fr_1fr] gap-6 items-start">
        {/* Live-preview card */}
        <div className="relative">
          <div
            ref={cardRef}
            className={[
              'payment-card relative rounded-2xl overflow-hidden aspect-[1.586/1] transition-opacity duration-300',
              exploding ? 'opacity-0' : 'opacity-100',
            ].join(' ')}
          >
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(135deg, #0a0a0a 0%, #1a0505 55%, #2a0808 100%)',
              }}
            />
            <div
              className="absolute left-0 right-0 top-[22%] h-[2px]"
              style={{
                background:
                  'linear-gradient(90deg, transparent, #ef4444 30%, #b91c1c 70%, transparent)',
              }}
            />
            <svg
              aria-hidden
              viewBox="0 0 400 250"
              className="absolute inset-0 w-full h-full opacity-20"
            >
              <g stroke="#e8e8e8" strokeWidth="0.4" fill="none">
                {Array.from({ length: 12 }).map((_, i) => {
                  const a = (i / 12) * Math.PI * 2;
                  return (
                    <line
                      key={i}
                      x1="320"
                      y1="60"
                      x2={320 + Math.cos(a) * 260}
                      y2={60 + Math.sin(a) * 260}
                    />
                  );
                })}
                {[30, 55, 80, 110].map((r) => (
                  <circle key={r} cx="320" cy="60" r={r} />
                ))}
              </g>
            </svg>

            <div
              className="absolute left-5 top-11 w-10 h-8 rounded-sm"
              style={{
                background: 'linear-gradient(135deg, #c4a265, #8b7355)',
                boxShadow: 'inset 0 0 4px rgba(0,0,0,0.5)',
              }}
            >
              <div className="absolute inset-x-1 inset-y-2 border border-[#2a1f10]/60" />
            </div>

            <div className="relative p-5 h-full flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <span className="font-display font-light tracking-[0.26em] text-silk uppercase text-xs">
                  SpiderSpins
                </span>
                <BrandBadge brand={brand} size="lg" />
              </div>

              <div>
                <div className="font-mono tabular-nums text-silk text-lg md:text-xl tracking-[0.1em] min-h-[1.5em]">
                  {card.number
                    ? formatCardNumber(card.number).padEnd(19, '•').replace(/(.{4})/g, '$1 ').trim()
                    : '•••• •••• •••• ••••'}
                </div>
                <div className="mt-3 flex items-end justify-between">
                  <div>
                    <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-shadow">
                      Cardholder
                    </div>
                    <div className="font-display font-medium text-silk text-sm uppercase">
                      {card.name || 'M. Petrovic'}
                    </div>
                  </div>
                  <div>
                    <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-shadow text-right">
                      Exp
                    </div>
                    <div className="font-mono text-silk text-sm">
                      {card.expiry || '•• / ••'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <canvas
            ref={canvasRef}
            aria-hidden
            className="pointer-events-none absolute inset-0 w-full h-full"
          />

          <div className="mt-4 flex items-center justify-between">
            <div className="font-mono text-[10px] uppercase tracking-[0.26em] text-shadow">
              {brand === 'unknown' ? 'Awaiting rail…' : `Detected: ${brand.toUpperCase()}`}
            </div>
            <button
              type="button"
              onClick={triggerDisintegrate}
              disabled={exploding}
              className="hover-target inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.26em] text-strike/85 hover:text-strike disabled:opacity-40"
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                aria-hidden
              >
                <path d="M3 4h10M5.5 4V2.5h5V4M6 7v5M10 7v5M4 4l1 10h6l1-10" />
              </svg>
              {last4.length === 4 ? `Remove •••• ${last4}` : 'Disintegrate card'}
            </button>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-web/70 bg-cave/60 p-5 md:p-6 space-y-4"
        >
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-[0.28em] text-silk-dim mb-1.5">
              Card number
            </label>
            <div className="relative">
              <input
                inputMode="numeric"
                autoComplete="cc-number"
                value={formatCardNumber(card.number)}
                onChange={(e) =>
                  setCard({ ...card, number: e.target.value.replace(/\D/g, '').slice(0, 19) })
                }
                placeholder="4242 4242 4242 4242"
                className="hover-target w-full rounded-md border border-web/70 bg-void/60 text-silk font-mono tabular-nums text-sm px-3 py-2.5 pr-14 outline-none focus:border-strike/70"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2">
                <BrandBadge brand={brand} />
              </span>
            </div>
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-[0.28em] text-silk-dim mb-1.5">
              Cardholder
            </label>
            <input
              autoComplete="cc-name"
              value={card.name}
              onChange={(e) => setCard({ ...card, name: e.target.value })}
              placeholder="M. Petrovic"
              className="hover-target w-full rounded-md border border-web/70 bg-void/60 text-silk font-display text-sm px-3 py-2.5 outline-none focus:border-strike/70"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-[0.28em] text-silk-dim mb-1.5">
                Expiry
              </label>
              <input
                inputMode="numeric"
                autoComplete="cc-exp"
                value={card.expiry}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
                  const next =
                    digits.length > 2 ? `${digits.slice(0, 2)} / ${digits.slice(2)}` : digits;
                  setCard({ ...card, expiry: next });
                }}
                placeholder="11 / 28"
                className="hover-target w-full rounded-md border border-web/70 bg-void/60 text-silk font-mono text-sm px-3 py-2.5 outline-none focus:border-strike/70"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-[0.28em] text-silk-dim mb-1.5">
                CVV
              </label>
              <input
                type="password"
                inputMode="numeric"
                autoComplete="cc-csc"
                value={card.cvv}
                onChange={(e) =>
                  setCard({ ...card, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })
                }
                placeholder="•••"
                className="hover-target w-full rounded-md border border-web/70 bg-void/60 text-silk font-mono text-sm px-3 py-2.5 outline-none focus:border-strike/70"
              />
            </div>
          </div>
          <label className="hover-target flex items-center gap-2 text-sm text-silk-dim font-display cursor-pointer select-none">
            <input
              type="checkbox"
              checked={card.remember}
              onChange={(e) => setCard({ ...card, remember: e.target.checked })}
              className="accent-[#ef4444]"
            />
            Remember this card
            <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-shadow ml-auto">
              CVV never stored
            </span>
          </label>
          <button
            type="submit"
            disabled={
              !card.number || !card.name || !card.expiry || !card.cvv
            }
            className="hover-target w-full py-3 rounded-md bg-venom hover:bg-strike transition-colors text-silk font-display uppercase tracking-[0.22em] text-xs shadow-strike-glow disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Deposit
          </button>
          <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-shadow text-center">
            Demo — no real charges are made
          </p>
        </form>
      </div>
    </div>
  );
}

// ======================================================================
// Crypto chips
// ======================================================================

type Crypto = {
  symbol: string;
  name: string;
  glyph: string;
  color: string;
  sub: string;
};

const CRYPTOS: Crypto[] = [
  { symbol: 'BTC', name: 'Bitcoin', glyph: '₿', color: '#ef4444', sub: 'Fastest rails' },
  { symbol: 'ETH', name: 'Ethereum', glyph: 'Ξ', color: '#b91c1c', sub: 'L1 settlement' },
  { symbol: 'LTC', name: 'Litecoin', glyph: 'Ł', color: '#c4a265', sub: 'Low fees' },
  { symbol: 'LN', name: 'Lightning', glyph: '⚡', color: '#ef4444', sub: 'Instant' },
];

function CryptoChip({
  crypto,
  onOpenDeposit,
}: {
  crypto: Crypto;
  onOpenDeposit: (c: Crypto) => void;
}) {
  const chipRef = useRef<HTMLButtonElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [state, setState] = useState<'idle' | 'exploding' | 'gone' | 'renewing'>('idle');
  const autoTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (autoTimerRef.current) window.clearTimeout(autoTimerRef.current);
    };
  }, []);

  const trigger = () => {
    if (state !== 'idle') return;
    const chip = chipRef.current;
    const canvas = canvasRef.current;
    if (!chip || !canvas) return;
    const rect = chip.getBoundingClientRect();
    setState('exploding');
    onOpenDeposit(crypto);
    runDisintegrate(canvas, { width: rect.width, height: rect.height }, () => {
      setState('gone');
      autoTimerRef.current = window.setTimeout(() => {
        setState('renewing');
        window.setTimeout(() => setState('idle'), 450);
      }, 1600);
    });
  };

  const visible = state === 'idle' || state === 'renewing';

  return (
    <div className="relative">
      <button
        ref={chipRef}
        onClick={trigger}
        disabled={state !== 'idle'}
        className={[
          'crypto-chip hover-target relative w-full flex items-center gap-3 px-4 py-3 rounded-lg border bg-cave/80 transition-all duration-500',
          visible
            ? 'border-web-light/50 hover:border-strike/60 hover:-translate-y-0.5 opacity-100'
            : 'border-transparent opacity-0 pointer-events-none',
        ].join(' ')}
        style={{
          boxShadow:
            state === 'idle'
              ? `0 4px 14px -10px ${crypto.color}80, inset 0 0 0 1px rgba(34,34,34,0.9)`
              : state === 'renewing'
              ? `0 0 24px -4px ${crypto.color}aa, inset 0 0 0 1px ${crypto.color}55`
              : 'none',
        }}
      >
        <span
          className="flex items-center justify-center w-9 h-9 rounded-md font-bold text-[15px] shrink-0"
          style={{ background: crypto.color, color: '#050505' }}
        >
          {crypto.glyph}
        </span>
        <div className="flex-1 text-left">
          <div className="font-display text-silk text-sm tracking-wide">
            {crypto.name}
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-shadow">
            {state === 'renewing' ? 'Web rebuilding…' : crypto.sub}
          </div>
        </div>
        <span
          className="font-mono text-[9px] uppercase tracking-[0.28em] text-silk-dim"
          aria-hidden
        >
          {crypto.symbol}
        </span>
      </button>
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 w-full h-full"
      />
      {state === 'gone' && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center font-mono text-[10px] uppercase tracking-[0.28em] text-shadow">
          <span className="opacity-60">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-strike animate-pulse mr-2 align-middle" />
            respawning the silk…
          </span>
        </div>
      )}
    </div>
  );
}

// ======================================================================
// Deposit popup — generic (crypto OR card)
// ======================================================================

type DepositContext =
  | { kind: 'crypto'; crypto: Crypto }
  | { kind: 'card'; card: CardData; brand: Brand };

function DepositPopup({
  ctx,
  onClose,
  onConfirm,
}: {
  ctx: DepositContext | null;
  onClose: () => void;
  onConfirm: (amount: number) => void;
}) {
  const [amount, setAmount] = useState<number>(100);

  useEffect(() => {
    if (!ctx) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [ctx, onClose]);

  if (!ctx) return null;

  const accent = ctx.kind === 'crypto' ? ctx.crypto.color : '#ef4444';
  const title = ctx.kind === 'crypto' ? ctx.crypto.name : 'Card';
  const subLabel =
    ctx.kind === 'crypto'
      ? 'Deposit rail'
      : `${ctx.brand.toUpperCase()} •••• ${ctx.card.number.replace(/\D/g, '').slice(-4)}`;
  const confirmLabel =
    ctx.kind === 'crypto'
      ? `Confirm — $${amount}`
      : `Deposit $${amount} with ${ctx.brand === 'unknown' ? 'card' : ctx.brand.toUpperCase()}`;

  const rate: Record<string, string> = {
    BTC: '0.00146 BTC',
    ETH: '0.038 ETH',
    LTC: '1.32 LTC',
    LN: 'instant',
  };
  const conf: Record<string, string> = {
    BTC: '~2 min',
    ETH: '~2 min',
    LTC: '~1 min',
    LN: '~1 sec',
  };

  return (
    <div
      role="dialog"
      aria-label={`Deposit ${title}`}
      className="fixed inset-0 z-[150] flex items-center justify-center px-4"
    >
      <div
        onClick={onClose}
        aria-hidden
        className="absolute inset-0 bg-void/75 backdrop-blur-sm"
        style={{ animation: 'fadeInBackdrop 0.24s ease-out' }}
      />
      <div
        className="relative w-full max-w-md rounded-2xl border border-web/70 bg-cave/95 p-6 md:p-7 overflow-hidden"
        style={{
          boxShadow: `0 30px 80px -30px ${accent}80, inset 0 0 0 1px rgba(34,34,34,0.9)`,
          animation: 'popupEnter 0.3s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        <svg
          aria-hidden
          className="pointer-events-none absolute -top-10 -right-10 w-52 h-52 opacity-20"
          viewBox="0 0 200 200"
        >
          <g stroke={accent} strokeWidth="0.5" fill="none">
            {Array.from({ length: 14 }).map((_, i) => {
              const a = (i / 14) * Math.PI * 2;
              return (
                <line
                  key={i}
                  x1="100"
                  y1="100"
                  x2={100 + Math.cos(a) * 140}
                  y2={100 + Math.sin(a) * 140}
                />
              );
            })}
            {[30, 55, 80, 110].map((r) => (
              <circle key={r} cx="100" cy="100" r={r} />
            ))}
          </g>
        </svg>

        <div className="relative flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            {ctx.kind === 'crypto' ? (
              <span
                className="flex items-center justify-center w-10 h-10 rounded-md font-bold text-lg shrink-0"
                style={{ background: ctx.crypto.color, color: '#050505' }}
              >
                {ctx.crypto.glyph}
              </span>
            ) : (
              <BrandBadge brand={ctx.brand} size="lg" />
            )}
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-shadow">
                {subLabel}
              </div>
              <div className="font-display font-extrabold text-silk text-xl tracking-wide">
                {title}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="hover-target w-8 h-8 rounded-md border border-web hover:border-strike/60 text-silk-dim hover:text-strike transition-colors flex items-center justify-center"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6l-12 12" />
            </svg>
          </button>
        </div>

        <div className="relative space-y-5">
          <div>
            <div className="flex items-baseline justify-between mb-2">
              <label className="font-mono text-[10px] uppercase tracking-[0.28em] text-silk-dim">
                Amount (USD)
              </label>
              <span className="font-mono text-strike font-bold text-xl">
                ${amount.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min={20}
              max={1000}
              step={10}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="hover-target w-full deposit-slider"
            />
            <div className="flex justify-between mt-1 font-mono text-[9px] uppercase tracking-[0.22em] text-shadow">
              <span>$20</span>
              <span>$1,000</span>
            </div>
          </div>

          {ctx.kind === 'crypto' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-web/70 bg-void/60 p-3">
                  <div className="font-mono text-[9px] uppercase tracking-[0.28em] text-shadow">
                    Equivalent
                  </div>
                  <div className="font-mono text-silk text-sm mt-0.5">
                    {rate[ctx.crypto.symbol]}
                  </div>
                </div>
                <div className="rounded-lg border border-web/70 bg-void/60 p-3">
                  <div className="font-mono text-[9px] uppercase tracking-[0.28em] text-shadow">
                    Confirmation
                  </div>
                  <div className="font-mono text-silk text-sm mt-0.5">
                    {conf[ctx.crypto.symbol]}
                  </div>
                </div>
              </div>
              <div className="rounded-lg border border-venom/30 bg-venom/5 p-3">
                <div className="font-mono text-[9px] uppercase tracking-[0.28em] text-shadow mb-1">
                  Your {ctx.crypto.name} deposit address
                </div>
                <div className="font-mono text-silk text-xs break-all tabular-nums">
                  {ctx.crypto.symbol === 'BTC'
                    ? 'bc1qspdrspins0w3b0catch3s3v3ryth1ngwh0ar1gntsilk'
                    : ctx.crypto.symbol === 'ETH'
                    ? '0xSPIDER5P1N5a7bC3D4e5f6A1b2C3d4E5f6A7b8C9d0'
                    : ctx.crypto.symbol === 'LTC'
                    ? 'ltc1qspidersp1ns0w3b0catch3s3v3rythingn0w'
                    : 'lnbc1spiderspinsinstantsilkwebdeposittoday'}
                </div>
              </div>
            </>
          )}

          {ctx.kind === 'card' && (
            <div className="rounded-lg border border-venom/30 bg-venom/5 p-3">
              <div className="font-mono text-[9px] uppercase tracking-[0.28em] text-shadow mb-1">
                Card on file
              </div>
              <div className="flex items-center justify-between">
                <div className="font-mono text-silk text-sm tabular-nums">
                  •••• •••• •••• {ctx.card.number.replace(/\D/g, '').slice(-4)}
                </div>
                <BrandBadge brand={ctx.brand} />
              </div>
              <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.24em] text-silk-dim">
                Exp {ctx.card.expiry} · {ctx.card.name}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={() => {
                onConfirm(amount);
                onClose();
              }}
              className="hover-target flex-1 py-3 rounded-md border border-strike/60 bg-strike/10 hover:bg-strike/20 transition-colors text-strike font-display uppercase tracking-[0.22em] text-xs"
            >
              {confirmLabel}
            </button>
            <button
              onClick={onClose}
              className="hover-target py-3 px-4 rounded-md border border-web/70 hover:border-web-light text-silk-dim hover:text-silk font-display uppercase tracking-[0.22em] text-xs"
            >
              Cancel
            </button>
          </div>

          <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-shadow text-center">
            Demo — no funds are actually moved
          </p>
        </div>
      </div>
    </div>
  );
}

// ======================================================================
// Auth modal — sign in / sign up (sessionStorage demo)
// ======================================================================

function AuthModal({
  open,
  mode,
  onClose,
  onAuthed,
}: {
  open: boolean;
  mode: 'signin' | 'signup';
  onClose: () => void;
  onAuthed: (u: User) => void;
}) {
  const [currentMode, setCurrentMode] = useState(mode);
  useEffect(() => setCurrentMode(mode), [mode]);

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [pw, setPw] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.includes('@') || pw.length < 4) {
      setError('Valid email + password (4+ chars) required.');
      return;
    }
    const user: User = {
      email,
      name: currentMode === 'signup' ? name || email.split('@')[0] : email.split('@')[0],
    };
    saveUser(user);
    onAuthed(user);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-label={currentMode === 'signup' ? 'Sign up' : 'Sign in'}
      className="fixed inset-0 z-[160] flex items-center justify-center px-4"
    >
      <div
        onClick={onClose}
        aria-hidden
        className="absolute inset-0 bg-void/75 backdrop-blur-sm"
        style={{ animation: 'fadeInBackdrop 0.24s ease-out' }}
      />
      <form
        onSubmit={submit}
        className="relative w-full max-w-sm rounded-2xl border border-web/70 bg-cave/95 p-6"
        style={{
          boxShadow: '0 30px 80px -30px rgba(239,68,68,0.55), inset 0 0 0 1px rgba(34,34,34,0.9)',
          animation: 'popupEnter 0.3s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-shadow">
              The Colony
            </div>
            <div className="font-display font-extrabold text-silk text-xl tracking-wide">
              {currentMode === 'signup' ? 'Join the web' : 'Welcome back'}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="hover-target w-8 h-8 rounded-md border border-web hover:border-strike/60 text-silk-dim hover:text-strike transition-colors flex items-center justify-center"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6l-12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-3">
          {currentMode === 'signup' && (
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-[0.28em] text-silk-dim mb-1.5">
                Display name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="widow_01"
                className="hover-target w-full rounded-md border border-web/70 bg-void/60 text-silk font-display text-sm px-3 py-2.5 outline-none focus:border-strike/70"
              />
            </div>
          )}
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-[0.28em] text-silk-dim mb-1.5">
              Email
            </label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@colony.silk"
              className="hover-target w-full rounded-md border border-web/70 bg-void/60 text-silk font-display text-sm px-3 py-2.5 outline-none focus:border-strike/70"
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-[0.28em] text-silk-dim mb-1.5">
              Password
            </label>
            <input
              type="password"
              autoComplete={currentMode === 'signup' ? 'new-password' : 'current-password'}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="••••••••"
              className="hover-target w-full rounded-md border border-web/70 bg-void/60 text-silk font-display text-sm px-3 py-2.5 outline-none focus:border-strike/70"
            />
          </div>
          {error && (
            <div className="font-mono text-[11px] text-strike">{error}</div>
          )}
        </div>

        <button
          type="submit"
          className="hover-target mt-5 w-full py-3 rounded-md bg-venom hover:bg-strike transition-colors text-silk font-display uppercase tracking-[0.22em] text-xs shadow-strike-glow"
        >
          {currentMode === 'signup' ? 'Create account' : 'Sign in'}
        </button>

        <button
          type="button"
          onClick={() =>
            setCurrentMode(currentMode === 'signup' ? 'signin' : 'signup')
          }
          className="hover-target mt-3 w-full text-center font-mono text-[10px] uppercase tracking-[0.28em] text-silk-dim hover:text-strike"
        >
          {currentMode === 'signup'
            ? 'Already have an account? Sign in'
            : 'New to the Colony? Sign up'}
        </button>

        <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.24em] text-shadow text-center">
          Demo — credentials stored locally in this session only
        </p>
      </form>
    </div>
  );
}

// ======================================================================
// Main section
// ======================================================================

export default function PaymentCard() {
  const [depositCtx, setDepositCtx] = useState<DepositContext | null>(null);
  const [authOpen, setAuthOpen] = useState<false | 'signin' | 'signup'>(false);
  const [user, setUser] = useState<User | null>(null);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [paidFlash, setPaidFlash] = useState<{ amount: number; rail: string } | null>(null);

  useEffect(() => {
    setUser(loadUser());
    setDeposits(loadDeposits());
  }, []);

  const requireAuth = () => {
    if (!user) {
      setAuthOpen('signin');
      return false;
    }
    return true;
  };

  const onConfirmDeposit = (amount: number) => {
    if (!depositCtx) return;
    const rail =
      depositCtx.kind === 'crypto' ? depositCtx.crypto.name : 'Card';
    const dep: Deposit = {
      id: Math.random().toString(36).slice(2, 10),
      when: new Date().toISOString(),
      rail,
      amount,
      cardLast4:
        depositCtx.kind === 'card'
          ? depositCtx.card.number.replace(/\D/g, '').slice(-4)
          : undefined,
      brand: depositCtx.kind === 'card' ? depositCtx.brand : undefined,
    };
    appendDeposit(dep);
    setDeposits(loadDeposits());

    // Celebration: fire a centered confetti burst + green Paid flash
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
    setPaidFlash({ amount, rail });
    window.setTimeout(() => setPaidFlash(null), 2400);
  };

  return (
    <section id="cashier" className="relative z-10 py-24 md:py-32 px-6">
      <div className="max-w-4xl mx-auto text-center mb-10">
        <p className="font-mono text-silk-dim text-[11px] uppercase tracking-[0.42em] mb-4">
          Cashier
        </p>
        <h2 className="font-display font-black text-silk leading-[0.95] text-[clamp(2rem,5.5vw,3.8rem)]">
          Pay fast. <span className="text-strike">Vanish faster</span>.
        </h2>
        <p className="mt-5 max-w-xl mx-auto font-display font-light text-silk-dim text-base md:text-lg">
          Your card is detected as you type. Tap any rail — the silk dissolves,
          a deposit popup opens, and the web rebuilds itself.
        </p>

        {/* Auth bar */}
        <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-web/70 bg-cave/60 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.28em]">
          {user ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-strike shadow-[0_0_8px_#ef4444]" />
              <span className="text-silk">{user.name}</span>
              <span className="text-shadow">·</span>
              <span className="text-silk-dim">{user.email}</span>
              <button
                onClick={() => {
                  saveUser(null);
                  setUser(null);
                }}
                className="hover-target text-silk-dim hover:text-strike ml-2"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <span className="text-shadow">Guest</span>
              <span className="text-shadow">·</span>
              <button
                onClick={() => setAuthOpen('signin')}
                className="hover-target text-silk hover:text-strike"
              >
                Sign in
              </button>
              <span className="text-shadow">/</span>
              <button
                onClick={() => setAuthOpen('signup')}
                className="hover-target text-fang hover:text-strike"
              >
                Create account
              </button>
            </>
          )}
        </div>
      </div>

      {/* Card form */}
      <CardForm
        requireAuth={requireAuth}
        onSubmit={(card) => {
          const brand = detectBrand(card.number);
          setDepositCtx({ kind: 'card', card, brand });
        }}
      />

      {/* Crypto options — dedicated anchor so CTAs can land directly here
          instead of at the card-form top. */}
      <div id="play-crypto" className="max-w-2xl mx-auto mt-14 scroll-mt-24">
        <div className="flex items-center justify-between mb-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-fang">
            Play with crypto
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-shadow">
            Tap a rail to deposit
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CRYPTOS.map((c) => (
            <CryptoChip
              key={c.symbol}
              crypto={c}
              onOpenDeposit={(cx) => {
                if (!requireAuth()) return;
                setDepositCtx({ kind: 'crypto', crypto: cx });
              }}
            />
          ))}
        </div>
      </div>

      {/* Personal deposit history — signed-in only */}
      <div className="max-w-2xl mx-auto mt-12">
        <div className="rounded-2xl border border-web/70 bg-cave/50 p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-strike">
              Your deposits
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.28em] text-shadow">
              {user ? `${deposits.length} entries` : 'Sign in to view'}
            </div>
          </div>

          {!user && (
            <button
              onClick={() => setAuthOpen('signin')}
              className="hover-target w-full py-6 rounded-lg border border-dashed border-web/70 hover:border-strike/60 text-silk-dim hover:text-silk font-display text-sm uppercase tracking-[0.22em]"
            >
              Sign in to see your history
            </button>
          )}

          {user && deposits.length === 0 && (
            <div className="py-5 text-center font-mono text-[11px] uppercase tracking-[0.26em] text-shadow">
              No deposits yet — run one above.
            </div>
          )}

          {user && deposits.length > 0 && (
            <ul className="divide-y divide-web/50">
              {deposits.map((d) => (
                <li
                  key={d.id}
                  className="py-3 flex items-center gap-4 font-mono text-[11px]"
                >
                  <span className="text-silk-dim tabular-nums">
                    {new Date(d.when).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <span className="text-silk flex-1 uppercase tracking-[0.22em]">
                    {d.rail}
                    {d.cardLast4 && (
                      <span className="text-shadow ml-2">
                        •••• {d.cardLast4}
                      </span>
                    )}
                  </span>
                  {d.brand && (
                    <BrandBadge brand={d.brand as Brand} />
                  )}
                  <span className="text-strike font-bold tabular-nums">
                    ${d.amount}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Paid flash (celebration) */}
      {paidFlash && (
        <div
          role="status"
          aria-live="polite"
          className="paid-flash fixed top-24 left-1/2 -translate-x-1/2 z-[170] rounded-full border border-emerald-500/60 bg-emerald-900/30 backdrop-blur-md px-5 py-3 flex items-center gap-3 shadow-[0_0_40px_rgba(16,185,129,0.35)]"
        >
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500 text-[#050505]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 12l5 5 9-11" />
            </svg>
          </span>
          <div className="flex flex-col leading-tight">
            <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-emerald-300">
              Paid · {paidFlash.rail}
            </span>
            <span className="font-display font-bold text-silk text-base">
              ${paidFlash.amount.toLocaleString()}{' '}
              <span className="text-silk-dim text-xs font-light">landed in the web</span>
            </span>
          </div>
        </div>
      )}

      {/* Popups */}
      <DepositPopup
        ctx={depositCtx}
        onClose={() => setDepositCtx(null)}
        onConfirm={onConfirmDeposit}
      />
      <AuthModal
        open={!!authOpen}
        mode={authOpen || 'signin'}
        onClose={() => setAuthOpen(false)}
        onAuthed={(u) => setUser(u)}
      />
    </section>
  );
}
