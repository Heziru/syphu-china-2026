import type { CameraShot } from "../../types/laboratory";

export type ResearcherReviewView = "ref" | "side" | "back";

/** Review-only cameras for ?labReview=researcher. Does not touch labObjects.camera. */
export const RESEARCHER_REVIEW_SHOTS: Record<ResearcherReviewView, CameraShot> =
  {
    ref: { position: [1.6, 1.12, 4.35], target: [0.0, 0.85, 0.02] },
    side: { position: [4.65, 0.95, 0.02], target: [0.0, 0.85, 0.02] },
    back: { position: [0.0, 0.95, -4.65], target: [0.0, 0.85, 0.0] },
  };
