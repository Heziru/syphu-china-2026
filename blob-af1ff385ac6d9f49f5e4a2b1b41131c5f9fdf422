export type Point = { x: number; y: number };

export type ShardLayer = "background" | "midground" | "foreground";

/** Logo placement in CSS pixels — single source of truth for shards + clean logo. */
export type LogoLayout = {
  x: number;
  y: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
};

export type LogoShard = {
  /**
   * Polygon vertices relative to assembled shard center,
   * in logo-normalized space (fractions of logo width / height).
   */
  localPolygon: Point[];
  /** Assembled center in logo-normalized coords (0–1). */
  localCenterX: number;
  localCenterY: number;
  /** Scattered position as normalized viewport coords (0–1). */
  scatterNX: number;
  scatterNY: number;
  scatterRotation: number;
  scatterScale: number;
  delay: number;
  layer: ShardLayer;
};

export type AssemblyPhase =
  | "scattered"
  | "scatteredError"
  | "assembling"
  | "returning"
  | "assembled"
  | "logoReveal"
  | "quoteTyping"
  | "quoteHold"
  | "quoteFade"
  | "completed";

export const HOLD_DURATION_MS = 2200;
/** Hold fully assembled shards before soft reveal begins. */
export const HOLD_SETTLE_MS = 260;
/** Soft crossfade duration (shard → clean logo), opacity only. */
export const REVEAL_MS = 1000;
export const QUOTE_DELAY_MS = 450;
export const QUOTE_HOLD_MS = 2400;
export const QUOTE_FADE_MS = 950;
export const RELEASE_MS = 800;

/** Snap shards to exact target when progress is this high. */
export const SNAP_PROGRESS = 0.995;

export const DEBUG_LOGO_ALIGNMENT =
  import.meta.env.DEV && false;
