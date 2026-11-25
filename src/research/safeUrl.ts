/**
 * Only allow http(s) for clickable external primary-source links.
 * Non-http schemes are preserved as plain text, never as href targets.
 */
export function isSafeHttpUrl(raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed) {
    return false;
  }
  try {
    const url = new URL(trimmed);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}
