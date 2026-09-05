import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  Points,
  ShaderMaterial,
} from "three";
import { SchoolBuilding } from "./SchoolBuilding";
import "./cosmicJourney.css";

type Props = {
  reduced: boolean;
};

const STAGES = [
  {
    at: 0,
    eyebrow: "ORBIT / 01",
    title: "Beyond the visible",
    copy: "Follow the signal home.",
  },
  {
    at: 0.24,
    eyebrow: "EARTH / 02",
    title: "A living planet",
    copy: "One world. Countless connected systems.",
  },
  {
    at: 0.48,
    eyebrow: "CHINA / 03",
    title: "Northeast China",
    copy: "The trajectory narrows toward Shenyang.",
  },
  {
    at: 0.68,
    eyebrow: "SHENYANG / 04",
    title: "Shenyang Pharmaceutical University",
    copy: "Science takes shape where people, ideas and biology meet.",
  },
  {
    at: 0.86,
    eyebrow: "LABORATORY / 05",
    title: "Enter the laboratory",
    copy: "Scroll once more to begin the research journey.",
  },
];

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const smoothstep = (value: number) => {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
};

function StarField({ progress }: { progress: React.MutableRefObject<number> }) {
  const points = useRef<Points>(null);
  const geometry = useMemo(() => {
    const count = matchMedia("(max-width: 700px)").matches ? 6500 : 18000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    let seed = 6106;
    const random = () =>
      (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
    const palette = [
      new Color("#7898b8"),
      new Color("#a59cc9"),
      new Color("#d4d5d8"),
    ];
    for (let i = 0; i < count; i += 1) {
      const radius = 15 + random() * 46;
      const theta = random() * Math.PI * 2;
      const phi = Math.acos(2 * random() - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.cos(phi);
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
      const color = palette[Math.floor(random() * palette.length)];
      colors.set(color.toArray(), i * 3);
    }
    const result = new BufferGeometry();
    result.setAttribute("position", new BufferAttribute(positions, 3));
    result.setAttribute("color", new BufferAttribute(colors, 3));
    return result;
  }, []);

  useFrame((_, delta) => {
    if (!points.current) return;
    points.current.rotation.y += delta * (0.006 + progress.current * 0.012);
    points.current.rotation.x = progress.current * 0.06;
  });

  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial
        size={0.038}
        sizeAttenuation
        transparent
        opacity={0.58}
        vertexColors
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  );
}

const earthVertex = `
varying vec3 vNormalW;
varying vec3 vPosition;
void main() {
  vNormalW = normalize(normalMatrix * normal);
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const earthFragment = `
varying vec3 vNormalW;
varying vec3 vPosition;
float hash(vec3 p){ p=fract(p*.3183099+.1); p*=17.; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float noise(vec3 p){ vec3 i=floor(p),f=fract(p); f=f*f*(3.-2.*f); return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z); }
void main(){
  vec3 n=normalize(vPosition);
  float land=noise(n*3.7)+noise(n*8.4)*.36+noise(n*17.)*.12;
  float mask=smoothstep(.61,.68,land+sin(n.y*8.)*.025);
  vec3 ocean=mix(vec3(.018,.075,.13),vec3(.035,.20,.27),max(n.y*.5+.5,0.));
  vec3 ground=mix(vec3(.08,.22,.17),vec3(.30,.42,.25),noise(n*11.));
  float light=max(dot(normalize(vNormalW),normalize(vec3(-.55,.7,.8))),0.);
  float rim=pow(1.-max(vNormalW.z,0.),3.);
  vec3 color=mix(ocean,ground,mask)*(0.28+light*.9)+vec3(.12,.34,.43)*rim*.75;
  gl_FragColor=vec4(color,1.);
}`;

function JourneyScene({
  progress,
}: {
  progress: React.MutableRefObject<number>;
}) {
  const earth = useRef<Group>(null);
  const campus = useRef<Group>(null);
  const atmosphereMaterial = useMemo(
    () =>
      new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        vertexShader: earthVertex,
        fragmentShader: `varying vec3 vNormalW; void main(){ float a=pow(1.-abs(vNormalW.z),3.2); gl_FragColor=vec4(.18,.58,.72,a*.28); }`,
      }),
    [],
  );

  useFrame(({ camera }, delta) => {
    const p = progress.current;
    const earthIn = smoothstep((p - 0.12) / 0.24);
    const earthOut = smoothstep((p - 0.61) / 0.17);
    if (earth.current) {
      earth.current.visible = earthIn > 0.002 && earthOut < 0.999;
      const scale = 0.4 + earthIn * 2.15 + smoothstep((p - 0.4) / 0.22) * 3.1;
      earth.current.scale.setScalar(scale);
      earth.current.position.set(
        1.5 - earthIn * 0.9 - earthOut * 3.8,
        -0.2 - earthOut * 1.5,
        -5.8 + earthIn * 0.8,
      );
      earth.current.rotation.y += delta * 0.035;
      earth.current.rotation.x = -0.18 + p * 0.1;
    }
    if (campus.current) {
      const campusIn = smoothstep((p - 0.6) / 0.24);
      campus.current.visible = campusIn > 0.002;
      campus.current.position.x = 1.65 * campusIn;
      campus.current.position.y = -1.5 + campusIn * 0.65;
      campus.current.position.z = -6 + campusIn * 1.7;
      campus.current.scale.setScalar(0.22 + campusIn * 0.43);
      campus.current.rotation.y = (1 - campusIn) * 0.18;
    }
    camera.position.z +=
      ((p > 0.58 ? 7.4 : 8.8) - camera.position.z) * Math.min(1, delta * 2.5);
  });

  return (
    <>
      <color attach="background" args={["#02040b"]} />
      <fog attach="fog" args={["#02040b", 10, 48]} />
      <ambientLight intensity={0.72} color="#7893aa" />
      <directionalLight
        position={[-5, 8, 7]}
        intensity={3.4}
        color="#d9e0d8"
        castShadow
      />
      <pointLight
        position={[5, 1, 2]}
        intensity={16}
        color="#5576b6"
        distance={18}
      />
      <StarField progress={progress} />
      <group ref={earth}>
        <mesh>
          <sphereGeometry args={[1.42, 96, 64]} />
          <shaderMaterial
            vertexShader={earthVertex}
            fragmentShader={earthFragment}
          />
        </mesh>
        <mesh scale={1.035} material={atmosphereMaterial}>
          <sphereGeometry args={[1.42, 64, 48]} />
        </mesh>
        <group position={[0.78, 0.94, 0.91]}>
          <mesh>
            <sphereGeometry args={[0.026, 16, 16]} />
            <meshBasicMaterial color="#d7b98a" />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.09, 0.007, 8, 48]} />
            <meshBasicMaterial color="#81c1bd" transparent opacity={0.85} />
          </mesh>
        </group>
      </group>
      <group ref={campus} visible={false}>
        <SchoolBuilding />
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, -0.03, 0.65]}
          receiveShadow
        >
          <planeGeometry args={[12, 7]} />
          <meshStandardMaterial color="#121924" roughness={0.96} />
        </mesh>
      </group>
    </>
  );
}

export function CosmicJourney({ reduced }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const progress = useRef(reduced ? 1 : 0);
  const [stageIndex, setStageIndex] = useState(reduced ? 4 : 0);
  const visualRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const range = Math.max(1, section.offsetHeight - innerHeight);
      const next = clamp01(-rect.top / range);
      progress.current = next;
      const nextStage = STAGES.reduce(
        (result, stage, index) => (next >= stage.at ? index : result),
        0,
      );
      setStageIndex((previous) =>
        previous === nextStage ? previous : nextStage,
      );
      if (visualRef.current)
        visualRef.current.style.opacity = `${1 - smoothstep((next - 0.94) / 0.06)}`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => {
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [reduced]);

  const stage = STAGES[stageIndex];
  return (
    <section
      ref={sectionRef}
      className={`cosmic-journey${reduced ? " cosmic-journey--reduced" : ""}`}
      aria-label="Journey from space to the SYPHU-China laboratory"
    >
      <div ref={visualRef} className="cosmic-journey__sticky">
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, 8.8], fov: 42, near: 0.1, far: 100 }}
          gl={{ antialias: true, powerPreference: "high-performance" }}
        >
          <JourneyScene progress={progress} />
        </Canvas>
        <div className="cosmic-journey__vignette" />
        <div className="cosmic-journey__copy" key={stage.eyebrow}>
          <p>{stage.eyebrow}</p>
          <h1>{stage.title}</h1>
          <span>{stage.copy}</span>
        </div>
        {stageIndex >= 3 && (
          <div className="cosmic-journey__identity">
            <img
              src={`${import.meta.env.BASE_URL}assets/school/school-logo.jpg`}
              alt="Shenyang Pharmaceutical University emblem"
            />
            <span>1931 · SHENYANG</span>
          </div>
        )}
        <div className="cosmic-journey__rail" aria-hidden="true">
          {STAGES.map((item, index) => (
            <i
              key={item.eyebrow}
              className={index <= stageIndex ? "is-active" : ""}
            />
          ))}
        </div>
        <div className="cosmic-journey__scroll" aria-hidden="true">
          <span />
          Scroll to descend
        </div>
      </div>
    </section>
  );
}
