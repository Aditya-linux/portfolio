'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { BlogPost } from '@/blog';
import { AuroraHero } from './dithercn/aurora-hero';
import { MePanel } from './panels/me-panel';
import { WorkPanel } from './panels/work-panel';
import { WebDevPanel } from './panels/webdev-panel';
import { VideosPanel } from './panels/videos-panel';
import { BlogPanel } from './panels/blog-panel';
import { ContactPanel } from './panels/contact-panel';
import { KeysPanel } from './panels/keys-panel';
import { IconBlog, IconContact, IconGithub, IconMe, IconVideos, IconWebDev, IconWork } from './desktop-icons';

type WinId = 'me' | 'work' | 'webdev' | 'videos' | 'blog' | 'contact' | 'keys';

type Win = { x: number; y: number; z: number; minimized: boolean; maximized: boolean };

const ORDER: WinId[] = ['me', 'work', 'webdev', 'videos', 'blog', 'contact'];
const ALL: WinId[] = [...ORDER, 'keys'];
const SHORTCUT: Record<WinId, string> = { me: '1', work: '2', webdev: '3', videos: '4', blog: '5', contact: '6', keys: '?' };
const TITLES: Record<WinId, string> = { me: 'me', work: 'work', webdev: 'web dev', videos: 'videos', blog: 'blog', contact: 'contact', keys: 'keys' };
const ICONS: Record<WinId, () => ReactNode> = {
  me: () => <IconMe />,
  work: () => <IconWork />,
  webdev: () => <IconWebDev />,
  videos: () => <IconVideos />,
  blog: () => <IconBlog />,
  contact: () => <IconContact />,
  keys: () => '?',
};

const isWinId = (value: string): value is WinId => (ALL as string[]).includes(value);
const isMobile = () => window.matchMedia('(max-width: 699px)').matches;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(v, hi));

export function Desktop({ posts }: { posts: BlogPost[] }) {
  const reducedMotion = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const winRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [wins, setWins] = useState<Partial<Record<WinId, Win>>>({});
  const [openOrder, setOpenOrder] = useState<WinId[]>([]);
  const [focusId, setFocusId] = useState<WinId | null>(null);
  const [clock, setClock] = useState('');
  const zc = useRef(1);
  const lastPos = useRef({ x: 0, y: 0 });
  const drag = useRef<{ id: WinId; dx: number; dy: number } | null>(null);

  const spotFor = (id: WinId, count: number) => {
    const stage = stageRef.current?.getBoundingClientRect();
    const W = stage?.width ?? 1280;
    const H = stage?.height ?? 800;
    let x: number;
    let y: number;
    if (id === 'me' && count === 0) {
      x = W * 0.56;
      y = H * 0.3;
    } else {
      x = lastPos.current.x + 30;
      y = lastPos.current.y + 30;
      if (x > W - 560 || y > H - 260) {
        x = 96;
        y = 32;
      }
    }
    x = clamp(x, 8, Math.max(8, W - 540));
    y = clamp(y, 8, Math.max(8, H - 60));
    lastPos.current = { x, y };
    return { x, y };
  };

  const openWindow = useCallback((id: WinId) => {
    setOpenOrder((o) => (o.includes(id) ? o : [...o, id]));
    setWins((prev) => {
      const next = { ...prev };
      if (next[id]) {
        next[id] = { ...next[id]!, minimized: false, z: ++zc.current };
      } else {
        next[id] = { ...spotFor(id, Object.keys(next).length), z: ++zc.current, minimized: false, maximized: false };
      }
      if (isMobile()) {
        for (const other of Object.keys(next) as WinId[]) {
          if (other !== id && next[other]) next[other] = { ...next[other]!, minimized: true };
        }
      }
      return next;
    });
    setFocusId(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const closeWindow = useCallback((id: WinId) => {
    setWins((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setFocusId((prevFocus) => (prevFocus === id ? null : prevFocus));
    if (focusId === id) {
      setWins((prev) => {
        let top: WinId | null = null;
        for (const [k, v] of Object.entries(prev) as [WinId, Win][]) {
          if (v && !v.minimized && (!top || v.z > (prev[top]!.z))) top = k;
        }
        setFocusId(top);
        return prev;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusId]);

  const focusWindow = useCallback((id: WinId) => {
    setWins((prev) => {
      if (!prev[id]) return prev;
      if (prev[id]!.minimized) return { ...prev, [id]: { ...prev[id]!, minimized: false, z: ++zc.current } };
      return { ...prev, [id]: { ...prev[id]!, z: ++zc.current } };
    });
    setFocusId(id);
  }, []);

  const toggleWindow = useCallback((id: WinId) => {
    const w = wins[id];
    if (w && !w.minimized) closeWindow(id);
    else if (w) focusWindow(id);
    else openWindow(id);
  }, [wins, closeWindow, focusWindow, openWindow]);

  const minimize = (id: WinId) => {
    setWins((prev) => (prev[id] ? { ...prev, [id]: { ...prev[id]!, minimized: true } } : prev));
    setFocusId((prevFocus) => (prevFocus === id ? null : prevFocus));
  };

  const toggleMax = (id: WinId) => {
    setWins((prev) => (prev[id] ? { ...prev, [id]: { ...prev[id]!, maximized: !prev[id]!.maximized } } : prev));
    setFocusId(id);
  };

  // Clock: Asia/Dubai, updated once a second.
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'Asia/Dubai' });
    const tick = () => setClock(`${fmt.format(new Date())} GST`);
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  // Clamp every open window into the stage once its real height is known.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const H = stage.getBoundingClientRect().height;
    setWins((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const [id, w] of Object.entries(next) as [WinId, Win][]) {
        if (!w || w.maximized || w.minimized) continue;
        const el = winRefs.current[id];
        if (!el) continue;
        const h = el.getBoundingClientRect().height;
        const y = clamp(w.y, 8, Math.max(8, H - 8 - h));
        if (y !== w.y) {
          next[id] = { ...w, y };
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [openOrder]);

  // Seeded star dots for the upper sky.
  const stars = useMemo(() => {
    let s = 42;
    const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
    return Array.from({ length: 26 }, () => ({
      left: rnd() * 100,
      top: 4 + rnd() * 50,
      size: rnd() < 0.7 ? 1 : 2,
      opacity: 0.35 + rnd() * 0.5,
    }));
  }, []);

  // Hash: the focused window's id. Load-time hash opens that window plus me.
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!isMobile()) openWindow('me');
    if (isWinId(id)) {
      openWindow(id);
    }
    const onHash = () => {
      const next = window.location.hash.slice(1);
      if (isWinId(next)) openWindow(next);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const target = focusId ? `#${focusId}` : window.location.pathname;
    if (window.location.hash !== (focusId ? `#${focusId}` : '')) {
      history.pushState(null, '', target);
    }
  }, [focusId]);

  // Keys: 1-6 toggle, Esc closes the focused window, ? opens keys.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
      const idx = '123456'.indexOf(e.key);
      if (idx >= 0) {
        toggleWindow(ORDER[idx]);
      } else if (e.key === 'Escape' && focusId) {
        closeWindow(focusId);
      } else if (e.key === '?') {
        openWindow('keys');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleWindow, closeWindow, openWindow, focusId]);

  const barDown = (e: ReactPointerEvent<HTMLDivElement>, id: WinId) => {
    if (isMobile()) return;
    if ((e.target as HTMLElement).closest('button')) return;
    const w = wins[id];
    if (!w || w.maximized) return;
    drag.current = { id, dx: e.clientX - w.x, dy: e.clientY - w.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const barMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const stage = stageRef.current?.getBoundingClientRect();
    if (!stage) return;
    const el = winRefs.current[d.id]?.getBoundingClientRect();
    const w = el?.width ?? 520;
    const h = el?.height ?? 200;
    const x = clamp(e.clientX - d.dx, 0, Math.max(0, stage.width - w));
    const y = clamp(e.clientY - d.dy, 0, Math.max(0, stage.height - h));
    setWins((prev) => (prev[d.id] ? { ...prev, [d.id]: { ...prev[d.id]!, x, y } } : prev));
  };
  const barUp = () => { drag.current = null; };

  const panel = (id: WinId): ReactNode => {
    switch (id) {
      case 'me': return <MePanel onOpen={(target) => openWindow(target as WinId)} onKeys={() => openWindow('keys')} />;
      case 'work': return <WorkPanel label="" />;
      case 'webdev': return <WebDevPanel label="" />;
      case 'videos': return <VideosPanel label="" />;
      case 'blog': return <BlogPanel posts={posts} label="" />;
      case 'contact': return <ContactPanel />;
      case 'keys': return <KeysPanel />;
    }
  };

  const focusTab = (id: WinId) => {
    const w = wins[id];
    if (w?.minimized || focusId !== id) focusWindow(id);
    else closeWindow(id);
  };

  return (
    <section className="desktop" aria-label="Screen's desktop">
      <header className="os-bar">
        <span className="os-brand">~/screen</span>
        <nav className="os-links" aria-label="Pages">
          <a href="/work">work</a>·<a href="/about">about</a>·<a href="/blog">blog</a>
        </nav>
      </header>

      <div className="os-stage" ref={stageRef}>
        <div className="desktop-dither" aria-hidden="true">
          <AuroraHero className="dither-fill" />
        </div>
        {stars.map((s, i) => (
          <span className="os-star" key={i} style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, opacity: s.opacity }} aria-hidden="true" />
        ))}

        <ul className="os-icons" aria-label="Windows">
          {ORDER.map((id) => (
            <li key={id}>
              <button
                type="button"
                className={`os-icon${wins[id] ? ' is-open' : ''}`}
                aria-haspopup="dialog"
                aria-expanded={!!wins[id]}
                onClick={() => (wins[id] ? focusWindow(id) : openWindow(id))}
              >
                <span className="os-tile">{ICONS[id]()}</span>
                <span className="os-label">{TITLES[id]}</span>
              </button>
            </li>
          ))}
          <li>
            <a className="os-icon" href="https://github.com/screen-gd" target="_blank" rel="noopener noreferrer">
              <span className="os-tile"><IconGithub /></span>
              <span className="os-label">github ↗</span>
            </a>
          </li>
        </ul>

        <AnimatePresence>
          {openOrder.filter((id) => wins[id]).map((id) => {
            const w = wins[id]!;
            return (
              <motion.div
                key={id}
                className={`os-win${w.minimized ? ' is-min' : ''}${w.maximized ? ' is-max' : ''}`}
                role="dialog"
                aria-label={`~/screen ${TITLES[id]}`}
                ref={(el) => { winRefs.current[id] = el; }}
                style={w.maximized ? { zIndex: w.z } : { left: w.x, top: w.y, zIndex: w.z }}
                onPointerDown={() => { if (focusId !== id) focusWindow(id); }}
                initial={reducedMotion ? false : { opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reducedMotion ? undefined : { opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.15 }}
              >
                <div
                  className="os-win-bar"
                  onPointerDown={(e) => barDown(e, id)}
                  onPointerMove={barMove}
                  onPointerUp={barUp}
                  onPointerCancel={barUp}
                >
                  <span className="os-win-tab"><b>{SHORTCUT[id]}</b> {TITLES[id]}</span>
                  <span className="os-win-path">~/screen</span>
                  <span className="os-win-btns">
                    <button type="button" aria-label="Minimise window" onClick={() => minimize(id)}>_</button>
                    <button type="button" aria-label="Maximise window" onClick={() => toggleMax(id)}>□</button>
                    <button type="button" aria-label="Close window" onClick={() => closeWindow(id)}>×</button>
                  </span>
                </div>
                <div className="os-win-body" data-lenis-prevent>
                  {panel(id)}
                </div>
                <span className="os-win-grip" aria-hidden="true" />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <footer className="os-taskbar">
        <span className="os-colon" aria-hidden="true">:</span>
        {openOrder.filter((id) => wins[id]).map((id) => (
          <button
            key={id}
            type="button"
            className={`os-tab${focusId === id && !wins[id]!.minimized ? ' is-active' : ''}`}
            onClick={() => focusTab(id)}
          >
            <b>{SHORTCUT[id]}</b> {TITLES[id]}
          </button>
        ))}
        <span className="os-clock" aria-label="Time in Dubai">{clock}</span>
        <button type="button" className="os-help" aria-label="Keyboard shortcuts" onClick={() => openWindow('keys')}>?</button>
      </footer>
    </section>
  );
}
