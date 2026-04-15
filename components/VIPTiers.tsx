'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

function useTierTilt() {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    if (!mq.matches) return;
    let rx = 0,
      ry = 0,
      tx = 0,
      ty = 0,
      scale = 1,
      targetScale = 1,
      raf = 0;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      tx = -py * 6;
      ty = px * 6;
      targetScale = 1.04;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onLeave = () => {
      tx = 0;
      ty = 0;
      targetScale = 1;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const tick = () => {
      rx += (tx - rx) * 0.12;
      ry += (ty - ry) * 0.12;
      scale += (targetScale - scale) * 0.12;
      el.style.transform = `perspective(1200px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
      if (
        Math.abs(tx - rx) > 0.05 ||
        Math.abs(ty - ry) > 0.05 ||
        Math.abs(targetScale - scale) > 0.002
      ) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
      }
    };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return ref;
}

function TierCard({
  tier,
  index,
  isHover,
}: {
  tier: Tier;
  index: number;
  isHover: boolean;
}) {
  const tiltRef = useTierTilt();
  return (
    <div
      ref={tiltRef}
      className={[
        'hover-target relative rounded-xl border bg-cave/85 backdrop-blur-sm p-4 md:p-5 min-h-[280px] md:min-h-[340px] overflow-hidden transition-[box-shadow,border-color] duration-400 will-change-transform',
      ].join(' ')}
      style={{
        transformStyle: 'preserve-3d',
        boxShadow: isHover
          ? `0 18px 40px -18px ${tier.color}a0, inset 0 0 0 1px ${tier.color}80`
          : 'inset 0 0 0 1px rgba(34,34,34,0.9)',
        borderColor: 'transparent',
      }}
    >
      <div className="flex items-center justify-between">
        <span
          className="font-mono text-[10px] uppercase tracking-[0.28em]"
          style={{ color: tier.color }}
        >
          0{index + 1}
        </span>
        <span
          className="w-2.5 h-2.5 rounded-full"
          style={{
            background: tier.color,
            boxShadow: isHover ? `0 0 14px ${tier.color}` : 'none',
          }}
        />
      </div>

      <div className="mt-5">
        <div
          className="font-mono text-[9px] uppercase tracking-[0.28em] mb-1"
          style={{ color: tier.color }}
        >
          {tier.label}
        </div>
        <h3 className="font-display font-extrabold text-silk text-xl md:text-2xl leading-tight">
          {tier.name}
        </h3>
        <p className="mt-2 font-display font-light text-silk-dim text-[12.5px] leading-relaxed min-h-[3em]">
          {tier.description}
        </p>
      </div>

      <ul
        className={[
          'mt-4 space-y-1.5 transition-all duration-400',
          isHover
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-2 pointer-events-none',
        ].join(' ')}
      >
        {tier.benefits.map((b) => (
          <li
            key={b}
            className="flex items-start gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-silk-dim"
          >
            <span
              className="mt-[5px] block w-1 h-1 rounded-full shrink-0"
              style={{ background: tier.color }}
            />
            {b}
          </li>
        ))}
      </ul>

      {/* deep radial glow (stronger on hover) */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: isHover ? 0.65 : 0.3,
          background: `radial-gradient(ellipse 65% 55% at 50% 100%, ${tier.color}33 0%, transparent 70%)`,
        }}
      />
    </div>
  );
}

type Tier = {
  name: string;
  color: string;
  label: string;
  description: string;
  benefits: string[];
};

// Benefits modeled on BonusBlitz VIP structure, reskinned in spider language.
// Every tier has: weekly payout limit · comp-point rate · cashback % · free-spins day.
const tiers: Tier[] = [
  {
    name: 'Hatchling',
    color: '#666666',
    label: 'Entry',
    description: 'First thread of the web. Every spider starts here.',
    benefits: [
      '$1,000 weekly payout',
      '1 Silk Point / $30 wagered',
      '10% instant cashback',
      'Saturday free spins',
    ],
  },
  {
    name: 'Hunter',
    color: '#aaaaaa',
    label: 'Active',
    description: 'The silk is learning your pattern. Weekly perks begin.',
    benefits: [
      '$2,000 weekly payout',
      '1 Silk Point / $20 wagered',
      '20% instant cashback',
      'Sunday free spins',
    ],
  },
  {
    name: 'Weaver',
    color: '#ef4444',
    label: 'Consistent',
    description: 'The web takes shape. Rewards compound weekly.',
    benefits: [
      '$5,000 weekly payout',
      '1 Silk Point / $15 wagered',
      '25% instant cashback',
      'Dedicated VIP host',
    ],
  },
  {
    name: 'Widow',
    color: '#b91c1c',
    label: 'High roller',
    description: 'Full command of the strand. Invitations open.',
    benefits: [
      '$10,000 weekly payout',
      '1 Silk Point / $10 wagered',
      '30% instant cashback',
      'Priority withdrawals',
    ],
  },
  {
    name: 'Empress',
    color: '#c4a265',
    label: 'Top 1%',
    description: 'Golden silk. The web moves on your word.',
    benefits: [
      'Unlimited weekly payout',
      '1 Silk Point / $5 wagered',
      '40% instant cashback',
      'Concierge 24/7 · travel',
    ],
  },
];

export default function VIPTiers() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      gsap.from(section.querySelectorAll('.tier-reveal'), {
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 78%' },
      });
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="vip"
      className="relative z-10 py-24 md:py-32 px-6"
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-12 md:mb-16 text-center">
          <p className="tier-reveal font-mono text-silk-dim text-[11px] uppercase tracking-[0.42em] mb-4">
            VIP — The Spider Lifecycle
          </p>
          <h2 className="tier-reveal font-display font-black text-silk leading-[0.95] text-[clamp(2rem,6vw,4.5rem)]">
            Five ranks. <span className="text-strike">One web</span>.
          </h2>
          <p className="tier-reveal mt-5 max-w-xl mx-auto font-display font-light text-silk-dim text-base md:text-lg">
            The longer you weave, the more the silk gives back. Hover a tier to see its benefits.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 [perspective:1200px]">
          {tiers.map((t, i) => {
            const isHover = hovered === i;
            return (
              <div
                key={t.name}
                className="tier-reveal"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              >
                <TierCard tier={t} index={i} isHover={isHover} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
