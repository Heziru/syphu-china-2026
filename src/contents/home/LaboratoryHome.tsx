import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { useReducedMotion } from "./hooks/useReducedMotion";
import { isWebGLAvailable } from "./laboratory/labPalette";
import { CosmicJourney } from "./journey/ContinuousJourney";
import { Link } from "react-router-dom";
import { LiteratureLibrary } from "./ui/LiteratureLibrary";
import {
  readLabReviewState,
  type LabReviewAsset,
  type LabReviewView,
} from "./laboratory/labReview";
import { useLaboratoryStore } from "./store/laboratoryStore";
import { EquipmentInspector } from "./ui/EquipmentInspector";
import { ChapterDirectory } from "./ui/ChapterDirectory";
import { LaboratoryFallback } from "./ui/LaboratoryFallback";
import { LoadingOverlay } from "./ui/LoadingOverlay";
import { ObjectTooltip } from "./ui/ObjectTooltip";
import { SceneErrorBoundary } from "./ui/SceneErrorBoundary";
import "./styles/laboratory.css";

const LaboratoryCanvas = lazy(() => import("./laboratory/LaboratoryCanvas"));
const MicroscopeReviewHud = lazy(() =>
  import("./laboratory/microscope/MicroscopeReviewHud").then((mod) => ({
    default: mod.MicroscopeReviewHud,
  })),
);
const ComputerReviewHud = lazy(() =>
  import("./laboratory/computer/ComputerReviewHud").then((mod) => ({
    default: mod.ComputerReviewHud,
  })),
);
const BioreactorReviewHud = lazy(() =>
  import("./laboratory/bioreactor/BioreactorReviewHud").then((mod) => ({
    default: mod.BioreactorReviewHud,
  })),
);
const ResearcherReviewHud = lazy(() =>
  import("./laboratory/researcher/ResearcherReviewHud").then((mod) => ({
    default: mod.ResearcherReviewHud,
  })),
);
const GlasswareStationReviewHud = lazy(() =>
  import("./laboratory/glassware-station/GlasswareStationReviewHud").then(
    (mod) => ({
      default: mod.GlasswareStationReviewHud,
    }),
  ),
);
const AnalyticalBalanceReviewHud = lazy(() =>
  import("./laboratory/analytical-balance/AnalyticalBalanceReviewHud").then(
    (mod) => ({
      default: mod.AnalyticalBalanceReviewHud,
    }),
  ),
);
const LaminarHoodReviewHud = lazy(() =>
  import("./laboratory/laminar-hood/LaminarHoodReviewHud").then((mod) => ({
    default: mod.LaminarHoodReviewHud,
  })),
);
const LabChairReviewHud = lazy(() =>
  import("./laboratory/lab-chair/LabChairReviewHud").then((mod) => ({
    default: mod.LabChairReviewHud,
  })),
);

export function LaboratoryHome() {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const phase = useLaboratoryStore((s) => s.phase);
  const setPhase = useLaboratoryStore((s) => s.setPhase);
  const resetSession = useLaboratoryStore((s) => s.resetSession);
  const setLocked = useLaboratoryStore((s) => s.setLocked);
  const [paused, setPaused] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const storyRunning = false;
  const labRef = useRef<HTMLDivElement>(null);
  const [webgl] = useState(() => isWebGLAvailable());
  const [reviewState] = useState(() => readLabReviewState());
  const review = reviewState.active;
  const [labVisible, setLabVisible] = useState(review);
  const [journeyReady, setJourneyReady] = useState(review || reduced || !webgl);
  const labActive = labVisible && journeyReady;
  const reviewAsset = reviewState.asset as LabReviewAsset | null;
  const [reviewView, setReviewView] = useState<LabReviewView>(
    () => reviewState.view,
  );

  useEffect(() => {
    resetSession();
    document.body.classList.add("lab-home-active");
    return () => {
      document.body.classList.remove("lab-home-active");
      useLaboratoryStore.getState().setLocked(false);
    };
  }, [resetSession]);

  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    if (review) return;
    const node = labRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setLabVisible(entry.isIntersecting),
      { threshold: 0.08 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [review]);

  const goFallback = useCallback(() => {
    setPhase("fallback");
    setLocked(false);
  }, [setLocked, setPhase]);

  const onNavigate = useCallback(
    (path: string) => {
      setPhase("transitioning");
      setLocked(false);
      navigate(path);
    },
    [navigate, setLocked, setPhase],
  );

  const show3d = webgl && phase !== "fallback";

  const laboratory = (
    <div
      ref={labRef}
      id="laboratory"
      className={`lab-home${phase === "transitioning" ? " lab-home--leave" : ""}${
        review ? " lab-home--review" : ""
      }`}
    >
      {show3d ? (
        <SceneErrorBoundary onError={goFallback}>
          <Suspense fallback={<LoadingOverlay visible />}>
            <LaboratoryCanvas
              reduced={reduced}
              paused={paused || !labActive || galleryOpen}
              onNavigate={onNavigate}
              onContextLost={goFallback}
              review={review}
              reviewAsset={reviewAsset}
              reviewView={reviewView}
            />
          </Suspense>
        </SceneErrorBoundary>
      ) : (
        <LaboratoryFallback
          message={
            "The 3D laboratory is unavailable. All research pages remain accessible."
          }
        />
      )}

      <LoadingOverlay
        visible={labActive && show3d && !review && phase === "loading"}
      />

      {!labActive && !review ? null : review && reviewAsset === "microscope" ? (
        <Suspense fallback={null}>
          <MicroscopeReviewHud view={reviewView} onView={setReviewView} />
        </Suspense>
      ) : review && reviewAsset === "computer" ? (
        <Suspense fallback={null}>
          <ComputerReviewHud view={reviewView} onView={setReviewView} />
        </Suspense>
      ) : review && reviewAsset === "bioreactor" ? (
        <Suspense fallback={null}>
          <BioreactorReviewHud view={reviewView} onView={setReviewView} />
        </Suspense>
      ) : review && reviewAsset === "researcher" ? (
        <Suspense fallback={null}>
          <ResearcherReviewHud view={reviewView} onView={setReviewView} />
        </Suspense>
      ) : review && reviewAsset === "glassware-station" ? (
        <Suspense fallback={null}>
          <GlasswareStationReviewHud view={reviewView} onView={setReviewView} />
        </Suspense>
      ) : review && reviewAsset === "analytical-balance" ? (
        <Suspense fallback={null}>
          <AnalyticalBalanceReviewHud
            view={reviewView}
            onView={setReviewView}
          />
        </Suspense>
      ) : review && reviewAsset === "laminar-hood" ? (
        <Suspense fallback={null}>
          <LaminarHoodReviewHud view={reviewView} onView={setReviewView} />
        </Suspense>
      ) : review && reviewAsset === "lab-chair" ? (
        <Suspense fallback={null}>
          <LabChairReviewHud view={reviewView} onView={setReviewView} />
        </Suspense>
      ) : (
        <div
          className="lab-hud"
          data-focused={phase === "inspecting" || phase === "focusing"}
          data-busy={
            storyRunning || !["idle", "inspecting", "fallback"].includes(phase)
          }
        >
          <div className="lab-brand">
            <p className="lab-brand__mark">LBP-Mototype</p>
          </div>
          <ChapterDirectory />
          {show3d && !storyRunning && (
            <EquipmentInspector onNavigate={onNavigate} />
          )}
          <nav className="lab-evidence-links" aria-label="Research evidence">
            {[
              ["Design", "/description"],
              ["Experiments", "/experiments"],
              ["Model", "/model"],
              ["Results", "/results"],
              ["Safety", "/safety-and-security"],
            ].map(([label, path]) => (
              <Link key={label} to={path}>
                {label}
              </Link>
            ))}
          </nav>
          <ObjectTooltip />
        </div>
      )}
      <LiteratureLibrary
        visible={labActive && !review && phase === "idle"}
        onOpenChange={setGalleryOpen}
      />
    </div>
  );
  return (
    <main className="lab-experience">
      {review ? (
        laboratory
      ) : (
        <CosmicJourney reduced={reduced || !webgl} onLabReady={setJourneyReady}>
          {laboratory}
        </CosmicJourney>
      )}
    </main>
  );
}
