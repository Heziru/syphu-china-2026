import {
  Suspense,
  useMemo,
  useEffect,
  useRef,
  type MutableRefObject,
} from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { SphereMounted } from "./SphereMounted";
import {
  journeyPose,
  smooth,
  PLANET_RADIUS as R,
  SITE_SEPARATION,
} from "./journeyMotion";
import { Group, ShaderMaterial, Color } from "three";
import { BlenderAsset } from "../components/BlenderAsset";
import { orbitAngle, CAMPUS_ANGLE } from "./orbitLayout";

function Block({
  p,
  s,
  color = "#a34843",
}: {
  p: [number, number, number];
  s: [number, number, number];
  color?: string;
}) {
  return (
    <mesh position={p}>
      <boxGeometry
        args={[
          ...s,
          Math.max(1, Math.ceil(s[0] / 0.24)),
          1,
          Math.max(1, Math.ceil(s[2] / 0.24)),
        ]}
      />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
  );
}

function Tree({ x, z, scale = 1 }: { x: number; z: number; scale?: number }) {
  return (
    <group position={[x, 0, z]} scale={scale}>
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.04, 0.055, 0.5, 7]} />
        <meshStandardMaterial color="#b59c7b" />
      </mesh>
      <mesh position={[0, 0.65, 0]} scale={[0.36, 0.52, 0.35]}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color="#8eb69a" roughness={1} />
      </mesh>
    </group>
  );
}
function CampusSite({ research = false }: { research?: boolean }) {
  return (
    <SphereMounted>
      <group scale={research ? 0.6 : 0.49}>
        <BlenderAsset name={research ? "research-building" : "library"} />
      </group>
      {[-3.1, -2.75, 2.75, 3.1].map((x, i) => (
        <Tree key={x} x={x} z={i % 2 ? -0.3 : -1} scale={0.7 + i * 0.07} />
      ))}
      <Block
        p={[0, -0.009, research ? 1.85 : 2.38]}
        s={[research ? 1.05 : 1.7, 0.035, research ? 1.6 : 1.4]}
        color="#d2ccae"
      />
      {[-3.15, 3.15].map((x) => (
        <mesh key={x} position={[x, 0.04, 0.8]} scale={[0.45, 0.13, 0.28]}>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial color="#b2c4aa" roughness={1} />
        </mesh>
      ))}
    </SphereMounted>
  );
}

function StoryPlanetSurface() {
  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          base: { value: new Color("#b7d5ce") },
          band: { value: new Color("#82aaa8") },
          line: { value: new Color("#6f9297") },
        },
        vertexShader: `varying vec3 vP; varying vec3 vN; void main(){vP=position;vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
        fragmentShader:
          `varying vec3 vP; varying vec3 vN; uniform vec3 base;uniform vec3 band;uniform vec3 line;
    void main(){vec3 p=normalize(vP);float f=p.y*9.+sin(p.x*5.+p.z*3.)*.7+sin(p.z*7.)*.3;
    float wave=sin(f);float fill=smoothstep(-.22,-.17,wave);float stroke=1.-smoothstep(.015,.03,abs(wave+.19));
    vec3 c=mix(base,band,fill*.48);c=mix(c,line,stroke*.55);
    c=mix(base,c,1.-smoothstep(.70,.91,abs(p.y)));\n    float light=smoothstep(-.7,.8,dot(normalize(vN),normalize(vec3(-.4,.8,1.))));c*=.82+.18*light;
    gl_FragColor=vec4(c,1.);#include <colorspace_fragment>}`.replace(
            ";#include",
            ";\n#include",
          ),
      }),
    [],
  );
  useEffect(() => () => material.dispose(), [material]);
  return (
    <mesh material={material}>
      <sphereGeometry args={[R, 128, 72]} />
    </mesh>
  );
}

export function CampusPlanet({
  progress,
}: {
  progress: MutableRefObject<number>;
  narrow: boolean;
}) {
  const root = useRef<Group>(null),
    wheel = useRef<Group>(null),
    library = useRef<Group>(null),
    research = useRef<Group>(null);
  const aspect = useThree((s) => s.viewport.aspect);
  const displayed = useRef(progress.current);
  useFrame(({ clock }, dt) => {
    if (
      !root.current ||
      !wheel.current ||
      !library.current ||
      !research.current
    )
      return;
    displayed.current +=
      (progress.current - displayed.current) *
      (1 - Math.exp(-14 * Math.min(dt, 0.1)));
    const pose = journeyPose(
      displayed.current,
      aspect,
      orbitAngle(CAMPUS_ANGLE, clock.elapsedTime, displayed.current),
    );
    root.current.scale.setScalar(pose.scale);
    root.current.position.set(pose.x, pose.y, 0);
    root.current.rotation.x = pose.pitch;
    wheel.current.rotation.z =
      pose.rotation +
      (displayed.current < 0.08
        ? Math.sin(clock.elapsedTime * 0.25) *
          0.012 *
          (1 - displayed.current / 0.08)
        : 0);
    library.current.scale.setScalar(
      Math.max(0.001, smooth(0.12, 0.23, displayed.current)),
    );
    library.current.visible = pose.libraryVisible && displayed.current > 0.14;
    research.current.visible = pose.researchVisible && displayed.current > 0.14;
  });
  return (
    <group ref={root}>
      <group ref={wheel}>
        <StoryPlanetSurface />
        <group ref={library} position={[0, R - 0.012, 0]}>
          <Suspense fallback={null}>
            <CampusSite />
          </Suspense>
        </group>
        <group ref={research} rotation={[0, 0, -SITE_SEPARATION]}>
          <group position={[0, R - 0.012, 0]}>
            <Suspense fallback={null}>
              <CampusSite research />
            </Suspense>
          </group>
        </group>
      </group>
    </group>
  );
}
