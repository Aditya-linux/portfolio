import type { Metadata } from 'next';
import { App } from '../../../App';
import { PanelLabel } from '../../../components/panels/rows';

export const metadata: Metadata = {
  title: 'Screen MCP server: portfolio tools for AI agents',
  description:
    'The screeen.us.ci MCP server: endpoint, transport, tools and setup for Claude Code and other MCP clients.',
  alternates: { canonical: '/developers/mcp' },
};

export default function Mcp() {
  return (
    <App view="developers">
      <h1 className="page-h1">Screen MCP server</h1>

      <PanelLabel>Endpoint</PanelLabel>
      <p className="panel-copy">
        <code>https://screeen.us.ci/mcp</code>
      </p>

      <PanelLabel>Transport</PanelLabel>
      <p className="panel-copy">
        Streamable HTTP. POST JSON-RPC 2.0 requests to the endpoint. The server is stateless, opens
        no SSE stream and needs no authentication.
      </p>

      <PanelLabel>Tools</PanelLabel>
      <p className="panel-copy">
        <code>get_profile</code>: Profile of Screen: roles, projects, contact details.
        <br />
        <code>list_projects</code>: List all portfolio projects with descriptions and links.
        <br />
        <code>get_project</code>: Get one project by id (relay, col, emc2, phaino). Argument:{' '}
        <code>id</code>.
        <br />
        <code>list_posts</code>: List published blog posts with slug, title, summary and date.
      </p>

      <PanelLabel>Setup</PanelLabel>
      <p className="panel-copy">
        Claude Code:{' '}
        <code>claude mcp add --transport http screen https://screeen.us.ci/mcp</code>
        <br />
        Generic MCP config:{' '}
        <code>{'{"mcpServers":{"screen":{"type":"http","url":"https://screeen.us.ci/mcp"}}}'}</code>
      </p>

      <PanelLabel>Example</PanelLabel>
      <p className="panel-copy">
        <code>
          curl -X POST https://screeen.us.ci/mcp -H &quot;Content-Type: application/json&quot; -d
          &apos;{'{"jsonrpc":"2.0","id":1,"method":"tools/list"}'}&apos;
        </code>
      </p>
    </App>
  );
}
