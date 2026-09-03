import type { CameraShot } from "../../types/laboratory";

export type LaminarHoodReviewView = "ref" | "side" | "back";

export const LAMINAR_HOOD_REVIEW_SHOTS: Record<LaminarHoodReviewView, CameraShot> = {
  ref: { position: [1.42, 1.08, 1.78], target: [0.0, 1.02, 0.0] },
  side: { position: [2.1, 1.0, 0.05], target: [0.0, 0.98, -0.02] },
  back: { position: [0.0, 1.05, -2.1], target: [0.0, 0.98, -0.04] },
};
