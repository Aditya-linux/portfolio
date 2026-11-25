'use client';

import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';
import { usePathname } from 'next/navigation';
import type Lenis from 'lenis';

const EASE = 'cubic-bezier(.22, 1, .36, 1)';
const GLIDE_MS = 700;
const FADE_MS = 160;
const OFFSCREEN_MARGIN = 24;

type Snapshot = {
  scrollY: number;
  footerTop: number;
  padTop: number | null;
  innerY: number;
  skyY: number;
};

// Read the current visual offset, including an interrupted Web Animation.
function translateY(element: HTMLElement | null): number {
  if (!element) return 0;
  const transform = getComputedStyle(element).transform;
  return transform === 'none' ? 0 : new DOMMatrixReadOnly(transform).m42;
}

// Elements only move when their position really changes, continuing from the last visible frame.
// When nothing has to move, the new content fades in and the header and auroras stay still.
export function usePageTransition({ inner, footer, sky, getLenis }: {
  inner: RefObject<HTMLDivElement | null>;
  footer: RefObject<HTMLElement | null>;
  sky: RefObject<HTMLDivElement | null>;
  getLenis: () => Lenis | null;
}): void {
  const pathname = usePathname();
  const pathRef = useRef(pathname);
  const popRef = useRef(false);
  const animsRef = useRef<Animation[]>([]);
  const footerAnimRef = useRef<Animation | null>(null);
  const frameRef = useRef<number | null>(null);
  const footerLayoutRef = useRef(0);
  const snapRef = useRef<Snapshot>({ scrollY: 0, footerTop: 0, padTop: null, innerY: 0, skyY: 0 });
  const pendingRef = useRef<Snapshot | null>(null);

  const padding = () => {
    const column = inner.current?.querySelector('.column');
    return column ? parseFloat(getComputedStyle(column).paddingTop) : null;
  };
  const snapshot = () => {
    const snap = {
      scrollY: window.scrollY,
      footerTop: footer.current?.getBoundingClientRect().top ?? 0,
      padTop: padding(),
      innerY: translateY(inner.current),
      skyY: translateY(sky.current),
    };
    snapRef.current = snap;
    return snap;
  };
  const stop = () => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    for (const animation of animsRef.current) animation.cancel();
    animsRef.current = [];
    footerAnimRef.current = null;
  };

  // Animate the footer itself: flex auto margins must not absorb its movement.
  const glideFooter = (from: number) => {
    const element = footer.current;
    if (!element) return;
    footerAnimRef.current?.cancel();
    const target = element.getBoundingClientRect().top;
    footerLayoutRef.current = target + window.scrollY;
    const edge = window.innerHeight + OFFSCREEN_MARGIN;
    const start = Math.min(from, edge) - target;
    const end = Math.min(target, edge) - target;
    if (Math.abs(start - end) <= 1) return;
    const animation = element.animate(
      [{ transform: `translateY(${start}px)` }, { transform: `translateY(${end}px)` }],
      { duration: GLIDE_MS, easing: EASE },
    );
    footerAnimRef.current = animation;
    animsRef.current.push(animation);
  };

  // Rebase late content layout before either the observer or animation clock saves a frame.
  const captureFrame = () => {
    const foot = footer.current;
    if (foot && animsRef.current.some((animation) => animation.playState === 'running')) {
      const layoutTop = foot.getBoundingClientRect().top + window.scrollY - translateY(foot);
      if (Math.abs(layoutTop - footerLayoutRef.current) > 1) glideFooter(snapRef.current.footerTop);
    }
    snapshot();
  };

  useEffect(() => {
    snapshot();
    const onPop = () => { popRef.current = true; pendingRef.current = null; };
    // Capture before Next replaces content or restores scroll, even mid-animation.
    const onNavigate = (event: MouseEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
      if (!(link instanceof HTMLAnchorElement) || link.target === '_blank' || link.hasAttribute('download')) return;
      const destination = new URL(link.href, window.location.href);
      if (destination.origin === window.location.origin && destination.pathname !== pathRef.current) {
        pendingRef.current = snapshot();
      }
    };
    window.addEventListener('scroll', snapshot, { passive: true });
    window.addEventListener('resize', snapshot);
    window.addEventListener('popstate', onPop);
    document.addEventListener('click', onNavigate, true);
    return () => {
      window.removeEventListener('scroll', snapshot);
      window.removeEventListener('resize', snapshot);
      window.removeEventListener('popstate', onPop);
      document.removeEventListener('click', onNavigate, true);
      stop();
    };
  }, []);

  useLayoutEffect(() => {
    const element = inner.current;
    if (!element) return;
    const observer = new ResizeObserver(captureFrame);
    observer.observe(element);
    snapshot();
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const innerEl = inner.current;
    const skyEl = sky.current;
    if (!innerEl || !skyEl || !footer.current || pathRef.current === pathname) return;
    pathRef.current = pathname;
    const snap = pendingRef.current ?? snapRef.current;
    pendingRef.current = null;
    stop();
    if (popRef.current || window.location.hash) {
      popRef.current = false;
      getLenis()?.resize();
      snapshot();
      return;
    }

    const lenis = getLenis();
    lenis?.resize();
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
    else window.scrollTo(0, 0);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      snapshot();
      return;
    }

    const lift = Math.min(snap.scrollY, window.innerHeight * 0.4);
    const newPadding = padding();
    const padDelta = snap.padTop === null || newPadding === null ? 0 : snap.padTop - newPadding;
    const glide = (element: HTMLElement, offset: number) => {
      if (Math.abs(offset) <= 1) return;
      animsRef.current.push(element.animate(
        [{ transform: `translateY(${offset}px)` }, { transform: 'none' }],
        { duration: GLIDE_MS, easing: EASE },
      ));
    };
    const contentOffset = snap.innerY - lift + padDelta;
    glide(innerEl, contentOffset);
    if (Math.abs(contentOffset) <= 1) {
      animsRef.current.push(innerEl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE_MS, easing: 'ease-out' }));
    }
    glide(skyEl, snap.skyY - lift);
    glideFooter(snap.footerTop);

    // Track only while moving, so another navigation starts at the visible frame.
    const track = () => {
      captureFrame();
      frameRef.current = animsRef.current.some((animation) => animation.playState === 'running')
        ? requestAnimationFrame(track) : null;
    };
    track();
  }, [pathname, getLenis]);
}
