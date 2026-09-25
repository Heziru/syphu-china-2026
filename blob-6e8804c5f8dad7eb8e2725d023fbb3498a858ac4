import { orbitPoint, orbitAngle, ORBITS } from "./orbitLayout";
import { SOLAR_PLANETS as PLANETS, solarPose } from "./orbitalSceneMotion";
import {
  SOLAR_ART,
  solarArtworkTexture,
  paintedSurface,
  type ArtRect,
} from "./solarArtwork";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import {
  BackSide,
  Vector3,
  Vector4,
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
  ${paintedSurface}
  uniform vec3 baseColor;
  uniform vec3 bandColor;
  uniform float solar;
  varying vec3 vNormal;
  varying vec3 vObject;
  void main() {
    vec3 n = normalize(vNormal);
    vec3 p = normalize(vObject);
    float wave = sin(p.y * 19.0 + sin(p.x * 6.0 + p.z * 4.0) * 1.7);
    float band = smoothstep(-0.36, 0.32, wave);
    vec3 color = mix(baseColor, bandColor, band * (1.0 - solar));
    float light = dot(n, normalize(vec3(-0.5, 0.7, 1.0)));
    color *= 0.72 + 0.28 * smoothstep(-0.35, 0.85, light);
    float edge = pow(1.0 - max(n.z, 0.0), 4.0);
    color = mix(color, bandColor, solar * (0.32 * light + 0.65 * edge));
    float spot = sin(p.x * 13.0 + sin(p.y * 9.0)) *
      sin(p.y * 11.0 + sin(p.z * 7.0)) * sin(p.z * 9.0 + p.x * 6.0);
    color = mix(color, bandColor, solar * smoothstep(0.57, 0.67, spot) * 0.65);
    // Fine pigment and warm rim light preserve the painted cartoon materials.
    float grain = fract(sin(dot(p.xy * 170.0 + p.z, vec2(12.9898,78.233))) * 43758.5453);
    float sheen = pow(max(0.0, dot(n, normalize(vec3(-0.42,0.6,1.0)))), 16.0);
    color = mix(color, vec3(1.0,0.94,0.79), sheen * 0.15);
    color *= 1.0 - edge * 0.055 + (grain - 0.5) * 0.018;
    color = mix(color, paintedColor(n), artReady);
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
  art,
}: {
  radius: number;
  color: string;
  band: string;
  solar?: boolean;
  ring?: boolean;
  art: ArtRect;
}) {
  const artwork = useMemo(solarArtworkTexture, []);
  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          baseColor: { value: new Color(color) },
          bandColor: { value: new Color(band) },
          solar: { value: solar ? 1 : 0 },
          artwork: { value: artwork },
          artRect: { value: new Vector4(...art) },
          artReady: { value: 0 },
        },
        vertexShader: planetVertex,
        fragmentShader: planetFragment,
      }),
    [color, band, solar, art, artwork],
  );
  useFrame(() => {
    material.uniforms.artReady.value = artwork.image ? 1 : 0;
  });
  useEffect(() => () => material.dispose(), [material]);
  return (
    <group rotation={[0.15, 0, -0.3]}>
      <mesh scale={1.007}>
        <sphereGeometry args={[radius, 64, 40]} />
        <meshBasicMaterial
          side={BackSide}
          color={solar ? "#e9c491" : "#bfcfc1"}
        />
      </mesh>
      <mesh material={material}>
        <sphereGeometry args={[radius, 64, 40]} />
      </mesh>
      {ring && (
        <mesh rotation={[1.18, 0.22, 0]}>
          <torusGeometry args={[radius * 1.55, radius * 0.035, 8, 128]} />
          <meshBasicMaterial color="#ffe3ae" />
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
      <lineBasicMaterial color="#80aa9e" transparent opacity={0.65} />
    </lineLoop>
  );
}
/** One draw call for fine stardust, on the same ellipses as the planets. */
function OrbitDust({ aspect }: { aspect: number }) {
  const material = useRef<ShaderMaterial>(null);
  const geometry = useMemo(() => {
    let seed = 20260908;
    const random = () =>
      (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
    const count = aspect < 1 ? 760 : 1400;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    const palette = ["#f7d897", "#fff4d1", "#a2bcad", "#c1b4cd"].map(
      (c) => new Color(c),
    );
    for (let i = 0; i < count; i++) {
      const radius =
        ORBITS[i % ORBITS.length] + (random() + random() - 1) * 0.029;
      const point = orbitPoint(radius, random() * Math.PI * 2, aspect);
      point[2] = -0.12;
      positions.set(point, i * 3);
      sizes[i] = i % 131 === 0 ? 13 : 1.2 + random() * 2.5;
      phases[i] = random() * Math.PI * 2;
      colors.set(palette[i % palette.length].toArray(), i * 3);
    }
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(positions, 3));
    g.setAttribute("color", new BufferAttribute(colors, 3));
    g.setAttribute("size", new BufferAttribute(sizes, 1));
    g.setAttribute("phase", new BufferAttribute(phases, 1));
    return g;
  }, [aspect]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame(({ clock }) => {
    if (material.current)
      material.current.uniforms.time.value = clock.elapsedTime;
  });
  return (
    <points geometry={geometry}>
      <shaderMaterial
        ref={material}
        transparent
        depthWrite={false}
        uniforms={{ time: { value: 0 } }}
        vertexShader={`attribute float size; attribute float phase; varying vec3 vColor; varying float vPhase; varying float vSize; void main(){vColor=color;vPhase=phase;vSize=size;gl_PointSize=size;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`}
        fragmentShader={`uniform float time; varying vec3 vColor; varying float vPhase; varying float vSize; void main(){vec2 p=abs(gl_PointCoord-.5)*2.0;float roundStar=1.0-smoothstep(.2,1.0,length(p));float crossStar=1.0-smoothstep(.13,.36,p.x*p.y+min(p.x,p.y)*.45);float alpha=vSize>8.0?crossStar*(1.0-max(p.x,p.y)):roundStar;alpha*=.44+.17*sin(time*.65+vPhase);gl_FragColor=vec4(vColor,alpha);
      #include <colorspace_fragment>
      }`}
        vertexColors
      />
    </points>
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
      <OrbitDust aspect={aspect} />
      {ORBITS.map((radius) => (
        <OrbitLine key={radius} radius={radius} aspect={aspect} />
      ))}
      <group position={[0, 0.15, 0.05]}>
        <InkPlanet
          radius={aspect < 1 ? 0.4 : 0.74}
          color="#efbd7d"
          band="#fff0bd"
          solar
          art={SOLAR_ART.sun}
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
            art={
              [
                SOLAR_ART.blue,
                SOLAR_ART.lilac,
                SOLAR_ART.ringed,
                SOLAR_ART.teal,
                SOLAR_ART.violet,
              ][i]
            }
          />
        </group>
      ))}
    </group>
  );
}
