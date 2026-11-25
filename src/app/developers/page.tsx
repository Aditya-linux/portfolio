import type { Metadata } from 'next';
import Link from 'next/link';
import { App } from '../../App';
import { PanelLabel } from '../../components/panels/rows';

export const metadata: Metadata = {
  title: 'API & developer portal | Aditya Nishad',
  description:
    'Everything agents and developers need to read adityanishad.space programmatically: JSON API, OpenAPI spec and Markdown pages.',
  alternates: { canonical: '/developers' },
};

export default function Developers() {
  return (
    <App view="developers">
      <h1 className="page-h1">Developers</h1>

      <PanelLabel>Quickstart</PanelLabel>
      <p className="panel-copy">
        <code>curl https://www.adityanishad.space/api/profile</code>
        <br />
        <code>curl https://www.adityanishad.space/api/projects/recurra</code>
        <br />
        <code>curl -H &quot;Accept: application/json&quot; https://www.adityanishad.space/api</code>
        <br />
        <code>curl -H &quot;Accept: text/markdown&quot; https://www.adityanishad.space/about</code>: every page
        answers with Markdown.
      </p>

      <PanelLabel>API reference</PanelLabel>
      <p className="panel-copy">
        The <Link href="/api">API documentation</Link> lists every endpoint. The machine-readable
        spec is at <a href="/openapi.json"><code>/openapi.json</code></a>.
      </p>

      <PanelLabel>API keys</PanelLabel>
      <p className="panel-copy">No keys needed. Everything is public and read-only.</p>

      <PanelLabel>Machine-readable files</PanelLabel>
      <p className="panel-copy">
        <a href="/llms.txt"><code>/llms.txt</code></a>,{' '}
        <a href="/openapi.json"><code>/openapi.json</code></a>,{' '}
        <a href="/sitemap.xml"><code>/sitemap.xml</code></a> and{' '}
        <a href="/.well-known/agent.json"><code>/.well-known/agent.json</code></a>.
      </p>

      <PanelLabel>Source</PanelLabel>
      <p className="panel-copy">
        Site source lives at{' '}
        <a href="https://github.com/Aditya-linux/portfolio" target="_blank" rel="noopener noreferrer">
          github.com/Aditya-linux/portfolio
        </a>
        .
      </p>
    </App>
  );
}
