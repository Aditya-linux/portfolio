// Serves the static site and handles GitHub sign-in for the blog editor at /admin.
// Needs GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET from a GitHub OAuth app whose
// callback URL is https://<site>/oauth/callback.
//
// Also makes the site agent-readable: Markdown content negotiation, a JSON API
// under /api (data generated into out/api by scripts/build-agentic.mjs), JSON
// error responses, rate-limit headers and a minimal MCP endpoint at /mcp.

type Env = {
  ASSETS: { fetch(request: Request): Promise<Response> };
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
};

const stateCookie = 'oauth_state';

// The editor opens this page in a popup and waits for the token in Decap/Sveltia's message format.
function reply(status: 'success' | 'error', content: object) {
  const message = JSON.stringify(`authorization:github:${status}:${JSON.stringify(content)}`).replace(/</g, '\\u003c');
  const html = `<!doctype html><meta charset="utf-8"><title>Signing in…</title><script>
(() => {
  if (!window.opener) return document.write('Open this from the blog editor.');
  addEventListener('message', (event) => {
    if (event.origin !== location.origin) return;
    window.opener.postMessage(${message}, location.origin);
    setTimeout(() => window.close(), 100);
  });
  window.opener.postMessage('authorizing:github', location.origin);
})();
</script>`;
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Set-Cookie': `${stateCookie}=; Path=/oauth; Max-Age=0; HttpOnly; Secure; SameSite=Lax`,
    },
  });
}

function authorize(url: URL, env: Env) {
  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) return reply('error', { message: 'GitHub sign-in is not configured.' });
  const scope = url.searchParams.get('scope') ?? '';
  const state = crypto.randomUUID();
  const github = new URL('https://github.com/login/oauth/authorize');
  github.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
  github.searchParams.set('redirect_uri', `${url.origin}/oauth/callback`);
  github.searchParams.set('scope', /^[a-z_:,]+$/.test(scope) ? scope : 'repo,user');
  github.searchParams.set('state', state);
  return new Response(null, {
    status: 302,
    headers: {
      Location: github.toString(),
      'Set-Cookie': `${stateCookie}=${state}; Path=/oauth; Max-Age=600; HttpOnly; Secure; SameSite=Lax`,
    },
  });
}

async function callback(request: Request, url: URL, env: Env) {
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const expected = request.headers.get('Cookie')?.match(new RegExp(`(?:^|;\s*)${stateCookie}=([^;]+)`))?.[1];
  if (!code || !state || state !== expected) return reply('error', { message: 'Sign-in expired. Try again.' });

  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'User-Agent': 'portfolio-blog-editor' },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: `${url.origin}/oauth/callback`,
    }),
  });
  const result = await response.json().catch(() => ({})) as { access_token?: string; error_description?: string };
  if (!result.access_token) return reply('error', { message: result.error_description ?? 'GitHub did not return a token.' });
  return reply('success', { token: result.access_token, provider: 'github' });
}

/* Agent-facing layer */

const RATE_LIMIT = 60;
const RATE_WINDOW_MS = 60_000;
const buckets = new Map<string, { count: number; reset: number }>();

function rateLimits(request: Request) {
  const key = request.headers.get('cf-connecting-ip') ?? 'anonymous';
  const now = Date.now();
  let bucket = buckets.get(key);
  if (!bucket || bucket.reset <= now) {
    bucket = { count: 0, reset: now + RATE_WINDOW_MS };
    buckets.set(key, bucket);
  }
  bucket.count += 1;
  const remaining = Math.max(0, RATE_LIMIT - bucket.count);
  const resetSeconds = Math.ceil(bucket.reset / 1000);
  return {
    exceeded: bucket.count > RATE_LIMIT,
    retryAfter: Math.max(1, Math.ceil((bucket.reset - now) / 1000)),
    headers: {
      'RateLimit-Limit': String(RATE_LIMIT),
      'RateLimit-Remaining': String(remaining),
      'RateLimit-Reset': String(resetSeconds),
      'RateLimit-Policy': `${RATE_LIMIT};w=${RATE_WINDOW_MS / 1000}`,
    },
  };
}

function jsonResponse(body: unknown, init: ResponseInit = {}, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(body, null, 2) + '\n', {
    ...init,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=60', ...extra },
  });
}

function jsonError(status: number, code: string, message: string, hint: string, extra: Record<string, string> = {}) {
  return jsonResponse({ error: { code, message, hint } }, { status }, extra);
}

const accepts = (request: Request, type: string) =>
  (request.headers.get('accept') ?? '').toLowerCase().includes(type);

function wantsJson(request: Request) {
  const accept = request.headers.get('accept') ?? '';
  if (!accept || accept === '*/*') return false;
  return accepts(request, 'application/json') && !accepts(request, 'text/html');
}

async function api(request: Request, env: Env, url: URL): Promise<Response> {
  const limit = rateLimits(request);
  if (limit.exceeded) {
    return jsonError(429, 'rate_limited', 'Too many requests.', `Wait ${limit.retryAfter}s and retry. Rate limit: ${RATE_LIMIT} requests per minute.`, { ...limit.headers, 'Retry-After': String(limit.retryAfter) });
  }
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return jsonError(405, 'method_not_allowed', `${request.method} is not supported on this endpoint.`, 'Use GET. This API is read-only.', { ...limit.headers, Allow: 'GET, HEAD' });
  }

  const path = url.pathname.replace(/\/+$/, '') || '/';
  if (path === '/api') {
    if (wantsJson(request)) {
      const index = await env.ASSETS.fetch(new Request(`${url.origin}/api/index.json`));
      if (index.ok) return new Response(index.body, { headers: { 'Content-Type': 'application/json; charset=utf-8', ...limit.headers } });
    }
    // Browsers get the documentation page.
    const page = await env.ASSETS.fetch(request);
    const headers = new Headers(page.headers);
    headers.append('Vary', 'Accept');
    for (const [k, v] of Object.entries(limit.headers)) headers.set(k, v);
    return new Response(page.body, { status: page.status, headers });
  }

  const assetFile = path.endsWith('.json') ? path : `${path}.json`;
  const data = await env.ASSETS.fetch(new Request(`${url.origin}${assetFile}`));
  if (data.ok) {
    return new Response(data.body, { headers: { 'Content-Type': 'application/json; charset=utf-8', ...limit.headers } });
  }
  return jsonError(404, 'not_found', `No endpoint at ${path}.`, 'See /openapi.json or GET /api with Accept: application/json for the endpoint list.', limit.headers);
}

/* Minimal MCP server (Streamable HTTP, JSON-RPC 2.0, stateless). */

const MCP_TOOLS = [
  {
    name: 'get_profile',
    description: 'Profile of Screen: roles, projects, contact details.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    asset: '/api/profile.json',
  },
  {
    name: 'list_projects',
    description: 'List all portfolio projects with descriptions and links.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    asset: '/api/projects.json',
  },
  {
    name: 'get_project',
    description: 'Get one project by id (relay, col, emc2, phaino).',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string', description: 'Project id, e.g. "relay"' } },
      required: ['id'],
      additionalProperties: false,
    },
    asset: null,
  },
  {
    name: 'list_posts',
    description: 'List published blog posts with slug, title, summary and date.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    asset: '/api/posts.json',
  },
];

async function mcpResultAsset(env: Env, url: URL, path: string) {
  const res = await env.ASSETS.fetch(new Request(`${url.origin}${path}`));
  if (!res.ok) return null;
  return res.text();
}

async function mcp(request: Request, env: Env, url: URL): Promise<Response> {
  if (request.method === 'GET' || request.method === 'DELETE') {
    // Browsers get the human-readable MCP documentation page.
    if (request.method === 'GET' && accepts(request, 'text/html')) {
      const page = await env.ASSETS.fetch(new Request(`${url.origin}/developers/mcp`));
      const headers = new Headers(page.headers);
      headers.append('Vary', 'Accept');
      return new Response(page.body, { status: page.ok ? 200 : page.status, headers });
    }
    // No SSE stream support; the endpoint is request/response only.
    return jsonError(405, 'method_not_allowed', 'This MCP server does not open SSE streams.', 'POST JSON-RPC requests to /mcp.', { Allow: 'POST' });
  }
  if (request.method !== 'POST') return jsonError(405, 'method_not_allowed', 'Use POST for MCP.', 'POST a JSON-RPC 2.0 body.', { Allow: 'POST' });

  let payload: any;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } }, { status: 400 });
  }

  const calls = Array.isArray(payload) ? payload : [payload];
  const replies: any[] = [];

  for (const call of calls) {
    const { id, method, params } = call ?? {};
    if (typeof method !== 'string') {
      replies.push({ jsonrpc: '2.0', id: id ?? null, error: { code: -32600, message: 'Invalid Request' } });
      continue;
    }
    if (method.startsWith('notifications/')) continue;
    if (method === 'initialize') {
      replies.push({
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: params?.protocolVersion ?? '2025-06-18',
          capabilities: { tools: { listChanged: false } },
          serverInfo: { name: 'screeen.us.ci', version: '1.0.0' },
          instructions:
            'Read-only portfolio of Screen. Use the tools for profile, projects and blog posts. Docs: /api, spec: /openapi.json, guidance: /llms.txt.',
        },
      });
      continue;
    }
    if (method === 'ping') {
      replies.push({ jsonrpc: '2.0', id, result: {} });
      continue;
    }
    if (method === 'tools/list') {
      replies.push({
        jsonrpc: '2.0',
        id,
        result: { tools: MCP_TOOLS.map(({ asset: _asset, ...tool }) => tool) },
      });
      continue;
    }
    if (method === 'tools/call') {
      const tool = MCP_TOOLS.find((t) => t.name === params?.name);
      let path = tool?.asset ?? null;
      if (tool?.name === 'get_project') {
        const idArg = params?.arguments?.id;
        if (typeof idArg === 'string' && /^[a-z0-9-]+$/.test(idArg)) path = `/api/projects/${idArg}.json`;
      }
      const text = path ? await mcpResultAsset(env, url, path) : null;
      replies.push(
        text
          ? { jsonrpc: '2.0', id, result: { content: [{ type: 'text', text }] } }
          : {
              jsonrpc: '2.0',
              id,
              result: {
                content: [{ type: 'text', text: tool ? 'Not found.' : `Unknown tool: ${params?.name ?? ''}` }],
                isError: true,
              },
            },
      );
      continue;
    }
    replies.push({ jsonrpc: '2.0', id, error: { code: -32601, message: `Method not found: ${method}` } });
  }

  if (replies.length === 0) return new Response(null, { status: 202 });
  return jsonResponse(Array.isArray(payload) ? replies : replies[0], { status: 200 });
}

/* Content negotiation + routing */

const hasExtension = (path: string) => /\.[a-z0-9]+$/i.test(path);

async function markdown(request: Request, env: Env, url: URL): Promise<Response | null> {
  if (request.method !== 'GET' || !accepts(request, 'text/markdown')) return null;
  const path = url.pathname === '/' ? '/index' : url.pathname.replace(/\/+$/, '');
  const res = await env.ASSETS.fetch(new Request(`${url.origin}/md${path}.md`));
  if (!res.ok) return null;
  const headers = new Headers(res.headers);
  headers.set('Content-Type', 'text/markdown; charset=utf-8');
  headers.append('Vary', 'Accept');
  return new Response(res.body, { status: 200, headers });
}

async function page(request: Request, env: Env, url: URL): Promise<Response> {
  let res = await env.ASSETS.fetch(request);
  // The export writes RSC payloads nested (__next.<route>/<param>/__PAGE__.txt)
  // while the client requests them flat (__next.<route>.<param>.__PAGE__.txt);
  // remap on a miss.
  if (!res.ok && hasExtension(url.pathname)) {
    const fixed = url.pathname.replace(
      /__next\.([^.]+)((?:\.[^/.]+)+)\.txt$/,
      (_match, route: string, rest: string) => `__next.${route}${rest.replaceAll('.', '/')}.txt`,
    );
    if (fixed !== url.pathname) {
      res = await env.ASSETS.fetch(new Request(`${url.origin}${fixed}${url.search}`, request));
    }
  }
  // _headers isn't applied to worker responses, so mark hashed build files immutable here.
  if (res.ok && url.pathname.startsWith('/_next/static/')) {
    const headers = new Headers(res.headers);
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    return new Response(res.body, { status: res.status, headers });
  }
  if (hasExtension(url.pathname) || !res.ok) return res;
  const headers = new Headers(res.headers);
  if ((headers.get('content-type') ?? '').includes('text/html')) headers.append('Vary', 'Accept');
  return new Response(res.body, { status: res.status, headers });
}

function markdownNotFound(url: URL) {
  const path = url.pathname.replace(/`/g, '\\`');
  return `# 404: page not found

There is no page at \`${path}\` on screeen.us.ci.

- [Home](https://screeen.us.ci/)
- [llms.txt](https://screeen.us.ci/llms.txt): guide to this site for agents
- [Sitemap](https://screeen.us.ci/sitemap.xml)
- [Developer docs](https://screeen.us.ci/developers)
`;
}

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (path === '/oauth/auth') return authorize(url, env);
    if (path === '/oauth/callback') return callback(request, url, env);
    if (path === '/mcp' || path === '/mcp/') return mcp(request, env, url);
    // File paths under /api (Next payload files like __next._tree.txt) are
    // static assets, not API calls.
    if (path === '/api' || (path.startsWith('/api/') && !hasExtension(path))) {
      if (path === '/api' || path === '/api/') {
        const md = await markdown(request, env, url);
        if (md) return md;
      }
      return api(request, env, url);
    }
    const md = await markdown(request, env, url);
    if (md) return md;
    const res = await page(request, env, url);
    if (
      res.status === 404
      && (request.method === 'GET' || request.method === 'HEAD')
      && accepts(request, 'text/markdown')
    ) {
      return new Response(markdownNotFound(url), {
        status: 404,
        headers: { 'Content-Type': 'text/markdown; charset=utf-8', Vary: 'Accept' },
      });
    }
    return res;
  },
};
