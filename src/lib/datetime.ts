/**
 * Combine a local start datetime (e.g. "2026-08-05T19:00") with an "HH:MM" end
 * time and return an absolute ISO string. An end that lands on or before the
 * start rolls over to the next day, so 9 PM → 1 AM works the way people mean it.
 */
export function endIsoFrom(startLocal: string, endTime: string): string | null {
  if (!startLocal || !endTime) return null;
  const start = new Date(startLocal);
  if (isNaN(start.getTime())) return null;

  const [hours, minutes] = endTime.split(':').map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;

  const end = new Date(start);
  end.setHours(hours, minutes, 0, 0);
  if (end <= start) end.setDate(end.getDate() + 1);
  return end.toISOString();
}

/** "19:00" plus 2.5 hours → "21:30", wrapping around midnight. */
export function addHoursToTime(time: string, hours: number): string {
  const [h, m] = time.split(':').map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return time;
  const total = (h * 60 + m + Math.round(hours * 60) + 24 * 60) % (24 * 60);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
}
