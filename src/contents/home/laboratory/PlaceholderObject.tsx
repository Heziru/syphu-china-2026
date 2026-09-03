import type { LabObjectId } from "../types/laboratory";
import { LAB_COLORS } from "./labPalette";
import { BioreactorModel } from "./bioreactor/BioreactorModel";
import { ComputerModel } from "./computer/ComputerModel";
import { MicroscopeModel } from "./microscope/MicroscopeModel";

type Props = { id: LabObjectId };

export function PlaceholderObject({ id }: Props) {
  switch (id) {
    case "computer":
      return <ComputerModel />;
    case "microscope":
      return <MicroscopeModel />;
    case "researcher":
      return <ResearcherMesh />;
    case "bookshelf":
      return <BookshelfMesh />;
    case "device":
      return <BioreactorModel />;
    default:
      return null;
  }
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
