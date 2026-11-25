// Generates the agent-readable layer after `next build`:
//   out/md/**.md            Markdown mirror of every exported page (served on Accept: text/markdown)
//   out/api/*.json          JSON API payloads the worker serves under /api
//   out/openapi.json        OpenAPI spec for that API (also copied to out/api/openapi.json)
//   out/og.png              Open Graph image (dithered aurora + pixel text)
//
// Data is imported from src/*.ts with Node's native type stripping (Node 22.18+/23+).

import { mkdir, readdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { deflateSync } from 'node:zlib';

const OUT = 'out';
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://screeen.us.ci').replace(/\/+$/, '');
const siteHost = new URL(siteUrl).host;

/* ---------- HTML -> Markdown ---------- */

const entities = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&#x27;': "'", '&nbsp;': ' ', '&hellip;': '…' };
const decode = (s) => s.replace(/&[a-z#0-9]+;/gi, (m) => entities[m.toLowerCase()] ?? m);

function inline(html) {
  let s = html;
  s = s.replace(/<(script|style|svg|canvas|noscript)[\s\S]*?<\/\1>/gi, '');
  s = s.replace(/<img[^>]*alt="([^"]*)"[^>]*>/gi, ' $1 ');
  s = s.replace(/<img[^>]*>/gi, ' ');
  s = s.replace(/<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, text) => {
    const label = inline(text).trim();
    if (!label) return '';
    const url = href.startsWith('/') ? `${siteUrl}${href}` : href;
    return `[${label}](${url})`;
  });
  s = s.replace(/<(strong|b)>([\s\S]*?)<\/\1>/gi, '**$2**');
  s = s.replace(/<(em|i)>([\s\S]*?)<\/\1>/gi, '*$2*');
  s = s.replace(/<code>([\s\S]*?)<\/code>/gi, '`$1`');
  s = s.replace(/<br\s*\/?>/gi, ' ');
  s = s.replace(/<[^>]+>/g, '');
  return decode(s).replace(/\s+/g, ' ');
}

function htmlToMarkdown(html) {
  let s = html.match(/<main[\s\S]*?<\/main>/i)?.[0] ?? html;
  s = s.replace(/<(script|style|svg|canvas|noscript|footer|nav)[\s\S]*?<\/\1>/gi, '');
  s = s.replace(/<(\w+)[^>]*aria-hidden="true"[^>]*>[\s\S]*?<\/\1>/gi, '');
  s = s.replace(/<!--[\s\S]*?-->/g, '');
  s = s.replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (_, n, c) => `\n\n${'#'.repeat(Number(n))} ${inline(c)}\n\n`);
  s = s.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, c) => `\n- ${inline(c).trim()}`);
  s = s.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, c) => `\n\n> ${inline(c).trim()}\n\n`);
  s = s.replace(/<hr[^>]*>/gi, '\n\n---\n\n');
  s = s.replace(/<(p|section|article|div|ul|ol|h[1-6]|figure|figcaption|header|main)[^>]*>/gi, '\n\n');
  s = s.replace(/<\/(p|section|article|div|ul|ol|h[1-6]|figure|figcaption|header|main)>/gi, '\n\n');
  s = s.replace(/<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href, text) => {
    const label = inline(text).trim();
    if (!label) return '';
    const url = href.startsWith('/') ? `${siteUrl}${href}` : href;
    return `[${label}](${url})`;
  });
  s = s.replace(/<img[^>]*alt="([^"]*)"[^>]*src="([^"]*)"[^>]*>/gi, (_, alt, src) => `![${alt}](${src.startsWith('/') ? siteUrl + src : src})`);
  s = s.replace(/<[^>]+>/g, '');
  s = decode(s);
  return s.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

async function* htmlFiles(dir, prefix = '') {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      if (entry.name === 'admin' || entry.name === 'md') continue;
      yield* htmlFiles(path.join(dir, entry.name), rel);
    } else if (entry.name.endsWith('.html')) {
      yield rel;
    }
  }
}

async function buildMarkdown() {
  let count = 0;
  for await (const file of htmlFiles(OUT)) {
    const route = file.replace(/\/index\.html$/, '').replace(/\.html$/, '');
    if (route === '404' || route.startsWith('admin')) continue;
    const html = await readFile(path.join(OUT, file), 'utf8');
    const markdown = htmlToMarkdown(html);
    if (markdown.length < 40) continue;
    const target = path.join(OUT, 'md', `${route}.md`);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, markdown + '\n');
    count += 1;
  }
  console.log(`md: wrote ${count} markdown mirrors`);
}

/* ---------- JSON API payloads ---------- */

async function buildApi() {
  let projects, profile, apiEndpoints, getBlogPosts;
  try {
    ({ projects } = await import('../src/projects.ts'));
    ({ profile, apiEndpoints } = await import('../src/agent.ts'));
    ({ getBlogPosts } = await import('../src/blog.ts'));
  } catch (error) {
    throw new Error(`build-agentic needs Node >= 22.18 for TypeScript imports: ${error.message}`);
  }

  const apiDir = path.join(OUT, 'api');
  await mkdir(path.join(apiDir, 'projects'), { recursive: true });

  const clean = (project) => ({
    id: project.id,
    name: project.name,
    category: project.category,
    description: project.description,
    url: project.url,
    ...(project.source && { source: project.source }),
    page: `${siteUrl}/projects/${project.id}`,
    about: [...project.about],
    features: [...project.features],
  });

  await writeFile(path.join(apiDir, 'profile.json'), JSON.stringify(profile, null, 2) + '\n');
  await writeFile(path.join(apiDir, 'projects.json'), JSON.stringify(projects.map(clean), null, 2) + '\n');
  for (const project of projects) {
    await writeFile(path.join(apiDir, 'projects', `${project.id}.json`), JSON.stringify(clean(project), null, 2) + '\n');
  }

  const posts = (await getBlogPosts()).map((post) => ({
    slug: post.slug,
    title: post.title,
    summary: post.summary,
    url: `${siteUrl}/blog/${post.slug}`,
    ...(post.date && { date: post.date }),
    ...(post.category && { category: post.category }),
  }));
  await writeFile(path.join(apiDir, 'posts.json'), JSON.stringify(posts, null, 2) + '\n');

  const index = {
    name: `${siteHost} API`,
    description: 'Read-only JSON API for Screen: profile, projects and blog posts.',
    documentation: `${siteUrl}/api`,
    openapi: `${siteUrl}/openapi.json`,
    llms: `${siteUrl}/llms.txt`,
    mcp: `${siteUrl}/mcp`,
    rateLimit: { limit: 60, windowSeconds: 60, headers: ['RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset', 'Retry-After'] },
    endpoints: apiEndpoints.map((e) => ({ method: 'GET', path: `${siteUrl}${e.path}`, operationId: e.operationId, summary: e.summary, description: e.description })),
  };
  await writeFile(path.join(apiDir, 'index.json'), JSON.stringify(index, null, 2) + '\n');

  const openapi = buildOpenApi();
  await writeFile(path.join(OUT, 'openapi.json'), JSON.stringify(openapi, null, 2) + '\n');
  await copyFile(path.join(OUT, 'openapi.json'), path.join(apiDir, 'openapi.json'));
  console.log(`api: wrote profile, ${projects.length} projects, ${posts.length} posts and openapi.json`);
}

const errorSchema = {
  type: 'object',
  required: ['error'],
  properties: {
    error: {
      type: 'object',
      required: ['code', 'message', 'hint'],
      properties: {
        code: { type: 'string', description: 'Machine-readable error code' },
        message: { type: 'string', description: 'What went wrong' },
        hint: { type: 'string', description: 'How to resolve the error' },
      },
    },
  },
};

const jsonContent = (schema) => ({ 'application/json': { schema } });
const errorResponses = {
  404: { description: 'Not found', content: jsonContent(errorSchema) },
  429: { description: 'Rate limited. See Retry-After and RateLimit-* headers.', content: jsonContent(errorSchema) },
};

function buildOpenApi() {
  return {
    openapi: '3.1.0',
    info: {
      title: `${siteHost} API`,
      version: '1.0.0',
      description:
        'Read-only API for Screen, product developer and video editor: profile, portfolio projects and blog posts. No authentication. Rate limit: 60 requests/minute, reported in RateLimit-* headers.',
      contact: { name: 'Screen', url: `${siteUrl}/contact`, email: 'contact@screeen.us.ci' },
      license: { name: 'CC0', url: 'https://creativecommons.org/publicdomain/zero/1.0/' },
    },
    servers: [{ url: siteUrl }],
    paths: {
      '/api/profile': {
        get: {
          operationId: 'getProfile',
          summary: 'Profile of Screen',
          description: 'Identity, roles, projects, availability and contact details for the site owner.',
          responses: { 200: { description: 'The profile record', content: jsonContent({ type: 'object' }) }, ...errorResponses },
        },
      },
      '/api/projects': {
        get: {
          operationId: 'listProjects',
          summary: 'List portfolio projects',
          description: 'Every shipped project with name, category, description, links and feature list.',
          responses: {
            200: {
              description: 'Array of projects',
              content: jsonContent({
                type: 'array',
                items: {
                  type: 'object',
                  required: ['id', 'name', 'category', 'description', 'url'],
                  properties: {
                    id: { type: 'string' }, name: { type: 'string' }, category: { type: 'string' },
                    description: { type: 'string' }, url: { type: 'string', format: 'uri' },
                    source: { type: 'string', format: 'uri' }, page: { type: 'string', format: 'uri' },
                    about: { type: 'array', items: { type: 'string' } },
                    features: { type: 'array', items: { type: 'string' } },
                  },
                },
              }),
            },
            ...errorResponses,
          },
        },
      },
      '/api/projects/{id}': {
        get: {
          operationId: 'getProject',
          summary: 'Get one project',
          description: 'Full detail for a single project by id.',
          parameters: [{ name: 'id', in: 'path', required: true, description: 'Project id: relay, col, emc2 or phaino', schema: { type: 'string' } }],
          responses: { 200: { description: 'The project record', content: jsonContent({ type: 'object' }) }, ...errorResponses },
        },
      },
      '/api/posts': {
        get: {
          operationId: 'listPosts',
          summary: 'List blog posts',
          description: 'Published blog posts with slug, title, summary, url and date.',
          responses: {
            200: {
              description: 'Array of posts',
              content: jsonContent({
                type: 'array',
                items: {
                  type: 'object',
                  required: ['slug', 'title', 'summary', 'url'],
                  properties: {
                    slug: { type: 'string' }, title: { type: 'string' }, summary: { type: 'string' },
                    url: { type: 'string', format: 'uri' }, date: { type: 'string', format: 'date' },
                    category: { type: 'string' },
                  },
                },
              }),
            },
            ...errorResponses,
          },
        },
      },
    },
  };
}

/* ---------- Open Graph image ---------- */

const BAYER4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

// 5x7 pixel font, one byte per row, bit 4 = left pixel.
const GLYPHS = {
  'a': [0x00, 0x00, 0x0e, 0x01, 0x0f, 0x11, 0x0f],
  'b': [0x10, 0x10, 0x16, 0x19, 0x11, 0x11, 0x1e],
  'c': [0x00, 0x00, 0x0e, 0x10, 0x10, 0x11, 0x0e],
  'd': [0x01, 0x01, 0x0d, 0x13, 0x11, 0x11, 0x0f],
  'e': [0x00, 0x00, 0x0e, 0x11, 0x1f, 0x10, 0x0e],
  'f': [0x06, 0x09, 0x08, 0x1c, 0x08, 0x08, 0x08],
  'g': [0x00, 0x00, 0x0f, 0x11, 0x0f, 0x01, 0x1e],
  'h': [0x10, 0x10, 0x16, 0x19, 0x11, 0x11, 0x11],
  'i': [0x04, 0x00, 0x0c, 0x04, 0x04, 0x04, 0x0e],
  'j': [0x02, 0x00, 0x06, 0x02, 0x02, 0x12, 0x0c],
  'k': [0x10, 0x10, 0x12, 0x14, 0x18, 0x14, 0x12],
  'l': [0x0c, 0x04, 0x04, 0x04, 0x04, 0x04, 0x0e],
  'm': [0x00, 0x00, 0x1a, 0x15, 0x15, 0x15, 0x15],
  'n': [0x00, 0x00, 0x16, 0x19, 0x11, 0x11, 0x11],
  'o': [0x00, 0x00, 0x0e, 0x11, 0x11, 0x11, 0x0e],
  'p': [0x00, 0x00, 0x1e, 0x11, 0x1e, 0x10, 0x10],
  'q': [0x00, 0x00, 0x0d, 0x13, 0x0f, 0x01, 0x01],
  'r': [0x00, 0x00, 0x16, 0x19, 0x10, 0x10, 0x10],
  's': [0x00, 0x00, 0x0f, 0x10, 0x0e, 0x01, 0x1e],
  't': [0x08, 0x08, 0x1c, 0x08, 0x08, 0x09, 0x06],
  'u': [0x00, 0x00, 0x11, 0x11, 0x11, 0x13, 0x0d],
  'v': [0x00, 0x00, 0x11, 0x11, 0x11, 0x0a, 0x04],
  'w': [0x00, 0x00, 0x11, 0x15, 0x15, 0x15, 0x0a],
  'x': [0x00, 0x00, 0x11, 0x0a, 0x04, 0x0a, 0x11],
  'y': [0x00, 0x00, 0x11, 0x11, 0x0f, 0x01, 0x0e],
  'z': [0x00, 0x00, 0x1f, 0x02, 0x04, 0x08, 0x1f],
  '0': [0x0e, 0x11, 0x13, 0x15, 0x19, 0x11, 0x0e],
  '1': [0x04, 0x0c, 0x04, 0x04, 0x04, 0x04, 0x0e],
  '2': [0x0e, 0x11, 0x01, 0x06, 0x08, 0x10, 0x1f],
  '3': [0x0e, 0x11, 0x01, 0x06, 0x01, 0x11, 0x0e],
  '4': [0x02, 0x06, 0x0a, 0x12, 0x1f, 0x02, 0x02],
  '5': [0x1f, 0x10, 0x1e, 0x01, 0x01, 0x11, 0x0e],
  '6': [0x06, 0x08, 0x10, 0x1e, 0x11, 0x11, 0x0e],
  '7': [0x1f, 0x01, 0x02, 0x04, 0x08, 0x08, 0x08],
  '8': [0x0e, 0x11, 0x11, 0x0e, 0x11, 0x11, 0x0e],
  '9': [0x0e, 0x11, 0x11, 0x0f, 0x01, 0x02, 0x0c],
  ' ': [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
  '.': [0x00, 0x00, 0x00, 0x00, 0x00, 0x0c, 0x0c],
  '-': [0x00, 0x00, 0x00, 0x0e, 0x00, 0x00, 0x00],
  '&': [0x0c, 0x12, 0x14, 0x08, 0x15, 0x12, 0x0d],
  '·': [0x00, 0x00, 0x00, 0x0c, 0x0c, 0x00, 0x00],
  ':': [0x00, 0x0c, 0x0c, 0x00, 0x0c, 0x0c, 0x00],
  '/': [0x01, 0x02, 0x02, 0x04, 0x08, 0x08, 0x10],
};

function drawText(pixels, width, text, left, top, scale, color) {
  let cx = left;
  for (const char of text.toLowerCase()) {
    const glyph = GLYPHS[char];
    if (!glyph) { cx += 6 * scale; continue; }
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 5; col++) {
        if (!(glyph[row] & (1 << (4 - col)))) continue;
        for (let dy = 0; dy < scale; dy++) {
          for (let dx = 0; dx < scale; dx++) {
            const x = cx + col * scale + dx;
            const y = top + row * scale + dy;
            if (x < 0 || y < 0 || x >= width || y >= pixels.length / 3 / width) continue;
            const i = (y * width + x) * 3;
            pixels[i] = color[0]; pixels[i + 1] = color[1]; pixels[i + 2] = color[2];
          }
        }
      }
    }
    cx += 6 * scale;
  }
  return cx - left;
}

const textWidth = (text, scale) => text.length * 6 * scale;

function crc32(buf) {
  let table = crc32.table;
  if (!table) {
    table = crc32.table = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      table[n] = c >>> 0;
    }
  }
  let c = 0xffffffff;
  for (const b of buf) c = table[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  out.write(type, 4);
  data.copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
}

function encodePng(pixels, width, height) {
  const raw = Buffer.alloc((width * 3 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 3 + 1)] = 0;
    Buffer.from(pixels.buffer, y * width * 3, width * 3).copy(raw, y * (width * 3 + 1) + 1);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 2; // 8-bit RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(raw, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

async function buildOg() {
  const width = 1200;
  const height = 630;
  const pixels = new Uint8Array(width * height * 3);
  const blue = [30, 80, 255];
  const deep = [8, 12, 40];

  // Dithered aurora: two sine ridges fading down from the top, Bayer-quantised.
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const ridge = Math.exp(-Math.pow((y - (110 + 60 * Math.sin(x / 150))) / 90, 2))
        + 0.6 * Math.exp(-Math.pow((y - (210 + 70 * Math.sin(x / 90 + 2))) / 110, 2));
      const intensity = Math.min(1, ridge) * Math.max(0, 1 - y / 560);
      const on = intensity * 16 > BAYER4[y % 4][x % 4] + 0.5;
      const i = (y * width + x) * 3;
      const [r, g, b] = on ? blue : deep.map((v) => v * (0.4 + intensity * 0.6));
      pixels[i] = r; pixels[i + 1] = g; pixels[i + 2] = b;
    }
  }

  const title = 'Screen';
  const titleScale = 16;
  const subtitle = 'developer & video editor';
  const subScale = 7;
  const domain = siteHost;
  const domainScale = 6;

  drawText(pixels, width, title, Math.round((width - textWidth(title, titleScale)) / 2), 250, titleScale, [255, 255, 255]);
  drawText(pixels, width, subtitle, Math.round((width - textWidth(subtitle, subScale)) / 2), 400, subScale, [140, 160, 255]);
  drawText(pixels, width, domain, Math.round((width - textWidth(domain, domainScale)) / 2), 500, domainScale, [90, 110, 220]);

  await writeFile(path.join(OUT, 'og.png'), encodePng(pixels, width, height));
  console.log('og: wrote out/og.png');
}

/* ---------- run ---------- */

await buildMarkdown();
await buildApi();
await buildOg();
