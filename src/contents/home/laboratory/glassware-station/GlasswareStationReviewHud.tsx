import { useEffect, useState } from "react";
import type { GlasswareStationStats } from "./createGlasswareStationModel";
import referenceUrl from "./reference.png";
import { type GlasswareStationReviewView } from "./reviewShots";

type Perf = {
  fps: number;
  triangles: number;
  calls: number;
};

type Props = {
  view: GlasswareStationReviewView;
  onView: (view: GlasswareStationReviewView) => void;
};

export function GlasswareStationReviewHud({ view, onView }: Props) {
  const [stats, setStats] = useState<GlasswareStationStats | null>(null);
  const [perf, setPerf] = useState<Perf | null>(null);

  useEffect(() => {
    const read = () => {
      const host = window as Window & {
        __GLASSWARE_STATION_STATS?: GlasswareStationStats;
        __LAB_PERF?: Perf;
      };
      if (host.__GLASSWARE_STATION_STATS) setStats(host.__GLASSWARE_STATION_STATS);
      if (host.__LAB_PERF) setPerf(host.__LAB_PERF);
    };
    read();
    const id = window.setInterval(read, 700);
    return () => window.clearInterval(id);
  }, []);

  return (
    <aside className="lab-review">
      <p className="lab-review__label">Reference</p>
      <img className="lab-review__image" src={referenceUrl} alt="Glassware station reference" />
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
