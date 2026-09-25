import { launchReviewBrowser } from "./browser-review.mjs";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import assert from "node:assert/strict";
const out = resolve("outputs/refinement-review");
mkdirSync(out, { recursive: true });
const browser = await launchReviewBrowser();
const context = await browser.newContext({
  viewport: { width: 1440, height: 960 },
});
const page = await context.newPage(),
  errors = [];
page.on("pageerror", (e) => errors.push(e.message));
async function at(p) {
  await page.evaluate((p) => {
    const s = document.querySelector(".continuous-journey"),
      t = document.querySelector(".cosmic-journey__sticky");
    scrollTo({
      top:
        s.getBoundingClientRect().top +
        scrollY -
        56 +
        (s.offsetHeight - t.offsetHeight) * p,
      behavior: "instant",
    });
  }, p);
  await page.waitForTimeout(650);
}
async function pose(name) {
  return page.evaluate(async (name) => {
    const url = performance
      .getEntriesByType("resource")
      .find((r) => r.name.includes("/@react-three_fiber.js"))?.name;
    const { _roots } = await import(url);
    const canvas = document.querySelector(".cosmic-journey__space canvas"),
      scene = _roots.get(canvas).store.getState().scene;
    const object = scene.getObjectByName(name),
      spin = scene.getObjectByName("data-earth-spin");
    let vertices = 0,
      regions = 0;
    if (name === "data-earth")
      object.traverse((o) => {
        if (o.isMesh) {
          vertices += o.geometry.attributes.position.count;
          regions++;
        }
      });
    return {
      scale: object.scale.x,
      rotation: object.rotation.toArray().slice(0, 3),
      spin: spin.rotation.y,
      visible: object.visible,
      vertices,
      regions,
    };
  }, name);
}
async function pressed(label, value) {
  await page.waitForFunction(
    ({ label, value }) =>
      document
        .querySelector('button[aria-label="' + label + '"]')
        ?.getAttribute("aria-pressed") === value,
    { label, value },
    { timeout: 6000 },
  );
}
async function settled(name, baseline, originalSpin) {
  for (let i = 0; i < 30; i++) {
    const p = await pose(name);
    const spinDelta =
      originalSpin === undefined
        ? 0
        : Math.atan2(
            Math.sin(p.spin - originalSpin),
            Math.cos(p.spin - originalSpin),
          );
    if (Math.abs(p.scale - baseline) < 0.01 && Math.abs(spinDelta) < 0.02)
      return p;
    await page.waitForTimeout(120);
  }
  throw new Error(
    name + " did not settle: " + JSON.stringify(await pose(name)),
  );
}
const findings = {};
try {
  // Simulate an unavailable network path for data geometry, without delaying UI JS.
  await page.route("**/earth-geometry.bin*", (route) => route.abort());
  await page.goto("http://127.0.0.1:5174/syphu-china/", {
    waitUntil: "networkidle",
  });
  await page.locator(".cosmic-journey__space canvas").waitFor();
  await page.waitForTimeout(800);
  findings.preview = await pose("data-earth");
  assert.ok(findings.preview.visible && findings.preview.regions === 1);
  await page.screenshot({ path: resolve(out, "01-cold-preview.png") });
  await page.unroute("**/earth-geometry.bin*");
  for (const [label, body] of [
    ["html", Buffer.from("<!doctype html><title>Not found</title>")],
    [
      "truncated",
      readFileSync(resolve("public/assets/cosmic/earth-geometry.bin")).subarray(
        0,
        2048,
      ),
    ],
  ]) {
    await page.route("**/earth-geometry.bin.gz", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/octet-stream",
        body,
      }),
    );
    await page.reload({ waitUntil: "networkidle" });
    await page
      .locator('canvas[data-earth-geometry="preview-unavailable"]')
      .waitFor();
    findings[label + "Fallback"] = await pose("data-earth");
    assert.equal(findings[label + "Fallback"].regions, 1);
    assert.ok(findings[label + "Fallback"].visible);
    await page.unroute("**/earth-geometry.bin.gz");
  }
  // Static object storage can serve .gz verbatim, unlike Vite's auto-decoding.
  await page.route("**/earth-geometry.bin.gz", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/octet-stream",
      body: readFileSync(resolve("public/assets/cosmic/earth-geometry.bin.gz")),
    }),
  );
  await page.reload({ waitUntil: "networkidle" });
  await page
    .locator('canvas[data-earth-geometry="ready"]')
    .waitFor({ timeout: 15000 });
  findings.rawGzip = await pose("data-earth");
  assert.equal(findings.rawGzip.regions, 23);
  await page.unroute("**/earth-geometry.bin.gz");
  await page.reload({ waitUntil: "networkidle" });
  await page
    .locator('canvas[data-earth-geometry="ready"]')
    .waitFor({ timeout: 15000 });
  findings.loaded = await pose("data-earth");
  assert.equal(findings.loaded.regions, 23);
  assert.ok(findings.loaded.vertices < 210000);
  findings.resources = await page.evaluate(() =>
    performance
      .getEntriesByType("resource")
      .filter((r) => r.name.includes("earth-"))
      .map((r) => ({
        url: r.name.split("/").pop(),
        duration: r.duration,
        transfer: r.transferSize,
      })),
  );
  await at(0.175);
  const baseline = await pose("data-earth");
  const hold = page.getByRole("button", { name: "Focus", exact: true });
  const b = await hold.boundingBox();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
  await page.mouse.down();
  await pressed("Focus", "true");
  await page.waitForTimeout(1500);
  findings.held = await pose("data-earth");
  assert.ok(findings.held.scale > baseline.scale * 1.16);
  assert.ok(Math.abs(findings.held.spin - baseline.spin) > 0.2);
  await page.screenshot({ path: resolve(out, "02-earth-held.png") });
  await page.mouse.move(50, 300);
  await page.mouse.up();
  await page.waitForTimeout(900);
  await pressed("Focus", "false");
  findings.baseline = baseline;
  findings.released = await settled(
    "data-earth",
    baseline.scale,
    baseline.spin,
  );
  assert.ok(Math.abs(findings.released.scale - baseline.scale) < 0.01);
  await pressed("Focus", "false");
  await hold.focus();
  await page.keyboard.down("Enter");
  await pressed("Focus", "true");
  await page.keyboard.up("Enter");
  await pressed("Focus", "false");
  for (const [label, p] of [
    ["library", 0.873],
    ["research", 0.955],
  ]) {
    await at(p);
    await page.waitForTimeout(1200);
    await settled("campus-planet", 1.22);
    const base = await pose("campus-planet"),
      button = page.getByRole("button", { name: "Real campus", exact: true });
    await button.focus();
    await page.keyboard.down("Space");
    await pressed("Real campus", "true");
    await page.waitForTimeout(1600);
    const held = await pose("campus-planet");
    assert.ok(held.scale > base.scale * 1.05);
    assert.ok(Math.abs(held.rotation[1]) > 0.025);
    await page.screenshot({ path: resolve(out, label + "-held.png") });
    await page.keyboard.up("Space");
    await pressed("Real campus", "false");
    await settled("campus-planet", base.scale);
    await page.waitForTimeout(900);
    assert.ok(
      Math.abs((await pose("campus-planet")).scale - base.scale) < 0.01,
    );
  }
  await at(0.365);
  await page.screenshot({ path: resolve(out, "03-stomach.png") });
  await at(0.449);
  await page.screenshot({ path: resolve(out, "04-colon-cutaway.png") });
  assert.equal(await page.locator(".anatomy-locator").count(), 0);
  await page.setViewportSize({ width: 390, height: 844 });
  await at(0.175);
  await page.screenshot({ path: resolve(out, "mobile-world.png") });
  const button = page.getByRole("button", { name: "Focus", exact: true });
  const touchBox = await button.boundingBox();
  const cdp = await context.newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [
      {
        x: touchBox.x + touchBox.width / 2,
        y: touchBox.y + touchBox.height / 2,
        id: 2,
      },
    ],
  });
  await pressed("Focus", "true");
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchCancel",
    touchPoints: [],
  });
  await pressed("Focus", "false");
  assert.equal(await button.getAttribute("aria-pressed"), "false");
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  assert.deepEqual(errors, []);
  findings.errors = errors;
  writeFileSync(
    resolve(out, "verification.json"),
    JSON.stringify(findings, null, 2),
  );
  console.log(JSON.stringify(findings, null, 2));
} finally {
  await browser.close();
}
