import { CentralBench } from "./CentralBench";
import { LAB_COLORS } from "./labPalette";
import { SoftBox } from "./SoftBox";

export function RoomShell() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[11.5, 8.4]} />
        <meshStandardMaterial color={LAB_COLORS.floor} roughness={0.9} />
      </mesh>

      <mesh position={[0, 2.3, -3.55]} receiveShadow>
        <boxGeometry args={[11.5, 4.6, 0.18]} />
        <meshStandardMaterial color={LAB_COLORS.wall} roughness={0.86} />
      </mesh>
      <mesh position={[-5.65, 2.3, 0.15]} receiveShadow>
        <boxGeometry args={[0.18, 4.6, 7.8]} />
        <meshStandardMaterial color={LAB_COLORS.wall} roughness={0.86} />
      </mesh>
      <mesh position={[5.65, 2.3, 0.15]} receiveShadow>
        <boxGeometry args={[0.18, 4.6, 7.8]} />
        <meshStandardMaterial color={LAB_COLORS.wall} roughness={0.86} />
      </mesh>

      <mesh position={[-1.9, 2.55, -3.46]}>
        <boxGeometry args={[2.6, 1.7, 0.04]} />
        <meshStandardMaterial
          color={LAB_COLORS.window}
          emissive={LAB_COLORS.window}
          emissiveIntensity={0.55}
          roughness={1}
        />
      </mesh>
      <SoftBox
        position={[-1.9, 3.42, -3.4]}
        size={[2.82, 0.1, 0.08]}
        radius={0.02}
        color={LAB_COLORS.structure}
        roughness={0.55}
        cast={false}
      />
      <SoftBox
        position={[-1.9, 1.68, -3.4]}
        size={[2.82, 0.1, 0.08]}
        radius={0.02}
        color={LAB_COLORS.structure}
        roughness={0.55}
        cast={false}
      />
      <SoftBox
        position={[-3.26, 2.55, -3.4]}
        size={[0.1, 1.84, 0.08]}
        radius={0.02}
        color={LAB_COLORS.structure}
        roughness={0.55}
        cast={false}
      />
      <SoftBox
        position={[-0.54, 2.55, -3.4]}
        size={[0.1, 1.84, 0.08]}
        radius={0.02}
        color={LAB_COLORS.structure}
        roughness={0.55}
        cast={false}
      />
      <SoftBox
        position={[-1.9, 2.55, -3.4]}
        size={[0.08, 1.7, 0.06]}
        radius={0.015}
        color={LAB_COLORS.structure}
        roughness={0.55}
        cast={false}
      />

      <mesh position={[-3.35, 0.42, -0.2]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.84, 1.35]} />
        <meshStandardMaterial color={LAB_COLORS.bench} roughness={0.55} />
      </mesh>
      <CentralBench />
      <mesh position={[3.25, 0.42, 0.45]} castShadow receiveShadow>
        <boxGeometry args={[2.1, 0.84, 1.4]} />
        <meshStandardMaterial color={LAB_COLORS.bench} roughness={0.55} />
      </mesh>
    </group>
  );
}
