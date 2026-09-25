import { useMemo } from "react";
import {
  BufferGeometry,
  Float32BufferAttribute,
  CatmullRomCurve3,
  Vector3,
} from "three";
import { SoftBox } from "./SoftBox";
import type { Role } from "./roomPlacement";
const cream = "#ECEDE3",
  sage = "#91A58E",
  dark = "#334B48",
  steel = "#B5BEBA";
function Box({
  p,
  s,
  c = cream,
}: {
  p: [number, number, number];
  s: [number, number, number];
  c?: string;
}) {
  if (Math.min(...s) < 0.02)
    return (
      <mesh position={p}>
        <boxGeometry args={s} />
        <meshStandardMaterial color={c} roughness={0.72} />
      </mesh>
    );
  return <SoftBox position={p} size={s} color={c} radius={0.018} />;
}
function Cylinder({
  p,
  r,
  h,
  c = steel,
}: {
  p: [number, number, number];
  r: number;
  h: number;
  c?: string;
}) {
  return (
    <mesh position={p} castShadow receiveShadow>
      <cylinderGeometry args={[r, r, h, 24]} />
      <meshStandardMaterial
        color={c}
        roughness={0.35}
        metalness={c === steel ? 0.55 : 0}
      />
    </mesh>
  );
}
function Tube({
  points,
  r = 0.012,
  c = steel,
}: {
  points: [number, number, number][];
  r?: number;
  c?: string;
}) {
  const curve = useMemo(
    () => new CatmullRomCurve3(points.map((p) => new Vector3(...p))),
    [points],
  );
  return (
    <mesh castShadow>
      <tubeGeometry args={[curve, 24, r, 8, false]} />
      <meshStandardMaterial color={c} roughness={0.5} />
    </mesh>
  );
}
function Display({ p, w = 0.16 }: { p: [number, number, number]; w?: number }) {
  return (
    <group position={p}>
      <Box p={[0, 0, 0]} s={[w, 0.065, 0.008]} c={dark} />
      {[0, 1, 2].map((i) => (
        <Box
          key={i}
          p={[-w * 0.3 + i * w * 0.3, 0, 0.006]}
          s={[w * 0.13, 0.032, 0.003]}
          c="#9AC9B8"
        />
      ))}
    </group>
  );
}
export function GlassVessel({
  kind = "beaker",
  scale = 1,
}: {
  kind?: "beaker" | "cylinder";
  scale?: number;
}) {
  const tall = kind === "cylinder",
    r = tall ? 0.026 : 0.055,
    h = tall ? 0.28 : 0.12;
  return (
    <group scale={scale}>
      <mesh position={[0, h / 2 + 0.012, 0]}>
        <cylinderGeometry args={[r, r, h, 24, 1, true]} />
        <meshPhysicalMaterial
          color="#C5DFDB"
          transparent
          opacity={0.27}
          side={2}
          roughness={0.15}
          depthWrite={false}
        />
      </mesh>
      <Cylinder
        p={[0, 0.012, 0]}
        r={r * (tall ? 1.65 : 1)}
        h={0.015}
        c="#D6E1DA"
      />
      <Cylinder p={[0, h * 0.21, 0]} r={r * 0.87} h={h * 0.32} c="#B1CBC0" />
      <mesh position={[0, h + 0.012, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[r, 0.0025, 6, 24]} />
        <meshStandardMaterial color="#DDE9E3" />
      </mesh>
      {[1, 2, 3, 4].map((i) => (
        <Box
          key={i}
          p={[r * 0.48, h * 0.16 * i + 0.018, r * 0.88]}
          s={[r * 0.55, 0.002, 0.002]}
          c="#668B82"
        />
      ))}
    </group>
  );
}
function CoatCloth() {
  const geometry = useMemo(() => {
    const positions: number[] = [],
      indices: number[] = [],
      rows = 12,
      columns = 24;
    for (let j = 0; j <= rows; j++)
      for (let i = 0; i <= columns; i++) {
        const t = j / rows,
          a = 0.18 + (i / columns) * (Math.PI * 2 - 0.36),
          w = 0.157 - 0.028 * Math.sin(t * Math.PI) + 0.02 * t;
        positions.push(
          Math.sin(a) * w,
          1.36 - 0.79 * t,
          Math.cos(a) * (0.06 + 0.01 * t) + 0.004 * Math.sin(a * 6) * t,
        );
      }
    for (let j = 0; j < rows; j++)
      for (let i = 0; i < columns; i++) {
        const k = j * (columns + 1) + i;
        indices.push(
          k,
          k + 1,
          k + columns + 1,
          k + 1,
          k + columns + 2,
          k + columns + 1,
        );
      }
    const g = new BufferGeometry();
    g.setAttribute("position", new Float32BufferAttribute(positions, 3));
    g.setIndex(indices);
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <mesh geometry={geometry} castShadow>
      <meshStandardMaterial color={cream} roughness={0.92} side={2} />
    </mesh>
  );
}
function HangingCoat({ x }: { x: number }) {
  return (
    <group position={[x, 0.12, 0]}>
      <Tube
        points={[
          [-0.15, 1.35, 0],
          [0, 1.46, 0],
          [0.15, 1.35, 0],
          [-0.15, 1.35, 0],
        ]}
        r={0.009}
      />
      <Tube
        points={[
          [0, 1.46, 0],
          [0, 1.57, 0],
          [0.04, 1.58, 0],
          [0.055, 1.54, 0],
        ]}
        r={0.009}
      />
      <CoatCloth />
      {[-1, 1].map((s) => (
        <Tube
          key={s}
          points={[
            [s * 0.145, 1.3, 0],
            [s * 0.175, 1.16, 0],
            [s * 0.19, 0.94, 0.01],
          ]}
          r={0.035}
          c={cream}
        />
      ))}
      <Box p={[-0.095, 0.73, 0.046]} s={[0.095, 0.09, 0.015]} c="#E3E6DB" />
      <Box p={[0.095, 0.73, 0.046]} s={[0.095, 0.09, 0.015]} c="#E3E6DB" />
    </group>
  );
}
export function LabEquipment({ kind }: { kind: Role }) {
  if (kind === "fridge")
    return (
      <group>
        <Box p={[0, 0.95, 0]} s={[0.83, 1.9, 0.68]} />
        <Box p={[0, 1.14, 0.345]} s={[0.76, 1.42, 0.025]} c={sage} />
        <Box p={[0, 0.24, 0.345]} s={[0.76, 0.27, 0.025]} c={sage} />
        <Box p={[-0.27, 1.15, 0.377]} s={[0.035, 0.36, 0.035]} c={dark} />
        <Display p={[0, 1.73, 0.365]} w={0.22} />
        {[0, 1, 2, 3, 4].map((i) => (
          <Box
            key={i}
            p={[0, 0.12 + i * 0.025, 0.36]}
            s={[0.55, 0.009, 0.008]}
            c={dark}
          />
        ))}
      </group>
    );
  if (kind === "nitrogen")
    return (
      <group>
        <Cylinder p={[0, 0.36, 0]} r={0.285} h={0.62} />
        <Cylinder p={[0, 0.055, 0]} r={0.31} h={0.07} c={dark} />
        <mesh position={[0, 0.67, 0]} scale={[0.28, 0.105, 0.28]} castShadow>
          <sphereGeometry args={[1, 24, 12]} />
          <meshStandardMaterial
            color={steel}
            metalness={0.55}
            roughness={0.3}
          />
        </mesh>
        <Cylinder p={[0, 0.755, 0]} r={0.12} h={0.095} c={sage} />
        {[-1, 1].map((s) => (
          <Tube
            key={s}
            points={[
              [s * 0.23, 0.61, 0],
              [s * 0.31, 0.66, 0],
              [s * 0.31, 0.43, 0],
              [s * 0.27, 0.42, 0],
            ]}
          />
        ))}
        <Box p={[0, 0.37, 0.286]} s={[0.13, 0.17, 0.008]} c="#D2DEC7" />
        <Box p={[0, 0.38, 0.296]} s={[0.025, 0.09, 0.004]} c={dark} />
      </group>
    );
  if (kind === "coat-rack")
    return (
      <group>
        {[-0.44, 0.44].map((x) => (
          <group key={x}>
            <Cylinder p={[x, 0.85, 0]} r={0.018} h={1.7} />
            <Box p={[x, 0.03, 0]} s={[0.12, 0.05, 0.47]} c={dark} />
          </group>
        ))}
        <Tube
          points={[
            [-0.44, 1.7, 0],
            [0.44, 1.7, 0],
          ]}
          r={0.02}
        />
        <HangingCoat x={-0.23} />
        <HangingCoat x={0.23} />
      </group>
    );
  if (kind === "centrifuge")
    return (
      <group>
        <Box p={[0, 0.17, 0]} s={[0.6, 0.32, 0.53]} />
        <Cylinder p={[0, 0.335, -0.025]} r={0.23} h={0.045} c={sage} />
        <Cylinder p={[0, 0.362, -0.025]} r={0.12} h={0.008} c="#CBD5C8" />
        <Box p={[0, 0.37, 0.13]} s={[0.13, 0.027, 0.07]} c={dark} />
        <Display p={[-0.08, 0.15, 0.272]} />
        <Cylinder p={[0.2, 0.065, 0.18]} r={0.023} h={0.015} c={sage} />
      </group>
    );
  if (kind === "ultrasonic")
    return (
      <group>
        <Box p={[-0.17, 0.19, 0]} s={[0.23, 0.38, 0.51]} />
        <Display p={[-0.17, 0.25, 0.263]} w={0.15} />
        <Box p={[0.13, 0.025, 0]} s={[0.3, 0.05, 0.51]} c={sage} />
        <Cylinder p={[0.22, 0.33, -0.16]} r={0.016} h={0.6} />
        <Box p={[0.105, 0.605, -0.065]} s={[0.25, 0.04, 0.07]} c={dark} />
        <Cylinder p={[0.06, 0.44, 0.045]} r={0.044} h={0.29} />
        <group position={[0.06, 0.055, 0.045]}>
          <GlassVessel scale={1.1} />
        </group>
        <Tube
          points={[
            [-0.17, 0.37, -0.1],
            [-0.12, 0.57, -0.13],
            [0.08, 0.58, -0.08],
          ]}
          r={0.009}
          c={dark}
        />
      </group>
    );
  if (kind === "shaker")
    return (
      <group>
        <Box p={[0, 0.08, 0]} s={[0.6, 0.16, 0.52]} />
        <Display p={[0, 0.09, 0.265]} />
        <Box p={[0, 0.19, 0]} s={[0.55, 0.035, 0.47]} c={sage} />
        {[-0.16, 0, 0.16].map((x, i) => (
          <group key={x} position={[x, 0.21, 0]}>
            <GlassVessel scale={1.15} />
            <Cylinder
              p={[0, 0.16, 0]}
              r={0.035}
              h={0.03}
              c={i % 2 ? sage : cream}
            />
          </group>
        ))}
      </group>
    );
  return null;
}
