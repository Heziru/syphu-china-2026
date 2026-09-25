import { LAB_COLORS } from "./labPalette";

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

      <mesh position={[-1.9, 2.55, -3.44]}>
        <boxGeometry args={[2.6, 1.7, 0.08]} />
        <meshStandardMaterial color={LAB_COLORS.window} emissive={LAB_COLORS.window} emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[-1.9, 2.55, -3.4]}>
        <boxGeometry args={[2.78, 1.88, 0.06]} />
        <meshStandardMaterial color={LAB_COLORS.dark} roughness={0.5} />
      </mesh>

      <mesh position={[-3.35, 0.42, -0.2]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 0.84, 1.35]} />
        <meshStandardMaterial color={LAB_COLORS.bench} roughness={0.55} />
      </mesh>
      <mesh position={[0.1, 0.42, 0.3]} castShadow receiveShadow>
        <boxGeometry args={[2.7, 0.84, 1.5]} />
        <meshStandardMaterial color={LAB_COLORS.bench} roughness={0.55} />
      </mesh>
      <mesh position={[3.25, 0.42, 0.45]} castShadow receiveShadow>
        <boxGeometry args={[2.1, 0.84, 1.4]} />
        <meshStandardMaterial color={LAB_COLORS.bench} roughness={0.55} />
      </mesh>
    </group>
  );
}
