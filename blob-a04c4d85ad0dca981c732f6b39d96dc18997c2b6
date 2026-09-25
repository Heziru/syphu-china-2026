export type SceneMode =
  | "scatter"
  | "gather"
  | "band"
  | "disc"
  | "lorenz"
  | "sphereRings"
  | "aizawa"
  | "torus"
  | "galaxy"
  | "cat"
  | "orbit";

export type SceneKeyframe = {
  t: number;
  mode: SceneMode;
  camZ: number;
  rotX: number;
  rotY: number;
  tint: "cool" | "warm" | "purple";
  spread: number;
};

/** Timeline mapped from docs/references/db1a2b5c9cd7a2dc7006882afc4b68a5.mp4 (~71s) */
export const DURATION = 71;

export const KEYFRAMES: SceneKeyframe[] = [
  { t: 0, mode: "scatter", camZ: 42, rotX: 0.08, rotY: 0, tint: "cool", spread: 1.35 },
  { t: 3, mode: "gather", camZ: 40, rotX: 0.12, rotY: 0.04, tint: "cool", spread: 1.1 },
  { t: 6, mode: "band", camZ: 38, rotX: 0.22, rotY: 0.08, tint: "cool", spread: 0.95 },
  { t: 9, mode: "disc", camZ: 36, rotX: 0.55, rotY: 0.12, tint: "cool", spread: 0.9 },
  { t: 12, mode: "disc", camZ: 35, rotX: 0.62, rotY: 0.15, tint: "cool", spread: 0.88 },
  { t: 15, mode: "lorenz", camZ: 34, rotX: 0.48, rotY: 0.2, tint: "warm", spread: 0.85 },
  { t: 18, mode: "gather", camZ: 33, rotX: 0.35, rotY: 0.22, tint: "cool", spread: 0.82 },
  { t: 21, mode: "sphereRings", camZ: 32, rotX: 0.52, rotY: 0.28, tint: "cool", spread: 0.8 },
  { t: 24, mode: "torus", camZ: 31, rotX: 0.45, rotY: 0.32, tint: "cool", spread: 0.78 },
  { t: 27, mode: "lorenz", camZ: 30, rotX: 0.42, rotY: 0.35, tint: "warm", spread: 0.76 },
  { t: 30, mode: "aizawa", camZ: 29, rotX: 0.38, rotY: 0.38, tint: "cool", spread: 0.74 },
  { t: 36, mode: "galaxy", camZ: 28, rotX: 0.3, rotY: 0.42, tint: "cool", spread: 0.72 },
  { t: 42, mode: "galaxy", camZ: 27, rotX: 0.25, rotY: 0.45, tint: "cool", spread: 0.7 },
  { t: 45, mode: "cat", camZ: 26, rotX: 0.2, rotY: 0.48, tint: "cool", spread: 0.68 },
  { t: 51, mode: "cat", camZ: 25, rotX: 0.18, rotY: 0.5, tint: "purple", spread: 0.66 },
  { t: 54, mode: "orbit", camZ: 24, rotX: 0.15, rotY: 0.52, tint: "purple", spread: 0.64 },
  { t: 63, mode: "orbit", camZ: 23, rotX: 0.12, rotY: 0.55, tint: "purple", spread: 0.62 },
  { t: 71, mode: "orbit", camZ: 23, rotX: 0.12, rotY: 0.58, tint: "purple", spread: 0.62 },
];

export type SceneState = SceneKeyframe & {
  next: SceneKeyframe;
  blend: number;
};

export function sampleTimeline(time: number): SceneState {
  const t = ((time % DURATION) + DURATION) % DURATION;
  let a = KEYFRAMES[0]!;
  let b = KEYFRAMES[1]!;
  for (let i = 0; i < KEYFRAMES.length - 1; i++) {
    const cur = KEYFRAMES[i]!;
    const nxt = KEYFRAMES[i + 1]!;
    if (t >= cur.t && t < nxt.t) {
      a = cur;
      b = nxt;
      break;
    }
    if (i === KEYFRAMES.length - 2) {
      a = cur;
      b = nxt;
    }
  }
  const span = Math.max(0.001, b.t - a.t);
  const blend = (t - a.t) / span;
  return { ...a, next: b, blend };
}

export function isDynamic(mode: SceneMode) {
  return mode === "lorenz" || mode === "aizawa";
}
