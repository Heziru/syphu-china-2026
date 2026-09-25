import { useCallback, useEffect, useRef, useState } from "react";
import { FistGestureControls } from "./FistGestureControls";
import { heroGestureHints } from "./gesture/gestureConfig";
import { heroCopy } from "./homeCopy";
import { useFistGesture } from "./hooks/useFistGesture";
import { useReducedMotion } from "./hooks/useReducedMotion";
import { LogoAssembly } from "./logoAssembly/LogoAssembly";
import { PersistenceQuote } from "./logoAssembly/PersistenceQuote";
import type { AssemblyPhase } from "./logoAssembly/shardTypes";

function isAssemblyCompletePhase(phase: AssemblyPhase) {
  return (
    phase === "assembled" ||
    phase === "logoReveal" ||
    phase === "quoteTyping" ||
    phase === "quoteHold" ||
    phase === "quoteFade" ||
    phase === "completed"
  );
}

function pageHint(
  fistPhase: string,
  assemblyPhase: AssemblyPhase,
  fistStable: boolean,
  cameraFailed: boolean,
): string | null {
  if (isAssemblyCompletePhase(assemblyPhase)) {
    return null;
  }
  if (cameraFailed || assemblyPhase === "scatteredError") {
    return heroGestureHints.error;
  }
  if (fistPhase === "requesting-permission") return heroGestureHints.requesting;
  if (fistPhase === "loading-model") return heroGestureHints.loading;
  if (fistPhase === "needs-tap") return heroGestureHints.loading;
  if (fistStable || assemblyPhase === "assembling") {
    return heroGestureHints.assembling;
  }
  if (fistPhase === "candidate") return heroGestureHints.candidate;
  if (
    fistPhase === "ready" ||
    fistPhase === "no-hand" ||
    fistPhase === "hand-detected" ||
    fistPhase === "active"
  ) {
    return heroGestureHints.ready;
  }
  if (fistPhase === "denied") return heroGestureHints.denied;
  if (fistPhase === "error") return heroGestureHints.error;
  return heroGestureHints.requesting;
}

export function HeroSection() {
  const reducedMotion = useReducedMotion();
  const fist = useFistGesture();
  const cameraStoppedRef = useRef(false);

  const cameraFailed =
    fist.phase === "denied" ||
    fist.phase === "error" ||
    (Boolean(fist.errorKind) && fist.permissionWaitLevel !== "timed-out");

  const [phase, setPhase] = useState<AssemblyPhase>(
    reducedMotion ? "quoteTyping" : "scattered",
  );
  const [assemblyProgress, setAssemblyProgress] = useState(0);

  const assemblyComplete = isAssemblyCompletePhase(phase);

  /** Only pause shards for camera failure BEFORE a real fist-driven completion. */
  const cameraError = !reducedMotion && cameraFailed && !assemblyComplete;

  const quoteActive =
    phase === "quoteTyping" ||
    phase === "quoteHold" ||
    phase === "quoteFade";

  const interactionActive = fist.fistStable && !cameraError;

  const onQuoteFinished = useCallback(() => {
    setPhase("completed");
  }, []);

  const onPhaseChange = useCallback(
    (next: AssemblyPhase) => {
      setPhase(next);
      // Camera teardown only after a real assembly reach — never on error paths.
      if (
        !cameraStoppedRef.current &&
        (next === "logoReveal" || next === "quoteTyping")
      ) {
        cameraStoppedRef.current = true;
        fist.completeAndStop();
      }
      if (next === "assembled" || next === "logoReveal") {
        setAssemblyProgress(1);
      }
      if (next === "scatteredError" || next === "scattered") {
        // Keep progress in sync when returning / error-pausing
      }
    },
    [fist],
  );

  /**
   * Auto-request camera on mount.
   * StrictMode: cleanup invalidates the first enable(); this effect runs again
   * and MUST call enable() again — no permanent session lock.
   */
  useEffect(() => {
    if (reducedMotion) return;
    void fist.enable();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount / remount auto-start only
  }, [reducedMotion]);

  const hint = pageHint(
    fist.phase,
    phase,
    interactionActive,
    cameraError,
  );

  const hideDock =
    phase === "completed" ||
    phase === "quoteFade" ||
    phase === "quoteHold" ||
    reducedMotion;

  return (
    <section
      className={`home-hero${phase === "completed" ? " home-hero--done" : ""}${interactionActive ? " home-hero--assembling" : ""}`}
      aria-label="LBP-Mototype interactive logo"
    >
      <LogoAssembly
        fistStable={interactionActive}
        reducedMotion={reducedMotion}
        cameraError={cameraError}
        onPhaseChange={onPhaseChange}
        onProgress={setAssemblyProgress}
      />

      <div className="home-hero__chrome">
        <h1 className="mototype-hero-title">{heroCopy.title}</h1>
        {hint && (
          <p className="home-hero__hint" aria-live="polite">
            {hint}
          </p>
        )}
      </div>

      <FistGestureControls
        fist={fist}
        assemblyProgress={cameraError ? 0 : assemblyProgress}
        onRetry={() => {
          cameraStoppedRef.current = false;
          setAssemblyProgress(0);
          void fist.enable();
        }}
        onCheckPermission={() => {
          void fist.checkPermission();
        }}
        onDisable={() => {
          if (assemblyComplete) {
            fist.completeAndStop();
            cameraStoppedRef.current = true;
            return;
          }
          fist.disable();
          cameraStoppedRef.current = true;
          setAssemblyProgress(0);
        }}
        onTapToStart={() => {
          void fist.resumePlayback();
        }}
        reducedMotion={reducedMotion}
        hidden={hideDock}
      />

      {/* Quote only from real logoReveal → quoteTyping — never from camera error. */}
      <PersistenceQuote
        active={quoteActive && !cameraError}
        reducedMotion={reducedMotion}
        onFinished={onQuoteFinished}
      />
    </section>
  );
}
