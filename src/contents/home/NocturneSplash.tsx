import { useEffect, useState } from "react";
import { heroCopy } from "./homeCopy";
import { useReducedMotion } from "./hooks/useReducedMotion";
import { NocturneThreeCanvas } from "./opening/NocturneThreeCanvas";
import "./nocturneParticle.css";

/**
 * Nocturne-style opening (Xiaohongshu reference):
 * Lorenz attractor wings + Möbius strip + three.js particles + cursor pull.
 */
export function NocturneSplash() {
  const reducedMotion = useReducedMotion();
  const [ready, setReady] = useState(reducedMotion);
  const [loader, setLoader] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;
    let p = 0;
    const id = window.setInterval(() => {
      p = Math.min(100, p + 4 + Math.random() * 6);
      setLoader(p);
      if (p >= 100) {
        window.clearInterval(id);
        setReady(true);
      }
    }, 120);
    return () => window.clearInterval(id);
  }, [reducedMotion]);

  const enter = () => {
    document.getElementById("home-story")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <section
      className="nocturne-particle"
      aria-label="LBP-Mototype particle opening"
      onClick={ready ? enter : undefined}
      onKeyDown={(e) => {
        if (ready && (e.key === "Enter" || e.key === " ")) enter();
      }}
      role={ready ? "button" : undefined}
      tabIndex={ready ? 0 : -1}
    >
      <NocturneThreeCanvas />

      <div className="nocturne-particle__overlay" aria-hidden="true" />

      <header className="nocturne-particle__brand">
        <span className="nocturne-particle__logo-mark">◐</span>
        <span className="nocturne-particle__logo-text">{heroCopy.title}</span>
      </header>

      <p className="nocturne-particle__aside">… SOME PATHS RETURN.</p>

      <div className="nocturne-particle__footer">
        <p className="nocturne-particle__quote">
          洛伦兹吸引子 — 永远在动，却永远逃不出那个形
        </p>
        <p className="nocturne-particle__sub">{heroCopy.persistenceZh}</p>

        <div className="nocturne-particle__loader" aria-hidden="true">
          <svg viewBox="0 0 40 40" className="nocturne-particle__loader-svg">
            <circle
              className="nocturne-particle__loader-track"
              cx="20"
              cy="20"
              r="16"
            />
            <circle
              className="nocturne-particle__loader-arc"
              cx="20"
              cy="20"
              r="16"
              style={{
                strokeDashoffset: 100 - loader,
              }}
            />
          </svg>
        </div>

        {ready && (
          <button type="button" className="nocturne-particle__enter" onClick={enter}>
            Enter
          </button>
        )}
      </div>
    </section>
  );
}
