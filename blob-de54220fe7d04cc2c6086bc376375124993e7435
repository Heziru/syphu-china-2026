import type { LabObjectId } from "../types/laboratory";

export type LabReviewAsset = Extract<LabObjectId, "microscope" | "computer">;
export type LabReviewView = "ref" | "side" | "back";

export type LabReviewState = {
  active: boolean;
  asset: LabReviewAsset | null;
  view: LabReviewView;
};

/** Shared ?labReview=<asset>&view= parsing. Microscope-only callers can ignore asset. */
export function readLabReviewState(): LabReviewState {
  if (typeof window === "undefined") {
    return { active: false, asset: null, view: "ref" };
  }
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("labReview");
  const asset = raw === "microscope" || raw === "computer" ? raw : null;
  const viewParam = params.get("view");
  const view: LabReviewView =
    viewParam === "side" || viewParam === "back" ? viewParam : "ref";
  return {
    active: asset !== null,
    asset,
    view,
  };
}
