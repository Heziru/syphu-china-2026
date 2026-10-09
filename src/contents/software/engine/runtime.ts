import {
  analyzeKinetics,
  MODEL_VERSION,
  makeKineticDemo,
  type ModelSettings,
  type ModelAnalysis,
} from "./kinetics.ts";
import {
  makeDemo,
  parseCSV,
  toCSV,
  evaluate,
  DEFAULT_RULE,
  type Dataset,
} from "./mototype.ts";
export const SNAPSHOT_SCHEMA = "mototype-run/1";
export const defaults: ModelSettings = {
  stage: "early",
  threshold: 100,
  tolerance: 5,
  waitCost: 0.15,
};
export function example(which: string): Dataset {
  const data =
    which === "decay"
      ? makeKineticDemo()
      : makeDemo(which === "limit" ? "indeterminate" : "supported");
  return {
    ...data,
    name:
      which === "decay"
        ? "synthetic-decay.csv"
        : which === "limit"
          ? "reporting-limit.csv"
          : "model-mismatch.csv",
  };
}
export function statusText(
  a: ModelAnalysis,
  settings: ModelSettings,
): { title: string; detail: string; kind: string } {
  if (a.state === "blocked")
    return {
      title: "Analysis paused",
      detail: a.best
        ? "The fixed rate grid is too coarse for this signal scale and error budget. No sampling score is returned."
        : "Provide at least two distinct post-switch times for each of B1–B3, with exact readings in RFU / reader-demo-01. Censored, missing or incompatible training records pause the fit.",
      kind: "pending",
    };
  if (a.best!.rmse > settings.tolerance)
    return {
      title: "Training fit rejected",
      detail:
        "The fitted curve exceeds the selected training error budget. Dynamic parameters and sampling advice are withheld.",
      kind: "fail",
    };
  if (settings.stage === "verify") {
    if (a.holdoutPassed === null)
      return {
        title: "Holdout check incomplete",
        detail:
          "Each replicate must have a reading at 4 h ± 0.1 h after the switch. All late readings must be exact and on the same scale.",
        kind: "pending",
      };
    if (a.holdoutPassed === false)
      return {
        title: "Prediction rejected",
        detail:
          "At least one unseen reading falls outside the selected error budget. A good early fit did not predict the later response.",
        kind: "fail",
      };
    return {
      title: "Within the holdout budget",
      detail:
        "All available late readings meet the selected error budget for this dataset. This numerical check does not establish biological validity.",
      kind: "pass",
    };
  }
  return a.constrained
    ? {
        title: "Ready for a holdout check",
        detail:
          "The scanned rates pass a provisional range check. The 4 h readings have not been used in fitting.",
        kind: "ready",
      }
    : {
        title: "More than one explanation fits",
        detail:
          "Different residual plateaus and decay rates explain the early readings. The shaded profile envelope is not a confidence interval.",
        kind: "pending",
      };
}
export function runRecord(dataset: Dataset, settings: ModelSettings) {
  const analysis = analyzeKinetics(dataset, settings);
  return {
    schema: SNAPSHOT_SCHEMA,
    engine: MODEL_VERSION,
    createdAt: new Date().toISOString(),
    input: {
      name: dataset.name,
      source: dataset.source,
      csv: dataset.rawCSV ?? toCSV(dataset),
      hash: dataset.hash,
    },
    settings,
    analysis,
    observed: evaluate(dataset, {
      ...DEFAULT_RULE,
      threshold: settings.threshold,
    }),
    scope: {
      environmentSwitchHours: 2,
      replicates: ["B1", "B2", "B3"],
      readout: "reporter_readout",
      unit: "RFU",
      scale: "reader-demo-01",
      warning:
        "Exploratory empirical model. Profile envelope is not a confidence interval; candidate fractions are not probabilities.",
    },
  };
}
export function restoreRecord(value: unknown): {
  dataset: Dataset;
  settings: ModelSettings;
} {
  if (!value || typeof value !== "object")
    throw new Error("Not a Mototype run record.");
  const r = value as ReturnType<typeof runRecord>;
  if (
    r.schema !== SNAPSHOT_SCHEMA ||
    r.engine !== MODEL_VERSION ||
    !r.input ||
    typeof r.input.csv !== "string" ||
    !r.settings
  )
    throw new Error("Unsupported record schema or engine version.");
  const s = r.settings;
  if (
    !["early", "learn", "verify"].includes(s.stage) ||
    ![s.threshold, s.tolerance, s.waitCost].every(Number.isFinite) ||
    s.threshold < 0 ||
    s.threshold > 1e6 ||
    s.tolerance < 1 ||
    s.tolerance > 20 ||
    s.waitCost < 0 ||
    s.waitCost > 1
  )
    throw new Error(
      "The saved settings are outside this workbench's supported range.",
    );
  if (
    typeof r.input.name !== "string" ||
    r.input.name.length > 240 ||
    !["local", "synthetic"].includes(r.input.source)
  )
    throw new Error("Invalid input metadata.");
  if (
    !r.scope ||
    r.scope.environmentSwitchHours !== 2 ||
    JSON.stringify(r.scope.replicates) !== JSON.stringify(["B1", "B2", "B3"]) ||
    r.scope.readout !== "reporter_readout" ||
    r.scope.unit !== "RFU" ||
    r.scope.scale !== "reader-demo-01"
  )
    throw new Error(
      "The saved environment, replicate or measurement context does not match this workbench.",
    );
  // Reparse inputs and recompute results; imported cached analysis is never trusted.
  const rows = parseCSV(r.input.csv);
  const dataset: Dataset = {
    id: "restored-" + Date.now(),
    name: r.input.name,
    source: r.input.source,
    rows,
    hash: null,
    rawCSV: r.input.csv,
  };
  const settings: ModelSettings = {
    stage: s.stage,
    threshold: s.threshold,
    tolerance: s.tolerance,
    waitCost: s.waitCost,
  };
  // Revealing a saved holdout establishes a fresh first check before any edits.
  if (settings.stage === "verify") {
    const analysis = analyzeKinetics(dataset, settings);
    settings.firstCheck = {
      datasetId: dataset.id,
      tolerance: settings.tolerance,
      trainingRmse: analysis.best?.rmse ?? null,
      passed: analysis.holdoutPassed,
    };
  }
  return { dataset, settings };
}
