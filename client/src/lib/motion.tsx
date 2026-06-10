/**
 * motion.tsx — shared premium-motion helpers.
 * Lightweight count-up hook + reusable framer-motion variants so every
 * surface animates with one consistent vocabulary. Honors reduced-motion.
 */

import { useEffect, useRef, useState } from "react";
import type { Variants } from "framer-motion";

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Smoothly animates a number from its previous value to `target`. */
export function useCountUp(target: number, duration = 720): number {
  const [val, setVal] = useState(target);
  const fromRef = useRef(target);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = fromRef.current;
    if (prefersReducedMotion() || from === target) {
      setVal(target);
      fromRef.current = target;
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setVal(from + (target - from) * eased);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return val;
}

/**
 * Renders a stat that may carry a leading integer, e.g. "12", "3/7", "5 lanes".
 * The leading integer counts up; any trailing text is preserved verbatim.
 */
export function CountUp({
  value,
  className,
  duration,
}: {
  value: string | number;
  className?: string;
  duration?: number;
}) {
  const str = String(value);
  const match = str.match(/^(\d+)([\s\S]*)$/);
  const target = match ? parseInt(match[1], 10) : NaN;
  const animated = useCountUp(Number.isNaN(target) ? 0 : target, duration);
  if (!match || Number.isNaN(target)) return <span className={className}>{str}</span>;
  return (
    <span className={className}>
      <span className="num tabular-nums">{Math.round(animated)}</span>
      {match[2]}
    </span>
  );
}

// ── Shared timing tokens ────────────────────────────────────────────────────
// One source of truth so every surface animates with the same character.

export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];   // smooth ease-out (matches --motion-ease)
export const EASE_IN: [number, number, number, number] = [0.4, 0, 1, 1];     // accelerate-in for exits

// Springs — entrances are gently underdamped; pills/ticks snappier.
export const springSoft = { type: "spring" as const, stiffness: 360, damping: 30 }; // list / card entrances
export const springPop  = { type: "spring" as const, stiffness: 420, damping: 26 }; // hero cards / toasts
export const springTick = { type: "spring" as const, stiffness: 520, damping: 20 }; // check-mark pops
export const pillSpring  = { type: "spring" as const, stiffness: 480, damping: 38 }; // layoutId pill indicators

// Tween presets — keyed off the shared ease.
export const tEase     = { duration: 0.28, ease: EASE };               // crossfades, section / page swaps
export const tEaseFast = { duration: 0.16, ease: EASE };               // small status crossfades
export const tPanel    = { duration: 0.3,  ease: EASE };               // larger panel slide-ins
export const tBar      = { duration: 0.6,  ease: EASE };               // bar / progress fills
export const tHeight   = { duration: 0.26, ease: EASE };               // height expand / collapse

// ── Reusable variants ─────────────────────────────────────────────────────────

export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.055, delayChildren: 0.04 },
  },
};

export const fadeUpItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: springSoft },
};

export const popItem: Variants = {
  hidden: { opacity: 0, scale: 0.94, y: 6 },
  show: { opacity: 1, scale: 1, y: 0, transition: springPop },
};

/** Crossfade + lift used when switching tab content. */
export const tabSwap: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: tEase },
  exit: { opacity: 0, y: -6, transition: { duration: 0.16, ease: EASE_IN } },
};
