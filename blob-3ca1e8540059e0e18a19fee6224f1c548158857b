export type Vec3 = { x: number; y: number; z: number };

const SIGMA = 10;
const RHO = 28;
const BETA = 8 / 3;

export function lorenzStep(v: Vec3, dt: number): Vec3 {
  const dx = SIGMA * (v.y - v.x) * dt;
  const dy = (v.x * (RHO - v.z) - v.y) * dt;
  const dz = (v.x * v.y - BETA * v.z) * dt;
  return { x: v.x + dx, y: v.y + dy, z: v.z + dz };
}

export function rotateY(v: Vec3, a: number): Vec3 {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return { x: v.x * c + v.z * s, y: v.y, z: -v.x * s + v.z * c };
}

export function rotateX(v: Vec3, a: number): Vec3 {
  const c = Math.cos(a);
  const s = Math.sin(a);
  return { x: v.x, y: v.y * c - v.z * s, z: v.y * s + v.z * c };
}

export function project(
  v: Vec3,
  w: number,
  h: number,
  fov: number,
  offset: Vec3,
): { x: number; y: number; depth: number } {
  const z = v.z + fov;
  const scale = fov / Math.max(8, z);
  return {
    x: w * 0.5 + (v.x + offset.x) * scale,
    y: h * 0.5 + (v.y + offset.y) * scale,
    depth: z,
  };
}

/** Parametric Möbius strip point. */
export function mobiusPoint(u: number, v: number, radius = 1): Vec3 {
  const halfU = u * 0.5;
  const rv = v * 0.38;
  return {
    x: (radius + rv * Math.cos(halfU)) * Math.cos(u),
    y: (radius + rv * Math.cos(halfU)) * Math.sin(u),
    z: rv * Math.sin(halfU),
  };
}

export function createLorenzSeeds(count: number, mirror: 1 | -1): Vec3[] {
  const seeds: Vec3[] = [];
  for (let i = 0; i < count; i++) {
    seeds.push({
      x: 0.08 + (Math.random() - 0.5) * 0.35,
      y: 0.08 + (Math.random() - 0.5) * 0.35,
      z: 18 + Math.random() * 14,
    });
  }
  if (mirror < 0) {
    for (const s of seeds) s.x *= -1;
  }
  return seeds;
}
