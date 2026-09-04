import { useLayoutEffect, useRef } from "react";
import { Object3D, type DirectionalLight } from "three";
type Props = { shadows: boolean; studio?: boolean };
export function Lighting({ shadows, studio = false }: Props) {
  const key = useRef<DirectionalLight>(null),
    target = useRef(new Object3D());
  useLayoutEffect(() => {
    target.current.position.set(0, studio ? 0.38 : 0, 0);
    if (key.current) {
      key.current.target = target.current;
      key.current.target.updateMatrixWorld();
    }
  }, [studio]);
  return (
    <>
      <primitive object={target.current} />
      <hemisphereLight args={["#FFF4DF", "#D5CCB8", studio ? 0.72 : 1.25]} />
      <ambientLight intensity={studio ? 0.58 : 0.38} color="#F2EADB" />
      <directionalLight
        ref={key}
        position={studio ? [-1.35, 2.55, 1.55] : [-5.2, 8.5, 2.8]}
        intensity={studio ? 1.7 : 2.0}
        color="#FFE4B6"
        castShadow={shadows}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.00025}
        shadow-normalBias={0.025}
        shadow-radius={4}
        shadow-blurSamples={8}
        shadow-camera-near={0.4}
        shadow-camera-far={studio ? 8 : 28}
        shadow-camera-left={studio ? -1.6 : -8}
        shadow-camera-right={studio ? 1.6 : 8}
        shadow-camera-top={studio ? 1.8 : 8}
        shadow-camera-bottom={studio ? -1.4 : -8}
      />
      <directionalLight
        position={studio ? [1.8, 1.4, 1.2] : [4, 5, 7]}
        intensity={studio ? 0.42 : 0.6}
        color="#EFF3E9"
      />
    </>
  );
}
