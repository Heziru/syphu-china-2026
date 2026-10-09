import assert from "node:assert/strict";
import { mkdtempSync, writeFileSync, rmSync, rmdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import {
  example,
  defaults,
  runRecord,
  restoreRecord,
} from "../../src/contents/software/engine/runtime.ts";
import {
  toCSV,
  parseCSV,
} from "../../src/contents/software/engine/mototype.ts";
let count = 0;
const check = (name, fn) => {
  fn();
  count++;
  console.log("✓ " + name);
};
check("all three examples replay to the same numerical results", () => {
  for (const key of ["decay", "mismatch", "limit"]) {
    const run = runRecord(example(key), { ...defaults, stage: "verify" });
    const saved = restoreRecord(JSON.parse(JSON.stringify(run)));
    const replay = runRecord(saved.dataset, saved.settings);
    assert.deepEqual(replay.analysis, run.analysis);
    assert.deepEqual(replay.observed, run.observed);
  }
});
check("untrusted saved analysis is ignored", () => {
  const run = runRecord(example("mismatch"), { ...defaults, stage: "verify" });
  run.analysis.holdoutPassed = true;
  run.analysis.best.k = 999;
  const saved = restoreRecord(run),
    replay = runRecord(saved.dataset, saved.settings);
  assert.equal(replay.analysis.holdoutPassed, false);
  assert.notEqual(replay.analysis.best.k, 999);
});
check(
  "original CSV bytes and physical line references survive a saved run",
  () => {
    const rawCSV = toCSV(example("decay")).replaceAll("\r\n", "\r\n\r\n");
    const dataset = {
      ...example("decay"),
      source: "local",
      rawCSV,
      rows: parseCSV(rawCSV),
    };
    const original = runRecord(dataset, { ...defaults, stage: "verify" });
    assert.equal(original.input.csv, rawCSV);
    const saved = restoreRecord(original),
      replay = runRecord(saved.dataset, saved.settings);
    assert.equal(replay.input.csv, rawCSV);
    assert.deepEqual(replay.observed, original.observed);
  },
);
check("version and invalid settings fail closed", () => {
  const good = runRecord(example("decay"), defaults);
  for (const bad of [
    null,
    {},
    { ...good, engine: "unknown" },
    { ...good, settings: { ...defaults, stage: "other" } },
    { ...good, settings: { ...defaults, threshold: NaN } },
    { ...good, settings: { ...defaults, tolerance: 0 } },
    { ...good, input: { ...good.input, csv: "bad" } },
  ])
    assert.throws(() => restoreRecord(bad));
});
check(
  "imported first-check history is not treated as independent evidence",
  () => {
    const run = runRecord(example("decay"), {
      ...defaults,
      firstCheck: {
        datasetId: "fake",
        tolerance: 1,
        trainingRmse: 0,
        passed: true,
      },
    });
    assert.equal(restoreRecord(run).settings.firstCheck, undefined);
  },
);
const temp = mkdtempSync(join(tmpdir(), "mototype-replay-"));
check(
  "restoring a holdout captures a fresh first budget before editing",
  () => {
    const run = runRecord(example("mismatch"), {
      ...defaults,
      stage: "verify",
    });
    const saved = restoreRecord(run);
    assert.equal(saved.settings.firstCheck.tolerance, 5);
    assert.equal(saved.settings.firstCheck.passed, false);
    assert.equal(saved.settings.firstCheck.datasetId, saved.dataset.id);
    assert.equal(saved.dataset.source, "synthetic");
  },
);
check(
  "missing or conflicting environment context cannot be silently reinterpreted",
  () => {
    const run = runRecord(example("decay"), defaults);
    for (const scope of [
      null,
      undefined,
      { ...run.scope, environmentSwitchHours: 3 },
      { ...run.scope, replicates: ["X1", "X2", "X3"] },
      { ...run.scope, readout: "other" },
      { ...run.scope, unit: "mg" },
      { ...run.scope, scale: "other" },
    ])
      assert.throws(() => restoreRecord({ ...run, scope }), /context/);
  },
);
try {
  check("CLI CSV and saved-run paths agree with the browser core", () => {
    const csv = join(temp, "input.csv"),
      snapshot = join(temp, "run.json"),
      cli = resolve("scripts/software/mototype.mjs");
    writeFileSync(csv, toCSV(example("decay")));
    const r = spawnSync(
      process.execPath,
      ["--experimental-strip-types", cli, csv, "--stage", "verify"],
      { encoding: "utf8" },
    );
    assert.equal(r.status, 0, r.stderr);
    const a = JSON.parse(r.stdout);
    assert.equal(a.analysis.holdoutPassed, true);
    writeFileSync(snapshot, r.stdout);
    const s = spawnSync(
      process.execPath,
      ["--experimental-strip-types", cli, snapshot],
      { encoding: "utf8" },
    );
    assert.equal(s.status, 0, s.stderr);
    assert.deepEqual(JSON.parse(s.stdout).analysis, a.analysis);
    const bad = spawnSync(
      process.execPath,
      ["--experimental-strip-types", cli, csv, "--stage", "unknown"],
      { encoding: "utf8" },
    );
    assert.equal(bad.status, 1);
    assert.equal(bad.stdout, "");
  });
} finally {
  for (const name of ["input.csv", "run.json"])
    rmSync(join(temp, name), { force: true });
  rmdirSync(temp);
}
console.log(count + " replay checks passed.");
