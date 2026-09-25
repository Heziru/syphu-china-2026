import { ExtrudeGeometry, Shape, type BufferGeometry } from "three";
import { ROOM_POLYGON, type Vec2 } from "./layoutMath";
export type FootprintXZ = Vec2;
export const FLOOR_FOOTPRINT = ROOM_POLYGON;
export const WALL_HEIGHT = 3.1;
export const WALL_THICKNESS = 0.18;
export const BASE_THICKNESS = 0.08;
export const WALL_SEGMENTS: [Vec2, Vec2][] = [
  [ROOM_POLYGON[0], ROOM_POLYGON[1]],
  [ROOM_POLYGON[1], ROOM_POLYGON[2]],
  [ROOM_POLYGON[2], ROOM_POLYGON[3]],
  [ROOM_POLYGON[5], ROOM_POLYGON[4]],
  [ROOM_POLYGON[0], ROOM_POLYGON[5]],
];
export function createDioramaBaseGeometry(): BufferGeometry {
  const shape = new Shape();
  FLOOR_FOOTPRINT.forEach(([x, z], i) => {
    if (i === 0) shape.moveTo(x, -z);
    else shape.lineTo(x, -z);
  });
  shape.closePath();
  const geo = new ExtrudeGeometry(shape, {
    depth: BASE_THICKNESS,
    bevelEnabled: false,
    curveSegments: 1,
  });
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, -BASE_THICKNESS, 0);
  geo.computeVertexNormals();
  return geo;
}
export function wallSegmentMetrics(a: Vec2, b: Vec2) {
  const dx = b[0] - a[0],
    dz = b[1] - a[1],
    length = Math.hypot(dx, dz),
    midX = (a[0] + b[0]) / 2,
    midZ = (a[1] + b[1]) / 2;
  let inwardX = -dz / length,
    inwardZ = dx / length;
  if (inwardX * -midX + inwardZ * -midZ < 0) {
    inwardX = -inwardX;
    inwardZ = -inwardZ;
  }
  return { length, midX, midZ, inwardX, inwardZ };
}
