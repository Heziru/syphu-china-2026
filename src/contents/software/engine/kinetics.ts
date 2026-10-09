import { makeDemo, SAMPLES, SCALE, type Dataset } from "./mototype.ts";

export const MODEL_VERSION = "mototype-kinetics/0.2.0";
export const DOMAIN = { min: 0.001, max: 10, grid: 401 };
export type Stage = "early" | "learn" | "verify";
export type ModelSettings = {
  stage: Stage;
  threshold: number;
  tolerance: number;
  waitCost: number;
  firstCheck?: {
    datasetId: string;
    tolerance: number;
    trainingRmse: number | null;
    passed: boolean | null;
  };
};
export type Point = { t: number; y: number; sample: string; id: string };
export type UnitParameters = {
  sample: string;
  floor: number;
  amplitude: number;
  sse: number;
};
export type Candidate = { k: number; units: UnitParameters[]; rmse: number };
export type SamplingScore = {
  time: number;
  spread: number;
  score: number;
  fractions: number[];
};
export type ModelAnalysis = {
  state: "ready" | "blocked";
  reason: string;
  training: Point[];
  holdout: Point[];
  profile: Candidate[];
  compatible: Candidate[];
  best: Candidate | null;
  boundary: boolean;
  constrained: boolean;
  holdoutPassed: boolean | null;
  residuals: {
    sample: string;
    t: number;
    predicted: number;
    observed: number;
    error: number;
  }[];
  scores: SamplingScore[];
  recommended: SamplingScore | null;
  now: number;
};
export function makeKineticDemo(): Dataset {
  const source = makeDemo("supported");
  const floors = [36, 40, 44],
    amplitudes = [420, 440, 460];
  return {
    id: "D-KINETICS-v1",
    name: "经验衰减 · 无噪声合成示例.csv",
    source: "synthetic",
    hash: null,
    rows: source.rows
      .filter((o) => o.time >= 2)
      .map((o) => {
        const r = SAMPLES.indexOf(o.sample);
        return {
          ...o,
          value: floors[r] + amplitudes[r] * Math.exp(-Math.LN2 * (o.time - 2)),
        };
      })
      .map((o, i) => ({ ...o, row: i + 2 })),
  };
}

/** Exact two-variable nonnegative least squares at a fixed decay rate. */
export function fitUnit(
  points: Point[],
  k: number,
  sample: string,
): UnitParameters {
  const n = points.length;
  const x = points.map((p) => Math.exp(-k * p.t));
  const sx = x.reduce((a, b) => a + b, 0),
    sy = points.reduce((a, p) => a + p.y, 0);
  const sxx = x.reduce((a, b) => a + b * b, 0),
    sxy = x.reduce((a, b, i) => a + b * points[i].y, 0);
  const options = [
    { floor: Math.max(0, sy / n), amplitude: 0 },
    { floor: 0, amplitude: Math.max(0, sxy / sxx) },
  ];
  const det = n * sxx - sx * sx;
  if (det > 1e-12) {
    const amplitude = (n * sxy - sx * sy) / det,
      floor = (sy - amplitude * sx) / n;
    if (amplitude >= 0 && floor >= 0) options.push({ floor, amplitude });
  }
  return options
    .map((p) => ({
      ...p,
      sample,
      sse: points.reduce(
        (sum, o, i) => sum + (o.y - p.floor - p.amplitude * x[i]) ** 2,
        0,
      ),
    }))
    .sort((a, b) => a.sse - b.sse)[0];
}
export function predict(
  model: Candidate,
  sample: string,
  time: number,
): number {
  const u = model.units.find((p) => p.sample === sample);
  if (!u) throw new Error("模型缺少生物重复 " + sample);
  return u.floor + u.amplitude * Math.exp(-model.k * time);
}
export function profileFit(points: Point[]): {
  profile: Candidate[];
  best: Candidate;
} {
  const at = (logK: number): Candidate => {
    const k = Math.exp(logK),
      units = SAMPLES.map((s) =>
        fitUnit(
          points.filter((p) => p.sample === s),
          k,
          s,
        ),
      );
    return {
      k,
      units,
      rmse: Math.sqrt(units.reduce((sum, p) => sum + p.sse, 0) / points.length),
    };
  };
  const lo = Math.log(DOMAIN.min),
    hi = Math.log(DOMAIN.max),
    step = (hi - lo) / (DOMAIN.grid - 1);
  const profile = Array.from({ length: DOMAIN.grid }, (_, i) =>
    at(lo + i * step),
  );
  let best = profile.reduce((a, b) => (a.rmse <= b.rmse ? a : b));
  let a = Math.max(lo, Math.log(best.k) - step),
    b = Math.min(hi, Math.log(best.k) + step);
  const phi = (Math.sqrt(5) - 1) / 2;
  let c = b - phi * (b - a),
    d = a + phi * (b - a),
    fc = at(c),
    fd = at(d);
  for (let i = 0; i < 65; i++) {
    if (fc.rmse < fd.rmse) {
      b = d;
      d = c;
      fd = fc;
      c = b - phi * (b - a);
      fc = at(c);
    } else {
      a = c;
      c = d;
      fc = fd;
      d = a + phi * (b - a);
      fd = at(d);
    }
  }
  const refined = at((a + b) / 2);
  if (refined.rmse < best.rmse) best = refined;
  // Refine the optimum, but sample candidate weights only on the published log grid.
  return { profile, best };
}

/** Proposed heuristic, not a probability or an information-gain estimate. */
export function scoreTime(
  models: Candidate[],
  t: number,
  now: number,
  threshold: number,
  resolution: number,
  waitCost: number,
): SamplingScore {
  if (
    !models.length ||
    ![t, now, threshold, resolution, waitCost].every(Number.isFinite) ||
    resolution <= 0 ||
    waitCost < 0 ||
    t <= now
  )
    throw new Error(
      "采样时点必须晚于当前时刻；分辨尺度须为正，等待成本须非负。",
    );
  let spread = 0,
    score = 0;
  const fractions = SAMPLES.map((s) => {
    const values = models.map((m) => predict(m, s, t)),
      range = Math.max(...values) - Math.min(...values);
    const p = values.filter((v) => v <= threshold).length / values.length;
    spread += range / 3;
    score +=
      (range >= resolution ? (range / resolution) * 4 * p * (1 - p) : 0) / 3;
    return p;
  });
  return {
    time: t,
    spread,
    score: score / (1 + waitCost * (t - now)),
    fractions,
  };
}
export function crossingTime(
  model: Candidate,
  sample: string,
  threshold: number,
): number | null {
  const u = model.units.find((p) => p.sample === sample)!;
  if (u.floor + u.amplitude <= threshold) return 0;
  if (u.floor >= threshold) return null;
  return -Math.log((threshold - u.floor) / u.amplitude) / model.k;
}

export function analyzeKinetics(
  dataset: Dataset,
  settings: ModelSettings,
): ModelAnalysis {
  const now = settings.stage === "early" ? 1 : 2;
  const empty: ModelAnalysis = {
    state: "blocked",
    reason: "",
    training: [],
    holdout: [],
    profile: [],
    compatible: [],
    best: null,
    boundary: false,
    constrained: false,
    holdoutPassed: null,
    residuals: [],
    scores: [],
    recommended: null,
    now,
  };
  if (
    ![settings.threshold, settings.tolerance, settings.waitCost].every(
      Number.isFinite,
    ) ||
    settings.threshold < 0 ||
    settings.tolerance <= 0 ||
    settings.waitCost < 0
  )
    return {
      ...empty,
      reason: "请设置有效的阈值、正的误差预算与非负等待成本。",
    };
  const relevant = dataset.rows.filter((o) => o.time >= 2 && o.time <= 2 + now);
  // Only training data are checked and fitted. Hidden late readings cannot influence early candidates.
  if (relevant.length > 1500)
    return {
      ...empty,
      reason: "交互建模暂限 1,500 条训练记录；未抽样丢弃数据。",
    };
  if (
    relevant.some(
      (o) =>
        o.unit !== "RFU" ||
        o.scale !== SCALE ||
        o.qualifier !== "exact" ||
        o.value === null,
    )
  )
    return {
      ...empty,
      reason:
        "训练数据含缺失、报告界限或不同尺度，当前经验拟合暂停。原始记录仍可在观测页核对。",
    };
  const training: Point[] = relevant.map((o) => ({
    t: o.time - 2,
    y: o.value!,
    sample: o.sample,
    id: o.id,
  }));
  if (
    SAMPLES.some(
      (s) =>
        new Set(training.filter((p) => p.sample === s).map((p) => p.t)).size <
        2,
    )
  )
    return {
      ...empty,
      reason: "每个生物重复至少需要两个不同的环境切换后时点。",
    };
  const { profile, best } = profileFit(training);
  const compatible = profile.filter(
    (p) => p.rmse <= best.rmse + settings.tolerance,
  );
  if (!compatible.length)
    return {
      ...empty,
      training,
      profile,
      best,
      reason:
        "当前网格没有捕获足够接近最优解的候选；数值分辨率不足，暂停参数范围与采样评分。",
    };
  const boundary = compatible.some(
    (p) => p.k <= DOMAIN.min * 1.00001 || p.k >= DOMAIN.max * 0.99999,
  );
  const kLo = Math.min(...compatible.map((m) => m.k)),
    kHi = Math.max(...compatible.map((m) => m.k));
  const constrained =
    SAMPLES.every(
      (s) =>
        new Set(training.filter((p) => p.sample === s).map((p) => p.t)).size >=
        3,
    ) &&
    !boundary &&
    kHi / kLo < 3 &&
    best.units.every((u) => u.amplitude > settings.tolerance);
  const late = dataset.rows.filter((o) => o.time > 2 + now);
  const checked = late.filter(
    (o) =>
      o.qualifier === "exact" &&
      o.value !== null &&
      o.unit === "RFU" &&
      o.scale === SCALE,
  );
  const holdout: Point[] =
    settings.stage === "verify"
      ? checked.map((o) => ({
          t: o.time - 2,
          y: o.value!,
          sample: o.sample,
          id: o.id,
        }))
      : [];
  const residuals = holdout.map((p) => {
    const predicted = predict(best, p.sample, p.t);
    return {
      sample: p.sample,
      t: p.t,
      predicted,
      observed: p.y,
      error: predicted - p.y,
    };
  });
  const holdoutComplete =
    late.length > 0 &&
    checked.length === late.length &&
    SAMPLES.every((s) =>
      checked.some((o) => o.sample === s && Math.abs(o.time - 6) <= 0.1 + 1e-9),
    );
  const holdoutPassed =
    settings.stage === "verify"
      ? holdoutComplete
        ? residuals.every((r) => Math.abs(r.error) <= settings.tolerance)
        : null
      : null;
  const scores = [2, 3, 4]
    .filter((t) => t > now)
    .map((t) =>
      scoreTime(
        compatible,
        t,
        now,
        settings.threshold,
        settings.tolerance,
        settings.waitCost,
      ),
    );
  const recommended =
    settings.stage === "verify" || best.rmse > settings.tolerance
      ? null
      : ([...scores].sort(
          (a, b) => b.score - a.score || b.spread - a.spread || a.time - b.time,
        )[0] ?? null);
  const reason =
    best.rmse > settings.tolerance
      ? "训练拟合误差超过预算；当前模型不能充分解释已给读数。"
      : holdoutPassed === false
        ? "后期读数与早期模型预测不一致，外推检验未通过。"
        : settings.stage === "verify" && holdoutPassed === null
          ? "后期证据含缺失、报告界限，或未覆盖每个重复的切换后 4 h ±0.1 h；尚不能完成本次检验。"
          : holdoutPassed === true
            ? "留出的后期读数落在演示误差预算内；这只是本例的外推检查。"
            : !constrained
              ? "多组平台与衰减率都能解释现有读数，尚不能给出唯一动态参数。"
              : "扫描候选通过本轮范围检查，仍需留出数据检验；这不是参数可辨识性的证明。";
  return {
    state: "ready",
    reason,
    training,
    holdout,
    profile,
    compatible,
    best,
    boundary,
    constrained,
    holdoutPassed,
    residuals,
    scores,
    recommended,
    now,
  };
}
