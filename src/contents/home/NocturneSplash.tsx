import { heroCopy } from "./homeCopy";
import { useReducedMotion } from "./hooks/useReducedMotion";
import {
  NocturneThreeCanvas,
  useOpeningPhase,
} from "./opening/NocturneThreeCanvas";
import "./nocturneParticle.css";

/**
 * 时光碎片 → 银河汇聚 → 鼠标扰动 → 再散开 → 标题飞出
 */
export function NocturneSplash() {
  const reducedMotion = useReducedMotion();
  const { phase, setPhase } = useOpeningPhase();
  const showTitle = phase === "title" || reducedMotion;

  const enter = () => {
    document.getElementById("home-story")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <section
      className={`nocturne-particle${showTitle ? " nocturne-particle--ready" : ""}`}
      aria-label="LBP-Mototype opening"
      onClick={showTitle ? enter : undefined}
      onKeyDown={(e) => {
        if (showTitle && (e.key === "Enter" || e.key === " ")) enter();
      }}
      role={showTitle ? "button" : undefined}
      tabIndex={showTitle ? 0 : -1}
    >
      <NocturneThreeCanvas onPhase={setPhase} />
      <div className="nocturne-particle__overlay" aria-hidden="true" />

      {showTitle && (
        <div className="nocturne-particle__title" aria-live="polite">
          <h1 className="nocturne-particle__title-en">{heroCopy.title}</h1>
          <p className="nocturne-particle__title-zh">{heroCopy.persistenceZh}</p>
        </div>
      )}
    </section>
  );
}
