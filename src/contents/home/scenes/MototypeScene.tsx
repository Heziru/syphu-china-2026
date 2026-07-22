import { Scene } from "../components/Scene";
import { sceneCopy } from "../homeCopy";
import { pulseOpacity } from "../hooks/useSceneProgress";

const STEPS = [
  { label: "ROS", start: 0.18, end: 0.34 },
  { label: "EcN", start: 0.3, end: 0.46 },
  { label: "SURVIVE", start: 0.42, end: 0.56 },
  { label: "RELEASE", start: 0.52, end: 0.66 },
  { label: "CLEAR", start: 0.62, end: 0.76 },
] as const;

export function MototypeScene() {
  const c = sceneCopy.mototype;

  return (
    <Scene tone="ink" travel={1.7} ariaLabel="The Mototype">
      {({ progress, pinned }) => {
        const showClosing = !pinned || progress >= 0.74;
        const closingOpacity = pinned
          ? progress < 0.74
            ? 0
            : Math.min(1, (progress - 0.74) / 0.1)
          : 1;

        const titleOpacity = pinned
          ? progress < 0.12
            ? progress / 0.12
            : progress > 0.7
              ? Math.max(0, 1 - (progress - 0.7) / 0.12)
              : 1
          : 1;

        const stage = pinned
          ? Math.min(4, Math.max(0, Math.floor((progress - 0.18) / 0.12)))
          : 2;

        return (
          <div className="moto-proto">
            <h2
              className="moto-scene-title moto-scene-title--on-ink"
              style={{ opacity: titleOpacity }}
            >
              {c.title}
            </h2>

            <div className="moto-proto__stage" aria-hidden="true">
              <svg className="moto-proto__svg" viewBox="0 0 560 320">
                <rect width="560" height="320" fill="#101816" />
                {/* ROS field */}
                <circle
                  cx="120"
                  cy="160"
                  r={40 + stage * 8}
                  fill="url(#rosGrad)"
                  opacity={0.25 + Math.min(stage, 2) * 0.15}
                />
                {/* EcN body */}
                <ellipse
                  cx="300"
                  cy="160"
                  rx="70"
                  ry="88"
                  fill="none"
                  stroke="#6bb89a"
                  strokeWidth="2"
                  opacity={stage >= 1 ? 0.95 : 0.35}
                />
                <ellipse
                  cx="300"
                  cy="160"
                  rx="48"
                  ry="62"
                  fill="#1d332e"
                  stroke="#2e8b57"
                  strokeWidth="1.4"
                  opacity={stage >= 1 ? 1 : 0.3}
                />
                {/* Survive pulse */}
                {stage >= 2 && (
                  <circle
                    cx="300"
                    cy="160"
                    r={28 + (stage === 2 ? 6 : 0)}
                    fill="none"
                    stroke="#7ecf4a"
                    strokeWidth="1.5"
                    opacity="0.7"
                  />
                )}
                {/* Release dots */}
                {stage >= 3 && (
                  <>
                    <circle cx="390" cy="130" r="5" fill="#c9e6d8" />
                    <circle cx="410" cy="160" r="4" fill="#c9e6d8" opacity="0.8" />
                    <circle cx="395" cy="190" r="3.5" fill="#c9e6d8" opacity="0.65" />
                  </>
                )}
                {/* Clear fade ring */}
                {stage >= 4 && (
                  <ellipse
                    cx="300"
                    cy="160"
                    rx="95"
                    ry="115"
                    fill="none"
                    stroke="#9bb5ad"
                    strokeWidth="1"
                    strokeDasharray="4 6"
                    opacity="0.45"
                  />
                )}
                <defs>
                  <radialGradient id="rosGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#c45c4a" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#c45c4a" stopOpacity="0" />
                  </radialGradient>
                </defs>
              </svg>

              <div className="moto-proto__labels">
                {STEPS.map((step) => {
                  const op = pinned
                    ? pulseOpacity(progress, step.start, step.end)
                    : step.label === "EcN" || step.label === "ROS"
                      ? 0.7
                      : 0;
                  if (op < 0.05) return null;
                  return (
                    <span
                      key={step.label}
                      className="moto-proto__label"
                      style={{ opacity: op }}
                    >
                      {step.label}
                    </span>
                  );
                })}
              </div>
            </div>

            {showClosing && (
              <p
                className="moto-proto__closing"
                style={{ opacity: closingOpacity }}
              >
                {c.closing}
              </p>
            )}
          </div>
        );
      }}
    </Scene>
  );
}
