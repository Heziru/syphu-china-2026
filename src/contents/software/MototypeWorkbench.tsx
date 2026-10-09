import { useMemo, useRef, useState, type ChangeEvent } from "react";
import {
  analyzeKinetics,
  crossingTime,
  predict,
  DOMAIN,
  MODEL_VERSION,
  type ModelSettings,
  type Stage,
} from "./engine/kinetics";
import {
  DEFAULT_RULE,
  evaluate,
  parseCSV,
  SAMPLES,
  toCSV,
  escapeHTML,
  type Dataset,
} from "./engine/mototype";
import {
  defaults,
  example,
  restoreRecord,
  runRecord,
  statusText,
} from "./engine/runtime";
const fmt = (n: number, d = 2) =>
  Number.isFinite(n)
    ? Number(n.toFixed(d)).toLocaleString("en-US", { maximumFractionDigits: d })
    : "—";
const verdictNames = {
  supported: "Supported",
  conflict: "Conflict",
  indeterminate: "Undetermined",
};
function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
export function MototypeWorkbench() {
  const [dataset, setDataset] = useState<Dataset>(() => example("decay")),
    [scenario, setScenario] = useState("decay");
  const [settings, setSettings] = useState<ModelSettings>({ ...defaults }),
    [replicate, setReplicate] = useState("B1");
  const [binding, setBinding] = useState(false),
    [message, setMessage] = useState(""),
    [importError, setImportError] = useState(""),
    [pending, setPending] = useState(false),
    [csvDraft, setCsvDraft] = useState("");
  const fileRef = useRef<HTMLInputElement>(null),
    importRevision = useRef(0);
  const a = useMemo(
    () => analyzeKinetics(dataset, settings),
    [dataset, settings],
  );
  const observed = useMemo(
    () => evaluate(dataset, { ...DEFAULT_RULE, threshold: settings.threshold }),
    [dataset, settings.threshold],
  );
  const status = statusText(a, settings),
    best = a.best;
  const usable =
    a.state === "ready" && best !== null && best.rmse <= settings.tolerance;
  const metrics = usable && a.constrained && a.holdoutPassed === true;
  const times = Array.from({ length: 81 }, (_, i) => i / 20);
  const band = a.compatible.length
    ? times.map((t) => {
        const values = a.compatible.map((m) => predict(m, replicate, t));
        return { t, lo: Math.min(...values), hi: Math.max(...values) };
      })
    : [];
  const yMax = Math.max(
    600,
    settings.threshold * 1.15,
    ...a.training.map((p) => p.y),
    ...a.holdout.map((p) => p.y),
    ...band.map((p) => p.hi),
  );
  const x = (t: number) => 58 + (t / 4) * 672,
    y = (v: number) => 300 - (v / yMax) * 247;
  const path = (m: NonNullable<typeof best>) =>
    times
      .map(
        (t, i) =>
          (i ? "L" : "M") +
          x(t).toFixed(2) +
          "," +
          y(predict(m, replicate, t)).toFixed(2),
      )
      .join(" ");
  const fill = band.length
    ? "M" +
      band.map((p) => x(p.t).toFixed(2) + "," + y(p.hi).toFixed(2)).join(" L") +
      " L" +
      [...band]
        .reverse()
        .map((p) => x(p.t).toFixed(2) + "," + y(p.lo).toFixed(2))
        .join(" L") +
      " Z"
    : "";
  const first =
    settings.firstCheck?.datasetId === dataset.id
      ? settings.firstCheck
      : undefined;
  const firstPassed =
    first?.passed === true &&
    first.trainingRmse !== null &&
    first.trainingRmse <= first.tolerance;
  function stage(value: Stage) {
    let saved = first;
    if (value === "verify" && !saved) {
      const result = analyzeKinetics(dataset, { ...settings, stage: value });
      saved = {
        datasetId: dataset.id,
        tolerance: settings.tolerance,
        trainingRmse: result.best?.rmse ?? null,
        passed: result.holdoutPassed,
      };
    }
    setSettings({ ...settings, stage: value, firstCheck: saved });
  }
  function setExample(value: string) {
    importRevision.current++;
    setPending(false);
    setScenario(value);
    setDataset(example(value));
    setSettings({ ...defaults });
    setImportError("");
    setMessage("");
    if (fileRef.current) fileRef.current.value = "";
  }
  async function loadFile(e: ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget,
      file = input.files?.[0];
    if (!file) return;
    await importFile(file);
    input.value = "";
  }
  async function importFile(file: File) {
    const revision = ++importRevision.current;
    setPending(true);
    setImportError("");
    setMessage("");
    try {
      if (file.size > 5 * 1024 * 1024)
        throw new Error(
          "Files must be under 5 MiB; CSV input is further limited to 2 MiB.",
        );
      const text = await file.text();
      if (revision !== importRevision.current) return;
      let imported: Dataset, newSettings: ModelSettings;
      if (file.name.toLowerCase().endsWith(".json")) {
        const restored = restoreRecord(JSON.parse(text));
        imported = restored.dataset;
        newSettings = restored.settings;
      } else {
        if (!binding)
          throw new Error(
            "Confirm the fixed sample, environment and measurement mapping before importing CSV.",
          );
        const rows = parseCSV(text);
        const digest = await crypto.subtle.digest(
          "SHA-256",
          new TextEncoder().encode(text),
        );
        imported = {
          id: "local-" + Date.now(),
          name: file.name,
          source: "local",
          rows,
          hash: Array.from(new Uint8Array(digest))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join(""),
          rawCSV: text,
        };
        newSettings = { ...defaults };
      }
      if (revision !== importRevision.current) return;
      setDataset(imported);
      setSettings(newSettings);
      setScenario("local");
      setMessage(
        "Input loaded. Results are recomputed locally; saved outputs and prior holdout history are not used as evidence.",
      );
    } catch (error) {
      if (revision === importRevision.current)
        setImportError(
          error instanceof Error
            ? error.message
            : "The file could not be read.",
        );
    } finally {
      if (revision === importRevision.current) setPending(false);
    }
  }
  function exportReport() {
    const record = runRecord(dataset, settings);
    download(
      "mototype-report.html",
      '<!doctype html><html lang="en"><meta charset="utf-8"><title>Mototype run report</title><style>body{max-width:900px;margin:50px auto;padding:24px;font:16px/1.7 system-ui;color:#243832}pre{white-space:pre-wrap;overflow-wrap:anywhere;padding:20px;background:#f1f4ef}h1{font-family:Georgia,serif}</style><h1>Mototype Studio</h1><p>' +
        escapeHTML(dataset.name) +
        "</p><h2>" +
        escapeHTML(status.title) +
        "</h2><p>" +
        escapeHTML(status.detail) +
        "</p><p>Observed 1–4 h requirement: " +
        verdictNames[observed.verdict] +
        ". Model training and the observed requirement are separate checks.</p><p>Core version: " +
        MODEL_VERSION +
        ". Empirical reporter model; no biological validation. Profile candidates are not a confidence distribution; candidate fractions are not probabilities. Input metadata is supplied by the user or by the synthetic fixture.</p><h2>Inputs, settings and computed results</h2><pre>" +
        escapeHTML(JSON.stringify(record, null, 2)) +
        "</pre></html>",
      "text/html;charset=utf-8",
    );
  }
  return (
    <div
      className="mt-workbench"
      data-stage={settings.stage}
      data-result={status.kind}
    >
      <header className="mt-toolbar">
        <div>
          <b>Mototype</b>
          <span>Response analysis</span>
        </div>
        <span className="mt-local">Runs in your browser</span>
      </header>
      <div className="mt-main">
        <aside className="mt-controls">
          <label htmlFor="mt-example">Dataset</label>
          <select
            id="mt-example"
            value={scenario}
            onChange={(e) => setExample(e.target.value)}
          >
            <option value="decay">Synthetic decay</option>
            <option value="mismatch">Model mismatch</option>
            <option value="limit">Reporting limit</option>
            {scenario === "local" && (
              <option value="local">Imported dataset</option>
            )}
          </select>
          <p className="mt-source">
            {dataset.source === "synthetic"
              ? "Synthetic example · not wet-lab data"
              : dataset.name}
          </p>
          <div className="mt-control-group">
            <label htmlFor="mt-target">
              Readout target <span>RFU</span>
            </label>
            <input
              id="mt-target"
              type="number"
              min="0"
              max="1000000"
              value={settings.threshold}
              onChange={(e) => {
                const v = e.target.valueAsNumber;
                if (Number.isFinite(v) && v >= 0 && v <= 1e6)
                  setSettings({ ...settings, threshold: v });
              }}
            />
          </div>
          <div className="mt-control-group">
            <label htmlFor="mt-error">
              Error budget δ <output>{settings.tolerance} RFU</output>
            </label>
            <input
              id="mt-error"
              type="range"
              min="1"
              max="20"
              step="1"
              value={settings.tolerance}
              onChange={(e) =>
                setSettings({ ...settings, tolerance: Number(e.target.value) })
              }
            />
            <p>An exploratory setting, not instrument precision.</p>
          </div>
          <div className="mt-control-group">
            <label htmlFor="mt-cost">
              Waiting cost λ <output>{settings.waitCost} / h</output>
            </label>
            <input
              id="mt-cost"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.waitCost}
              onChange={(e) =>
                setSettings({ ...settings, waitCost: Number(e.target.value) })
              }
            />
          </div>
          <div className="mt-window-check">
            <span>Observed requirement</span>
            <strong>{verdictNames[observed.verdict]}</strong>
            <p>
              Every reading from 1–4 h after the switch must be ≤{" "}
              {settings.threshold} RFU, with planned times covered.
            </p>
          </div>
          <a href="#software-methods" className="mt-method-link">
            Model assumptions ↗
          </a>
        </aside>
        <div className="mt-analysis">
          <div
            className="mt-stages"
            role="group"
            aria-label="Training and holdout stages"
          >
            {(
              [
                ["early", "01", "Early data"],
                ["learn", "02", "Add 2 h"],
                ["verify", "03", "Check 4 h"],
              ] as const
            ).map(([value, n, title]) => (
              <button
                key={value}
                aria-pressed={settings.stage === value}
                onClick={() => stage(value)}
              >
                <span>{n}</span>
                {title}
              </button>
            ))}
          </div>
          <div
            className={"mt-outcome mt-outcome--" + status.kind}
            role="status"
          >
            <span className="mt-status-mark" />
            <div>
              <h4>{status.title}</h4>
              <p>{status.detail}</p>
            </div>
          </div>
          <div className="mt-figure-top">
            <div className="mt-legend">
              <span>
                <i className="mt-dot" />
                Training data
              </span>
              <span>
                <i className="mt-line" />
                Fitted profile
              </span>
              <span>
                <i className="mt-band" />
                Profile envelope
              </span>
            </div>
            <label className="mt-replicate">
              Replicate
              <select
                aria-label="Biological replicate"
                value={replicate}
                onChange={(e) => setReplicate(e.target.value)}
              >
                {SAMPLES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
          </div>
          {a.state === "ready" ? (
            <div
              className="mt-plot-scroll"
              tabIndex={0}
              aria-label="Scrollable response plot"
            >
              <svg
                className="mt-plot"
                viewBox="0 0 780 360"
                role="img"
                aria-label={
                  "Reporter response for " + replicate + ". " + status.title
                }
              >
                <title>Response profiles and held-out readings</title>
                {[0, 1, 2, 3, 4].map((i) => (
                  <g key={i}>
                    <line
                      x1="58"
                      x2="730"
                      y1={y((yMax * i) / 4)}
                      y2={y((yMax * i) / 4)}
                      stroke="#e6eae5"
                    />
                    <text x="45" y={y((yMax * i) / 4) + 4} textAnchor="end">
                      {fmt((yMax * i) / 4, 0)}
                    </text>
                  </g>
                ))}
                <text x="58" y="22">
                  Reporter readout · RFU
                </text>
                <path d={fill} fill="#c8d9d0" fillOpacity=".65" />
                <line
                  x1="58"
                  x2="730"
                  y1={y(settings.threshold)}
                  y2={y(settings.threshold)}
                  stroke="#ad8955"
                  strokeDasharray="4 5"
                />
                <text
                  x="724"
                  y={y(settings.threshold) - 8}
                  textAnchor="end"
                  className="mt-axis-target"
                >
                  Target {fmt(settings.threshold, 0)}
                </text>
                {best && (
                  <path
                    d={path(best)}
                    fill="none"
                    stroke="#296b57"
                    strokeWidth="2.4"
                  />
                )}
                {!a.constrained && a.compatible.length > 0 && (
                  <path
                    d={path(a.compatible[a.compatible.length - 1])}
                    fill="none"
                    stroke="#6f8e85"
                    strokeDasharray="5 4"
                    strokeWidth="1.7"
                  />
                )}
                <line
                  x1={x(a.now)}
                  x2={x(a.now)}
                  y1="38"
                  y2="300"
                  stroke="#a8b8b0"
                  strokeDasharray="2 4"
                />
                <text x={x(a.now) + 8} y="43">
                  Fit ends at {a.now} h
                </text>
                {a.training
                  .filter((p) => p.sample === replicate)
                  .map((p) => (
                    <circle
                      key={p.id}
                      cx={x(p.t)}
                      cy={y(p.y)}
                      r="4.5"
                      fill="#213f33"
                      stroke="white"
                      strokeWidth="1.5"
                    >
                      <title>
                        {p.sample + " " + p.t + " h: " + fmt(p.y) + " RFU"}
                      </title>
                    </circle>
                  ))}
                {a.holdout
                  .filter((p) => p.sample === replicate)
                  .map((p) => (
                    <g key={p.id}>
                      <line
                        x1={x(p.t)}
                        x2={x(p.t)}
                        y1={y(p.y)}
                        y2={y(predict(best!, p.sample, p.t))}
                        stroke="#a56048"
                        strokeWidth="2"
                      />
                      <rect
                        x={x(p.t) - 5}
                        y={y(p.y) - 5}
                        width="10"
                        height="10"
                        fill="white"
                        stroke={
                          Math.abs(predict(best!, p.sample, p.t) - p.y) <=
                          settings.tolerance
                            ? "#296b57"
                            : "#a56048"
                        }
                        strokeWidth="2"
                      />
                      <title>{"Holdout: " + fmt(p.y) + " RFU"}</title>
                    </g>
                  ))}
                {[0, 1, 2, 3, 4].map((t) => (
                  <text key={t} x={x(t)} y="322" textAnchor="middle">
                    {t}
                  </text>
                ))}
                <text x="730" y="348" textAnchor="end">
                  Time after environment switch / h
                </text>
              </svg>
            </div>
          ) : (
            <div className="mt-empty">
              No curve is fitted to unsupported inputs. Open the input records
              below to check the measurements.
            </div>
          )}
          <div className="mt-fit-facts">
            <span>
              <b>{a.training.length}</b> training readings
            </span>
            <span>
              <b>{a.compatible.length}</b> profile candidates
            </span>
            <span>
              Training RMSE <b>{best ? fmt(best.rmse, 3) : "—"} RFU</b>
            </span>
          </div>
          <div className="mt-decision">
            <div>
              <span className="mt-small-label">
                {settings.stage === "verify"
                  ? "Held-out predictions"
                  : "Next measurement"}
              </span>
              <h4>
                {settings.stage === "verify"
                  ? "Compare prediction with observation"
                  : a.recommended && usable && a.recommended.score > 0
                    ? fmt(a.recommended.time, 1) + " h after the switch"
                    : "No ranked recommendation"}
              </h4>
              <p>
                {settings.stage === "verify"
                  ? "Square markers are measured values that were not fitted."
                  : a.recommended && usable && a.recommended.score > 0
                    ? "Highest decision-disagreement score among the available times. This is a conditional heuristic, not an optimality claim."
                    : "These profiles have no resolvable threshold disagreement, or the fit does not meet the error budget."}
              </p>
            </div>
            {settings.stage === "verify" && a.residuals.length > 0 ? (
              <div className="mt-mini-table">
                <table>
                  <caption className="visually-hidden">
                    Held-out prediction errors
                  </caption>
                  <thead>
                    <tr>
                      <th>Rep.</th>
                      <th>Predicted</th>
                      <th>Observed</th>
                      <th>Error / RFU</th>
                    </tr>
                  </thead>
                  <tbody>
                    {a.residuals.map((r) => (
                      <tr key={r.sample + "-" + r.t}>
                        <th>
                          {r.sample} · {fmt(r.t)} h
                        </th>
                        <td>{fmt(r.predicted)}</td>
                        <td>{fmt(r.observed)}</td>
                        <td
                          className={
                            Math.abs(r.error) > settings.tolerance
                              ? "mt-error-value"
                              : ""
                          }
                        >
                          {fmt(r.error)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : a.scores.length > 0 && usable ? (
              <div className="mt-mini-table">
                <table>
                  <caption className="visually-hidden">
                    Sampling candidate scores
                  </caption>
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Spread / RFU</th>
                      <th>Score J</th>
                    </tr>
                  </thead>
                  <tbody>
                    {a.scores.map((s) => (
                      <tr
                        key={s.time}
                        className={
                          s.time === a.recommended?.time && s.score > 0
                            ? "mt-recommended"
                            : ""
                        }
                      >
                        <th>{s.time} h</th>
                        <td>{fmt(s.spread)}</td>
                        <td>{fmt(s.score, 3)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
          {first && settings.stage === "verify" && (
            <p className="mt-history">
              First check: δ = {first.tolerance} RFU;{" "}
              {first.passed === null
                ? "incomplete"
                : firstPassed
                  ? "within budget"
                  : "rejected"}
              .{" "}
              {first.tolerance !== settings.tolerance
                ? "The budget has changed after seeing the holdout. This is an exploratory reassessment."
                : "This adjustable replay is not a preregistered experiment."}
            </p>
          )}
          {metrics && (
            <div className="mt-parameters">
              <span>
                Model-derived half-life <b>{fmt(Math.LN2 / best!.k)} h</b>
              </span>
              <span>
                {replicate} plateau{" "}
                <b>
                  {fmt(best!.units.find((u) => u.sample === replicate)!.floor)}{" "}
                  RFU
                </b>
              </span>
              <span>
                {replicate} target crossing{" "}
                <b>
                  {crossingTime(best!, replicate, settings.threshold) === null
                    ? "Not reached"
                    : fmt(crossingTime(best!, replicate, settings.threshold)!) +
                      " h"}
                </b>
              </span>
            </div>
          )}
          {a.boundary && (
            <p className="mt-boundary">
              Candidates touch a rate-search boundary. Their extent depends on
              the chosen numerical domain.
            </p>
          )}
        </div>
      </div>
      <details className="mt-inputs">
        <summary>
          Input records &amp; import{" "}
          <span>{dataset.rows.length} records · CSV / saved JSON</span>
        </summary>
        <div>
          <div className="mt-import">
            <div>
              <label className="mt-binding">
                <input
                  type="checkbox"
                  checked={binding}
                  onChange={(e) => setBinding(e.target.checked)}
                />
                <span>
                  For CSV: I confirm B1–B3 are biological replicates of the same
                  reporter construct, the environment changes at experimental
                  time 2 h, and readings use the declared device scale.
                </span>
              </label>
              <label className="mt-file-label">
                Load a CSV or a saved run
                <input
                  ref={fileRef}
                  aria-label="Load a CSV or saved run"
                  type="file"
                  accept=".csv,.json"
                  disabled={pending}
                  onChange={loadFile}
                />
              </label>
              <p>
                CSV: 2 MiB / 10,000 rows; fitting: up to 1,500 training rows.
                Files remain in this browser. A rejected import keeps the
                previous dataset.
              </p>
            </div>
            <button
              className="sw-button sw-button--quiet"
              onClick={() =>
                download(
                  "mototype-template.csv",
                  toCSV(example("decay")),
                  "text/csv;charset=utf-8",
                )
              }
            >
              Download CSV example ↓
            </button>
          </div>
          <details className="mt-paste">
            <summary>
              Paste CSV <span>Inspect or edit the input format here</span>
            </summary>
            <div>
              <p>
                Use the same columns and mapping as the file importer. Pasted
                values are user-supplied; their source is not independently
                verified.
              </p>
              <button
                type="button"
                className="sw-button sw-button--quiet"
                onClick={() => setCsvDraft(toCSV(example("decay")))}
              >
                Fill with synthetic example
              </button>
              <label htmlFor="mt-csv-text">CSV text</label>
              <textarea
                id="mt-csv-text"
                spellCheck={false}
                rows={9}
                value={csvDraft}
                maxLength={2 * 1024 * 1024}
                onChange={(e) => setCsvDraft(e.target.value)}
                placeholder="Paste the CSV header and measurement rows…"
              />
              <button
                type="button"
                className="sw-button"
                disabled={pending || !csvDraft.trim()}
                onClick={() =>
                  importFile(
                    new File([csvDraft], "pasted-input.csv", {
                      type: "text/csv",
                    }),
                  )
                }
              >
                Load pasted CSV
              </button>
              <p>
                The synthetic example is generated, not measured in a wet lab.
                Loading replaces the current dataset and returns to Early data.
              </p>
            </div>
          </details>
          {importError && (
            <p role="alert" className="mt-import-error">
              {importError}
            </p>
          )}
          {message && (
            <p role="status" className="mt-import-message">
              {message}
            </p>
          )}
          {pending && <p role="status">Reading input…</p>}
          <div className="mt-record-table">
            <table>
              <caption>
                Experimental times include the 2 h pre-switch period. The plot
                uses time since the switch.
              </caption>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Replicate</th>
                  <th>Time / h</th>
                  <th>Readout / RFU</th>
                  <th>Qualifier</th>
                  <th>CSV line</th>
                </tr>
              </thead>
              <tbody>
                {dataset.rows.slice(0, 120).map((o) => (
                  <tr key={o.id}>
                    <th>{o.id}</th>
                    <td>{o.sample}</td>
                    <td>{fmt(o.time)}</td>
                    <td>
                      {o.qualifier === "missing"
                        ? "—"
                        : o.qualifier === "lt"
                          ? "< " + o.upper
                          : o.qualifier === "gt"
                            ? "> " + o.lower
                            : fmt(o.value!)}
                    </td>
                    <td>{o.qualifier}</td>
                    <td>{o.row}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {dataset.rows.length > 120 && (
            <p>
              Showing the first 120 records. All records remain in analysis and
              export.
            </p>
          )}
        </div>
      </details>
      <details className="mt-report">
        <summary>
          Read this run{" "}
          <span>Settings, result and provenance · no download needed</span>
        </summary>
        <div className="mt-report-body">
          <h3>Current analysis</h3>
          <p>
            {status.title}. {status.detail}
          </p>
          <dl>
            <div>
              <dt>Input</dt>
              <dd>
                {dataset.name} · {dataset.rows.length} records.{" "}
                {dataset.source === "synthetic"
                  ? "Generated example; not wet-lab evidence."
                  : "User-supplied data; provenance is not independently verified."}
              </dd>
            </div>
            <div>
              <dt>Training window</dt>
              <dd>
                0–{a.now} h after the environment switch · {a.training.length}{" "}
                usable readings.
              </dd>
            </div>
            <div>
              <dt>Selected settings</dt>
              <dd>
                Readout target {settings.threshold} RFU; error budget δ ={" "}
                {settings.tolerance} RFU; waiting cost λ = {settings.waitCost} /
                h.
              </dd>
            </div>
            <div>
              <dt>Observed requirement</dt>
              <dd>
                {verdictNames[observed.verdict]}. This checks recorded readings
                and coverage separately from the fitted prediction.
              </dd>
            </div>
            <div>
              <dt>Held-out check</dt>
              <dd>
                {settings.stage !== "verify"
                  ? "Not yet opened. Select Check 4 h to compare with the later readings."
                  : a.holdoutPassed === null
                    ? "Incomplete: the required exact, compatible late readings are unavailable."
                    : a.holdoutPassed
                      ? "Available late readings fall within the selected budget."
                      : "At least one late prediction is outside the selected budget."}
              </dd>
            </div>
            {first && (
              <div>
                <dt>First check in this session</dt>
                <dd>
                  δ = {first.tolerance} RFU;{" "}
                  {first.passed === null
                    ? "incomplete"
                    : firstPassed
                      ? "within budget"
                      : "rejected"}
                  .{" "}
                  {first.tolerance !== settings.tolerance &&
                    "The budget was subsequently changed."}{" "}
                  Reloading a saved run recalculates this check; it is not an
                  immutable experiment log.
                </dd>
              </div>
            )}
            <div>
              <dt>Interpretation</dt>
              <dd>
                The profile envelope is not a confidence interval. The sampling
                score is exploratory. Reporter fluorescence alone does not
                establish cell viability or payload release.
              </dd>
            </div>
          </dl>
          <details className="mt-run-json">
            <summary>Inspect the machine-readable record</summary>
            <pre>{JSON.stringify(runRecord(dataset, settings), null, 2)}</pre>
          </details>
        </div>
      </details>
      <footer className="mt-export">
        <span>
          Core {MODEL_VERSION.split("/")[1]} · k ∈ [{DOMAIN.min}, {DOMAIN.max}]
          h⁻¹
        </span>
        <div>
          <button
            onClick={() =>
              download(
                "mototype-input.csv",
                toCSV(dataset),
                "text/csv;charset=utf-8",
              )
            }
          >
            Export CSV ↓
          </button>
          <button onClick={exportReport}>Report ↓</button>
          <button
            onClick={() =>
              download(
                "mototype-run.json",
                JSON.stringify(runRecord(dataset, settings), null, 2),
                "application/json;charset=utf-8",
              )
            }
          >
            Save run ↓
          </button>
        </div>
      </footer>
    </div>
  );
}
