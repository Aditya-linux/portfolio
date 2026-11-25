import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { App } from '../../../App';
import { Logo } from '../../../components/panels/rows';
import { projectPath, projects } from '../../../projects';
import { siteUrl } from '../../../site';

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map(({ id }) => ({ id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const project = projects.find((entry) => entry.id === id);
  if (!project) return {};
  return {
    title: `${project.name} | Screen`,
    description: project.description,
    alternates: { canonical: projectPath(project) },
    openGraph: {
      title: `${project.name}, built by Screen`,
      description: project.description,
      url: projectPath(project),
      images: [project.media.image],
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { id } = await params;
  const project = projects.find((entry) => entry.id === id);
  if (!project) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: project.name,
    description: project.about.join(' '),
    applicationCategory: project.category,
    url: project.url,
    ...(project.source && { codeRepository: project.source }),
    image: [project.media.image, ...project.screens.map((screen) => screen.src)].map((src) => `${siteUrl}${src}`),
    author: { '@type': 'Person', name: 'Screen', url: siteUrl },
    mainEntityOfPage: `${siteUrl}${projectPath(project)}`,
  };

  return (
    <App view="project">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <article className="page-block project-page">
        <header className="project-header">
          <a className="back-link" href="/projects"><span aria-hidden="true">← </span>Projects</a>
          <h1 className="project-title"><Logo src={project.logo} />{project.name}</h1>
          <p className="project-lede">{project.description}</p>
          <p className="project-links">
            <a href={project.url} target="_blank" rel="noopener noreferrer">Visit site <span aria-hidden="true">↗</span></a>
            {project.source && <a href={project.source} target="_blank" rel="noopener noreferrer">Source on GitHub <span aria-hidden="true">↗</span></a>}
          </p>
        </header>
        <div className="post-cover project-cover" style={{ aspectRatio: project.media.aspectRatio }}>
          <Image src={project.media.image} alt={project.media.imageAlt} fill priority sizes="(max-width: 700px) 90vw, 640px" />
        </div>
        <div className="article-body">
          {project.about.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          <h2>What it does</h2>
          <ul>{project.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
          <h2>Screens</h2>
        </div>
        <div className="project-screens">
          {project.screens.map((screen) => (
            <figure key={screen.src}>
              <div className="project-screen">
                <Image src={screen.src} alt={screen.alt} fill sizes="(max-width: 700px) 90vw, 640px" />
              </div>
              <figcaption>{screen.alt}</figcaption>
            </figure>
          ))}
        </div>
        <nav className="project-more" aria-label="More projects">
          {projects.filter((entry) => entry.id !== project.id).map((entry) => (
            <Link key={entry.id} href={projectPath(entry)}><Logo src={entry.logo} />{entry.name}</Link>
          ))}
        </nav>
      </article>
    </App>
  );
}
