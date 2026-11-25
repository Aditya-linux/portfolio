'use client';

import Link from 'next/link';
import { useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

type PreviewMedia = (
  | { type: 'image'; src: string }
  | { type: 'video'; src: string; poster: string }
  | { type: 'profile'; src: string; name: string; handle: string }
) & { kind?: 'logo' | 'shot' | 'tall' | 'profile' };

const GAP = 14;
const GUTTER = 16;

// Frame-rate independent exponential easing: snappy, never overshoots.
const approach = (current: number, target: number, dt: number, seconds: number) =>
  current + (target - current) * (1 - Math.exp(-dt / seconds));

// Media rides beside the pointer (left by default) or anchors to the link for keyboard focus.
export function PreviewLink({ href, media, side: preferred = 'left', children }: {
  href: string;
  media: PreviewMedia[];
  side?: 'left' | 'right';
  children: ReactNode;
}) {
  const [active, setActive] = useState<'pointer' | 'keyboard' | null>(null);
  const anchor = useRef<HTMLAnchorElement>(null);
  const preview = useRef<HTMLSpanElement>(null);
  const dims = useRef<HTMLSpanElement>(null);
  const pointer = useRef({ x: 0, y: 0 });

  useLayoutEffect(() => {
    if (!active) return;
    const popup = preview.current;
    const link = anchor.current;
    if (!popup || !link) return;

    const still = active === 'keyboard' || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pos = { x: 0, y: 0 };
    let raf = 0;
    let last = performance.now();
    let placed = false;
    let lean = 0;
    let shown = still ? 1 : 0;
    let slide = still ? 0 : 1; // 1 = fully offset toward the cursor, eases to 0
    let side = 1;

    const goal = () => {
      const width = popup.offsetWidth;
      const height = popup.offsetHeight;
      const bounds = link.getBoundingClientRect();
      const keyboardX = preferred === 'left' ? bounds.left : bounds.right;
      const point = active === 'keyboard' ? { x: keyboardX, y: bounds.top + bounds.height / 2 } : pointer.current;
      const fitsLeft = point.x - GAP - width >= GUTTER;
      const fitsRight = point.x + GAP + width <= window.innerWidth - GUTTER;
      const left = preferred === 'left' ? fitsLeft || !fitsRight : !fitsRight && fitsLeft;
      side = left ? 1 : 0;
      return {
        x: left ? Math.max(GUTTER, point.x - GAP - width) : Math.min(point.x + GAP, window.innerWidth - width - GUTTER),
        y: Math.max(GUTTER, Math.min(point.y - height / 2, window.innerHeight - height - GUTTER)),
      };
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now;
      const target = goal();
      if (!placed || still) {
        pos.x = target.x;
        pos.y = target.y;
        placed = true;
      }
      const previousX = pos.x;
      pos.x = approach(pos.x, target.x, dt, 0.05);
      pos.y = approach(pos.y, target.y, dt, 0.05);
      if (!still) {
        const velocity = (pos.x - previousX) / dt;
        lean = approach(lean, Math.max(-4, Math.min(4, velocity * 0.004)), dt, 0.08);
        shown = approach(shown, 1, dt, 0.05);
        slide = approach(slide, 0, dt, 0.07);
      }
      popup.style.transformOrigin = `${side * 100}% 50%`;
      // Slide in from the cursor side: start tucked toward the pointer, then snap out.
      const offset = slide * 28 * (side ? 1 : -1);
      popup.style.transform = `translate3d(${pos.x + offset}px, ${pos.y}px, 0) rotate(${lean}deg) scale(${0.96 + 0.04 * shown})`;
      popup.style.opacity = String(shown);
      if (dims.current) dims.current.textContent = `${popup.offsetWidth} × ${popup.offsetHeight}`;
      raf = requestAnimationFrame(tick);
    };

    tick(performance.now());
    const dismiss = () => setActive(null);
    window.addEventListener('resize', dismiss);
    window.addEventListener('scroll', dismiss, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', dismiss);
      window.removeEventListener('scroll', dismiss, true);
    };
  }, [active]);

  const external = /^https?:\/\//.test(href);
  const first = media[0];
  const name = media.length > 1 ? `${media.length} items` : first.type === 'profile' ? first.handle : first.src.split('/').pop();
  return (
    <>
      <Link
        ref={anchor}
        className="preview-link"
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        onPointerEnter={(event) => {
          if (event.pointerType === 'touch') return;
          pointer.current = { x: event.clientX, y: event.clientY };
          setActive('pointer');
        }}
        onPointerMove={(event) => {
          pointer.current = { x: event.clientX, y: event.clientY };
        }}
        onPointerLeave={(event) => setActive(event.currentTarget.matches(':focus-visible') ? 'keyboard' : null)}
        onPointerCancel={() => setActive(null)}
        onFocus={(event) => {
          if (event.currentTarget.matches(':focus-visible')) setActive('keyboard');
        }}
        onBlur={() => setActive(null)}
        onClick={() => setActive(null)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setActive(null);
        }}
      >
        {children}
      </Link>
      {active && createPortal(
        <span ref={preview} className="link-preview" aria-hidden="true">
          <span className="link-preview-label">
            <span>{name}</span>
            <span ref={dims} />
          </span>
          <span className="link-preview-content">
            {media.map((item) => (
              <span className={`link-preview-item is-${item.kind ?? 'logo'}`} key={item.src}>
                {item.type === 'video' ? (
                  <video src={item.src} poster={item.poster} autoPlay={active !== 'keyboard'} muted loop playsInline preload="metadata" />
                ) : item.type === 'profile' ? (
                  <>
                    <img className="link-preview-avatar" src={item.src} alt="" />
                    <span className="link-preview-who">
                      <span className="link-preview-name">{item.name}</span>
                      <span className="link-preview-handle">{item.handle}</span>
                    </span>
                  </>
                ) : (
                  <img src={item.src} alt="" />
                )}
              </span>
            ))}
          </span>
        </span>,
        document.body,
      )}
    </>
  );
}
