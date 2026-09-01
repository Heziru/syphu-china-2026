import { Scene } from "../components/Scene";
import { sceneCopy } from "../homeCopy";
import { pulseOpacity, windowProgress } from "../hooks/useSceneProgress";

function TaijiSvg({ spin = 0, opacity = 1 }: { spin?: number; opacity?: number }) {
  return (
    <svg
      className="moto-balance__taiji"
      viewBox="0 0 200 200"
      style={{ transform: `rotate(${spin}deg)`, opacity }}
      aria-hidden="true"
    >
      <circle cx="100" cy="100" r="96" fill="#1a2238" stroke="#6366f1" strokeWidth="2" />
      <path d="M100 4 A96 96 0 0 1 100 196 A48 48 0 0 0 100 100 A48 48 0 0 1 100 4" fill="#f1f5f9" />
      <circle cx="100" cy="52" r="10" fill="#1a2238" />
      <circle cx="100" cy="148" r="10" fill="#f1f5f9" />
    </svg>
  );
}

function ScaleSvg({ tilt = 0 }: { tilt?: number }) {
  return (
    <svg className="moto-balance__scale" viewBox="0 0 320 220" aria-hidden="true">
      <g transform={`rotate(${tilt} 160 120)`}>
        <line x1="160" y1="40" x2="160" y2="150" stroke="#1a2421" strokeWidth="3" />
        <line x1="90" y1="150" x2="230" y2="150" stroke="#1a2421" strokeWidth="3" />
        <line x1="70" y1="80" x2="110" y2="150" stroke="#2e8b57" strokeWidth="2" />
        <line x1="250" y1="80" x2="210" y2="150" stroke="#a85a42" strokeWidth="2" />
        <ellipse cx="90" cy="78" rx="34" ry="10" fill="#e8f0ea" stroke="#2e8b57" strokeWidth="1.5" />
        <ellipse cx="250" cy="78" rx="34" ry="10" fill="#ebe4d7" stroke="#a85a42" strokeWidth="1.5" />
        <rect x="145" y="150" width="30" height="18" rx="4" fill="#1a2421" />
      </g>
    </svg>
  );
}

/** Storyboard I — Western scale meets Chinese yin–yang; balance as philosophy. */
export function BalanceScene() {
  const c = sceneCopy.balance;

  return (
    <Scene tone="panel" travel={1.55} ariaLabel="Balance and harmony">
      {({ progress, pinned }) => {
        const lineIndex = pinned
          ? progress < 0.28
            ? 0
            : progress < 0.48
              ? 1
              : 2
          : 0;
        const lineOpacity = pinned
          ? pulseOpacity(progress, 0.12 + lineIndex * 0.18, 0.28 + lineIndex * 0.18)
          : 1;
        const taijiSpin = pinned ? progress * 120 : 24;
        const scaleTilt = pinned ? Math.sin(progress * Math.PI * 2) * 4 : 0;
        const merge = windowProgress(progress, 0.55, 0.82);

        return (
          <div className="moto-balance">
            <div className="moto-balance__visual" aria-hidden="true">
              <ScaleSvg tilt={scaleTilt * (1 - merge * 0.5)} />
              <TaijiSvg spin={taijiSpin} opacity={0.35 + merge * 0.65} />
            </div>
            <div className="moto-balance__copy">
              <p className="moto-scene-zh">{c.titleZh}</p>
              <h2 className="moto-scene-title">{c.title}</h2>
              <p className="moto-scene-sub" style={{ opacity: lineOpacity }}>
                {c.lines[lineIndex]}
              </p>
              <p className="moto-scene-zh moto-scene-zh--secondary" style={{ opacity: lineOpacity }}>
                {c.linesZh[lineIndex]}
              </p>
            </div>
          </div>
        );
      }}
    </Scene>
  );
}
