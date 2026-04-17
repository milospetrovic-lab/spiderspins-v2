import type { Metadata, Viewport } from 'next';
import { Outfit, Space_Mono } from 'next/font/google';
import './globals.css';
import SpiderWebCursor from '@/components/SpiderWebCursor';
import CustomCursor from '@/components/CustomCursor';
import FogLayers from '@/components/FogLayers';
import WebBackground from '@/components/WebBackground';
import GrainOverlay from '@/components/GrainOverlay';
import Navbar from '@/components/Navbar';
import ScrollProgress from '@/components/ScrollProgress';
import Preloader from '@/components/Preloader';
import AmbientParticles from '@/components/AmbientParticles';
import ParticleField3D from '@/components/ParticleField3D';
import HUDOverlay from '@/components/HUDOverlay';
import ScrollSpider from '@/components/ScrollSpider';
import ConfettiCannon from '@/components/ConfettiCannon';
import RewardOrb from '@/components/RewardOrb';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-outfit',
  display: 'swap',
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'SpiderSpins — Your web. Your rules.',
  description:
    'Every thread leads somewhere. Every spin tightens the web. SpiderSpins — patient, precise, always in control.',
  metadataBase: new URL('https://spiderspins.vercel.app'),
  openGraph: {
    title: 'SpiderSpins — Your web. Your rules.',
    description:
      'Transparent math, 500+ games, 8K+ Colony. The patient casino for players who read the web.',
    url: 'https://spiderspins.vercel.app',
    siteName: 'SpiderSpins',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SpiderSpins — Your web. Your rules.',
    description:
      'Transparent math. Patient wins. 500+ games, 8K+ Colony.',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Structured data — Organization + WebSite schema. Gives search engines +
  // AI crawlers a clear picture of what SpiderSpins is, plus the site-search
  // URL template for the sitelinks search box in Google results.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://spiderspins.vercel.app/#organization',
        name: 'SpiderSpins',
        url: 'https://spiderspins.vercel.app/',
        logo: 'https://spiderspins.vercel.app/icon.svg',
        description:
          'Patient-player online casino. Transparent math, 500+ games, 5-tier VIP lifecycle.',
        slogan: 'Your web. Your rules.',
        foundingDate: '2026',
        sameAs: [
          'https://twitter.com/spiderspins',
          'https://t.me/spiderspins',
          'https://discord.gg/spiderspins',
        ],
      },
      {
        '@type': 'WebSite',
        '@id': 'https://spiderspins.vercel.app/#website',
        url: 'https://spiderspins.vercel.app/',
        name: 'SpiderSpins',
        publisher: { '@id': 'https://spiderspins.vercel.app/#organization' },
        inLanguage: 'en-US',
      },
    ],
  };

  return (
    <html lang="en" className={`${outfit.variable} ${spaceMono.variable}`}>
      <body className="bg-void text-silk font-display antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Preloader />
        <ScrollProgress />
        <WebBackground />
        <AmbientParticles />
        <ParticleField3D />
        <FogLayers />
        <SpiderWebCursor />
        <GrainOverlay />
        <HUDOverlay />
        <ScrollSpider />
        <CustomCursor />
        <Navbar />
        <RewardOrb />
        <main className="relative z-10">{children}</main>
        <ConfettiCannon scope="viewport" />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
