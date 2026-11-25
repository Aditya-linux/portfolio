import type { MetadataRoute } from 'next';
import { getBlogPosts } from '../blog';
import { projectPath, projects } from '../projects';
import { siteUrl } from '../site';

export const dynamic = 'force-static';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getBlogPosts();
  return [
    ...['', '/about', '/work', '/projects', ...projects.map(projectPath), '/videos', '/blog', '/contact', '/privacy', '/api', '/developers', '/developers/mcp'].map((path) => ({ url: `${siteUrl}${path}` })),
    ...posts.map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      ...(post.date && { lastModified: post.date }),
    })),
  ];
}
