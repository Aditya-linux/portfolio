import Image from 'next/image';
import Link from 'next/link';
import { Logo, PanelLabel } from './rows';

type JourneyLink = {
  href: string;
  logo: string;
  name: string;
  desc: string;
};

type JourneyEntry = {
  when: string;
  current?: boolean;
  href?: string;
  logo: string;
  name: string;
  role: string;
  summary: string;
  links?: JourneyLink[];
};

const entries: JourneyEntry[] = [
  {
    when: 'Now',
    current: true,
    href: 'https://stellar.org/',
    logo: '/logos/stellar.webp',
    name: 'Stellar Open Source',
    role: 'Brand Ambassador · open source developer',
    summary:
      'I contribute to the Stellar ecosystem, help builders ship on-chain, and hosted an IRL hackathon in Mumbai as Brand Ambassador.',
    links: [
      {
        href: '/projects/rekura',
        logo: '/logos/recurra.svg',
        name: 'Rekura',
        desc: 'Recurring payments on Stellar Soroban',
      },
    ],
  },
  {
    when: '3 mo',
    href: 'https://www.rumicare.org/',
    logo: '/logos/rumicare.svg',
    name: 'RUMI Care',
    role: 'Documentation intern · certificates & admin automation',
    summary:
      'I wrote product docs and helped automate certificate and admin workflows for the care platform.',
  },
];

export function WorkPanel({
  label = 'Experience',
  allHref = '/work',
}: {
  label?: string;
  allHref?: string | false;
}) {
  return (
    <>
      {label && (
        <PanelLabel href={allHref || undefined} allLabel="All experience">
          {label}
        </PanelLabel>
      )}
      <ol className="journey">
        {entries.map((entry) => (
          <li key={entry.name} className={entry.current ? 'journey-entry is-now' : 'journey-entry'}>
            <p className="journey-when">{entry.when}</p>
            <div className="journey-company">
              <Logo src={entry.logo} />
              <h3 className="journey-name">
                {entry.href ? (
                  <a href={entry.href} target="_blank" rel="noopener noreferrer">
                    {entry.name}
                  </a>
                ) : (
                  entry.name
                )}
              </h3>
            </div>
            <p className="journey-role">{entry.role}</p>
            <p className="journey-summary">{entry.summary}</p>
            {entry.links && entry.links.length > 0 && (
              <div className="journey-links">
                {entry.links.map((link) => {
                  const external = link.href.startsWith('http');
                  const body = (
                    <>
                      <Image
                        className="journey-card-logo"
                        src={link.logo}
                        alt=""
                        width={32}
                        height={32}
                      />
                      <span className="journey-card-main">
                        <span className="journey-card-name">{link.name}</span>
                        <span className="journey-card-desc">{link.desc}</span>
                      </span>
                      <span className="journey-card-arrow" aria-hidden="true">
                        ↗
                      </span>
                    </>
                  );
                  return external ? (
                    <a
                      key={link.name}
                      className="journey-card"
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {body}
                    </a>
                  ) : (
                    <Link key={link.name} className="journey-card" href={link.href}>
                      {body}
                    </Link>
                  );
                })}
              </div>
            )}
          </li>
        ))}
      </ol>
    </>
  );
}
