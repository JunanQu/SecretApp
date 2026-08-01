/**
 * Times the invitee suggests back. Stored as JSON on the Response row — older
 * rows hold plain ISO strings, newer ones `{ iso, endIso }`, so every read
 * goes through `normalizeProposedTimes`.
 */
export type ProposedTime = {
  iso: string;
  endIso: string | null;
};

function toIso(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date.toISOString();
}

/** Accepts a raw JSON value of either shape and drops anything unparseable. */
export function normalizeProposedTimes(raw: unknown): ProposedTime[] {
  if (!Array.isArray(raw)) return [];
  const times: ProposedTime[] = [];
  for (const entry of raw) {
    if (typeof entry === 'string') {
      const iso = toIso(entry);
      if (iso) times.push({ iso, endIso: null });
      continue;
    }
    if (typeof entry === 'object' && entry !== null) {
      const { iso: rawIso, endIso: rawEndIso } = entry as {
        iso?: unknown;
        endIso?: unknown;
      };
      const iso = toIso(rawIso);
      if (!iso) continue;
      const endIso = toIso(rawEndIso);
      times.push({
        iso,
        endIso: endIso && new Date(endIso) > new Date(iso) ? endIso : null,
      });
    }
  }
  return times;
}
