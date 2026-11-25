import type { Metadata } from 'next';
import localFont from 'next/font/local';
import { siteUrl } from '../site';
import { SiteShell } from '../components/site-shell';
import 'lenis/dist/lenis.css';
import '../style.css';

const dmSans = localFont({
  src: [
    {
      path: '../../node_modules/@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2',
      weight: '100 1000',
      style: 'normal',
    },
  ],
  variable: '--font-dm-sans',
  display: 'swap',
  preload: true,
});
const geistMono = localFont({
  src: [
    {
      path: '../../node_modules/@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2',
      weight: '100 900',
      style: 'normal',
    },
  ],
  variable: '--font-geist-mono',
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: 'Aditya Nishad | AI & Web3 product builder',
  description: 'Aditya Nishad builds AI and Web3 products across fintech, automation and blockchain.',
  metadataBase: new URL(siteUrl),
  authors: [{ name: 'Aditya Nishad', url: siteUrl }],
  robots: { follow: true },
  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName: 'Aditya Nishad',
    title: 'Aditya Nishad | AI & Web3 product builder',
    description: 'Aditya Nishad builds AI and Web3 products across fintech, automation and blockchain.',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'Aditya Nishad, AI and Web3 product builder' }],
  },
  twitter: { card: 'summary_large_image', creator: '@AdityaNishad987' },
};

const themeBoot = `(function(){try{var k='aditya-portfolio-theme';var s=localStorage.getItem(k);var t=s==='dark'||s==='light'?s:(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t;}catch(e){}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning className={`${dmSans.variable} ${geistMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
      </head>
      <body><SiteShell>{children}</SiteShell></body>
    </html>
  );
}
