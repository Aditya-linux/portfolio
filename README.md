# portfolio.site

Source for [screeen.us.ci](https://screeen.us.ci), the personal portfolio of Screen (Zaid Ali Ansari), a product developer and video editor. It is a dark, text-first site with projects, video work, a blog, a CV and an agent-readable layer (Markdown mirrors, a JSON API, an OpenAPI spec, `llms.txt` and a small MCP endpoint).

## Stack

- [Next.js](https://nextjs.org) 16 (static export) and React 19, TypeScript, Tailwind CSS 4
- GSAP, Motion, Lenis, Matter.js and Embla Carousel for animation and interaction, plus a custom dithering renderer in `src/lib/dither/`
- [Cloudflare Workers](https://developers.cloudflare.com/workers/) with Static Assets for hosting. `worker/index.ts` serves the API, MCP endpoint, Markdown negotiation and the GitHub OAuth flow for the blog editor
- [Sveltia CMS](https://github.com/sveltia/sveltia-cms) at `/admin` for writing blog posts
- [Bun](https://bun.sh) 1.4 as the package manager and test runner

## Run it locally

Requires Bun 1.4+ (and Node 22.18+ for the CV build script).

```sh
bun install
cp .env.example .env   # then edit the values
bun run dev            # http://localhost:3000
```

Other commands:

| Command | What it does |
| --- | --- |
| `bun run lint` | Type-checks the project (`tsc --noEmit`) |
| `bun test` | Runs the tests |
| `bun run build` | Static export to `out/`, then generates the Markdown mirrors, API JSON, OpenAPI spec and OG image, and checks assets |
| `bunx wrangler dev` | Runs the built site through the Worker locally |
| `node scripts/build-cv.mjs` | Rebuilds the PDF CVs in `resumes/` from their HTML sources |

### Environment variables

See [`.env.example`](.env.example). Never commit a real `.env` or `.dev.vars`; both are git-ignored.

| Variable | Used by | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Build | Canonical origin for metadata, sitemap, `llms.txt`, OpenAPI and the OG image. Defaults to `https://screeen.us.ci` |
| `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` | Worker | GitHub OAuth app for signing in to `/admin`. Optional; without them the editor's GitHub sign-in shows an error |
| `CV_BROWSER` | `scripts/build-cv.mjs` | Path to a Chromium binary if Edge or Chrome isn't installed in a standard location |

## Deploy

The site deploys to Cloudflare Workers:

```sh
bunx wrangler login
bunx wrangler secret put GITHUB_CLIENT_ID      # only if you use /admin
bunx wrangler secret put GITHUB_CLIENT_SECRET
bunx wrangler deploy                            # runs `bun run build` and uploads out/
```

Set `NEXT_PUBLIC_SITE_URL` in your shell or `.env` before deploying. The Worker name and routes are in `wrangler.jsonc`. Because the build is a plain static export in `out/`, any static host works if you don't need the API, MCP or OAuth routes.

Blog posts live in `content/blog/`. See [content/README.md](content/README.md) for the editor and the OAuth app setup.

## Using this as a template

You're welcome to fork the code (MIT). The content is not reusable, so replace all of it before publishing your own site:

1. **Identity and copy:** `src/agent.ts`, `src/projects.ts`, `src/tweets.ts`, the pages in `src/app/` (about, contact, privacy, developers, api), `src/components/panels/`, `public/.well-known/agent.json` and `src/app/llms.txt/route.ts`.
2. **Blog:** delete `content/blog/*` and `public/blog/*`.
3. **Media:** replace everything in `public/about/`, `public/projects/`, `public/videos/`, `public/logos/`, `public/screen.jpg` and `public/x-avatar.jpg`.
4. **CV:** delete `resumes/` and `public/cv.pdf`, or rewrite the HTML sources and run `node scripts/build-cv.mjs`.
5. **Videos:** the video files aren't in the repo, so the Videos page shows each clip's thumbnail with a link to watch it. To make clips playable, add your own `.mp4` files to `public/videos/` and set `src` on the entries in `src/components/editing-showcase.tsx`; the volume control appears automatically.
6. **Font:** the signature in `src/components/signature.tsx` uses Sacramento (SIL OFL, in `public/fonts/`). You can keep it or swap in another TTF/OTF font.
7. **Config:** set `NEXT_PUBLIC_SITE_URL`, change `name` in `wrangler.jsonc`, and update `repo` and `base_url` in `public/admin/config.yml` to your repository and domain.

## License

Code is under the [MIT License](LICENSE). Personal content (writing, photos, videos, logos, résumés) is © Zaid Ali Ansari, all rights reserved, and is **not** covered by the MIT license; see [CONTENT_LICENSE.md](CONTENT_LICENSE.md). Third-party files keep their own licenses as listed there.
