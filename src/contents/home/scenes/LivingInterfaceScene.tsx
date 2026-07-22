import { Scene } from "../components/Scene";
import { sceneCopy } from "../homeCopy";
import { pulseOpacity } from "../hooks/useSceneProgress";

export function LivingInterfaceScene() {
  const c = sceneCopy.living;

  return (
    <Scene tone="paper" travel={1.6} ariaLabel="A Living Interface">
      {({ progress, pinned }) => {
        const verbs = c.verbs;
        let active = -1;
        if (pinned) {
          if (progress >= 0.2 && progress < 0.35) active = 0;
          else if (progress >= 0.35 && progress < 0.48) active = 1;
          else if (progress >= 0.48 && progress < 0.6) active = 2;
          else if (progress >= 0.6 && progress < 0.72) active = 3;
        }

        const verbOpacity =
          active === 0
            ? pulseOpacity(progress, 0.2, 0.35)
            : active === 1
              ? pulseOpacity(progress, 0.35, 0.48)
              : active === 2
                ? pulseOpacity(progress, 0.48, 0.6)
                : active === 3
                  ? pulseOpacity(progress, 0.6, 0.72)
                  : 0;

        const showFinale = !pinned || progress >= 0.72;
        const finaleOpacity = pinned
          ? progress < 0.72
            ? 0
            : Math.min(1, (progress - 0.72) / 0.12)
          : 1;

        const phase = Math.max(0, active);

        return (
          <div className="moto-living">
            <div className="moto-living__cell" aria-hidden="true">
              <svg className="moto-living__svg" viewBox="0 0 320 320">
                <ellipse
                  cx="160"
                  cy="160"
                  rx="100"
                  ry="120"
                  fill="none"
                  stroke="#1f3a34"
                  strokeWidth="2"
                />
                <ellipse
                  cx="160"
                  cy="160"
                  rx="72"
                  ry="90"
                  fill="#e8f0ea"
                  stroke="#2e8b57"
                  strokeWidth="1.5"
                  opacity={0.55 + phase * 0.1}
                />
                <circle
                  cx="140"
                  cy="140"
                  r={10 + phase * 2}
                  fill="#2e8b57"
                  opacity="0.7"
                />
                <circle
                  cx="180"
                  cy="170"
                  r={7 + (phase > 1 ? 3 : 0)}
                  fill="#1a8f8a"
                  opacity="0.75"
                />
                {phase >= 2 && (
                  <path
                    d="M210 120 C235 140, 240 180, 220 210"
                    fill="none"
                    stroke="#7ecf4a"
                    strokeWidth="1.6"
                  />
                )}
                {phase >= 3 && (
                  <>
                    <circle cx="228" cy="205" r="4" fill="#a85a42" />
                    <circle cx="245" cy="190" r="3" fill="#a85a42" opacity="0.7" />
                  </>
                )}
              </svg>
            </div>

            <div className="moto-living__copy">
              {active >= 0 && (
                <p
                  className="moto-living__verb"
                  style={{ opacity: verbOpacity }}
                >
                  {verbs[active]}
                </p>
              )}
              {showFinale && (
                <div style={{ opacity: finaleOpacity }}>
                  <h2 className="moto-scene-title">{c.title}</h2>
                  <p className="moto-scene-sub">{c.subtitle}</p>
                </div>
              )}
            </div>
          </div>
        );
      }}
    </Scene>
  );
}
