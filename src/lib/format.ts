const DATE_OPTS: Intl.DateTimeFormatOptions = {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
};
const TIME_OPTS: Intl.DateTimeFormatOptions = {
  hour: 'numeric',
  minute: '2-digit',
};

function withZone(
  opts: Intl.DateTimeFormatOptions,
  timeZone?: string | null,
): Intl.DateTimeFormatOptions {
  return timeZone ? { ...opts, timeZone } : opts;
}

/** " PDT" when a timezone is given, otherwise "" (viewer-local needs no label). */
function zoneLabel(date: Date, timeZone?: string | null): string {
  if (!timeZone) return '';
  const part = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'short',
  })
    .formatToParts(date)
    .find((p) => p.type === 'timeZoneName');
  return part ? ` ${part.value}` : '';
}

/** "7:30 PM" + "10:00 PM" → "7:30", so a range reads "7:30 – 10:00 PM". */
function dropSharedMeridiem(startTime: string, endTime: string): string {
  // en-US separates the meridiem with a narrow no-break space, hence \s.
  const start = startTime.split(/\s+/);
  const end = endTime.split(/\s+/);
  return start.length === 2 && end.length === 2 && start[1] === end[1]
    ? start[0]
    : startTime;
}

/**
 * "Fri, Aug 21, 7:30 PM" — or with an end: "Fri, Aug 21, 7:30 – 10:00 PM".
 * When `timeZone` is set the times render in it and get a zone label.
 */
export function formatDateRange(
  iso: string,
  endIso?: string | null,
  timeZone?: string | null,
): string {
  const start = new Date(iso);
  if (isNaN(start.getTime())) return iso;
  const parsedEnd = endIso ? new Date(endIso) : null;
  const end =
    parsedEnd && !isNaN(parsedEnd.getTime()) && parsedEnd > start ? parsedEnd : null;

  try {
    const day = start.toLocaleDateString('en-US', withZone(DATE_OPTS, timeZone));
    const startTime = start.toLocaleTimeString('en-US', withZone(TIME_OPTS, timeZone));
    const zone = zoneLabel(start, timeZone);
    if (!end) return `${day}, ${startTime}${zone}`;

    const endDay = end.toLocaleDateString('en-US', withZone(DATE_OPTS, timeZone));
    const endTime = end.toLocaleTimeString('en-US', withZone(TIME_OPTS, timeZone));
    return day === endDay
      ? `${day}, ${dropSharedMeridiem(startTime, endTime)} – ${endTime}${zone}`
      : `${day}, ${startTime} – ${endDay}, ${endTime}${zone}`;
  } catch {
    // invalid tz id — fall back to viewer-local formatting
    return formatDateRange(iso, endIso, null);
  }
}
