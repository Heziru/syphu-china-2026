import { LAB_COLORS } from "./labPalette";
import { SoftBox } from "./SoftBox";

/** 中央实验台：程序化精修样板（台面 / 柜体 / 抽屉 / 摆件）。 */
export function CentralBench() {
  return (
    <group position={[0.08, 0, 0.28]}>
      <SoftBox
        position={[0, 0.855, 0.05]}
        size={[2.96, 0.072, 1.66]}
        radius={0.03}
        color={LAB_COLORS.shell}
        roughness={0.46}
        metalness={0.05}
      />
      <SoftBox
        position={[0, 0.41, -0.02]}
        size={[2.72, 0.78, 1.42]}
        radius={0.04}
        color={LAB_COLORS.cabinet}
        roughness={0.82}
        metalness={0.02}
      />
      <SoftBox
        position={[0, 0.045, 0]}
        size={[2.68, 0.08, 1.38]}
        radius={0.02}
        color={LAB_COLORS.structure}
        roughness={0.7}
      />

      <DrawerStack x={-0.78} />
      <Cupboard x={0.82} />

      <SoftBox
        position={[-0.02, 0.41, 0.68]}
        size={[2.58, 0.012, 0.012]}
        radius={0.004}
        color={LAB_COLORS.structure}
        roughness={0.55}
        cast={false}
      />

      <group position={[-1.08, 0.9, 0.38]}>
        <PipetteStation />
        <PetriStack />
      </group>
      <group position={[1.05, 0.9, 0.34]}>
        <Notebook />
        <TubeRack />
      </group>
    </group>
  );
}

function DrawerStack({ x }: { x: number }) {
  return (
    <group position={[x, 0, 0.69]}>
      {[0.62, 0.42, 0.22].map((y, i) => (
        <group key={y}>
          <SoftBox
            position={[0, y, 0]}
            size={[0.86, 0.16, 0.04]}
            radius={0.012}
            color={i === 1 ? "#A8C6BF" : LAB_COLORS.cabinet}
            roughness={0.78}
          />
          <SoftBox
            position={[0, y, 0.03]}
            size={[0.2, 0.018, 0.03]}
            radius={0.006}
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
    <group position={[x, 0.42, 0.69]}>
      <SoftBox
        position={[0, 0, 0]}
        size={[0.9, 0.62, 0.04]}
        radius={0.014}
        color="#A3C2BA"
        roughness={0.8}
      />
      <SoftBox
        position={[-0.32, 0.02, 0.03]}
        size={[0.028, 0.16, 0.03]}
        radius={0.006}
        color={LAB_COLORS.metal}
        roughness={0.3}
        metalness={0.5}
      />
    </group>
  );
}

function PipetteStation() {
  return (
    <group>
      <SoftBox
        position={[0, 0.09, 0]}
        size={[0.18, 0.18, 0.18]}
        radius={0.02}
        color={LAB_COLORS.shell}
        roughness={0.5}
      />
      {[ -0.045, 0, 0.045 ].map((x, i) => (
        <mesh key={x} position={[x, 0.28, 0]} castShadow>
          <cylinderGeometry args={[0.012, 0.016, 0.28, 8]} />
          <meshStandardMaterial
            color={i === 1 ? LAB_COLORS.coral : LAB_COLORS.teal}
            roughness={0.4}
            metalness={0.08}
          />
        </mesh>
      ))}
    </group>
  );
}

function PetriStack() {
  return (
    <group position={[0.28, 0.02, 0.02]}>
      <mesh position={[0, 0.012, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.07, 0.07, 0.016, 16]} />
        <meshStandardMaterial color={LAB_COLORS.glass} roughness={0.22} metalness={0.04} />
      </mesh>
      <mesh position={[0.09, 0.01, 0.08]} castShadow>
        <cylinderGeometry args={[0.055, 0.055, 0.014, 16]} />
        <meshStandardMaterial color={LAB_COLORS.shell} roughness={0.35} />
      </mesh>
    </group>
  );
}

function Notebook() {
  return (
    <group position={[-0.18, 0.012, 0.08]}>
      <SoftBox
        position={[0, 0, 0]}
        size={[0.28, 0.016, 0.22]}
        radius={0.006}
        color={LAB_COLORS.coral}
        roughness={0.72}
      />
      <SoftBox
        position={[0.012, 0.012, 0]}
        size={[0.25, 0.01, 0.2]}
        radius={0.004}
        color={LAB_COLORS.paper}
        roughness={0.86}
        metalness={0}
      />
    </group>
  );
}

function TubeRack() {
  const xs = [-0.055, 0, 0.055];
  const zs = [-0.028, 0.028];
  return (
    <group position={[0.22, 0, -0.04]}>
      <SoftBox
        position={[0, 0.03, 0]}
        size={[0.2, 0.05, 0.12]}
        radius={0.012}
        color={LAB_COLORS.shell}
        roughness={0.55}
      />
      {xs.flatMap((x) =>
        zs.map((z) => (
          <mesh key={`${x}:${z}`} position={[x, 0.1, z]} castShadow>
            <cylinderGeometry args={[0.012, 0.012, 0.11, 8]} />
            <meshStandardMaterial color={LAB_COLORS.glass} roughness={0.18} metalness={0.05} />
          </mesh>
        )),
      )}
    </group>
  );
}
