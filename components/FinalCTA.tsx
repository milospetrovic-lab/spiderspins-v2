'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') gsap.registerPlugin(ScrollTrigger);

const fireBurst = (x: number, y: number, dist: number) => {
  try {
    window.dispatchEvent(
      new CustomEvent('spiderspins:burst', { detail: { x, y, dist } })
    );
  } catch {}
};

export default function FinalCTA() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const buttonRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const ctx = gsap.context(() => {
      gsap.from(section.querySelectorAll('.cta-reveal'), {
        y: 60,
        opacity: 0,
        duration: 1,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 78%' },
      });
    }, section);
    return () => ctx.revert();
  }, []);

  // IO-triggered arrival burst + periodic pulses while section is in view.
  useEffect(() => {
    const section = sectionRef.current;
    const btn = buttonRef.current;
    if (!section || !btn) return;

    let fired = false;
    let pulseTimer: ReturnType<typeof setInterval> | null = null;

    const centerOfButton = () => {
      const r = btn.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    };

    const fireArrival = () => {
      const { x, y } = centerOfButton();
      fireBurst(x, y, 1400);
      // follow-up burst 350ms later for a double-boom feel
      setTimeout(() => {
        const c = centerOfButton();
        fireBurst(c.x, c.y - 40, 900);
      }, 350);
    };

    const startPulses = () => {
      if (pulseTimer) return;
      pulseTimer = setInterval(() => {
        const { x, y } = centerOfButton();
        // small offset around the button so each pulse lands differently
        const ox = (Math.random() - 0.5) * 260;
        const oy = (Math.random() - 0.5) * 120;
        fireBurst(x + ox, y + oy, 360 + Math.random() * 220);
      }, 2600);
    };

    const stopPulses = () => {
      if (pulseTimer) {
        clearInterval(pulseTimer);
        pulseTimer = null;
      }
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (!fired) {
              fired = true;
              fireArrival();
            }
            startPulses();
          } else {
            stopPulses();
          }
        }
      },
      { threshold: 0.35 }
    );
    io.observe(section);

    const onClick = () => {
      const { x, y } = centerOfButton();
      fireBurst(x, y, 1800);
    };
    btn.addEventListener('click', onClick);

    return () => {
      io.disconnect();
      stopPulses();
      btn.removeEventListener('click', onClick);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="enter"
      className="relative z-10 py-32 md:py-48 px-6 overflow-hidden"
    >
      {/* radiating web behind button */}
      <svg
        aria-hidden
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        className="pointer-events-none absolute inset-0 w-full h-full opacity-[0.08]"
      >
        <g stroke="#ef4444" strokeWidth="0.6" fill="none">
          {Array.from({ length: 24 }).map((_, i) => {
            const a = (i / 24) * Math.PI * 2;
            return (
              <line
                key={i}
                x1="600"
                y1="500"
                x2={600 + Math.cos(a) * 900}
                y2={500 + Math.sin(a) * 900}
              />
            );
          })}
          {[80, 180, 320, 500, 720].map((r) => (
            <circle key={r} cx="600" cy="500" r={r} />
          ))}
        </g>
      </svg>

      <div className="relative max-w-5xl mx-auto text-center">
        <p className="cta-reveal font-mono text-silk-dim text-[11px] uppercase tracking-[0.42em] mb-5">
          The web is patient
        </p>
        <h2 className="cta-reveal font-display font-black text-silk leading-[0.9] text-[clamp(3rem,11vw,8rem)]">
          Your web is
          <br />
          <span className="text-strike">waiting</span>.
        </h2>
        <p className="cta-reveal mt-6 max-w-xl mx-auto font-display font-light text-silk-dim text-base md:text-lg">
          Every thread leads somewhere. Every spin tightens the silk.
        </p>

        <div className="cta-reveal mt-12 flex items-center justify-center">
          <a
            ref={buttonRef}
            href="#play"
            className="hover-target relative inline-flex items-center gap-3 px-10 py-5 rounded-md bg-venom hover:bg-strike transition-all font-display uppercase tracking-[0.22em] text-sm text-silk overflow-hidden"
            style={{
              boxShadow:
                '0 0 0 1px rgba(239,68,68,0.25), 0 0 40px rgba(185,28,28,0.4), 0 0 80px rgba(185,28,28,0.15)',
            }}
          >
            <span className="relative z-10">Enter the Web</span>
            <svg
              className="relative z-10"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
            <span
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(ellipse at center, rgba(239,68,68,0.35), transparent 70%)',
              }}
            />
          </a>
        </div>

        <p className="cta-reveal mt-8 font-mono text-[10px] uppercase tracking-[0.32em] text-shadow">
          Your web. Your rules.
        </p>
      </div>
    </section>
  );
}
