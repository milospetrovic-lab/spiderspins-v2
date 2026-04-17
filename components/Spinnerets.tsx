'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

type Post = {
  badge: string;
  category: 'Silk Thread' | 'The Weave' | 'Web Report';
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
};

const posts: Post[] = [
  {
    badge: 'Promo',
    category: 'Silk Thread',
    title: 'The October weave: four reload drops',
    excerpt:
      'Four reload offers, four silk patterns. Here is the math behind each, and which fits your play style.',
    date: 'Oct 14',
    readTime: '4 min',
  },
  {
    badge: 'Strategy',
    category: 'The Weave',
    title: 'Volatility is a promise, not a warning',
    excerpt:
      'High-variance slots are misunderstood. A practical guide to sizing sessions around what you can afford to wait for.',
    date: 'Oct 09',
    readTime: '7 min',
  },
  {
    badge: 'Transparency',
    category: 'Web Report',
    title: 'September payouts, full ledger',
    excerpt:
      'Every provider, every payout, every withdrawal average. The monthly web report with nothing pulled off the page.',
    date: 'Oct 02',
    readTime: '3 min',
  },
];

const categoryColor: Record<Post['category'], { border: string; text: string; bg: string }> = {
  'Silk Thread': { border: 'border-venom/55', text: 'text-strike', bg: 'bg-venom/10' },
  'The Weave': { border: 'border-web-light/70', text: 'text-silk', bg: 'bg-cave/80' },
  'Web Report': { border: 'border-fang/55', text: 'text-fang', bg: 'bg-fang/10' },
};

export default function Spinnerets() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      gsap.from(section.querySelectorAll('.spin-reveal'), {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 78%' },
      });
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="spinnerets"
      className="relative z-10 py-24 md:py-32"
    >
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-10 md:mb-14">
          <div>
            <p className="spin-reveal font-mono text-silk-dim text-[11px] uppercase tracking-[0.42em] mb-3">
              Spinnerets
            </p>
            <h2 className="spin-reveal font-display font-black text-silk leading-[0.95] text-[clamp(2rem,5.5vw,4rem)]">
              Dispatches from the <span className="text-strike">web</span>.
            </h2>
          </div>
          <a
            href="#blog"
            className="spin-reveal hover-target font-mono text-[11px] uppercase tracking-[0.28em] text-silk-dim hover:text-strike transition-colors"
          >
            All dispatches →
          </a>
        </div>
      </div>

      {/* horizontal snap scroll — z-10 + isolate so cards sit above bg particles.
          No overflow-y-hidden / contain:paint: those were clipping the bottom
          of the cards (date + read-time row were invisible). Vertical overflow
          is fine because all children are a single horizontal flex row. */}
      <div
        className="spinnerets-scroll relative z-10 px-6 md:px-[calc((100vw-72rem)/2+1.5rem)] pt-2 pb-10 overflow-x-auto snap-x snap-mandatory isolate"
        style={{ scrollPaddingLeft: '1.5rem' }}
      >
        <div className="flex gap-5">
          {posts.map((p) => {
            const c = categoryColor[p.category];
            return (
              <article
                key={p.title}
                className="spin-reveal snap-start shrink-0 w-[320px] md:w-[380px] rounded-xl border border-web/70 bg-cave/70 p-6 hover:-translate-y-1 transition-transform duration-400 hover-target relative overflow-hidden group"
              >
                {/* grain texture — hidden on mobile (mix-blend + SVG turbulence
                    were the main cause of laggy horizontal swipe on phones) */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-25 mix-blend-overlay hidden md:block"
                  style={{
                    backgroundImage:
                      'url("data:image/svg+xml;utf8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27160%27 height=%27160%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.85%27 numOctaves=%272%27/%3E%3CfeColorMatrix values=%270 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.4 0%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27/%3E%3C/svg%3E")',
                    backgroundSize: '160px 160px',
                  }}
                />

                <div className="relative">
                  <div className="flex items-center gap-2 mb-6">
                    <span
                      className={[
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-mono text-[9px] uppercase tracking-[0.26em]',
                        c.border,
                        c.text,
                        c.bg,
                      ].join(' ')}
                    >
                      ● {p.category}
                    </span>
                  </div>

                  <h3 className="font-display font-extrabold text-silk text-xl md:text-2xl leading-tight min-h-[3em]">
                    {p.title}
                  </h3>

                  <p className="mt-3 font-display font-light text-silk-dim text-sm leading-relaxed min-h-[5em]">
                    {p.excerpt}
                  </p>

                  <div className="mt-6 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.28em]">
                    <span className="text-silk-dim">{p.date}</span>
                    <span className="text-silk/70">{p.readTime}</span>
                    <span className="text-strike opacity-0 group-hover:opacity-100 transition-opacity">
                      Read →
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
          <span className="shrink-0 w-6" aria-hidden />
        </div>
      </div>
    </section>
  );
}
