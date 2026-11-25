import Link from 'next/link';
import type { ReactNode } from 'react';
import { IconBlog, IconContact, IconMe, IconWebDev, IconWork } from './desktop-icons';

export type View = 'home' | 'about' | 'work' | 'projects' | 'project' | 'videos' | 'blog' | 'post' | 'contact' | 'privacy' | 'api' | 'developers' | 'not-found';

const ITEMS: { href: string; label: string; icon: ReactNode; view?: View; external?: boolean }[] = [
  { href: '/about', label: 'About', icon: <IconMe />, view: 'about' },
  { href: '/work', label: 'Work', icon: <IconWork />, view: 'work' },
  { href: '/projects', label: 'Projects', icon: <IconWebDev />, view: 'projects' },
  { href: '/blog', label: 'Blog', icon: <IconBlog />, view: 'blog' },
  { href: '/contact', label: 'Contact', icon: <IconContact />, view: 'contact' },
];

// Centred row of pixel icons with titles. Every section page links from here,
// and the current page is marked with aria-current.
export function SiteNav({ view }: { view: View }) {
  return (
    <nav className="icon-nav" aria-label="Sections">
      <ul>
        {ITEMS.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={item.view === view || (view === 'post' && item.view === 'blog') ? 'page' : undefined}
              {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              <span className="icon-nav-glyph">{item.icon}</span>
              <span>{item.label}</span>
              {item.external && <span className="icon-nav-ext" aria-hidden="true">↗</span>}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
