import type { CameraShot } from "../../types/laboratory";

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

export function readLabReview() {
  if (typeof window === "undefined") {
    return { active: false, view: "ref" as MicroscopeReviewView };
  }
  const params = new URLSearchParams(window.location.search);
  const view = params.get("view");
  return {
    active: params.get("labReview") === "microscope",
    view: view === "side" || view === "back" ? view : ("ref" as MicroscopeReviewView),
  };
}
