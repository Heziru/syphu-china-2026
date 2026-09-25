import { Box3, Vector3 } from "three";
import { createBioreactorModel } from "./bioreactor/createBioreactorModel";
import { createComputerModel } from "./computer/createComputerModel";
import { createLabChairModel } from "./lab-chair/createLabChairModel";

/** Measured procedural model bounds (factory at identity, y=0 floor). */
export type ModelBounds = {
  width: number;
  depth: number;
  height: number;
  minY: number;
  maxY: number;
};

export type WorldAABB = {
  id: string;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  minY: number;
  maxY: number;
};

function measureGroupBounds(
  factory: () => { group: { updateMatrixWorld: (force?: boolean) => void } },
): ModelBounds {
  const { group } = factory();
  group.updateMatrixWorld(true);
  const box = new Box3().setFromObject(group as never);
  const size = box.getSize(new Vector3());
  return {
    width: size.x,
    depth: size.z,
    height: size.y,
    minY: box.min.y,
    maxY: box.max.y,
  };
}

/** Cached bounds from production model factories. */
export const MODEL_BOUNDS = {
  computer: measureGroupBounds(() => createComputerModel()),
  bioreactor: measureGroupBounds(() => createBioreactorModel()),
  labChair: measureGroupBounds(() => createLabChairModel()),
} as const;

export const COMPUTER_DESK_TOP_Y = 0.09;

export function worldAABBFromPlacement(
  id: string,
  position: [number, number, number],
  rotationY: number,
  width: number,
  depth: number,
  height: number,
  minY = 0,
): WorldAABB {
  const cos = Math.cos(rotationY);
  const sin = Math.sin(rotationY);
  const [cx, cy, cz] = position;
  const hw = width * 0.5;
  const hd = depth * 0.5;
  const corners = [
    [-hw, -hd],
    [hw, -hd],
    [hw, hd],
    [-hw, hd],
  ].map(([lx, lz]) => [cx + lx * cos + lz * sin, cz - lx * sin + lz * cos] as [number, number]);

  const xs = corners.map((c) => c[0]);
  const zs = corners.map((c) => c[1]);
  return {
    id,
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minZ: Math.min(...zs),
    maxZ: Math.max(...zs),
    minY: cy + minY,
    maxY: cy + minY + height,
  };
}

export function aabbOverlap(a: WorldAABB, b: WorldAABB, gap = 0): boolean {
  return !(
    a.maxX + gap <= b.minX ||
    b.maxX + gap <= a.minX ||
    a.maxZ + gap <= b.minZ ||
    b.maxZ + gap <= a.minZ
  );
}

export function aabbGapXZ(a: WorldAABB, b: WorldAABB): number {
  const dx = Math.max(0, Math.max(a.minX - b.maxX, b.minX - a.maxX));
  const dz = Math.max(0, Math.max(a.minZ - b.maxZ, b.minZ - a.maxZ));
  return Math.hypot(dx, dz);
}
