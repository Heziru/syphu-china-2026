import { useEffect, useState, type RefObject } from "react";

/**
 * Scroll progress through a tall scene (0 at top enter → 1 at bottom exit).
 * Uses rAF-throttled scroll; no per-frame getBoundingClientRect storms.
 */
export function useSceneProgress(
  ref: RefObject<HTMLElement | null>,
  enabled = true,
) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setProgress(0.5);
      return;
    }

    let raf = 0;
    let last = -1;

    const measure = () => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const viewH = window.innerHeight || 1;
      const travel = Math.max(1, rect.height - viewH);
      const raw = (-rect.top) / travel;
      const next = Math.min(1, Math.max(0, raw));
      const rounded = Math.round(next * 80) / 80;
      if (rounded !== last) {
        last = rounded;
        setProgress(rounded);
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [enabled, ref]);

  return progress;
}

/** Map scene progress → opacity with enter / hold / exit. */
export function sceneOpacity(
  progress: number,
  enterEnd = 0.18,
  exitStart = 0.72,
): number {
  if (progress <= 0) return 0;
  if (progress < enterEnd) return progress / enterEnd;
  if (progress <= exitStart) return 1;
  if (progress >= 1) return 0;
  return 1 - (progress - exitStart) / (1 - exitStart);
}

/** Local 0–1 within a window of the scene. */
export function windowProgress(
  progress: number,
  start: number,
  end: number,
): number {
  if (end <= start) return 0;
  return Math.min(1, Math.max(0, (progress - start) / (end - start)));
}

/** Opacity that peaks in the middle of a window (enter then exit). */
export function pulseOpacity(
  progress: number,
  start: number,
  end: number,
): number {
  const t = windowProgress(progress, start, end);
  if (t <= 0 || t >= 1) return 0;
  if (t < 0.25) return t / 0.25;
  if (t > 0.75) return (1 - t) / 0.25;
  return 1;
}
