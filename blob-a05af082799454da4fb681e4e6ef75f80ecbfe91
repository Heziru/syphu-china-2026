import { Scene } from "../components/Scene";
import { sceneCopy } from "../homeCopy";
import { windowProgress } from "../hooks/useSceneProgress";

/** Storyboard VIII — yin–yang rebalances; recovery moment before explore links. */
export function RecoveryScene() {
  const c = sceneCopy.recovery;

  return (
    <Scene tone="paper" travel={1.35} ariaLabel="Recovery and balance restored">
      {({ progress, pinned }) => {
        const balance = pinned ? 1 - windowProgress(progress, 0.1, 0.75) * 0.85 : 0.15;
        const figureY = pinned ? -20 + windowProgress(progress, 0.35, 0.8) * 28 : 0;

        return (
          <div className="moto-recovery">
            <div className="moto-recovery__visual" aria-hidden="true">
              <svg viewBox="0 0 360 280" className="moto-recovery__svg">
                <circle cx="180" cy="120" r="88" fill="#f3efe6" stroke="#1a2421" strokeWidth="2" />
                <g
                  transform={`rotate(${balance * 180} 180 120)`}
                >
                  <path
                    d="M180 32 A88 88 0 0 1 180 208 A44 44 0 0 0 180 120 A44 44 0 0 1 180 32"
                    fill="#1a2421"
                  />
                </g>
                <circle cx="180" cy="76" r="9" fill="#f3efe6" />
                <circle cx="180" cy="164" r="9" fill="#1a2421" />
              </svg>
              <svg
                viewBox="0 0 120 160"
                className="moto-recovery__figure"
                style={{ transform: `translateY(${figureY}px)` }}
              >
                <circle cx="60" cy="28" r="16" fill="#2e8b57" />
                <line x1="60" y1="44" x2="60" y2="98" stroke="#2e8b57" strokeWidth="3" />
                <line x1="60" y1="58" x2="34" y2="78" stroke="#2e8b57" strokeWidth="3" />
                <line x1="60" y1="58" x2="86" y2="68" stroke="#2e8b57" strokeWidth="3" />
                <line x1="60" y1="98" x2="40" y2="138" stroke="#2e8b57" strokeWidth="3" />
                <line x1="60" y1="98" x2="80" y2="128" stroke="#2e8b57" strokeWidth="3" />
              </svg>
            </div>
            <div className="moto-recovery__copy">
              <p className="moto-scene-zh">{c.titleZh}</p>
              <h2 className="moto-scene-title">{c.title}</h2>
              <p className="moto-scene-sub">{c.body}</p>
              <p className="moto-scene-zh moto-scene-zh--secondary">{c.bodyZh}</p>
            </div>
          </div>
        );
      }}
    </Scene>
  );
}
