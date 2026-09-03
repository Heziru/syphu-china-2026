import type { CameraShot } from "../../types/laboratory";

export type ComputerReviewView = "ref" | "side" | "back";

/** Review-only cameras for ?labReview=computer. Does not touch labObjects.camera. */
export const COMPUTER_REVIEW_SHOTS: Record<ComputerReviewView, CameraShot> = {
  ref: { position: [1.55, 1.35, 1.65], target: [0.0, 0.28, 0.0] },
  side: { position: [2.2, 0.55, 0.15], target: [0, 0.28, 0.0] },
  back: { position: [0.1, 0.7, -1.9], target: [0, 0.28, 0.0] },
};
