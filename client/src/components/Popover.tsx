/**
 * Popover.tsx — anchored, flip-aware dropdown surface rendered in a portal.
 *
 * Why this exists: the Ideas board renders its action menus and filter
 * dropdowns inside an `overflow-y-auto` scroll container. A plain
 * `absolute` menu gets clipped by that container near the bottom of the
 * viewport, and it floats away from its button when the list scrolls.
 *
 * Rendering into a portal at fixed coordinates (computed from the anchor's
 * bounding rect) sidesteps the clipping entirely, and we flip the menu above
 * the anchor when there isn't enough room below. The popover closes on outside
 * pointerdown, on scroll, on resize, and on Escape.
 */

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Align = "left" | "right";

type PopoverProps = {
  anchorRef: React.RefObject<HTMLElement>;
  open: boolean;
  onClose: () => void;
  /** Horizontal edge of the menu aligned to the anchor. */
  align?: Align;
  /** Gap in px between anchor and menu. */
  offset?: number;
  /** Width of the menu in px. If omitted, sizes to content (with a min). */
  width?: number;
  className?: string;
  style?: React.CSSProperties;
  /** Forwarded to the surface so callers can wire role/aria/id. */
  surfaceProps?: React.HTMLAttributes<HTMLDivElement> & Record<string, unknown>;
  /** Optional external ref to the surface element (e.g. for scroll-into-view). */
  forwardSurfaceRef?: React.RefObject<HTMLDivElement>;
  children: React.ReactNode;
};

type Coords = { top: number; left: number; placement: "top" | "bottom"; maxHeight: number };

export default function Popover({
  anchorRef, open, onClose, align = "left", offset = 6,
  width, className = "", style, surfaceProps, forwardSurfaceRef, children,
}: PopoverProps) {
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const setSurface = (node: HTMLDivElement | null) => {
    surfaceRef.current = node;
    if (forwardSurfaceRef) {
      (forwardSurfaceRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    }
  };
  const [coords, setCoords] = useState<Coords | null>(null);

  const measure = useCallback(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const r = anchor.getBoundingClientRect();
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const menuH = surfaceRef.current?.offsetHeight ?? 0;
    const menuW = surfaceRef.current?.offsetWidth ?? width ?? r.width;

    const spaceBelow = vh - r.bottom;
    const spaceAbove = r.top;
    // Flip up only when there isn't room below AND there's more room above.
    const placeTop = spaceBelow < menuH + offset + 8 && spaceAbove > spaceBelow;

    const top = placeTop ? Math.max(8, r.top - menuH - offset) : r.bottom + offset;
    const maxHeight = Math.max(120, (placeTop ? spaceAbove : spaceBelow) - offset - 8);

    let left = align === "right" ? r.right - menuW : r.left;
    // Keep within the viewport horizontally.
    left = Math.min(Math.max(8, left), vw - menuW - 8);

    setCoords({ top, left, placement: placeTop ? "top" : "bottom", maxHeight });
  }, [anchorRef, align, offset, width]);

  // Measure before paint to avoid a flash at the wrong spot.
  useLayoutEffect(() => {
    if (!open) { setCoords(null); return; }
    measure();
    // Re-measure once after the surface has its real dimensions.
    const id = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(id);
  }, [open, measure]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (surfaceRef.current?.contains(t)) return;
      if (anchorRef.current?.contains(t)) return;
      onClose();
    };
    const onScroll = (e: Event) => {
      const t = e.target as Node | null;
      if (t && surfaceRef.current?.contains(t)) return;
      onClose();
    };
    const onResize = () => onClose();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };

    window.addEventListener("pointerdown", onPointerDown);
    // Capture phase catches outside container scrolls, while internal menu
    // scrolls are ignored above so scrollable popover content stays usable.
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose, anchorRef]);

  if (!open) return null;

  return createPortal(
    <div
      ref={setSurface}
      {...surfaceProps}
      className={className}
      style={{
        position: "fixed",
        top: coords?.top ?? -9999,
        left: coords?.left ?? -9999,
        width,
        maxHeight: coords?.maxHeight,
        overflowY: "auto",
        visibility: coords ? "visible" : "hidden",
        zIndex: 9999,
        ...style,
      }}
    >
      {children}
    </div>,
    document.body,
  );
}
