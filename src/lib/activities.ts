/**
 * Date activities offered in the create form. Picking one fills in a sensible
 * start time and duration, and the emoji follows the option everywhere it is
 * shown (invite card, manage page, notification email, calendar entry).
 */
export type Activity = {
  id: string;
  /** lowercase label used inside sentences, e.g. "· movie" */
  name: string;
  emoji: string;
  /** default start time as HH:MM (24h) */
  time: string;
  /** default length in hours, used to prefill the end time */
  durationHours: number;
};

export const activities: Activity[] = [
  { id: 'brunch', name: 'brunch', emoji: '🥐', time: '11:00', durationHours: 1.5 },
  { id: 'coffee', name: 'coffee', emoji: '☕', time: '15:00', durationHours: 1 },
  { id: 'museum', name: 'museum', emoji: '🏛️', time: '14:00', durationHours: 2 },
  { id: 'movie', name: 'movie', emoji: '🎬', time: '19:30', durationHours: 2.5 },
  { id: 'dinner', name: 'dinner', emoji: '🍽️', time: '19:00', durationHours: 2 },
  { id: 'concert', name: 'concert', emoji: '🎤', time: '20:00', durationHours: 3 },
  { id: 'drinks', name: 'drinks', emoji: '🍸', time: '21:00', durationHours: 2 },
];

export const activityIds = activities.map((a) => a.id);

export function getActivity(id?: string | null): Activity | null {
  if (!id) return null;
  return activities.find((a) => a.id === id) ?? null;
}
