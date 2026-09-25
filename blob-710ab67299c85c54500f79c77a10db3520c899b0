import { hash, lerp, type Vec3 } from "./nocturneMath";
import {
  bandWeight,
  bodyWeight,
  gutRedWeight,
  stableWeight,
} from "./nocturneTimeline";

export const SCENE_SCALE = 1.9;
export const BODY_HEIGHT = 5.2;
const GUT_RATIO = 0.28;

const BODY_A = { r: 0.42, g: 0.48, b: 1.0 }; // #6B7BFF
const BODY_B = { r: 0.655, g: 0.545, b: 0.98 }; // #A78BFA
const GUT_A = { r: 1.0, g: 0.302, b: 0.302 }; // #FF4D4D
const GUT_B = { r: 1.0, g: 0.42, b: 0.42 }; // #FF6B6B

function gauss(i: number, seed: number) {
  let s = 0;
  for (let k = 0; k < 8; k++) s += hash(i, seed + k * 3.7);
  return (s / 8 - 0.5) * 2.6;
}

function distToSegment(px: number, py: number, x1: number, y1: number, x2: number, y2: number) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq < 1e-6) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

function inCapsule(px: number, py: number, x1: number, y1: number, x2: number, y2: number, r: number) {
  return distToSegment(px, py, x1, y1, x2, y2) <= r;
}

/** 标准站姿人体：双臂自然下垂 */
export function inHumanSilhouette(x: number, y: number): boolean {
  if (x * x + (y - 2.28) ** 2 < 0.34 ** 2) return true;
  if (Math.abs(x) < 0.11 && y > 1.88 && y < 2.05) return true;

  if (y > -0.55 && y < 1.92) {
    const t = (y + 0.55) / 2.47;
    const halfW = 0.34 + t * 0.32;
    if (Math.abs(x) < halfW) return true;
  }

  if (inCapsule(x, y, -0.56, 1.58, -0.54, 0.02, 0.1)) return true;
  if (inCapsule(x, y, 0.56, 1.58, 0.54, 0.02, 0.1)) return true;

  if (inCapsule(x, y, -0.18, -0.55, -0.22, -2.38, 0.17)) return true;
  if (inCapsule(x, y, 0.18, -0.55, 0.22, -2.38, 0.17)) return true;

  return false;
}

/** 四股盘绕肠道（设计稿） */
export function inGutRegion(x: number, y: number): boolean {
  if (y < -0.55 || y > 0.42 || Math.abs(x) > 0.4) return false;
  const coils = [
    { cx: 0.12, cy: 0.18, rx: 0.2, ry: 0.14 },
    { cx: -0.1, cy: 0.02, rx: 0.17, ry: 0.12 },
    { cx: 0.05, cy: -0.15, rx: 0.19, ry: 0.13 },
    { cx: -0.08, cy: -0.32, rx: 0.16, ry: 0.11 },
  ];
  for (const c of coils) {
    if (((x - c.cx) / c.rx) ** 2 + ((y - c.cy) / c.ry) ** 2 < 1) return true;
  }
  return false;
}

export function isGutParticle(i: number) {
  return hash(i, 100) < GUT_RATIO;
}

function sampleBodyXY(i: number, gut: boolean) {
  for (let k = 0; k < 56; k++) {
    const x = (hash(i, 20 + k * 2) - 0.5) * 2.4;
    const y = (hash(i, 21 + k * 2) - 0.5) * BODY_HEIGHT;
    if (gut) {
      if (inGutRegion(x, y)) return { x, y };
    } else if (inHumanSilhouette(x, y) && !inGutRegion(x, y)) {
      return { x, y };
    }
  }
  return gut ? { x: 0.05, y: -0.1 } : { x: 0, y: 1.2 };
}

export function bandPoint(i: number, time: number, spread: number): Vec3 {
  const along0 = gauss(i, 1) * 6.2 * spread;
  const cross0 = gauss(i, 2) * 0.68;
  const wave =
    Math.sin(along0 * 0.35 + time * 0.85) * 0.26 +
    Math.sin(along0 * 0.14 - time * 0.45) * 0.12;
  const driftX = Math.sin(time * 0.55 + hash(i, 40) * 6.283) * 0.18;
  const bulge = Math.exp(-((cross0 / 0.72) ** 2));
  const z = gauss(i, 3) * bulge * 1.4 + Math.sin(time * 0.6 + hash(i, 42) * 6.28) * 0.1;
  return {
    x: along0 + driftX,
    y: cross0 + wave,
    z,
  };
}

export function bodyPoint(i: number, time: number): Vec3 {
  const gut = isGutParticle(i);
  const { x: bx, y: by } = sampleBodyXY(i, gut);
  const stable = stableWeight(time);
  const breath = 1 + Math.sin(time * (2.4 + stable * 0.8)) * (0.025 + stable * 0.02);
  const peristalsis = gut
    ? Math.sin(time * 3.5 + by * 6 + bx * 4) * (0.035 + stable * 0.02)
    : 0;
  const flicker = Math.sin(time * 5 + hash(i, 43) * 12) * 0.008 * stable;
  const z = (hash(i, 18) - 0.5) * (gut ? 0.28 : 0.42);

  return {
    x: bx * breath + peristalsis + flicker,
    y: by * breath + flicker * 0.5,
    z: z + (gut ? Math.sin(time * 2.2 + i * 0.008) * 0.05 : 0),
  };
}

export function morphPoint(i: number, time: number, spread: number): Vec3 {
  const bw = bandWeight(time);
  const bodyW = bodyWeight(time);
  const band = bandPoint(i, time, spread);
  const body = bodyPoint(i, time);
  const wSum = bw + bodyW || 1;

  return {
    x: ((band.x * bw + body.x * bodyW) / wSum) * SCENE_SCALE,
    y: ((band.y * bw + body.y * bodyW) / wSum) * SCENE_SCALE,
    z: ((band.z * bw + body.z * bodyW) / wSum) * SCENE_SCALE,
  };
}

export function bandDensity(i: number, spread: number) {
  const along = gauss(i, 1) * 6.2 * spread;
  const cross = gauss(i, 2) * 0.68;
  const r2 = (along / (6.5 * spread)) ** 2 + (cross / 0.9) ** 2;
  return Math.exp(-r2 * 0.7);
}

export function shapeDensity(i: number, time: number, spread: number) {
  if (bodyWeight(time) > 0.35) {
    const pt = bodyPoint(i, time);
    const nx = pt.x;
    const ny = pt.y;
    if (isGutParticle(i) && inGutRegion(nx, ny)) return 0.7 + hash(i, 44) * 0.28;
    if (inHumanSilhouette(nx, ny)) return 0.55 + hash(i, 45) * 0.38;
  }
  return bandDensity(i, spread);
}

function mixBodyColor(i: number, density: number) {
  const m = hash(i, 77);
  return {
    r: lerp(BODY_A.r, BODY_B.r, m) * (0.35 + density * 0.65),
    g: lerp(BODY_A.g, BODY_B.g, m) * (0.35 + density * 0.65),
    b: lerp(BODY_A.b, BODY_B.b, m) * (0.35 + density * 0.65),
  };
}

function mixGutColor(i: number, density: number, glow: number) {
  const m = hash(i, 88);
  const lum = 0.45 + density * 0.55 + glow * 0.35;
  return {
    r: lerp(GUT_A.r, GUT_B.r, m) * lum,
    g: lerp(GUT_A.g, GUT_B.g, m) * lum,
    b: lerp(GUT_A.b, GUT_B.b, m) * lum,
  };
}

export function particleColor(i: number, density: number, time: number) {
  const body = mixBodyColor(i, density);
  if (!isGutParticle(i)) return body;

  const redW = gutRedWeight(time);
  if (redW <= 0) return body;

  const gut = mixGutColor(i, density, redW * stableWeight(time));
  return {
    r: lerp(body.r, gut.r, redW),
    g: lerp(body.g, gut.g, redW),
    b: lerp(body.b, gut.b, redW),
  };
}

export function particleAlpha(i: number, density: number, time: number) {
  let a = 0.32 + density * 0.55;
  if (isGutParticle(i)) {
    a += gutRedWeight(time) * (0.22 + stableWeight(time) * 0.15);
  }
  return a;
}

export function particleSize(i: number, density: number, time: number) {
  const m = hash(i, 79);
  let s = 0.26 + m * 0.18 + density * 0.12;
  if (isGutParticle(i)) s += gutRedWeight(time) * 0.06;
  return s;
}

export function bokehPoint(i: number, time: number): Vec3 {
  const u = hash(i, 90);
  const v = hash(i, 91);
  const drift = Math.sin(time * 0.35 + i * 0.011) * 0.45;
  return {
    x: (u - 0.5) * 55 + drift,
    y: (v - 0.5) * 34,
    z: -12 - hash(i, 92) * 24,
  };
}

export function bokehColor(i: number) {
  const m = hash(i, 93);
  const dim = 0.04 + m * 0.025;
  return { r: dim * 0.5, g: dim * 0.55, b: dim * 0.95 };
}
