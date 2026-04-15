'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

// Rail × tier payout matrix — structure lifted from BonusBlitz withdrawal
// limits table, spider-reskinned. Currency is USD demo values.

type Row = {
  rail: string;
  symbol: string;
  color: string;
  minPer: string;
  maxPer: string;
  maxWeek: string;
  settle: string;
};

const rows: Row[] = [
  { rail: 'Bitcoin', symbol: '₿', color: '#ef4444', minPer: '$30', maxPer: '$7,500', maxWeek: '$30,000', settle: '~2 min' },
  { rail: 'Ethereum', symbol: 'Ξ', color: '#b91c1c', minPer: '$30', maxPer: '$7,500', maxWeek: '$30,000', settle: '~2 min' },
  { rail: 'Litecoin', symbol: 'Ł', color: '#c4a265', minPer: '$30', maxPer: '$7,500', maxWeek: '$30,000', settle: '~1 min' },
  { rail: 'Lightning', symbol: '⚡', color: '#ef4444', minPer: '$10', maxPer: '$2,500', maxWeek: '$10,000', settle: 'instant' },
  { rail: 'Visa / Mastercard', symbol: '▤', color: '#e8e8e8', minPer: '$50', maxPer: '$2,000', maxWeek: '$8,000', settle: '3–5 days' },
  { rail: 'Bank wire', symbol: '⧉', color: '#888', minPer: '$100', maxPer: '$10,000', maxWeek: '$25,000', settle: '5–7 days' },
];

export default function WithdrawalLimits() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      gsap.from(section.querySelectorAll('.wl-reveal'), {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.06,
        ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 80%' },
      });
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="banking"
      className="relative z-10 py-20 md:py-28 px-6"
    >
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 md:mb-14 text-center">
          <p className="wl-reveal font-mono text-silk-dim text-[11px] uppercase tracking-[0.42em] mb-3">
            Withdrawal limits
          </p>
          <h2 className="wl-reveal font-display font-black text-silk leading-[0.95] text-[clamp(2rem,5.5vw,3.8rem)]">
            Out as fast as <em className="text-strike not-italic">in</em>.
          </h2>
          <p className="wl-reveal mt-4 max-w-xl mx-auto font-display font-light text-silk-dim text-base md:text-lg">
            Every rail. Every limit. Every settle time — published. No buried schedules, no surprise holds.
          </p>
        </div>

        <div className="wl-reveal rounded-2xl border border-web/70 bg-cave/60 overflow-hidden">
          {/* Desktop table */}
          <table className="hidden md:table w-full text-sm">
            <thead>
              <tr className="border-b border-web/60 bg-void/50">
                <th className="text-left font-mono text-[10px] uppercase tracking-[0.28em] text-silk-dim px-5 py-4">Rail</th>
                <th className="text-right font-mono text-[10px] uppercase tracking-[0.28em] text-silk-dim px-5 py-4">Min / tx</th>
                <th className="text-right font-mono text-[10px] uppercase tracking-[0.28em] text-silk-dim px-5 py-4">Max / tx</th>
                <th className="text-right font-mono text-[10px] uppercase tracking-[0.28em] text-silk-dim px-5 py-4">Max / week</th>
                <th className="text-right font-mono text-[10px] uppercase tracking-[0.28em] text-silk-dim px-5 py-4">Settle</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={r.rail}
                  className={[
                    'border-b border-web/40 hover:bg-strike/5 transition-colors',
                    i === rows.length - 1 ? 'border-b-0' : '',
                  ].join(' ')}
                >
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-3">
                      <span
                        className="inline-flex items-center justify-center w-8 h-8 rounded-md font-bold text-base shrink-0"
                        style={{ background: r.color, color: '#050505' }}
                      >
                        {r.symbol}
                      </span>
                      <span className="font-display text-silk tracking-wide">{r.rail}</span>
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right font-mono text-silk-dim tabular-nums">{r.minPer}</td>
                  <td className="px-5 py-4 text-right font-mono text-silk tabular-nums">{r.maxPer}</td>
                  <td className="px-5 py-4 text-right font-mono text-silk tabular-nums">{r.maxWeek}</td>
                  <td className="px-5 py-4 text-right font-mono text-fang tabular-nums">{r.settle}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-web/40">
            {rows.map((r) => (
              <div key={r.rail} className="p-4 flex items-center gap-4">
                <span
                  className="inline-flex items-center justify-center w-10 h-10 rounded-md font-bold text-lg shrink-0"
                  style={{ background: r.color, color: '#050505' }}
                >
                  {r.symbol}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-display text-silk text-sm mb-1">{r.rail}</div>
                  <div className="font-mono text-[10px] text-silk-dim flex flex-wrap gap-x-3 gap-y-1">
                    <span><span className="text-shadow">min</span> {r.minPer}</span>
                    <span><span className="text-shadow">max</span> {r.maxPer}</span>
                    <span><span className="text-shadow">wk</span> {r.maxWeek}</span>
                    <span className="text-fang"><span className="text-shadow">settle</span> {r.settle}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="wl-reveal mt-6 text-center font-mono text-[10px] uppercase tracking-[0.28em] text-shadow">
          All limits subject to KYC verification · higher tiers unlock via VIP ladder
        </p>
      </div>
    </section>
  );
}
