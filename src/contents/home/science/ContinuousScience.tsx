import { Suspense, useRef, useState, type MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Group, Mesh, MeshStandardMaterial } from "three";
import { BlenderAsset } from "../components/BlenderAsset";
import { Html } from "@react-three/drei";
import { smooth, sciencePhase } from "../journey/storyTimeline";

function Release({ progress }: { progress: MutableRefObject<number> }) {
  const group = useRef<Group>(null);
  useFrame(() => {
    if (!group.current) return;
    const p = progress.current;
    group.current.visible = p > 0.642 && p < 0.752;
    const age = smooth(0.642, 0.71, p);
    group.current.children.forEach((o, i) => {
      const f = Math.max(0, age - i * 0.019),
        a = i * 2.399,
        theta = -1.25 + ((i % 9) / 8) * 2.5;
      // Diffusion from several points on the capsule envelope; no invented secretion pore.
      o.position.set(
        0.98 + (0.72 + f * 1.8) * Math.cos(theta),
        (0.72 + f * 0.65) * Math.sin(theta) + Math.sin(a) * f * 0.12,
        0.12 + Math.cos(a) * f * 0.4,
      );
      const mat = (o as Mesh).material as MeshStandardMaterial;
      mat.opacity =
        f <= 0
          ? 0
          : Math.min(1, f * 8) * (1 - f * 0.7) * (1 - smooth(0.725, 0.752, p));
    });
  });
  return (
    <group ref={group}>
      {Array.from({ length: 24 }, (_, i) => (
        <mesh key={i} scale={0.026 + (i % 3) * 0.004}>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial
            color="#c99b48"
            roughness={0.45}
            transparent
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}
export function ContinuousScience({
  progress,
  inspection,
}: {
  progress: MutableRefObject<number>;
  inspection: number;
}) {
  const rig = useRef<Group>(null);
  const aspect = useThree((s) => s.viewport.aspect);
  const [state, setState] = useState({ step: 0, p: 0.3 });
  const tick = useRef(0);
  useFrame((_, dt) => {
    if (!rig.current) return;
    const p = progress.current;
    rig.current.visible = p > 0.285 && p < 0.797;
    rig.current.position.set(
      aspect < 1 ? 0 : 2.55,
      aspect < 1 ? -0.35 : -0.3,
      0,
    );
    tick.current += dt;
    if (tick.current > 0.045) {
      tick.current = 0;
      setState({ step: sciencePhase(p), p });
    }
  });
  const p = state.p,
    wall = smooth(0.408, 0.452, p),
    cell = smooth(0.512, 0.557, p);
  const exit = smooth(0.755, 0.795, p),
    narrow = aspect < 1,
    fit = Math.min(1, aspect * 1.4);
  const signal = 1 - smooth(0.715, 0.737, p),
    protection = 1 - smooth(0.737, 0.769, p);
  const organismAlpha = (1 - exit) * cell;
  return (
    <group ref={rig} scale={fit}>
      <Suspense fallback={null}>
        {p < 0.459 && (
          <group
            position={[-wall * 1.85, -wall * 1.0, 0]}
            rotation={[0.03, wall * 0.22, 0]}
            scale={0.16 + 0.73 * smooth(0.285, 0.335, p) + wall * 0.8}
          >
            <BlenderAsset
              name="digestive-system"
              opacity={smooth(0.285, 0.335, p) * (1 - wall)}
            />
            {p > 0.337 && p < 0.405 && (
              <group>
                <Html position={[1.7, 2.0, 0.7]} className="anatomy-label">
                  Stomach
                </Html>
                <Html position={[-2.25, -0.45, 0.7]} className="anatomy-label">
                  Colon
                </Html>
                <Html position={[0.65, -1.25, 0.7]} className="anatomy-label">
                  Small intestine
                </Html>
              </group>
            )}
          </group>
        )}
        {p > 0.397 && p < 0.57 && (
          <group
            position={[cell * -2, 0.12 - cell * 0.6, 0]}
            rotation={[0.94 + inspection * 0.28, -0.09, -0.03]}
            scale={0.3 + 0.88 * wall + cell * 0.48 + inspection * 0.1}
          >
            <BlenderAsset name="colon-section" opacity={wall * (1 - cell)} />
            {Array.from({ length: 10 }, (_, i) => (
              <mesh
                key={"ros" + i}
                position={[
                  0.2 + (i % 4) * 0.46,
                  0.3 + Math.sin(i * 2.4) * 0.25,
                  -0.1 + Math.cos(i * 1.7) * 0.32,
                ]}
              >
                <icosahedronGeometry args={[0.028, 1]} />
                <meshStandardMaterial
                  color="#ce8358"
                  transparent
                  opacity={wall * (1 - cell)}
                />
              </mesh>
            ))}
            {[-1.8, 0.45, 1.7].map((x) => (
              <mesh key={x} position={[x, 0.12, 0.15]}>
                <octahedronGeometry args={[0.055]} />
                <meshStandardMaterial
                  color="#9a8bae"
                  transparent
                  opacity={wall * (1 - cell)}
                />
              </mesh>
            ))}
            {Array.from({ length: 7 }, (_, i) => (
              <group
                key={i}
                position={[-1.65 + i * 0.52, 0.13 + (i % 2) * 0.17, 0.28]}
                scale={0.11}
                rotation={[0.1, 0.08, -0.25]}
              >
                <mesh rotation={[0, 0, Math.PI / 2]}>
                  <capsuleGeometry args={[0.62, 1.8, 8, 16]} />
                  <meshStandardMaterial
                    color="#397a70"
                    transparent
                    opacity={wall * (1 - cell)}
                  />
                </mesh>
              </group>
            ))}
          </group>
        )}
        {p > 0.506 && (
          <group
            rotation={[0.08, -0.12, -0.1]}
            scale={0.13 + cell * (narrow ? 0.99 : 1.37)}
          >
            <BlenderAsset
              name="engineered-ecn"
              opacity={organismAlpha}
              activity={protection}
            />
            <Release progress={progress} />
            {Array.from({ length: 12 }, (_, i) => (
              <mesh
                key={i}
                position={[
                  -1.7 + i * 0.31,
                  1.07 + Math.sin(i * 2.4) * 0.27,
                  0.05 + Math.cos(i * 1.7) * 0.12,
                ]}
              >
                <icosahedronGeometry args={[0.035, 1]} />
                <meshStandardMaterial
                  color="#ce8358"
                  transparent
                  opacity={organismAlpha * signal}
                />
              </mesh>
            ))}
            {[-2.05, 2.1].map((x) => (
              <mesh
                key={x}
                position={[x, -0.44, 0.14]}
                rotation={[0.2, 0.3, 0.4]}
              >
                <octahedronGeometry args={[0.085]} />
                <meshStandardMaterial
                  color="#9a8bae"
                  transparent
                  opacity={organismAlpha}
                />
              </mesh>
            ))}
            {p > 0.71 &&
              Array.from({ length: 5 }, (_, i) => (
                <mesh
                  key={i}
                  position={[-1.5 + i * 0.73, -1.13 - (i % 2) * 0.14, 0]}
                  rotation={[0, 0, 1.05]}
                >
                  <capsuleGeometry args={[0.085, 0.2, 5, 12]} />
                  <meshStandardMaterial
                    color="#719a89"
                    transparent
                    opacity={
                      (1 - smooth(0.754 + i * 0.004, 0.773 + i * 0.004, p)) *
                      organismAlpha
                    }
                  />
                </mesh>
              ))}
          </group>
        )}
      </Suspense>
    </group>
  );
}
