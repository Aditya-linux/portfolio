import type { BlogPost } from '@/blog';
import { postDate } from '../../post-date';
import { PanelLabel, Row } from './rows';

export function BlogPanel({ posts, label = 'Blog' }: { posts: BlogPost[]; label?: string }) {
  return (
    <>
      {label && <PanelLabel>{label}</PanelLabel>}
      <div className="prow-list">
        {posts.map((post) => (
          <Row
            key={post.slug}
            href={`/blog/${post.slug}`}
            name={post.title}
            meta={post.summary}
            date={post.date ? postDate(post.date) : undefined}
          />
        ))}
      </div>
    </>
  );
}
