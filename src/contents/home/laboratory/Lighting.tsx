import { useLayoutEffect, useRef } from "react";
import { Object3D, type DirectionalLight } from "three";

type Props = { shadows: boolean };

export function Lighting({ shadows }: Props) {
  const key = useRef<DirectionalLight>(null);
  const target = useRef(new Object3D());
  const map = shadows ? 2048 : 512;

  useLayoutEffect(() => {
    target.current.position.set(0.12, 0.45, 0.28);
    const light = key.current;
    if (!light) return;
    light.target = target.current;
    light.target.updateMatrixWorld();
  }, []);

  return (
    <>
      <primitive object={target.current} />
      <hemisphereLight args={["#FFF6EA", "#C5CFC8", 0.62]} />
      <ambientLight intensity={0.46} color="#F3EEE6" />
      <directionalLight
        ref={key}
        position={[-2.05, 4.35, -2.45]}
        intensity={1.55}
        color="#FFF3DE"
        castShadow={shadows}
        shadow-mapSize-width={map}
        shadow-mapSize-height={map}
        shadow-bias={-0.00018}
        shadow-normalBias={0.032}
        shadow-camera-near={0.8}
        shadow-camera-far={16}
        shadow-camera-left={-5.2}
        shadow-camera-right={5.4}
        shadow-camera-top={4.8}
        shadow-camera-bottom={-3.8}
      />
      <directionalLight position={[2.8, 2.6, 4.0]} intensity={0.32} color="#E4EEF0" />
    </>
  );
}
