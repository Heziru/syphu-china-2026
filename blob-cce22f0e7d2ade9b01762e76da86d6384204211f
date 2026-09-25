import { RoundedBox } from "@react-three/drei";

type Mat = {
  color: string;
  roughness?: number;
  metalness?: number;
  emissive?: string;
  emissiveIntensity?: number;
};

function Surface({
  color,
  roughness = 0.72,
  metalness = 0.04,
  emissive = "#000000",
  emissiveIntensity = 0,
}: Mat) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={roughness}
      metalness={metalness}
      emissive={emissive}
      emissiveIntensity={emissiveIntensity}
    />
  );
}

type BoxProps = {
  position: [number, number, number];
  rotation?: [number, number, number];
  size: [number, number, number];
  radius?: number;
  cast?: boolean;
  receive?: boolean;
} & Mat;

export function SoftBox({
  position,
  rotation,
  size,
  radius = 0.03,
  cast = true,
  receive = true,
  ...mat
}: BoxProps) {
  const maxR = Math.min(size[0], size[1], size[2]) * 0.42;
  return (
    <RoundedBox
      args={size}
      radius={Math.min(radius, maxR)}
      smoothness={3}
      position={position}
      rotation={rotation}
      castShadow={cast}
      receiveShadow={receive}
    >
      <Surface {...mat} />
    </RoundedBox>
  );
}
