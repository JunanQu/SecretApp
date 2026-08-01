export type DateOption = {
  id: string;
  /** e.g. "Dinner at that ramen place" — optional flavor text */
  label: string;
  /** ISO 8601 datetime string */
  iso: string;
  /** ISO 8601 datetime string for when it wraps up — optional */
  endIso?: string | null;
  /** id from `lib/activities` (concert, movie, museum…) — optional */
  activity?: string | null;
};

export type InvitePublic = {
  slug: string;
  fromName: string;
  toName: string;
  message: string;
  theme: string;
  /** e.g. "Tartine Bakery, San Francisco" */
  location: string | null;
  dateOptions: DateOption[];
};
