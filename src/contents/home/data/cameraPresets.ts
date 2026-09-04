import { Vector3 } from "three";
import type { CameraShot } from "../types/laboratory";
import { ROOM_POLYGON } from "../laboratory/layoutMath";
export const OVERVIEW_CAMERA = {
  desktop: { position: [4.8, 7.7, 12.2], target: [0, 0.65, -0.25] },
  mobile: { position: [5, 17, 30], target: [0, 0.65, -0.25] },
} as const satisfies { desktop: CameraShot; mobile: CameraShot };
export const ENTER_CAMERA_OFFSET = 1.0;
/** Fit the fixed architecture, including the open front edge, at any aspect ratio. */
export function fitOverviewShot(
  shot: CameraShot,
  aspect: number,
  fov: number,
): CameraShot {
  const target = new Vector3(...shot.target),
    direction = new Vector3(...shot.position).sub(target).normalize();
  const right = new Vector3(0, 1, 0).cross(direction).normalize(),
    up = direction.clone().cross(right).normalize();
  const tanV = Math.tan((fov * Math.PI) / 360) * 0.88,
    tanH = tanV * aspect;
  let distance = 0;
  ROOM_POLYGON.forEach(([x, z], i) => {
    for (const y of [0, i === 3 || i === 4 ? 0.28 : 3.15]) {
      const p = new Vector3(x, y, z).sub(target),
        depth = p.dot(direction);
      distance = Math.max(
        distance,
        depth + Math.abs(p.dot(right)) / tanH,
        depth + Math.abs(p.dot(up)) / tanV,
      );
    }
  });
  return {
    position: target
      .clone()
      .addScaledVector(direction, distance + 0.2)
      .toArray(),
    target: [...shot.target],
  };
}
