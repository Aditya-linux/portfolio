// Shared date formatting for blog lists. Kept module-only so client components
// can import it without pulling in the fs-backed post loader.
export function postDate(date: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: '2-digit', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`));
}
