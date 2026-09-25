import { useMemo } from "react";
import { CentralBench } from "./CentralBench";
import { LAB_COLORS } from "./labPalette";
import { SoftBox } from "./SoftBox";
import { BackStorageRun, DryLabWorkbench, EngineeringWorkbench } from "./roomComposition";
import { LaminarHoodModel } from "./laminar-hood/LaminarHoodModel";
import { LabChairModel } from "./lab-chair/LabChairModel";
import {
  createDioramaBaseGeometry,
  FLOOR_FOOTPRINT,
  pointOnWall,
  wallSegmentMetrics,
  WALL_HEIGHT,
  WALL_SEGMENTS,
  WALL_THICKNESS,
  type FootprintXZ,
} from "./roomLayout";

function WallSegment({ a, b }: { a: FootprintXZ; b: FootprintXZ }) {
  const { length, midX, midZ, rotY } = wallSegmentMetrics(a, b);
  return (
    <mesh position={[midX, WALL_HEIGHT * 0.5, midZ]} rotation={[0, rotY, 0]} receiveShadow castShadow>
      <boxGeometry args={[WALL_THICKNESS, WALL_HEIGHT, length]} />
      <meshStandardMaterial color={LAB_COLORS.wall} roughness={0.86} />
    </mesh>
  );
}

function LeftWallWindow() {
  const a = FLOOR_FOOTPRINT[0];
  const b = FLOOR_FOOTPRINT[5];
  const { rotY, inwardX, inwardZ } = wallSegmentMetrics(a, b);
  const [wx, wz] = pointOnWall(a, b, 0.36);
  const inset = WALL_THICKNESS * 0.5 + 0.025;
  const cx = wx + inwardX * inset;
  const cz = wz + inwardZ * inset;
  const cy = 2.55;
  return (
    <group position={[cx, cy, cz]} rotation={[0, rotY, 0]}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.04, 1.7, 2.6]} />
        <meshStandardMaterial
          color={LAB_COLORS.window}
          emissive={LAB_COLORS.window}
          emissiveIntensity={0.55}
          roughness={1}
        />
      </mesh>
      <SoftBox
        position={[-0.05, 0.87, 0]}
        size={[0.08, 0.1, 2.82]}
        radius={0.02}
        color={LAB_COLORS.structure}
        roughness={0.55}
        cast={false}
      />
      <SoftBox
        position={[-0.05, -0.87, 0]}
        size={[0.08, 0.1, 2.82]}
        radius={0.02}
        color={LAB_COLORS.structure}
        roughness={0.55}
        cast={false}
      />
      <SoftBox
        position={[-0.05, 0, -1.36]}
        size={[0.08, 1.84, 0.1]}
        radius={0.02}
        color={LAB_COLORS.structure}
        roughness={0.55}
        cast={false}
      />
      <SoftBox
        position={[-0.05, 0, 1.36]}
        size={[0.08, 1.84, 0.1]}
        radius={0.02}
        color={LAB_COLORS.structure}
        roughness={0.55}
        cast={false}
      />
      <SoftBox
        position={[-0.06, 0, 0]}
        size={[0.06, 1.7, 0.08]}
        radius={0.015}
        color={LAB_COLORS.structure}
        roughness={0.55}
        cast={false}
      />
    </group>
  );
}

export function RoomShell() {
  const baseGeometry = useMemo(() => createDioramaBaseGeometry(), []);

  return (
    <group>
      <mesh geometry={baseGeometry} receiveShadow castShadow>
        <meshStandardMaterial color={LAB_COLORS.floor} roughness={0.9} />
      </mesh>

      {WALL_SEGMENTS.map(([a, b]) => (
        <WallSegment key={`${a[0]},${a[1]}-${b[0]},${b[1]}`} a={a} b={b} />
      ))}

      <LeftWallWindow />

      <BackStorageRun />
      <DryLabWorkbench />
      <EngineeringWorkbench />
      <CentralBench />

      <group position={[-2.15, 0, -2.35]} rotation={[0, 0.22, 0]}>
        <LaminarHoodModel />
      </group>

      <group position={[-3.95, 0, 0.05]} rotation={[0, 0.75, 0]}>
        <LabChairModel />
      </group>
    </group>
  );
}
