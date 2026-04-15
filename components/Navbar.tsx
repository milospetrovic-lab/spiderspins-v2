'use client';

import { useEffect, useState } from 'react';
import AnimatedSpiderLogo from './AnimatedSpiderLogo';
import NavDrawer from './NavDrawer';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header
        className={[
          'fixed top-0 left-0 right-0 z-[80] flex justify-center pointer-events-none',
          'transition-all duration-500 ease-out',
          scrolled ? 'pt-3 px-4 md:px-6' : 'pt-0 px-0',
        ].join(' ')}
      >
        <nav
          className={[
            'pointer-events-auto relative flex items-center gap-3 md:gap-5 transition-all duration-500 ease-out',
            scrolled
              ? 'w-auto max-w-[min(900px,95vw)] rounded-full border border-web-light/40 bg-abyss/70 pl-3 pr-3 py-2.5'
              : 'w-full border-b border-web/40 bg-void/50 px-5 md:px-7 py-4',
          ].join(' ')}
          style={{
            backdropFilter: 'blur(20px) saturate(140%)',
            WebkitBackdropFilter: 'blur(20px) saturate(140%)',
          }}
        >
          {/* subtle HUD tics across the nav */}
          <span className="nav-tics pointer-events-none absolute inset-x-6 bottom-[-1px] h-[6px] flex items-end gap-[6px] overflow-hidden opacity-70">
            {Array.from({ length: 48 }).map((_, i) => (
              <span
                key={i}
                className="block bg-web-light"
                style={{
                  width: '1px',
                  height: i % 5 === 0 ? '4px' : '2px',
                  opacity: i % 5 === 0 ? 0.5 : 0.22,
                }}
              />
            ))}
          </span>

          {/* burger morph button */}
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            aria-expanded={drawerOpen}
            className={[
              'hover-target burger-btn relative flex items-center justify-center rounded-md border border-web/70 hover:border-strike/70 bg-cave/40 hover:bg-cave transition-colors',
              scrolled ? 'w-9 h-9' : 'w-10 h-10',
              drawerOpen ? 'is-open' : '',
            ].join(' ')}
          >
            <span className="burger-lines">
              <span />
              <span />
              <span />
            </span>
            <span className="burger-pulse" />
          </button>

          {/* brand with animated logo */}
          <a
            href="/"
            className="hover-target flex items-center gap-2.5 shrink-0"
            aria-label="SpiderSpins home"
          >
            <AnimatedSpiderLogo size={scrolled ? 28 : 34} />
            <span
              className={[
                'font-display font-light tracking-[0.22em] text-silk uppercase transition-all duration-500',
                scrolled ? 'text-[13px]' : 'text-sm md:text-base',
              ].join(' ')}
            >
              SpiderSpins
            </span>
          </a>

          {/* middle HUD readout (desktop only) */}
          <div className="hidden md:flex ml-5 items-center gap-3 font-mono text-[9px] uppercase tracking-[0.3em] text-silk-dim">
            <span className="text-strike">●</span>
            <span>WEB · ONLINE</span>
            <span className="text-shadow">·</span>
            <span className="text-fang">RANK EMP</span>
          </div>

          <div className="flex-1" />

          {/* Right readout + CTA */}
          <div className="hidden md:flex items-center gap-3 font-mono text-[9px] uppercase tracking-[0.3em] text-silk-dim">
            <span>RTP 96.1</span>
            <span className="nav-scan-line" />
          </div>

          {/* Cashier — wallet glyph with red dew-drop indicator */}
          <a
            href="#cashier"
            aria-label="Cashier"
            title="Cashier"
            className={[
              'hover-target relative flex items-center justify-center rounded-md border border-strike/40 hover:border-strike/90 text-silk hover:text-strike bg-cave/40 hover:bg-strike/10 transition-colors',
              scrolled ? 'w-9 h-9' : 'w-10 h-10',
            ].join(' ')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="3" y="7" width="18" height="12" rx="2" />
              <path d="M3 11h18" />
              <path d="M16 15h2" />
            </svg>
            <span
              aria-hidden
              className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-strike"
              style={{ boxShadow: '0 0 6px rgba(239,68,68,0.8)' }}
            />
          </a>

          <a
            href="#enter"
            className={[
              'hover-target inline-flex items-center font-display uppercase tracking-[0.18em] text-silk bg-venom hover:bg-strike transition-colors rounded-full',
              scrolled ? 'px-4 py-1.5 text-[11px]' : 'px-5 py-2 text-xs',
            ].join(' ')}
          >
            Enter
          </a>
        </nav>
      </header>

      {/* Under-nav soft fade to blend into hero */}
      <div
        aria-hidden
        className="pointer-events-none fixed left-0 right-0 top-[52px] md:top-[64px] z-[79] h-[60px]"
        style={{
          background:
            'linear-gradient(180deg, rgba(5,5,5,0.6) 0%, rgba(5,5,5,0) 100%)',
        }}
      />

      <NavDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
