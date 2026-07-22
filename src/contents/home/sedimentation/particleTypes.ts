export type ParticleKind =
  | "bacillus"
  | "plasmid"
  | "dna"
  | "membrane"
  | "inflam"
  | "network"
  | "datum";

export type Vec2 = { x: number; y: number };

export type Particle = {
  id: number;
  kind: ParticleKind;
  /** Normalized home position (0–1) */
  home: Vec2;
  /** Current position in CSS pixels */
  pos: Vec2;
  vel: Vec2;
  depth: number;
  size: number;
  rotation: number;
  spin: number;
  alpha: number;
  hueShift: number;
  /** Index into silhouette anchors; -1 = stay peripheral */
  anchorIndex: number;
  /** How strongly this particle joins the structure (0–1) */
  loyalty: number;
  trail: Vec2[];
};

export type SilhouetteAnchor = {
  x: number;
  y: number;
  weight: number;
  role: "gut" | "network" | "core" | "fringe" | "glyph";
};

export type SedimentLayer = {
  points: Vec2[];
  age: number;
  strength: number;
};

export type SimConfig = {
  particleCount: number;
  maxSedimentLayers: number;
  maxDpr: number;
  trailLength: number;
  showTrails: boolean;
};

export const DESKTOP_SIM: SimConfig = {
  particleCount: 86,
  maxSedimentLayers: 2,
  maxDpr: 1.75,
  trailLength: 4,
  showTrails: true,
};

export const MOBILE_SIM: SimConfig = {
  particleCount: 48,
  maxSedimentLayers: 2,
  maxDpr: 1.5,
  trailLength: 2,
  showTrails: false,
};
