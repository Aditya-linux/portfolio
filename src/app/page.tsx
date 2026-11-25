import { App } from '../App';
import { getBlogPosts } from '../blog';
import { getContributions } from '../github';
import { organization, person, profile } from '../agent';
import { siteUrl } from '../site';

export const metadata = { alternates: { canonical: '/' } };

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': `${siteUrl}/#person`,
      name: person.name,
      jobTitle: person.jobTitle,
      url: siteUrl,
      email: person.email,
      description: profile.summary,
      sameAs: [...person.sameAs],
      address: { '@type': 'PostalAddress', addressLocality: person.location.locality, addressCountry: person.location.country },
      worksFor: { '@id': `${siteUrl}/#organization` },
    },
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: organization.name,
      url: organization.url,
      founder: { '@id': `${siteUrl}/#person` },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        email: organization.email,
        url: `${siteUrl}/contact`,
      },
      address: { '@type': 'PostalAddress', addressLocality: organization.location.locality, addressCountry: organization.location.country },
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      name: 'Aditya Nishad',
      url: siteUrl,
      author: { '@id': `${siteUrl}/#person` },
    },
  ],
};

export default async function Home() {
  const [posts, contributions] = await Promise.all([getBlogPosts(), getContributions()]);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <App view="home" posts={posts} contributions={contributions} />
    </>
  );
}
