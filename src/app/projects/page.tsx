import type { Metadata } from 'next';
import { App } from '../../App';
import { WebDevPanel } from '../../components/panels/webdev-panel';

export const metadata: Metadata = {
  title: 'Projects | Aditya Nishad',
  description: 'Products Aditya Nishad has built: TapPay, Rekura, Nebula, ArthVeda AI and Blind Vault.',
  alternates: { canonical: '/projects' },
};

export default function Projects() {
  return (
    <App view="projects">
      <h1 className="page-h1">Projects</h1>
      <WebDevPanel label="" showImages />
    </App>
  );
}
