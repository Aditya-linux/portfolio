// Merged pull requests to external orgs only (not personal Aditya-linux repos).
export type MergedPr = {
  org: string;
  orgUrl: string;
  logo: string;
  repo: string;
  title: string;
  url: string;
  number: number;
  mergedAt: string;
};

export const mergedPrs: readonly MergedPr[] = [
  {
    org: 'NEAR',
    orgUrl: 'https://github.com/near',
    logo: '/logos/near.png',
    repo: 'near/near-cli-rs',
    title: 'fix: report recipient warnings without a TTY',
    url: 'https://github.com/near/near-cli-rs/pull/722',
    number: 722,
    mergedAt: '2026-11-14',
  },
  {
    org: 'AidTrace',
    orgUrl: 'https://github.com/AidTraceHQ',
    logo: '/logos/aidtrace.png',
    repo: 'AidTraceHQ/AidTraceLabs',
    title: 'feat: add cursor next-page loading for ledger and admin lists',
    url: 'https://github.com/AidTraceHQ/AidTraceLabs/pull/90',
    number: 90,
    mergedAt: '2026-11-19',
  },
  {
    org: 'AidTrace',
    orgUrl: 'https://github.com/AidTraceHQ',
    logo: '/logos/aidtrace.png',
    repo: 'AidTraceHQ/AidTraceLabs',
    title: 'feat: return filter-bounded total on transparency pages',
    url: 'https://github.com/AidTraceHQ/AidTraceLabs/pull/89',
    number: 89,
    mergedAt: '2026-11-18',
  },
] as const;

export const mergedPrOrgs = [...new Set(mergedPrs.map((pr) => pr.org))];
