import { useTexture } from "@react-three/drei";
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
  BufferAttribute,
  BufferGeometry,
  Color,
  Group,
  Points,
  Quaternion,
  ShaderMaterial,
  SRGBColorSpace,
  Vector3,
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
  {
    at: 0,
    eyebrow: "01 / COSMIC ORIGINS",
    title: "A world of possibility",
    copy: "A journey from the cosmos to our laboratory.",
  },
  {
    at: 0.23,
    eyebrow: "02 / OUR PLANET",
    title: "One living planet",
    copy: "An extraordinary world. A shared beginning.",
  },
  {
    at: 0.46,
    eyebrow: "03 / NORTHEAST CHINA",
    title: "Closer to home",
    copy: "China · Shenyang",
  },
  {
    at: 0.66,
    eyebrow: "04 / SHENYANG",
    title: "Shenyang Pharmaceutical University",
    copy: "People, ideas and biology meet here.",
  },
  {
    at: 0.84,
    eyebrow: "05 / THE LABORATORY",
    title: "Discovery starts here",
    copy: "Come inside. Take a closer look.",
  },
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
    const count = 780;
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
        size={2}
        sizeAttenuation={false}
        vertexColors
        transparent
        opacity={0.8}
        depthWrite={false}
      />
    </points>
  );
}

function SolarSystem({
  progress,
  narrow,
}: {
  progress: Progress;
  narrow: boolean;
}) {
  const group = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!group.current) return;
    const departure = smooth((progress.current - 0.14) / 0.46);
    group.current.position.set(
      -departure * (narrow ? 5 : 11),
      departure * 3,
      -departure * 4,
    );
    group.current.rotation.z = Math.sin(clock.elapsedTime * 0.05) * 0.015;
    group.current.visible = progress.current < 0.68;
  });
  return (
    <group ref={group}>
      <group
        rotation={[0, 0, 0.26]}
        position={[0, 0.35, -3]}
        scale={[1, 0.31, 1]}
      >
        {[5.1, 6.25, 7.7].map((radius) => (
          <group key={radius}>
            <mesh>
              <torusGeometry args={[radius, 0.015, 5, 220]} />
              <meshBasicMaterial color="#638298" />
            </mesh>
            <mesh position={[0, 0.06, -0.01]}>
              <torusGeometry args={[radius + 0.04, 0.008, 4, 220]} />
              <meshBasicMaterial color="#f6dcac" />
            </mesh>
          </group>
        ))}
      </group>
      <group position={[narrow ? 0.25 : 0.5, 0.6, 0]}>
        <InkPlanet radius={1.22} color="#ff8b88" band="#ffd89c" solar />
      </group>
      <group position={[narrow ? -1.5 : -3.7, -1.7, 1]}>
        <InkPlanet radius={0.7} color="#9372bb" band="#d887c8" />
      </group>
      <group position={[narrow ? 1.8 : 4.6, -2.9, 0]}>
        <InkPlanet radius={0.86} color="#de7aac" band="#a181c4" ring />
      </group>
      <group position={[narrow ? -2.1 : -5.6, -0.4, 0]}>
        <InkPlanet radius={0.26} color="#80dbec" band="#4daac6" />
      </group>
      <group position={[narrow ? -1.6 : -3.3, 2.45, -1]}>
        <InkPlanet radius={0.23} color="#849bdb" band="#b7a1e4" />
      </group>
      <group position={[narrow ? 2.3 : 5.4, 3.15, -1]}>
        <InkPlanet radius={0.4} color="#86c8d3" band="#a3a0ce" />
      </group>
      <group position={[1.8, 0.9, 0]}>
        <InkPlanet radius={0.17} color="#db9bce" band="#f1c0d7" />
      </group>
    </group>
  );
}

// SphereGeometry's u=0 is longitude -180°, v=1 is the north pole.
// Rotating the sampled surface vector to +Z keeps the map and the destination aligned.
function facing(longitude: number, latitude: number) {
  const lon = (longitude * Math.PI) / 180;
  const lat = (latitude * Math.PI) / 180;
  return new Quaternion().setFromUnitVectors(
    new Vector3(
      Math.cos(lat) * Math.cos(lon),
      Math.sin(lat),
      -Math.cos(lat) * Math.sin(lon),
    ),
    new Vector3(0, 0, 1),
  );
}

function CartoonEarth({
  progress,
  narrow,
}: {
  progress: Progress;
  narrow: boolean;
}) {
  const earth = useRef<Group>(null);
  const surface = useRef<Group>(null);
  const texture = useTexture(asset("cosmic/world-map.svg"));
  const start = useMemo(() => facing(25, 16), []);
  const destination = useMemo(() => facing(123.43, 41.8), []);
  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: { earthMap: { value: texture } },
        vertexShader: planetVertex,
        fragmentShader: `
      uniform sampler2D earthMap;
      varying vec2 vUv;
      varying vec3 vNormal;
      void main() {
        vec3 n = normalize(vNormal);
        vec3 color = texture2D(earthMap, vUv).rgb;
        float light = dot(n, normalize(vec3(-0.65, 0.6, 1.0)));
        color *= mix(0.67, 1.0, smoothstep(-0.3, 0.7, light));
        gl_FragColor = vec4(color, 1.0);
        #include <colorspace_fragment>
      }
    `,
      }),
    [texture],
  );
  useEffect(() => {
    texture.colorSpace = SRGBColorSpace;
    texture.needsUpdate = true;
    return () => material.dispose();
  }, [texture, material]);
  useFrame(() => {
    if (!earth.current || !surface.current) return;
    const p = progress.current;
    const enter = smooth((p - 0.12) / 0.22);
    const focus = smooth((p - 0.35) / 0.21);
    const leave = smooth((p - 0.59) / 0.12);
    earth.current.visible = leave < 0.999;
    earth.current.position.set(
      (narrow ? 1.55 : 3.35) * (1 - enter) -
        (narrow ? 0 : 1.9) * enter -
        leave * 2,
      1.9 * (1 - enter) + 0.35 * enter + leave * 4,
      1,
    );
    earth.current.scale.setScalar(
      (0.31 + enter * 1.5 + focus * 0.3) *
        (1 - leave * 0.6) *
        (narrow ? 0.88 : 1),
    );
    surface.current.quaternion.copy(start).slerp(destination, focus);
  });
  return (
    <group ref={earth}>
      <mesh scale={1.012}>
        <sphereGeometry args={[1, 96, 64]} />
        <meshBasicMaterial side={BackSide} color="#63859d" />
      </mesh>
      <group ref={surface}>
        <mesh material={material}>
          <sphereGeometry args={[1, 96, 64]} />
        </mesh>
      </group>
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
      <StarField progress={progress} />
      <SolarSystem progress={progress} narrow={viewport.aspect < 1} />
      <Suspense fallback={null}>
        <CartoonEarth progress={progress} narrow={viewport.aspect < 1} />
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
      const p = clamp01((56 - rect.top) / range);
      progress.current = p;
      setStageIndex(
        STAGES.reduce((index, item, i) => (p >= item.at ? i : index), 0),
      );
      const warmth = smooth((p - 0.55) / 0.21);
      const dissolve = smooth((p - 0.87) / 0.11);
      sticky.style.setProperty("--warmth", String(warmth));
      sticky.style.setProperty("--campus", String(smooth((p - 0.63) / 0.06)));
      sticky.style.setProperty(
        "--cosmos",
        String(1 - smooth((p - 0.56) / 0.13)),
      );
      sticky.style.setProperty("--intro-opacity", String(1 - dissolve));
      setActive(!document.hidden && p < 0.7 && rect.bottom > 56);
      // Start the lab renderer before its first visible frame, but expose its controls only at the end.
      onLabReady(p > 0.85);
      setInLab(p >= 0.985);
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
  const stage = staticIntro ? STAGES[3] : STAGES[stageIndex];
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
          <div
            className={`cosmic-journey__copy${staticIntro || stageIndex >= 3 ? " is-campus" : ""}`}
            key={stage.eyebrow}
          >
            <p>{stage.eyebrow}</p>
            <h1>{stage.title}</h1>
            <span>{stage.copy}</span>
          </div>
          <div
            className="cosmic-journey__identity"
            aria-hidden={!staticIntro && stageIndex < 3}
          >
            <img
              src={asset("school/school-logo.jpg")}
              alt="Shenyang Pharmaceutical University emblem"
            />
            <span>
              SHENYANG
              <br />
              SINCE 1931
            </span>
          </div>
          <div className="cosmic-journey__footer">
            <span className="cosmic-journey__scroll" aria-hidden="true">
              {staticIntro ? "SYPHU-CHINA / 2026" : "SCROLL TO EXPLORE ↓"}
            </span>
            <div className="cosmic-journey__rail" aria-hidden="true">
              {STAGES.map((s, i) => (
                <i key={s.at} className={i <= stageIndex ? "is-active" : ""} />
              ))}
            </div>
            <button type="button" onClick={goToLab}>
              Enter laboratory ↗
            </button>
          </div>
        </div>
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
