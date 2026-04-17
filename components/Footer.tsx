import SpiderMark from './SpiderMark';

// All links resolve to real pages or in-page anchors. Promotions, Support, and
// Refer-a-Friend remain stubs (route to /404) until their dedicated pages exist.
const navGroups = [
  {
    title: 'Casino',
    links: [
      { label: 'Games', href: '/#games' },
      { label: 'Promotions', href: '/404' },
      { label: 'Spinnerets', href: '/#spinnerets' },
      { label: 'Colony', href: '/#colony' },
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'Responsible Gaming', href: '/responsible-gambling' },
      { label: 'Terms', href: '/terms' },
      { label: 'Privacy', href: '/privacy' },
      { label: 'Support', href: '/404' },
    ],
  },
  {
    title: 'The Lair',
    links: [
      { label: 'About', href: '/menagerie' },
      { label: 'VIP', href: '/#vip' },
      { label: 'Banking', href: '/#cashier' },
      { label: 'Refer a Friend', href: '/#refer' },
    ],
  },
];

export default function Footer() {
  return (
    <footer
      id="lair"
      className="relative z-10 mt-10 pt-20 pb-10 px-6"
      style={{
        background: 'linear-gradient(180deg, #0a0a0a 0%, #050505 100%)',
      }}
    >
      {/* SVG web strand decoration along top edge */}
      <svg
        aria-hidden
        viewBox="0 0 1400 60"
        preserveAspectRatio="none"
        className="pointer-events-none absolute top-0 left-0 w-full h-10 opacity-60"
      >
        <path
          d="M0 30 Q 100 6 200 30 T 400 30 T 600 30 T 800 30 T 1000 30 T 1200 30 T 1400 30"
          fill="none"
          stroke="#222"
          strokeWidth="1"
        />
        {Array.from({ length: 14 }).map((_, i) => (
          <g key={i}>
            <line
              x1={100 + i * 100}
              y1={30}
              x2={100 + i * 100}
              y2={i % 2 === 0 ? 60 : 0}
              stroke="#222"
              strokeWidth="0.6"
            />
            {i % 3 === 1 && (
              <circle cx={100 + i * 100} cy={30} r="1.5" fill="#ef4444" />
            )}
          </g>
        ))}
      </svg>

      <div className="max-w-6xl mx-auto">
        <div className="grid gap-12 md:grid-cols-[1.3fr_2fr]">
          {/* brand */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <SpiderMark size={36} />
              <span className="font-display font-light tracking-[0.22em] text-silk uppercase text-lg">
                SpiderSpins
              </span>
            </div>
            <p className="font-display font-light text-silk-dim text-sm max-w-xs leading-relaxed">
              Your web. Your rules. A patient casino for players who read the web.
            </p>

            <a
              href="/responsible-gambling"
              className="hover-target mt-6 flex items-center gap-3 group"
            >
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-strike/50 group-hover:border-strike text-strike font-mono font-bold text-xs transition-colors">
                18+
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.26em] text-silk-dim group-hover:text-silk transition-colors leading-snug">
                Play responsibly.
                <br />
                The web is patient — so are the wins.
              </span>
            </a>
          </div>

          {/* nav groups */}
          <div className="grid grid-cols-3 gap-6">
            {navGroups.map((g) => (
              <div key={g.title}>
                <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-strike mb-3">
                  {g.title}
                </div>
                <ul className="space-y-2">
                  {g.links.map((l) => (
                    <li key={l.href}>
                      <a
                        href={l.href}
                        className="hover-target font-display text-sm text-silk-dim hover:text-silk transition-colors"
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* license + copy */}
        <div className="mt-14 pt-6 border-t border-web/60 flex flex-col md:flex-row md:items-center md:justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.28em] text-shadow">
          <div>License · [placeholder] · Curaçao eGaming</div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span>© {new Date().getFullYear()} SpiderSpins</span>
            <span className="text-silk-dim">Your web. Your rules.</span>
          </div>
        </div>

        {/* author signature */}
        <div className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.32em] text-shadow">
          <span>Designed &amp; built by </span>
          <span className="text-silk">Milos Petrovic</span>
          <span className="mx-2 text-web-light">·</span>
          <span className="text-fang">Marketing Assistant</span>
        </div>
      </div>
    </footer>
  );
}
