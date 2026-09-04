import type { ReactNode } from "react";
import { LAB_COLORS } from "./labPalette";
import { SoftBox } from "./SoftBox";
import type { WallFurniturePlacement } from "./roomPlacement";
import {
  ENGINEERING_BENCH,
  LAMINAR_HOOD_BLOCKOUT,
  STORAGE_SHELF,
  WET_LAB_BENCH,
} from "./roomPlacement";

const COUNTERTOP = "#3A474A";
const HOOD_SHELL = "#ECEFF2";

/** Standard: local X=width, local Z=depth, +Z=front. */
function boxSize(width: number, depth: number, height: number): [number, number, number] {
  return [width, height, depth];
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

/** Back-left Wet Lab strip — bench segment (hood continues the strip). */
export function WetLabBenchBlockout() {
  const p = WET_LAB_BENCH;
  return (
    <WallAnchoredGroup placement={p}>
      <SoftBox
        position={[0, 0.41, 0]}
        size={boxSize(p.width, p.depth, 0.82)}
        radius={0.03}
        color={LAB_COLORS.cabinet}
        roughness={0.82}
      />
      <SoftBox
        position={[0, 0.86, p.depth * 0.02]}
        size={boxSize(p.width - 0.06, p.depth - 0.04, 0.06)}
        radius={0.018}
        color={COUNTERTOP}
        roughness={0.48}
      />
    </WallAnchoredGroup>
  );
}

/**
 * Horizontal clean-bench hood — WIDTH > DEPTH, opening at local +Z (room interior).
 * Sits on / continues the Wet Lab back-left wall strip.
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
        size={boxSize(w, d * 0.52, 0.76)}
        radius={0.028}
        color={LAB_COLORS.cabinet}
        roughness={0.82}
      />
      <SoftBox
        position={[0, 0.78, d * 0.04]}
        size={boxSize(w - 0.06, d * 0.88, 0.05)}
        radius={0.016}
        color={COUNTERTOP}
        roughness={0.46}
      />
      <SoftBox
        position={[0, h * 0.62, -d * 0.06]}
        size={boxSize(w * 0.94, d * 0.62, h * 0.48)}
        radius={0.022}
        color={HOOD_SHELL}
        roughness={0.72}
      />
      {/* hood opening faces +Z (room) */}
      <SoftBox
        position={[0, h * 0.5, d * 0.28]}
        size={boxSize(w * 0.58, d * 0.14, h * 0.26)}
        radius={0.012}
        color="#D8DEE4"
        roughness={0.68}
        cast={false}
      />
    </WallAnchoredGroup>
  );
}

/** Back-center built-in storage strip. */
export function StorageShelfBlockout() {
  const p = STORAGE_SHELF;
  return (
    <WallAnchoredGroup placement={p}>
      <SoftBox
        position={[0, 0.41, 0]}
        size={boxSize(p.width, p.depth, 0.82)}
        radius={0.03}
        color={LAB_COLORS.cabinet}
        roughness={0.82}
      />
      <SoftBox
        position={[0, 1.38, p.depth * 0.02]}
        size={boxSize(p.width * 0.92, p.depth * 0.9, 1.52)}
        radius={0.025}
        color={LAB_COLORS.dark}
        roughness={0.74}
      />
    </WallAnchoredGroup>
  );
}

/** Back-right Engineering strip — bioreactor sits on +Z surface. */
export function EngineeringBenchBlockout() {
  const p = ENGINEERING_BENCH;
  return (
    <WallAnchoredGroup placement={p}>
      <SoftBox
        position={[0, 0.41, 0]}
        size={boxSize(p.width, p.depth, 0.84)}
        radius={0.03}
        color={LAB_COLORS.cabinet}
        roughness={0.82}
      />
      <SoftBox
        position={[0, 0.88, p.depth * 0.02]}
        size={boxSize(p.width - 0.06, p.depth - 0.04, 0.06)}
        radius={0.018}
        color={COUNTERTOP}
        roughness={0.46}
        metalness={0.05}
      />
      <SoftBox
        position={[p.width * 0.22, 1.36, p.depth * 0.04]}
        size={boxSize(p.width * 0.34, p.depth * 0.5, 0.5)}
        radius={0.02}
        color="#A3C2BA"
        roughness={0.8}
      />
    </WallAnchoredGroup>
  );
}

/** Dry Lab uses production computer model (built-in desk) — no blockout. */

export function WallFurnitureBlockouts() {
  return (
    <>
      <WetLabBenchBlockout />
      <LaminarHoodBlockout />
      <StorageShelfBlockout />
      <EngineeringBenchBlockout />
    </>
  );
}
