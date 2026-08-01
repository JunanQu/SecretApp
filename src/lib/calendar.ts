export type CalendarEvent = {
  title: string;
  startIso: string;
  /** Defaults to 2 hours after start */
  durationHours?: number;
  description?: string;
  location?: string;
};

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** Format a Date as UTC for Google Calendar / ICS: YYYYMMDDTHHMMSSZ */
export function toUtcStamp(date: Date): string {
  return (
    date.getUTCFullYear().toString() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    'T' +
    pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) +
    'Z'
  );
}

function eventBounds(event: CalendarEvent): { start: Date; end: Date } {
  const start = new Date(event.startIso);
  const hours = event.durationHours ?? 2;
  const end = new Date(start.getTime() + hours * 60 * 60 * 1000);
  return { start, end };
}

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

/** Google Calendar "Add event" template URL */
export function toGoogleCalendarUrl(event: CalendarEvent): string {
  const { start, end } = eventBounds(event);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${toUtcStamp(start)}/${toUtcStamp(end)}`,
  });
  if (event.description) params.set('details', event.description);
  if (event.location) params.set('location', event.location);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Build a minimal VEVENT .ics payload (works with Apple Calendar) */
export function toIcsContent(event: CalendarEvent): string {
  const { start, end } = eventBounds(event);
  const uid = `${toUtcStamp(start)}-${Math.random().toString(36).slice(2, 10)}@secretapp`;
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SecretApp//Date Invite//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${toUtcStamp(new Date())}`,
    `DTSTART:${toUtcStamp(start)}`,
    `DTEND:${toUtcStamp(end)}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
  ];
  if (event.description) {
    lines.push(`DESCRIPTION:${escapeIcsText(event.description)}`);
  }
  if (event.location) {
    lines.push(`LOCATION:${escapeIcsText(event.location)}`);
  }
  lines.push('END:VEVENT', 'END:VCALENDAR');
  return lines.join('\r\n');
}

/** Trigger a .ics download for Apple Calendar (and other calendar apps) */
export function downloadIcs(event: CalendarEvent, filename = 'date.ics'): void {
  const blob = new Blob([toIcsContent(event)], {
    type: 'text/calendar;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function buildDateEvent(opts: {
  withName: string;
  startIso: string;
  message?: string;
  label?: string;
}): CalendarEvent {
  return {
    title: `Date with ${opts.withName}`,
    startIso: opts.startIso,
    durationHours: 2,
    description: [opts.message, opts.label].filter(Boolean).join('\n\n') || undefined,
    location: opts.label || undefined,
  };
}
