import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
  type ReactNode,
} from "react";
import { Group } from "three";
import { useLocation, useNavigate } from "react-router-dom";
import { CampusPlanet } from "./CampusPlanet";
import { SolarSystem, StarField } from "./OrbitArt";
import { DataGlobe } from "./DataGlobe";
import { ScienceAnatomy } from "../science/ScienceAnatomy";
import { PersonScene } from "./PersonScene";
import { OpeningSequence } from "./OpeningSequence";
import { campusDeparture } from "./orbitalSceneMotion";
import { SceneErrorBoundary } from "../ui/SceneErrorBoundary";
import {
  NARRATIVE,
  clamp,
  smooth,
  stageAt,
  sciencePhase,
} from "./storyTimeline";
import {
  TapControl,
  GlobeCaption,
  ScienceCaption,
  StoryCopy,
} from "./JourneyOverlay";
import "./cosmicJourney.css";
import "./continuousJourney.css";
type Progress = MutableRefObject<number>;
function JourneyScene({
  progress,
  year,
  selected,
  onSelect,
  inspection,
}: {
  progress: Progress;
  year: number;
  selected: string | null;
  onSelect: (s: string) => void;
  inspection: number;
}) {
  const viewport = useThree((s) => s.viewport),
    solar = useRef(0),
    campus = useRef(0),
    campusHost = useRef<Group>(null);
  useFrame(() => {
    const p = progress.current;
    solar.current = p;
    campus.current = p < 0.77 ? 0 : clamp((p - 0.78) / 0.22);
    if (campusHost.current) {
      campusHost.current.visible = p < 0.13 || p > 0.772;
      const depart = campusDeparture(p) * (1 - smooth(0.772, 0.795, p));
      campusHost.current.position.set(depart * 12, depart * 3, 0);
    }
  });
  return (
    <group scale={viewport.height / 9}>
      <ambientLight intensity={1.5} />
      <directionalLight
        position={[-4, 8, 10]}
        intensity={2.2}
        color="#fff3de"
      />
      <directionalLight
        position={[6, 1, -3]}
        intensity={0.65}
        color="#c4dddc"
      />
      <StarField progress={progress} />
      <SolarSystem progress={solar} narrow={viewport.aspect < 1} />
      <DataGlobe
        progress={progress}
        year={year}
        selected={selected}
        onSelect={onSelect}
        inspection={progress.current < 0.27 ? inspection : 0}
      />
      <group ref={campusHost}>
        <Suspense fallback={null}>
          <CampusPlanet
            progress={campus}
            narrow={viewport.aspect < 1}
            inspection={progress.current > 0.8 ? inspection : 0}
          />
        </Suspense>
      </group>
    </group>
  );
}
export function CosmicJourney({
  reduced,
  children,
  onLabReady,
}: {
  reduced: boolean;
  children: ReactNode;
  onLabReady: (n: boolean) => void;
}) {
  const sectionRef = useRef<HTMLElement>(null),
    stickyRef = useRef<HTMLDivElement>(null),
    progress = useRef(0),
    docked = useRef(false),
    currentStage = useRef(0);
  const [stage, setStage] = useState(0),
    [active, setActive] = useState(true),
    [failed, setFailed] = useState(false),
    [inLab, setInLab] = useState(false);
  const [year, setYear] = useState(2019),
    [selected, setSelected] = useState<string | null>(null),
    [inspection, setInspection] = useState(0);
  const [sceneProgress, setSceneProgress] = useState(0);
  const staticIntro = reduced || failed;
  const route = useLocation();
  const navigate = useNavigate();
  const onSceneError = useCallback(() => setFailed(true), []);
  useEffect(() => {
    if (!inLab || staticIntro) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [inLab, staticIntro]);
  useEffect(() => {
    if (staticIntro) {
      onLabReady(true);
      return;
    }
    let frame = 0;
    const update = () => {
      frame = 0;
      const section = sectionRef.current,
        sticky = stickyRef.current;
      if (!section || !sticky) return;
      const rect = section.getBoundingClientRect(),
        range = Math.max(1, section.offsetHeight - sticky.offsetHeight);
      const p = docked.current ? 1 : clamp((56 - rect.top) / range);
      progress.current = p;
      setSceneProgress(p);
      const nextStage = stageAt(p);
      if (currentStage.current !== nextStage) {
        currentStage.current = nextStage;
        setInspection(0);
        setSelected(null);
      }
      setStage(nextStage);
      sticky.style.setProperty(
        "--intro-opacity",
        String(1 - smooth(0.975, 0.992, p)),
      );
      sticky.style.setProperty(
        "--person-opacity",
        String(smooth(0.245, 0.267, p) * (1 - smooth(0.298, 0.323, p))),
      );
      setActive(!document.hidden && p < 0.996 && rect.bottom > 56);
      onLabReady(p > 0.95);
      if (p >= 0.993) {
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
  // The lab is the final camera position inside a sticky story, not its DOM top.
  // Resolve this deep link after the lazy-loaded scene has mounted.
  useEffect(() => {
    if (route.hash !== "#laboratory") return;
    const frame = requestAnimationFrame(() => {
      if (staticIntro) {
        document.getElementById("laboratory")?.scrollIntoView();
        return;
      }
      const section = sectionRef.current,
        sticky = stickyRef.current;
      if (!section || !sticky) return;
      window.scrollTo({
        top:
          section.getBoundingClientRect().top +
          scrollY -
          56 +
          section.offsetHeight -
          sticky.offsetHeight,
        behavior: "instant",
      });
      window.dispatchEvent(new Event("scroll"));
    });
    return () => cancelAnimationFrame(frame);
  }, [route.hash, staticIntro]);
  const jump = (p: number) => {
    const node = sectionRef.current,
      sticky = stickyRef.current;
    if (!node || !sticky) return;
    if (docked.current) {
      docked.current = false;
      setInLab(false);
      document.body.style.overflow = "";
    }
    window.scrollTo({
      top:
        node.getBoundingClientRect().top +
        scrollY -
        56 +
        (node.offsetHeight - sticky.offsetHeight) * p,
      behavior: reduced ? "instant" : "smooth",
    });
  };
  const replay = () => {
    docked.current = false;
    setInLab(false);
    onLabReady(false);
    document.body.style.overflow = "";
    window.scrollTo({ top: 0, behavior: "instant" });
    window.dispatchEvent(new Event("scroll"));
    if (route.hash) navigate("/", { replace: true });
  };
  const campusPhoto =
    stage === 9 ? "library" : stage === 10 ? "research" : null;
  return (
    <section
      ref={sectionRef}
      className={
        "cosmic-journey continuous-journey" +
        (staticIntro ? " cosmic-journey--static" : "")
      }
      aria-label="From a changing world to the SYPHU-China laboratory"
      data-stage={NARRATIVE[stage].id}
    >
      <div
        ref={stickyRef}
        className={"cosmic-journey__sticky" + (inLab ? " is-in-lab" : "")}
      >
        <div className="cosmic-journey__art" aria-hidden={inLab} inert={inLab}>
          {!staticIntro && (
            <div className="cosmic-journey__space">
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
                  gl={{ alpha: true, antialias: true }}
                >
                  <JourneyScene
                    progress={progress}
                    year={year}
                    selected={selected}
                    onSelect={setSelected}
                    inspection={inspection}
                  />
                </Canvas>
              </SceneErrorBoundary>
            </div>
          )}
          <div className="cosmic-journey__paper" />
          {staticIntro ? (
            <div className="journey-static">
              <h1>Let life respond.</h1>
              <p>
                Explore our design for environment-dependent survival, Elafin
                production and a gradual exit.
              </p>
              <button
                onClick={() =>
                  document.getElementById("laboratory")?.scrollIntoView()
                }
              >
                Enter the laboratory ↗
              </button>
            </div>
          ) : (
            <>
              {stage > 0 && (
                <StoryCopy stage={stage}>
                  {stage === 1 && (
                    <GlobeCaption
                      year={year}
                      onYear={setYear}
                      selected={selected}
                      onSelect={setSelected}
                    />
                  )}
                  {stage >= 3 && stage <= 7 && (
                    <ScienceCaption step={sciencePhase(sceneProgress)} />
                  )}
                </StoryCopy>
              )}
              <OpeningSequence progress={sceneProgress} />
              {stage === 2 && <PersonScene />}
              {sceneProgress >= 0.295 && sceneProgress <= 0.797 && (
                <ScienceAnatomy
                  progress={sceneProgress}
                  inspection={inspection}
                />
              )}
              {(stage === 1 || (stage >= 3 && stage <= 6) || campusPhoto) && (
                <div className="journey-tap-position">
                  <TapControl
                    key={stage}
                    value={inspection}
                    mode={stage === 1 || campusPhoto ? "hold" : "tap"}
                    label={
                      stage === 1
                        ? "Focus"
                        : stage >= 3 && stage <= 6
                          ? "Look inside"
                          : "Real campus"
                    }
                    onChange={setInspection}
                  />
                </div>
              )}
              {campusPhoto && (
                <figure
                  className={
                    "journey-campus-photo" +
                    (inspection > 0.2 ? " is-expanded" : "")
                  }
                >
                  <img
                    src={
                      import.meta.env.BASE_URL +
                      "assets/school/" +
                      campusPhoto +
                      "-photo.png"
                    }
                    alt={
                      "Shenyang Pharmaceutical University South Campus " +
                      (campusPhoto === "library"
                        ? "library"
                        : "research building")
                    }
                  />
                  <figcaption>
                    South Campus ·{" "}
                    {campusPhoto === "library"
                      ? "Library"
                      : "Research building"}
                  </figcaption>
                </figure>
              )}
            </>
          )}
          <footer className="cosmic-journey__footer">
            <span>Scroll ↓</span>
            <nav aria-label="Story chapters">
              {[
                { p: 0, label: "Origins" },
                { p: 0.17, label: "World" },
                { p: 0.33, label: "Within" },
                { p: 0.54, label: "Design" },
                { p: 0.855, label: "Campus" },
              ].map((s) => (
                <button
                  key={s.label}
                  aria-current={
                    stage === 0
                      ? s.p === 0
                      : s.label ===
                        (stage === 1
                          ? "World"
                          : stage < 5
                            ? "Within"
                            : stage < 8
                              ? "Design"
                              : "Campus")
                  }
                  onClick={() => jump(s.p)}
                >
                  {s.label}
                </button>
              ))}
            </nav>
            <button onClick={() => jump(1)}>Skip to lab ↗</button>
          </footer>
        </div>
        {inLab && (
          <button
            className="journey-replay"
            onClick={replay}
            aria-label="Replay the story"
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
