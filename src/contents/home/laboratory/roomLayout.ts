import { ExtrudeGeometry, Shape, type BufferGeometry } from "three";

/** Phase 3.7 — deeper open-front trapezoid (world X, Z). */
export type FootprintXZ = [number, number];

export const ROOM_LAYOUT_REVISION = 4;

/** Previous Phase 2/3.6 footprint (depth ≈ 7.35 m). */
export const FLOOR_FOOTPRINT_PREV: FootprintXZ[] = [
  [-3.6, -3.5],
  [3.6, -3.5],
  [5.45, 0.75],
  [4.75, 3.85],
  [-4.75, 3.85],
  [-5.45, 0.75],
];

export const FLOOR_FOOTPRINT: FootprintXZ[] = [
  [-3.8, -4.6], // back-left
  [3.8, -4.6], // back-right
  [5.65, 0.5], // side-right
  [4.85, 4.45], // front-right
  [-4.85, 4.45], // front-left
  [-5.65, 0.5], // side-left
];

export const WALL_SEGMENTS: [FootprintXZ, FootprintXZ][] = [
  [FLOOR_FOOTPRINT[0], FLOOR_FOOTPRINT[1]], // 0 back
  [FLOOR_FOOTPRINT[1], FLOOR_FOOTPRINT[2]], // 1 right back
  [FLOOR_FOOTPRINT[2], FLOOR_FOOTPRINT[3]], // 2 right front
  [FLOOR_FOOTPRINT[5], FLOOR_FOOTPRINT[4]], // 3 left front
  [FLOOR_FOOTPRINT[0], FLOOR_FOOTPRINT[5]], // 4 left back (window)
];

export const WALL_HEIGHT = 3.1;
export const WALL_THICKNESS = 0.18;
export const BASE_THICKNESS = 0.08;
export const WALL_CLEARANCE = 0.05;

export const ROOM_DEPTH =
  Math.max(...FLOOR_FOOTPRINT.map((p) => p[1])) -
  Math.min(...FLOOR_FOOTPRINT.map((p) => p[1]));

export const ROOM_BACK_WIDTH = FLOOR_FOOTPRINT[1][0] - FLOOR_FOOTPRINT[0][0];
export const ROOM_FRONT_WIDTH = FLOOR_FOOTPRINT[3][0] - FLOOR_FOOTPRINT[4][0];

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
  tangentX: number;
  tangentZ: number;
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
  const tangentX = dx / length;
  const tangentZ = dz / length;
  const nx = dz / length;
  const nz = -dx / length;
  const toCenterX = -midX;
  const toCenterZ = -midZ;
  const dot = nx * toCenterX + nz * toCenterZ;
  const inwardX = dot >= 0 ? nx : -nx;
  const inwardZ = dot >= 0 ? nz : -nz;
  return {
    length,
    midX,
    midZ,
    rotY,
    tangentX,
    tangentZ,
    inwardX,
    inwardZ,
  };
}

/** Point on wall segment; t ∈ [0, 1] from a → b. */
export function pointOnWall(a: FootprintXZ, b: FootprintXZ, t: number): FootprintXZ {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

export type WallAnchor = {
  position: [number, number, number];
  rotationY: number;
  tangentX: number;
  tangentZ: number;
  inwardX: number;
  inwardZ: number;
};

/** Furniture center from wall geometry: point(t) + inward × (depth/2 + clearance). */
export function wallAnchorFromSegment(
  segmentIndex: number,
  t: number,
  depth: number,
  wallClearance = WALL_CLEARANCE,
): WallAnchor {
  const [a, b] = WALL_SEGMENTS[segmentIndex];
  const m = wallSegmentMetrics(a, b);
  const [px, pz] = pointOnWall(a, b, t);
  const inset = depth * 0.5 + wallClearance;
  return {
    position: [px + m.inwardX * inset, 0, pz + m.inwardZ * inset],
    rotationY: m.rotY,
    tangentX: m.tangentX,
    tangentZ: m.tangentZ,
    inwardX: m.inwardX,
    inwardZ: m.inwardZ,
  };
}

/** Rotate local X/Z (Y-rotation) into world X/Z. */
export function localXZToWorld(
  anchor: Pick<WallAnchor, "position" | "rotationY">,
  localX: number,
  localZ: number,
): FootprintXZ {
  const cos = Math.cos(anchor.rotationY);
  const sin = Math.sin(anchor.rotationY);
  const [cx, , cz] = anchor.position;
  return [cx + localX * cos + localZ * sin, cz - localX * sin + localZ * cos];
}

/** Four footprint corners; local X = depth (inward), local Z = width (tangent). */
export function furnitureFootprintCorners(
  anchor: Pick<WallAnchor, "position" | "rotationY">,
  width: number,
  depth: number,
): FootprintXZ[] {
  const ht = width * 0.5;
  const hd = depth * 0.5;
  return [
    localXZToWorld(anchor, hd, -ht),
    localXZToWorld(anchor, hd, ht),
    localXZToWorld(anchor, -hd, ht),
    localXZToWorld(anchor, -hd, -ht),
  ];
}

export function pointInPolygon(x: number, z: number, polygon: FootprintXZ[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const [xi, zi] = polygon[i];
    const [xj, zj] = polygon[j];
    const intersect =
      zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function footprintInsideRoom(corners: FootprintXZ[]): boolean {
  return corners.every(([x, z]) => pointInPolygon(x, z, FLOOR_FOOTPRINT));
}
