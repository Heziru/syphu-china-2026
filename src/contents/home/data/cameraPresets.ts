import type { CameraShot } from "../types/laboratory";

/** Phase 3.7 — tuned after deeper footprint + wall-anchored layout. */
export const OVERVIEW_CAMERA = {
  desktop: {
    position: [8.85, 6.35, 9.65],
    target: [-0.05, 0.62, 0.45],
  },
  mobile: {
    position: [6.4, 6.55, 8.85],
    target: [0, 0.66, 0.55],
  },
} as const satisfies { desktop: CameraShot; mobile: CameraShot };

export const ENTER_CAMERA_OFFSET = 1.6;
