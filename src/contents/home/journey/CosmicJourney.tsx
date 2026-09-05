import { orbitPoint, orbitAngle, ORBITS } from "./orbitLayout";
import { CampusPlanet } from "./CampusPlanet";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type ReactNode,
} from "react";
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
import { SceneErrorBoundary } from "../ui/SceneErrorBoundary";
import "./cosmicJourney.css";

type Progress = MutableRefObject<number>;
type Props = {
  reduced: boolean;
  children: ReactNode;
  onLabReady: (ready: boolean) => void;
};
const STAGES = [
  { at: 0, title: "" },
  { at: 0.29, title: "Library" },
  { at: 0.54, title: "" },
  { at: 0.7, title: "Research building" },
  { at: 0.92, title: "" },
];
const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const smooth = (n: number) => {
  const t = clamp01(n);
  return t * t * (3 - 2 * t);
};
const asset = (path: string) => `${import.meta.env.BASE_URL}assets/${path}`;

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

function StarField({ progress }: { progress: Progress }) {
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
const PLANETS = [
  { orbit: 0.44, angle: 2.36, radius: 0.24, color: "#82bac7", band: "#badbd7" },
  { orbit: 0.66, angle: 4.08, radius: 0.42, color: "#c1b4cf", band: "#e7d4d5" },
  {
    orbit: 1,
    angle: 5.42,
    radius: 0.53,
    color: "#aaa8c6",
    band: "#dcd0d7",
    ring: true,
  },
  { orbit: 1, angle: 2.94, radius: 0.29, color: "#93c6be", band: "#c6ddcb" },
  { orbit: 0.66, angle: 1.32, radius: 0.2, color: "#baacd2", band: "#dcd0e6" },
];
function SolarSystem({ progress }: { progress: Progress; narrow: boolean }) {
  const group = useRef<Group>(null);
  const planets = useRef<Group[]>([]);
  const aspect = useThree((s) => s.viewport.aspect);
  useFrame(({ clock }) => {
    if (!group.current) return;
    const departure = smooth((progress.current - 0.08) / 0.2);
    group.current.position.set(-departure * 11, departure * 2, 0);
    group.current.scale.setScalar(1 + departure * 0.55);
    group.current.visible = progress.current < 0.3;
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
          radius={aspect < 1 ? 0.46 : 0.88}
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

function JourneyScene({
  progress,
  onContextLost,
}: {
  progress: Progress;
  onContextLost: () => void;
}) {
  const viewport = useThree((s) => s.viewport);
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    const handleLost = (event: Event) => {
      event.preventDefault();
      onContextLost();
    };
    gl.domElement.addEventListener("webglcontextlost", handleLost);
    return () =>
      gl.domElement.removeEventListener("webglcontextlost", handleLost);
  }, [gl, onContextLost]);
  const scale = viewport.height / 9;
  return (
    <group scale={scale}>
      <ambientLight intensity={1.4} />
      <directionalLight
        position={[-4, 8, 10]}
        intensity={2.2}
        color="#fff3de"
      />
      <StarField progress={progress} />
      <SolarSystem progress={progress} narrow={viewport.aspect < 1} />
      <Suspense fallback={null}>
        <CampusPlanet progress={progress} narrow={viewport.aspect < 1} />
      </Suspense>
    </group>
  );
}

export function CosmicJourney({ reduced, children, onLabReady }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const [stageIndex, setStageIndex] = useState(0);
  const [active, setActive] = useState(true);
  const [failed, setFailed] = useState(false);
  const staticIntro = reduced || failed;
  const [inLab, setInLab] = useState(false);
  const docked = useRef(false);
  useEffect(() => {
    if (!inLab || staticIntro) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [inLab, staticIntro]);
  const onSceneError = useCallback(() => setFailed(true), []);

  useEffect(() => {
    if (staticIntro) {
      onLabReady(true);
      return;
    }
    let frame = 0;
    const update = () => {
      frame = 0;
      const section = sectionRef.current;
      const sticky = stickyRef.current;
      if (!section || !sticky) return;
      // The navbar occupies 56 CSS pixels. This is also the sticky offset.
      const rect = section.getBoundingClientRect();
      const range = Math.max(1, section.offsetHeight - sticky.offsetHeight);
      const p = docked.current ? 1 : clamp01((56 - rect.top) / range);
      progress.current = p;
      setStageIndex(
        STAGES.reduce((index, item, i) => (p >= item.at ? i : index), 0),
      );
      const warmth = smooth((p - 0.2) / 0.6);
      const dissolve = smooth((p - 0.92) / 0.065);
      sticky.style.setProperty("--warmth", String(warmth));
      sticky.style.setProperty("--intro-opacity", String(1 - dissolve));
      setActive(!document.hidden && p < 0.995 && rect.bottom > 56);
      // Start the lab renderer before its first visible frame, but expose its controls only at the end.
      onLabReady(p > 0.85);
      if (p >= 0.985) {
        docked.current = true;
        setInLab(true);
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    document.addEventListener("visibilitychange", schedule);
    return () => {
      removeEventListener("scroll", schedule);
      removeEventListener("resize", schedule);
      document.removeEventListener("visibilitychange", schedule);
      cancelAnimationFrame(frame);
    };
  }, [staticIntro, onLabReady]);

  const goToLab = () => {
    const section = sectionRef.current;
    if (!section) return;
    const target = staticIntro ? document.getElementById("laboratory") : null;
    const top = target
      ? target.getBoundingClientRect().top + scrollY - 56
      : section.getBoundingClientRect().top +
        scrollY +
        section.offsetHeight -
        innerHeight;
    window.scrollTo({ top, behavior: staticIntro ? "instant" : "smooth" });
  };
  const replay = () => {
    docked.current = false;
    setInLab(false);
    onLabReady(false);
    window.scrollTo({ top: 0, behavior: "instant" });
    window.dispatchEvent(new Event("scroll"));
  };
  const stage = staticIntro ? STAGES[1] : STAGES[stageIndex];
  return (
    <section
      ref={sectionRef}
      className={`cosmic-journey${staticIntro ? " cosmic-journey--static" : ""}`}
      aria-label="Journey to the SYPHU-China laboratory"
      data-stage={staticIntro ? "campus" : stageIndex}
    >
      <div
        ref={stickyRef}
        className={`cosmic-journey__sticky${inLab ? " is-in-lab" : ""}`}
      >
        <div className="cosmic-journey__art" aria-hidden={inLab} inert={inLab}>
          {!staticIntro && (
            <div className="cosmic-journey__space" aria-hidden="true">
              <SceneErrorBoundary onError={onSceneError}>
                <Canvas
                  orthographic
                  flat
                  frameloop={active ? "always" : "never"}
                  dpr={[1, 1.5]}
                  camera={{
                    position: [0, 0, 20],
                    zoom: 70,
                    near: 0.1,
                    far: 100,
                  }}
                  gl={{
                    alpha: true,
                    antialias: true,
                    powerPreference: "high-performance",
                  }}
                  fallback={null}
                  onCreated={({ gl }) => {
                    gl.setClearColor(0x000000, 0);
                  }}
                >
                  <JourneyScene
                    progress={progress}
                    onContextLost={onSceneError}
                  />
                </Canvas>
              </SceneErrorBoundary>
            </div>
          )}
          <div className="cosmic-journey__paper" aria-hidden="true" />
          <div
            hidden={!staticIntro}
            className="cosmic-journey__campus"
            aria-hidden={!staticIntro && stageIndex < 3}
          >
            <img
              src={asset("school/school-building.jpg")}
              width="1984"
              height="832"
              alt="Original illustration of Shenyang Pharmaceutical University"
            />
          </div>
          {stage.title && (
            <div className="cosmic-journey__copy">
              <h1>{stage.title}</h1>
            </div>
          )}
          <div className="cosmic-journey__footer">
            <span className="cosmic-journey__scroll" aria-hidden="true">
              {staticIntro ? "SYPHU-CHINA / 2026" : "Scroll ↓"}
            </span>
            <button type="button" onClick={goToLab}>
              Skip ↗
            </button>
          </div>
        </div>
        {inLab && (
          <button
            className="journey-replay"
            onClick={replay}
            aria-label="Replay opening"
          >
            ↺
          </button>
        )}
        <div
          className="cosmic-journey__lab"
          inert={!staticIntro && !inLab}
          aria-hidden={!staticIntro && !inLab}
        >
          {children}
        </div>
      </div>
    </section>
  );
}
