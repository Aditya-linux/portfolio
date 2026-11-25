import type { Metadata } from 'next';
import { App } from '../../App';
import { VideosPanel } from '../../components/panels/videos-panel';

export const metadata: Metadata = {
  title: 'Videos | Screen',
  description: 'Short-form videos Screen edited for Work Smart Tutorials.',
  alternates: { canonical: '/videos' },
};

export default function Videos() {
  return (
    <App view="videos">
      <h1 className="page-h1">Videos</h1>
      <VideosPanel label="" />
    </App>
  );
}
