import { Line } from "@react-three/drei";
import {
  FLOOR_FOOTPRINT,
  furnitureFootprintCorners,
  WALL_SEGMENTS,
  wallSegmentMetrics,
} from "./roomLayout";
import {
  CENTRAL_BENCH,
  HERO_PLACEMENTS,
  WALL_FURNITURE,
} from "./roomPlacement";

/** Dev-only ?labLayoutDebug=1 floor-plan overlay. */
export function readLabLayoutDebugState(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("labLayoutDebug") === "1";
}

const POLYGON_Y = 0.06;
const NORMAL_LEN = 0.55;

export function LabLayoutDebug() {
  const polygonPoints = [...FLOOR_FOOTPRINT, FLOOR_FOOTPRINT[0]].map(
    ([x, z]) => [x, POLYGON_Y, z] as [number, number, number],
  );

  return (
    <group>
      <Line points={polygonPoints} color="#E74C3C" lineWidth={2} />

      {WALL_SEGMENTS.map(([a, b], i) => {
        const m = wallSegmentMetrics(a, b);
        const [mx, mz] = [(a[0] + b[0]) * 0.5, (a[1] + b[1]) * 0.5];
        const wallLine: [number, number, number][] = [
          [a[0], POLYGON_Y, a[1]],
          [b[0], POLYGON_Y, b[1]],
        ];
        const normalLine: [number, number, number][] = [
          [mx, POLYGON_Y, mz],
          [mx + m.inwardX * NORMAL_LEN, POLYGON_Y, mz + m.inwardZ * NORMAL_LEN],
        ];
        return (
          <group key={`wall-debug-${i}`}>
            <Line points={wallLine} color="#3498DB" lineWidth={1.5} />
            <Line points={normalLine} color="#2ECC71" lineWidth={1.5} />
          </group>
        );
      })}

      {WALL_FURNITURE.map((item) => {
        const corners = furnitureFootprintCorners(item.anchor, item.width, item.depth);
        const loop = [...corners, corners[0]].map(
          ([x, z]) => [x, POLYGON_Y + 0.01, z] as [number, number, number],
        );
        return <Line key={item.id} points={loop} color="#9B59B6" lineWidth={1.5} />;
      })}

      {(() => {
        const [cx, , cz] = CENTRAL_BENCH.position;
        const hw = CENTRAL_BENCH.width * 0.5;
        const hd = CENTRAL_BENCH.depth * 0.5;
        const corners: [number, number, number][] = [
          [cx - hw, POLYGON_Y + 0.02, cz - hd],
          [cx + hw, POLYGON_Y + 0.02, cz - hd],
          [cx + hw, POLYGON_Y + 0.02, cz + hd],
          [cx - hw, POLYGON_Y + 0.02, cz + hd],
          [cx - hw, POLYGON_Y + 0.02, cz - hd],
        ];
        return <Line points={corners} color="#F39C12" lineWidth={2} />;
      })()}

      {Object.values(HERO_PLACEMENTS).map((hero) => (
        <mesh key={hero.id} position={[hero.position[0], POLYGON_Y + 0.03, hero.position[2]]}>
          <sphereGeometry args={[0.12, 10, 10]} />
          <meshBasicMaterial color="#1ABC9C" wireframe />
        </mesh>
      ))}
    </group>
  );
}
