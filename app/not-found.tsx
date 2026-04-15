import type { Metadata } from 'next';
import WeaveTheWeb from '@/components/WeaveTheWeb';

export const metadata: Metadata = {
  title: '404 · The web has a gap — SpiderSpins',
  description:
    'One of the silk threads snapped. Patch the web by tapping the broken anchors to earn a silk-thread reward.',
};

export default function NotFound() {
  return (
    <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-24">
      <p className="font-mono text-silk-dim text-[11px] uppercase tracking-[0.42em] mb-4">
        404 · the web has a gap
      </p>
      <h1 className="font-display font-black text-silk leading-[0.95] text-[clamp(2.4rem,9vw,6rem)] text-center">
        A silk thread <span className="text-strike">snapped</span>.
      </h1>
      <p className="mt-6 max-w-xl text-center font-display font-light text-silk-dim text-base md:text-lg">
        Patch the web before the timer runs out. Tap every red anchor — every
        hit weaves a new thread. Complete the pattern and the web rewards you.
      </p>

      <WeaveTheWeb />

      <div className="mt-10 flex items-center gap-3">
        <a
          href="/"
          className="hover-target inline-flex items-center px-6 py-3 bg-venom text-silk uppercase tracking-[0.15em] text-sm font-display font-medium hover:bg-strike transition-colors shadow-strike-glow"
        >
          Back to the web
        </a>
        <a
          href="/#games"
          className="hover-target inline-flex items-center px-6 py-3 border border-web-light/60 text-silk-dim hover:text-silk uppercase tracking-[0.15em] text-sm font-display font-medium transition-colors"
        >
          Browse games
        </a>
      </div>

      <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.3em] text-shadow text-center max-w-md">
        The spider doesn't chase — it rebuilds. Patience pays.
      </p>
    </main>
  );
}
