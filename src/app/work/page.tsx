import type { Metadata } from 'next';
import { App } from '../../App';
import { WorkPanel } from '../../components/panels/work-panel';

export const metadata: Metadata = {
  title: 'Experience | Aditya Nishad',
  description:
    'Aditya Nishad’s experience: Stellar Brand Ambassador (hosted an IRL hackathon in Mumbai) and RUMI Care.',
  alternates: { canonical: '/work' },
};

export default function Work() {
  return (
    <App view="work">
      <h1 className="page-h1">Experience</h1>
      <WorkPanel label="" allHref={false} />
    </App>
  );
}
