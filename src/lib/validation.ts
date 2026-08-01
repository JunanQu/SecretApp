const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Deliberately loose — the mail provider is the real judge. */
export function isValidEmail(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= 254 && EMAIL_RE.test(trimmed);
}
