import type { Metadata } from 'next';
import { App } from '../../App';

export const metadata: Metadata = {
  title: 'Privacy | Aditya Nishad',
  description: 'What adityanishad.space collects, which is almost nothing, and who to contact about your data.',
  alternates: { canonical: '/privacy' },
};

export default function Privacy() {
  return (
    <App view="privacy">
      <h1 className="page-h1">Privacy</h1>
      <p className="panel-copy">
        This site collects no personal data from visitors. There is no advertising pixel and no
        cookie banner for browsing. Pages are static files hosted on Vercel.
      </p>
      <p className="panel-copy">
        Vercel, which hosts the site, may keep standard edge logs (IP address, requested path,
        user agent) for security and reliability under its own privacy policy. Those logs are not
        used here to profile or follow you.
      </p>
      <p className="panel-copy">
        The JSON API at /api serves the same public content you can read on these pages.
      </p>
      <p className="panel-copy">
        Questions about this policy go to adityanishad0402@gmail.com or a DM on X (@AdityaNishad987).
      </p>
    </App>
  );
}
