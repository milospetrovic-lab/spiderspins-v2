import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'SpiderSpins — Your web. Your rules.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Dynamically generated 1200x630 OG card. Edge-runtime, no static asset needed.
export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 80px',
          background:
            'radial-gradient(ellipse 60% 50% at 30% 20%, rgba(185,28,28,0.18) 0%, transparent 60%), radial-gradient(ellipse 50% 60% at 80% 90%, rgba(239,68,68,0.12) 0%, transparent 55%), #050505',
          color: '#e8e8e8',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Spider web SVG decoration top-right */}
        <svg
          style={{ position: 'absolute', top: -120, right: -120, width: 520, height: 520, opacity: 0.18 }}
          viewBox="0 0 400 400"
        >
          <g stroke="#ef4444" strokeWidth="0.8" fill="none">
            {Array.from({ length: 16 }).map((_, i) => {
              const a = (i / 16) * Math.PI * 2;
              return (
                <line
                  key={i}
                  x1="200"
                  y1="200"
                  x2={(200 + Math.cos(a) * 200).toFixed(1)}
                  y2={(200 + Math.sin(a) * 200).toFixed(1)}
                />
              );
            })}
            {[60, 110, 160].map((r) => (
              <circle key={r} cx="200" cy="200" r={r} />
            ))}
          </g>
        </svg>

        {/* Header pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 999,
              background: '#ef4444',
              boxShadow: '0 0 18px #ef4444',
            }}
          />
          <span
            style={{
              fontSize: 18,
              letterSpacing: '0.36em',
              textTransform: 'uppercase',
              color: '#aaa',
            }}
          >
            SpiderSpins · Brand #10
          </span>
        </div>

        {/* Title block */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div
            style={{
              fontSize: 132,
              lineHeight: 0.95,
              fontWeight: 900,
              letterSpacing: '-0.025em',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <span style={{ color: '#e8e8e8' }}>Your web.</span>
            <span>
              <span style={{ color: '#e8e8e8' }}>Your </span>
              <span style={{ color: '#ef4444' }}>rules</span>
              <span style={{ color: '#e8e8e8' }}>.</span>
            </span>
          </div>
          <p
            style={{
              fontSize: 26,
              lineHeight: 1.45,
              color: '#aaa',
              maxWidth: 820,
              fontWeight: 300,
            }}
          >
            Patient math · red silk · a casino for players who read the web.
          </p>
        </div>

        {/* Footer row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
            <span style={{ fontSize: 14, letterSpacing: '0.32em', textTransform: 'uppercase', color: '#666' }}>
              spiderspins.com
            </span>
            <span style={{ fontSize: 14, color: '#444' }}>·</span>
            <span style={{ fontSize: 14, letterSpacing: '0.32em', textTransform: 'uppercase', color: '#c4a265' }}>
              500+ games · 5 species
            </span>
          </div>
          {/* Mini spider mark */}
          <svg width="56" height="56" viewBox="0 0 64 64">
            <g stroke="#e8e8e8" strokeWidth="1.2" strokeLinecap="round">
              <path d="M32 32 L20 22 L17 24" />
              <path d="M32 32 L18 30 L15 32" />
              <path d="M32 32 L18 34 L15 36" />
              <path d="M32 32 L20 42 L17 44" />
              <path d="M32 32 L44 22 L47 24" />
              <path d="M32 32 L46 30 L49 32" />
              <path d="M32 32 L46 34 L49 36" />
              <path d="M32 32 L44 42 L47 44" />
            </g>
            <circle cx="32" cy="26" r="3.5" fill="#050505" stroke="#e8e8e8" strokeWidth="0.8" />
            <ellipse cx="32" cy="34" rx="5.5" ry="6.5" fill="#050505" stroke="#e8e8e8" strokeWidth="0.8" />
            <path d="M29 32 L35 32 L31 36 L33 36 L29 40 L35 40" stroke="#ef4444" strokeWidth="1.4" fill="none" />
          </svg>
        </div>
      </div>
    ),
    { ...size }
  );
}
