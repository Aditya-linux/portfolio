import type { Metadata } from 'next';
import Link from 'next/link';
import { App } from '../../App';
import { PanelLabel } from '../../components/panels/rows';

export const metadata: Metadata = {
  title: 'API documentation | Aditya Nishad',
  description:
    'Public JSON API for adityanishad.space: profile, projects and blog posts as structured data.',
  alternates: { canonical: '/api' },
};

export default function ApiDocs() {
  return (
    <App view="api">
      <h1 className="page-h1">API</h1>
      <p className="panel-copy">
        New here? The <Link href="/developers">developer portal</Link> has the quickstart.
      </p>
      <p className="panel-copy">
        adityanishad.space exposes the same content you see on these pages as JSON, so agents and
        scripts can read it without scraping HTML. Everything is read-only and needs no API key.
        Send <code>Accept: application/json</code> to <code>/api</code> for the JSON index, or{' '}
        <code>Accept: text/markdown</code> on any page for Markdown.
      </p>

      <PanelLabel>Endpoints</PanelLabel>
      <p className="panel-copy">
        <code>GET /api/profile</code>: who Aditya is. Roles, projects, contact and links.
        <br />
        <code>GET /api/projects</code>: every shipped project with description and links.
        <br />
        <code>GET /api/projects/&#123;id&#125;</code>: one project by id, for example{' '}
        <a href="/api/projects/recurra"><code>/api/projects/recurra</code></a>.
        <br />
        <code>GET /api/posts</code>: published blog posts with slug, title, summary and date.
      </p>

      <PanelLabel>Spec</PanelLabel>
      <p className="panel-copy">
        OpenAPI lives at <a href="/openapi.json"><code>/openapi.json</code></a>.
      </p>
    </App>
  );
}
