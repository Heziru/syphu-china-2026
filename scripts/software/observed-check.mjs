import assert from "node:assert/strict";
import {
  makeDemo,
  evaluate,
  parseCSV,
  toCSV,
  makeRun,
  reportHTML,
  DEFAULT_RULE,
} from "../../src/contents/software/engine/mototype.ts";

let checks = 0;
function check(name, fn) {
  fn();
  checks++;
  process.stdout.write("✓ " + name + "\n");
}
function change(o) {
  const d = makeDemo("supported");
  Object.assign(d.rows[17], o);
  return d;
}
const run = (d) => evaluate(d, DEFAULT_RULE);

for (const verdict of ["supported", "conflict", "indeterminate"])
  check("independent reference scenario: " + verdict, () =>
    assert.equal(run(makeDemo(verdict)).verdict, verdict),
  );
check("all biological units remain separate", () =>
  assert.deepEqual(
    run(makeDemo("conflict")).units.map((u) => u.verdict),
    ["supported", "conflict", "supported"],
  ),
);
check("threshold equality is inclusive, no display rounding", () => {
  assert.equal(run(change({ value: 100 })).verdict, "supported");
  assert.equal(run(change({ value: 100.001 })).verdict, "conflict");
});
check("reported strict bounds retain their semantics", () => {
  assert.equal(
    run(
      change({
        qualifier: "lt",
        value: null,
        upper: 100,
        boundKind: "reporting_bound",
      }),
    ).verdict,
    "supported",
  );
  assert.equal(
    run(
      change({
        qualifier: "gt",
        value: null,
        lower: 100,
        boundKind: "reporting_bound",
      }),
    ).verdict,
    "conflict",
  );
  assert.equal(run(makeDemo("indeterminate")).verdict, "indeterminate");
});
check("missing is not zero", () => {
  assert.equal(
    run(change({ qualifier: "missing", value: null })).verdict,
    "indeterminate",
  );
  assert.equal(run(change({ value: 0 })).verdict, "supported");
  assert.deepEqual(
    run(change({ qualifier: "missing", value: null })).units[2].missing,
    [4],
  );
});
check("empty data cannot pass", () =>
  assert.equal(
    run({ ...makeDemo("supported"), rows: [] }).verdict,
    "indeterminate",
  ),
);
check("out-of-plan conflict cannot be hidden", () => {
  const d = makeDemo("supported");
  d.rows.push({
    ...d.rows[4],
    id: "extra",
    time: 4.5,
    readTime: 4.55,
    value: 110,
  });
  assert.equal(run(d).verdict, "conflict");
});
check("an existing conflict wins over separate missing coverage", () => {
  const d = makeDemo("conflict");
  d.rows.pop();
  assert.equal(run(d).verdict, "conflict");
  assert.deepEqual(run(d).units[2].missing, [4]);
});
check("sample time, not reading time, determines scope", () => {
  const d = makeDemo("supported");
  d.rows.forEach((o) => (o.readTime += 24));
  assert.equal(run(d).verdict, "supported");
});
check("tolerance does not expand the actual window", () => {
  assert.equal(run(change({ time: 5.95 })).verdict, "supported");
  const d = makeDemo("supported");
  d.rows[3].time = 2.95;
  assert.equal(run(d).verdict, "indeterminate");
});
check("unit and scale mismatches cannot support", () => {
  assert.equal(
    run(change({ scale: "different-reader" })).verdict,
    "indeterminate",
  );
  assert.equal(run(change({ unit: "a.u." })).verdict, "indeterminate");
});
check("CSV round-trip, UTF-8 BOM, quoted headers, CRLF", () => {
  const d = makeDemo("indeterminate");
  const csv =
    "\uFEFF" + toCSV(d).replace("observation_id,", '"observation_id",');
  assert.deepEqual(parseCSV(csv), d.rows);
});
check("minutes normalize to hours", () => {
  const rows = toCSV(makeDemo("supported"))
    .split("\r\n")
    .map((line, i) => {
      if (!i) return line;
      const c = line.split(",");
      c[3] = String(Number(c[3]) * 60);
      c[4] = String(Number(c[4]) * 60);
      c[5] = "min";
      return c.join(",");
    });
  assert.equal(
    run({ ...makeDemo("supported"), rows: parseCSV(rows.join("\r\n")) })
      .verdict,
    "supported",
  );
});
check("parser refuses all partial/ambiguous imports", () => {
  const csv = toCSV(makeDemo("supported")),
    line = csv.split("\r\n")[1];
  for (const bad of [
    csv + "\r\n" + line,
    csv.replace("B1-T0,B1", "B1-T0,B9"),
    csv.replace(",150,exact", ",NaN,exact"),
    csv.replace(",150,exact", ",Infinity,exact"),
    csv.replace(",150,exact", ",12abc,exact"),
    csv.replace(",150,exact", ",,exact"),
    csv.replace(",150,exact", ",0,missing"),
    csv.replace("source_row", "extra_field"),
    csv.replace("reported_readout", "confidence_interval"),
    csv.replace("B1-T0", '"B1-T0'),
  ])
    assert.throws(() => parseCSV(bad));
});
check("unknown bound cannot be smuggled in as exact data", () => {
  const csv = toCSV(makeDemo("indeterminate"));
  assert.throws(() =>
    parseCSV(csv.replace("false,reporting_bound", "true,reporting_bound")),
  );
});
check(
  "same-time duplicate biology is not a technical replicate shortcut",
  () => {
    const d = makeDemo("supported");
    d.rows[1].time = 0;
    assert.throws(() => parseCSV(toCSV(d)), /technical replicates/);
  },
);
check("run snapshot stays fixed when draft changes", () => {
  const d = makeDemo("supported"),
    rule = structuredClone(DEFAULT_RULE);
  const snapshot = makeRun(d, rule, "test", "frozen");
  d.rows[3].value = 500;
  rule.threshold = 1;
  assert.equal(snapshot.result.verdict, "supported");
  assert.equal(snapshot.rule.threshold, 100);
  assert.equal(snapshot.dataset.rows[3].value, 90);
});
check("report includes escaped user text and frozen evidence", () => {
  const d = makeDemo("conflict");
  d.name = "<script>alert(1)</script>.csv";
  const html = reportHTML(makeRun(d, DEFAULT_RULE, "test", "fixed"));
  assert.ok(!html.includes("<script>"));
  assert.ok(html.includes("&lt;script&gt;"));
  assert.ok(html.includes("B2-T4"));
  assert.ok(html.includes("125"));
  assert.ok(html.includes("证据冲突"));
});
check("invalid threshold is an error, not indeterminate science", () =>
  assert.throws(() =>
    evaluate(makeDemo("supported"), { ...DEFAULT_RULE, threshold: NaN }),
  ),
);
process.stdout.write("\n" + checks + " checks passed.\n");
