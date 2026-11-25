import assert from 'node:assert/strict';
import test from 'node:test';
import worker from '../worker/index.ts';

// A fake static-assets binding that serves a tiny in-memory site and 404s on
// everything else, so the worker's routing can be tested without wrangler.
const files = {
  '/developers/mcp': '<!doctype html><html><body><h1>Screen MCP server</h1></body></html>',
  '/md/index.md': '# Screen\n\nPortfolio.\n',
  '/api/index.json': '{"name":"screeen.us.ci"}',
  '/api/projects/relay.json': '{"id":"relay","name":"Relay"}',
};
const env = {
  ASSETS: {
    fetch: async (request) => {
      const body = files[new URL(request.url).pathname];
      return body === undefined
        ? new Response('<!doctype html><h1>404</h1>', { status: 404, headers: { 'Content-Type': 'text/html' } })
        : new Response(body, { status: 200, headers: { 'Content-Type': 'text/plain' } });
    },
  },
};

const get = (path, headers = {}) => worker.fetch(new Request(`https://screeen.us.ci${path}`, { headers }), env);

test('a missing page answers Accept: text/markdown with a Markdown 404', async () => {
  const res = await get('/does-not-exist', { Accept: 'text/markdown' });
  assert.equal(res.status, 404);
  assert.match(res.headers.get('content-type') ?? '', /text\/markdown/);
  const body = await res.text();
  assert.ok(body.length > 20);
  assert.match(body, /\/llms\.txt/);
  assert.match(body, /\/does-not-exist/);
});

test('a missing page without the markdown Accept passes through the HTML 404', async () => {
  const res = await get('/does-not-exist');
  assert.equal(res.status, 404);
  assert.match(await res.text(), /<h1>404<\/h1>/);
});

test('GET / with Accept: text/markdown still returns the Markdown mirror', async () => {
  const res = await get('/', { Accept: 'text/markdown' });
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type') ?? '', /text\/markdown/);
  assert.match(await res.text(), /# Screen/);
});

test('GET /mcp with Accept: text/html serves the MCP docs page', async () => {
  const res = await get('/mcp', { Accept: 'text/html' });
  assert.equal(res.status, 200);
  assert.match(await res.text(), /Screen MCP server/);
});

test('GET /mcp with a JSON Accept keeps the 405', async () => {
  const res = await get('/mcp', { Accept: 'application/json' });
  assert.equal(res.status, 405);
  assert.match(res.headers.get('content-type') ?? '', /application\/json/);
});

test('POST /mcp tools/list lists get_profile', async () => {
  const res = await worker.fetch(new Request('https://screeen.us.ci/mcp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' }),
  }), env);
  assert.equal(res.status, 200);
  const reply = await res.json();
  assert.ok(reply.result.tools.some((tool) => tool.name === 'get_profile'));
});

test('GET /api/projects/relay returns the JSON record', async () => {
  const res = await get('/api/projects/relay', { Accept: 'application/json' });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.id, 'relay');
});
