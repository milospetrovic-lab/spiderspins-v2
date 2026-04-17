'use client';

import { useState } from 'react';

// SEO long-form content. Hidden behind an expand toggle so visual real estate
// stays tight, but crawlers see the full text in the DOM. Structured as 6 H3
// sections across spider-voiced copy for slots / tables / poker / jackpots /
// live dealer / responsible gaming.

const sections = [
  {
    id: 'slots',
    title: 'Slots — the silk spreads widest here',
    keywords: 'online slots · crypto slots · patient play',
    body: `At the centre of the SpiderSpins web sits a library of more than 500 slot games, drawn from the studios players already trust — RTG, Pragmatic, Betsoft, Nolimit City and rotating partners who feed us new silk every week. The spider does not care for noise. What we curate is math: volatility ratings no one buries, and bonus-buy labels marked the moment you need them. Whether you chase a patient orb-weaver's spin (low volatility, near-daily small wins) or a widow's strike (extreme volatility, rare but decisive), the catalogue is sorted by the shape of the game, not by the size of a marketing budget. Every title loads inside the web — no redirects, no pop-ups, no unclosable overlays. Freespins from the Silk Thread promo trigger directly on featured games; comp points generated during each spin drop straight into your Spider Points balance as you play. When a new game joins the catalogue, it is flagged with a wine-red "NEW" thread for seven days, and the weekly Dispatch newsletter tells you which ones over-delivered on their math in the first 48 hours of play. That's the difference between a casino that runs slots and a casino that reads them.`,
  },
  {
    id: 'tables',
    title: 'Table games — where the math is cleanest',
    keywords: 'blackjack · roulette · baccarat · online table games',
    body: `Blackjack, roulette (European and American), baccarat, three-card poker, pai gow and a dozen variants — every table at SpiderSpins is published with its precise house edge, payout schedule and recommended strategy sheet. This is unusual. Most operators hide these numbers three clicks deep; we put them on the game page. European roulette's 2.7 % edge, single-deck blackjack under Vegas rules at 0.41 %, baccarat banker bets at 1.06 % — if the number changes because of a ruleset variation, the number on our page changes with it. Our live auto-roulette streams show the physical wheel with timestamps; our RNG tables carry independent audit certificates you can click to verify. Patient players who read the sheet end up in the top deciles of our weekly leaderboards; impatient ones learn that the web rewards study. Either way, no game will ever lie to you about its odds.`,
  },
  {
    id: 'video-poker',
    title: 'Video poker — the strategist\'s reward',
    keywords: 'video poker · jacks or better · deuces wild',
    body: `For players who believe in skill plus math, video poker is the cleanest vein in the casino. Jacks or Better, Deuces Wild, Bonus Poker, Double Double Bonus — SpiderSpins carries the full standard library at 9/6 paytables or better, which is genuinely rare in the crypto-casino space. (Most operators quietly clip the royal-flush return by 20 % and hope you won't check. We publish the paytable on every game.) Optimal-strategy sheets are linked from the game header and auto-highlight the correct hold on demand, so new players can learn without losing their bankroll to a coin-flip guess. Triple-play, 10-play and multi-hand variants let the Weaver-tier and up run 100 hands per minute across 100 lines — that's where the web feeds the patient. Every hand earns Silk Points at the same rate as slots, and Widow-tier VIPs receive custom video-poker reload bonuses built around their actual play patterns, not off-the-shelf templates.`,
  },
  {
    id: 'jackpots',
    title: 'Jackpots — when the silk finally gives',
    keywords: 'progressive jackpots · jackpot slots · big wins',
    body: `SpiderSpins participates in three global progressive jackpot networks plus four in-house pools. The largest pool — the Great Hunt — accumulates across every slot in our catalogue and releases weekly to the player with the heaviest silk web. Typical payouts run $40K–$180K depending on weekly deposit volume. The four in-house pools are smaller, quicker to hit, and tied to specific game families: Orb Weaver (classic three-reel slots), Funnel-Web (five-reel branded), Black Widow (jackpot branded) and Empress (VIP-only). Every jackpot win is announced in the live bet feed, tagged into the Dispatch newsletter, and — if the winner consents — profiled on the Web Report blog alongside the exact game, wager size, spin count and total session time. Radical transparency. Unlike operators who roll jackpots silently, we let you study every win so the next one feels earnable.`,
  },
  {
    id: 'live-dealer',
    title: 'Live dealer — the silk meets the glass',
    keywords: 'live dealer casino · live blackjack · live roulette · evolution gaming',
    body: `Live dealer is the closest the web gets to the felt. SpiderSpins streams tables from Evolution, Pragmatic Live and Ezugi across blackjack, roulette, baccarat, immersive studios, game shows and VIP-only Salon Privé rooms. All streams run 1080p at 60fps with mobile-optimised alternate feeds for 4G. The live dealer suite operates 24/7; dealer rotations are timed so the same face never greets you twice in a session. For Widow and Empress tiers, we open private baccarat tables on request — set your own rule variations, set your own table limits, set the entry gate for anyone else who wants to sit down. Tips route to the dealers directly (minus a 12 % operator margin — we publish that too). Live chat inside the stream is moderated in real time, and the rake-back schedule on live dealer sits at 0.4 % of wagers, funded into your weekly cashback pool automatically.`,
  },
  {
    id: 'responsible-gaming',
    title: 'Responsible gaming — the web has boundaries',
    keywords: 'responsible gambling · self-exclusion · deposit limits · problem gambling',
    body: `The patient player is the long-term player. SpiderSpins enforces three layers of guardrails that every account can opt into — and that VIP hosts will suggest without asking, if your play pattern shifts. Layer one: deposit limits (daily, weekly, monthly) adjustable upward only after a 7-day cooling period. Layer two: session clocks with non-dismissible reminders at 30, 60 and 120 minutes. Layer three: self-exclusion, ranging from 72 hours to a permanent lock that cannot be lifted under any circumstance. We link out to GamCare, GambleAware, BeGambleAware and the National Council on Problem Gambling from the footer of every page; the 18+ badge in the footer is a hard age-gate — VPN-masked sessions from under-age jurisdictions are blocked at the edge. The spider doesn't chase. If the web starts to chase you, we will close it on your behalf. That's part of the contract.`,
  },
];

export default function SEOContent() {
  const [open, setOpen] = useState(false);

  return (
    <section id="about" className="relative z-10 py-16 md:py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="rounded-2xl border border-web/70 bg-cave/50 overflow-hidden">
          <button
            onClick={() => setOpen((o) => !o)}
            className="hover-target w-full flex items-center justify-between gap-6 px-6 md:px-8 py-5 md:py-6 text-left group"
            aria-expanded={open}
          >
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-silk-dim mb-2">
                About SpiderSpins
              </div>
              <div className="font-display font-extrabold text-silk text-xl md:text-2xl">
                Read the web — <span className="text-strike">patient players only</span>.
              </div>
            </div>
            <span
              className={[
                'shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-full border border-strike/60 bg-strike/10 text-strike transition-transform duration-400',
                open ? 'rotate-180' : '',
              ].join(' ')}
              aria-hidden
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </button>

          <div
            className={[
              'grid transition-[grid-template-rows] duration-500 ease-out',
              open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
            ].join(' ')}
          >
            <div className="overflow-hidden">
              <div className="px-6 md:px-8 pb-8 md:pb-10 space-y-7 border-t border-web/60 pt-7">
                {sections.map((s) => (
                  <article key={s.id}>
                    <h3 className="font-display font-extrabold text-silk text-lg md:text-xl leading-snug mb-2">
                      {s.title}
                    </h3>
                    <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-strike/75 mb-3">
                      {s.keywords}
                    </div>
                    <p className="font-display font-light text-silk/80 text-[14.5px] md:text-[15.5px] leading-relaxed">
                      {s.body}
                    </p>
                  </article>
                ))}
                <p className="pt-4 border-t border-web/50 font-mono text-[10px] uppercase tracking-[0.28em] text-shadow text-center">
                  The web sees everything — but only the patient see the web clearly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
