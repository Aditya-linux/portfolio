import type { Metadata } from 'next';
import { App } from '../../App';
import { getBlogPosts } from '../../blog';
import { BlogPanel } from '../../components/panels/blog-panel';

export const metadata: Metadata = {
  title: 'Blog | Aditya Nishad',
  description: 'Writing by Aditya Nishad on AI, Web3 and product building.',
  alternates: { canonical: '/blog' },
};

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <App view="blog">
      <h1 className="page-h1">Blog</h1>
      {posts.length > 0 ? (
        <BlogPanel posts={posts} label="" />
      ) : (
        <p className="panel-copy">
          Essays live on{' '}
          <a href="https://medium.com/@adityanishad0402" target="_blank" rel="noopener noreferrer">
            Medium
          </a>
          . New posts will show up here too.
        </p>
      )}
    </App>
  );
}
