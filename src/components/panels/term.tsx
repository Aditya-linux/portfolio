import type { ReactNode } from 'react';

// Terminal-style line: muted orange $, fixed-width muted key, then the value.
export function TLine({ k, children }: { k: string; children: ReactNode }) {
  return (
    <p className="tline">
      <span className="tp" aria-hidden="true">$</span>
      <span className="tk">{k}</span>
      <span className="tv">{children}</span>
    </p>
  );
}

export function TLink({ href, children }: { href: string; children: ReactNode }) {
  const external = href.startsWith('http') || href.startsWith('mailto:');
  return (
    <a className="tlink" href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
      {children}
    </a>
  );
}
