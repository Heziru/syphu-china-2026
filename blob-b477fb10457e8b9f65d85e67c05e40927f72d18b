import { LAB_COLORS } from "./labPalette";
import { SoftBox } from "./SoftBox";

const COUNTERTOP = "#3A474A";
const WOOD = "#C4A882";

/** Segmented back-wall masses — gaps between Wet / Storage / Engineering zones. */
export function BackWallZones() {
  return (
    <group>
      {/* Wet Lab back support (left) */}
      <group position={[-2.55, 0, -3.04]}>
        <SoftBox
          position={[0, 0.42, 0]}
          size={[1.75, 0.82, 0.52]}
          radius={0.03}
          color={LAB_COLORS.cabinet}
          roughness={0.82}
        />
        <SoftBox
          position={[0, 0.86, -0.01]}
          size={[1.68, 0.06, 0.48]}
          radius={0.018}
          color={COUNTERTOP}
          roughness={0.48}
        />
        <SoftBox
          position={[0, 1.48, -0.04]}
          size={[1.35, 0.06, 0.28]}
          radius={0.015}
          color={WOOD}
          roughness={0.78}
        />
      </group>

      {/* Center storage — tall module (bookshelf zone) */}
      <group position={[0.45, 0, -3.06]}>
        <SoftBox
          position={[0, 0.42, 0]}
          size={[1.15, 0.82, 0.48]}
          radius={0.03}
          color={LAB_COLORS.cabinet}
          roughness={0.82}
        />
        <SoftBox
          position={[0, 1.35, -0.02]}
          size={[1.05, 1.55, 0.4]}
          radius={0.025}
          color={LAB_COLORS.dark}
          roughness={0.74}
        />
        <SoftBox
          position={[0, 1.55, 0.04]}
          size={[0.85, 0.05, 0.28]}
          radius={0.012}
          color={LAB_COLORS.teal}
          roughness={0.75}
          cast={false}
        />
      </group>

      {/* Engineering back support (right) */}
      <group position={[2.55, 0, -3.04]}>
        <SoftBox
          position={[0, 0.42, 0]}
          size={[1.65, 0.82, 0.52]}
          radius={0.03}
          color={LAB_COLORS.cabinet}
          roughness={0.82}
        />
        <SoftBox
          position={[0, 0.86, -0.01]}
          size={[1.58, 0.06, 0.48]}
          radius={0.018}
          color={COUNTERTOP}
          roughness={0.48}
        />
        <SoftBox
          position={[0, 1.52, -0.04]}
          size={[1.2, 0.55, 0.3]}
          radius={0.02}
          color="#A3C2BA"
          roughness={0.8}
        />
      </group>
    </group>
  );
}

/** Dry Lab — aligned to left angled wall, minimal extension toward center. */
export function DryLabWorkbench() {
  return (
    <group position={[-4.45, 0, 0.25]}>
      <SoftBox
        position={[0, 0.42, 0]}
        size={[2.35, 0.84, 1.25]}
        radius={0.03}
        color={LAB_COLORS.cabinet}
        roughness={0.82}
      />
      <SoftBox
        position={[0, 0.88, 0.02]}
        size={[2.28, 0.06, 1.18]}
        radius={0.018}
        color={WOOD}
        roughness={0.72}
      />
    </group>
  );
}

/** Engineering — back-right corner workstation. */
export function EngineeringWorkbench() {
  return (
    <group position={[4.05, 0, -2.05]}>
      <SoftBox
        position={[0, 0.42, 0]}
        size={[2.15, 0.84, 1.45]}
        radius={0.03}
        color={LAB_COLORS.cabinet}
        roughness={0.82}
      />
      <SoftBox
        position={[0, 0.88, 0.02]}
        size={[2.08, 0.06, 1.38]}
        radius={0.018}
        color={COUNTERTOP}
        roughness={0.46}
        metalness={0.05}
      />
    </group>
  );
}

/** Wet Lab floor anchor marker position export for RoomShell. */
export const WET_LAB_HOOD_POSITION: [number, number, number] = [-2.75, 0, -2.55];
export const WET_LAB_HOOD_ROTATION_Y = 0.18;

export const DRY_LAB_CHAIR_POSITION: [number, number, number] = [-4.65, 0, 0.55];
export const DRY_LAB_CHAIR_ROTATION_Y = 0.85;
