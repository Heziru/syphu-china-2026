import { useLayoutEffect, useRef } from "react";
import { Object3D, type DirectionalLight } from "three";

type Props = { shadows: boolean; studio?: boolean };

export function Lighting({ shadows, studio = false }: Props) {
  const key = useRef<DirectionalLight>(null);
  const target = useRef(new Object3D());
  const map = shadows ? 2048 : 512;

  useLayoutEffect(() => {
    target.current.position.set(studio ? 0 : 0.12, studio ? 0.38 : 0.45, studio ? 0.04 : 0.28);
    const light = key.current;
    if (!light) return;
    light.target = target.current;
    light.target.updateMatrixWorld();
  }, [studio]);

  return (
    <>
      <primitive object={target.current} />
      <hemisphereLight args={["#FFF6EA", "#C5CFC8", studio ? 0.72 : 0.62]} />
      <ambientLight intensity={studio ? 0.58 : 0.46} color="#F3EEE6" />
      <directionalLight
        ref={key}
        position={studio ? [-1.35, 2.55, 1.55] : [-2.05, 4.35, -2.45]}
        intensity={studio ? 1.7 : 1.55}
        color="#FFF3DE"
        castShadow={shadows}
        shadow-mapSize-width={map}
        shadow-mapSize-height={map}
        shadow-bias={-0.00018}
        shadow-normalBias={0.032}
        shadow-camera-near={0.4}
        shadow-camera-far={studio ? 8 : 16}
        shadow-camera-left={studio ? -1.6 : -5.2}
        shadow-camera-right={studio ? 1.6 : 5.4}
        shadow-camera-top={studio ? 1.8 : 4.8}
        shadow-camera-bottom={studio ? -1.4 : -3.8}
      />
      <directionalLight
        position={studio ? [1.8, 1.4, 1.2] : [2.8, 2.6, 4.0]}
        intensity={studio ? 0.42 : 0.32}
        color="#E4EEF0"
      />
      {studio ? (
        <directionalLight position={[0.2, 1.6, 2.2]} intensity={0.55} color="#FFFFFF" />
      ) : null}
    </>
  );
}
