import { useEffect, useState } from "react";
import { HOME_ASSETS, LOGO_CROP_RATIO } from "./homeAssets";
import { heroCopy } from "./homeCopy";
import { useReducedMotion } from "./hooks/useReducedMotion";

type BootPhase = "booting" | "ready";

const BOOT_STEPS = [
  { delay: 0, progress: 8, label: "Initializing platform" },
  { delay: 420, progress: 38, label: "Loading living interface" },
  { delay: 880, progress: 68, label: "Calibrating balance model" },
  { delay: 1320, progress: 100, label: "Ready" },
] as const;

/** Nocturne Memory–inspired full-viewport opening splash. */
export function NocturneSplash() {
  const reducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<BootPhase>(reducedMotion ? "ready" : "booting");
  const [progress, setProgress] = useState(reducedMotion ? 100 : 0);
  const [stepLabel, setStepLabel] = useState(
    reducedMotion ? "Ready" : BOOT_STEPS[0].label,
  );

  useEffect(() => {
    if (reducedMotion) return;

    const timers: number[] = [];
    for (const step of BOOT_STEPS) {
      timers.push(
        window.setTimeout(() => {
          setProgress(step.progress);
          setStepLabel(step.label);
          if (step.progress >= 100) setPhase("ready");
        }, step.delay),
      );
    }
    return () => {
      for (const id of timers) window.clearTimeout(id);
    };
  }, [reducedMotion]);

  const scrollToContent = () => {
    const next = document.getElementById("home-story");
    next?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="nc-splash" aria-label="LBP-Mototype opening">
      <div className="nc-splash__bg" aria-hidden="true">
        <div className="nc-splash__glow nc-splash__glow--a" />
        <div className="nc-splash__glow nc-splash__glow--b" />
        <div className="nc-splash__grid" />
      </div>

      <div className="nc-splash__card">
        <header className="nc-splash__header">
          <div className="nc-splash__brand">
            <div className="nc-splash__logo-frame">
              <img
                src={HOME_ASSETS.projectLogo}
                alt=""
                className="nc-splash__logo"
                style={{ clipPath: `inset(0 0 ${(1 - LOGO_CROP_RATIO) * 100}% 0)` }}
                width={971}
                height={870}
                decoding="async"
              />
            </div>
            <div>
              <h1 className="nc-splash__title">{heroCopy.title}</h1>
              <p className="nc-splash__team">SYPHU-China · iGEM 2026</p>
            </div>
          </div>

          <span
            className={`nc-badge nc-badge--${phase === "ready" ? "ready" : "building"}`}
          >
            <span className="nc-badge__dot" aria-hidden="true" />
            {phase === "ready" ? "READY" : "BOOTING"}
          </span>
        </header>

        <div className="nc-splash__body">
          <p className="nc-splash__zh">{heroCopy.persistenceZh}</p>
          <p className="nc-splash__en">{heroCopy.persistence}</p>

          <div className="nc-splash__status">
            <span className="nc-splash__step">{stepLabel}</span>
            <span className="nc-splash__pct">{progress}%</span>
          </div>

          <div className="nc-progress" aria-hidden="true">
            <div
              className="nc-progress__bar"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="nc-splash__actions">
          <button
            type="button"
            className="nc-btn nc-btn--primary"
            onClick={scrollToContent}
            disabled={phase !== "ready" && !reducedMotion}
          >
            {phase === "ready" || reducedMotion ? "Enter project" : "Preparing…"}
          </button>
        </div>
      </div>

      <button
        type="button"
        className="nc-splash__scroll"
        onClick={scrollToContent}
        aria-label="Scroll to project story"
      >
        <span className="nc-splash__scroll-label">Scroll</span>
        <span className="nc-splash__scroll-chevron" aria-hidden="true">
          ↓
        </span>
      </button>
    </section>
  );
}
