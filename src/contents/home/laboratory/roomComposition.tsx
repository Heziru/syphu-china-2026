import { LAB_COLORS } from "./labPalette";
import { SoftBox } from "./SoftBox";

const COUNTERTOP = "#3A474A";
const WOOD = "#C4A882";

/** Back-wall storage run — occupies ~70% of back wall width. */
export function BackStorageRun() {
  return (
    <group position={[0.15, 0, -3.02]}>
      <SoftBox
        position={[0, 0.44, 0]}
        size={[6.2, 0.88, 0.62]}
        radius={0.035}
        color={LAB_COLORS.cabinet}
        roughness={0.82}
      />
      <SoftBox
        position={[0, 0.92, -0.02]}
        size={[6.05, 0.07, 0.58]}
        radius={0.02}
        color={COUNTERTOP}
        roughness={0.48}
        metalness={0.06}
      />
      <SoftBox
        position={[0, 1.62, -0.08]}
        size={[5.6, 0.08, 0.38]}
        radius={0.02}
        color={WOOD}
        roughness={0.78}
      />
      <SoftBox
        position={[0, 2.05, -0.1]}
        size={[5.6, 0.72, 0.34]}
        radius={0.025}
        color={WOOD}
        roughness={0.8}
      />
      <SoftBox
        position={[-2.05, 1.58, 0.02]}
        size={[1.05, 0.06, 0.42]}
        radius={0.015}
        color={LAB_COLORS.teal}
        roughness={0.75}
        cast={false}
      />
      <SoftBox
        position={[0.35, 1.58, 0.02]}
        size={[0.95, 0.06, 0.42]}
        radius={0.015}
        color={LAB_COLORS.book}
        roughness={0.75}
        cast={false}
      />
      <SoftBox
        position={[2.15, 1.58, 0.02]}
        size={[1.0, 0.06, 0.42]}
        radius={0.015}
        color={LAB_COLORS.coral}
        roughness={0.75}
        cast={false}
      />
    </group>
  );
}

/** Dry Lab workstation mass — L-shaped desk under left window zone. */
export function DryLabWorkbench() {
  return (
    <group position={[-3.55, 0, -0.35]}>
      <SoftBox
        position={[0, 0.44, 0]}
        size={[2.85, 0.88, 1.55]}
        radius={0.035}
        color={LAB_COLORS.cabinet}
        roughness={0.82}
      />
      <SoftBox
        position={[0, 0.92, 0.02]}
        size={[2.75, 0.07, 1.48]}
        radius={0.02}
        color={WOOD}
        roughness={0.72}
      />
      <SoftBox
        position={[1.05, 0.44, 1.05]}
        size={[1.35, 0.88, 1.25]}
        radius={0.03}
        color={LAB_COLORS.cabinet}
        roughness={0.82}
      />
      <SoftBox
        position={[1.05, 0.92, 1.05]}
        size={[1.28, 0.07, 1.18]}
        radius={0.02}
        color={WOOD}
        roughness={0.72}
      />
    </group>
  );
}

/** Engineering zone — substantial counter along right/back-right wall. */
export function EngineeringWorkbench() {
  return (
    <group position={[3.55, 0, -0.95]}>
      <SoftBox
        position={[0, 0.44, 0]}
        size={[2.65, 0.88, 1.75]}
        radius={0.035}
        color={LAB_COLORS.cabinet}
        roughness={0.82}
      />
      <SoftBox
        position={[0, 0.92, 0.02]}
        size={[2.55, 0.07, 1.68]}
        radius={0.02}
        color={COUNTERTOP}
        roughness={0.46}
        metalness={0.05}
      />
      <SoftBox
        position={[-0.95, 0.44, -0.55]}
        size={[0.72, 0.88, 0.62]}
        radius={0.03}
        color="#A3C2BA"
        roughness={0.8}
      />
      <SoftBox
        position={[-0.95, 0.92, -0.55]}
        size={[0.68, 0.07, 0.58]}
        radius={0.02}
        color={COUNTERTOP}
        roughness={0.46}
      />
    </group>
  );
}
