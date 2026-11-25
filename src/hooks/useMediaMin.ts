import { useEffect, useState } from 'react';

function supportsMatchMedia(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function';
}

/**
 * True when the viewport is at least `px` CSS pixels wide.
 *
 * SSR / jsdom safe: defaults to `false` when `window.matchMedia` is unavailable,
 * so narrow-viewport behaviour (navigate to the full-page record) is the default
 * in unit tests.
 */
export function useMediaMin(px: number): boolean {
  const query = `(min-width: ${px}px)`;
  const [matches, setMatches] = useState(
    () => (supportsMatchMedia() ? window.matchMedia(query).matches : false),
  );

  useEffect(() => {
    if (!supportsMatchMedia()) {
      return undefined;
    }
    const mq = window.matchMedia(query);
    const sync = () => setMatches(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, [query]);

  return matches;
}
