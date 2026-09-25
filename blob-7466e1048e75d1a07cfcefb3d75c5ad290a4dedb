import { useTexture } from "@react-three/drei";
import type { Size } from "./layoutMath";
import { SoftBox } from "./SoftBox";

const PAGE_ASSETS: Record<string, string> = {
  "paper-rubens": "rubens-2016.webp",
  "paper-wang": "wang-2021.webp",
  "paper-teng": "teng-2022.webp",
};

export function LiteratureFrame({ id, size }: { id: string; size: Size }) {
  const texture = useTexture(
    `${import.meta.env.BASE_URL}assets/laboratory/literature/${PAGE_ASSETS[id]}`,
  );
  const [width, height, depth] = size;
  const pageHeight = height * 0.76;
  const pageWidth = pageHeight * (1218 / 1600);
  const rail = 0.035;

  return (
    <group name={`literature-display:${id}`}>
      <SoftBox
        position={[0, height / 2, 0]}
        size={[width, height, depth]}
        color="#536c62"
        radius={0.018}
      />
      <mesh position={[0, height * 0.54, depth / 2 + 0.006]}>
        <planeGeometry args={[width - rail * 2, height - rail * 2]} />
        <meshStandardMaterial color="#ece7dc" roughness={0.86} />
      </mesh>
      <mesh position={[0, height * 0.56, depth / 2 + 0.012]}>
        <planeGeometry args={[pageWidth, pageHeight]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
      <mesh position={[0, height * 0.56, depth / 2 + 0.018]}>
        <planeGeometry args={[pageWidth + 0.012, pageHeight + 0.012]} />
        <meshPhysicalMaterial
          color="#f5fbf6"
          transparent
          opacity={0.055}
          roughness={0.08}
          metalness={0}
          depthWrite={false}
        />
      </mesh>
      <SoftBox
        position={[0, 0.065, depth / 2 + 0.012]}
        size={[width * 0.54, 0.052, 0.016]}
        color="#e8e3d7"
        radius={0.008}
      />
      {[-1, 1].map((sign) => (
        <mesh
          key={sign}
          position={[sign * (width / 2 - 0.045), height / 2, depth / 2 + 0.025]}
        >
          <boxGeometry args={[0.02, height - 0.08, 0.016]} />
          <meshStandardMaterial color="#71877e" roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}
