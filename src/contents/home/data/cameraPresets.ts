import type { CameraShot } from "../types/laboratory";

export const OVERVIEW_CAMERA = {
  desktop: {
    position: [5.6, 4.8, 7.2],
    target: [0, 1.05, -0.15],
  },
  mobile: {
    position: [4.6, 5.4, 8.0],
    target: [0, 1.2, 0.1],
  },
} as const satisfies { desktop: CameraShot; mobile: CameraShot };

export const ENTER_CAMERA_OFFSET = 2.4;
