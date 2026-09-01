import { hash, type Vec3 } from "./nocturneMath";

/** 近似正态 — 多 uniform 叠加 */
function gauss(i: number, seed: number) {
  let s = 0;
  for (let k = 0; k < 8; k++) s += hash(i, seed + k * 3.7);
  return (s / 8 - 0.5) * 2.6;
}

/**
 * 水平银河带 — 高斯密度：中间略密、边缘稀疏、大量黑底透出
 * 参考视频 ~6s：细长、柔和、蓝紫偏
 */
export function bandPoint(i: number, _n: number, time: number, spread: number): Vec3 {
  const along0 = gauss(i, 1) * 5.8 * spread;
  const cross0 = gauss(i, 2) * 0.72;

  const wave =
    Math.sin(along0 * 0.38 + time * 0.42) * 0.28 +
    Math.sin(along0 * 0.17 - time * 0.22) * 0.14;
  const cross = cross0 + wave;

  const driftX = Math.sin(time * 0.28 + hash(i, 40) * 6.283) * 0.22;
  const driftY = Math.cos(time * 0.24 + hash(i, 41) * 6.283) * 0.1;
  const crawl = Math.sin(time * 0.55 + along0 * 0.5) * 0.06;

  const bulge = Math.exp(-((cross0 / 0.75) ** 2));
  const z = gauss(i, 3) * bulge * 1.6 + Math.sin(time * 0.31 + hash(i, 42) * 6.28) * 0.12;

  return {
    x: along0 + driftX + crawl,
    y: cross + driftY,
    z,
  };
}

/** 距带中心归一化距离 → 密度权重（用于尺寸/亮度，非剔除） */
export function bandDensity(i: number, spread: number) {
  const along = gauss(i, 1) * 5.8 * spread;
  const cross = gauss(i, 2) * 0.72;
  const r2 = (along / (6.2 * spread)) ** 2 + (cross / 0.95) ** 2;
  return Math.exp(-r2 * 0.72);
}

/**
 * 固定蓝紫白调色（#c8d4f0 / #a8b8e8），b > r，初始化后不变
 */
export function bandParticleColor(i: number, density: number) {
  const m = hash(i, 77);
  const tone = hash(i, 78);

  // 蓝紫基调：始终 b > r
  let r = 0.58 + m * 0.06;
  let g = 0.7 + m * 0.07;
  let b = 0.88 + m * 0.06;

  if (tone > 0.55) {
    // lavender #a8b8e8
    r = 0.62 + m * 0.05;
    g = 0.7 + m * 0.06;
    b = 0.88 + m * 0.05;
  } else if (tone < 0.25) {
    // pale cyan-white #c8d4f0
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
  const drift = Math.sin(time * 0.16 + i * 0.013) * 0.5;
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
