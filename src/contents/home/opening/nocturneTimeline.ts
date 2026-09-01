/** 10s 开屏叙事：星尘 → 银河带 → 人体轮廓（人体即小宇宙） */
export const DURATION = 10;

export type Phase = "scatter" | "band" | "body";

export type Keyframe = {
  t: number;
  phase: Phase;
  camZ: number;
  rotX: number;
};

export const KEYFRAMES: Keyframe[] = [
  { t: 0, phase: "scatter", camZ: 38, rotX: 0.08 },
  { t: 2, phase: "band", camZ: 36, rotX: 0.28 },
  { t: 4.5, phase: "band", camZ: 35, rotX: 0.26 },
  { t: 5.5, phase: "body", camZ: 33, rotX: 0.06 },
  { t: 8, phase: "body", camZ: 31.5, rotX: 0.04 },
  { t: 10, phase: "body", camZ: 31.5, rotX: 0.04 },
];

export type TimelineState = Keyframe & { next: Keyframe; blend: number };

export function sampleTimeline(time: number): TimelineState {
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
  return { ...a, next: b, blend: (t - a.t) / span };
}

/** 当前阶段权重（用于多阶段 morph） */
export function phaseWeight(time: number, phase: Phase): number {
  const { phase: a, next, blend } = sampleTimeline(time);
  const b = next.phase;
  if (a === phase && b === phase) return 1;
  if (a === phase) return 1 - blend;
  if (b === phase) return blend;
  return 0;
}
