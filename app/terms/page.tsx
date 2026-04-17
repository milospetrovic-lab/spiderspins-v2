import type { Metadata } from 'next';
import LegalLayout from '@/components/LegalLayout';

export const metadata: Metadata = {
  title: 'Terms of Service · SpiderSpins',
  description:
    'The contract between you and the web. Read it once. The spider does not change the rules mid-game.',
};

export default function TermsPage() {
  return (
    <LegalLayout
      eyebrow="Terms of Service"
      title="The contract."
      intro="Every silk strand has a tension. These terms are ours. They are written so you can read them without a lawyer, because a brand built on transparency cannot bury its rules in fine print."
    >
      <section>
        <h2 className="font-display font-extrabold text-silk text-xl md:text-2xl mb-3">1. Who can play</h2>
        <p>You must be at least 18 years of age, or the age of majority in your jurisdiction, whichever is higher. You must not be a resident of any country where online gambling is prohibited. You are responsible for confirming the law where you live before depositing a single thread of silk.</p>
      </section>
      <section>
        <h2 className="font-display font-extrabold text-silk text-xl md:text-2xl mb-3">2. Your account</h2>
        <p>One account per person, per household, per device. Multiple accounts are forfeited along with their balances. You will verify your identity (KYC) before your first withdrawal — passport, utility bill, the usual. We hold these documents under encryption and delete them on request once verification is complete.</p>
      </section>
      <section>
        <h2 className="font-display font-extrabold text-silk text-xl md:text-2xl mb-3">3. Deposits and withdrawals</h2>
        <p>Minimum and maximum limits per rail are published on the Cashier page. Crypto rails settle within minutes; card rails within 3–5 business days; bank wires within 5–7. Withdrawal limits scale with your VIP tier. Reversal of a withdrawal voids any winnings tied to that withdrawal cycle — patience pays, impatience costs.</p>
      </section>
      <section>
        <h2 className="font-display font-extrabold text-silk text-xl md:text-2xl mb-3">4. Bonuses and wagering</h2>
        <p>Every bonus has a wagering multiplier (most are 35×) and a maximum cashout cap. The exact terms appear on the bonus card before you accept it. We do not change wagering retroactively. We do not void winnings for "irregular play" without specifying what that means; if you ever feel a decision was unfair, our complaints address is published below.</p>
      </section>
      <section>
        <h2 className="font-display font-extrabold text-silk text-xl md:text-2xl mb-3">5. The math is the math</h2>
        <p>Volatility ratings and payout profiles are published on every game page. Provider RNGs are independently audited (certificates linked from each game). We do not manipulate outcomes. You can win, you can lose, and the long-run distribution is exactly what the math predicts. The web is patient on both sides.</p>
      </section>
      <section>
        <h2 className="font-display font-extrabold text-silk text-xl md:text-2xl mb-3">6. Disputes</h2>
        <p>Disputes are first handled by our 24/7 Colony hosts. If unresolved within 14 days, escalate to <span className="text-strike">complaints@spiderspins.com</span>. We arbitrate under Curaçao eGaming dispute resolution rules. The decision of the licensing body is final.</p>
      </section>
      <section>
        <h2 className="font-display font-extrabold text-silk text-xl md:text-2xl mb-3">7. Changes to these terms</h2>
        <p>If we change these terms materially, we email every active player 14 days before the change takes effect. You can cancel your account at any time — no exit fees, no clawback of vested cashback.</p>
      </section>
    </LegalLayout>
  );
}
