// Canonical origin for metadata, JSON-LD, sitemap and llms.txt. Set NEXT_PUBLIC_SITE_URL to deploy elsewhere.
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.adityanishad.space').replace(/\/+$/, '');
