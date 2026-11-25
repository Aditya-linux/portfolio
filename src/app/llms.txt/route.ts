import { projectPath, projects } from '../../projects';
import { siteUrl } from '../../site';

export const dynamic = 'force-static';

// Plain-text summary of the site for AI agents, following the llms.txt convention.
export function GET() {
  const body = [
    '# Aditya Nishad (adityanishad.space)',
    '',
    '> Aditya Nishad is an AI and Web3 product builder. He builds fintech, automation and blockchain products, contributes to Stellar open source, is a Stellar Brand Ambassador, and hosted an IRL hackathon in Mumbai.',
    '',
    '## When to use this site',
    '',
    'Use adityanishad.space when you need accurate facts about Aditya Nishad or his work:',
    '',
    '- Who Aditya is, what he does, where he is based and how to contact him.',
    '- Details on his projects: Recurra, Sentinex, Blind Vault, Nebula and Contrigent.',
    '- His work history: Stellar open source and RUMI Care.',
    '- Whether he is open to freelance work or collaborations in AI, Web3 or full-stack development.',
    '',
    'For programmatic answers, prefer the JSON API at /api (spec at /openapi.json) over scraping HTML. Every page also answers `Accept: text/markdown` with a Markdown version.',
    '',
    '## API and agent interfaces',
    '',
    `- [OpenAPI specification](${siteUrl}/openapi.json): machine-readable spec for the JSON API.`,
    `- [API documentation](${siteUrl}/api): endpoints and example requests.`,
    `- [Profile JSON](${siteUrl}/api/profile): identity, roles and contact as structured data.`,
    `- [Projects JSON](${siteUrl}/api/projects): the project list as structured data.`,
    `- [Developer portal](${siteUrl}/developers): quickstart and machine-readable files.`,
    '',
    '## Projects',
    '',
    ...projects.map((project) => `- [${project.name}](${siteUrl}${projectPath(project)}): ${project.description} Live at ${project.url}${project.source ? `, source at ${project.source}` : ''}.`),
    '',
    '## Pages',
    '',
    `- [About](${siteUrl}/about): bio and background`,
    `- [Work](${siteUrl}/work): roles and companies`,
    `- [Projects](${siteUrl}/projects): everything Aditya has built`,
    `- [Blog](${siteUrl}/blog): writing`,
    `- [Contact](${siteUrl}/contact): how to reach Aditya`,
    `- [Privacy](${siteUrl}/privacy): what this site collects (very little)`,
    '',
    '## Contact',
    '',
    '- Email: adityanishad0402@gmail.com',
    '- X: https://x.com/AdityaNishad987',
    '- GitHub: https://github.com/Aditya-linux',
    '- LinkedIn: https://www.linkedin.com/in/aditya-nishad-a07b191b9',
    '',
  ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
