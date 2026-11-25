'use client';

import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useReducedMotion } from 'motion/react';
import Lenis from 'lenis';
import { AuroraHero } from './dithercn/aurora-hero';
import { usePageTransition } from './page-transition';
import { ThemeProvider } from './theme-provider';
import type { View } from './site-nav';

const SECTION_VIEWS = new Set<View>([
  'work', 'projects', 'videos', 'blog', 'contact', 'about', 'privacy', 'api', 'developers',
]);

function viewFromPath(pathname: string | null): View {
  if (pathname === '/') return 'home';
  const [seg, sub] = (pathname ?? '').split('/').filter(Boolean);
  if (seg === 'projects' && sub) return 'project';
  if (seg === 'blog' && sub) return 'post';
  return SECTION_VIEWS.has(seg as View) ? (seg as View) : 'not-found';
}

export function SiteShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const view = viewFromPath(pathname);
  const reducedMotion = useReducedMotion();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({ anchors: true, autoRaf: true, stopInertiaOnNavigate: true, smoothWheel: !reducedMotion });
    lenisRef.current = lenis;
    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reducedMotion]);

  const getLenis = useCallback(() => lenisRef.current, []);

  const innerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const skyRef = useRef<HTMLDivElement>(null);
  usePageTransition({ inner: innerRef, footer: footerRef, sky: skyRef, getLenis });

  return (
    <ThemeProvider>
      <main className={`page page-${view}`}>
        <div ref={skyRef} className="sky" aria-hidden="true">
          <AuroraHero className="dither-fill" height={0.42} length={0.7} />
        </div>
        <div className="page-view">
          <div ref={innerRef}>{children}</div>
        </div>
        <footer ref={footerRef} className="site-footer">
          <nav className="foot-nav" aria-label="Site">
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
          </nav>
          <div className="footer-aurora" aria-hidden="true">
            <AuroraHero className="dither-fill" intensity={0.95} glow={1.1} height={0.08} />
          </div>
        </footer>
      </main>
    </ThemeProvider>
  );
}
