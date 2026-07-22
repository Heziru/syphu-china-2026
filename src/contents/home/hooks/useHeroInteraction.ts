import { useCallback, useEffect, useRef } from "react";
import { useFistGesture } from "./useFistGesture";

type Options = {
  reducedMotion: boolean;
  /** When true, auto-request camera once on mount. */
  autoStart?: boolean;
};

/**
 * Camera-fist-only interaction bus for the Home hero.
 * Pointer / keyboard / touch hold paths have been removed.
 */
export function useHeroInteraction({
  reducedMotion,
  autoStart = true,
}: Options) {
  const fist = useFistGesture();
  const startedRef = useRef(false);

  useEffect(() => {
    if (reducedMotion || !autoStart) return;
    // Allow StrictMode remount to call enable again (startedRef resets per mount).
    if (startedRef.current) return;
    startedRef.current = true;
    void fist.enable();
    return () => {
      startedRef.current = false;
    };
  }, [autoStart, fist, reducedMotion]);

  const disableGesture = useCallback(() => {
    fist.disable();
  }, [fist]);

  return {
    fist,
    interactionActive: fist.fistStable,
    enableGesture: fist.enable,
    disableGesture,
    resumePlayback: fist.resumePlayback,
    completeAndStop: fist.completeAndStop,
    checkPermission: fist.checkPermission,
  };
}
