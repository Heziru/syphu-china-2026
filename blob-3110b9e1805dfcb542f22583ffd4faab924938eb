import { useEffect, useState } from "react";
import { heroCopy } from "./homeCopy";
import { useReducedMotion } from "./hooks/useReducedMotion";
import { ChaosOpeningCanvas } from "./opening/ChaosOpeningCanvas";

/** Mathematical chaos opening — Lorenz wings, Möbius ring, particle field. */
export function NocturneSplash() {
  const reducedMotion = useReducedMotion();
  const [revealed, setRevealed] = useState(reducedMotion);

  useEffect(() => {
    if (reducedMotion) return;
    const id = window.setTimeout(() => setRevealed(true), 900);
    return () => window.clearTimeout(id);
  }, [reducedMotion]);

  const scrollToContent = () => {
    document.getElementById("home-story")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <section className="chaos-splash" aria-label="LBP-Mototype opening">
      <ChaosOpeningCanvas className="chaos-splash__canvas" />

      <div className="chaos-splash__vignette" aria-hidden="true" />

      <div className={`chaos-splash__hud${revealed ? " is-visible" : ""}`}>
        <p className="chaos-splash__kicker">SYPHU-China · iGEM 2026</p>
        <h1 className="chaos-splash__title">{heroCopy.title}</h1>
        <p className="chaos-splash__zh">{heroCopy.persistenceZh}</p>
        <p className="chaos-splash__tag">
          Lorenz dynamics · Möbius topology · living equilibrium
        </p>

        <button
          type="button"
          className="chaos-splash__enter"
          onClick={scrollToContent}
        >
          Enter the system
        </button>
      </div>

      <button
        type="button"
        className="chaos-splash__scroll"
        onClick={scrollToContent}
        aria-label="Scroll to project story"
      >
        <span className="chaos-splash__scroll-line" aria-hidden="true" />
      </button>
    </section>
  );
}
