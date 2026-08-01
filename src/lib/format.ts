export function formatDateOption(iso: string, timeZone?: string | null): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return iso;
  const base: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  };
  if (timeZone) {
    try {
      return date.toLocaleString('en-US', {
        ...base,
        timeZone,
        timeZoneName: 'short',
      });
    } catch {
      // invalid tz id — fall through to viewer-local formatting
    }
  }
  return date.toLocaleString('en-US', base);
}
