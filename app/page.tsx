import BenefitsSlider from '@/components/BenefitsSlider';
import GameCards from '@/components/GameCards';
import WebVault from '@/components/WebVault';
import VIPTiers from '@/components/VIPTiers';
import StatsCounters from '@/components/StatsCounters';
import Colony from '@/components/Colony';
import FinalCTA from '@/components/FinalCTA';
import Footer from '@/components/Footer';
import SpiderRain from '@/components/SpiderRain';
import InteractiveWebGrid from '@/components/InteractiveWebGrid';
import WebParticleNet from '@/components/WebParticleNet';
import PaymentCard from '@/components/PaymentCard';
import HeroHexFrame from '@/components/HeroHexFrame';
import HeroScrollTransition from '@/components/HeroScrollTransition';
import HeroBottomDrip from '@/components/HeroBottomDrip';
import PromoBanner from '@/components/PromoBanner';
import WithdrawalLimits from '@/components/WithdrawalLimits';
import SilkBoutique from '@/components/SilkBoutique';
import SocialShare from '@/components/SocialShare';
import NeuralWebBackdrop from '@/components/NeuralWebBackdrop';
import MorphingSpiderForms from '@/components/MorphingSpiderForms';

// ⚠ NeuralWebBackdrop — OPT-IN only. Default OFF. To enable in production:
//    1. Set NEXT_PUBLIC_NEURAL_WEB=1 in Vercel env vars, OR
//    2. Change enabled={false} → enabled={true} below and redeploy.
// Rollback: either revert the env var, or flip this boolean, OR use Vercel's
// instant-rollback to promote the previous deployment (no code change needed).
const NEURAL_ENABLED = process.env.NEXT_PUBLIC_NEURAL_WEB === '1';

export default function HomePage() {
  return (
    <>
      <HeroScrollTransition />

      {/* HERO — v2 (warp removed; neural backdrop opt-in via env var) */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pb-20 md:pb-28 overflow-hidden">
        {/* Opt-in neural-net backdrop */}
        {NEURAL_ENABLED && (
          <div aria-hidden className="absolute inset-0 z-[1] pointer-events-none">
            <NeuralWebBackdrop enabled intensity={0.55} />
          </div>
        )}

        <div data-intro="hex" aria-hidden className="absolute inset-0 z-[2] pointer-events-none" style={{ transformOrigin: '50% 50%' }}>
          <HeroHexFrame />
        </div>
        {/* Layer 4 — interactive surface.
            Desktop: WebParticleNet (constellation that links + threads to cursor in red).
            Touch: InteractiveWebGrid (radial dots that scatter on click).
            Each component internally bails on the wrong device, so both can mount. */}
        <div data-intro="grid" aria-hidden className="absolute inset-0 z-[4]">
          <WebParticleNet />
          <InteractiveWebGrid />
        </div>
        <div data-intro="rain" aria-hidden className="absolute inset-0 z-[5] pointer-events-none">
          <SpiderRain />
        </div>

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
            Red silk. A casino for players who read the web.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pointer-events-auto">
            <a
              href="/#play-crypto"
              className="hover-target hero-skip-intro inline-flex items-center px-8 py-4 bg-venom text-silk uppercase tracking-[0.15em] text-sm font-display font-medium hover:bg-strike transition-colors shadow-strike-glow"
            >
              Enter the Web
            </a>
            <a
              href="#benefits"
              className="hover-target hero-skip-intro inline-flex items-center px-8 py-4 border border-web-light/60 text-silk-dim hover:text-silk uppercase tracking-[0.15em] text-sm font-display font-medium transition-colors"
            >
              Why the web
            </a>
          </div>
          <p className="hidden md:block mt-10 font-mono text-[10px] uppercase tracking-[0.3em] text-shadow">
            Drag anywhere on the page to pull silk — release for confetti
          </p>
        </div>

        {/* Phase 2 scroll indicator — sits above the silk drip, fades out as
            the user scrolls. Pure CSS, no listeners. */}
        <div
          aria-hidden
          className="scroll-cue pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-[148px] md:bottom-[168px] z-[9] flex flex-col items-center gap-3"
        >
          <span className="font-mono text-[9px] uppercase tracking-[0.36em] text-silk-dim">
            Scroll to explore
          </span>
          <span className="scroll-cue-line" />
        </div>

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

      {/* A2 · promo banner */}
      <PromoBanner />

      <BenefitsSlider />
      <MorphingSpiderForms />
      <GameCards />
      <StatsCounters />
      <WebVault />
      <VIPTiers />
      {/* B1 · Silk Boutique (loyalty / comp shop) */}
      <SilkBoutique />
      <PaymentCard />
      {/* A4 · Withdrawal limits */}
      <WithdrawalLimits />
      <Colony />
      {/* B2 · Social share rewards */}
      <SocialShare />
      <FinalCTA />
      <Footer />
    </>
  );
}
