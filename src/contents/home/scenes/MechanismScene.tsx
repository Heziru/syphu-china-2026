import { Scene } from "../components/Scene";
import { sceneCopy } from "../homeCopy";
import { pulseOpacity, windowProgress } from "../hooks/useSceneProgress";

const STEP_WINDOWS = [
  { start: 0.14, end: 0.3 },
  { start: 0.28, end: 0.44 },
  { start: 0.42, end: 0.58 },
  { start: 0.56, end: 0.72 },
] as const;

/** Storyboard VI–VII — pspA knockout + four-step EcN mechanism (brightening). */
export function MechanismScene() {
  const c = sceneCopy.mechanism;

  return (
    <Scene tone="deep" travel={1.75} ariaLabel="Mechanism of LBP-Mototype">
      {({ progress, pinned }) => {
        let activeStep = -1;
        if (pinned) {
          for (let i = 0; i < STEP_WINDOWS.length; i++) {
            const w = STEP_WINDOWS[i]!;
            if (progress >= w.start && progress < w.end) activeStep = i;
          }
          if (progress >= 0.72) activeStep = 3;
        } else {
          activeStep = 2;
        }

        const showGene = !pinned || progress >= 0.06;
        const geneOpacity = pinned
          ? Math.min(1, windowProgress(progress, 0.06, 0.18))
          : 1;

        return (
          <div className="moto-mech">
            {showGene && (
              <div className="moto-mech__gene" style={{ opacity: geneOpacity }}>
                <svg viewBox="0 0 420 120" className="moto-mech__gene-svg" aria-hidden="true">
                  <path
                    d="M40 60 C80 20, 120 100, 160 60 S240 20, 280 60 S360 100, 380 60"
                    fill="none"
                    stroke="#2e8b57"
                    strokeWidth="3"
                  />
                  <rect x="188" y="44" width="44" height="32" rx="6" fill="#c45c4a" opacity="0.85" />
                  <text x="210" y="64" textAnchor="middle" fill="#fff" fontSize="11">
                    pspA
                  </text>
                  <text x="320" y="64" fill="#a85a42" fontSize="12">
                    KO →
                  </text>
                </svg>
                <div>
                  <p className="moto-scene-zh">{c.geneTitleZh}</p>
                  <h3 className="moto-mech__gene-title">{c.geneTitle}</h3>
                  <p className="moto-scene-sub">{c.geneBody}</p>
                </div>
              </div>
            )}

            <div className="moto-mech__stage" aria-hidden="true">
              <svg viewBox="0 0 560 300" className="moto-mech__svg">
                <rect width="560" height="300" fill="#141b2d" />
                <ellipse cx="280" cy="150" rx="120" ry="70" fill="#e8f0ea" stroke="#2e8b57" strokeWidth="1.5" />
                <circle cx="340" cy="150" r="28" fill="#c45c4a" opacity={activeStep >= 0 ? 0.35 : 0.1} />
                <ellipse
                  cx={activeStep >= 0 ? 240 + activeStep * 22 : 200}
                  cy="150"
                  rx="22"
                  ry="32"
                  fill="#1d332e"
                  stroke="#7ecf4a"
                  strokeWidth="1.5"
                />
                {activeStep >= 1 && (
                  <>
                    <circle cx="320" cy="120" r="4" fill="#c45c4a" />
                    <circle cx="335" cy="140" r="3" fill="#c45c4a" />
                    <circle cx="325" cy="165" r="3.5" fill="#c45c4a" />
                  </>
                )}
                {activeStep >= 2 && (
                  <>
                    <circle cx="380" cy="130" r="5" fill="#2e8b57" />
                    <circle cx="395" cy="155" r="4" fill="#2e8b57" />
                  </>
                )}
                {activeStep >= 3 && (
                  <ellipse
                    cx="240"
                    cy="150"
                    rx="40"
                    ry="55"
                    fill="none"
                    stroke="#9bb5ad"
                    strokeDasharray="4 5"
                    opacity="0.7"
                  />
                )}
              </svg>
            </div>

            <div className="moto-mech__copy">
              <p className="moto-scene-zh">{c.titleZh}</p>
              <h2 className="moto-scene-title">{c.title}</h2>
              <ol className="moto-mech__steps">
                {c.steps.map((step, i) => {
                  const w = STEP_WINDOWS[i] ?? STEP_WINDOWS[0]!;
                  const op = pinned
                    ? i === activeStep
                      ? pulseOpacity(progress, w.start, w.end)
                      : i < activeStep
                        ? 0.45
                        : 0.12
                    : i <= activeStep
                      ? 1
                      : 0.35;
                  return (
                    <li key={step.label} style={{ opacity: op }}>
                      <span className="moto-mech__step-label">
                        {step.label}
                        <span className="moto-mech__step-zh">{step.labelZh}</span>
                      </span>
                      <p>{step.text}</p>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        );
      }}
    </Scene>
  );
}
