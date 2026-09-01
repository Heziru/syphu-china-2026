import { smoothstep } from "./nocturneMath";

/** 10s 循环 — 设计稿分镜 */
export const DURATION = 10;

export const MARKS = {
  bandEnd: 2,
  bodyFormed: 5.5,
  gutLit: 7,
  loop: 10,
} as const;

/** 0–2s：水平银河带 */
export function bandWeight(time: number) {
  const t = ((time % DURATION) + DURATION) % DURATION;
  if (t <= MARKS.bandEnd) return 1;
  if (t >= MARKS.bodyFormed) return 0;
  return 1 - smoothstep((t - MARKS.bandEnd) / (MARKS.bodyFormed - MARKS.bandEnd));
}

/** 2–5.5s：聚合成人体 */
export function bodyWeight(time: number) {
  const t = ((time % DURATION) + DURATION) % DURATION;
  if (t <= MARKS.bandEnd) return 0;
  if (t >= MARKS.bodyFormed) return 1;
  return smoothstep((t - MARKS.bandEnd) / (MARKS.bodyFormed - MARKS.bandEnd));
}

/** 5.5–7s：腹腔变红 */
export function gutRedWeight(time: number) {
  const t = ((time % DURATION) + DURATION) % DURATION;
  if (t <= MARKS.bodyFormed) return 0;
  if (t >= MARKS.gutLit) return 1;
  return smoothstep((t - MARKS.bodyFormed) / (MARKS.gutLit - MARKS.bodyFormed));
}

/** 7s+：稳定态呼吸增强 */
export function stableWeight(time: number) {
  const t = ((time % DURATION) + DURATION) % DURATION;
  if (t <= MARKS.gutLit) return 0;
  return smoothstep((t - MARKS.gutLit) / 1.2);
}

export function sampleCamera(time: number) {
  const t = ((time % DURATION) + DURATION) % DURATION;
  const bw = bodyWeight(t);
  return {
    camZ: 30 - bw * 7,
    rotX: 0.28 - bw * 0.22,
  };
}
