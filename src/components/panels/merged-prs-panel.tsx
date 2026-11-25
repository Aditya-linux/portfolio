import { Logo, PanelLabel, Row } from './rows';
import { mergedPrs } from '@/merged-prs';

const dateLabel = (iso: string) => {
  const [, month, day] = iso.split('-').map(Number);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[month - 1]} ${day}`;
};

export function MergedPrsPanel({ label = 'Merged PRs' }: { label?: string }) {
  return (
    <>
      {label && <PanelLabel>{label}</PanelLabel>}
      <p className="panel-copy" style={{ marginBottom: 12, fontSize: 14, color: 'var(--muted)' }}>
        Merged contributions to open-source orgs — NEAR, AidTrace, and more as they land.
      </p>
      <div className="prow-list">
        {mergedPrs.map((pr) => (
          <Row
            key={`${pr.repo}-${pr.number}`}
            href={pr.url}
            logo={<Logo src={pr.logo} />}
            name={
              <>
                {pr.org} <span className="prow-meta">#{pr.number}</span>
              </>
            }
            meta={pr.title}
            date={dateLabel(pr.mergedAt)}
          />
        ))}
      </div>
    </>
  );
}
