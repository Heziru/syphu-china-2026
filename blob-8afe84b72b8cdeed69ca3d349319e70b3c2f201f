import { hash, type Vec3 } from "./nocturneMath";
import { phaseWeight, sampleTimeline, type Phase } from "./nocturneTimeline";

/** 近似正态 — 多 uniform 叠加 */
function gauss(i: number, seed: number) {
  let s = 0;
  for (let k = 0; k < 8; k++) s += hash(i, seed + k * 3.7);
  return (s / 8 - 0.5) * 2.6;
}

function inBodySilhouette(x: number, y: number) {
  const head = x * x + (y - 2.05) ** 2 < 0.44 ** 2;
  const torso = (x / 0.92) ** 2 + ((y - 0.1) / 1.5) ** 2 < 1;
  const shoulder =
    y > 0.75 && y < 1.35 && Math.abs(x) < 1.18 && Math.abs(x) > 0.42;
  const hip = y > -1.35 && y < -0.55 && Math.abs(x) < 0.72;
  return head || (torso && y > -1.35 && y < 1.5) || shoulder || hip;
}

/** 0–2s：散落星尘 */
export function scatterPoint(i: number, time: number): Vec3 {
  const drift = Math.sin(time * 1.8 + hash(i, 50) * 6.28) * 0.35;
  return {
    x: (hash(i, 1) - 0.5) * 44 + drift,
    y: (hash(i, 2) - 0.5) * 30 + drift * 0.5,
    z: (hash(i, 3) - 0.5) * 18 - 3,
  };
}

/** 2–5.5s：水平银河带 */
export function bandPoint(i: number, time: number, spread: number): Vec3 {
  const along0 = gauss(i, 1) * 5.8 * spread;
  const cross0 = gauss(i, 2) * 0.72;

  const wave =
    Math.sin(along0 * 0.38 + time * 1.05) * 0.28 +
    Math.sin(along0 * 0.17 - time * 0.55) * 0.14;
  const cross = cross0 + wave;

  const driftX = Math.sin(time * 0.7 + hash(i, 40) * 6.283) * 0.22;
  const driftY = Math.cos(time * 0.6 + hash(i, 41) * 6.283) * 0.1;
  const crawl = Math.sin(time * 1.35 + along0 * 0.5) * 0.06;

  const bulge = Math.exp(-((cross0 / 0.75) ** 2));
  const z = gauss(i, 3) * bulge * 1.6 + Math.sin(time * 0.78 + hash(i, 42) * 6.28) * 0.12;

  return {
    x: along0 + driftX + crawl,
    y: cross + driftY,
    z,
  };
}

/** 5.5–10s：人体轮廓 — 星尘凝为体内小宇宙 */
export function bodyPoint(i: number, time: number, breath: number): Vec3 {
  let x = 0;
  let y = 0;
  for (let k = 0; k < 28; k++) {
    x = (hash(i, 20 + k * 2) - 0.5) * 2.4;
    y = (hash(i, 21 + k * 2) - 0.5) * 4.8 - 0.15;
    if (inBodySilhouette(x, y)) break;
  }
  const pulse = Math.sin(time * 2.8 + hash(i, 43) * 0.5) * 0.015;
  const z = (hash(i, 18) - 0.5) * 0.55 * breath;
  return {
    x: x * breath + pulse,
    y: y * breath + pulse * 0.6,
    z,
  };
}

export function morphPoint(i: number, _n: number, time: number, spread: number): Vec3 {
  const ws = phaseWeight(time, "scatter");
  const wb = phaseWeight(time, "band");
  const wbody = phaseWeight(time, "body");
  const breath = 1 + Math.sin(time * 2.6) * 0.035;

  const s = scatterPoint(i, time);
  const b = bandPoint(i, time, spread);
  const body = bodyPoint(i, time, breath);

  const wSum = ws + wb + wbody;
  if (wSum < 0.001) return b;

  return {
    x: (s.x * ws + b.x * wb + body.x * wbody) / wSum,
    y: (s.y * ws + b.y * wb + body.y * wbody) / wSum,
    z: (s.z * ws + b.z * wb + body.z * wbody) / wSum,
  };
}

export function bandDensity(i: number, spread: number) {
  const along = gauss(i, 1) * 5.8 * spread;
  const cross = gauss(i, 2) * 0.72;
  const r2 = (along / (6.2 * spread)) ** 2 + (cross / 0.95) ** 2;
  return Math.exp(-r2 * 0.72);
}

export function shapeDensity(i: number, time: number, spread: number) {
  const { phase, next, blend } = sampleTimeline(time);
  const active: Phase = blend < 0.5 ? phase : next.phase;
  if (active === "body") {
    const b = bodyPoint(i, time, 1);
    return inBodySilhouette(b.x, b.y) ? 0.55 + hash(i, 44) * 0.35 : 0.2;
  }
  return bandDensity(i, spread);
}

/** 固定蓝紫白，初始化后不变 */
export function bandParticleColor(i: number, density: number) {
  const m = hash(i, 77);
  const tone = hash(i, 78);

  let r = 0.58 + m * 0.06;
  let g = 0.7 + m * 0.07;
  let b = 0.88 + m * 0.06;

  if (tone > 0.55) {
    r = 0.62 + m * 0.05;
    g = 0.7 + m * 0.06;
    b = 0.88 + m * 0.05;
  } else if (tone < 0.25) {
    r = 0.72 + m * 0.04;
    g = 0.8 + m * 0.05;
    b = 0.92 + m * 0.04;
  }

  const core = 0.35 + density * 0.65;
  const dim = (0.12 + density * 0.22) * core;
  return { r: r * dim, g: g * dim, b: b * dim };
}

export function bandParticleSize(i: number, density: number) {
  const m = hash(i, 79);
  return 0.22 + m * 0.18 + density * 0.12;
}

export function bokehPoint(i: number, time: number): Vec3 {
  const u = hash(i, 90);
  const v = hash(i, 91);
  const drift = Math.sin(time * 0.45 + i * 0.013) * 0.5;
  return {
    x: (u - 0.5) * 52 + drift,
    y: (v - 0.5) * 32,
    z: -10 - hash(i, 92) * 22,
  };
}

export function bokehColor(i: number) {
  const m = hash(i, 93);
  const dim = 0.025 + m * 0.02;
  return { r: dim * 0.72, g: dim * 0.8, b: dim * 0.95 };
}
