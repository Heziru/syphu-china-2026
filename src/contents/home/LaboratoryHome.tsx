import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useReducedMotion } from "./hooks/useReducedMotion";
import { isWebGLAvailable } from "./laboratory/labPalette";
import {
  readLabReviewState,
  type LabReviewAsset,
  type LabReviewView,
} from "./laboratory/labReview";
import { useLaboratoryStore } from "./store/laboratoryStore";
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

export function LaboratoryHome() {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const phase = useLaboratoryStore((s) => s.phase);
  const simpleMode = useLaboratoryStore((s) => s.simpleMode);
  const setSimpleMode = useLaboratoryStore((s) => s.setSimpleMode);
  const setPhase = useLaboratoryStore((s) => s.setPhase);
  const resetSession = useLaboratoryStore((s) => s.resetSession);
  const setLocked = useLaboratoryStore((s) => s.setLocked);
  const [paused, setPaused] = useState(false);
  const [webgl] = useState(() => isWebGLAvailable());
  const [reviewState] = useState(() => readLabReviewState());
  const review = reviewState.active;
  const reviewAsset = reviewState.asset as LabReviewAsset | null;
  const [reviewView, setReviewView] = useState<LabReviewView>(() => reviewState.view);

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

  const goFallback = useCallback(() => {
    setPhase("fallback");
    setLocked(false);
  }, [setLocked, setPhase]);

  const onNavigate = useCallback(
    (path: string) => {
      setPhase("transitioning");
      window.setTimeout(() => {
        navigate(path);
        setLocked(false);
      }, reduced ? 0 : 180);
    },
    [navigate, reduced, setLocked, setPhase],
  );

  const show3d = webgl && !simpleMode && phase !== "fallback";

  return (
    <div
      className={`lab-home${phase === "transitioning" ? " lab-home--leave" : ""}${
        review ? " lab-home--review" : ""
      }`}
    >
      {show3d ? (
        <SceneErrorBoundary onError={goFallback}>
          <Suspense fallback={<LoadingOverlay visible />}>
            <LaboratoryCanvas
              reduced={reduced}
              paused={paused}
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
            simpleMode
              ? "Simple mode is on. Choose a chapter to read."
              : "This browser cannot run the 3D laboratory. Choose a chapter to read."
          }
        />
      )}

      <LoadingOverlay visible={show3d && !review && phase === "loading"} />

      {review && reviewAsset === "microscope" ? (
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
      ) : (
        <div className="lab-hud">
          <div className="lab-brand">
            <p className="lab-brand__mark">LBP-Mototype</p>
            <p className="lab-brand__hint">Click a station in the lab, or use the chapter list.</p>
            <p className="lab-brand__asset">Microscope rebuilt as a procedural station model from the reference drawing.</p>
          </div>
          <ChapterDirectory />
          <ObjectTooltip />
          <button
            type="button"
            className="lab-simple"
            onClick={() => setSimpleMode(!simpleMode)}
          >
            {simpleMode ? "Show 3D lab" : "Simple mode"}
          </button>
        </div>
      )}
    </div>
  );
}
