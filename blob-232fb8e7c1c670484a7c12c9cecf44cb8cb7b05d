import { LAB_COLORS } from "./labPalette";
import {
  CountertopModule,
  FURNITURE_DIMS,
  LabDeskModule,
  LaminarHoodShell,
  LowerCabinetModule,
  TallStorageModule,
  UpperCabinetModule,
  WallAnchoredFurniture,
} from "./labFurnitureSystem";
import { SoftBox } from "./SoftBox";
import {
  DRY_LAB_DESK,
  ENGINEERING_BENCH,
  ENGINEERING_TALL,
  TALL_STORAGE_A,
  TALL_STORAGE_B,
  WET_LAB_UPPER,
  WET_LAB_WORKSTATION,
} from "./roomPlacement";

/**
 * Phase 3.10 — modular laboratory furniture groups.
 * Each group has clear semantic role; no arbitrary filler blockouts.
 */

/** Dry Lab — wall desk + lower cabinets; computer sits on deskTopY. */
export function DryLabFurnitureGroup() {
  const p = DRY_LAB_DESK;
  const [x, y, z] = p.anchor.position;
  return (
    <WallAnchoredFurniture position={[x, y, z]} rotationY={p.anchor.rotationY}>
      <LabDeskModule
        width={p.width}
        depth={p.depth}
        leftCabinetW={0.58}
        rightCabinetW={0.58}
      />
    </WallAnchoredFurniture>
  );
}

/** Wet Lab — lower cabinets + countertop + integrated laminar hood. */
export function WetLabFurnitureGroup() {
  const p = WET_LAB_WORKSTATION;
  const [x, y, z] = p.anchor.position;
  const cabW = 0.72;
  const gap = 0.08;
  const leftX = -p.width * 0.5 + cabW * 0.5;
  const rightX = p.width * 0.5 - cabW * 0.5;

  return (
    <WallAnchoredFurniture position={[x, y, z]} rotationY={p.anchor.rotationY}>
      <LowerCabinetModule width={cabW} depth={p.depth} x={leftX} />
      <LowerCabinetModule width={cabW} depth={p.depth} x={rightX} withDrawer={false} />
      <CountertopModule width={p.width - gap} depth={p.depth} />
      <LaminarHoodShell width={p.width * 0.88} depth={p.depth} />
    </WallAnchoredFurniture>
  );
}

/** Wet Lab upper wall cabinet (optional side storage). */
export function WetLabUpperCabinet() {
  const p = WET_LAB_UPPER;
  const [x, y, z] = p.anchor.position;
  return (
    <WallAnchoredFurniture position={[x, y, z]} rotationY={p.anchor.rotationY}>
      <UpperCabinetModule width={p.width} depth={p.depth} />
    </WallAnchoredFurniture>
  );
}

/** Back-center tall storage rhythm — two modules with gap. */
export function StorageFurnitureGroup() {
  return (
    <>
      <TallStorageBlockout placement={TALL_STORAGE_A} />
      <TallStorageBlockout placement={TALL_STORAGE_B} />
    </>
  );
}

function TallStorageBlockout({
  placement,
}: {
  placement: typeof TALL_STORAGE_A;
}) {
  const [x, y, z] = placement.anchor.position;
  return (
    <WallAnchoredFurniture position={[x, y, z]} rotationY={placement.anchor.rotationY}>
      <TallStorageModule width={placement.width} depth={placement.depth} />
    </WallAnchoredFurniture>
  );
}

/** Engineering — side bench + tall storage; bioreactor stays floor-standing. */
export function EngineeringFurnitureGroup() {
  const bench = ENGINEERING_BENCH;
  const tall = ENGINEERING_TALL;
  const [bx, by, bz] = bench.anchor.position;
  const [tx, ty, tz] = tall.anchor.position;

  return (
    <>
      <WallAnchoredFurniture position={[bx, by, bz]} rotationY={bench.anchor.rotationY}>
        <LowerCabinetModule width={bench.width * 0.55} depth={bench.depth} x={-bench.width * 0.22} />
        <LowerCabinetModule
          width={bench.width * 0.38}
          depth={bench.depth}
          x={bench.width * 0.28}
          withDrawer={false}
        />
        <CountertopModule width={bench.width} depth={bench.depth} />
        {/* controller pedestal — clear semantic role */}
        <SoftBox
          position={[bench.width * 0.18, FURNITURE_DIMS.deskTopY + 0.28, bench.depth * 0.12]}
          size={[0.42, 0.56, 0.38]}
          radius={0.018}
          color={LAB_COLORS.structure}
          roughness={0.72}
        />
      </WallAnchoredFurniture>
      <WallAnchoredFurniture position={[tx, ty, tz]} rotationY={tall.anchor.rotationY}>
        <TallStorageModule width={tall.width} depth={tall.depth} />
      </WallAnchoredFurniture>
    </>
  );
}

export function WallFurnitureBlockouts() {
  return (
    <>
      <DryLabFurnitureGroup />
      <WetLabFurnitureGroup />
      <WetLabUpperCabinet />
      <StorageFurnitureGroup />
      <EngineeringFurnitureGroup />
    </>
  );
}
