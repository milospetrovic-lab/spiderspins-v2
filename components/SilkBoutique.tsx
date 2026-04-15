'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

// Silk Boutique — Spider-Points → Chips store.
// Loyalty economy modeled on EveryMatrix-style comp shops, spider-reskinned.

type ShopItem = {
  id: string;
  name: string;
  blurb: string;
  cost: number; // Silk Points
  tier: 'Any' | 'Weaver+' | 'Widow+' | 'Empress';
  glyph: string;
  color: string;
};

const items: ShopItem[] = [
  {
    id: 'chip-10',
    name: '$10 Cash Chip',
    blurb: 'Convert straight to cashable balance. No wagering.',
    cost: 2000,
    tier: 'Any',
    glyph: '🪙',
    color: '#c4a265',
  },
  {
    id: 'chip-50',
    name: '$50 Cash Chip',
    blurb: 'Five grey chips for the bankroll. Wager-free withdrawal.',
    cost: 9500,
    tier: 'Any',
    glyph: '🪙',
    color: '#c4a265',
  },
  {
    id: 'fs-25',
    name: '25 Free Silk Spins',
    blurb: 'Widow\'s Web · featured slot · $0.20 stake each.',
    cost: 1200,
    tier: 'Any',
    glyph: '🕸',
    color: '#ef4444',
  },
  {
    id: 'fs-100',
    name: '100 Free Silk Spins',
    blurb: 'Pick any Weaver-tier slot. Max win cap: $500.',
    cost: 4200,
    tier: 'Weaver+',
    glyph: '🕸',
    color: '#ef4444',
  },
  {
    id: 'tourn-bronze',
    name: 'Bronze Tournament Entry',
    blurb: 'Weekly slot tournament · bronze bracket · $5K prize pool.',
    cost: 800,
    tier: 'Any',
    glyph: '🎟',
    color: '#888',
  },
  {
    id: 'tourn-gold',
    name: 'Gold Tournament Entry',
    blurb: 'Weekly tournament · gold bracket · $50K prize pool.',
    cost: 6500,
    tier: 'Widow+',
    glyph: '🎟',
    color: '#c4a265',
  },
  {
    id: 'bonus-reload',
    name: '50% Reload Boost',
    blurb: 'Next deposit · +50% up to $500 · 20× wagering.',
    cost: 3000,
    tier: 'Any',
    glyph: '⚡',
    color: '#b91c1c',
  },
  {
    id: 'merch-hoodie',
    name: 'Widow Hoodie',
    blurb: 'Black hourglass embroidered. Limited drop · ships worldwide.',
    cost: 12000,
    tier: 'Widow+',
    glyph: '👕',
    color: '#e8e8e8',
  },
  {
    id: 'exp-weekend',
    name: 'Colony Weekend',
    blurb: '2-night stay · team event · Empress-tier experience.',
    cost: 80000,
    tier: 'Empress',
    glyph: '✈',
    color: '#c4a265',
  },
];

export default function SilkBoutique() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [balance, setBalance] = useState(14250);
  const [redeemed, setRedeemed] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      gsap.from(section.querySelectorAll('.shop-reveal'), {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.06,
        ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 78%' },
      });
    }, section);
    return () => ctx.revert();
  }, []);

  const redeem = (item: ShopItem) => {
    if (balance < item.cost) {
      setToast(`Not enough silk — need ${item.cost - balance} more`);
      window.setTimeout(() => setToast(null), 2400);
      return;
    }
    setBalance((b) => b - item.cost);
    setRedeemed((r) => [...r, item.id]);
    setToast(`Redeemed: ${item.name}`);
    try {
      window.dispatchEvent(
        new CustomEvent('spiderspins:burst', {
          detail: {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            dist: 900,
          },
        })
      );
    } catch {}
    window.setTimeout(() => setToast(null), 2600);
  };

  return (
    <section
      ref={sectionRef}
      id="boutique"
      className="relative z-10 py-24 md:py-32 px-6"
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 md:mb-14 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="shop-reveal font-mono text-silk-dim text-[11px] uppercase tracking-[0.42em] mb-3">
              Silk Boutique · loyalty
            </p>
            <h2 className="shop-reveal font-display font-black text-silk leading-[0.95] text-[clamp(2rem,5.5vw,3.8rem)]">
              Spend your <em className="text-strike not-italic">silk</em>.
            </h2>
            <p className="shop-reveal mt-4 max-w-xl font-display font-light text-silk-dim text-base md:text-lg">
              Every wager earns Silk Points. Redeem them for cash chips, free spins, tournament entries, merch — or the web itself, if you weave long enough.
            </p>
          </div>
          {/* balance card */}
          <div className="shop-reveal inline-flex items-center gap-4 rounded-xl border border-fang/40 bg-cave/60 px-5 py-4 shadow-[0_10px_40px_-20px_rgba(196,162,101,0.5)]">
            <div
              className="flex items-center justify-center w-12 h-12 rounded-lg"
              style={{
                background: 'linear-gradient(135deg, #c4a265, #8b7355)',
                boxShadow: 'inset 0 0 6px rgba(0,0,0,0.4)',
              }}
            >
              <span className="text-lg">🕸</span>
            </div>
            <div>
              <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-silk-dim">
                Your balance
              </div>
              <div className="font-mono font-bold text-fang text-2xl tabular-nums">
                {balance.toLocaleString()}
              </div>
              <div className="font-mono text-[9px] uppercase tracking-[0.28em] text-shadow mt-0.5">
                Silk Points
              </div>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="shop-reveal grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => {
            const gone = redeemed.includes(item.id);
            const affordable = balance >= item.cost;
            return (
              <div
                key={item.id}
                className={[
                  'relative rounded-xl border p-5 transition-all duration-300 group',
                  gone
                    ? 'border-fang/40 bg-fang/5 opacity-70'
                    : affordable
                    ? 'border-web/70 bg-cave/60 hover:border-strike/60 hover:-translate-y-0.5'
                    : 'border-web/50 bg-cave/40 opacity-80',
                ].join(' ')}
              >
                <div className="flex items-start justify-between mb-4">
                  <span
                    className="inline-flex items-center justify-center w-11 h-11 rounded-lg text-xl"
                    style={{
                      background: `${item.color}22`,
                      border: `1px solid ${item.color}55`,
                      color: item.color,
                    }}
                  >
                    {item.glyph}
                  </span>
                  <span
                    className={[
                      'font-mono text-[9px] uppercase tracking-[0.22em] px-2 py-0.5 rounded',
                      item.tier === 'Empress'
                        ? 'text-fang border border-fang/50'
                        : item.tier === 'Widow+'
                        ? 'text-strike border border-strike/50'
                        : item.tier === 'Weaver+'
                        ? 'text-silk-dim border border-web-light'
                        : 'text-shadow border border-web',
                    ].join(' ')}
                  >
                    {item.tier}
                  </span>
                </div>

                <h3 className="font-display font-extrabold text-silk text-lg leading-tight mb-1">
                  {item.name}
                </h3>
                <p className="font-display font-light text-silk-dim text-[13px] leading-relaxed min-h-[3em]">
                  {item.blurb}
                </p>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="font-mono tabular-nums">
                    <span className="text-fang font-bold">{item.cost.toLocaleString()}</span>
                    <span className="text-shadow text-[10px] uppercase tracking-[0.24em] ml-1.5">silk</span>
                  </div>
                  <button
                    onClick={() => redeem(item)}
                    disabled={gone || !affordable}
                    className={[
                      'hover-target inline-flex items-center gap-1.5 px-3 py-2 rounded-md font-display uppercase tracking-[0.2em] text-[11px] transition-colors',
                      gone
                        ? 'border border-fang/40 text-fang cursor-not-allowed'
                        : affordable
                        ? 'border border-strike/60 bg-strike/10 text-strike hover:bg-strike/20'
                        : 'border border-web text-silk-dim cursor-not-allowed',
                    ].join(' ')}
                  >
                    {gone ? '✓ Redeemed' : affordable ? 'Redeem' : 'Not enough'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <p className="shop-reveal mt-8 text-center font-mono text-[10px] uppercase tracking-[0.28em] text-shadow">
          Demo — Silk Points balance stored locally for prototype · real balance ties to your account
        </p>
      </div>

      {/* Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[170] rounded-full border border-strike/60 bg-cave/95 backdrop-blur-md px-5 py-3 font-mono text-[11px] uppercase tracking-[0.28em]"
          style={{
            boxShadow: '0 20px 40px -20px rgba(239,68,68,0.6)',
            animation: 'paidFlashIn 0.3s cubic-bezier(0.22,1,0.36,1)',
          }}
        >
          <span className="text-strike">● </span>
          <span className="text-silk">{toast}</span>
        </div>
      )}
    </section>
  );
}
