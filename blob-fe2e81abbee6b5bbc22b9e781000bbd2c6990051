import { hash, type Vec3 } from "./nocturneMath";
import { phaseWeight, sampleTimeline, type Phase } from "./nocturneTimeline";

/** 全场景缩放 — 填满视口 */
export const SCENE_SCALE = 1.85;

/** 约 26% 粒子在 body 阶段分配给肠道 */
const GUT_RATIO = 0.26;

/** 近似正态 — 多 uniform 叠加 */
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

/** 标准人体正面轮廓（八头身比例） */
export function inHumanSilhouette(x: number, y: number): boolean {
  // 头部
  if (x * x + (y - 2.18) ** 2 < 0.36 ** 2) return true;
  // 颈
  if (Math.abs(x) < 0.12 && y > 1.78 && y < 1.98) return true;

  // 躯干（肩宽→腰窄）
  if (y > -0.42 && y < 1.82) {
    const t = (y - -0.42) / 2.24;
    const halfW = 0.36 + t * 0.34;
    if (Math.abs(x) < halfW * (0.88 + 0.12 * (1 - t))) return true;
  }

  // 双臂
  if (inCapsule(x, y, -0.72, 1.62, -1.05, 0.22, 0.13)) return true;
  if (inCapsule(x, y, 0.72, 1.62, 1.05, 0.22, 0.13)) return true;

  // 双腿
  if (inCapsule(x, y, -0.2, -0.42, -0.26, -2.28, 0.19)) return true;
  if (inCapsule(x, y, 0.2, -0.42, 0.26, -2.28, 0.19)) return true;

  return false;
}

/** 腹腔 + 盘绕肠道区域 */
export function inGutRegion(x: number, y: number): boolean {
  if (y < -0.62 || y > 0.52 || Math.abs(x) > 0.46) return false;

  const abdomen = (x / 0.44) ** 2 + ((y + 0.05) / 0.58) ** 2 < 1;
  if (!abdomen) return false;

  const coilA = ((x + 0.14) / 0.2) ** 2 + ((y + 0.08) / 0.17) ** 2 < 1;
  const coilB = ((x - 0.1) / 0.18) ** 2 + ((y - 0.18) / 0.15) ** 2 < 1;
  const coilC = (x / 0.22) ** 2 + ((y + 0.28) / 0.13) ** 2 < 1;
  const coilD = ((x - 0.02) / 0.24) ** 2 + ((y - 0.05) / 0.2) ** 2 < 1;

  return coilA || coilB || coilC || coilD;
}

export function isGutParticle(i: number) {
  return hash(i, 100) < GUT_RATIO;
}

function sampleBodyXY(i: number, gut: boolean) {
  for (let k = 0; k < 48; k++) {
    const x = (hash(i, 20 + k * 2) - 0.5) * 2.6;
    const y = (hash(i, 21 + k * 2) - 0.5) * 5.0 - 0.05;
    if (gut) {
      if (inGutRegion(x, y)) return { x, y };
    } else if (inHumanSilhouette(x, y) && !inGutRegion(x, y)) {
      return { x, y };
    }
  }
  return { x: 0, y: gut ? -0.1 : 1.0 };
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

/** 5.5–10s：标准人体 + 腹部肠道 */
export function bodyPoint(i: number, time: number, breath: number): Vec3 {
  const gut = isGutParticle(i);
  const { x: bx, y: by } = sampleBodyXY(i, gut);

  const peristalsis = gut ? Math.sin(time * 3.2 + by * 5 + bx * 3) * 0.045 : 0;
  const pulse = Math.sin(time * 2.8 + hash(i, 43) * 0.5) * 0.012;
  const z = (hash(i, 18) - 0.5) * (gut ? 0.35 : 0.5) * breath;

  return {
    x: bx * breath + pulse + peristalsis,
    y: by * breath + pulse * 0.5,
    z: z + (gut ? Math.sin(time * 2.4 + i * 0.01) * 0.06 : 0),
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
    x: (s.x * ws + b.x * wb + body.x * wbody) / wSum * SCENE_SCALE,
    y: (s.y * ws + b.y * wb + body.y * wbody) / wSum * SCENE_SCALE,
    z: (s.z * ws + b.z * wb + body.z * wbody) / wSum * SCENE_SCALE,
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
    const gut = isGutParticle(i);
    const pt = bodyPoint(i, time, 1);
    const nx = pt.x / SCENE_SCALE;
    const ny = pt.y / SCENE_SCALE;
    if (gut && inGutRegion(nx, ny)) return 0.65 + hash(i, 44) * 0.3;
    if (inHumanSilhouette(nx, ny)) return 0.5 + hash(i, 45) * 0.35;
    return 0.2;
  }
  return bandDensity(i, spread);
}

/** 蓝紫宇宙粒子 */
export function bandParticleColor(i: number, density: number) {
  const m = hash(i, 77);
  const tone = hash(i, 78);

  let r = 0.38 + m * 0.08;
  let g = 0.48 + m * 0.1;
  let b = 0.82 + m * 0.1;

  if (tone > 0.58) {
    r = 0.42 + m * 0.07;
    g = 0.36 + m * 0.08;
    b = 0.88 + m * 0.08;
  } else if (tone < 0.22) {
    r = 0.78 + m * 0.06;
    g = 0.82 + m * 0.06;
    b = 0.98 + m * 0.02;
  } else {
    r = 0.32 + m * 0.06;
    g = 0.52 + m * 0.08;
    b = 0.92 + m * 0.06;
  }

  const core = 0.4 + density * 0.6;
  const lum = 0.32 + density * 0.48;
  return { r: r * lum * core, g: g * lum * core, b: b * lum * core };
}

/** 肠道红色粒子 — body 阶段显现 */
export function gutParticleColor(i: number, density: number, bodyWeight: number) {
  const m = hash(i, 88);
  const tone = hash(i, 89);
  let r = 0.88 + m * 0.08;
  let g = 0.22 + m * 0.12;
  let b = 0.18 + m * 0.08;

  if (tone > 0.5) {
    r = 0.92 + m * 0.06;
    g = 0.32 + m * 0.1;
    b = 0.22 + m * 0.06;
  } else {
    r = 0.78 + m * 0.1;
    g = 0.14 + m * 0.08;
    b = 0.12 + m * 0.06;
  }

  const core = 0.45 + density * 0.55;
  const lum = (0.38 + density * 0.52) * bodyWeight;
  return { r: r * lum * core, g: g * lum * core, b: b * lum * core };
}

/** 根据时间混合宇宙蓝紫与肠道红 */
export function particleColor(i: number, density: number, time: number) {
  const bodyW = phaseWeight(time, "body");
  const cosmic = bandParticleColor(i, density);

  if (!isGutParticle(i) || bodyW < 0.01) return cosmic;

  const gut = gutParticleColor(i, density, bodyW);
  const t = Math.min(1, bodyW * 1.15);
  return {
    r: cosmic.r * (1 - t) + gut.r * t,
    g: cosmic.g * (1 - t) + gut.g * t,
    b: cosmic.b * (1 - t) + gut.b * t,
  };
}

export function bandParticleSize(i: number, density: number) {
  const m = hash(i, 79);
  const gutBoost = isGutParticle(i) ? 0.04 : 0;
  return 0.28 + m * 0.2 + density * 0.14 + gutBoost;
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
  const dim = 0.055 + m * 0.035;
  return { r: dim * 0.55, g: dim * 0.62, b: dim * 1.0 };
}
