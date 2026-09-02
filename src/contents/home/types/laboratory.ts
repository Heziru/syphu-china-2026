export type LabPhase =
  | "loading"
  | "entering"
  | "idle"
  | "focusing"
  | "transitioning"
  | "fallback";

export type QualityTier = "desktop" | "mobile" | "low";

export type HoverAnim = "highlight" | "scale";
export type ClickAnim = "pulse";

export type CameraShot = {
  position: [number, number, number];
  target: [number, number, number];
};

export type ChapterId =
  | "model"
  | "experiments"
  | "team"
  | "human-practices"
  | "description";

export type LabObjectId =
  | "computer"
  | "microscope"
  | "researcher"
  | "bookshelf"
  | "device";

export type ChapterDef = {
  id: ChapterId;
  path: string;
  name: string;
  nameZh: string;
  summary: string;
};

export type LabObjectDef = {
  id: LabObjectId;
  name: string;
  nameZh: string;
  description: string;
  chapterId: ChapterId;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  hitSize: [number, number, number];
  hitOffset: [number, number, number];
  camera: { desktop: CameraShot; mobile: CameraShot };
  hoverAnim: HoverAnim;
  clickAnim: ClickAnim;
  placeholder: "geometry";
};

export type EvidenceStatus =
  | "proposed"
  | "literature-supported"
  | "in-progress"
  | "validated";
