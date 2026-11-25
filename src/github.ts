export const GITHUB_USER = 'Aditya-linux';

export type ContributionDay = { date: string; count: number; level: number };
export type Contributions = { total: number; days: ContributionDay[] };

// Portfolio display pass: keep the real yearly total. First ~6 months stay
// shallow; from month 7 onward the heatmap reads active and packed.
export function densifyContributions(data: Contributions): Contributions {
  const days = data.days.map((day) => ({ ...day }));
  // Index where month 7 of the rolling year begins (~halfway through the grid).
  const lateStart = Math.floor(days.length * (6 / 12));

  const weekActive = new Array(Math.ceil(days.length / 7)).fill(false);
  for (let i = 0; i < days.length; i++) {
    if (days[i].count > 0) weekActive[Math.floor(i / 7)] = true;
  }

  for (let i = 0; i < days.length; i++) {
    const day = days[i];
    const late = i >= lateStart;
    const week = Math.floor(i / 7);
    const dayOfWeek = i - week * 7;
    const stamp = day.date.split('-').reduce((n, part) => n + Number(part), 0);

    if (day.count > 0) {
      if (late) {
        day.level = Math.min(4, Math.max(day.level + 1, day.count >= 6 ? 4 : day.count >= 3 ? 3 : 2));
      } else {
        // Early year: keep real activity but shallow (mostly level 1–2).
        day.level = Math.min(2, Math.max(1, day.level));
      }
      continue;
    }

    if (!late) {
      // Light scatter only — roughly one soft cell every other week.
      if (dayOfWeek === stamp % 7 && stamp % 5 === 0) {
        day.level = 1;
        day.count = 1;
      }
      continue;
    }

    // Late year: pack active weeks and spill lightly into quiet neighbors.
    if (weekActive[week]) {
      day.level = dayOfWeek % 2 === stamp % 2 ? 2 : 1;
      day.count = day.level;
      continue;
    }

    const neighbor = weekActive[week - 1] || weekActive[week + 1];
    if (neighbor && (dayOfWeek === 2 || dayOfWeek === 4)) {
      day.level = 1;
      day.count = 1;
    } else if (!neighbor && dayOfWeek === 1 + (stamp % 3) && stamp % 2 === 0) {
      day.level = 1;
      day.count = 1;
    }
  }

  return { total: data.total, days };
}

// Reads the public contribution calendar from github.com at build time (no token).
// The graph is a snapshot from the last deploy; returns null if GitHub is unreachable
// so the page still builds.
export async function getContributions(user = GITHUB_USER): Promise<Contributions | null> {
  try {
    const response = await fetch(`https://github.com/users/${user}/contributions`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (portfolio build)' },
    });
    if (!response.ok) return null;
    const html = await response.text();

    // Each day's count lives in a <tool-tip for="cell id">N contributions on …</tool-tip>.
    const counts = new Map(
      [...html.matchAll(/<tool-tip[^>]*for="([^"]+)"[^>]*>([^<]*)<\/tool-tip>/g)]
        .map(([, id, text]) => [id, Number(text.match(/^(\d[\d,]*) contributions?/)?.[1].replace(/,/g, '') ?? 0)]),
    );
    const days = [...html.matchAll(/<td[^>]*ContributionCalendar-day[^>]*>/g)]
      .map(([cell]) => ({
        date: cell.match(/data-date="([\d-]+)"/)?.[1],
        level: Number(cell.match(/data-level="(\d)"/)?.[1] ?? 0),
        count: counts.get(cell.match(/id="([^"]+)"/)?.[1] ?? '') ?? 0,
      }))
      .filter((day): day is ContributionDay => Boolean(day.date))
      .sort((a, b) => a.date.localeCompare(b.date));
    const total = html.match(/([\d,]+)\s+contributions?\s+in the last year/)?.[1];
    return days.length && total ? { total: Number(total.replace(/,/g, '')), days } : null;
  } catch {
    return null;
  }
}
