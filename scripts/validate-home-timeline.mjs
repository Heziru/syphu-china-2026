import assert from "node:assert/strict";
import { build } from "esbuild";

const result = await build({
  entryPoints: ["src/contents/home/journey/storyTimeline.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  write: false,
});
const timeline = await import(
  "data:text/javascript;base64," +
    Buffer.from(result.outputFiles[0].text).toString("base64")
);
const {
  journeyPosition,
  storyScrollPosition,
  bridgeScrollPosition,
  deliveryScrollPosition,
  productScrollPosition,
  BRIDGE_AT,
  WALL_AT,
  PRODUCT_AT,
  NARRATIVE,
  stageAt,
  STORY_SCROLL_HEIGHT,
} = timeline;
const near = (actual, expected, label) =>
  assert.ok(
    Math.abs(actual - expected) < 1e-9,
    `${label}: ${actual} != ${expected}`,
  );
const chapters = [
  ["bridge", bridgeScrollPosition, BRIDGE_AT],
  ["delivery", deliveryScrollPosition, BRIDGE_AT],
  ["product", productScrollPosition, PRODUCT_AT],
];

// The full outward and return scroll must preserve direction, including inserted chapters.
const samples = Array.from({ length: 10001 }, (_, i) => i / 10000);
let previous = -1;
for (const scroll of samples) {
  const position = journeyPosition(scroll);
  assert.ok(
    position.progress >= previous - 1e-12,
    `Story moved backwards at ${scroll}`,
  );
  assert.ok(position.progress >= 0 && position.progress <= 1);
  const active = chapters.filter(([name]) => position[name] !== null);
  assert.ok(active.length <= 1, `Chapters overlap at ${scroll}`);
  for (const [name] of active)
    assert.ok(position[name] >= 0 && position[name] < 1);
  previous = position.progress;
}
previous = 2;
for (const scroll of [...samples].reverse()) {
  const position = journeyPosition(scroll);
  assert.ok(
    position.progress <= previous + 1e-12,
    `Reverse scroll moved forwards at ${scroll}`,
  );
  previous = position.progress;
}

for (const [name, toScroll, held] of chapters) {
  for (const local of [0.000001, 0.05, 0.25, 0.5, 0.75, 0.999999]) {
    const position = journeyPosition(toScroll(local));
    assert.notEqual(position[name], null, `${name} missing at ${local}`);
    near(position[name], local, `${name} local progress`);
    near(position.progress, held, `${name} must hold its calibrated scene`);
  }
  near(toScroll(-1), toScroll(0), `${name} negative input clamp`);
  near(toScroll(2), toScroll(1), `${name} upper input clamp`);
}
near(
  bridgeScrollPosition(1),
  deliveryScrollPosition(0),
  "Treatment-to-route boundary",
);
near(
  journeyPosition(deliveryScrollPosition(1)).progress,
  WALL_AT,
  "Route ends at intestinal wall",
);
near(
  journeyPosition(productScrollPosition(1)).progress,
  PRODUCT_AT,
  "Product returns to campus camera",
);
assert.ok(deliveryScrollPosition(1) < productScrollPosition(0));

// Normal scenes round-trip; skipped whole-anatomy positions intentionally resume at the wall.
const calibrated = [
  ...NARRATIVE.map((item) => item.at),
  WALL_AT,
  PRODUCT_AT,
  0.449,
  0.588,
  0.669,
  0.75,
  1,
];
for (const progress of [...samples, ...calibrated]) {
  const expected =
    progress >= BRIDGE_AT && progress < WALL_AT ? WALL_AT : progress;
  near(
    journeyPosition(storyScrollPosition(progress)).progress,
    expected,
    `Story inverse at ${progress}`,
  );
}
near(journeyPosition(-1).progress, 0, "Opening lower bound");
near(journeyPosition(2).progress, 1, "Lab upper bound");
near(storyScrollPosition(0), 0, "Opening scroll target");
near(storyScrollPosition(1), 1, "Lab scroll target");
const readingDistance = (from, to) =>
  (storyScrollPosition(to) - storyScrollPosition(from)) * (STORY_SCROLL_HEIGHT - 100);
assert.ok(readingDistance(0.284, 0.308) >= 125,
  "The complete life trio must hold for at least 1.25 viewport scrolls");
assert.ok(readingDistance(0.443, 0.46) >= 95,
  "Colon inspection needs approximately one viewport of reading distance");
assert.ok(readingDistance(0.482, 0.526) >= 120,
  "The full mucosal surface must remain readable");
assert.ok(readingDistance(0.925, 0.965) >= 230,
  "The scientist must dwell through more than two viewport scrolls");
assert.equal(NARRATIVE[stageAt(journeyPosition(1).progress)].id, "laboratory");
assert.equal(NARRATIVE[stageAt(journeyPosition(0).progress)].id, "origins");

console.log(
  "Home timeline verified: 10,001 forward/reverse positions, chapter ranges, calibrated inverse mappings, opening and lab endpoints.",
);
