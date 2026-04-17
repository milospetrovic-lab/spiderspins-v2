import Image from 'next/image';

// Promo banner below hero — Next Image handles responsive sizing + WebP/AVIF
// auto-conversion + lazy-loading. Significantly faster than the prior <picture>
// route which served the 908 KB desktop PNG to all viewports.

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
          {/* Art-directed: mobile gets portrait crop, desktop gets wide crop */}
          <Image
            src="/promo/banner-mobile.png"
            alt="Hot promotion — the web is wide open this week"
            width={640}
            height={640}
            sizes="100vw"
            priority={false}
            placeholder="empty"
            className="block w-full h-auto md:hidden"
          />
          <Image
            src="/promo/banner-desktop.png"
            alt="Hot promotion — the web is wide open this week"
            width={1350}
            height={500}
            sizes="(max-width: 1024px) 90vw, 1100px"
            priority={false}
            placeholder="empty"
            className="hidden md:block w-full h-auto"
          />

          {/* spider-branded overlay — readable text everywhere */}
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

          {/* content — on mobile sits at bottom over gradient; on desktop centered left */}
          <div className="absolute inset-0 flex flex-col justify-end md:justify-center px-6 md:px-12 pb-10 md:pb-0 max-w-2xl">
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
              Pool refreshes Monday. Top silk-weavers share the web's spoils. No wagering tricks.
            </p>
            <span className="inline-flex items-center gap-2 self-start px-4 md:px-5 py-2 md:py-2.5 rounded-full bg-venom text-silk text-xs md:text-sm uppercase tracking-[0.18em] font-display font-medium group-hover:bg-strike transition-colors">
              Read the rules
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </span>
          </div>

          <span className="absolute bottom-2 right-3 font-mono text-[8px] uppercase tracking-[0.24em] text-silk/30">
            prototype
          </span>
        </a>
      </div>
    </section>
  );
}
