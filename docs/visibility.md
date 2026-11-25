# Visibility: agent readiness (is-agentic)

Date: 2026-11-01. Site: https://screeen.us.ci (Cloudflare Workers static export, worker `site-portfolio`).
Tool: `bunx is-agentic screeen.us.ci` (Vercel/Ora agent-readiness scan). Report: https://is-agentic.com/scan/screeen.us.ci

## Baseline

Score **2/100** — Essential 0/80 (0 of 5 checks), Recommended 1.5/20 (1 of 13), bonus 0.3.

Root causes, in order:

1. **Cloudflare bot management challenged every agent UA** (ChatGPT-User, OAI-SearchBot, Claude-User, PerplexityBot). The scanner never saw the homepage, so content-no-js, JSON-LD, metadata, org schema, docs-link and trust-anchor checks all failed "blocked by WAF". This is a zone-level setting, not code.
2. No markdown content negotiation (`Accept: text/markdown`), no `Vary: Accept`.
3. No OpenAPI spec, no JSON API, no JSON error responses, no rate-limit headers.
4. No llms.txt with when-to-use guidance; no /about, /privacy (and thin /contact); live deploy predated the sitemap.
5. Search checks (brand name, API docs discovery) depend on indexing and can't be fully fixed in code.

## Implemented locally (not yet deployed)

- `worker/index.ts`: Markdown negotiation on every page (`Accept: text/markdown` serves `/md/*.md`, `Vary: Accept` on HTML), JSON API under `/api` (`/api`, `/api/profile`, `/api/projects`, `/api/projects/{id}`, `/api/posts`) with `RateLimit-*` headers, per-IP 60/min limiter and `Retry-After` on 429, structured JSON errors (`{error:{code,message,hint}}`), minimal MCP server at `POST /mcp` (`initialize`, `tools/list`, `tools/call`, `ping`).
- `wrangler.jsonc`: `run_worker_first: ["/*"]`.
- `scripts/build-agentic.mjs` (in `bun run build`): writes `out/md/**.md` mirrors of every page, `out/api/*.json` payloads from `src/projects.ts`/`src/agent.ts`/`src/blog.ts`, `out/openapi.json` (+ copy at `/api/openapi.json`), and a generated `out/og.png` (dithered aurora + pixel text).
- `src/agent.ts`: single source for profile/org data used by JSON-LD and the API.
- Pages: `/about`, `/privacy`, `/api` (docs, doubles as API index for browsers); `/contact` expanded past 500 chars.
- `src/app/llms.txt/route.ts`: when-to-use guidance, API/MCP links (merged with the dynamic project list). `public/llms.txt` must be deleted (conflict).
- Metadata: Open Graph + Twitter cards, `og:image` → `/og.png`; JSON-LD `Person` + `Organization` (contactPoint + PostalAddress) + `WebSite` on the homepage.
- `robots.ts`: explicit allow group for agent/AI crawlers; sitemap gains `/about`, `/privacy`, `/api`.

## Blocked — needs the owner

- **`wrangler login`** on this machine (no CF credentials; `wrangler whoami` is unauthenticated) so `wrangler deploy` can run.
- **Cloudflare dashboard → screeen.us.ci → Security → Bots**: turn off Bot Fight Mode / "Block AI bots" (AI Audit) so unverified agent UAs aren't challenged. Also check Security → Settings → Security Level isn't "I'm Under Attack".
- Then: deploy, rescan, iterate to >= 95.

## Verification commands (local, post-build)

```
curl -i -H "Accept: text/markdown" http://127.0.0.1:4173/      # text/markdown + Vary: Accept
curl -H "Accept: application/json" http://127.0.0.1:4173/api   # JSON index
curl -i http://127.0.0.1:4173/api/projects/relay               # JSON + RateLimit-*
curl -i http://127.0.0.1:4173/api/nope                         # JSON 404
curl -X POST http://127.0.0.1:4173/mcp -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

## Residual risks for 95

- The two search-ranking checks (brand name, API docs discovery) may remain failed/partial even after everything else ships (~3 points at stake). Everything else is achievable.
- If the MCP endpoint activates extra checks, some may score partial; it's a correct stateless JSON-RPC implementation.
