import Link from 'next/link';
import type { ReactNode } from 'react';
import Image from 'next/image';

// Blacked-out bar standing in for a name that can't be shown yet.
export function Redacted({ width = '6ch' }: { width?: string }) {
  return <span className="redacted" style={{ width }} role="img" aria-label="Redacted" />;
}

// Square rounded logo shown at the start of a row.
// `glyph` is for single-colour brand marks that need a tile behind them.
export function Logo({ src, glyph = false }: { src: string; glyph?: boolean }) {
  return <Image className={glyph ? 'prow-logo glyph' : 'prow-logo'} src={src} alt="" width={22} height={22} />;
}

// Quiet Leo-style row: optional logo, name + muted "role · description" meta,
// optional right-aligned muted date. No borders, no cards.
export function Row({
  href,
  logo,
  name,
  meta,
  date,
  onFocusEnter,
}: {
  href?: string;
  logo?: ReactNode;
  name: ReactNode;
  meta?: ReactNode;
  date?: string;
  onFocusEnter?: () => void;
}) {
  const body = (
    <>
      {logo}
      <span className="prow-main">
        <span className="prow-name">{name}</span>
        {meta && <span className="prow-meta"> {meta}</span>}
      </span>
      {date && <span className="prow-date">{date}</span>}
    </>
  );

  const events = { onMouseEnter: onFocusEnter, onFocus: onFocusEnter };
  if (href) {
    const external = href.startsWith('http') || href.startsWith('mailto:');
    if (external) {
      return (
        <a
          className="prow"
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          {...events}
        >
          {body}
        </a>
      );
    }
    return (
      <Link className="prow" href={href} {...events}>
        {body}
      </Link>
    );
  }
  return <div className="prow" {...events}>{body}</div>;
}

export function PanelLabel({
  children,
  href,
  allLabel,
}: {
  children: ReactNode;
  href?: string;
  allLabel?: string;
}) {
  return (
    <h2 className="panel-label">
      {children}
      {href && (
        <Link href={href} aria-label={allLabel || `All ${String(children)}`}>
          All →
        </Link>
      )}
    </h2>
  );
}
