import type { CameraShot } from "../../types/laboratory";

export type LaminarHoodReviewView = "ref" | "side" | "back";

export const LAMINAR_HOOD_REVIEW_SHOTS: Record<LaminarHoodReviewView, CameraShot> = {
  ref: { position: [1.38, 1.02, 1.72], target: [0.0, 0.98, 0.0] },
  side: { position: [2.05, 0.95, 0.05], target: [0.0, 0.96, -0.02] },
  back: { position: [0.0, 1.0, -2.05], target: [0.0, 0.96, -0.04] },
};
