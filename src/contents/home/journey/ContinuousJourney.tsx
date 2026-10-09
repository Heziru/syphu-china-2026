import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Suspense,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
  type ReactNode,
  type CSSProperties,
} from "react";
import { Group } from "three";
import { useLocation, useNavigate } from "react-router-dom";
import { CampusPlanet } from "./CampusPlanet";
import { DataGlobe } from "./DataGlobe";
import { assetUrl } from "../../../utils/assetUrl";
import { ScienceAnatomy } from "../science/ScienceAnatomy";
import { PersonScene } from "./PersonScene";
import { HomeHeroLanding } from "./HomeHeroLanding";
import { GalaxyOpening } from "./GalaxyOpening";
import { TreatmentBridge } from "./TreatmentBridge";
import { ProductChapter, warmProduct } from "./ProductChapter";
import { DeliveryJourney } from "../science/DeliveryJourney";
import { campusDeparture } from "./orbitalSceneMotion";
import { SceneErrorBoundary } from "../ui/SceneErrorBoundary";
import {
  NARRATIVE,
  clamp,
  smooth,
  stageAt,
  journeyPosition,
  storyScrollPosition,
  WALL_AT,
  PRODUCT_AT,
  productScrollPosition,
  deliveryScrollPosition,
  STORY_SCROLL_HEIGHT,
  worldYearMix,
} from "./storyTimeline";
import { GlobeCaption, StoryCopy } from "./JourneyOverlay";
import { LabInvitation } from "./LabInvitation";
import { ResearchCollage } from "./ResearchCollage";
import { SectionDecor } from "../../../components/SectionDecor";
import "./cosmicJourney.css";
import "./continuousJourney.css";
import "./homeArtDirection.css";
type Progress = MutableRefObject<number>;
// The SVG reading progress must not reconcile the hidden WebGL scene every frame.
const JourneySpace = memo(function JourneySpace({
  running,
  onError,
  ...scene
}: Parameters<typeof JourneyScene>[0] & {
  running: boolean;
  onError: () => void;
}) {
  return (
    <SceneErrorBoundary onError={onError}>
      <Suspense fallback={null}>
        <Canvas
          orthographic
          flat
          frameloop={running ? "always" : "never"}
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, 20], zoom: 70, near: 0.1, far: 100 }}
          gl={{ alpha: true, antialias: true }}
        >
          <JourneyScene {...scene} />
        </Canvas>
      </Suspense>
    </SceneErrorBoundary>
  );
});
function JourneyScene({
  progress,
  year,
  inspection,
}: {
  progress: Progress;
  year: number;
  inspection: number;
}) {
  const viewport = useThree((s) => s.viewport),
    campus = useRef(0),
    campusHost = useRef<Group>(null);
  useFrame(() => {
    const p = progress.current;
    // Settle the research building before its reading interval, then hold the view.
    campus.current = p < 0.909
      ? clamp((p - 0.78) / 0.22)
      : p < 0.932
        ? (0.909 - 0.78) / 0.22 + (0.81 - (0.909 - 0.78) / 0.22) * smooth(0.909, 0.932, p)
        : p < 0.965
          ? 0.81
          : 0.81 + 0.19 * smooth(0.965, 1, p);
    if (campusHost.current) {
      campusHost.current.visible = p > 0.772;
      const depart = campusDeparture(p) * (1 - smooth(0.772, 0.795, p));
      const researchFraming = smooth(0.919, 0.932, p) * (1 - smooth(0.965, 0.987, p));
      // The research building sits beside the photo, on a low horizon.
      campusHost.current.position.set(
        depart * 12 + researchFraming * (viewport.aspect < 1 ? 0 : 0.43),
        depart * 3 - researchFraming * (viewport.aspect < 1 ? 1.65 : 1.5),
        0,
      );
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
      <DataGlobe
        progress={progress}
        year={year}
        selected={null}
        onSelect={() => {}}
        illustrationHandoff
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
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const docked = useRef(false);
  const [active, setActive] = useState(true);
  const [failed, setFailed] = useState(false);
  const [inLab, setInLab] = useState(false);
  const [position, setPosition] = useState(() => journeyPosition(0));
  const staticIntro = reduced || failed;
  const route = useLocation();
  const navigate = useNavigate();
  const onSceneError = useCallback(() => setFailed(true), []);
  const sceneProgress = position.progress;
  const stage = stageAt(sceneProgress);
  const sceneLocal = clamp(
    (sceneProgress - NARRATIVE[stage].at) /
      ((NARRATIVE[stage + 1]?.at ?? 1.015) - NARRATIVE[stage].at),
  );
  const sceneDrift = smooth(0.15, 0.8, sceneLocal);
  const inReading =
    position.bridge !== null ||
    position.delivery !== null ||
    position.product !== null;
  const inspection =
    sceneProgress >= 0.54 && sceneProgress < 0.776
      ? smooth(0.54, 0.6, sceneProgress)
      : 0;

  useEffect(() => {
    if (!staticIntro && sceneProgress > PRODUCT_AT - 0.13) warmProduct();
  }, [staticIntro, sceneProgress]);

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
      const rect = section.getBoundingClientRect();
      const range = Math.max(1, section.offsetHeight - sticky.offsetHeight);
      const next = journeyPosition(
        docked.current ? 1 : clamp((56 - rect.top) / range),
      );
      progress.current = next.progress;
      setPosition(next);
      sticky.style.setProperty(
        "--person-opacity",
        String(
          smooth(0.245, 0.259, next.progress) *
            (1 - smooth(0.308, 0.32, next.progress)),
        ),
      );
      setActive(
        !document.hidden &&
          !docked.current &&
          rect.bottom > 56 &&
          rect.top < innerHeight,
      );
      onLabReady(next.progress > 0.95);
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

  const enterLab = useCallback(() => {
    if (staticIntro) {
      document
        .getElementById("laboratory")
        ?.scrollIntoView({ behavior: "instant" });
      return;
    }
    const section = sectionRef.current,
      sticky = stickyRef.current;
    if (!section || !sticky) return;
    docked.current = true;
    setInLab(true);
    onLabReady(true);
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
  }, [staticIntro, onLabReady]);

  const exploreStory = useCallback(
    (target = 0.145) => {
      if (staticIntro) {
        document
          .getElementById(target > 0.4 ? "home-signal" : "home-story")
          ?.scrollIntoView({
            behavior: reduced ? "instant" : "smooth",
          });
        return;
      }
      const section = sectionRef.current;
      const sticky = stickyRef.current;
      if (!section || !sticky) return;
      const range = Math.max(1, section.offsetHeight - sticky.offsetHeight);
      window.scrollTo({
        top:
          section.getBoundingClientRect().top +
          scrollY -
          56 +
          storyScrollPosition(target) * range,
        behavior: "smooth",
      });
    },
    [staticIntro, reduced],
  );

  useEffect(() => {
    if (route.hash !== "#laboratory") return;
    const frame = requestAnimationFrame(enterLab);
    return () => cancelAnimationFrame(frame);
  }, [route.hash, enterLab]);

  const replay = () => {
    docked.current = false;
    setInLab(false);
    onLabReady(false);
    document.body.style.overflow = "";
    window.scrollTo({ top: 0, behavior: "instant" });
    window.dispatchEvent(new Event("scroll"));
    if (route.hash) navigate("/", { replace: true });
  };
  const campusPhoto = stage === 9 ? "library" : null;
  const campusLocal = campusPhoto
    ? clamp((sceneProgress - NARRATIVE[stage].at) / 0.064)
    : 0;
  const chapter =
    position.bridge !== null
      ? "why"
      : position.delivery !== null
        ? "delivery"
        : position.product !== null
          ? "product"
          : NARRATIVE[stage].id;
  const localSurface =
    !inReading && sceneProgress >= 0.467 && sceneProgress < 0.54;
  const decorVariant = stage === 1 ? "world" : stage === 2 ? "life" : stage < 5 ? "local" : stage < 8 ? "cell" : stage < 11 ? "research" : "lab";

  return (
    <section
      ref={sectionRef}
      className={
        "cosmic-journey continuous-journey" +
        (staticIntro ? " cosmic-journey--static" : "")
      }
      aria-label="From a changing world to the SYPHU-China laboratory"
      data-stage={chapter}
      data-opening="galaxy"
      style={{ "--story-scroll-height": `${STORY_SCROLL_HEIGHT}svh` } as CSSProperties}
    >
      <div
        ref={stickyRef}
        className={
          "cosmic-journey__sticky" + (inLab && !staticIntro ? " is-in-lab" : "")
        }
      >
        <div
          className="cosmic-journey__art"
          style={
            {
              "--scene-shift": `${sceneDrift * 12}px`,
              "--scene-scale": 0.96 + sceneDrift * 0.04,
            } as CSSProperties
          }
          aria-hidden={inLab && !staticIntro}
          inert={inLab && !staticIntro}
        >
          {!staticIntro && (
            <>
              {sceneProgress >= 0.062 && (
                <h1 className="story-sr-only">
                  LBP–MOTOTYPE: a living response to a changing environment
                </h1>
              )}
              {(stage === 1 || stage === 2 || stage === 8 || stage === 9) && !inReading && (
                <StoryCopy stage={stage} progress={sceneProgress} backLayer />
              )}
              <div
                className="cosmic-journey__space"
                style={{ clipPath: sceneProgress < 0.174
                  ? `inset(0 ${(1 - smooth(0.153, 0.174, sceneProgress)) * 100}% 0 0)`
                  : undefined }}
              >
                <JourneySpace
                  running={active && !inReading}
                  onError={onSceneError}
                  progress={progress}
                  year={1990 + worldYearMix(sceneProgress) * 29}
                  inspection={0}
                />
              </div>
            </>
          )}
          {!staticIntro && !inReading && !localSurface && (stage === 2 || stage >= 8) && (
            <SectionDecor variant={decorVariant} />
          )}
          {staticIntro ? (
            <div className="journey-reading">
              <GalaxyOpening staticView />
              <GalaxyOpening staticView worldView />
              <section id="home-story" className="journey-reading-context">
                <SectionDecor variant="life" subdued />
                <p>Inflammatory bowel disease reaches across borders.</p>
                <GlobeCaption />
                <h2>A day, interrupted.</h2>
                <p>
                  A meal. A journey. A night’s sleep. IBD can change the
                  ordinary.
                </p>
                <picture className="journey-static-mascot">
                  <source
                    srcSet={assetUrl(
                      "assets/story/within/why-human-digestive-mascot.webp",
                    )}
                    type="image/webp"
                  />
                  <img
                    src={assetUrl(
                      "assets/story/within/why-human-digestive-mascot.png",
                    )}
                    alt="A person with the digestive system illustrated inside"
                    loading="lazy"
                  />
                </picture>
                <div
                  className="journey-static-life"
                  aria-label="Scenes of meals, travel, and rest"
                >
                  {[
                    ["04_life-meal.png", "A person eating a meal"],
                    ["05_life-transit.png", "A person travelling"],
                    ["06_life-rest.png", "A person resting"],
                  ].map(([file, alt]) => (
                    <img
                      key={file}
                      src={assetUrl(`assets/story/modular/${file}`)}
                      alt={alt}
                      loading="lazy"
                    />
                  ))}
                </div>
              </section>
              <TreatmentBridge progress={0} staticView reduced />
              <DeliveryJourney progress={0} reduced />
              <section
                id="home-colon"
                className="journey-static-mechanism"
                aria-label="Colon cutaway"
              >
                <ScienceAnatomy progress={0.449} staticView />
              </section>
              <HomeHeroLanding onExplore={() => exploreStory(0.575)} />
              {[0.588, 0.669, 0.75].map((p) => (
                <section
                  className="journey-static-mechanism"
                  key={p}
                  id={p === 0.588 ? "home-signal" : undefined}
                  aria-label={NARRATIVE[stageAt(p)].title}
                >
                  <ScienceAnatomy progress={p} staticView />
                </section>
              ))}
              <div className="journey-static-product">
                <ProductChapter progress={0.65} reduced />
              </div>
              <section className="journey-reading-context journey-reading-campus">
                <SectionDecor variant="research" subdued />
                <h2>Questions find a home.</h2>
                <p>Shenyang Pharmaceutical University · South Campus</p>
                <img
                  src={assetUrl("assets/school/library-photo.png")}
                  alt="South Campus library"
                  loading="lazy"
                />
              </section>
              <ResearchCollage progress={0.95} staticMode />
            </div>
          ) : (
            <>
              {(stage === 1 || stage === 2 || stage === 8 || stage === 9) && !inReading && (
                <StoryCopy stage={stage} progress={sceneProgress} />
              )}
              {stage === 11 && !inReading && (
                <LabInvitation progress={sceneProgress} onEnter={enterLab} />
              )}
              {sceneProgress < 0.259 && (
                <GalaxyOpening progress={sceneProgress} />
              )}
              {localSurface && (
                <HomeHeroLanding
                  progress={sceneProgress}
                  onExplore={() => exploreStory(0.575)}
                  onNavigate={exploreStory}
                />
              )}
              {position.bridge !== null && (
                <TreatmentBridge progress={position.bridge} />
              )}
              {position.delivery !== null && (
                <DeliveryJourney progress={position.delivery} onProgress={(p) => {
                  const section = sectionRef.current, sticky = stickyRef.current;
                  if (!section || !sticky) return;
                  window.scrollTo({ top: section.getBoundingClientRect().top + scrollY - 56 +
                    deliveryScrollPosition(p) * (section.offsetHeight - sticky.offsetHeight),
                    behavior: "smooth" });
                }} />
              )}
              {position.product !== null && (
                <ProductChapter progress={position.product} onStageChange={(p) => {
                  const section = sectionRef.current, sticky = stickyRef.current;
                  if (!section || !sticky) return;
                  window.scrollTo({ top: section.getBoundingClientRect().top + scrollY - 56 +
                    productScrollPosition(p) * (section.offsetHeight - sticky.offsetHeight),
                    behavior: "smooth" });
                }} />
              )}
              {stage === 2 && !inReading && (
                <PersonScene progress={sceneProgress} />
              )}
              {((!inReading &&
                !localSurface &&
                sceneProgress >= WALL_AT &&
                sceneProgress < PRODUCT_AT) ||
                (position.delivery !== null && position.delivery > 0.9)) && (
                <div
                  className="journey-science-stage"
                  style={{
                    opacity:
                      position.delivery !== null
                        ? smooth(0.9, 1, position.delivery)
                        : 1,
                  }}
                >
                  <ScienceAnatomy
                    progress={
                      position.delivery !== null ? WALL_AT : sceneProgress
                    }
                    inspection={inspection}
                    onNavigate={exploreStory}
                  />
                </div>
              )}
              {campusPhoto && !inReading && (
                <figure
                  className="journey-campus-photo"
                  style={{
                    opacity:
                      smooth(0.15, 0.35, campusLocal) *
                      (1 - smooth(0.9, 1, campusLocal)),
                    transform: `translateY(${(1 - smooth(0.1, 0.4, campusLocal)) * 30}px) rotate(${-2 + smooth(0.1, 0.5, campusLocal) * 2}deg)`,
                  }}
                >
                  <img
                    src={assetUrl(`assets/school/${campusPhoto}-photo.png`)}
                    alt={
                      "Shenyang Pharmaceutical University South Campus " +
                      (campusPhoto === "library"
                        ? "library"
                        : "research building")
                    }
                  />
                </figure>
              )}
              {stage === 10 && !inReading && (
                <ResearchCollage progress={sceneProgress} />
              )}
            </>
          )}
        </div>
        {inLab && !staticIntro && (
          <button className="journey-replay" onClick={replay}>
            ← Back to the story
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
