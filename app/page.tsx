import BenefitsSlider from '@/components/BenefitsSlider';
import GameCards from '@/components/GameCards';
import WebVault from '@/components/WebVault';
import VIPTiers from '@/components/VIPTiers';
import TermsCalculator from '@/components/TermsCalculator';
import StatsCounters from '@/components/StatsCounters';
import Colony from '@/components/Colony';
import Spinnerets from '@/components/Spinnerets';
import FinalCTA from '@/components/FinalCTA';
import Footer from '@/components/Footer';
import SpiderRain from '@/components/SpiderRain';
import InteractiveWebGrid from '@/components/InteractiveWebGrid';
import PaymentCard from '@/components/PaymentCard';
import HeroHexFrame from '@/components/HeroHexFrame';
import HeroScrollTransition from '@/components/HeroScrollTransition';
import HeroBottomDrip from '@/components/HeroBottomDrip';

export default function HomePage() {
  return (
    <>
      <HeroScrollTransition />

      {/* HERO — v2 (warp removed for mobile perf) */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pb-20 md:pb-28 overflow-hidden">
        {/* Hex frame */}
        <div data-intro="hex" aria-hidden className="absolute inset-0 z-[2] pointer-events-none" style={{ transformOrigin: '50% 50%' }}>
          <HeroHexFrame />
        </div>

        {/* Interactive dot grid */}
        <div data-intro="grid" aria-hidden className="absolute inset-0 z-[4]">
          <InteractiveWebGrid />
        </div>

        {/* Spider rain */}
        <div data-intro="rain" aria-hidden className="absolute inset-0 z-[5] pointer-events-none">
          <SpiderRain />
        </div>

        {/* Soft center darken for text */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[6]"
          style={{
            background:
              'radial-gradient(ellipse 44% 38% at 50% 52%, rgba(5,5,5,0.55) 0%, rgba(5,5,5,0) 70%)',
          }}
        />

        <div
          data-intro="text"
          className="relative z-[7] max-w-5xl mx-auto text-center pointer-events-none"
        >
          <p className="font-mono text-silk-dim text-xs uppercase tracking-[0.4em] mb-8">
            Your web. Your rules.
          </p>
          <h1 className="font-display font-black text-silk leading-[0.95] text-[clamp(3rem,10vw,7rem)]">
            Your web.
            <br />
            Your{' '}
            <span className="text-strike relative">
              rules
              <span className="absolute left-0 -bottom-1 w-full h-[2px] bg-strike" />
            </span>
            .
          </h1>
          <p className="mt-8 max-w-2xl mx-auto font-display font-light text-silk-dim text-lg md:text-xl">
            Patient math. Red silk. A casino for players who read the web.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pointer-events-auto">
            <a
              href="#enter"
              className="hover-target hero-skip-intro inline-flex items-center px-8 py-4 bg-venom text-silk uppercase tracking-[0.15em] text-sm font-display font-medium hover:bg-strike transition-colors shadow-strike-glow"
            >
              Enter the Web
            </a>
            <a
              href="#benefits"
              className="hover-target hero-skip-intro inline-flex items-center px-8 py-4 border border-web-light/60 text-silk-dim hover:text-silk uppercase tracking-[0.15em] text-sm font-display font-medium transition-colors"
            >
              Learn the math
            </a>
          </div>
          <p className="mt-10 font-mono text-[10px] uppercase tracking-[0.3em] text-shadow">
            Drag anywhere on the page to pull silk — release for confetti
          </p>
        </div>

        {/* Organic silk fade into next section (replaces the hard horizontal line) */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 right-0 bottom-0 h-40 z-[7]"
          style={{
            background:
              'linear-gradient(180deg, rgba(5,5,5,0) 0%, rgba(5,5,5,0.45) 55%, #050505 100%)',
          }}
        />
        <HeroBottomDrip />
      </section>

      <BenefitsSlider />
      <GameCards />
      <StatsCounters />
      <WebVault />
      <VIPTiers />
      <TermsCalculator />
      <PaymentCard />
      <Spinnerets />
      <Colony />
      <FinalCTA />
      <Footer />
    </>
  );
}
