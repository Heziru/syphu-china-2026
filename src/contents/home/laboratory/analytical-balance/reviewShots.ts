import type { CameraShot } from "../../types/laboratory";

export type AnalyticalBalanceReviewView = "ref" | "side" | "back";

/** Review-only cameras for ?labReview=analytical-balance. */
export const ANALYTICAL_BALANCE_REVIEW_SHOTS: Record<AnalyticalBalanceReviewView, CameraShot> = {
  ref: { position: [1.15, 0.78, 1.25], target: [0.0, 0.22, 0.0] },
  side: { position: [1.75, 0.48, 0.05], target: [0.0, 0.2, 0.0] },
  back: { position: [0.0, 0.55, -1.55], target: [0.0, 0.22, 0.0] },
};
