import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";
import { build } from "esbuild";
import { createElement } from "react";
import { renderToString } from "react-dom/server";

// Render the actual chapter; only WebGL is stubbed. Everything stays in memory.
const result = await build({
  absWorkingDir: fileURLToPath(new URL("../", import.meta.url)),
  entryPoints: ["src/contents/home/journey/ProductChapter.tsx"],
  bundle: true,
  write: false,
  platform: "node",
  format: "cjs",
  jsx: "automatic",
  external: ["react", "react-dom/server"],
  loader: { ".css": "empty" },
  define: {
    "import.meta.env.BASE_URL": '"/syphu-china/"',
    "import.meta.env.VITE_IGEM_CDN": '"false"',
  },
  plugins: [
    {
      name: "webgl-stub",
      setup(builder) {
        builder.onResolve({ filter: /^\.\/ProductModel$/ }, () => ({
          path: "product-model",
          namespace: "stub",
        }));
        builder.onLoad({ filter: /.*/, namespace: "stub" }, () => ({
          contents:
            "export function preloadProductModel() {} export default function ProductModel() { return null; }",
          loader: "js",
        }));
      },
    },
  ],
});
const module = { exports: {} };
runInNewContext(result.outputFiles[0].text, {
  module,
  exports: module.exports,
  require: createRequire(import.meta.url),
});
const { ProductChapter } = module.exports;
const state = (progress) => {
  const html = renderToString(createElement(ProductChapter, { progress }));
  const read = (name) => {
    const match = html.match(new RegExp(`${name}="([^"]+)"`));
    assert.ok(match, `Missing ${name} at progress ${progress}`);
    return match[1];
  };
  return {
    stage: read("data-product-stage"),
    turn: Number(read("data-product-turn")),
    bottle: Number(read("data-bottle-reveal")),
    capsule: Number(read("data-capsule-reveal")),
    beatCount: (html.match(/class="product-chapter__beat"/g) || []).length,
    activeLabel: html.match(/aria-current="step">([^<]+)/)?.[1],
  };
};

const samples = Array.from({ length: 1001 }, (_, i) => i / 1000);
const forward = samples.map(state);
for (const [i, p] of samples.entries()) {
  const current = forward[i];
  assert.equal(current.beatCount, 1, `Overlapping copy at ${p}`);
  assert.equal(current.activeLabel, p < 0.32 ? "Idea" : p < 0.65 ? "Response" : "Purpose");
  assert.equal(
    current.stage,
    p < 0.32 ? "carton" : p < 0.65 ? "bottle" : "capsule",
  );
  for (const key of ["bottle", "capsule"]) {
    assert.ok(current[key] >= 0 && current[key] <= 1);
    if (i) assert.ok(current[key] >= forward[i - 1][key]);
  }
  if (i) assert.ok(current.turn >= forward[i - 1].turn);
  if (p <= 0.32) assert.equal(current.bottle, 0);
  if (p >= 0.4) assert.equal(current.bottle, 1);
  if (p <= 0.65) assert.equal(current.capsule, 0);
  if (p >= 0.73) assert.equal(current.capsule, 1);
  if (current.capsule > 0) assert.equal(current.bottle, 1);
}
for (let i = samples.length - 1; i >= 0; i--) {
  assert.deepEqual(
    state(samples[i]),
    forward[i],
    `Reverse mismatch at ${samples[i]}`,
  );
}
for (const p of [0.32, 0.35, 0.38, 0.4]) assert.equal(state(p).turn, 0.011);
for (const p of [0.65, 0.68, 0.71, 0.73]) assert.equal(state(p).turn, 0.022);
for (const [p, turns] of [
  [0.05, 0],
  [0.17, 0.5],
  [0.29, 1],
  [0.51, 1.5],
  [0.62, 2],
  [0.84, 2.5],
  [0.95, 3],
]) {
  assert.equal(state(p).turn, Number((turns / 90).toFixed(3)), `Wrong gentle yaw at ${p}`);
}
const reduced = renderToString(createElement(ProductChapter, { progress: 0.8, reduced: true }));
assert.equal((reduced.match(/class="product-chapter__beat"/g) || []).length, 3);
assert.ok(reduced.includes('data-product-stage="overview"'));
const navigable = renderToString(createElement(ProductChapter, { progress: 0.5, onStageChange() {} }));
assert.equal((navigable.match(/<button /g) || []).length, 3);
assert.ok(state(0.35).bottle > 0 && state(0.35).bottle < 1);
assert.ok(state(0.68).capsule > 0 && state(0.68).capsule < 1);
assert.deepEqual(state(-1), state(0));
assert.deepEqual(state(2), state(1));
console.log(
  "Product sequence verified: 1,001 forward/reverse positions, carton → bottle → capsule, stationary joins, 12-degree yaw, single active copy and reduced-motion overview.",
);
