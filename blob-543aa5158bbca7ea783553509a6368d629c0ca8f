import { ExtrudeGeometry, Shape, type BufferGeometry } from "three";

/** Phase 2 approved open-front trapezoid footprint (world X, Z). */
export type FootprintXZ = [number, number];

export const ROOM_LAYOUT_REVISION = 3;

export const FLOOR_FOOTPRINT: FootprintXZ[] = [
  [-3.6, -3.5], // back-left
  [3.6, -3.5], // back-right
  [5.45, 0.75], // side-right
  [4.75, 3.85], // front-right
  [-4.75, 3.85], // front-left
  [-5.45, 0.75], // side-left
];

export const WALL_SEGMENTS: [FootprintXZ, FootprintXZ][] = [
  [FLOOR_FOOTPRINT[0], FLOOR_FOOTPRINT[1]], // back
  [FLOOR_FOOTPRINT[1], FLOOR_FOOTPRINT[2]], // right back
  [FLOOR_FOOTPRINT[2], FLOOR_FOOTPRINT[3]], // right front
  [FLOOR_FOOTPRINT[5], FLOOR_FOOTPRINT[4]], // left front
  [FLOOR_FOOTPRINT[0], FLOOR_FOOTPRINT[5]], // left back (window wall)
];

export const WALL_HEIGHT = 3.1;
export const WALL_THICKNESS = 0.18;
export const BASE_THICKNESS = 0.08;

/** Map world (X, Z) → Shape (X, -Z) for rotateX(-π/2) floor placement. */
export function footprintToShape(points: FootprintXZ[]): Shape {
  const shape = new Shape();
  shape.moveTo(points[0][0], -points[0][1]);
  for (let i = 1; i < points.length; i += 1) {
    shape.lineTo(points[i][0], -points[i][1]);
  }
  shape.closePath();
  return shape;
}

export function createDioramaBaseGeometry(): BufferGeometry {
  const geo = new ExtrudeGeometry(footprintToShape(FLOOR_FOOTPRINT), {
    depth: BASE_THICKNESS,
    bevelEnabled: false,
    curveSegments: 1,
  });
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, -BASE_THICKNESS, 0);
  geo.computeVertexNormals();
  return geo;
}

export type WallSegmentMetrics = {
  length: number;
  midX: number;
  midZ: number;
  rotY: number;
  inwardX: number;
  inwardZ: number;
};

export function wallSegmentMetrics(a: FootprintXZ, b: FootprintXZ): WallSegmentMetrics {
  const dx = b[0] - a[0];
  const dz = b[1] - a[1];
  const length = Math.hypot(dx, dz);
  const midX = (a[0] + b[0]) * 0.5;
  const midZ = (a[1] + b[1]) * 0.5;
  const rotY = Math.atan2(dx, dz);
  const nx = dz / length;
  const nz = -dx / length;
  const toCenterX = -midX;
  const toCenterZ = -midZ;
  const dot = nx * toCenterX + nz * toCenterZ;
  const inwardX = dot >= 0 ? nx : -nx;
  const inwardZ = dot >= 0 ? nz : -nz;
  return { length, midX, midZ, rotY, inwardX, inwardZ };
}

/** Point on wall segment; t ∈ [0, 1] from a → b. */
export function pointOnWall(a: FootprintXZ, b: FootprintXZ, t: number): FootprintXZ {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}
