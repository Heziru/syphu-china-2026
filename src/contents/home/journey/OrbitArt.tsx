import { orbitPoint, orbitAngle, ORBITS } from "./orbitLayout";
import { SOLAR_PLANETS as PLANETS, solarPose } from "./orbitalSceneMotion";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import {
  BackSide,
  Vector3,
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  Points,
  ShaderMaterial,
} from "three";
type Progress = MutableRefObject<number>;
const planetVertex = `
  varying vec3 vNormal;
  varying vec3 vObject;
  varying vec2 vUv;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vObject = position;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const planetFragment = `
  uniform vec3 baseColor;
  uniform vec3 bandColor;
  uniform float solar;
  varying vec3 vNormal;
  varying vec3 vObject;
  void main() {
    vec3 n = normalize(vNormal);
    vec3 p = normalize(vObject);
    float wave = sin(p.y * 19.0 + sin(p.x * 6.0 + p.z * 4.0) * 1.7);
    float band = smoothstep(-0.18, 0.02, wave);
    vec3 color = mix(baseColor, bandColor, band * (1.0 - solar));
    float light = dot(n, normalize(vec3(-0.5, 0.7, 1.0)));
    color *= 0.78 + 0.22 * smoothstep(-0.2, 0.65, light);
    float edge = pow(1.0 - max(n.z, 0.0), 4.0);
    color = mix(color, bandColor, solar * (0.32 * light + 0.65 * edge));
    float spot = sin(p.x * 13.0 + sin(p.y * 9.0)) *
      sin(p.y * 11.0 + sin(p.z * 7.0)) * sin(p.z * 9.0 + p.x * 6.0);
    color = mix(color, bandColor, solar * smoothstep(0.57, 0.67, spot) * 0.65);
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;

function InkPlanet({
  radius,
  color,
  band,
  solar = false,
  ring = false,
}: {
  radius: number;
  color: string;
  band: string;
  solar?: boolean;
  ring?: boolean;
}) {
  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          baseColor: { value: new Color(color) },
          bandColor: { value: new Color(band) },
          solar: { value: solar ? 1 : 0 },
        },
        vertexShader: planetVertex,
        fragmentShader: planetFragment,
      }),
    [color, band, solar],
  );
  useEffect(() => () => material.dispose(), [material]);
  return (
    <group rotation={[0.15, 0, -0.3]}>
      <mesh scale={1.014}>
        <sphereGeometry args={[radius, 64, 40]} />
        <meshBasicMaterial
          side={BackSide}
          color={solar ? "#c98c6b" : "#637795"}
        />
      </mesh>
      <mesh material={material}>
        <sphereGeometry args={[radius, 64, 40]} />
      </mesh>
      {ring && (
        <mesh rotation={[1.18, 0.22, 0]}>
          <torusGeometry args={[radius * 1.55, radius * 0.055, 8, 128]} />
          <meshBasicMaterial color="#f5ceae" />
        </mesh>
      )}
    </group>
  );
}

export function StarField({ progress }: { progress: Progress }) {
  const points = useRef<Points>(null);
  const geometry = useMemo(() => {
    let seed = 6106;
    const random = () =>
      (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
    const count = 260;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const palette = ["#4341b1", "#774ecc", "#ad64bb", "#397ba5"].map(
      (c) => new Color(c),
    );
    for (let i = 0; i < count; i++) {
      positions.set(
        [(random() - 0.5) * 23, (random() - 0.5) * 13, -5 - random() * 3],
        i * 3,
      );
      colors.set(
        palette[Math.floor(random() * palette.length)].toArray(),
        i * 3,
      );
    }
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(positions, 3));
    g.setAttribute("color", new BufferAttribute(colors, 3));
    return g;
  }, []);
  useFrame(({ clock }) => {
    if (!points.current) return;
    points.current.rotation.z = Math.sin(clock.elapsedTime * 0.025) * 0.025;
    points.current.position.x = -progress.current * 0.25;
  });
  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial
        size={1.4}
        sizeAttenuation={false}
        vertexColors
        transparent
        opacity={0.35}
        depthWrite={false}
      />
    </points>
  );
}

function OrbitLine({ radius, aspect }: { radius: number; aspect: number }) {
  const geometry = useMemo(
    () =>
      new BufferGeometry().setFromPoints(
        Array.from(
          { length: 241 },
          (_, i) =>
            new Vector3(...orbitPoint(radius, (i / 240) * Math.PI * 2, aspect)),
        ),
      ),
    [radius, aspect],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <lineLoop geometry={geometry}>
      <lineBasicMaterial color="#9aaea9" transparent opacity={0.62} />
    </lineLoop>
  );
}
export function SolarSystem({
  progress,
}: {
  progress: Progress;
  narrow: boolean;
}) {
  const group = useRef<Group>(null);
  const planets = useRef<Group[]>([]);
  const aspect = useThree((s) => s.viewport.aspect);
  useFrame(({ clock }) => {
    if (!group.current) return;
    const pose = solarPose(progress.current);
    group.current.position.set(pose.x, pose.y, 0);
    group.current.scale.setScalar(pose.scale);
    group.current.visible = pose.visible;
    planets.current.forEach((node, i) => {
      const p = PLANETS[i];
      node.position.set(
        ...orbitPoint(
          p.orbit,
          orbitAngle(p.angle, clock.elapsedTime, progress.current),
          aspect,
        ),
      );
    });
  });
  return (
    <group ref={group}>
      {ORBITS.map((radius) => (
        <OrbitLine key={radius} radius={radius} aspect={aspect} />
      ))}
      <group position={[0, 0.15, 0.05]}>
        <InkPlanet
          radius={aspect < 1 ? 0.4 : 0.74}
          color="#efbd7d"
          band="#fff0bd"
          solar
        />
      </group>
      {PLANETS.map((p, i) => (
        <group
          key={i}
          ref={(node) => {
            if (node) planets.current[i] = node;
          }}
          position={orbitPoint(p.orbit, p.angle, aspect)}
        >
          <InkPlanet
            radius={p.radius * (aspect < 1 ? 0.64 : 1)}
            color={p.color}
            band={p.band}
            ring={p.ring}
          />
        </group>
      ))}
    </group>
  );
}
