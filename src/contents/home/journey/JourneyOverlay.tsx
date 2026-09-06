import { useEffect, useState, useRef, type ReactNode } from "react";
import { Link } from "react-router-dom";
import type { GlobeData } from "./DataGlobe";
import { NARRATIVE } from "./storyTimeline";

/** Science toggles on tap; world and campus inspect for the duration of a hold. */
export function TapControl({
  label,
  value,
  onChange,
  mode = "tap",
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  mode?: "tap" | "hold";
}) {
  const callback = useRef(onChange);
  callback.current = onChange;
  useEffect(() => {
    if (mode !== "hold") return;
    const release = () => callback.current(0);
    const hidden = () => {
      if (document.hidden) release();
    };
    window.addEventListener("blur", release);
    document.addEventListener("visibilitychange", hidden);
    return () => {
      window.removeEventListener("blur", release);
      document.removeEventListener("visibilitychange", hidden);
    };
  }, [mode]);
  return (
    <button
      className="journey-tap"
      aria-label={label}
      aria-pressed={value > 0.5}
      data-interaction={mode}
      aria-description={
        mode === "hold"
          ? "Press and hold to inspect. Release to return. Keyboard: hold Space or Enter."
          : undefined
      }
      onClick={mode === "tap" ? () => onChange(value > 0.5 ? 0 : 1) : undefined}
      onPointerDown={
        mode === "hold"
          ? (e) => {
              if (e.button !== 0) return;
              e.preventDefault();
              e.currentTarget.setPointerCapture(e.pointerId);
              onChange(1);
            }
          : undefined
      }
      onPointerUp={mode === "hold" ? () => onChange(0) : undefined}
      onPointerCancel={mode === "hold" ? () => onChange(0) : undefined}
      onLostPointerCapture={mode === "hold" ? () => onChange(0) : undefined}
      onBlur={mode === "hold" ? () => onChange(0) : undefined}
      onKeyDown={
        mode === "hold"
          ? (e) => {
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                if (!e.repeat) onChange(1);
              }
            }
          : undefined
      }
      onKeyUp={
        mode === "hold"
          ? (e) => {
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                onChange(0);
              }
            }
          : undefined
      }
      onContextMenu={mode === "hold" ? (e) => e.preventDefault() : undefined}
    >
      <svg viewBox="0 0 56 56" aria-hidden="true">
        <path className="tap-arc" d="M20 5C44 0 59 26 45 44" />
        <path
          className="tap-star"
          d="m27 8 5 15 15 5-15 5-5 15-5-15-15-5 15-5z"
        />
      </svg>
      <span>
        {mode === "hold" ? "TAP · HOLD" : value > 0.5 ? "CLOSE" : "TAP"}
        <small>{label}</small>
      </span>
    </button>
  );
}

export function GlobeCaption({
  year,
  onYear,
  selected,
  onSelect,
}: {
  year: number;
  onYear: (n: number) => void;
  selected: string | null;
  onSelect: (n: string | null) => void;
}) {
  const [data, setData] = useState<GlobeData | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch(import.meta.env.BASE_URL + "assets/cosmic/earth-manifest.json", {
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
    return () => controller.abort();
  }, []);
  const region = selected && data?.regions[selected];
  return (
    <aside className="globe-caption" aria-label="IBD regional data">
      <div className="globe-toolbar">
        <div className="globe-years" aria-label="Data year">
          {[1990, 2019].map((y) => (
            <button key={y} aria-pressed={year === y} onClick={() => onYear(y)}>
              {y}
            </button>
          ))}
        </div>
        <a
          href="https://doi.org/10.1136/bmjopen-2022-065186"
          target="_blank"
          rel="noreferrer"
        >
          Source ↗
        </a>
      </div>
      <p className="globe-measure">IBD prevalence / 100,000</p>
      <div className="globe-scale">
        <i />
        <span>0</span>
        <span>350+</span>
      </div>
      <small>Age-standardised · GBD regions · grey: no estimate</small>
      <select
        aria-label="Explore a GBD region"
        value={selected ?? ""}
        onChange={(e) => onSelect(e.target.value || null)}
      >
        <option value="">Tap the globe, or select a region</option>
        {Object.keys(data?.regions ?? {}).map((n) => (
          <option key={n}>{n}</option>
        ))}
      </select>
      {selected && (
        <div className="globe-value" aria-live="polite">
          <span>{selected}</span>
          <strong>
            {region ? Number(region[year]).toFixed(2) : "No estimate"}
          </strong>
          {region && <small>95% UI {String(region["ui" + year])}</small>}
          <button
            aria-label="Clear selected region"
            onClick={() => onSelect(null)}
          >
            ×
          </button>
        </div>
      )}
      <details className="globe-method">
        <summary>Reading this map</summary>
        <p>
          Colour and height show regional estimates on one scale. Country
          outlines provide context, not country-level measurements. Small
          islands retain their data colour with limited height.
        </p>
      </details>
    </aside>
  );
}

const evidence = [
  ["Anatomical context", "/description#project-context", "Explore the context"],
  ["Local environment", "/description#project-context", "Explore the context"],
  ["Design hypothesis", "/description#project-design", "Explore the design"],
  ["Design hypothesis", "/experiments", "See the experiments"],
  ["Design hypothesis", "/safety-and-security", "Explore containment"],
];
export function ScienceCaption({ step }: { step: number }) {
  const [status, path, label] = evidence[step];
  return (
    <div className="journey-science-caption">
      <small>{status}</small>
      <Link to={path}>{label} ↗</Link>
    </div>
  );
}

export function StoryCopy({
  stage,
  children,
}: {
  stage: number;
  children?: ReactNode;
}) {
  const item = NARRATIVE[stage];
  return (
    <div className="journey-editorial" key={item.id}>
      <h1>{item.title}</h1>
      {item.lines.length > 0 && <p>{item.lines.join(" ")}</p>}
      {children}
    </div>
  );
}
