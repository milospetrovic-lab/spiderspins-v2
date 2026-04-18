'use client';

import { useEffect } from 'react';
import AnimatedSpiderLogo from './AnimatedSpiderLogo';

type LinkItem = { label: string; href: string; icon: JSX.Element };
type Section = { title: string; items: LinkItem[] };

const IconGames = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
);
const IconSlots = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><rect x="4" y="5" width="16" height="14" rx="2"/><path d="M8 9v6M12 9v6M16 9v6"/></svg>
);
const IconTable = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M3 8h18M5 8v10M19 8v10M3 18h18"/></svg>
);
const IconPoker = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-6-4.5-6-10a6 6 0 0 1 12 0c0 5.5-6 10-6 10z"/></svg>
);
const IconJackpot = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="8"/><path d="M12 8v8M8 12h8"/></svg>
);
const IconProg = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l5-5 4 4 8-8"/><path d="M14 8h6v6"/></svg>
);
const IconTournaments = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M7 4h10v4a5 5 0 0 1-10 0V4z"/><path d="M5 4H3v2a3 3 0 0 0 3 3M19 4h2v2a3 3 0 0 1-3 3M9 18h6v3H9z"/></svg>
);
const IconPromo = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="13" rx="1.5"/><path d="M3 12h18M12 8v13M8 8s-2-4 1-4 3 4 3 4M16 8s2-4-1-4-3 4-3 4"/></svg>
);
const IconRewards = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15 9 22 9.5 17 14 18.5 21 12 17.5 5.5 21 7 14 2 9.5 9 9"/></svg>
);
const IconVIP = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 20h18M5 20l2-8 5 4 5-7 2 11"/></svg>
);
const IconBank = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10l9-6 9 6M5 10v9M19 10v9M3 21h18M9 21v-7M15 21v-7"/></svg>
);
const IconRefer = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="8" r="4"/><path d="M2 21c0-4 3-6 7-6s7 2 7 6"/><path d="M19 8v6M22 11h-6"/></svg>
);

const sections: Section[] = [
  {
    title: 'Casino',
    items: [
      { label: 'Games', href: '/#games', icon: IconGames },
      { label: 'Slots', href: '/#games', icon: IconSlots },
      { label: 'Table Games', href: '/#games', icon: IconTable },
      { label: 'Video Poker', href: '/#games', icon: IconPoker },
      { label: 'Jackpots', href: '/#games', icon: IconJackpot },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Rewards', href: '/#boutique', icon: IconRewards },
      { label: 'VIP Lounge', href: '/#vip', icon: IconVIP },
      { label: 'Banking', href: '/#cashier', icon: IconBank },
    ],
  },
  {
    title: 'Lore & legal',
    items: [
      { label: 'Menagerie', href: '/menagerie', icon: IconRewards },
      { label: 'Responsible Gaming', href: '/responsible-gambling', icon: IconRefer },
      { label: 'Terms', href: '/terms', icon: IconBank },
      { label: 'Privacy', href: '/privacy', icon: IconPromo },
    ],
  },
];

const crypto = [
  { label: 'Bitcoin', symbol: '₿', color: '#b91c1c' },
  { label: 'Ethereum', symbol: 'Ξ', color: '#ef4444' },
  { label: 'Litecoin', symbol: 'Ł', color: '#c4a265' },
  { label: 'Lightning', symbol: '⚡', color: '#ef4444' },
];

export default function NavDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  return (
    <>
      {/* backdrop */}
      <div
        onClick={onClose}
        aria-hidden
        className={[
          'fixed inset-0 z-[89] bg-void/70 backdrop-blur-sm transition-opacity duration-300',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
      />
      {/* drawer */}
      <aside
        role="dialog"
        aria-label="Site navigation"
        aria-hidden={!open}
        className={[
          'fixed top-0 left-0 bottom-0 z-[90] w-[320px] max-w-[88vw]',
          'bg-abyss border-r border-web/60 flex flex-col',
          'transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]',
          open ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
        style={{
          backgroundImage:
            'linear-gradient(180deg, rgba(185,28,28,0.06) 0%, transparent 40%), linear-gradient(180deg, #0a0a0a, #050505)',
        }}
      >
        {/* header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-web/50">
          <a
            href="/"
            onClick={onClose}
            className="hover-target flex items-center gap-3"
          >
            <AnimatedSpiderLogo size={30} />
            <span className="font-display font-medium tracking-[0.18em] text-silk uppercase text-sm">
              SpiderSpins
            </span>
          </a>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="hover-target w-8 h-8 rounded-md border border-web hover:border-strike/60 text-silk-dim hover:text-strike transition-colors flex items-center justify-center"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6l-12 12" />
            </svg>
          </button>
        </div>

        {/* sections */}
        <nav className="flex-1 overflow-y-auto px-2 py-4">
          {sections.map((section) => (
            <div key={section.title} className="px-3 mb-6 last:mb-2">
              <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-shadow mb-2 px-2">
                {section.title}
              </div>
              <ul className="space-y-0.5">
                {section.items.map((it) => (
                  <li key={it.label}>
                    <a
                      href={it.href}
                      onClick={onClose}
                      className="hover-target group relative flex items-center gap-3 px-2 py-2.5 rounded-md text-silk/85 hover:text-silk text-sm font-display tracking-wide transition-colors"
                    >
                      <span className="text-silk-dim group-hover:text-strike transition-colors">
                        {it.icon}
                      </span>
                      <span>{it.label}</span>
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[2px] origin-top scale-y-0 bg-strike group-hover:scale-y-100 transition-transform duration-300" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* crypto row */}
        <div className="px-5 py-4 border-t border-web/50">
          <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-fang mb-3">
            Play with crypto
          </div>
          <div className="grid grid-cols-2 gap-2">
            {crypto.map((c) => (
              <button
                key={c.label}
                className="hover-target flex items-center gap-2 px-3 py-2 rounded-md border border-web/70 hover:border-strike/60 bg-cave/60 hover:bg-cave transition-colors text-sm text-silk font-display"
              >
                <span
                  className="inline-flex w-5 h-5 items-center justify-center rounded-sm font-bold text-[11px]"
                  style={{ background: c.color, color: '#050505' }}
                >
                  {c.symbol}
                </span>
                <span className="tracking-wide">{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="px-5 pb-5 pt-1">
          <a
            href="/#play-crypto"
            onClick={onClose}
            className="hover-target block w-full text-center px-4 py-3.5 rounded-md bg-venom hover:bg-strike transition-colors text-silk font-display uppercase tracking-[0.18em] text-sm shadow-strike-glow"
          >
            Play Now — It&apos;s Free
          </a>
          <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.24em] text-shadow">
            Your web. Your rules.
          </p>
        </div>
      </aside>
    </>
  );
}
