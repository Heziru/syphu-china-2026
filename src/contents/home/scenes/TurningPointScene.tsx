import { Scene } from "../components/Scene";
import { sceneCopy } from "../homeCopy";
import { windowProgress } from "../hooks/useSceneProgress";

/** Storyboard V — treatment history curve leads to LBP-Mototype. */
export function TurningPointScene() {
  const c = sceneCopy.turning;

  return (
    <Scene tone="paper" travel={1.45} ariaLabel="A new therapeutic direction">
      {({ progress, pinned }) => {
        const brighten = pinned ? windowProgress(progress, 0.35, 0.88) : 0.55;
        const active = pinned
          ? Math.min(3, Math.floor(windowProgress(progress, 0.08, 0.72) * 4))
          : 3;

        return (
          <div
            className="moto-turn"
            style={{
              ["--moto-brighten" as string]: String(brighten),
            }}
          >
            <div className="moto-turn__curve" aria-hidden="true">
              <svg viewBox="0 0 560 280" className="moto-turn__svg">
                <path
                  d="M40 220 C120 210, 160 180, 220 170 S360 120, 520 80"
                  fill="none"
                  stroke="#2e8b57"
                  strokeWidth="2.5"
                  opacity={0.35 + brighten * 0.5}
                />
                {c.milestones.map((m, i) => {
                  const x = 80 + i * 130;
                  const y = 210 - i * 38;
                  const on = i <= active;
                  return (
                    <g key={m.label} opacity={on ? 1 : 0.25}>
                      <circle cx={x} cy={y} r="7" fill={i === 3 ? "#7ecf4a" : "#a85a42"} />
                      <text x={x} y={y + 28} textAnchor="middle" fill="#1a2421" fontSize="10">
                        {m.label.split(" ")[0]}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="moto-turn__copy">
              <p className="moto-scene-zh">{c.titleZh}</p>
              <h2 className="moto-scene-title">{c.title}</h2>
              <p className="moto-scene-sub">{c.body}</p>
              <p className="moto-scene-zh moto-scene-zh--secondary">{c.bodyZh}</p>
              <ul className="moto-turn__milestones">
                {c.milestones.map((m, i) => (
                  <li key={m.label} className={i <= active ? "is-active" : ""}>
                    <strong>{m.label}</strong>
                    <span>{m.flaw}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      }}
    </Scene>
  );
}
