import type { CameraShot } from "../../types/laboratory";

export type BioreactorReviewView = "ref" | "side" | "back";

/** Review-only cameras for ?labReview=bioreactor. Does not touch labObjects.camera. */
export const BIOREACTOR_REVIEW_SHOTS: Record<BioreactorReviewView, CameraShot> = {
  ref: { position: [1.35, 1.55, 1.75], target: [0.0, 0.75, 0.05] },
  side: { position: [2.05, 0.85, 0.1], target: [0.0, 0.75, 0.05] },
  back: { position: [0.1, 0.95, -1.95], target: [0.0, 0.75, 0.0] },
};
