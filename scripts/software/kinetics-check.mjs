import assert from "node:assert/strict";
import {
  analyzeKinetics,
  makeKineticDemo,
  scoreTime,
  crossingTime,
  profileFit,
  predict,
  fitUnit,
} from "../../src/contents/software/engine/kinetics.ts";
import {
  makeDemo,
  SAMPLES,
  evaluate,
  DEFAULT_RULE,
} from "../../src/contents/software/engine/mototype.ts";
let count = 0;
const check = (name, fn) => {
  fn();
  count++;
  process.stdout.write("✓ " + name + "\n");
};
const settings = {
  stage: "early",
  threshold: 100,
  tolerance: 5,
  waitCost: 0.15,
};
const approx = (actual, expected, eps = 1e-6) =>
  assert.ok(Math.abs(actual - expected) <= eps, actual + " != " + expected);
const candidate = (k, floors, amps) => ({
  k,
  units: SAMPLES.map((sample, i) => ({
    sample,
    floor: floors[i],
    amplitude: amps[i],
    sse: 0,
  })),
  rmse: 0,
});
const slow = candidate(Math.LN2, [36, 40, 44], [420, 440, 460]);
const fast = candidate(
  Math.log(4),
  [176, 560 / 3, 592 / 3],
  [280, 880 / 3, 920 / 3],
);
const points = SAMPLES.flatMap((sample, i) =>
  [0, 1, 2].map((t, j) => ({
    sample,
    t,
    y: [
      [456, 246, 141],
      [480, 260, 150],
      [504, 274, 159],
    ][i][j],
    id: sample + "-" + t,
  })),
);

check(
  "independent analytic fixtures recover shared rate and separate offsets",
  () => {
    const { best } = profileFit(points);
    approx(best.k, Math.LN2);
    best.units.forEach((u, i) => {
      approx(u.floor, [36, 40, 44][i]);
      approx(u.amplitude, [420, 440, 460][i]);
    });
    approx(best.rmse, 0);
    approx(predict(best, "B1", 4), 62.25);
  },
);
check("two distinct futures exactly interpolate the same early points", () => {
  for (const s of SAMPLES)
    for (const t of [0, 1]) approx(predict(slow, s, t), predict(fast, s, t));
  assert.ok(Math.abs(predict(slow, "B1", 4) - predict(fast, "B1", 4)) > 100);
});
check("independently calculated spreads and decision scores", () => {
  const expected = [
    [2, 55, 0],
    [3, 96.25, 9.647435897435898],
    [4, 120.3125, 16.594827586206897],
  ];
  for (const [t, d, j] of expected) {
    const r = scoreTime([slow, fast], t, 1, 100, 5, 0.15);
    approx(r.spread, d);
    approx(r.score, j);
  }
});
check("zero threshold disagreement does not erase prediction spread", () => {
  const r = scoreTime([slow, fast], 2, 1, 100, 5, 0.15);
  assert.equal(r.score, 0);
  approx(r.spread, 55);
});
check("higher waiting cost lowers a future score", () => {
  assert.ok(
    scoreTime([slow, fast], 4, 1, 100, 5, 1).score <
      scoreTime([slow, fast], 4, 1, 100, 5, 0).score,
  );
});
check(
  "equal candidate predictions below resolution cannot create a score",
  () => {
    const r = scoreTime([slow, slow], 4, 1, 100, 5, 0.15);
    assert.equal(r.score, 0);
    assert.equal(r.spread, 0);
  },
);
check("only finite, strictly future sampling arguments accepted", () => {
  for (const t of [0, 1, NaN, Infinity])
    assert.throws(() => scoreTime([slow], t, 1, 100, 5, 0.15));
  assert.throws(() => scoreTime([], 4, 1, 100, 5, 0.15));
  assert.throws(() => scoreTime([slow], 4, 1, 100, 0, 0.15));
  assert.throws(() => scoreTime([slow], 4, 1, 100, 5, -1));
});
check("analytic crossing times and asymptotic boundary", () => {
  approx(crossingTime(slow, "B1", 100), Math.log(420 / 64) / Math.LN2);
  assert.equal(crossingTime(slow, "B1", 36), null);
  assert.equal(crossingTime(slow, "B1", 35), null);
  assert.equal(crossingTime(slow, "B1", 456), 0);
  const flat = candidate(1, [36, 40, 44], [0, 0, 0]);
  assert.equal(crossingTime(flat, "B1", 36), 0);
});
check("nonnegative fit uses a constrained optimum for rising data", () => {
  const u = fitUnit(
    [
      { t: 0, y: 10, sample: "B1", id: "1" },
      { t: 1, y: 20, sample: "B1", id: "2" },
    ],
    1,
    "B1",
  );
  approx(u.floor, 15);
  approx(u.amplitude, 0);
  approx(u.sse, 50);
});
check("two-timepoint demo remains explicitly underdetermined", () => {
  const a = analyzeKinetics(makeKineticDemo(), settings);
  assert.equal(a.state, "ready");
  assert.equal(a.constrained, false);
  assert.ok(a.compatible.length > 10);
  assert.equal(a.holdout.length, 0);
  assert.ok(a.recommended.time > a.now);
});
check("positive holdout is predicted without fitting it", () => {
  const a = analyzeKinetics(makeKineticDemo(), {
    ...settings,
    stage: "verify",
  });
  assert.equal(a.holdoutPassed, true);
  assert.equal(a.constrained, true);
  assert.equal(a.training.length, 9);
  assert.equal(a.holdout.length, 3);
  a.residuals.forEach((r) => approx(r.error, 0));
  assert.equal(a.recommended, null);
});
check("original fast-drop example fails independent late readings", () => {
  const a = analyzeKinetics(makeDemo("supported"), {
    ...settings,
    stage: "verify",
  });
  assert.equal(a.holdoutPassed, false);
  assert.ok(a.residuals.every((r) => Math.abs(r.error) > 10));
  assert.equal(a.recommended, null);
});
check(
  "changing held-out values cannot change the early fit or sampling scores",
  () => {
    const d = makeKineticDemo(),
      a = analyzeKinetics(d, settings);
    for (const o of d.rows) if (o.time > 3) o.value = 99999;
    const b = analyzeKinetics(d, settings);
    assert.deepEqual(a.profile, b.profile);
    assert.deepEqual(a.scores, b.scores);
  },
);
check(
  "verification retains fitted parameters after held-out values change",
  () => {
    const d = makeKineticDemo(),
      a = analyzeKinetics(d, { ...settings, stage: "verify" });
    for (const o of d.rows) if (o.time > 4) o.value = 99999;
    const b = analyzeKinetics(d, { ...settings, stage: "verify" });
    assert.deepEqual(a.best, b.best);
    assert.equal(b.holdoutPassed, false);
  },
);
check("censored training blocks fit without substitution", () => {
  const d = makeKineticDemo();
  Object.assign(d.rows[0], { qualifier: "lt", value: null, upper: 500 });
  assert.equal(analyzeKinetics(d, settings).state, "blocked");
});
check(
  "censored late result remains unknown and does not leak into early fit",
  () => {
    const d = makeDemo("indeterminate");
    assert.equal(analyzeKinetics(d, settings).state, "ready");
    assert.equal(
      analyzeKinetics(d, { ...settings, stage: "verify" }).holdoutPassed,
      null,
    );
  },
);
check("late points at 2.05 h cannot pretend to be the 4 h check", () => {
  const d = makeKineticDemo();
  for (const o of d.rows)
    if (o.time === 6) {
      o.time = 4.05;
      o.value = predict(slow, o.sample, 2.05);
    }
  const a = analyzeKinetics(d, { ...settings, stage: "verify" });
  assert.equal(a.holdoutPassed, null);
});
check("missing a biological unit cannot pass a holdout", () => {
  const d = makeKineticDemo();
  d.rows = d.rows.filter((o) => !(o.time === 6 && o.sample === "B3"));
  assert.equal(
    analyzeKinetics(d, { ...settings, stage: "verify" }).holdoutPassed,
    null,
  );
});
check("flat readout does not identify a decay rate", () => {
  const d = makeKineticDemo();
  d.rows.forEach((o) => (o.value = 50));
  const a = analyzeKinetics(d, { ...settings, stage: "verify" });
  assert.equal(a.constrained, false);
  assert.equal(a.boundary, true);
});
check(
  "empty grid compatibility fails gracefully at valid high signal scale",
  () => {
    const d = makeKineticDemo();
    d.rows.forEach((o) => (o.value *= 1000));
    const a = analyzeKinetics(d, { ...settings, stage: "learn", tolerance: 1 });
    assert.equal(a.state, "blocked");
    assert.equal(a.recommended, null);
    assert.match(a.reason, /分辨率/);
  },
);
check("wrong scale and incomplete training block interpretation", () => {
  const d = makeKineticDemo();
  d.rows[0].scale = "different";
  assert.equal(analyzeKinetics(d, settings).state, "blocked");
  d.rows = [];
  assert.equal(analyzeKinetics(d, settings).state, "blocked");
});
check(
  "poor training and coincidentally good holdout stay distinguishable",
  () => {
    const d = makeKineticDemo();
    d.rows.forEach((o) => {
      if (o.sample === "B2" && o.time === 3) o.value = 150;
      if (o.sample === "B2" && o.time === 4) o.value = 67.5;
    });
    const fit = analyzeKinetics(d, { ...settings, stage: "learn" });
    assert.ok(fit.best.rmse > settings.tolerance);
    for (const o of d.rows)
      if (o.time === 6) o.value = predict(fit.best, o.sample, 4);
    const a = analyzeKinetics(d, { ...settings, stage: "verify" });
    assert.equal(a.holdoutPassed, true);
    assert.ok(a.best.rmse > settings.tolerance);
    assert.match(a.reason, /训练拟合误差/);
  },
);
check(
  "model target suggestions do not overwrite the existing all-window verdict",
  () => {
    const d = makeKineticDemo();
    const before = evaluate(d, DEFAULT_RULE);
    analyzeKinetics(d, { ...settings, stage: "verify" });
    assert.equal(before.verdict, "conflict");
    assert.deepEqual(evaluate(d, DEFAULT_RULE), before);
  },
);
process.stdout.write("\n" + count + " kinetic checks passed.\n");
