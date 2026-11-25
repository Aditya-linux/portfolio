import Image from 'next/image';
import Link from 'next/link';
import { projectPath, projects } from '@/projects';
import { Logo, PanelLabel, Row } from './rows';

// Each project links to its own page on this site. `showImages` renders a two-column
// grid of cards (image, then logo, name and description); otherwise plain rows.
export function WebDevPanel({ label = 'Projects', showImages = false }: { label?: string; showImages?: boolean }) {
  return (
    <>
      {label && <PanelLabel>{label}</PanelLabel>}
      {showImages ? (
        <div className="project-grid">
          {projects.map((project) => (
            <Link className="project-card" id={project.id} key={project.id} href={projectPath(project)}>
              <span className="project-visual" style={{ aspectRatio: project.media.aspectRatio }}>
                <Image src={project.media.image} alt={project.media.imageAlt} fill sizes="(max-width: 700px) 90vw, 430px" />
              </span>
              <span className="project-info">
                <Logo src={project.logo} />
                <span className="prow-name">{project.name}</span>
              </span>
              <span className="project-desc">{project.description}</span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="prow-list">
          {projects.map((project) => (
            <Row key={project.id} href={projectPath(project)} logo={<Logo src={project.logo} />} name={project.name} meta={project.description} />
          ))}
        </div>
      )}
    </>
  );
}
