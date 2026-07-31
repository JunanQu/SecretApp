export type DateOption = {
  id: string;
  /** e.g. "Dinner at that ramen place" — optional flavor text */
  label: string;
  /** ISO 8601 datetime string */
  iso: string;
};

export type InvitePublic = {
  slug: string;
  fromName: string;
  toName: string;
  message: string;
  theme: string;
  dateOptions: DateOption[];
};
