import type { MetadataRoute } from 'next';
import { siteUrl } from '../site';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin', '/oauth/'] },
      // Agent fetchers and AI search crawlers are explicitly welcome.
      {
        userAgent: [
          'ChatGPT-User',
          'OAI-SearchBot',
          'GPTBot',
          'Claude-User',
          'ClaudeBot',
          'PerplexityBot',
          'Perplexity-User',
          'Google-Extended',
          'Applebot-Extended',
          'cohere-ai',
        ],
        allow: '/',
        disallow: ['/admin', '/oauth/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
