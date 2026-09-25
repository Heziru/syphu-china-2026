import { Scene } from "../components/Scene";
import { sceneCopy } from "../homeCopy";
import { pulseOpacity } from "../hooks/useSceneProgress";

export function ChallengeScene() {
  const c = sceneCopy.challenge;

  return (
    <Scene tone="cream" travel={1.5} ariaLabel="The Challenge">
      {({ progress, pinned }) => {
        const wordIndex = pinned
          ? progress < 0.35
            ? 0
            : progress < 0.52
              ? 1
              : progress < 0.7
                ? 2
                : null
          : null;

        const word =
          wordIndex !== null
            ? c.words[wordIndex]
            : pinned
              ? null
              : c.words[0];
        const wordOpacity = pinned
          ? wordIndex === 0
            ? pulseOpacity(progress, 0.22, 0.36)
            : wordIndex === 1
              ? pulseOpacity(progress, 0.36, 0.52)
              : wordIndex === 2
                ? pulseOpacity(progress, 0.52, 0.7)
                : 0
          : 0.55;

        const figX = pinned ? (0.5 - progress) * 80 : 0;
        const textX = pinned ? (progress - 0.5) * 80 : 0;

        return (
          <div className="moto-challenge">
            <div
              className="moto-challenge__figure"
              style={{ transform: `translate3d(${figX}px, 0, 0)` }}
              aria-hidden="true"
            >
              <svg
                className="moto-challenge__svg"
                viewBox="0 0 480 360"
                role="presentation"
              >
                <rect width="480" height="360" fill="#f3efe6" />
                <path
                  d="M30 88 C90 50, 150 120, 210 80 S330 50, 390 95 S450 140, 460 120"
                  fill="none"
                  stroke="#1f3a34"
                  strokeWidth="2.4"
                />
                <path
                  d="M30 140 C100 110, 160 175, 240 140 S360 110, 430 160"
                  fill="none"
                  stroke="#2e8b57"
                  strokeWidth="1.6"
                  opacity="0.65"
                />
                <path
                  d="M40 220 C110 180, 180 250, 260 210 S380 180, 450 230"
                  fill="none"
                  stroke="#a85a42"
                  strokeWidth="1.5"
                  strokeDasharray="6 7"
                  opacity={0.35 + progress * 0.55}
                />
                <circle cx="110" cy="175" r="8" fill="#c45c4a" opacity={0.3 + progress * 0.5} />
                <circle cx="200" cy="160" r="6" fill="#c45c4a" opacity={0.25 + progress * 0.45} />
                <circle cx="300" cy="185" r="7" fill="#c45c4a" opacity={0.2 + progress * 0.5} />
                <circle cx="370" cy="168" r="5" fill="#c45c4a" opacity={0.15 + progress * 0.45} />
              </svg>
            </div>

            <div
              className="moto-challenge__copy"
              style={{ transform: `translate3d(${textX}px, 0, 0)` }}
            >
              <h2 className="moto-scene-title">{c.title}</h2>
              <p className="moto-scene-sub">{c.subtitle}</p>
              {word && (
                <p
                  className="moto-challenge__word"
                  style={{ opacity: wordOpacity }}
                >
                  {word}
                </p>
              )}
            </div>
          </div>
        );
      }}
    </Scene>
  );
}
