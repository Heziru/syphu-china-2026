import type { CameraShot } from "../types/laboratory";

export const OVERVIEW_CAMERA = {
  desktop: {
    position: [4.05, 3.15, 5.05],
    target: [0.35, 0.95, 0.05],
  },
  mobile: {
    position: [2.55, 3.55, 5.35],
    target: [0.12, 1.02, 0.28],
  },
} as const satisfies { desktop: CameraShot; mobile: CameraShot };

export const ENTER_CAMERA_OFFSET = 1.6;
