import type { CameraShot } from "../../types/laboratory";

export type ResearcherReviewView = "ref" | "side" | "back";

/** Review-only cameras for ?labReview=researcher. Does not touch labObjects.camera. */
export const RESEARCHER_REVIEW_SHOTS: Record<ResearcherReviewView, CameraShot> = {
  ref: { position: [1.15, 1.35, 1.55], target: [0.0, 0.85, 0.05] },
  side: { position: [2.05, 0.95, 0.1], target: [0.0, 0.85, 0.05] },
  back: { position: [0.1, 1.05, -1.85], target: [0.0, 0.85, 0.0] },
};
