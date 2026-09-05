import type { CameraShot } from "../../types/laboratory";

export type LaminarHoodReviewView = "ref" | "side" | "back";

export const LAMINAR_HOOD_REVIEW_SHOTS: Record<
  LaminarHoodReviewView,
  CameraShot
> = {
  ref: { position: [2.3, 1.35, 3.1], target: [0.0, 0.87, 0.0] },
  side: { position: [3.95, 1.0, 0.05], target: [0.0, 0.87, -0.02] },
  back: { position: [0.0, 1.05, -3.95], target: [0.0, 0.87, -0.04] },
};
