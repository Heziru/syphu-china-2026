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

/** How the station mesh is produced at runtime. */
export type ModelSource = "procedural" | "gltf" | "placeholder";

export type LabObjectCategory =
  | "equipment"
  | "workstation"
  | "character"
  | "archive"
  | "device";

/** Wiki-facing entry metadata (stable id + route); keep route aligned with CHAPTERS. */
export type LabObjectMetadata = {
  id: LabObjectId;
  name: string;
  route: string;
  category: LabObjectCategory;
  description: string;
};

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
  /** Scene/data mirror of model registry; InteractiveObject ignores this. */
  modelSource: ModelSource;
  category: LabObjectCategory;
  metadata: LabObjectMetadata;
};

export type EvidenceStatus =
  | "proposed"
  | "literature-supported"
  | "in-progress"
  | "validated";
