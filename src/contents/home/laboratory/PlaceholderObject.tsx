import type { LabObjectId } from "../types/laboratory";
import { LAB_COLORS } from "./labPalette";
import { MicroscopePlaceholder } from "./MicroscopePlaceholder";

type Props = { id: LabObjectId };

export function PlaceholderObject({ id }: Props) {
  switch (id) {
    case "computer":
      return <ComputerMesh />;
    case "microscope":
      return <MicroscopePlaceholder />;
    case "researcher":
      return <ResearcherMesh />;
    case "bookshelf":
      return <BookshelfMesh />;
    case "device":
      return <DeviceMesh />;
    default:
      return null;
  }
}

function ComputerMesh() {
  return (
    <group>
      <mesh position={[0, 0.95, -0.12]} castShadow>
        <boxGeometry args={[0.92, 0.62, 0.08]} />
        <meshStandardMaterial color={LAB_COLORS.dark} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.95, -0.07]}>
        <boxGeometry args={[0.78, 0.48, 0.02]} />
        <meshStandardMaterial color={LAB_COLORS.screen} emissive={LAB_COLORS.teal} emissiveIntensity={0.18} />
      </mesh>
      <mesh position={[0, 0.58, 0.16]} castShadow>
        <boxGeometry args={[0.86, 0.06, 0.42]} />
        <meshStandardMaterial color={LAB_COLORS.dark} />
      </mesh>
      <mesh position={[0.42, 0.62, 0.18]}>
        <boxGeometry args={[0.18, 0.04, 0.24]} />
        <meshStandardMaterial color={LAB_COLORS.coral} />
      </mesh>
    </group>
  );
}

function ResearcherMesh() {
  return (
    <group>
      <mesh position={[0, 1.38, 0]} castShadow>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#E7D3C4" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.82, 0]} castShadow>
        <cylinderGeometry args={[0.24, 0.28, 0.72, 12]} />
        <meshStandardMaterial color={LAB_COLORS.teal} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.22, 0]} castShadow>
        <boxGeometry args={[0.42, 0.4, 0.28]} />
        <meshStandardMaterial color={LAB_COLORS.dark} />
      </mesh>
    </group>
  );
}

function BookshelfMesh() {
  return (
    <group>
      <mesh position={[0, 1.2, 0]} castShadow>
        <boxGeometry args={[1.55, 2.35, 0.38]} />
        <meshStandardMaterial color={LAB_COLORS.dark} roughness={0.7} />
      </mesh>
      <mesh position={[-0.38, 1.55, 0.12]} castShadow>
        <boxGeometry args={[0.22, 0.58, 0.18]} />
        <meshStandardMaterial color={LAB_COLORS.coral} />
      </mesh>
      <mesh position={[-0.1, 1.5, 0.12]} castShadow>
        <boxGeometry args={[0.2, 0.5, 0.18]} />
        <meshStandardMaterial color={LAB_COLORS.book} />
      </mesh>
      <mesh position={[0.16, 1.58, 0.12]} castShadow>
        <boxGeometry args={[0.18, 0.62, 0.18]} />
        <meshStandardMaterial color={LAB_COLORS.teal} />
      </mesh>
      <mesh position={[0.42, 1.48, 0.12]} castShadow>
        <boxGeometry args={[0.2, 0.46, 0.18]} />
        <meshStandardMaterial color={LAB_COLORS.wall} />
      </mesh>
      <mesh position={[0, 0.72, 0.14]} castShadow>
        <boxGeometry args={[1.2, 0.08, 0.28]} />
        <meshStandardMaterial color={LAB_COLORS.bench} />
      </mesh>
    </group>
  );
}

function DeviceMesh() {
  return (
    <group>
      <mesh position={[0, 0.95, 0]} castShadow>
        <cylinderGeometry args={[0.42, 0.48, 0.9, 14]} />
        <meshStandardMaterial color={LAB_COLORS.teal} roughness={0.42} />
      </mesh>
      <mesh position={[0, 1.48, 0]} castShadow>
        <sphereGeometry args={[0.28, 16, 16]} />
        <meshStandardMaterial color={LAB_COLORS.coral} roughness={0.35} />
      </mesh>
      <mesh position={[0.38, 1.12, 0]} castShadow>
        <boxGeometry args={[0.16, 0.42, 0.16]} />
        <meshStandardMaterial color={LAB_COLORS.dark} />
      </mesh>
    </group>
  );
}
