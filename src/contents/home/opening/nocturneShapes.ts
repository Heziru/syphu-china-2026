import { hash, type Vec3 } from "./nocturneMath";

/** 水平银河带 — 参考视频 ~6s 帧形态 */
export function bandPoint(i: number, _n: number, time: number, spread: number): Vec3 {
  const u = hash(i, 1);
  const v = hash(i, 2);
  const w = hash(i, 3);
  const along = (u - 0.5) * 16 * spread;
  const cross = (v - 0.5) * 3.2;
  const bulge = Math.exp(-((cross / 1.4) ** 2)) * 2.2;
  return {
    x: along,
    y: cross + Math.sin(along * 0.35 + time * 0.2) * 0.35,
    z: (w - 0.5) * bulge,
  };
}

/**
 * 视频取色：白为主，边缘/稀疏区略带蓝紫（lavender / pale cyan）
 * 初始化后不变，中途不渐变
 */
export function bandParticleColor(i: number, crossDist: number) {
  const m = hash(i, 77);
  const tone = hash(i, 78);

  // 核心更白，翼缘略偏蓝紫
  const core = Math.exp(-((crossDist / 1.6) ** 2));
  const whiteMix = 0.62 + core * 0.32;

  let r = 0.52 + m * 0.06;
  let g = 0.58 + m * 0.07;
  let b = 0.72 + m * 0.08;

  if (tone > 0.62) {
    // 淡蓝紫（视频稀疏区）
    r = 0.48 + m * 0.05;
    g = 0.54 + m * 0.06;
    b = 0.78 + m * 0.07;
  } else if (tone < 0.22) {
    // 极淡青白
    r = 0.56 + m * 0.05;
    g = 0.64 + m * 0.06;
    b = 0.76 + m * 0.06;
  }

  // 拉向白色主体
  r = r + (0.82 - r) * whiteMix;
  g = g + (0.86 - g) * whiteMix;
  b = b + (0.94 - b) * whiteMix;

  const dim = 0.28 + core * 0.22;
  return { r: r * dim, g: g * dim, b: b * dim };
}

export function bokehPoint(i: number, time: number): Vec3 {
  const u = hash(i, 90);
  const v = hash(i, 91);
  const drift = Math.sin(time * 0.12 + i * 0.01) * 0.35;
  return {
    x: (u - 0.5) * 48 + drift,
    y: (v - 0.5) * 28,
    z: -8 - hash(i, 92) * 18,
  };
}

export function bokehColor(i: number) {
  const m = hash(i, 93);
  const dim = 0.04 + m * 0.025;
  return { r: dim * 0.95, g: dim * 0.98, b: dim * 1.05 };
}
