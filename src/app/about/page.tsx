import type { Metadata } from 'next';
import { App } from '../../App';
import { Logo, PanelLabel, Row } from '../../components/panels/rows';
import { projectPath, projects } from '../../projects';

export const metadata: Metadata = {
  title: 'About | Aditya Nishad',
  description:
    'Aditya Nishad is an AI and Web3 product builder based in New Delhi, India. Stellar Brand Ambassador and open-source contributor.',
  alternates: { canonical: '/about' },
};

export default function About() {
  return (
    <App view="about">
      <h1 className="page-h1">About</h1>
      <p className="panel-copy">I’m Aditya Nishad, an AI and Web3 product builder based in New Delhi, India.</p>
      <p className="panel-copy">
        I design and build fintech, automation and blockchain products end to end. What I’ve shipped so far:
      </p>
      <ul className="point-list">
        {projects.map((project) => (
          <li key={project.id}>
            <Logo src={project.logo} />
            <a href={projectPath(project)}>{project.name}</a>: {project.description}
          </li>
        ))}
      </ul>
      <p className="panel-copy">
        I’m a Stellar Brand Ambassador and open-source contributor, with ₹20K+ in ecosystem rewards.
        As Brand Ambassador I also hosted an IRL hackathon in Mumbai.
        I studied Computer Science and Engineering at Mumbai University (CGPA 8.70).
      </p>
      <p className="panel-copy">
        The fastest way to reach me is email at adityanishad0402@gmail.com, or a DM on X.
      </p>
      <p className="panel-copy"><a href="/cv.pdf">View my CV (PDF)</a></p>
      <PanelLabel>Elsewhere</PanelLabel>
      <div className="prow-list">
        <Row href="https://github.com/Aditya-linux" logo={<Logo src="/logos/github.svg" glyph />} name="GitHub" meta="Aditya-linux" />
        <Row href="https://x.com/AdityaNishad987" logo={<Logo src="/logos/x.svg" glyph />} name="X" meta="@AdityaNishad987" />
        <Row href="https://medium.com/@adityanishad0402" logo={<Logo src="/logos/github.svg" glyph />} name="Medium" meta="@adityanishad0402" />
      </div>
    </App>
  );
}
