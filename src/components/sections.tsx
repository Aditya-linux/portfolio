'use client';

import { useRef, type ReactNode, type RefObject } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'motion/react';
import { projects, type Project } from '../projects';
import { Reveal } from './Reveal';
import { SplitReveal } from './SplitReveal';
import { EditingCarousel } from './editing-showcase';
import { ProjectPlaceholder } from './dithercn/project-placeholder';

export const HOME_SECTIONS = [
  { id: 'gitcafe', number: '01', title: 'GitCafe' },
  { id: 'web-development', number: '02', title: 'Web development' },
  { id: 'video-editing', number: '03', title: 'Video editing' },
  { id: 'zns', number: '04', title: 'ZNS Nexus & ZNS Studios' },
] as const;

function SectionShell({ id, number, title, meta, copy, children }: {
  id: string;
  number: string;
  title: string;
  meta?: string;
  copy?: string;
  children?: ReactNode;
}) {
  return (
    <section className="home-section" id={id} aria-labelledby={`${id}-title`}>
      <Reveal><span className="sec-num" aria-hidden="true">{number}</span></Reveal>
      <SplitReveal className="sec-title" text={title} delay={0.05} id={`${id}-title`} />
      {meta && <Reveal delay={0.2}><p className="section-meta">{meta}</p></Reveal>}
      {copy && <Reveal delay={0.3}><p className="section-copy">{copy}</p></Reveal>}
      {children}
    </section>
  );
}

export function GitCafeSection() {
  return (
    <SectionShell
      id="gitcafe"
      number="01"
      title="GitCafe"
      meta="Intern · YC S26 · Oct 2026 to now"
      copy="I’m building GitCafe’s Windows app, a native shell around the web app with WebView2, and helping with small UI and UX fixes and bugs."
    >
      <Reveal delay={0.4} className="fact-wrap">
        <div className="fact-row" role="list">
          <span role="listitem">Windows app</span>
          <span role="listitem">WebView2</span>
          <span role="listitem">Web app UI and fixes</span>
        </div>
        <a className="section-link" href="https://git.cafe" target="_blank" rel="noopener noreferrer">git.cafe <span aria-hidden="true">↗</span></a>
      </Reveal>
    </SectionShell>
  );
}

function StackPanel({ project, next, self }: { project: Project; next?: RefObject<HTMLElement | null>; self: RefObject<HTMLElement | null> }) {
  const { scrollYProgress } = useScroll({ target: next ?? self, offset: ['start end', 'start 0.14'] });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);
  const dim = useTransform(scrollYProgress, [0, 1], [0, 0.55]);

  return (
    <motion.article className="stack-panel" ref={self} style={{ scale: next ? scale : 1 }}>
      {next && <motion.div className="stack-dim" style={{ opacity: dim }} aria-hidden="true" />}
      <h3>{project.name}</h3>
      <p>{project.description}</p>
      {project.media ? (
        <div className="project-visual" style={{ aspectRatio: project.media.aspectRatio }}>
          {project.media.video ? (
            <video src={project.media.video} poster={project.media.image} controls playsInline preload="none" aria-label={project.media.imageAlt} />
          ) : (
            <Image src={project.media.image} alt={project.media.imageAlt} fill sizes="(max-width: 800px) 90vw, 980px" />
          )}
        </div>
      ) : (
        <div className="project-visual"><ProjectPlaceholder label={project.name} /></div>
      )}
    </motion.article>
  );
}

export function WebDevelopmentSection() {
  const first = useRef<HTMLElement>(null);
  const second = useRef<HTMLElement>(null);
  const third = useRef<HTMLElement>(null);
  const refs = [first, second, third];

  return (
    <SectionShell
      id="web-development"
      number="02"
      title="Web development"
      meta="Products I’ve built with AI coding agents."
    >
      <div className="stack">
        {projects.map((project, index) => (
          <StackPanel project={project} key={project.id} self={refs[index]} next={refs[index + 1]} />
        ))}
      </div>
    </SectionShell>
  );
}

export function VideoEditingSection() {
  const media = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: media, offset: ['start 0.95', 'start 0.45'] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.92, 1]);

  return (
    <SectionShell
      id="video-editing"
      number="03"
      title="Video editing"
      meta="Work Smart Tutorials · 2024 to now"
      copy="100+ reels and 1M+ cumulative views for an education brand."
    >
      <motion.div ref={media} className="section-wide" style={{ scale }}>
        <EditingCarousel />
      </motion.div>
    </SectionShell>
  );
}

export function ZnsSection() {
  return (
    <SectionShell
      id="zns"
      number="04"
      title="ZNS Nexus & ZNS Studios"
      copy="I co-founded ZNS Nexus, an agency, and ZNS Studios, a game studio."
    >
      <Reveal delay={0.4}>
        <div className="zns-links">
          <a className="zns-link" href="https://znsnexus.com" target="_blank" rel="noopener noreferrer">znsnexus.com <span aria-hidden="true">↗</span></a>
          <a className="zns-link" href="https://znsstudios.com" target="_blank" rel="noopener noreferrer">znsstudios.com <span aria-hidden="true">↗</span></a>
        </div>
      </Reveal>
    </SectionShell>
  );
}
