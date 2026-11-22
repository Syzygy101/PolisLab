import { useEffect } from 'react';

const BASE = 'PolisLab';

/** Sets document.title for the current route; restores base title on unmount. */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    const previous = document.title;
    document.title = title.includes(BASE) ? title : `${title} · ${BASE}`;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
