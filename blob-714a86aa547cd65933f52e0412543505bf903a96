import { Suspense, useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Group, MathUtils, OrthographicCamera } from "three";
import { BlenderAsset } from "../components/BlenderAsset";
import { STORY_STEPS } from "./storyContent";

export function ScienceModel({
  step,
  t,
  reduced,
}: {
  step: number;
  t: number;
  reduced: boolean;
}) {
  const aspect = useThree((s) => s.viewport.aspect);
  const camera = useThree((s) => s.camera),
    height = useThree((s) => s.size.height);
  useEffect(() => {
    if (camera instanceof OrthographicCamera) {
      camera.zoom = height / 9;
      camera.updateProjectionMatrix();
    }
  }, [camera, height]);
  const rig = useRef<Group>(null);
  const exit = step === 4;
  const signal = exit ? Math.max(0, 1 - t * 3.3) : 1;
  const protection = exit ? Math.max(0, 1 - Math.max(0, t - 0.3) * 2.6) : 1;
  const population = exit ? 1 - Math.max(0, t - 0.63) * 1.6 : 1;
  // A fixed nine-unit vertical view keeps scientific scales legible across displays.
  const scale = Math.min(
    step === 0 ? 1.02 : step === 1 ? 1.7 : 2.2,
    (aspect * 8) / (step === 0 ? 4.7 : 6.4),
  );
  useFrame((_, dt) => {
    if (!rig.current) return;
    const target = (step === 0 ? 0.02 : -0.1) + (reduced ? 0 : t * 0.12);
    rig.current.rotation.y = MathUtils.damp(
      rig.current.rotation.y,
      target,
      6,
      dt,
    );
  });
  return (
    <>
      <ambientLight intensity={1.35} />
      <directionalLight position={[-4, 6, 7]} intensity={2.2} color="#fff5e5" />
      <directionalLight position={[5, 2, -3]} intensity={1.1} color="#c6dedc" />
      <group position={[0, 0.45, 0]} scale={scale}>
        <group
          ref={rig}
          rotation={[step === 1 ? 0.32 : 0.06, -0.1, step > 1 ? -0.1 : 0]}
          scale={population}
        >
          <Suspense fallback={null}>
            <BlenderAsset
              name={STORY_STEPS[step].model}
              activity={protection}
            />
          </Suspense>
        </group>
        {step > 0 &&
          Array.from({ length: 10 }, (_, i) => (
            <mesh
              key={"ros" + i}
              position={[
                -1.65 + (i % 5) * 0.76,
                1.12 + Math.floor(i / 5) * 0.36,
                0.25,
              ]}
            >
              <icosahedronGeometry args={[0.046, 1]} />
              <meshStandardMaterial
                color="#d69769"
                transparent
                opacity={signal * 0.85}
              />
            </mesh>
          ))}
        {step > 0 &&
          [-2.35, 2.35].map((x) => (
            <mesh key={x} position={[x, -0.25, 0.2]} rotation={[0.3, 0.2, 0.5]}>
              <octahedronGeometry args={[0.1]} />
              <meshStandardMaterial color="#9a91b3" />
            </mesh>
          ))}
        {step === 3 &&
          [0, 1, 2, 3, 4].map((i) => (
            <mesh
              key={i}
              position={[1.45 + t * (0.45 + i * 0.18), -0.2 - i * 0.15, 0.27]}
            >
              <sphereGeometry args={[0.045, 16, 12]} />
              <meshStandardMaterial
                color="#d7aa52"
                transparent
                opacity={Math.min(1, t * 2)}
              />
            </mesh>
          ))}
      </group>
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI * 0.32}
        maxPolarAngle={Math.PI * 0.68}
        minAzimuthAngle={-0.45}
        maxAzimuthAngle={0.45}
      />
    </>
  );
}
