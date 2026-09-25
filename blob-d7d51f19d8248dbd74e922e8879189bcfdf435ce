type Props = { shadows: boolean };

export function Lighting({ shadows }: Props) {
  return (
    <>
      <hemisphereLight args={["#F6F1E6", "#C5D9D2", 0.85]} />
      <ambientLight intensity={0.28} />
      <directionalLight
        position={[-2.2, 6.4, 3.2]}
        intensity={1.15}
        color="#FFF6E8"
        castShadow={shadows}
        shadow-mapSize-width={shadows ? 1024 : 256}
        shadow-mapSize-height={shadows ? 1024 : 256}
        shadow-camera-near={1}
        shadow-camera-far={22}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />
    </>
  );
}
