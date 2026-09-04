import { ExtrudeGeometry, Shape, type BufferGeometry } from "three";

/** Phase 3.7/3.8 — deeper open-front trapezoid (world X, Z). */
export type FootprintXZ = [number, number];

export const ROOM_LAYOUT_REVISION = 4;

export const FLOOR_FOOTPRINT_PREV: FootprintXZ[] = [
  [-3.6, -3.5],
  [3.6, -3.5],
  [5.45, 0.75],
  [4.75, 3.85],
  [-4.75, 3.85],
  [-5.45, 0.75],
];

export const FLOOR_FOOTPRINT: FootprintXZ[] = [
  [-3.8, -4.6],
  [3.8, -4.6],
  [5.65, 0.5],
  [4.85, 4.45],
  [-4.85, 4.45],
  [-5.65, 0.5],
];

export const WALL_SEGMENTS: [FootprintXZ, FootprintXZ][] = [
  [FLOOR_FOOTPRINT[0], FLOOR_FOOTPRINT[1]],
  [FLOOR_FOOTPRINT[1], FLOOR_FOOTPRINT[2]],
  [FLOOR_FOOTPRINT[2], FLOOR_FOOTPRINT[3]],
  [FLOOR_FOOTPRINT[5], FLOOR_FOOTPRINT[4]],
  [FLOOR_FOOTPRINT[0], FLOOR_FOOTPRINT[5]],
];

export const WALL_HEIGHT = 3.1;
export const WALL_THICKNESS = 0.18;
export const BASE_THICKNESS = 0.08;
/** Gap between furniture back face and wall plane. */
export const WALL_CLEARANCE = 0.03;

export const ROOM_DEPTH =
  Math.max(...FLOOR_FOOTPRINT.map((p) => p[1])) -
  Math.min(...FLOOR_FOOTPRINT.map((p) => p[1]));

export const ROOM_BACK_WIDTH = FLOOR_FOOTPRINT[1][0] - FLOOR_FOOTPRINT[0][0];
export const ROOM_FRONT_WIDTH = FLOOR_FOOTPRINT[3][0] - FLOOR_FOOTPRINT[4][0];

/**
 * Standard wall-furniture local axes (RoomShell blockouts):
 *   local +X = WIDTH along wall tangent
 *   local +Z = DEPTH toward room interior (FRONT)
 *   local -Z = BACK against wall
 */
export const WALL_FURNITURE_AXIS = {
  width: "+X",
  depth: "+Z",
  front: "+Z",
  back: "-Z",
} as const;

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
  /** Wall mesh rotation (box depth along segment). */
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

/** Y-rotation: local +Z → inward; local ±X runs along wall tangent (width symmetric). */
export function wallFurnitureRotationY(
  tangentX: number,
  tangentZ: number,
  inwardX: number,
  inwardZ: number,
): number {
  const base = Math.atan2(-tangentZ, tangentX);
  const inward: FootprintXZ = [inwardX, inwardZ];
  const baseZ = worldAxisFromLocal(base, 0, 1);
  if (dotXZ(baseZ, inward) >= 0.99) return base;
  return base + Math.PI;
}

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
  wallPoint: FootprintXZ;
};

export function wallAnchorFromSegment(
  segmentIndex: number,
  t: number,
  depth: number,
  wallClearance = WALL_CLEARANCE,
): WallAnchor {
  const [a, b] = WALL_SEGMENTS[segmentIndex];
  const m = wallSegmentMetrics(a, b);
  const wallPoint = pointOnWall(a, b, t);
  const inset = depth * 0.5 + wallClearance;
  return {
    position: [
      wallPoint[0] + m.inwardX * inset,
      0,
      wallPoint[1] + m.inwardZ * inset,
    ],
    rotationY: wallFurnitureRotationY(m.tangentX, m.tangentZ, m.inwardX, m.inwardZ),
    tangentX: m.tangentX,
    tangentZ: m.tangentZ,
    inwardX: m.inwardX,
    inwardZ: m.inwardZ,
    wallPoint,
  };
}

/** Map wall-furniture local (X=width, Z=depth) to world XZ. */
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

export function localToWorldPosition(
  anchor: Pick<WallAnchor, "position" | "rotationY">,
  localX: number,
  localZ: number,
  y = 0,
): [number, number, number] {
  const [wx, wz] = localXZToWorld(anchor, localX, localZ);
  return [wx, y, wz];
}

/** Footprint corners: local X=width, local Z=depth; back at -Z, front at +Z. */
export function furnitureFootprintCorners(
  anchor: Pick<WallAnchor, "position" | "rotationY">,
  width: number,
  depth: number,
): FootprintXZ[] {
  const hw = width * 0.5;
  const hd = depth * 0.5;
  return [
    localXZToWorld(anchor, -hw, -hd),
    localXZToWorld(anchor, hw, -hd),
    localXZToWorld(anchor, hw, hd),
    localXZToWorld(anchor, -hw, hd),
  ];
}

export function worldAxisFromLocal(
  rotationY: number,
  localX: number,
  localZ: number,
): FootprintXZ {
  const cos = Math.cos(rotationY);
  const sin = Math.sin(rotationY);
  return [localX * cos + localZ * sin, -localX * sin + localZ * cos];
}

export function dotXZ(a: FootprintXZ, b: FootprintXZ): number {
  return a[0] * b[0] + a[1] * b[1];
}

export function backFaceCenter(
  anchor: WallAnchor,
  depth: number,
): FootprintXZ {
  const [cx, , cz] = anchor.position;
  return [cx - anchor.inwardX * (depth * 0.5), cz - anchor.inwardZ * (depth * 0.5)];
}

export function frontFaceCenter(
  anchor: WallAnchor,
  depth: number,
): FootprintXZ {
  const [cx, , cz] = anchor.position;
  return [cx + anchor.inwardX * (depth * 0.5), cz + anchor.inwardZ * (depth * 0.5)];
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
