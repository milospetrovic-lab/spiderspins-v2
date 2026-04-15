'use client';

import { useEffect, useState } from 'react';

// Social-share rewards — each share worth N silk points.
// Tracked per-session so one share = one credit. Encourages viral spread.

type Channel = {
  id: string;
  name: string;
  color: string;
  reward: number;
  icon: JSX.Element;
  url: (text: string, href: string) => string;
};

const SHARE_TEXT = 'Caught in the web — SpiderSpins is a patient-player casino for people who read the math.';
const SITE_URL = 'https://spiderspins-v2.vercel.app';

const channels: Channel[] = [
  {
    id: 'x',
    name: 'Share on X',
    color: '#e8e8e8',
    reward: 50,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M18.244 2H21l-6.56 7.5L22 22h-6.81l-4.78-6.24L4.8 22H2l7.04-8.04L2 2h6.91l4.34 5.74L18.24 2zm-2.4 18h1.8L7.28 3.9H5.36l10.48 16.1z" />
      </svg>
    ),
    url: (t, h) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(t)}&url=${encodeURIComponent(h)}`,
  },
  {
    id: 'telegram',
    name: 'Share on Telegram',
    color: '#ef4444',
    reward: 50,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
      </svg>
    ),
    url: (t, h) => `https://t.me/share/url?url=${encodeURIComponent(h)}&text=${encodeURIComponent(t)}`,
  },
  {
    id: 'reddit',
    name: 'Share on Reddit',
    color: '#c4a265',
    reward: 75,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm5.4 11.1a2 2 0 0 1 .2 1 2.2 2.2 0 0 1-3.6 1.6 6 6 0 0 1-7 0 2.2 2.2 0 1 1-3.4-2.6 1.1 1.1 0 0 1 .3-.2 6.4 6.4 0 0 1 .4-2.6c-.8-1.1.3-2.2 1.3-1.6a6.1 6.1 0 0 1 3-.8l.5-2.3a.5.5 0 0 1 .6-.3l1.8.4a1.5 1.5 0 1 1-.2.9l-1.4-.3-.4 1.9a6.1 6.1 0 0 1 2.8.8c1-.6 2 .5 1.2 1.6a6.3 6.3 0 0 1 .6 2.3 3 3 0 0 1 .1.3zM9 13a1 1 0 1 0 1-1 1 1 0 0 0-1 1zm6 0a1 1 0 1 0-1 1 1 1 0 0 0 1-1zm-1 2.3a.4.4 0 0 0-.5 0 3 3 0 0 1-3 0 .4.4 0 0 0-.5.5 3.7 3.7 0 0 0 4 0 .4.4 0 0 0 0-.5z" />
      </svg>
    ),
    url: (t, h) => `https://www.reddit.com/submit?url=${encodeURIComponent(h)}&title=${encodeURIComponent(t)}`,
  },
  {
    id: 'link',
    name: 'Copy link',
    color: '#b91c1c',
    reward: 25,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" />
        <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
      </svg>
    ),
    url: () => '',
  },
];

const STORAGE_KEY = 'spiderspins_shared';

export default function SocialShare() {
  const [shared, setShared] = useState<Record<string, boolean>>({});
  const [totalEarned, setTotalEarned] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setShared(parsed.shared || {});
        setTotalEarned(parsed.totalEarned || 0);
      }
    } catch {}
  }, []);

  const persist = (nextShared: typeof shared, nextTotal: number) => {
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ shared: nextShared, totalEarned: nextTotal })
      );
    } catch {}
  };

  const handleShare = async (c: Channel) => {
    if (shared[c.id]) {
      setToast('Already claimed this reward this session');
      window.setTimeout(() => setToast(null), 2400);
      return;
    }
    if (c.id === 'link') {
      try {
        await navigator.clipboard.writeText(SITE_URL);
      } catch {}
    } else {
      const href = c.url(SHARE_TEXT, SITE_URL);
      window.open(href, '_blank', 'noopener,noreferrer,width=600,height=520');
    }
    const next = { ...shared, [c.id]: true };
    const nextTotal = totalEarned + c.reward;
    setShared(next);
    setTotalEarned(nextTotal);
    persist(next, nextTotal);
    setToast(`+${c.reward} silk points credited`);
    window.setTimeout(() => setToast(null), 2600);
  };

  return (
    <section id="refer" className="relative z-10 py-20 md:py-28 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <p className="font-mono text-silk-dim text-[11px] uppercase tracking-[0.42em] mb-3">
          Social share · referral
        </p>
        <h2 className="font-display font-black text-silk leading-[0.95] text-[clamp(1.8rem,5vw,3.4rem)]">
          Share the <em className="text-strike not-italic">web</em>. Earn silk.
        </h2>
        <p className="mt-4 max-w-xl mx-auto font-display font-light text-silk-dim text-base md:text-lg">
          Every channel pays out once per session. Stack all four and the Colony returns 200 Silk Points — straight into your Boutique balance.
        </p>

        <div className="mt-9 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
          {channels.map((c) => {
            const done = !!shared[c.id];
            return (
              <button
                key={c.id}
                onClick={() => handleShare(c)}
                className={[
                  'hover-target relative flex flex-col items-center gap-2 px-3 py-5 rounded-xl border transition-all',
                  done
                    ? 'border-fang/50 bg-fang/5 cursor-default'
                    : 'border-web/70 bg-cave/60 hover:border-strike/60 hover:-translate-y-0.5',
                ].join(' ')}
                style={
                  done
                    ? { boxShadow: '0 0 18px -6px rgba(196,162,101,0.5)' }
                    : undefined
                }
              >
                <span
                  className="inline-flex items-center justify-center w-10 h-10 rounded-md"
                  style={{
                    background: done ? 'rgba(196,162,101,0.12)' : `${c.color}18`,
                    color: done ? '#c4a265' : c.color,
                    border: `1px solid ${done ? 'rgba(196,162,101,0.45)' : c.color + '44'}`,
                  }}
                >
                  {done ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5 9-11" /></svg>
                  ) : (
                    c.icon
                  )}
                </span>
                <span className="font-display text-silk text-[13px] font-medium">{c.name.replace('Share on ', '')}</span>
                <span
                  className={[
                    'font-mono text-[10px] uppercase tracking-[0.22em]',
                    done ? 'text-fang' : 'text-silk-dim',
                  ].join(' ')}
                >
                  {done ? '✓ claimed' : `+${c.reward} silk`}
                </span>
              </button>
            );
          })}
        </div>

        {/* Total earned tracker */}
        <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-fang/40 bg-cave/60 px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.28em]">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-fang shadow-[0_0_6px_#c4a265]" />
          <span className="text-silk-dim">Earned this session</span>
          <span className="text-fang font-bold tabular-nums text-base">
            {totalEarned}
          </span>
          <span className="text-silk-dim">silk</span>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[170] rounded-full border border-strike/60 bg-cave/95 backdrop-blur-md px-5 py-3 font-mono text-[11px] uppercase tracking-[0.28em]"
          style={{
            boxShadow: '0 20px 40px -20px rgba(239,68,68,0.6)',
            animation: 'paidFlashIn 0.3s cubic-bezier(0.22,1,0.36,1)',
          }}
        >
          <span className="text-strike">● </span>
          <span className="text-silk">{toast}</span>
        </div>
      )}
    </section>
  );
}
