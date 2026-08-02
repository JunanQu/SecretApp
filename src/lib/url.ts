/** Anything header-shaped: a request's `Headers`, or Next's readonly headers(). */
type HeaderReader = { get(name: string): string | null };

/** `APP_BASE_URL`, if it is set to something that looks like an origin. */
function configuredOrigin(): string | null {
  const raw = process.env.APP_BASE_URL?.trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    return url.origin;
  } catch {
    console.warn('APP_BASE_URL is not a valid URL — falling back to request headers');
    return null;
  }
}

/**
 * The origin to build absolute links from (invite emails need them).
 *
 * `APP_BASE_URL` wins when it is set. Otherwise we read the request headers,
 * which a direct caller can spoof — so anywhere the resulting link is emailed
 * to someone else, set `APP_BASE_URL` and the header path never applies.
 */
export function originFromHeaders(headers: HeaderReader): string {
  const configured = configuredOrigin();
  if (configured) return configured;

  const host =
    headers.get('x-forwarded-host') ?? headers.get('host') ?? 'localhost:3000';
  const proto =
    headers.get('x-forwarded-proto') ??
    (host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https');
  return `${proto}://${host}`;
}
