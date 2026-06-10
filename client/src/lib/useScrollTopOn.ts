/**
 * useScrollTopOn.ts — scroll a container back to the top when a key changes.
 *
 * Views keep one scroll container alive while their content switches underneath
 * (week pagination, board pages, brief sections, dashboard tabs). Without a
 * reset, the old scroll position carries over and the new content appears
 * scrolled halfway down. Attach the returned ref to the scroll container and
 * pass the switching value as the key.
 *
 * The first render is skipped on purpose: fresh mounts already start at the
 * top, and views that remember state across remounts (e.g. the Ideas board's
 * remembered page) must not be yanked to the top just for mounting.
 */

import { useEffect, useRef } from "react";

export function useScrollTopOn<T extends HTMLElement = HTMLDivElement>(key: unknown) {
  const ref = useRef<T | null>(null);
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return; }
    ref.current?.scrollTo({ top: 0 });
  }, [key]);
  return ref;
}
