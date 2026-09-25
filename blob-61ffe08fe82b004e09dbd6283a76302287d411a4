import { Line } from "@react-three/drei";
import {
  FLOOR_FOOTPRINT,
  furnitureFootprintCorners,
  localXZToWorld,
  WALL_SEGMENTS,
  wallSegmentMetrics,
  worldAxisFromLocal,
} from "./roomLayout";
import {
  CENTRAL_BENCH,
  HERO_PLACEMENTS,
  validatePlacements,
  WALL_FURNITURE,
} from "./roomPlacement";

/** Dev-only ?labLayoutDebug=1 floor-plan overlay. */
export function readLabLayoutDebugState(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("labLayoutDebug") === "1";
}

const POLYGON_Y = 0.06;
const NORMAL_LEN = 0.65;
const AXIS_LEN = 0.75;

function WallFurnitureDebugVectors({ item }: { item: (typeof WALL_FURNITURE)[number] }) {
  const { anchor, depth } = item;
  const [cx, , cz] = anchor.position;
  const y = POLYGON_Y + 0.04;

  const localXEnd = localXZToWorld(anchor, AXIS_LEN, 0);
  const localZEnd = localXZToWorld(anchor, 0, AXIS_LEN);
  const backFace = localXZToWorld(anchor, 0, -depth * 0.5);
  const frontFace = localXZToWorld(anchor, 0, depth * 0.5);
  const validation = validatePlacements().furniture.find((f) => f.id === item.id);

  return (
    <group key={`${item.id}-vectors`}>
      {/* red = furniture local +X (width / tangent) */}
      <Line
        points={[
          [cx, y, cz],
          [localXEnd[0], y + 0.02, localXEnd[1]],
        ]}
        color="#E74C3C"
        lineWidth={2}
      />
      {/* blue = furniture local +Z (depth / front) */}
      <Line
        points={[
          [cx, y, cz],
          [localZEnd[0], y + 0.02, localZEnd[1]],
        ]}
        color="#3498DB"
        lineWidth={2}
      />
      {/* green = wall tangent at wall point */}
      <Line
        points={[
          [anchor.wallPoint[0], y, anchor.wallPoint[1]],
          [
            anchor.wallPoint[0] + anchor.tangentX * NORMAL_LEN,
            y,
            anchor.wallPoint[1] + anchor.tangentZ * NORMAL_LEN,
          ],
        ]}
        color="#2ECC71"
        lineWidth={1.5}
      />
      {/* yellow = inward normal from wall point */}
      <Line
        points={[
          [anchor.wallPoint[0], y, anchor.wallPoint[1]],
          [
            anchor.wallPoint[0] + anchor.inwardX * NORMAL_LEN,
            y,
            anchor.wallPoint[1] + anchor.inwardZ * NORMAL_LEN,
          ],
        ]}
        color="#F1C40F"
        lineWidth={1.5}
      />
      {/* back-face contact */}
      <mesh position={[backFace[0], y + 0.05, backFace[1]]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshBasicMaterial color="#E67E22" />
      </mesh>
      {/* front-face midpoint */}
      <mesh position={[frontFace[0], y + 0.05, frontFace[1]]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#9B59B6" />
      </mesh>
      {validation ? (
        <mesh position={[cx, y + 0.12, cz]}>
          <sphereGeometry args={[0.04, 6, 6]} />
          <meshBasicMaterial color={validation.valid ? "#27AE60" : "#C0392B"} />
        </mesh>
      ) : null}
    </group>
  );
}

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
            <Line points={wallLine} color="#95A5A6" lineWidth={1.2} />
            <Line points={normalLine} color="#2ECC71" lineWidth={1.2} />
          </group>
        );
      })}

      {WALL_FURNITURE.map((item) => {
        const corners = furnitureFootprintCorners(item.anchor, item.width, item.depth);
        const loop = [...corners, corners[0]].map(
          ([x, z]) => [x, POLYGON_Y + 0.01, z] as [number, number, number],
        );
        return (
          <group key={item.id}>
            <Line points={loop} color="#9B59B6" lineWidth={1.5} />
            <WallFurnitureDebugVectors item={item} />
          </group>
        );
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
        const rot = CENTRAL_BENCH.rotationY;
        const xEnd = worldAxisFromLocal(rot, AXIS_LEN, 0);
        const zEnd = worldAxisFromLocal(rot, 0, AXIS_LEN);
        return (
          <group>
            <Line points={corners} color="#F39C12" lineWidth={2} />
            <Line
              points={[
                [cx, POLYGON_Y + 0.03, cz],
                [cx + xEnd[0], POLYGON_Y + 0.05, cz + xEnd[1]],
              ]}
              color="#E74C3C"
              lineWidth={2}
            />
            <Line
              points={[
                [cx, POLYGON_Y + 0.03, cz],
                [cx + zEnd[0], POLYGON_Y + 0.05, cz + zEnd[1]],
              ]}
              color="#3498DB"
              lineWidth={2}
            />
          </group>
        );
      })()}

      {Object.values(HERO_PLACEMENTS).map((hero) => (
        <mesh key={hero.id} position={[hero.position[0], POLYGON_Y + 0.03, hero.position[2]]}>
          <sphereGeometry args={[0.1, 10, 10]} />
          <meshBasicMaterial color="#1ABC9C" wireframe />
        </mesh>
      ))}
    </group>
  );
}
