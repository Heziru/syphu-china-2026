/** Review prototype: descriptive checks on reported readings, never latent biological quantities. */
export type Verdict = "supported" | "conflict" | "indeterminate";
export type Scenario = "supported" | "conflict" | "indeterminate";
export type Observation = {
  id: string;
  sample: string;
  time: number;
  readTime: number;
  value: number | null;
  qualifier: "exact" | "lt" | "gt" | "missing";
  lower: number | null;
  upper: number | null;
  boundKind: "reported_readout" | "reporting_bound";
  unit: string;
  scale: string;
  row: number;
};
export type Dataset = {
  id: string;
  name: string;
  source: "synthetic" | "local";
  rows: Observation[];
  hash: string | null;
  rawCSV?: string;
};
export type Rule = {
  threshold: number;
  eventTime: number;
  start: number;
  end: number;
  offsets: number[];
  tolerance: number;
};
export type Evidence = {
  observation: Observation;
  verdict: Verdict;
  reason: string;
};
export type UnitResult = {
  sample: string;
  verdict: Verdict;
  evidence: Evidence[];
  missing: number[];
  covered: number;
};
export type Result = {
  verdict: Verdict;
  units: UnitResult[];
  count: number;
  reason: string;
};
export type Run = {
  id: string;
  at: string;
  dataset: Dataset;
  rule: Rule;
  result: Result;
  engine: string;
};
export const ENGINE = "mototype-observed/0.1.0";
export const SAMPLES = ["B1", "B2", "B3"];
export const SAMPLE_COLORS = ["#078578", "#6876b8", "#bf862d"];
export const CONSTRUCT = "C-DEMO-r1";
export const SCALE = "reader-demo-01";
export const LABELS: Record<Verdict, string> = {
  supported: "证据支持",
  conflict: "证据冲突",
  indeterminate: "无法判断",
};
export const SCENARIOS: Record<Scenario, string> = {
  supported: "支持示例",
  conflict: "冲突示例",
  indeterminate: "无法判断示例",
};
export const DEFAULT_RULE: Rule = {
  threshold: 100,
  eventTime: 2,
  start: 1,
  end: 4,
  offsets: [1, 2, 4],
  tolerance: 0.1,
};

export function makeDemo(scenario: Scenario): Dataset {
  const times = [0, 1, 2, 3, 4, 6];
  const values = [
    [150, 320, 480, 90, 62, 42],
    [165, 305, 470, 94, 64, 44],
    [155, 315, 490, 92, 60, 45],
  ];
  const rows: Observation[] = SAMPLES.flatMap((sample, s) =>
    times.map((time, i) => ({
      id: sample + "-T" + time,
      sample,
      time,
      readTime: time + 0.05,
      value:
        scenario === "conflict" && s === 1 && time === 4 ? 125 : values[s][i],
      qualifier: "exact" as const,
      lower: null,
      upper: null,
      boundKind: "reported_readout" as const,
      unit: "RFU",
      scale: SCALE,
      row: s * 6 + i + 2,
    })),
  );
  if (scenario === "indeterminate")
    Object.assign(rows[17], {
      value: null,
      qualifier: "lt",
      upper: 120,
      boundKind: "reporting_bound",
    });
  return {
    id: "D-DEMO-" + scenario + "-r1",
    name: SCENARIOS[scenario] + ".csv",
    source: "synthetic",
    rows,
    hash: null,
  };
}

export function showValue(o: Observation): string {
  if (o.qualifier === "missing") return "缺失";
  if (o.qualifier === "lt") return "<" + o.upper;
  if (o.qualifier === "gt") return ">" + o.lower;
  return String(o.value);
}

export function assess(o: Observation, threshold: number): Evidence {
  let verdict: Verdict = "indeterminate";
  let reason = "缺失读数，不能按 0 处理。";
  if (o.unit !== "RFU" || o.scale !== SCALE)
    reason = "单位或设备尺度与要求不一致，不能直接比较。";
  else if (o.qualifier === "exact" && o.value !== null) {
    verdict = o.value <= threshold ? "supported" : "conflict";
    reason =
      showValue(o) +
      " RFU " +
      (verdict === "supported" ? "≤ " : "> ") +
      threshold +
      " RFU。";
  } else if (o.qualifier === "lt" && o.upper !== null) {
    verdict = o.upper <= threshold ? "supported" : "indeterminate";
    reason =
      verdict === "supported"
        ? "报告上界足以支持读数要求；不推断潜在真实量。"
        : "报告范围跨越阈值；不能把上界或未检出当成实际值。";
  } else if (o.qualifier === "gt" && o.lower !== null) {
    verdict = o.lower >= threshold ? "conflict" : "indeterminate";
    reason =
      verdict === "conflict"
        ? "报告读数严格大于下界，与上限要求冲突。"
        : "报告范围不能排除超过阈值。";
  }
  return { observation: o, verdict, reason };
}

export function evaluate(dataset: Dataset, rule: Rule): Result {
  if (
    !Number.isFinite(rule.threshold) ||
    rule.threshold < 0 ||
    rule.threshold > 1000000
  )
    throw new Error("阈值必须是 0—1,000,000 之间的有限数值。");
  const units = SAMPLES.map((sample) => {
    const rows = dataset.rows
      .filter(
        (o) =>
          o.sample === sample &&
          o.time >= rule.eventTime + rule.start &&
          o.time <= rule.eventTime + rule.end,
      )
      .sort((a, b) => a.time - b.time || a.id.localeCompare(b.id));
    const evidence = rows.map((o) => assess(o, rule.threshold));
    const used = new Set<string>();
    // Fixed review sampling slots are disjoint (1, 2, 4 h ±0.1 h). This nearest match is valid for this supported contract only.
    const missing = rule.offsets.filter((offset) => {
      const candidates = rows.filter(
        (o) =>
          o.qualifier !== "missing" &&
          !used.has(o.id) &&
          Math.abs(o.time - rule.eventTime - offset) <= rule.tolerance + 1e-9,
      );
      candidates.sort(
        (a, b) =>
          Math.abs(a.time - rule.eventTime - offset) -
            Math.abs(b.time - rule.eventTime - offset) ||
          a.id.localeCompare(b.id),
      );
      if (!candidates.length) return true;
      used.add(candidates[0].id);
      return false;
    });
    const verdict: Verdict = evidence.some((e) => e.verdict === "conflict")
      ? "conflict"
      : evidence.length > 0 &&
          !missing.length &&
          evidence.every((e) => e.verdict === "supported")
        ? "supported"
        : "indeterminate";
    return {
      sample,
      verdict,
      evidence,
      missing,
      covered: rule.offsets.length - missing.length,
    };
  });
  const verdict: Verdict = units.some((u) => u.verdict === "conflict")
    ? "conflict"
    : units.every((u) => u.verdict === "supported")
      ? "supported"
      : "indeterminate";
  const count = units.reduce((sum, u) => sum + u.evidence.length, 0);
  const conflict = units
    .flatMap((u) => u.evidence)
    .find((e) => e.verdict === "conflict");
  const unknown = units
    .flatMap((u) => u.evidence)
    .find((e) => e.verdict === "indeterminate");
  const reason = conflict
    ? conflict.observation.sample +
      " 在切换后 " +
      Number((conflict.observation.time - rule.eventTime).toFixed(4)) +
      " h 报告 " +
      showValue(conflict.observation) +
      " RFU，与上限 " +
      rule.threshold +
      " RFU 冲突。"
    : verdict === "supported"
      ? "3 个生物重复的 " +
        count +
        " 个窗口内读数均符合要求，计划时点覆盖完整。"
      : unknown
        ? unknown.observation.sample +
          " 的读数为 " +
          showValue(unknown.observation) +
          "。" +
          unknown.reason
        : "计划时点存在覆盖缺口，需要补充对应生物重复的观测。";
  return { verdict, units, count, reason };
}

export function makeRun(
  dataset: Dataset,
  rule: Rule,
  id: string,
  at: string,
): Run {
  const frozenDataset = structuredClone(dataset),
    frozenRule = structuredClone(rule);
  return {
    id,
    at,
    dataset: frozenDataset,
    rule: frozenRule,
    result: evaluate(frozenDataset, frozenRule),
    engine: ENGINE,
  };
}

export const CSV_HEADERS = [
  "observation_id",
  "sample_id",
  "observable_id",
  "time_sample",
  "time_read",
  "time_unit",
  "value",
  "qualifier",
  "lower",
  "upper",
  "lower_closed",
  "upper_closed",
  "bound_kind",
  "unit",
  "scale_id",
  "source_row",
];
const safeCell = (v: string | number | null | undefined) => {
  let s = v === null || v === undefined ? "" : String(v);
  if (/^[=+@\-\t\r]/.test(s)) s = "'" + s;
  return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};
export function toCSV(dataset: Dataset): string {
  return (
    CSV_HEADERS.join(",") +
    "\r\n" +
    dataset.rows
      .map((o) =>
        [
          o.id,
          o.sample,
          "reporter_readout",
          o.time,
          o.readTime,
          "h",
          o.value,
          o.qualifier,
          o.lower,
          o.upper,
          o.qualifier === "gt" ? "false" : "",
          o.qualifier === "lt" ? "false" : "",
          o.boundKind,
          o.unit,
          o.scale,
          o.row,
        ]
          .map(safeCell)
          .join(","),
      )
      .join("\r\n")
  );
}

function csvRecords(text: string): { cells: string[]; line: number }[] {
  const rows: { cells: string[]; line: number }[] = [];
  let fields: string[] = [],
    field = "",
    quoted = false,
    endedQuote = false,
    line = 1,
    start = 1;
  text = text.replace(/^\uFEFF/, "");
  for (let i = 0; i <= text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === undefined)
        throw new Error("Line " + start + ": unclosed quotation mark.");
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') {
        quoted = false;
        endedQuote = true;
      } else {
        field += c;
        if (c === "\n") line++;
      }
    } else if (c === '"') {
      if (field || endedQuote)
        throw new Error("Line " + line + ": invalid quotation mark.");
      quoted = true;
    } else if (c === "," || c === "\r" || c === "\n" || c === undefined) {
      fields.push(field);
      field = "";
      endedQuote = false;
      if (c !== ",") {
        if (fields.some((v) => v.trim()))
          rows.push({ cells: fields, line: start });
        fields = [];
        if (c === "\r" && text[i + 1] === "\n") i++;
        line++;
        start = line;
      }
    } else {
      if (endedQuote)
        throw new Error(
          "Line " + line + ": unexpected characters after a closing quote.",
        );
      field += c;
    }
  }
  return rows;
}

export function parseCSV(text: string): Observation[] {
  if (new TextEncoder().encode(text).length > 2 * 1024 * 1024)
    throw new Error("CSV input is limited to 2 MiB.");
  const records = csvRecords(text);
  if (records.length < 2)
    throw new Error("CSV requires a header and at least one data row.");
  if (records.length > 10001)
    throw new Error("At most 10,000 observations are supported.");
  const headers = records[0].cells.map((h) => h.trim());
  if (new Set(headers).size !== headers.length)
    throw new Error("CSV contains duplicate column names.");
  const missing = CSV_HEADERS.filter((h) => !headers.includes(h));
  if (missing.length)
    throw new Error("Missing required columns: " + missing.join("、"));
  const extras = headers.filter((h) => !CSV_HEADERS.includes(h));
  if (extras.length)
    throw new Error(
      "Unsupported additional columns: " +
        extras.join("、") +
        ". Use the template; extra metadata is not silently discarded.",
    );
  const ids = new Set<string>(),
    moments = new Set<string>();
  return records.slice(1).map(({ cells, line }) => {
    const fail = (message: string): never => {
      throw new Error("Line " + line + ": " + message);
    };
    if (cells.length !== headers.length)
      fail("The field count does not match the header.");
    const row = Object.fromEntries(headers.map((h, i) => [h, cells[i].trim()]));
    const number = (key: string, required = true): number | null => {
      if (!row[key]) return required ? fail(key + " must not be empty.") : null;
      if (
        !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(row[key]) ||
        !Number.isFinite(Number(row[key]))
      )
        fail(key + " must be a finite number.");
      return Number(row[key]);
    };
    if (!/^[A-Za-z0-9][A-Za-z0-9._:-]{0,79}$/.test(row.observation_id))
      fail(
        "observation_id must use letters, digits or . _ : - and be at most 80 characters.",
      );
    if (ids.has(row.observation_id)) fail("Duplicate observation_id.");
    ids.add(row.observation_id);
    if (!SAMPLES.includes(row.sample_id))
      fail(
        "Only B1, B2 and B3 are supported, mapped to C-DEMO-r1 and ENV-DEMO-01.",
      );
    if (row.observable_id !== "reporter_readout")
      fail("observable_id must be reporter_readout.");
    if (!["h", "min"].includes(row.time_unit))
      fail("time_unit must be h or min.");
    const factor = row.time_unit === "min" ? 1 / 60 : 1;
    const time = number("time_sample")! * factor,
      readTime = number("time_read")! * factor;
    if (time < 0 || time > 6)
      fail("Sampling times must be 0–6 h after the experimental start.");
    if (readTime < time) fail("Read time must not precede sample time.");
    const moment = row.sample_id + "/" + time;
    if (moments.has(moment))
      fail(
        "Duplicate sample time for a biological replicate; technical replicates are not aggregated.",
      );
    moments.add(moment);
    if (!["exact", "lt", "gt", "missing"].includes(row.qualifier))
      fail(
        "qualifier must be exact, lt, gt or missing. Statistical intervals are not supported.",
      );
    const q = row.qualifier as Observation["qualifier"];
    const value = number("value", false),
      lower = number("lower", false),
      upper = number("upper", false);
    if (
      q === "exact" &&
      (value === null ||
        lower !== null ||
        upper !== null ||
        row.lower_closed ||
        row.upper_closed ||
        row.bound_kind !== "reported_readout")
    )
      fail(
        "exact requires value and reported_readout; bound fields must be empty.",
      );
    if (
      q === "missing" &&
      (value !== null ||
        lower !== null ||
        upper !== null ||
        row.lower_closed ||
        row.upper_closed ||
        row.bound_kind !== "reported_readout")
    )
      fail(
        "missing requires empty value and bounds, and bound_kind reported_readout.",
      );
    if (
      q === "lt" &&
      (value !== null ||
        lower !== null ||
        upper === null ||
        row.upper_closed !== "false" ||
        row.lower_closed ||
        row.bound_kind !== "reporting_bound")
    )
      fail(
        "lt requires upper, upper_closed=false and reporting_bound; other value and bound fields must be empty.",
      );
    if (
      q === "gt" &&
      (value !== null ||
        upper !== null ||
        lower === null ||
        row.lower_closed !== "false" ||
        row.upper_closed ||
        row.bound_kind !== "reporting_bound")
    )
      fail(
        "gt requires lower, lower_closed=false and reporting_bound; other value and bound fields must be empty.",
      );
    if ([value, lower, upper].some((v) => v !== null && (v < 0 || v > 1000000)))
      fail("Uncorrected readings and bounds must be between 0 and 1,000,000.");
    if (q === "lt" && upper === 0)
      fail("Readings are nonnegative; a strict bound below zero is empty.");
    if (
      !row.unit ||
      !row.scale_id ||
      row.unit.length > 30 ||
      row.scale_id.length > 80
    )
      fail("unit and scale_id are required and must fit their length limits.");
    if (
      row.source_row &&
      (!Number.isInteger(number("source_row")) || Number(row.source_row) < 1)
    )
      fail("source_row must be a positive integer or empty.");
    return {
      id: row.observation_id,
      sample: row.sample_id,
      time,
      readTime,
      value,
      qualifier: q,
      lower,
      upper,
      boundKind: row.bound_kind as Observation["boundKind"],
      unit: row.unit,
      scale: row.scale_id,
      row: line,
    };
  });
}

export const escapeHTML = (s: unknown) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
export function reportHTML(run: Run): string {
  const esc = escapeHTML;
  return (
    '<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Mototype · ' +
    esc(run.id) +
    '</title><style>body{font-family:system-ui,sans-serif;max-width:960px;margin:48px auto;padding:24px;color:#17343f;line-height:1.8}h1{color:#087f73}table{border-collapse:collapse;width:100%;font-size:14px}th,td{text-align:left;border-bottom:1px solid #ddd;padding:8px}code{overflow-wrap:anywhere}.note{background:#eef6f5;padding:16px} @media print{body{margin:0}}</style><h1>Mototype Studio · 观测证据报告</h1><p class="note">' +
    (run.dataset.source === "synthetic"
      ? "合成演示数据；不是本队实验结果。"
      : "浏览器本地导入数据；身份与环境绑定为用户确认的演示约定，未经独立验证。") +
    "</p><h2>" +
    esc(LABELS[run.result.verdict]) +
    "</h2><p>" +
    esc(run.result.reason) +
    "</p><p>范围：仅适用于 B1、B2、B3 的指定观测时点，不代表整个时间窗持续满足，也不推断目标蛋白、活菌数量或生物安全。</p><h2>固定要求与身份</h2><p>构建体 C-DEMO-r1；环境 ENV-DEMO-01（人工执行记录），切换于实验时间 2 h；报告荧光 RFU / reader-demo-01。</p><p>切换后 1—4 h 所有已观测读数 ≤ " +
    esc(run.rule.threshold) +
    " RFU；覆盖 1、2、4 h，容差 ±0.1 h；每个生物重复均须满足。阈值来源：演示设置。</p><p>数据集：" +
    esc(run.dataset.name) +
    " · " +
    esc(run.dataset.id) +
    "<br>运行：" +
    esc(run.id) +
    " / " +
    esc(run.at) +
    "<br>计算版本：" +
    esc(run.engine) +
    "<br>原始 CSV SHA-256：<code>" +
    esc(run.dataset.hash ?? "内置固定合成示例；以项目快照内容为准") +
    "</code></p><h2>逐重复结论</h2><ul>" +
    run.result.units
      .map(
        (u) =>
          "<li>" +
          esc(u.sample) +
          "：" +
          esc(LABELS[u.verdict]) +
          "；覆盖 " +
          u.covered +
          "/3；缺口 " +
          esc(u.missing.join("、") || "无") +
          "</li>",
      )
      .join("") +
    "</ul><h2>窗口内判定证据</h2><table><thead><tr><th>观测 / 原始行</th><th>生物重复</th><th>采样 / h</th><th>报告读数</th><th>结论与依据</th></tr></thead><tbody>" +
    run.result.units
      .flatMap((u) => u.evidence)
      .map(
        (e) =>
          "<tr><td>" +
          esc(e.observation.id) +
          " / " +
          e.observation.row +
          "</td><td>" +
          esc(e.observation.sample) +
          "</td><td>" +
          esc(e.observation.time) +
          "</td><td>" +
          esc(showValue(e.observation)) +
          " " +
          esc(e.observation.unit) +
          "</td><td>" +
          esc(LABELS[e.verdict]) +
          "：" +
          esc(e.reason) +
          "</td></tr>",
      )
      .join("") +
    "</tbody></table><p>未执行背景扣除、模型拟合、置信区间推断或真实序列解析。本报告由网页审阅版生成。</p></html>"
  );
}
