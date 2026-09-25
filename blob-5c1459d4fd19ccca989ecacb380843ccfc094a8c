import { hash, rotateX, rotateZ, type Vec3 } from "./nocturneMath";
import type { SceneMode } from "./nocturneTimeline";

const L_SCALE = 0.105;
const L_Z = 25;

function inCatShape(x: number, y: number) {
  const head = (x + 0.15) ** 2 + (y - 1.05) ** 2;
  const body = (x / 1.55) ** 2 + ((y + 0.35) / 2.05) ** 2;
  const earL =
    x < -0.05 && y > 1.35 && y < 2.05 && x > -0.95 && y - 1.35 < (x + 0.35) * 1.4;
  const earR =
    x > 0.55 && y > 1.35 && y < 2.05 && x < 1.35 && y - 1.35 < (1.05 - x) * 1.4;
  const eye = (x + 0.55) ** 2 + (y - 0.85) ** 2 < 0.22 ** 2;
  return (head < 1.05 || body < 1 || earL || earR) && !eye;
}

export function shapePoint(
  mode: SceneMode,
  i: number,
  n: number,
  time: number,
  spread: number,
): Vec3 {
  const u = hash(i, 1);
  const v = hash(i, 2);
  const w = hash(i, 3);

  switch (mode) {
    case "scatter":
      return {
        x: (u - 0.5) * 52 * spread,
        y: (v - 0.5) * 30 * spread,
        z: (w - 0.5) * 22 * spread - 4,
      };

    case "gather": {
      const r = (u ** 0.55) * 5.5 * spread;
      const th = v * Math.PI * 2 + time * 0.04;
      return {
        x: Math.cos(th) * r + (w - 0.5) * 1.2,
        y: Math.sin(th) * r * 0.65 + (hash(i, 4) - 0.5) * 1.2,
        z: (hash(i, 5) - 0.5) * 3.5,
      };
    }

    case "band": {
      const along = (u - 0.5) * 16 * spread;
      const cross = (v - 0.5) * 3.2;
      const bulge = Math.exp(-((cross / 1.4) ** 2)) * 2.2;
      return {
        x: along,
        y: cross + Math.sin(along * 0.35 + time * 0.2) * 0.35,
        z: (w - 0.5) * bulge,
      };
    }

    case "disc": {
      const r = Math.sqrt(u) * 9 * spread;
      const th = v * Math.PI * 2 + time * 0.06;
      let p = {
        x: Math.cos(th) * r,
        y: (hash(i, 6) - 0.5) * 0.35,
        z: Math.sin(th) * r * 0.55,
      };
      p = rotateX(p, 0.72);
      if (hash(i, 7) < 0.018) {
        p.y += 5.5 + hash(i, 8) * 2.5;
        p.x *= 0.08;
        p.z *= 0.08;
      }
      return p;
    }

    case "lorenz": {
      const wing = i % 2 === 0 ? 1 : -1;
      const t = 40 + (i % 50);
      let x = 0.1 + hash(i, 9) * 0.4;
      let y = 0.1 + hash(i, 10) * 0.4;
      let z = 18 + hash(i, 11) * 10;
      for (let s = 0; s < t; s++) {
        const dx = 10 * (y - x) * 0.0055;
        const dy = (x * (28 - z) - y) * 0.0055;
        const dz = (x * y - (8 / 3) * z) * 0.0055;
        x += dx;
        y += dy;
        z += dz;
      }
      return {
        x: wing * x * L_SCALE + wing * 4.2,
        y: y * L_SCALE + Math.sin(time * 0.4 + i * 0.002) * 0.04,
        z: (z - L_Z) * L_SCALE * 0.72,
      };
    }

    case "sphereRings": {
      const ringIdx = i % 3;
      if (hash(i, 12) < 0.42) {
        const r = Math.cbrt(u) * 2.6 * spread;
        const th = v * Math.PI * 2;
        const ph = w * Math.PI;
        return {
          x: Math.sin(ph) * Math.cos(th) * r,
          y: Math.cos(ph) * r * 0.9,
          z: Math.sin(ph) * Math.sin(th) * r,
        };
      }
      const radii = [5.4, 4.6, 6.2];
      const tilts = [0.62, 0.38, 0.78];
      const rx = radii[ringIdx]! * spread;
      const ry = [1.1, 0.92, 0.78][ringIdx]!;
      const ang = (i / n) * Math.PI * 2 + time * (0.03 + ringIdx * 0.012);
      let p = {
        x: Math.cos(ang) * rx + (hash(i, 13) - 0.5) * 0.5,
        y: Math.sin(ang) * ry + (hash(i, 14) - 0.5) * 0.28,
        z: (hash(i, 15) - 0.5) * 0.45,
      };
      return rotateX(p, tilts[ringIdx]!);
    }

    case "aizawa": {
      let x = (u - 0.5) * 0.35;
      let y = (v - 0.5) * 0.35;
      let z = (w - 0.5) * 0.35;
      const steps = 80 + (i % 120);
      for (let s = 0; s < steps; s++) {
        const dt = 0.004;
        const dx = ((z - 0.7) * x - 3.5 * y) * dt;
        const dy = (3.5 * x + (z - 0.7) * y) * dt;
        const dz =
          (0.6 +
            0.95 * z -
            (z ** 3) / 3 -
            (x * x + y * y) * (1 + 0.25 * z) +
            0.1 * z * x ** 3) *
          dt;
        x += dx;
        y += dy;
        z += dz;
      }
      return { x: x * 3.8, y: y * 3.8, z: z * 3.8 };
    }

    case "torus": {
      const R = 5.2 * spread;
      const r = 0.95 + hash(i, 16) * 0.55;
      const ang = v * Math.PI * 2 + time * 0.05;
      const tube = u * Math.PI * 2;
      let p = {
        x: (R + r * Math.cos(tube)) * Math.cos(ang),
        y: r * Math.sin(tube) * 0.55,
        z: (R + r * Math.cos(tube)) * Math.sin(ang),
      };
      return rotateX(p, 0.55);
    }

    case "galaxy": {
      const r = Math.pow(u, 0.62) * 8.5 * spread;
      const th = v * Math.PI * 2 + r * 0.55 + time * 0.08;
      return {
        x: Math.cos(th) * r,
        y: (hash(i, 17) - 0.5) * 1.8,
        z: Math.sin(th) * r * 0.42 + (w - 0.5) * 1.2,
      };
    }

    case "cat": {
      let x = 0;
      let y = 0;
      for (let k = 0; k < 24; k++) {
        x = (hash(i, 20 + k * 2) - 0.5) * 3.6;
        y = (hash(i, 21 + k * 2) - 0.5) * 4.2;
        if (inCatShape(x, y)) break;
      }
      const z = (hash(i, 18) - 0.5) * 0.9;
      return { x: x * 1.15, y: y * 1.05 - 0.2, z };
    }

    case "orbit": {
      const onCat = hash(i, 19) < 0.55;
      if (onCat) {
        let x = 0;
        let y = 0;
        for (let k = 0; k < 24; k++) {
          x = (hash(i, 30 + k) - 0.5) * 3.2;
          y = (hash(i, 40 + k) - 0.5) * 3.8;
          if (inCatShape(x, y)) break;
        }
        return { x: x * 0.95, y: y * 0.9 - 0.15, z: (hash(i, 50) - 0.5) * 0.7 };
      }
      const ring = i % 4;
      const rad = [7.5, 9.2, 11, 13.5][ring]! * spread;
      const ang = (i / n) * Math.PI * 2 * (1.1 + ring * 0.08) + time * 0.015;
      let p = {
        x: Math.cos(ang) * rad,
        y: (hash(i, 51) - 0.5) * 0.25,
        z: Math.sin(ang) * rad * 0.35,
      };
      p = rotateX(p, 0.35 + ring * 0.12);
      p = rotateZ(p, ring * 0.4);
      return p;
    }

    default:
      return { x: 0, y: 0, z: 0 };
  }
}

export type Tint = "cool" | "warm" | "purple";

export function shapeColor(
  mode: SceneMode,
  tint: Tint,
  i: number,
  dist: number,
  warmBias: number,
) {
  const m = hash(i, 77);
  let r = 0.22;
  let g = 0.42;
  let b = 0.68;

  if (tint === "warm" && (mode === "lorenz" || warmBias > 0.3)) {
    const warm = i % 2 === 0 || hash(i, 78) > 0.45;
    if (warm) {
      r = 0.62 + m * 0.12;
      g = 0.52 + m * 0.1;
      b = 0.38 + m * 0.08;
    } else {
      r = 0.18 + m * 0.08;
      g = 0.38 + m * 0.1;
      b = 0.72 + m * 0.08;
    }
  } else if (tint === "purple" || mode === "orbit") {
    r = 0.42 + m * 0.12;
    g = 0.28 + m * 0.1;
    b = 0.72 + m * 0.1;
  } else if (mode === "disc" || mode === "band") {
    r = 0.28 + m * 0.08;
    g = 0.48 + m * 0.1;
    b = 0.78 + m * 0.06;
  } else {
    r = 0.2 + m * 0.1;
    g = 0.4 + m * 0.12;
    b = 0.68 + m * 0.1;
  }

  const fade = 0.55 + (1 - Math.min(1, dist / 14)) * 0.45;
  return { r: r * fade, g: g * fade, b: b * fade };
}

export function bokehPoint(i: number, time: number): Vec3 {
  const u = hash(i, 90);
  const v = hash(i, 91);
  const drift = Math.sin(time * 0.15 + i * 0.01) * 0.4;
  return {
    x: (u - 0.5) * 48 + drift,
    y: (v - 0.5) * 28,
    z: -8 - hash(i, 92) * 18,
  };
}
