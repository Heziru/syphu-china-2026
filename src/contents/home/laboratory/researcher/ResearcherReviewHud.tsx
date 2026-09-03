import { useEffect, useState } from "react";
import type { ResearcherStats } from "./createResearcherModel";
import referenceUrl from "./reference.png";
import { type ResearcherReviewView } from "./reviewShots";

type Perf = {
  fps: number;
  triangles: number;
  calls: number;
};

type Props = {
  view: ResearcherReviewView;
  onView: (view: ResearcherReviewView) => void;
};

export function ResearcherReviewHud({ view, onView }: Props) {
  const [stats, setStats] = useState<ResearcherStats | null>(null);
  const [perf, setPerf] = useState<Perf | null>(null);

  useEffect(() => {
    const read = () => {
      const host = window as Window & {
        __RESEARCHER_STATS?: ResearcherStats;
        __LAB_PERF?: Perf;
      };
      if (host.__RESEARCHER_STATS) setStats(host.__RESEARCHER_STATS);
      if (host.__LAB_PERF) setPerf(host.__LAB_PERF);
    };
    read();
    const id = window.setInterval(read, 700);
    return () => window.clearInterval(id);
  }, []);

  return (
    <aside className="lab-review">
      <p className="lab-review__label">Reference</p>
      <img className="lab-review__image" src={referenceUrl} alt="Researcher reference" />
      <div className="lab-review__views">
        {(["ref", "side", "back"] as const).map((id) => (
          <button
            key={id}
            type="button"
            className={view === id ? "is-active" : undefined}
            onClick={() => onView(id)}
          >
            {id === "ref" ? "3/4" : id === "side" ? "Side" : "Back"}
          </button>
        ))}
      </div>
      <dl className="lab-review__stats">
        <div>
          <dt>Model tris</dt>
          <dd>{stats ? stats.triangles.toLocaleString() : "—"}</dd>
        </div>
        <div>
          <dt>Materials</dt>
          <dd>{stats ? stats.materials : "—"}</dd>
        </div>
        <div>
          <dt>Meshes</dt>
          <dd>{stats ? stats.meshes : "—"}</dd>
        </div>
        <div>
          <dt>Scene FPS</dt>
          <dd>{perf ? perf.fps : "—"}</dd>
        </div>
        <div>
          <dt>Draw calls</dt>
          <dd>{perf ? perf.calls : "—"}</dd>
        </div>
      </dl>
    </aside>
  );
}
