import { Scene } from "../components/Scene";
import { sceneCopy } from "../homeCopy";
import { pulseOpacity, windowProgress } from "../hooks/useSceneProgress";

/** Storyboard III–IV — disease timeline + failed conventional therapies (darkening). */
export function DiseaseScene() {
  const c = sceneCopy.disease;

  return (
    <Scene tone="void" travel={1.65} ariaLabel="Disease and failed treatments">
      {({ progress, pinned }) => {
        const tilt = pinned ? 8 + progress * 18 : 14;
        const showFailed = !pinned || progress >= 0.42;
        const failedOpacity = pinned
          ? progress < 0.42
            ? 0
            : Math.min(1, (progress - 0.42) / 0.12)
          : 1;
        const activeStep = pinned
          ? Math.min(2, Math.floor(windowProgress(progress, 0.12, 0.55) * 3))
          : 1;

        return (
          <div className="moto-disease">
            <div className="moto-disease__visual" aria-hidden="true">
              <svg className="moto-disease__figure" viewBox="0 0 480 360">
                <rect width="480" height="360" fill="#101816" />
                <g transform={`rotate(${tilt} 240 170)`}>
                  <line x1="240" y1="60" x2="240" y2="190" stroke="#6bb89a" strokeWidth="2.5" />
                  <line x1="130" y1="190" x2="350" y2="190" stroke="#6bb89a" strokeWidth="2.5" />
                  <ellipse cx="130" cy="118" rx="42" ry="12" fill="#2e8b57" opacity="0.35" />
                  <ellipse cx="350" cy="148" rx="52" ry="14" fill="#c45c4a" opacity={0.45 + progress * 0.4} />
                </g>
                <circle cx="300" cy="240" r="36" fill="#c45c4a" opacity={0.15 + progress * 0.35} />
                <text x="300" y="246" textAnchor="middle" fill="#f3cfc7" fontSize="11" fontFamily="sans-serif">
                  lesion
                </text>
              </svg>

              <ol className="moto-disease__timeline">
                {c.timeline.map((item, i) => (
                  <li
                    key={item.year}
                    className={`moto-disease__step${i === activeStep ? " is-active" : ""}`}
                    style={{
                      opacity: pinned
                        ? pulseOpacity(progress, 0.1 + i * 0.12, 0.22 + i * 0.12)
                        : i <= activeStep
                          ? 1
                          : 0.35,
                    }}
                  >
                    <span className="moto-disease__year">{item.year}</span>
                    <span className="moto-disease__note">{item.note}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="moto-disease__copy">
              <p className="moto-scene-zh moto-scene-zh--on-ink">{c.titleZh}</p>
              <h2 className="moto-scene-title moto-scene-title--on-ink">{c.title}</h2>
              <p className="moto-scene-sub">{c.subtitle}</p>
              <p className="moto-scene-zh moto-scene-zh--on-ink moto-scene-zh--secondary">
                {c.subtitleZh}
              </p>

              {showFailed && (
                <div className="moto-disease__failed" style={{ opacity: failedOpacity }}>
                  <p className="moto-disease__failed-zh">{c.failedTitleZh}</p>
                  <h3 className="moto-disease__failed-title">{c.failedTitle}</h3>
                  <p className="moto-disease__failed-body">{c.failedBody}</p>
                  <ul className="moto-disease__treatments" aria-label="Failed approaches">
                    {c.treatments.map((t) => (
                      <li key={t}>
                        <span>{t}</span>
                        <span className="moto-disease__x" aria-hidden="true">
                          ×
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        );
      }}
    </Scene>
  );
}
