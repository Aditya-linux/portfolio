'use client';

import type { ReactNode } from 'react';
import type { BlogPost } from './blog';
import { AuroraHero } from './components/dithercn/aurora-hero';
import type { View } from './components/site-nav';
import { WorkPanel } from './components/panels/work-panel';
import { WebDevPanel } from './components/panels/webdev-panel';
import { MergedPrsPanel } from './components/panels/merged-prs-panel';
import { GithubPanel } from './components/panels/github-panel';
import { PanelLabel } from './components/panels/rows';
import { ProfileHeader } from './components/profile-header';
import { PreviewLink } from './components/preview-link';
import type { Contributions } from './github';

export { EditingCarousel } from './components/editing-showcase';

// The centred content column of every page. The shell (site-shell.tsx)
// owns the top sky, the footer and smooth scrolling.
export function App({ children, view, contributions = null }: {
  children?: ReactNode;
  view: View;
  posts?: BlogPost[];
  contributions?: Contributions | null;
}) {
  if (view === 'not-found') return <NotFound />;

  return (
    <div className="column">
      {view === 'home' ? <Home contributions={contributions} /> : (
        <>
          <a className="brand-link" href="/" aria-label="Back to home"><span aria-hidden="true">← </span>Aditya Nishad</a>
          <div className="page-body">{children}</div>
        </>
      )}
    </div>
  );
}

function Home({ contributions }: { contributions: Contributions | null }) {
  return (
    <>
      <ProfileHeader />
      <section className="intro" aria-label="Introduction">
        <p>
          I build{' '}
          <PreviewLink href="/projects" media={[{ type: 'image', src: '/tappay.png', kind: 'shot' }]}>fintech</PreviewLink>,{' '}
          <PreviewLink href="/projects" media={[{ type: 'image', src: '/arthveda.png', kind: 'shot' }]}>AI</PreviewLink> and{' '}
          <PreviewLink href="/projects" media={[{ type: 'image', src: '/nebula.png', kind: 'shot' }]}>blockchain</PreviewLink> products —
          and contribute to open source across Stellar, NEAR and more.
        </p>
        <p className="intro-secondary">
          Right now I’m a Stellar Brand Ambassador and co-founder of{' '}
          <PreviewLink href="/projects/tappay" media={[{ type: 'image', src: '/tappay.png', kind: 'shot' }]}>TapPay</PreviewLink>.
        </p>
      </section>
      <div className="page-body">
        <WorkPanel label="Experience" />
        <WebDevPanel label="Projects" showImages={false} />
        <MergedPrsPanel label="Merged PRs" />
        {contributions ? (
          <GithubPanel data={contributions} />
        ) : (
          <>
            <PanelLabel>GitHub</PanelLabel>
            <a className="gh-profile" href="https://github.com/Aditya-linux" target="_blank" rel="noopener noreferrer">
              @Aditya-linux ↗
            </a>
          </>
        )}
        <PanelLabel>Writing</PanelLabel>
        <a className="read-link" href="https://medium.com/@adityanishad0402" target="_blank" rel="noopener noreferrer">
          Read on Medium <span aria-hidden="true">→</span>
        </a>
      </div>
    </>
  );
}

function NotFound() {
  return (
    <section className="not-found-hero" aria-labelledby="not-found-title">
      <div className="not-found-dither" aria-hidden="true">
        <AuroraHero className="dither-fill" intensity={0.55} height={0.3} />
      </div>
      <div className="not-found-copy">
        <h1 id="not-found-title">404</h1>
        <p>This page isn’t here.</p>
        <a className="back-home" href="/">Back home <span aria-hidden="true">→</span></a>
      </div>
    </section>
  );
}
