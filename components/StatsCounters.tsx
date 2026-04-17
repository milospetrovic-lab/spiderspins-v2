'use client';

import { useEffect, useRef, useState } from 'react';

type Stat = {
  target: number;
  label: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  format?: 'plain' | 'compact';
};

const stats: Stat[] = [
  { target: 500, suffix: '+', label: 'Games', format: 'plain' },
  { target: 5, suffix: '', label: 'VIP tiers', format: 'plain' },
  { target: 8, suffix: 'K+', label: 'Colony', format: 'plain' },
  { target: 1.8, prefix: '$', suffix: 'M', label: 'Paid / month', decimals: 1 },
];

function Counter({ stat, trigger }: { stat: Stat; trigger: boolean }) {
  const [value, setValue] = useState(0);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    if (!trigger) return;
    const start = performance.now();
    const duration = 1800;
    let raf = 0;
    const tick = () => {
      const t = Math.min((performance.now() - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setValue(stat.target * ease);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setSettled(true);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [trigger, stat.target]);

  const formatted =
    stat.decimals != null
      ? value.toFixed(stat.decimals)
      : Math.round(value).toString();

  return (
    <div className="text-center">
      <div
        className={[
          'font-mono font-bold text-4xl md:text-6xl tabular-nums transition-colors duration-500',
          settled ? 'text-silk' : 'text-strike',
        ].join(' ')}
        style={{
          textShadow: settled ? 'none' : '0 0 24px rgba(239,68,68,0.35)',
        }}
      >
        {stat.prefix || ''}
        {formatted}
        {stat.suffix || ''}
      </div>
      <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.3em] text-silk-dim">
        {stat.label}
      </div>
    </div>
  );
}

export default function StatsCounters() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [trigger, setTrigger] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setTrigger(true);
            io.disconnect();
          }
        }
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="stats"
      className="relative z-10 py-20 md:py-28 px-6"
    >
      <div className="max-w-5xl mx-auto">
        <div
          className="rounded-2xl border border-web/70 bg-cave/60 p-8 md:p-12"
          style={{
            backgroundImage:
              'linear-gradient(180deg, rgba(185,28,28,0.04), transparent 60%)',
          }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
            {stats.map((s) => (
              <Counter key={s.label} stat={s} trigger={trigger} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
