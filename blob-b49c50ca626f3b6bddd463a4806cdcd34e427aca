export type Vec3 = { x: number; y: number; z: number };

export function hash(i: number, s: number) {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export function smoothstep(t: number) {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function lerp3(a: Vec3, b: Vec3, t: number): Vec3 {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    z: lerp(a.z, b.z, t),
  };
}

const SIGMA = 10;
const RHO = 28;
const BETA = 8 / 3;

export function lorenzStep(v: Vec3, dt: number): Vec3 {
  const dx = SIGMA * (v.y - v.x) * dt;
  const dy = (v.x * (RHO - v.z) - v.y) * dt;
  const dz = (v.x * v.y - BETA * v.z) * dt;
  return { x: v.x + dx, y: v.y + dy, z: v.z + dz };
}

const AIZ = { a: 0.95, b: 0.7, c: 0.6, d: 3.5, e: 0.25, f: 0.1 };

export function aizawaStep(v: Vec3, dt: number): Vec3 {
  const { x, y, z } = v;
  const { a, b, c, d, e, f } = AIZ;
  const dx = ((z - b) * x - d * y) * dt;
  const dy = (d * x + (z - b) * y) * dt;
  const dz =
    (c +
      a * z -
      (z * z * z) / 3 -
      (x * x + y * y) * (1 + e * z) +
      f * z * x * x * x) *
    dt;
  return { x: x + dx, y: y + dy, z: z + dz };
}

export function rotateX(v: Vec3, a: number): Vec3 {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return { x: v.x, y: v.y * c - v.z * s, z: v.y * s + v.z * c };
}

export function rotateY(v: Vec3, a: number): Vec3 {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return { x: v.x * c + v.z * s, y: v.y, z: -v.x * s + v.z * c };
}

export function rotateZ(v: Vec3, a: number): Vec3 {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return { x: v.x * c - v.y * s, y: v.x * s + v.y * c, z: v.z };
}

/** Kaprekar — mouse void / trajectory bend (video caption: 6174) */
export const MOUSE_K = 6174 / 900_000;
