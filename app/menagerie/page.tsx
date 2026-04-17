import type { Metadata } from 'next';
import Link from 'next/link';
import SpiderPortrait from '@/components/SpiderPortrait';

export const metadata: Metadata = {
  title: 'The Menagerie · SpiderSpins lore',
  description:
    'Eight spiders. Eight stories. Each tier of the web meets a different creature. Each season releases a new mascot.',
};

type Variant =
  | 'wolf'
  | 'orb'
  | 'funnel'
  | 'widow'
  | 'goliath'
  | 'peacock'
  | 'garden'
  | 'ghost';

type Species = {
  variant: Variant;
  name: string;
  tier: string;
  tierColor: string;
  trait: string;
  story: string;
  benefit: string;
};

const tierSpecies: Species[] = [
  {
    variant: 'wolf',
    name: 'Wolf Spider',
    tier: 'Hatchling',
    tierColor: '#888',
    trait: 'Patient hunter · no web',
    story:
      'The Wolf Spider does not build. It stalks. Eight eyes scanning the floor of the forest, body low, every step calculated. New players are Wolf Spiders — they have not yet earned the right to weave, but they are learning to read the ground beneath them. Watch. Wait. Strike when the math says strike.',
    benefit: 'Daily stalk-hunt mini-games · welcome bonus · Saturday free spins',
  },
  {
    variant: 'orb',
    name: 'Orb Weaver',
    tier: 'Hunter',
    tierColor: '#aaa',
    trait: 'Classic round web · symmetry',
    story:
      'The Orb Weaver is the spider of textbook silk — the perfect concentric rings every photographer wants in their morning fog shot. As a Hunter, you have begun to weave your first true web. It is small. It is symmetrical. It catches enough.',
    benefit: 'Weekly web-completion mini-games · 5% cashback · birthday drop',
  },
  {
    variant: 'funnel',
    name: 'Funnel-Web',
    tier: 'Weaver',
    tierColor: '#ef4444',
    trait: 'Architect · deep silk · venom',
    story:
      'A Funnel-Web does not catch — it traps. The web tunnels into the dark, narrowing into a single inevitable point. Weaver-tier players think two moves ahead. Their cashback compounds. Their losses are absorbed before they sting. The deeper the funnel, the deeper the silk gives back.',
    benefit: '10% cashback · dedicated host · exclusive slots · funnel reload bonuses',
  },
  {
    variant: 'widow',
    name: 'Black Widow',
    tier: 'Widow',
    tierColor: '#b91c1c',
    trait: 'The flagship · red hourglass · respected',
    story:
      "The Widow is the one. Glossy, geometric, and marked with a glowing hourglass that the rest of the web reads as a warning. To reach Widow tier is to be one of the few hundred players the web genuinely needs. Custom bonuses. Priority withdrawals. A host who knows what you play before you do. The hourglass mark on your dashboard mirrors the spider's — that's the signature.",
    benefit: '15% cashback · custom bonuses · priority withdrawals · invite events',
  },
  {
    variant: 'goliath',
    name: 'Goliath Birdeater',
    tier: 'Empress',
    tierColor: '#c4a265',
    trait: 'Largest spider on Earth · golden silk · bespoke',
    story:
      'The Goliath is the largest spider on the planet, named for what it is rumored to occasionally eat. Empress-tier players are not customers — they are the gravity around which the rest of the casino orbits. Concierge 24/7. IRL experiences. Travel. A red carpet that is actually red because we made it for you.',
    benefit: '20% cashback · concierge 24/7 · travel & experiences · bespoke rewards',
  },
];

const seasonalSpecies: Species[] = [
  {
    variant: 'peacock',
    name: 'Peacock Spider',
    tier: 'Festival',
    tierColor: '#c4a265',
    trait: 'Iridescent display · courtship dance',
    story:
      "Released for festival weekends and brand birthdays. The Peacock Spider's abdomen explodes into colour the moment another spider notices it. Festival weeks unlock bright peacock-themed promos, leaderboards with multiplier ladders, and a shared chat where the Widow drops Silk Rain.",
    benefit: 'Festival leaderboards · multiplier ladders · Silk Rain events',
  },
  {
    variant: 'garden',
    name: 'Garden Spider',
    tier: 'Spring',
    tierColor: '#aaa',
    trait: 'Yellow-cross marking · fresh-weave',
    story:
      'For the spring season — a fresh start, a clean web. The Garden Spider weaves quickly and rebuilds nightly. Spring releases bring deposit-match resets, fresh tournament brackets, and the annual Web Wipe (rare bonus where your unused promos all auto-claim at once).',
    benefit: 'Spring deposit-match · tournament resets · annual Web Wipe',
  },
  {
    variant: 'ghost',
    name: 'Ghost Spider',
    tier: 'Halloween',
    tierColor: '#ef4444',
    trait: 'Translucent body · red eye glow',
    story:
      'For the late-October season. Ghost Spiders are nearly transparent except for two glowing red eyes that catch the moonlight. Halloween week swaps every game thumbnail to its haunted variant, unlocks the "Haunted Webs" tournament, and rains golden silk at midnight every Friday in October.',
    benefit: 'Haunted game variants · Halloween tournament · midnight Silk Rain',
  },
];

function SpeciesCard({ s }: { s: Species }) {
  return (
    <article
      className="rounded-2xl border border-web/70 bg-cave/55 p-6 md:p-8 backdrop-blur-sm relative overflow-hidden"
      style={{
        boxShadow: `0 30px 80px -40px ${s.tierColor}80, inset 0 0 0 1px rgba(34,34,34,0.9)`,
      }}
    >
      {/* radial accent */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 0% 0%, ${s.tierColor}22 0%, transparent 60%)`,
        }}
      />
      <div className="relative grid md:grid-cols-[180px_1fr] gap-5 md:gap-7 items-start">
        <div className="flex justify-center md:justify-start">
          <SpiderPortrait variant={s.variant} accent={s.tierColor} size={180} />
        </div>
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span
              className="font-mono text-[10px] uppercase tracking-[0.3em]"
              style={{ color: s.tierColor }}
            >
              ● {s.tier}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-shadow">
              {s.trait}
            </span>
          </div>
          <h3 className="font-display font-extrabold text-silk text-2xl md:text-3xl leading-tight mb-3">
            {s.name}
          </h3>
          <p className="font-display font-light text-silk/85 text-[15px] leading-relaxed mb-4">
            {s.story}
          </p>
          <div
            className="rounded-lg border bg-void/50 px-4 py-3 text-[12px] font-mono uppercase tracking-[0.18em]"
            style={{ borderColor: `${s.tierColor}55`, color: s.tierColor }}
          >
            What they bring you · <span className="text-silk normal-case font-display tracking-normal text-[13px]">{s.benefit}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function MenageriePage() {
  return (
    <main className="relative z-10 min-h-screen px-6 pt-32 pb-24">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="hover-target inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-silk-dim hover:text-strike transition-colors mb-10"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to the web
        </Link>

        <p className="font-mono text-silk-dim text-[11px] uppercase tracking-[0.42em] mb-4">
          The Menagerie · brand lore
        </p>
        <h1 className="font-display font-black text-silk leading-[0.95] text-[clamp(2.4rem,7vw,5rem)] mb-6">
          Eight spiders. <span className="text-strike">One web</span>.
        </h1>
        <p className="font-display font-light text-silk-dim text-base md:text-lg leading-relaxed max-w-2xl mb-14">
          The Widow is our flagship. She is not alone. Each VIP tier is a different species — patient, deliberate, true to nature. Every season unlocks one more. Players don&apos;t just rank up. They meet a new creature.
        </p>

        {/* Tier ladder — primary heading for the 5-VIP story */}
        <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-strike mb-3">
          The Spider Lifecycle · five ranks
        </p>
        <h2 className="font-display font-black text-silk leading-[0.95] text-[clamp(1.8rem,5vw,3.2rem)] mb-8">
          Five species. <span className="text-strike">One web.</span>
        </h2>
        <div className="space-y-6 mb-16">
          {tierSpecies.map((s) => (
            <SpeciesCard key={s.variant} s={s} />
          ))}
        </div>

        {/* Seasonal */}
        <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-fang mb-5">
          Seasonal species · limited releases
        </p>
        <div className="space-y-6">
          {seasonalSpecies.map((s) => (
            <SpeciesCard key={s.variant} s={s} />
          ))}
        </div>

        {/* Outro */}
        <div className="mt-20 p-8 rounded-2xl border border-strike/40 bg-strike/5 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-strike mb-3">
            What's next
          </p>
          <h3 className="font-display font-extrabold text-silk text-2xl md:text-3xl mb-3">
            The colony grows.
          </h3>
          <p className="font-display font-light text-silk-dim text-base max-w-xl mx-auto leading-relaxed mb-6">
            Future releases — the Trapdoor (puzzle event), the Crab Spider (slot variant), the Six-Eyed Sand (jackpot drop). New species are voted on by Empress-tier players in the Colony quarterly.
          </p>
          <Link
            href="/#colony"
            className="hover-target inline-flex items-center gap-2 px-6 py-3 bg-venom hover:bg-strike transition-colors text-silk font-display uppercase tracking-[0.18em] text-xs"
          >
            Join the Colony
          </Link>
        </div>

        <p className="mt-16 pt-6 border-t border-web/60 font-mono text-[10px] uppercase tracking-[0.3em] text-shadow text-center">
          Lore + portraits placeholder · final 3D mascots commissioned ahead of launch
        </p>
      </div>
    </main>
  );
}
