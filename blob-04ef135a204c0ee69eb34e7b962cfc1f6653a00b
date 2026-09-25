import { LabDecor } from "./LabDecor";
import { BlenderAsset } from "../components/BlenderAsset";
import { WINDOW_OPENING } from "./roomPlacement";
import { useEffect, useMemo } from "react";
import { Float32BufferAttribute } from "three";
import { ROOM_POLYGON } from "./layoutMath";
import { SoftBox } from "./SoftBox";
import { LAB_COLORS as C } from "./labPalette";
import { Plant, SpecimenBottles } from "./RoomAccents";
import { createStoneTexture } from "./roomSurfaces";
import {
  createDioramaBaseGeometry,
  WALL_SEGMENTS,
  wallSegmentMetrics,
} from "./roomLayout";

function FloorJoints() {
  const positions = useMemo(() => {
    const result: number[] = [];
    for (const axis of [0, 1])
      for (let step = -6; step <= 6; step++) {
        const value = step * 0.85,
          other = 1 - axis,
          crossings: number[] = [];
        ROOM_POLYGON.forEach((a, i) => {
          const b = ROOM_POLYGON[(i + 1) % ROOM_POLYGON.length];
          if (Math.abs(b[axis] - a[axis]) < 1e-8) return;
          const t = (value - a[axis]) / (b[axis] - a[axis]);
          if (t >= 0 && t <= 1)
            crossings.push(a[other] + t * (b[other] - a[other]));
        });
        if (crossings.length >= 2) {
          const lo = Math.min(...crossings),
            hi = Math.max(...crossings);
          if (axis === 0) result.push(value, 0.002, lo, value, 0.002, hi);
          else result.push(lo, 0.002, value, hi, 0.002, value);
        }
      }
    return new Float32Array(result);
  }, []);
  return (
    <lineSegments>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <lineBasicMaterial
        color="#847C67"
        transparent
        opacity={0.24}
        depthWrite={false}
      />
    </lineSegments>
  );
}
function WindowDressing() {
  const [a, b] = WALL_SEGMENTS[4];
  const m = wallSegmentMetrics(a, b),
    yaw = Math.atan2(m.inwardX, m.inwardZ);
  const opening = WINDOW_OPENING;
  return (
    <group position={[m.midX, 0, m.midZ]} rotation={[0, yaw, 0]}>
      <group position={[opening.x, (opening.bottom + opening.top) / 2, 0]}>
        <mesh position={[0, 0, -0.025]}>
          <planeGeometry args={[opening.w, opening.top - opening.bottom]} />
          <meshStandardMaterial
            color="#DFE5CE"
            emissive="#D9CFAD"
            emissiveIntensity={0.35}
            side={2}
            roughness={1}
          />
        </mesh>
        {[-1, 0, 1].map((s) => (
          <SoftBox
            key={s}
            position={[(s * opening.w) / 2, 0, 0.05]}
            size={[0.055, opening.top - opening.bottom + 0.08, 0.13]}
            color={C.paper}
            radius={0.006}
          />
        ))}
        {[-1, 1].map((s) => (
          <SoftBox
            key={s}
            position={[0, (s * (opening.top - opening.bottom)) / 2, 0.07]}
            size={[opening.w + 0.13, 0.07, 0.15]}
            color={C.paper}
            radius={0.006}
          />
        ))}
        {Array.from({ length: 11 }, (_, i) => (
          <SoftBox
            key={i}
            position={[
              0,
              (opening.top - opening.bottom) / 2 - 0.07 - i * 0.042,
              0.12,
            ]}
            rotation={[0.18, 0, 0]}
            size={[opening.w - 0.08, 0.012, 0.085]}
            color="#C6B798"
            radius={0.001}
            cast
          />
        ))}
        {[-0.65, 0.65].map((x) => (
          <SoftBox
            key={x}
            position={[x, 0.39, 0.167]}
            size={[0.007, 0.47, 0.008]}
            color={C.paper}
            radius={0.001}
          />
        ))}
      </group>
      <SoftBox
        position={[
          opening.x,
          opening.bottom - opening.sillThickness / 2,
          opening.sillOffset,
        ]}
        size={[opening.w + 0.18, opening.sillThickness, opening.sillDepth]}
        color={C.wood}
        radius={0.008}
      />
      <group position={[opening.x - 0.83, opening.bottom, 0.17]}>
        <Plant scale={0.72} />
      </group>
      <group position={[opening.x + 0.74, opening.bottom, 0.17]}>
        <Plant scale={0.62} />
      </group>
    </group>
  );
}
function WallShelf({ x }: { x: number }) {
  return (
    <group position={[x, 1.66, -4.42]}>
      <SoftBox
        position={[0, 0, 0.19]}
        size={[1.45, 0.05, 0.35]}
        color={C.wood}
        radius={0.005}
      />
      {[-0.55, 0.55].map((x) => (
        <SoftBox
          key={x}
          position={[x, -0.12, 0.15]}
          size={[0.025, 0.23, 0.025]}
          color={C.metal}
          radius={0.002}
        />
      ))}
      <group position={[-0.57, 0.03, 0.19]}>
        <SpecimenBottles count={6} />
      </group>
      <group position={[0.52, 0.03, 0.17]}>
        <Plant scale={0.6} />
      </group>
    </group>
  );
}
export function RoomShell() {
  const base = useMemo(() => {
    const geometry = createDioramaBaseGeometry(),
      p = geometry.getAttribute("position"),
      uv = [];
    for (let i = 0; i < p.count; i++)
      uv.push(p.getX(i) / 0.85, p.getZ(i) / 0.85);
    geometry.setAttribute("uv", new Float32BufferAttribute(uv, 2));
    return geometry;
  }, []);
  const stone = useMemo(createStoneTexture, []);
  useEffect(
    () => () => {
      base.dispose();
      stone.dispose();
    },
    [base, stone],
  );
  return (
    <group name="architecture">
      <mesh geometry={base} receiveShadow castShadow>
        <meshStandardMaterial map={stone} roughness={0.83} />
      </mesh>
      <BlenderAsset name="laboratory-shell" />
      <WindowDressing />
      <FloorJoints />
      <LabDecor />
      <WallShelf x={2.42} />
      <group position={[-4.8, 0, 2.15]}>
        <Plant scale={1.6} />
      </group>
      <group position={[3.7, 0, 3.8]}>
        <Plant scale={1.9} />
      </group>
      <mesh
        position={[0, -0.11, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[200, 200]} />
        <shadowMaterial
          color="#6c756d"
          transparent
          opacity={0.18}
          depthWrite={false}
        />
      </mesh>
      {[-2.45, 2.45].map((x) => (
        <group key={x} position={[x, 2.67, -4.42]}>
          <SoftBox
            position={[0, 0, 0]}
            size={[1.38, 0.05, 0.07]}
            color={C.metal}
            radius={0.006}
          />
          <SoftBox
            position={[0, -0.028, 0.025]}
            size={[1.3, 0.018, 0.04]}
            color="#F1DFC0"
            emissive="#F3C991"
            emissiveIntensity={0.7}
            radius={0.003}
            cast={false}
          />
        </group>
      ))}
    </group>
  );
}
