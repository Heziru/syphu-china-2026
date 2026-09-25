import type { ReactNode } from "react";
import { LAB_COLORS } from "./labPalette";
import { SoftBox } from "./SoftBox";

/** Shared laboratory furniture palette — sage / charcoal / wood / warm white. */
export const FURNITURE_MAT = {
  sageCabinet: LAB_COLORS.cabinet,
  darkCountertop: LAB_COLORS.dark,
  warmWood: "#C4A882",
  warmWhite: "#ECEFF2",
  darkHandle: LAB_COLORS.metal,
} as const;

export const FURNITURE_DIMS = {
  lowerHeight: 0.76,
  lowerDepth: 0.6,
  tallHeight: 2.05,
  tallDepth: 0.52,
  upperHeight: 0.52,
  upperDepth: 0.32,
  countertopThickness: 0.05,
  deskTopY: 0.79,
} as const;

function boxSize(width: number, depth: number, height: number): [number, number, number] {
  return [width, height, depth];
}

function CabinetHandle({ x, y, z }: { x: number; y: number; z: number }) {
  return (
    <SoftBox
      position={[x, y, z]}
      size={[0.16, 0.022, 0.028]}
      radius={0.005}
      color={FURNITURE_MAT.darkHandle}
      roughness={0.32}
      metalness={0.45}
      cast={false}
    />
  );
}

/** Lower base cabinet module — sage green, semi-matte. */
export function LowerCabinetModule({
  width,
  depth = FURNITURE_DIMS.lowerDepth,
  x = 0,
  z = 0,
  withDrawer = true,
}: {
  width: number;
  depth?: number;
  x?: number;
  z?: number;
  withDrawer?: boolean;
}) {
  const h = FURNITURE_DIMS.lowerHeight;
  return (
    <group position={[x, 0, z]}>
      <SoftBox
        position={[0, h * 0.5, 0]}
        size={boxSize(width, depth, h)}
        radius={0.028}
        color={FURNITURE_MAT.sageCabinet}
        roughness={0.82}
      />
      <SoftBox
        position={[0, 0.042, depth * 0.38]}
        size={boxSize(width - 0.08, 0.075, 0.038)}
        radius={0.014}
        color={LAB_COLORS.structure}
        roughness={0.7}
        cast={false}
      />
      {withDrawer && (
        <>
          <SoftBox
            position={[0, h * 0.62, depth * 0.38]}
            size={boxSize(width - 0.14, h * 0.22, 0.034)}
            radius={0.01}
            color="#A8C6BF"
            roughness={0.78}
            cast={false}
          />
          <CabinetHandle x={0} y={h * 0.62} z={depth * 0.4} />
        </>
      )}
      {!withDrawer && <CabinetHandle x={width * 0.28} y={h * 0.52} z={depth * 0.4} />}
    </group>
  );
}

/** Dark charcoal countertop slab. */
export function CountertopModule({
  width,
  depth,
  y = FURNITURE_DIMS.deskTopY - FURNITURE_DIMS.countertopThickness * 0.5,
  x = 0,
  z = 0,
}: {
  width: number;
  depth: number;
  y?: number;
  x?: number;
  z?: number;
}) {
  return (
    <SoftBox
      position={[x, y, z + depth * 0.02]}
      size={boxSize(width - 0.06, depth - 0.04, FURNITURE_DIMS.countertopThickness)}
      radius={0.016}
      color={FURNITURE_MAT.darkCountertop}
      roughness={0.46}
      metalness={0.05}
    />
  );
}

/** Floor-to-ceiling tall storage cabinet. */
export function TallStorageModule({
  width,
  depth = FURNITURE_DIMS.tallDepth,
  x = 0,
  z = 0,
}: {
  width: number;
  depth?: number;
  x?: number;
  z?: number;
}) {
  const h = FURNITURE_DIMS.tallHeight;
  return (
    <group position={[x, 0, z]}>
      <SoftBox
        position={[0, h * 0.5, 0]}
        size={boxSize(width, depth, h)}
        radius={0.03}
        color={FURNITURE_MAT.sageCabinet}
        roughness={0.82}
      />
      {[0.35, 0.55, 0.75].map((t) => (
        <SoftBox
          key={t}
          position={[0, h * t, depth * 0.4]}
          size={boxSize(width - 0.12, 0.012, 0.012)}
          radius={0.003}
          color={LAB_COLORS.structure}
          roughness={0.55}
          cast={false}
        />
      ))}
      <CabinetHandle x={width * 0.3} y={h * 0.45} z={depth * 0.42} />
      <CabinetHandle x={-width * 0.3} y={h * 0.45} z={depth * 0.42} />
    </group>
  );
}

/** Wall-mounted upper cabinet — warm white. */
export function UpperCabinetModule({
  width,
  depth = FURNITURE_DIMS.upperDepth,
  y = 1.58,
  x = 0,
  z = 0,
}: {
  width: number;
  depth?: number;
  y?: number;
  x?: number;
  z?: number;
}) {
  const h = FURNITURE_DIMS.upperHeight;
  return (
    <group position={[x, 0, z]}>
      <SoftBox
        position={[0, y, 0]}
        size={boxSize(width, depth, h)}
        radius={0.022}
        color={FURNITURE_MAT.warmWhite}
        roughness={0.74}
      />
      <CabinetHandle x={0} y={y - h * 0.12} z={depth * 0.42} />
    </group>
  );
}

/** Laboratory desk — lower cabinets + dark countertop (no devices). */
export function LabDeskModule({
  width,
  depth,
  leftCabinetW,
  rightCabinetW,
}: {
  width: number;
  depth: number;
  leftCabinetW: number;
  rightCabinetW: number;
}) {
  const midW = width - leftCabinetW - rightCabinetW;
  const leftX = -width * 0.5 + leftCabinetW * 0.5;
  const rightX = width * 0.5 - rightCabinetW * 0.5;

  return (
    <group>
      <LowerCabinetModule width={leftCabinetW} depth={depth} x={leftX} withDrawer />
      <LowerCabinetModule width={rightCabinetW} depth={depth} x={rightX} withDrawer={false} />
      {midW > 0.2 && (
        <SoftBox
          position={[0, FURNITURE_DIMS.lowerHeight * 0.5, 0]}
          size={boxSize(midW - 0.04, depth, FURNITURE_DIMS.lowerHeight)}
          radius={0.02}
          color={FURNITURE_MAT.warmWood}
          roughness={0.78}
        />
      )}
      <CountertopModule width={width} depth={depth} />
    </group>
  );
}

/** Integrated laminar hood shell sitting on a bench countertop. */
export function LaminarHoodShell({
  width,
  depth,
  benchTopY = FURNITURE_DIMS.deskTopY,
}: {
  width: number;
  depth: number;
  benchTopY?: number;
}) {
  const hoodH = 0.68;
  const baseY = benchTopY + hoodH * 0.5;
  return (
    <group>
      <SoftBox
        position={[0, baseY, depth * 0.06]}
        size={boxSize(width * 0.96, depth * 0.88, hoodH)}
        radius={0.024}
        color={FURNITURE_MAT.warmWhite}
        roughness={0.72}
      />
      <SoftBox
        position={[0, benchTopY + hoodH * 0.38, depth * 0.32]}
        size={boxSize(width * 0.58, depth * 0.14, hoodH * 0.42)}
        radius={0.012}
        color="#D8DEE4"
        roughness={0.68}
        cast={false}
      />
    </group>
  );
}

export function WallAnchoredFurniture({
  position,
  rotationY,
  children,
}: {
  position: [number, number, number];
  rotationY: number;
  children: ReactNode;
}) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {children}
    </group>
  );
}
