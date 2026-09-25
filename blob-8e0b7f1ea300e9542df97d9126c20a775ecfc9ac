import { LAB_COLORS } from "./labPalette";
import { SoftBox } from "./SoftBox";
import { CENTRAL_BENCH } from "./roomPlacement";

export const CENTRAL_BENCH_POSITION = CENTRAL_BENCH.position;
export const CENTRAL_BENCH_WIDTH = CENTRAL_BENCH.width;
export const CENTRAL_BENCH_DEPTH = CENTRAL_BENCH.depth;

const COUNTERTOP = "#3A474A";
const W = CENTRAL_BENCH.width;
const D = CENTRAL_BENCH.depth;

/** Central island — sole free-standing workstation. */
export function CentralBench() {
  return (
    <group position={CENTRAL_BENCH_POSITION}>
      <SoftBox
        position={[0, 0.82, 0.04]}
        size={[W, 0.065, D]}
        radius={0.028}
        color={COUNTERTOP}
        roughness={0.44}
        metalness={0.06}
      />
      <SoftBox
        position={[0, 0.395, -0.02]}
        size={[W - 0.24, 0.74, D - 0.24]}
        radius={0.038}
        color={LAB_COLORS.cabinet}
        roughness={0.82}
        metalness={0.02}
      />
      <SoftBox
        position={[0, 0.042, 0]}
        size={[W - 0.28, 0.075, D - 0.28]}
        radius={0.018}
        color={LAB_COLORS.structure}
        roughness={0.7}
      />

      <DrawerStack x={-W * 0.28} />
      <Cupboard x={W * 0.3} />

      <SoftBox
        position={[0, 0.395, D * 0.38]}
        size={[W * 0.88, 0.012, 0.012]}
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
    <group position={[x, 0, D * 0.38]}>
      {[0.6, 0.4, 0.2].map((y, i) => (
        <group key={y}>
          <SoftBox
            position={[0, y, 0]}
            size={[0.82, 0.15, 0.038]}
            radius={0.011}
            color={i === 1 ? "#A8C6BF" : LAB_COLORS.cabinet}
            roughness={0.78}
          />
          <SoftBox
            position={[0, y, 0.028]}
            size={[0.18, 0.016, 0.028]}
            radius={0.005}
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
    <group position={[x, 0.395, D * 0.38]}>
      <SoftBox
        position={[0, 0, 0]}
        size={[0.85, 0.58, 0.038]}
        radius={0.013}
        color="#A3C2BA"
        roughness={0.8}
      />
      <SoftBox
        position={[-0.3, 0.018, 0.028]}
        size={[0.026, 0.14, 0.028]}
        radius={0.005}
        color={LAB_COLORS.metal}
        roughness={0.3}
        metalness={0.5}
      />
    </group>
  );
}
