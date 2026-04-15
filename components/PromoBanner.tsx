import Image from 'next/image';

// Responsive promo banner below hero — Casino Extreme-style.
// Desktop (≥ md) uses the 1350×500 asset; mobile/tablet get 420×300 / 768×300.
// Prototype note: imagery pulled from casinoextreme.eu for mock. Replace with
// licensed spider-themed art before launch (see SPIDERSPINS_TODO.md · A2).

export default function PromoBanner() {
  return (
    <section
      aria-label="Current promotion"
      className="relative z-10 px-4 md:px-8 -mt-2 md:-mt-10 mb-12"
    >
      <div className="max-w-6xl mx-auto">
        <a
          href="/404"
          className="hover-target group relative block rounded-2xl overflow-hidden border border-venom/40 bg-cave/60 transition-all hover:border-strike/70 hover:shadow-[0_20px_60px_-20px_rgba(185,28,28,0.5)]"
        >
          {/* responsive picture — browser picks the smallest adequate */}
          <picture>
            <source media="(min-width: 1024px)" srcSet="/promo/banner-desktop.png" />
            <source media="(min-width: 640px)" srcSet="/promo/banner-tablet.png" />
            <Image
              src="/promo/banner-mobile.png"
              alt="Hot promotion — the web is wide open this week"
              width={1350}
              height={500}
              className="block w-full h-auto"
              priority={false}
            />
          </picture>

          {/* spider-branded overlay */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 mix-blend-multiply"
            style={{
              background:
                'linear-gradient(90deg, rgba(5,5,5,0.78) 0%, rgba(5,5,5,0.35) 42%, rgba(5,5,5,0) 70%)',
            }}
          />
          <div aria-hidden className="pointer-events-none absolute inset-0" style={{
            background: 'linear-gradient(180deg, rgba(5,5,5,0) 55%, rgba(5,5,5,0.85) 100%)',
          }} />

          {/* HUD corner brackets */}
          <span className="pointer-events-none absolute top-3 left-3 w-5 h-5 border-t border-l border-strike/70" />
          <span className="pointer-events-none absolute top-3 right-3 w-5 h-5 border-t border-r border-strike/70" />
          <span className="pointer-events-none absolute bottom-3 left-3 w-5 h-5 border-b border-l border-strike/70" />
          <span className="pointer-events-none absolute bottom-3 right-3 w-5 h-5 border-b border-r border-strike/70" />

          {/* content */}
          <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-12 max-w-2xl">
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-strike shadow-[0_0_10px_#ef4444] animate-pulse" />
              <span className="font-mono text-[9px] md:text-[11px] uppercase tracking-[0.3em] text-strike">
                Live · The Great Hunt
              </span>
            </div>
            <h2 className="font-display font-black text-silk leading-[0.95] text-[clamp(1.5rem,5vw,3.4rem)] mb-2 md:mb-3 drop-shadow-[0_4px_12px_rgba(0,0,0,0.7)]">
              25 <span className="text-strike">no-rules</span> spins.
              <br className="hidden md:block" />
              <span className="text-silk-dim text-[0.6em] font-light"> Every thread earns a ticket.</span>
            </h2>
            <p className="hidden md:block font-display font-light text-silk/85 text-base mb-4 max-w-md">
              Pool refreshes Monday. Top silk-weavers share the web's spoils. No wagering tricks — the math is public.
            </p>
            <span className="inline-flex items-center gap-2 self-start px-4 md:px-5 py-2 md:py-2.5 rounded-full bg-venom text-silk text-xs md:text-sm uppercase tracking-[0.18em] font-display font-medium group-hover:bg-strike transition-colors">
              Read the rules
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </span>
          </div>

          {/* tiny "prototype asset" badge — bottom-right */}
          <span className="absolute bottom-2 right-3 font-mono text-[8px] uppercase tracking-[0.24em] text-silk/30">
            prototype
          </span>
        </a>
      </div>
    </section>
  );
}
