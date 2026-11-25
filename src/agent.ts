// Single source for the agent-facing API, llms.txt and JSON-LD.
// Plain data only; the build script imports this with Node type stripping.

export const person = {
  name: 'Aditya Nishad',
  jobTitle: 'AI & Web3 product builder',
  location: { locality: 'New Delhi', country: 'IN' },
  email: 'adityanishad0402@gmail.com',
  url: 'https://www.adityanishad.space',
  sameAs: [
    'https://x.com/AdityaNishad987',
    'https://github.com/Aditya-linux',
    'https://www.linkedin.com/in/aditya-nishad-a07b191b9',
    'https://medium.com/@adityanishad0402',
    'https://t.me/AdityaNishad77',
  ],
} as const;

export const organization = {
  name: 'Aditya Nishad',
  url: 'https://www.adityanishad.space',
  founder: person.name,
  location: person.location,
  email: person.email,
} as const;

export const profile = {
  ...person,
  summary:
    'AI and Web3 product builder. Builds fintech, automation and blockchain products including TapPay and Rekura. Stellar Brand Ambassador, open-source contributor (NEAR, AidTrace), and recipient of ₹20K+ in ecosystem rewards.',
  work: [
    { role: 'Brand Ambassador & Open Source Developer', org: 'Stellar', period: 'current', note: 'Ecosystem contributions and hosted an IRL hackathon in Mumbai' },
    { role: 'Co-founder', org: 'TapPay', period: 'current', note: 'Multi-chain contactless wallet' },
    { role: 'Documentation Intern', org: 'RUMI Care', period: '3 months', note: 'Certificates and admin automation' },
  ],
  availability: 'Open to freelance work and collaborations in AI, Web3 and full-stack product development. Contact via email or X DM.',
} as const;

export const apiEndpoints = [
  {
    path: '/api/profile',
    operationId: 'getProfile',
    summary: 'Profile of Aditya Nishad',
    description: 'Identity, roles, projects and contact details for the site owner.',
  },
  {
    path: '/api/projects',
    operationId: 'listProjects',
    summary: 'List portfolio projects',
    description: 'Every shipped project with name, category, description, links and feature list.',
  },
  {
    path: '/api/projects/{id}',
    operationId: 'getProject',
    summary: 'Get one project',
    description: 'Full detail for a single project by id, e.g. /api/projects/recurra.',
  },
  {
    path: '/api/posts',
    operationId: 'listPosts',
    summary: 'List blog posts',
    description: 'Published blog posts with slug, title, summary and date.',
  },
] as const;
