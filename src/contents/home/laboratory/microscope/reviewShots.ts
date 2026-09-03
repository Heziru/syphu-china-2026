import type { CameraShot } from "../../types/laboratory";
import { readLabReviewState } from "../labReview";

export type MicroscopeReviewView = "ref" | "side" | "back";

/**
 * Review-only cameras for ?labReview=microscope.
 * Formal scene cameras stay in labObjects.ts / CameraController overview path.
 */
export const MICROSCOPE_REVIEW_SHOTS: Record<MicroscopeReviewView, CameraShot> = {
  // A. 3/4 — binocular head, C-arm, stage, turret
  ref: { position: [1.35, 1.15, 1.85], target: [0.0, 0.52, 0.06] },
  // B. Side — C opening, focus knob, eyepiece angle (pull back so head is not cropped)
  side: { position: [2.35, 0.58, 0.12], target: [0, 0.48, 0.05] },
  // C. Back — arm thickness, base proportion
  back: { position: [0.0, 0.68, -2.15], target: [0, 0.46, 0.02] },
};

/** Backward-compatible reader: active only when labReview=microscope. */
export function readLabReview() {
  const state = readLabReviewState();
  return {
    active: state.asset === "microscope",
    view: state.view as MicroscopeReviewView,
  };
}
