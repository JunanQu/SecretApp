/**
 * Access codes gate invite creation (and the AI writer). They are stored in
 * the ACCESS_CODES env var as a comma-separated list, e.g. "code-one,code-two".
 * If ACCESS_CODES is unset, creation is open (useful for local dev).
 */
export function isValidAccessCode(code: unknown): boolean {
  const raw = process.env.ACCESS_CODES;
  if (!raw || !raw.trim()) return true;
  if (typeof code !== 'string') return false;
  const allowed = raw
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean);
  return allowed.includes(code.trim());
}
