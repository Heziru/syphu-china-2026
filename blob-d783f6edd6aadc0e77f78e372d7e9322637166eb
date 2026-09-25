import type { CameraShot } from "../../types/laboratory";

export type BioreactorReviewView = "ref" | "side" | "back";

/** Review-only cameras for ?labReview=bioreactor. Does not touch labObjects.camera. */
export const BIOREACTOR_REVIEW_SHOTS: Record<BioreactorReviewView, CameraShot> = {
  ref: { position: [1.45, 1.25, 1.55], target: [0.05, 0.55, 0.0] },
  side: { position: [2.15, 0.7, 0.1], target: [0.0, 0.55, 0.05] },
  back: { position: [0.15, 0.85, -1.85], target: [0.05, 0.55, 0.0] },
};
