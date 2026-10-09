import { useCallback, useEffect, useRef, useState } from "react";
import { assetUrl } from "../../utils/assetUrl";
import previewData from "../../../public/assets/dry-lab/adhesion/particle-preview.json";
import summary from "../../../public/assets/dry-lab/adhesion/particle-summary.json";
import "./particleTransport.css";

const asset = (file: string) => assetUrl("assets/dry-lab/adhesion/" + file);
const states = [
  { key: "free", label: "Free", color: "#3478a8" },
  { key: "attached", label: "Attached", color: "#c34b4f" },
  { key: "exited", label: "Exited", color: "#8563ae" },
  { key: "shed", label: "Shed", color: "#89928c" },
] as const;
type Point = number[];
type Ledger = {
  free: number;
  attached: number;
  exited: number;
  shed: number;
  total: number;
};
type Frame = { particles: number[][]; ledger: Ledger };
type Geometry = {
  kind: string;
  y_axis?: "up" | "down";
  bounds: number[];
  walls: { id: string; points: Point[] }[];
  centerline: Point[];
  inlet: Point[];
  outlet: Point[];
  haustra?: Point[][];
  labels?: { text: string; x: number; y: number }[];
};
type Metadata = {
  schemaVersion: number;
  geometry: Geometry;
  simulated_particle_count: number;
  displayed_particle_count: number;
  particle_ids: number[];
};
type Replay = Metadata & { time_s: number[]; frames: Frame[] };
const preview = previewData as Metadata & { time_s: number; frame: Frame };

function validReplay(value: unknown): value is Replay {
  if (!value || typeof value !== "object") return false;
  const d = value as Replay;
  const point = (p: Point) =>
    Array.isArray(p) && p.length >= 2 && p.slice(0, 2).every(Number.isFinite);
  return (
    d.schemaVersion === 1 &&
    d.simulated_particle_count === preview.simulated_particle_count &&
    d.displayed_particle_count === preview.displayed_particle_count &&
    Array.isArray(d.particle_ids) &&
    d.particle_ids.length === d.displayed_particle_count &&
    d.particle_ids.every((id, i) => id === preview.particle_ids[i]) &&
    d.geometry?.kind === preview.geometry.kind &&
    Array.isArray(d.geometry.bounds) &&
    d.geometry.bounds.length === 4 &&
    d.geometry.bounds.every(Number.isFinite) &&
    d.geometry.bounds[1] > d.geometry.bounds[0] &&
    d.geometry.bounds[3] > d.geometry.bounds[2] &&
    Array.isArray(d.geometry.walls) &&
    d.geometry.walls.length === 2 &&
    d.geometry.walls.every(
      (wall) => wall.points.length > 1 && wall.points.every(point),
    ) &&
    Array.isArray(d.geometry.centerline) &&
    d.geometry.centerline.every(point) &&
    Array.isArray(d.time_s) &&
    d.time_s.length > 1 &&
    d.time_s.every(
      (t, i) => Number.isFinite(t) && (i === 0 || t > d.time_s[i - 1]),
    ) &&
    Array.isArray(d.frames) &&
    d.frames.length === d.time_s.length &&
    d.frames.every(
      (f) =>
        Array.isArray(f.particles) &&
        f.particles.length === d.displayed_particle_count &&
        f.particles.every(
          (p) => point(p) && Number.isInteger(p[2]) && p[2] >= 0 && p[2] <= 3,
        ) &&
        f.ledger?.total === d.simulated_particle_count &&
        states.every(
          (s) => Number.isInteger(f.ledger[s.key]) && f.ledger[s.key] >= 0,
        ) &&
        states.reduce((sum, s) => sum + f.ledger[s.key], 0) === f.ledger.total,
    )
  );
}

export default function ParticleTransport() {
  const [replay, setReplay] = useState<Replay | null>(null);
  const [frameIndex, setFrameIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState("");
  const canvas = useRef<HTMLCanvasElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const request = useRef<AbortController | null>(null);
  const load = useCallback(async () => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setError("");
    try {
      const response = await fetch(asset("particle-replay.json"), {
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("Replay data could not be loaded.");
      const data: unknown = await response.json();
      if (!validReplay(data))
        throw new Error(
          "Replay data did not pass the coordinate and count checks.",
        );
      setFrameIndex(Math.max(0, data.time_s.indexOf(preview.time_s)));
      setReplay(data);
    } catch (e) {
      if (!controller.signal.aborted)
        setError(e instanceof Error ? e.message : "Loading failed.");
    }
  }, []);
  useEffect(() => {
    const node = container.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          void load();
        }
      },
      { rootMargin: "700px" },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      request.current?.abort();
    };
  }, [load]);
  useEffect(() => {
    if (!playing || !replay || frameIndex >= replay.frames.length - 1) return;
    const timer = window.setTimeout(() => setFrameIndex(frameIndex + 1), 100);
    return () => window.clearTimeout(timer);
  }, [playing, replay, frameIndex]);

  const geometry = replay?.geometry ?? preview.geometry;
  const frame = replay?.frames[frameIndex] ?? preview.frame;
  const time = replay?.time_s[frameIndex] ?? preview.time_s;
  const last = !!replay && frameIndex === replay.frames.length - 1;
  useEffect(() => {
    const element = canvas.current;
    const ctx = element?.getContext("2d");
    if (!element || !ctx) return;
    const [xmin, xmax, ymin, ymax] = geometry.bounds;
    const width = element.width,
      height = element.height,
      pad = 70;
    // Uniform display scaling preserves the supplied shape. These are not physical axes.
    const scale = Math.min(
      (width - 2 * pad) / (xmax - xmin),
      (height - 2 * pad) / (ymax - ymin),
    );
    const left = (width - (xmax - xmin) * scale) / 2;
    const top = (height - (ymax - ymin) * scale) / 2;
    const map = (p: Point) => [
      left + (p[0] - xmin) * scale,
      top + (geometry.y_axis === "up" ? ymax - p[1] : p[1] - ymin) * scale,
    ];
    const trace = (points: Point[], move = true) =>
      points.forEach((p, i) => {
        const [x, y] = map(p);
        if (i === 0 && move) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.beginPath();
    trace(geometry.walls[0].points);
    trace([...geometry.walls[1].points].reverse(), false);
    ctx.closePath();
    ctx.fillStyle = "#f0f5f0";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#8fa99a";
    geometry.walls.forEach((wall) => {
      ctx.beginPath();
      trace(wall.points);
      ctx.stroke();
    });
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#d2ded5";
    geometry.haustra?.forEach((points) => {
      ctx.beginPath();
      trace(points);
      ctx.stroke();
    });
    ctx.setLineDash([5, 7]);
    ctx.strokeStyle = "#b2c2b8";
    ctx.beginPath();
    trace(geometry.centerline);
    ctx.stroke();
    ctx.setLineDash([]);
    // Terminal coordinates are bookkeeping positions, never visible particles in the channel.
    for (const state of [0, 1]) {
      ctx.fillStyle = states[state].color;
      frame.particles.forEach((p) => {
        if (p[2] !== state) return;
        const [x, y] = map(p);
        ctx.beginPath();
        ctx.arc(x, y, state === 1 ? 3.6 : 2.8, 0, Math.PI * 2);
        ctx.fill();
      });
    }
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "#526c5f";
    geometry.labels?.forEach((label) => {
      const [x, y] = map([label.x, label.y]);
      const side = (label.x - xmin) / (xmax - xmin);
      const offset = side < 0.2 ? -20 : side > 0.8 ? 20 : 0;
      const halfText = ctx.measureText(label.text).width / 2 + 5;
      ctx.fillText(
        label.text,
        Math.max(halfText, Math.min(width - halfText, x + offset)),
        y,
      );
    });
    element.dataset.visibleParticles = String(
      frame.particles.filter((p) => p[2] < 2).length,
    );
    element.dataset.time = String(time);
  }, [geometry, frame, time]);

  return (
    <div className="particle-transport" ref={container}>
      <figure className="research-figure" id="particle-transport">
        <a
          href={asset("particle-transport.svg")}
          target="_blank"
          rel="noreferrer"
          aria-label="Open Figure 8b at full size"
        >
          <img
            src={asset("particle-transport.png")}
            width={summary.dimensions["particle-transport"].width}
            height={summary.dimensions["particle-transport"].height}
            loading="lazy"
            decoding="async"
            alt="Seeded particle trajectories shown within a schematic colon; free and attached particles and cumulative fate counts at successive model times."
          />
        </a>
        <figcaption>
          <strong>
            Figure 8b. Particle passage and reversible wall attachment.
          </strong>{" "}
          Schematic colon; particle positions mapped from the transport model.
          The simulation uses a straight channel with two reactive walls; the
          outline is a display mapping, not organ CFD. Parameter values are
          uncalibrated scenarios.
        </figcaption>
        <div className="research-figure-files">
          <a
            href={asset("particle-transport.svg")}
            target="_blank"
            rel="noreferrer"
          >
            Full size ↗
          </a>
          {["png", "svg", "pdf"].map((ext) => (
            <a key={ext} href={asset("particle-transport." + ext)} download>
              {ext.toUpperCase()}
            </a>
          ))}
          <a href={asset("particle-counts.csv")} download>
            Counts CSV
          </a>
          <a href={asset("particle-final-cohort.csv")} download>
            Final cohort CSV
          </a>
          <a href={asset("particle-replay.json")} download>
            Position JSON
          </a>
          <a href={asset("particle-transport.py")} download>
            Source
          </a>
          <a href={asset("particle-README.md")} download>
            Methods
          </a>
        </div>
      </figure>
      <div
        className="particle-replay"
        aria-label="Recorded particle trajectory replay"
      >
        <div className="particle-replay-title">
          <strong>Recorded trajectory replay</strong>
          <span>t = {time} s</span>
        </div>
        <canvas
          ref={canvas}
          width={600}
          height={800}
          role="img"
          aria-label={`Computed particle positions at ${time} seconds. ${frame.ledger.free} free, ${frame.ledger.attached} attached, ${frame.ledger.exited} exited and ${frame.ledger.shed} shed out of ${frame.ledger.total}.`}
        />
        <div className="particle-playback">
          <button
            type="button"
            disabled={!replay}
            onClick={() => {
              if (last) setFrameIndex(0);
              setPlaying(last || !playing);
            }}
            aria-label={
              last
                ? "Restart particle replay"
                : playing
                  ? "Pause particle replay"
                  : "Play particle replay"
            }
          >
            {last ? "Replay" : playing ? "Pause" : "Play"}
          </button>
          <label htmlFor="particle-time">
            Time <output>{time} s</output>
          </label>
          <input
            id="particle-time"
            type="range"
            min={0}
            max={replay ? replay.frames.length - 1 : 180}
            step={1}
            value={replay ? frameIndex : preview.time_s}
            disabled={!replay}
            aria-valuetext={`${time} seconds`}
            onChange={(e) => {
              setPlaying(false);
              setFrameIndex(Number(e.target.value));
            }}
          />
        </div>
        <dl className="particle-ledger">
          {states.map((state) => (
            <div key={state.key} style={{ borderTopColor: state.color }}>
              <dt>
                <span style={{ backgroundColor: state.color }} />
                {state.label}
              </dt>
              <dd>{frame.ledger[state.key].toLocaleString("en-US")}</dd>
            </div>
          ))}
        </dl>
        <p className="particle-note">
          The display tracks {preview.displayed_particle_count} fixed particle
          IDs; counters include all{" "}
          {preview.simulated_particle_count.toLocaleString("en-US")} particles.
          Exited and shed particles appear only in the cumulative counts. Marker
          sizes are for visibility. Replay speed: 10×.
        </p>
        {error && (
          <p className="particle-error" role="alert">
            {error} The static figure and {preview.time_s} s preview remain
            available.{" "}
            <button type="button" onClick={() => void load()}>
              Retry data
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
