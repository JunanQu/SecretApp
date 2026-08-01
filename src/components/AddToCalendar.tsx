'use client';

import {
  buildDateEvent,
  downloadIcs,
  toGoogleCalendarUrl,
  type CalendarEvent,
} from '@/lib/calendar';

type Props = {
  withName: string;
  startIso: string;
  endIso?: string | null;
  message?: string;
  label?: string;
  location?: string;
  /** activity id from lib/activities */
  activity?: string | null;
  /** Align buttons under centered or left-aligned time chips */
  align?: 'center' | 'start';
  className?: string;
};

const linkClass =
  'rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-medium text-neutral-800 shadow-sm transition hover:bg-neutral-50';

export default function AddToCalendar({
  withName,
  startIso,
  endIso,
  message,
  label,
  location,
  activity,
  align = 'start',
  className = '',
}: Props) {
  const event: CalendarEvent = buildDateEvent({
    withName,
    startIso,
    endIso,
    message,
    label,
    location,
    activity,
  });
  const googleUrl = toGoogleCalendarUrl(event);

  return (
    <div
      className={`mt-1.5 flex flex-wrap gap-2 ${
        align === 'center' ? 'justify-center' : 'justify-start'
      } ${className}`}
    >
      <a
        href={googleUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={linkClass}
      >
        Google Calendar
      </a>
      <button
        type="button"
        onClick={() =>
          downloadIcs(
            event,
            `date-with-${withName.toLowerCase().replace(/\s+/g, '-')}.ics`,
          )
        }
        className={linkClass}
      >
        Apple Calendar
      </button>
    </div>
  );
}
