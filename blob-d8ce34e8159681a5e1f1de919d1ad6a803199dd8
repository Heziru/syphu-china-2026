import { LAB_COLORS } from "./labPalette";
import { SoftBox } from "./SoftBox";

/** Phase 3.5 — enlarged central island (~28% footprint). */
export const CENTRAL_BENCH_SCALE = 1.28;
export const CENTRAL_BENCH_POSITION: [number, number, number] = [0, 0, 0.05];

const S = CENTRAL_BENCH_SCALE;
const COUNTERTOP = "#3A474A";

/** 中央实验台：composition anchor — sage base + dark countertop. */
export function CentralBench() {
  return (
    <group position={CENTRAL_BENCH_POSITION}>
      <SoftBox
        position={[0, 0.855 * S, 0.05 * S]}
        size={[2.96 * S, 0.072 * S, 1.66 * S]}
        radius={0.03 * S}
        color={COUNTERTOP}
        roughness={0.44}
        metalness={0.06}
      />
      <SoftBox
        position={[0, 0.41 * S, -0.02 * S]}
        size={[2.72 * S, 0.78 * S, 1.42 * S]}
        radius={0.04 * S}
        color={LAB_COLORS.cabinet}
        roughness={0.82}
        metalness={0.02}
      />
      <SoftBox
        position={[0, 0.045 * S, 0]}
        size={[2.68 * S, 0.08 * S, 1.38 * S]}
        radius={0.02 * S}
        color={LAB_COLORS.structure}
        roughness={0.7}
      />

      <DrawerStack x={-0.78 * S} />
      <Cupboard x={0.82 * S} />

      <SoftBox
        position={[-0.02 * S, 0.41 * S, 0.68 * S]}
        size={[2.58 * S, 0.012, 0.012]}
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
    <group position={[x, 0, 0.69 * S]}>
      {[0.62, 0.42, 0.22].map((y, i) => (
        <group key={y}>
          <SoftBox
            position={[0, y * S, 0]}
            size={[0.86 * S, 0.16 * S, 0.04 * S]}
            radius={0.012 * S}
            color={i === 1 ? "#A8C6BF" : LAB_COLORS.cabinet}
            roughness={0.78}
          />
          <SoftBox
            position={[0, y * S, 0.03 * S]}
            size={[0.2 * S, 0.018 * S, 0.03 * S]}
            radius={0.006 * S}
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
    <group position={[x, 0.42 * S, 0.69 * S]}>
      <SoftBox
        position={[0, 0, 0]}
        size={[0.9 * S, 0.62 * S, 0.04 * S]}
        radius={0.014 * S}
        color="#A3C2BA"
        roughness={0.8}
      />
      <SoftBox
        position={[-0.32 * S, 0.02 * S, 0.03 * S]}
        size={[0.028 * S, 0.16 * S, 0.03 * S]}
        radius={0.006 * S}
        color={LAB_COLORS.metal}
        roughness={0.3}
        metalness={0.5}
      />
    </group>
  );
}
