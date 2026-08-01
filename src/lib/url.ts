/** Anything header-shaped: a request's `Headers`, or Next's readonly headers(). */
type HeaderReader = { get(name: string): string | null };

/**
 * The public origin of the current request — links in emails have to be
 * absolute, and the app has no configured base URL (it runs on localhost in
 * dev and on a Vercel domain in production).
 */
export function originFromHeaders(headers: HeaderReader): string {
  const host =
    headers.get('x-forwarded-host') ?? headers.get('host') ?? 'localhost:3000';
  const proto =
    headers.get('x-forwarded-proto') ??
    (host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https');
  return `${proto}://${host}`;
}
