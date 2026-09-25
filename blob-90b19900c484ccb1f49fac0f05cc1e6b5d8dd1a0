import type { ReactNode } from "react";
import { LAB_COLORS } from "./labPalette";
import { SoftBox } from "./SoftBox";
import type { WallFurniturePlacement } from "./roomPlacement";
import {
  DRY_LAB_BENCH,
  ENGINEERING_BENCH,
  LAMINAR_HOOD_BLOCKOUT,
  STORAGE_SHELF,
  WET_LAB_BENCH,
} from "./roomPlacement";

const COUNTERTOP = "#3A474A";
const WOOD = "#C4A882";
const HOOD_SHELL = "#ECEFF2";

/** Wall-local box: size X = depth (inward), size Z = width (tangent). */
function wallBoxSize(width: number, depth: number, height: number): [number, number, number] {
  return [depth, height, width];
}

function WallAnchoredGroup({
  placement,
  children,
}: {
  placement: WallFurniturePlacement;
  children: ReactNode;
}) {
  const [x, y, z] = placement.anchor.position;
  return (
    <group position={[x, y, z]} rotation={[0, placement.anchor.rotationY, 0]}>
      {children}
    </group>
  );
}

/** Wet Lab back-left support cabinet. */
export function WetLabBenchBlockout() {
  const p = WET_LAB_BENCH;
  return (
    <WallAnchoredGroup placement={p}>
      <SoftBox
        position={[0, 0.41, 0]}
        size={wallBoxSize(p.width, p.depth, 0.82)}
        radius={0.03}
        color={LAB_COLORS.cabinet}
        roughness={0.82}
      />
      <SoftBox
        position={[-0.01, 0.86, 0]}
        size={wallBoxSize(p.width - 0.08, p.depth - 0.06, 0.06)}
        radius={0.018}
        color={COUNTERTOP}
        roughness={0.48}
      />
      <SoftBox
        position={[0.02, 1.42, 0]}
        size={wallBoxSize(p.width * 0.72, p.depth * 0.48, 0.05)}
        radius={0.015}
        color={WOOD}
        roughness={0.78}
      />
    </WallAnchoredGroup>
  );
}

/**
 * Phase 3.7 composition blockout — horizontal clean bench proportions.
 * Production LaminarHoodModel deferred until asset revision (native ratio is tower-like).
 */
export function LaminarHoodBlockout() {
  const p = LAMINAR_HOOD_BLOCKOUT;
  const w = p.displayWidth;
  const d = p.displayDepth;
  const h = p.displayHeight;
  return (
    <WallAnchoredGroup placement={p}>
      <SoftBox
        position={[0, 0.38, 0]}
        size={wallBoxSize(w, d * 0.55, 0.76)}
        radius={0.028}
        color={LAB_COLORS.cabinet}
        roughness={0.82}
      />
      <SoftBox
        position={[-d * 0.06, 0.78, 0]}
        size={wallBoxSize(w - 0.06, d * 0.82, 0.05)}
        radius={0.016}
        color={COUNTERTOP}
        roughness={0.46}
      />
      <SoftBox
        position={[d * 0.08, h * 0.62, 0]}
        size={wallBoxSize(w * 0.96, d * 0.72, h * 0.52)}
        radius={0.022}
        color={HOOD_SHELL}
        roughness={0.72}
      />
      <SoftBox
        position={[-d * 0.22, h * 0.48, 0]}
        size={wallBoxSize(w * 0.62, d * 0.12, h * 0.28)}
        radius={0.012}
        color="#D8DEE4"
        roughness={0.68}
        cast={false}
      />
    </WallAnchoredGroup>
  );
}

/** Back-center storage / bookshelf blockout. */
export function StorageShelfBlockout() {
  const p = STORAGE_SHELF;
  return (
    <WallAnchoredGroup placement={p}>
      <SoftBox
        position={[0, 0.41, 0]}
        size={wallBoxSize(p.width, p.depth, 0.82)}
        radius={0.03}
        color={LAB_COLORS.cabinet}
        roughness={0.82}
      />
      <SoftBox
        position={[0.02, 1.38, 0]}
        size={wallBoxSize(p.width * 0.92, p.depth * 0.88, 1.52)}
        radius={0.025}
        color={LAB_COLORS.dark}
        roughness={0.74}
      />
      <SoftBox
        position={[-0.04, 1.58, 0]}
        size={wallBoxSize(p.width * 0.75, p.depth * 0.62, 0.05)}
        radius={0.012}
        color={LAB_COLORS.teal}
        roughness={0.75}
        cast={false}
      />
    </WallAnchoredGroup>
  );
}

/** Engineering back-right bench. */
export function EngineeringBenchBlockout() {
  const p = ENGINEERING_BENCH;
  return (
    <WallAnchoredGroup placement={p}>
      <SoftBox
        position={[0, 0.41, 0]}
        size={wallBoxSize(p.width, p.depth, 0.84)}
        radius={0.03}
        color={LAB_COLORS.cabinet}
        roughness={0.82}
      />
      <SoftBox
        position={[-0.02, 0.88, 0]}
        size={wallBoxSize(p.width - 0.08, p.depth - 0.06, 0.06)}
        radius={0.018}
        color={COUNTERTOP}
        roughness={0.46}
        metalness={0.05}
      />
      <SoftBox
        position={[0.02, 1.38, -p.width * 0.28]}
        size={wallBoxSize(p.width * 0.38, p.depth * 0.55, 0.52)}
        radius={0.02}
        color="#A3C2BA"
        roughness={0.8}
      />
    </WallAnchoredGroup>
  );
}

/** Dry Lab desk — left wall anchored. */
export function DryLabBenchBlockout() {
  const p = DRY_LAB_BENCH;
  return (
    <WallAnchoredGroup placement={p}>
      <SoftBox
        position={[0, 0.41, 0]}
        size={wallBoxSize(p.width, p.depth, 0.84)}
        radius={0.03}
        color={LAB_COLORS.cabinet}
        roughness={0.82}
      />
      <SoftBox
        position={[-0.02, 0.88, 0]}
        size={wallBoxSize(p.width - 0.08, p.depth - 0.06, 0.06)}
        radius={0.018}
        color={WOOD}
        roughness={0.72}
      />
    </WallAnchoredGroup>
  );
}

/** Segmented back working wall + left dry lab. */
export function WallFurnitureBlockouts() {
  return (
    <>
      <WetLabBenchBlockout />
      <LaminarHoodBlockout />
      <StorageShelfBlockout />
      <EngineeringBenchBlockout />
      <DryLabBenchBlockout />
    </>
  );
}

export { DRY_LAB_CHAIR } from "./roomPlacement";
