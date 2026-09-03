import type { LabObjectId } from "../types/laboratory";

/** Review keys may use design asset names (e.g. bioreactor) while runtime id stays device. */
export type LabReviewAsset =
  | Extract<LabObjectId, "microscope" | "computer" | "researcher">
  | "bioreactor"
  | "glassware-station"
  | "analytical-balance";
export type LabReviewView = "ref" | "side" | "back";

export type LabReviewState = {
  active: boolean;
  asset: LabReviewAsset | null;
  view: LabReviewView;
};

/** Shared ?labReview=<asset>&view= parsing. Additive; microscope/computer unchanged. */
export function readLabReviewState(): LabReviewState {
  if (typeof window === "undefined") {
    return { active: false, asset: null, view: "ref" };
  }
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("labReview");
  const asset =
    raw === "microscope" ||
    raw === "computer" ||
    raw === "bioreactor" ||
    raw === "researcher" ||
    raw === "glassware-station" ||
    raw === "analytical-balance"
      ? raw
      : null;
  const viewParam = params.get("view");
  const view: LabReviewView =
    viewParam === "side" || viewParam === "back" ? viewParam : "ref";
  return {
    active: asset !== null,
    asset,
    view,
  };
}
