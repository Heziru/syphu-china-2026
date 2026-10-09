import { useEffect, useId, useState } from "react";
import { assetUrl } from "../../utils/assetUrl";
import "./ecologyExplorer.css";

type Sample = {
  time: number;
  engineered: number;
  resident: number;
  support: number;
  elafin: number;
  signal: number;
};
type Scenario = {
  id: string;
  title: string;
  competition: number;
  withSupport: Sample[];
  withoutSupport: Sample[];
};
type EcologyData = {
  presets: Scenario[];
  parameters: Record<string, number>;
  equations: string[];
  limits: string[];
  nextMeasurements: string[];
  references: { title: string; url: string; use: string }[];
};
type Series = {
  key: keyof Omit<Sample, "time" | "signal">;
  label: string;
  color: string;
  rows: Sample[];
  dashed?: boolean;
};
const SAMPLE_KEYS = [
  "time",
  "engineered",
  "resident",
  "support",
  "elafin",
  "signal",
] as const;
const DATA_PATH = "assets/dry-lab/ecology-scenarios.json";
const CODE_PATH = "assets/dry-lab/ecology_scenarios.py";
const PARAMETER_LABELS: Record<string, string> = {
  rE: "Engineered growth",
  rR: "Resident growth",
  aRE: "EcN → resident competition",
  washE: "Engineered loss",
  washR: "Resident loss",
  bileStress: "Bile-related stress",
  protection: "Assumed protection strength",
  supportRate: "Response adjustment",
  qElafin: "Constitutive secretion per cell",
  elafinLoss: "Product loss",
  signalUntil: "Signal switch-off",
};

function parseData(value: unknown): EcologyData {
  const data = value as EcologyData;
  if (
    !data ||
    !Array.isArray(data.presets) ||
    data.presets.length !== 3 ||
    !data.parameters ||
    !Array.isArray(data.equations) ||
    !Array.isArray(data.limits) ||
    !Array.isArray(data.nextMeasurements) ||
    !Array.isArray(data.references)
  ) {
    throw new Error("The scenario file is incomplete.");
  }
  for (const preset of data.presets) {
    if (
      typeof preset.id !== "string" ||
      typeof preset.title !== "string" ||
      !Number.isFinite(preset.competition)
    ) {
      throw new Error("An ecological scenario is invalid.");
    }
    for (const rows of [preset.withSupport, preset.withoutSupport]) {
      if (
        !Array.isArray(rows) ||
        rows.length !== 121 ||
        rows[0]?.time !== 0 ||
        rows[120]?.time !== 24 ||
        rows.some(
          (row, index) =>
            !SAMPLE_KEYS.every(
              (key) => Number.isFinite(row[key]) && row[key] >= 0,
            ) ||
            (index > 0 && row.time <= rows[index - 1].time),
        )
      ) {
        throw new Error("The scenario time series failed its data check.");
      }
    }
  }
  return data;
}

function format(value: number) {
  return value > 0 && value < 0.001 ? value.toExponential(2) : value.toFixed(3);
}

function EcologyChart({
  title,
  unit,
  series,
  time,
  maxY,
  signalUntil,
}: {
  title: string;
  unit: string;
  series: Series[];
  time: number;
  maxY: number;
  signalUntil: number;
}) {
  const id = useId();
  const width = 640,
    height = 310,
    left = 54,
    right = 18,
    top = 29,
    bottom = 49;
  const plotWidth = width - left - right,
    plotHeight = height - top - bottom;
  const x = (value: number) => left + (value / 24) * plotWidth;
  const y = (value: number) => top + (1 - value / maxY) * plotHeight;
  const position = Math.round(time * 5);
  return (
    <figure className="dl-eco-chart">
      <figcaption>
        <strong>{title}</strong>
        <span>{unit}</span>
      </figcaption>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-labelledby={`${id}-title ${id}-desc`}
      >
        <title id={`${id}-title`}>{title}</title>
        <desc id={`${id}-desc`}>
          Illustrative model trajectories from dimensionless time 0 to 24. The
          assumed ROS signal switches off at time {signalUntil}. Current values
          at time {time}:{" "}
          {series
            .map((s) => `${s.label}: ${format(s.rows[position][s.key])}`)
            .join("; ")}
          .
        </desc>
        <rect
          x={left}
          y={top}
          width={x(signalUntil) - left}
          height={plotHeight}
          className="dl-eco-signal-area"
        />
        {[0, 1, 2, 3, 4].map((step) => {
          const value = (maxY * step) / 4;
          return (
            <g key={step}>
              <line
                x1={left}
                x2={width - right}
                y1={y(value)}
                y2={y(value)}
                className="dl-eco-grid"
              />
              <text
                x={left - 10}
                y={y(value) + 4}
                textAnchor="end"
                className="dl-eco-axis"
              >
                {value.toFixed(maxY >= 1 ? 2 : 3)}
              </text>
            </g>
          );
        })}
        {[0, 4, 8, 12, 16, 20, 24].map((tick) => (
          <text
            key={tick}
            x={x(tick)}
            y={height - bottom + 21}
            textAnchor="middle"
            className="dl-eco-axis"
          >
            {tick}
          </text>
        ))}
        <text
          x={left + plotWidth / 2}
          y={height - 7}
          textAnchor="middle"
          className="dl-eco-axis"
        >
          Model time τ · dimensionless
        </text>
        <line
          x1={x(signalUntil)}
          x2={x(signalUntil)}
          y1={top}
          y2={height - bottom}
          className="dl-eco-signal-line"
        />
        <text x={x(signalUntil) + 7} y={18} className="dl-eco-axis">
          Signal off
        </text>
        {series.map((s) => (
          <polyline
            key={s.label}
            points={s.rows
              .map(
                (row) =>
                  `${x(row.time).toFixed(2)},${y(row[s.key]).toFixed(2)}`,
              )
              .join(" ")}
            fill="none"
            stroke={s.color}
            strokeWidth={s.dashed ? 2 : 2.8}
            strokeDasharray={s.dashed ? "6 5" : undefined}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}
        <line
          x1={x(time)}
          x2={x(time)}
          y1={top}
          y2={height - bottom}
          className="dl-eco-cursor"
        />
        {series.map((s) => (
          <circle
            key={s.label}
            cx={x(time)}
            cy={y(s.rows[position][s.key])}
            r={s.dashed ? 3.3 : 4.5}
            fill={s.color}
            stroke="#fffdf6"
            strokeWidth="1.5"
          />
        ))}
      </svg>
      <ul className="dl-eco-legend" aria-label="Chart legend">
        {series.map((s) => (
          <li key={s.label}>
            <span
              aria-hidden="true"
              style={{
                borderColor: s.color,
                borderTopStyle: s.dashed ? "dashed" : "solid",
              }}
            />
            {s.label}
          </li>
        ))}
      </ul>
    </figure>
  );
}

export default function EcologyExplorer() {
  const [result, setResult] = useState<{ data?: EcologyData; error?: string }>(
    {},
  );
  const [retry, setRetry] = useState(0);
  const [selected, setSelected] = useState("moderate");
  const [compare, setCompare] = useState(true);
  const [time, setTime] = useState(8);
  const [readout, setReadout] = useState<"support" | "elafin">("support");
  const id = useId();
  useEffect(() => {
    const controller = new AbortController();
    fetch(assetUrl(DATA_PATH), { signal: controller.signal })
      .then((response) => {
        if (!response.ok)
          throw new Error(
            `The scenario file could not be loaded (HTTP ${response.status}).`,
          );
        return response.json();
      })
      .then((json: unknown) => setResult({ data: parseData(json) }))
      .catch((error: unknown) => {
        if (!controller.signal.aborted)
          setResult({
            error:
              error instanceof Error
                ? error.message
                : "Unable to load the scenario file.",
          });
      });
    return () => controller.abort();
  }, [retry]);

  if (result.error)
    return (
      <div className="dl-eco dl-eco-error" role="alert">
        <strong>The ecology explorer is unavailable.</strong>
        <p>{result.error}</p>
        <button
          type="button"
          onClick={() => {
            setResult({});
            setRetry((value) => value + 1);
          }}
        >
          Try again
        </button>
        <a href={assetUrl(CODE_PATH)} download>
          Download the Python model
        </a>
      </div>
    );
  if (!result.data)
    return (
      <div className="dl-eco dl-eco-loading" role="status">
        Loading the ecological scenarios…
      </div>
    );
  const data = result.data;
  const scenario =
    data.presets.find((preset) => preset.id === selected) ?? data.presets[0];
  const row = scenario.withSupport[Math.round(time * 5)];
  const control = scenario.withoutSupport[Math.round(time * 5)];
  const populationSeries: Series[] = [
    {
      key: "engineered",
      label: "Engineered EcN",
      color: "#28675a",
      rows: scenario.withSupport,
    },
    {
      key: "resident",
      label: "Resident community",
      color: "#a77b44",
      rows: scenario.withSupport,
    },
    ...(compare
      ? [
          {
            key: "engineered" as const,
            label: "EcN · support off",
            color: "#899c91",
            rows: scenario.withoutSupport,
            dashed: true,
          },
          {
            key: "resident" as const,
            label: "Residents · support off",
            color: "#cab798",
            rows: scenario.withoutSupport,
            dashed: true,
          },
        ]
      : []),
  ];
  const productSeries: Series[] = [
    {
      key: readout,
      label: readout === "support" ? "Proposed support" : "Constitutive Elafin",
      color: readout === "support" ? "#7c91aa" : "#cc8767",
      rows: scenario.withSupport,
    },
    ...(compare
      ? [
          {
            key: readout,
            label: "Support-off control",
            color: "#b8ada0",
            rows: scenario.withoutSupport,
            dashed: true,
          },
        ]
      : []),
  ];
  // Keep the Elafin axis identical across presets and controls so scenario
  // switching cannot visually inflate a smaller product trajectory.
  const productMax =
    readout === "support"
      ? 1
      : Math.max(
          0.1,
          Math.ceil(
            Math.max(
              ...data.presets.flatMap((preset) =>
                [...preset.withSupport, ...preset.withoutSupport].map(
                  (entry) => entry.elafin,
                ),
              ),
            ) / 0.1,
          ) * 0.1,
        );
  return (
    <div className="dl-eco">
      <div className="dl-eco-intro">
        <span className="dl-eco-eyebrow">AN EXPLORATORY MODEL</span>
        <h3>Protection meets competition.</h3>
        <p>
          Could resident competition change how long an introduced population
          remains? Compare three assumed environments with the same proposed
          response.
        </p>
      </div>
      <div className="dl-eco-controls">
        <fieldset className="dl-eco-scenarios">
          <legend>Competition from residents</legend>
          <div>
            {data.presets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                aria-pressed={scenario.id === preset.id}
                onClick={() => setSelected(preset.id)}
              >
                {preset.title.replace(" competition", "")}
                <small>α = {preset.competition.toFixed(2)}</small>
              </button>
            ))}
          </div>
        </fieldset>
        <label className="dl-eco-compare">
          <input
            type="checkbox"
            checked={compare}
            onChange={(event) => setCompare(event.target.checked)}
          />
          Compare with support switched off
        </label>
      </div>
      <p className="dl-eco-assumption">
        <strong>All parameters are assumptions.</strong> No co-culture or
        microbiome data were available to fit them. Time and populations are
        dimensionless; curves do not predict patients, doses or microbial
        clearance.
      </p>
      <div className="dl-eco-charts">
        <EcologyChart
          title="Who remains?"
          unit="Normalized population · not relative abundance %"
          series={populationSeries}
          time={time}
          maxY={1}
          signalUntil={data.parameters.signalUntil}
        />
        <div className="dl-eco-response">
          <div
            className="dl-eco-switch"
            role="group"
            aria-label="Response chart"
          >
            <button
              type="button"
              aria-pressed={readout === "support"}
              onClick={() => setReadout("support")}
            >
              Proposed support
            </button>
            <button
              type="button"
              aria-pressed={readout === "elafin"}
              onClick={() => setReadout("elafin")}
            >
              Elafin output
            </button>
          </div>
          <EcologyChart
            title={
              readout === "support" ? "Signal to support" : "Cells to product"
            }
            unit={
              readout === "support"
                ? "Normalized response · 0 to 1"
                : "Relative product · fixed scale across scenarios · not nM"
            }
            series={productSeries}
            time={time}
            maxY={productMax}
            signalUntil={data.parameters.signalUntil}
          />
        </div>
      </div>
      <div className="dl-eco-scrubber">
        <label htmlFor={`${id}-time`}>
          Inspect model time{" "}
          <output htmlFor={`${id}-time`}>τ = {time.toFixed(1)}</output>
        </label>
        <input
          id={`${id}-time`}
          type="range"
          min="0"
          max="24"
          step="0.2"
          value={time}
          onChange={(event) => setTime(Number(event.target.value))}
          aria-valuetext={`Dimensionless model time ${time.toFixed(1)}`}
        />
        <div>
          <span>Signal on</span>
          <span>Signal off after τ = 8</span>
          <span>24</span>
        </div>
      </div>
      <dl className="dl-eco-readouts">
        <div>
          <dt>Engineered EcN</dt>
          <dd>
            {format(row.engineered)}
            <small>normalized population</small>
          </dd>
          {compare && <span>Control {format(control.engineered)}</span>}
        </div>
        <div>
          <dt>Resident community</dt>
          <dd>
            {format(row.resident)}
            <small>normalized population</small>
          </dd>
        </div>
        <div>
          <dt>Proposed support</dt>
          <dd>
            {format(row.support)}
            <small>normalized response</small>
          </dd>
        </div>
        <div>
          <dt>Elafin</dt>
          <dd>
            {format(row.elafin)}
            <small>relative product state</small>
          </dd>
          {compare && <span>Control {format(control.elafin)}</span>}
        </div>
      </dl>
      <p className="dl-eco-takeaway">
        {scenario.id === "permissive"
          ? "In this lower-competition scenario, the population remains after the signal falls. Loss of a support signal does not itself demonstrate clearance."
          : scenario.id === "moderate"
            ? "At intermediate competition, assumed support keeps more engineered cells than the control during the signal window. Relative Elafin depends on cell number and product loss."
            : "In this higher-competition scenario, the population declines even with assumed support. Protection alone need not overcome the resident community."}
      </p>
      <details className="dl-eco-details">
        <summary>Equations, assumptions and what to measure next</summary>
        <p>
          The ROS signal drives proposed PspA-related support <em>p</em>.
          Per-cell Elafin secretion <em>q</em> stays constant. The protective
          effect is an untested hypothesis, represented as a reduction of an
          assumed bile-related loss term.
        </p>
        <div className="dl-eco-equations">
          {data.equations.map((equation) => (
            <code key={equation}>{equation}</code>
          ))}
        </div>
        <p>
          <em>x</em>: engineered population; <em>y</em>: aggregated resident
          population; <em>p</em>: proposed support; <em>L</em>: relative Elafin.
          Initial state: (0.08, 0.80, 0, 0). The assumed signal equals 1 before
          τ = 8 and 0 thereafter. A support-off control sets the response target
          to 0.
        </p>
        <h4>Illustrative parameters</h4>
        <dl className="dl-eco-parameters">
          {Object.entries(data.parameters).map(([key, value]) => (
            <div key={key}>
              <dt>
                {PARAMETER_LABELS[key] ?? key}
                <code>{key}</code>
              </dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
        <h4>Model boundaries</h4>
        <ul>
          {data.limits.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ul>
        <h4>Measurements that would make this predictive</h4>
        <ol>
          {data.nextMeasurements.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ol>
        <h4>Model-form references</h4>
        <ul>
          {data.references.map((reference) => (
            <li key={reference.url}>
              <a href={reference.url} target="_blank" rel="noreferrer">
                {reference.title}
              </a>
              <p>{reference.use}</p>
            </li>
          ))}
        </ul>
        <p>
          Numerical checks: finite nonnegative states, no cells → no product,
          zero secretion, support-off and zero-protection controls. Halving the
          RK4 step changed sampled states by less than 2 × 10⁻¹⁰. These are
          numerical checks, not biological validation.
        </p>
      </details>
      <div className="dl-eco-downloads">
        <a href={assetUrl(DATA_PATH)} download>
          Scenario data · JSON <span aria-hidden="true">↘</span>
        </a>
        <a href={assetUrl(CODE_PATH)} download>
          Reproducible model · Python <span aria-hidden="true">↘</span>
        </a>
        <a href={assetUrl("assets/dry-lab/ecology-README.md")} download>
          Model notes · README <span aria-hidden="true">↘</span>
        </a>
      </div>
    </div>
  );
}
