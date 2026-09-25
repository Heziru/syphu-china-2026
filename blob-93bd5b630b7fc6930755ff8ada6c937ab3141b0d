import { LAB_COLORS } from "./labPalette";
import { SoftBox } from "./SoftBox";

/** Phase 3.6 — island scale trimmed ~20% from 3.5; width reduced further for circulation. */
export const CENTRAL_BENCH_SCALE = 1.08;
export const CENTRAL_BENCH_WIDTH_SCALE = 0.9;
export const CENTRAL_BENCH_POSITION: [number, number, number] = [0, 0, 0.42];

const S = CENTRAL_BENCH_SCALE;
const WX = CENTRAL_BENCH_WIDTH_SCALE;
const COUNTERTOP = "#3A474A";

/** 中央实验台：largest anchor with circulation space on all sides. */
export function CentralBench() {
  return (
    <group position={CENTRAL_BENCH_POSITION}>
      <SoftBox
        position={[0, 0.82 * S, 0.04 * S]}
        size={[2.96 * S * WX, 0.065 * S, 1.66 * S]}
        radius={0.028 * S}
        color={COUNTERTOP}
        roughness={0.44}
        metalness={0.06}
      />
      <SoftBox
        position={[0, 0.395 * S, -0.02 * S]}
        size={[2.72 * S * WX, 0.74 * S, 1.42 * S]}
        radius={0.038 * S}
        color={LAB_COLORS.cabinet}
        roughness={0.82}
        metalness={0.02}
      />
      <SoftBox
        position={[0, 0.042 * S, 0]}
        size={[2.68 * S * WX, 0.075 * S, 1.38 * S]}
        radius={0.018 * S}
        color={LAB_COLORS.structure}
        roughness={0.7}
      />

      <DrawerStack x={-0.78 * S * WX} />
      <Cupboard x={0.82 * S * WX} />

      <SoftBox
        position={[-0.02 * S * WX, 0.395 * S, 0.66 * S]}
        size={[2.5 * S * WX, 0.012, 0.012]}
        radius={0.004}
        color={LAB_COLORS.structure}
        roughness={0.55}
        cast={false}
      />
    </group>
  );
}

function DrawerStack({ x }: { x: number }) {
  return (
    <group position={[x, 0, 0.66 * S]}>
      {[0.6, 0.4, 0.2].map((y, i) => (
        <group key={y}>
          <SoftBox
            position={[0, y * S, 0]}
            size={[0.82 * S * WX, 0.15 * S, 0.038 * S]}
            radius={0.011 * S}
            color={i === 1 ? "#A8C6BF" : LAB_COLORS.cabinet}
            roughness={0.78}
          />
          <SoftBox
            position={[0, y * S, 0.028 * S]}
            size={[0.18 * S * WX, 0.016 * S, 0.028 * S]}
            radius={0.005 * S}
            color={LAB_COLORS.metal}
            roughness={0.32}
            metalness={0.45}
          />
        </group>
      ))}
    </group>
  );
}

function Cupboard({ x }: { x: number }) {
  return (
    <group position={[x, 0.395 * S, 0.66 * S]}>
      <SoftBox
        position={[0, 0, 0]}
        size={[0.85 * S * WX, 0.58 * S, 0.038 * S]}
        radius={0.013 * S}
        color="#A3C2BA"
        roughness={0.8}
      />
      <SoftBox
        position={[-0.3 * S * WX, 0.018 * S, 0.028 * S]}
        size={[0.026 * S, 0.14 * S, 0.028 * S]}
        radius={0.005 * S}
        color={LAB_COLORS.metal}
        roughness={0.3}
        metalness={0.5}
      />
    </group>
  );
}
