import type { CameraShot } from "../../types/laboratory";

export type MicroscopeReviewView = "ref" | "side" | "back";

/** Matching the attached illustration: front-left three-quarter, slightly down. */
export const MICROSCOPE_REVIEW_SHOTS: Record<MicroscopeReviewView, CameraShot> = {
  ref: { position: [1.55, 1.42, 2.15], target: [0.0, 0.5, 0.04] },
  side: { position: [2.15, 0.55, 0.05], target: [0, 0.5, 0.02] },
  back: { position: [0.02, 0.7, -2.15], target: [0, 0.5, 0.0] },
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
