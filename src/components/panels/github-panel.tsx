'use client';

import { useEffect, useState } from 'react';
import {
  ContributionGraph,
  ContributionGraphBlock,
  ContributionGraphCalendar,
  ContributionGraphFooter,
  ContributionGraphLegend,
  ContributionGraphTotalCount,
} from '@/components/kibo-ui/contribution-graph';
import { densifyContributions, GITHUB_USER, type Contributions } from '@/github';
import { PanelLabel } from './rows';

const dayLabel = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

// Kibo UI's contribution graph fed with the build-time GitHub snapshot.
// Densified for portfolio display; yearly total stays the real GitHub count.
// Render after mount to avoid SSR/client timezone hydration mismatches in the calendar.
export function GithubPanel({ data, label = 'GitHub' }: { data: Contributions; label?: string }) {
  const [ready, setReady] = useState(false);
  const display = densifyContributions(data);
  useEffect(() => {
    setReady(true);
  }, []);

  return (
    <>
      {label && <PanelLabel>{label}</PanelLabel>}
      {ready ? (
        <ContributionGraph
          className="gh-cal"
          data={display.days}
          totalCount={data.total}
          blockSize={11}
          blockMargin={1}
          blockRadius={2}
          fontSize={12}
          labels={{ totalCount: `${data.total.toLocaleString('en-US')} contributions in the last year` }}
        >
          <ContributionGraphCalendar>
            {({ activity, dayIndex, weekIndex }) => (
              <ContributionGraphBlock activity={activity} dayIndex={dayIndex} weekIndex={weekIndex}>
                <title>{`${activity.count} contribution${activity.count === 1 ? '' : 's'} on ${dayLabel.format(new Date(`${activity.date}T00:00:00Z`))}`}</title>
              </ContributionGraphBlock>
            )}
          </ContributionGraphCalendar>
          <ContributionGraphFooter>
            <ContributionGraphTotalCount />
            <ContributionGraphLegend />
          </ContributionGraphFooter>
        </ContributionGraph>
      ) : (
        <p className="panel-copy" style={{ color: 'var(--muted)', fontSize: 13 }}>
          {data.total.toLocaleString('en-US')} contributions in the last year
        </p>
      )}
      <a className="gh-profile" href={`https://github.com/${GITHUB_USER}`} target="_blank" rel="noopener noreferrer">
        @{GITHUB_USER} ↗
      </a>
    </>
  );
}
