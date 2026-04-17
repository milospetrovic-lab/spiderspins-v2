'use client';

import { useEffect, useState } from 'react';

type Item = {
  id: string;
  emoji: string;
  title: string;
  body?: string;
  ago: string;
};

const notifications: Item[] = [
  {
    id: 'n1',
    emoji: '📬',
    title: 'HIT THE GROUND RUNNING WITH A 40% NO-RULES BOOST.',
    body: 'Reclaim enhanced bonuses, birthday gifts, and dedicated VIP support.',
    ago: '3 hours ago',
  },
  {
    id: 'n2',
    emoji: '🎰',
    title: '1000 SPINS ON THE NEW GAME — STILL LIVE.',
    ago: '20 hours ago',
  },
  {
    id: 'n3',
    emoji: '🏆',
    title: 'UNLOCK YOUR 250% BOOST AND PLAY WITH REAL VIP ADVANTAGE.',
    body: 'Experience elite privileges: fast cashouts, daily treats, and personalised promos.',
    ago: '2 days ago',
  },
  {
    id: 'n4',
    emoji: '💰',
    title: 'NEW FATCASH: 1000 SPINS + 100% CASHBACK TODAY ONLY.',
    ago: '2 days ago',
  },
  {
    id: 'n5',
    emoji: '🎯',
    title: 'A 350% BOOST CRAFTED FOR YOUR VIP DOMINANCE IS READY.',
    body: 'Access elite bonuses, faster comp points, referrals, and daily rewards.',
    ago: '3 days ago',
  },
  {
    id: 'n6',
    emoji: '🛡️',
    title: 'YOUR 125% HIGH-WEB BOOST IS READY TO DOMINATE.',
    body: 'Enjoy elite withdrawals, birthday privileges, and nonstop VIP momentum.',
    ago: '4 days ago',
  },
];

const emails: Item[] = [
  {
    id: 'e1',
    emoji: '✉️',
    title: 'WELCOME TO THE WEB — YOUR FIRST THREAD IS YOURS.',
    body: 'Tier set to Hatchling. Your first-spin guide inside.',
    ago: '1 hour ago',
  },
  {
    id: 'e2',
    emoji: '🕸️',
    title: 'MEET THE MENAGERIE — FIVE SPECIES, ONE LIFECYCLE.',
    body: 'Where you are. Where you could go. Read the lore.',
    ago: '1 day ago',
  },
  {
    id: 'e3',
    emoji: '🛍️',
    title: 'THIS WEEK IN THE SILK BOUTIQUE — THREE DROPS.',
    body: 'Three boutique drops live today. First come, first claimed.',
    ago: '2 days ago',
  },
  {
    id: 'e4',
    emoji: '📈',
    title: 'AT YOUR CURRENT PACE — WEAVER IS 18 DAYS AWAY.',
    ago: '5 days ago',
  },
];

export default function NotificationsDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<'notifications' | 'emails'>('notifications');
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const items = tab === 'notifications' ? notifications : emails;

  return (
    <>
      <div
        aria-hidden
        onClick={onClose}
        className={[
          'fixed inset-0 z-[95] bg-void/60 backdrop-blur-sm transition-opacity duration-300',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
      />
      <aside
        aria-label="Notifications and emails"
        className={[
          'fixed right-0 top-0 bottom-0 z-[96] w-full sm:w-[420px] bg-abyss border-l border-web-light/40',
          'transition-transform duration-400 ease-out',
          open ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
        style={{
          backdropFilter: 'blur(16px) saturate(140%)',
          WebkitBackdropFilter: 'blur(16px) saturate(140%)',
        }}
      >
        {/* Header with tabs + close */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-web/60">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setTab('notifications')}
              className={[
                'hover-target font-display text-base tracking-wide transition-colors',
                tab === 'notifications' ? 'text-silk' : 'text-silk-dim hover:text-silk',
              ].join(' ')}
            >
              <span className="inline-flex items-center gap-1.5">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
                Notifications
              </span>
            </button>
            <span className="h-5 w-px bg-web-light/60" />
            <button
              onClick={() => setTab('emails')}
              className={[
                'hover-target font-display text-base tracking-wide transition-colors',
                tab === 'emails' ? 'text-silk' : 'text-silk-dim hover:text-silk',
              ].join(' ')}
            >
              <span className="inline-flex items-center gap-1.5 relative">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="M3 7l9 6 9-6" />
                </svg>
                Emails
                <span
                  aria-hidden
                  className="absolute -top-1.5 -right-2 w-1.5 h-1.5 rounded-full bg-strike"
                  style={{ boxShadow: '0 0 6px rgba(239,68,68,0.9)' }}
                />
              </span>
            </button>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="hover-target w-8 h-8 flex items-center justify-center rounded-md text-silk-dim hover:text-silk hover:bg-cave/60 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable list */}
        <div className="overflow-y-auto h-[calc(100%-128px)] px-4 py-4 space-y-3">
          {items.map((it) => {
            const isOpen = expanded === it.id;
            return (
              <div
                key={it.id}
                className={[
                  'rounded-lg border bg-cave/40 transition-colors',
                  isOpen ? 'border-strike/50' : 'border-web/60 hover:border-web-light/70',
                ].join(' ')}
              >
                <button
                  onClick={() => setExpanded(isOpen ? null : it.id)}
                  className="w-full flex items-start justify-between gap-3 px-4 py-3 text-left"
                >
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <span className="text-base mt-0.5" aria-hidden>{it.emoji}</span>
                    <p className="font-display text-[13px] leading-snug text-silk tracking-wide">
                      {it.title}
                    </p>
                  </div>
                  <span
                    aria-hidden
                    className={[
                      'shrink-0 w-6 h-6 flex items-center justify-center rounded border border-web-light/60 text-silk-dim transition-transform',
                      isOpen ? 'rotate-45' : '',
                    ].join(' ')}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                </button>
                {isOpen && it.body && (
                  <div className="px-4 pb-3 -mt-1 flex items-end justify-between gap-3">
                    <p className="font-body text-xs text-silk-dim leading-relaxed flex-1">
                      {it.body}
                    </p>
                    <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-shadow">
                      {it.ago}
                    </span>
                  </div>
                )}
                {!isOpen && (
                  <div className="px-4 pb-3 -mt-1 flex justify-end">
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-shadow">
                      {it.ago}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-web/60 px-4 py-4 text-center bg-abyss/80">
          <p className="font-display text-xs text-silk">That&apos;s all for now!</p>
          <p className="font-body text-[11px] text-silk-dim mt-0.5">
            You can view notifications from the last 7 days only.
          </p>
        </div>
      </aside>
    </>
  );
}
