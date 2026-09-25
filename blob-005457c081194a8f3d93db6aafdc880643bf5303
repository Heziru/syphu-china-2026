import { launchReviewBrowser } from "./browser-review.mjs";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import assert from "node:assert/strict";
const out = resolve("outputs/art-direction-v2");
mkdirSync(out, { recursive: true });
const browser = await launchReviewBrowser();
const errors = [],
  findings = [];
const base = process.env.REVIEW_BASE || "http://127.0.0.1:5174/syphu-china/";
const p = await browser.newPage({
  viewport: { width: 1440, height: 960 },
  deviceScaleFactor: 1,
});
p.on("pageerror", (e) => errors.push(e.message));
p.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
async function rawAt(page, fraction) {
  await page.evaluate((f) => {
    const s = document.querySelector(".continuous-journey"),
      t = document.querySelector(".cosmic-journey__sticky");
    scrollTo({
      top:
        s.getBoundingClientRect().top +
        scrollY -
        56 +
        (s.offsetHeight - t.offsetHeight) * f,
      behavior: "instant",
    });
  }, fraction);
  await page.waitForTimeout(650);
}
const deliveryAt = (page, t) => rawAt(page, (0.62 + 0.2 * t) / 1.5);
const readProgress = async (page) =>
  Number(
    await page
      .getByRole("slider", { name: "Capsule journey progress" })
      .inputValue(),
  );
async function ready(page) {
  await page.goto(base, { waitUntil: "networkidle" });
  await page.locator(".continuous-journey").waitFor();
}
try {
  await ready(p);
  assert.equal(
    await p.locator(".continuous-journey").getAttribute("data-opening"),
    "day",
  );
  assert.equal(await p.locator(".galaxy-opening__canvas").count(), 0);
  await rawAt(p, (0.32 + 0.3 * 0.5) / 1.5);
  // The authored hotspot names are exposed as accessible buttons, not text-only artwork.
  const hot = p.locator(".treatment-hotspot").last();
  await hot.focus();
  await p.keyboard.press("Enter");
  assert.match(
    await p.locator(".treatment-bottleneck-caption").textContent(),
    /Escape|escape|Genetic changes/,
  );
  assert.match(
    await p.locator(".treatment-bottleneck-art image").getAttribute("href"),
    /biotherapeutic-bottlenecks-original/,
  );
  await deliveryAt(p, 0.1);
  const entered = await readProgress(p);
  assert.ok(
    Math.abs(entered - 100) < 5,
    `scroll immediately drives route (actual ${entered})`,
  );
  await p.getByRole("button", { name: /Colon$/ }).click();
  await p.waitForFunction(
    () =>
      Number(document.querySelector(".delivery-journey input")?.value) > 100,
    null,
    { timeout: 3000 },
  );
  const intermediate = await readProgress(p);
  assert.ok(
    intermediate > 100 && intermediate < 650,
    "station changes travel continuously",
  );
  await p.waitForFunction(
    () =>
      document
        .querySelector(".delivery-journey__play")
        ?.getAttribute("aria-label") === "Play journey",
    null,
    { polling: 100, timeout: 8000 },
  );
  const colon = await readProgress(p);
  assert.ok(colon > 650, `Colon station reached (actual ${colon})`);
  await p.mouse.move(900, 500);
  await p.mouse.wheel(100, 100);
  await p.waitForTimeout(650);
  const resumed = await readProgress(p);
  assert.ok(
    resumed >= colon - 2 && resumed < colon + 100,
    "wheel continues from manual station instead of returning to old position",
  );
  await p.getByRole("button", { name: "Replay journey" }).click();
  await p.waitForTimeout(400);
  const replayed = await readProgress(p);
  assert.ok(replayed < 40, "Replay restores beginning");
  await p.mouse.wheel(0, 70);
  await p.waitForTimeout(450);
  const afterReplay = await readProgress(p);
  assert.ok(
    afterReplay < 100 && afterReplay >= replayed - 2,
    "scroll after Replay stays near beginning",
  );
  await p.getByRole("button", { name: "Play journey", exact: true }).click();
  await p.waitForTimeout(650);
  await p.getByRole("button", { name: "Pause journey", exact: true }).click();
  const paused = await readProgress(p);
  await p.waitForTimeout(300);
  assert.ok(Math.abs((await readProgress(p)) - paused) <= 1);
  const slider = p.getByRole("slider", { name: "Capsule journey progress" });
  await slider.focus();
  await p.keyboard.press("ArrowRight");
  assert.ok((await readProgress(p)) >= paused);
  await deliveryAt(p, 0.48);
  await p.getByRole("button", { name: "Overview", exact: true }).click();
  await p.waitForTimeout(1500);
  const point = await p.locator(".delivery-journey__capsule").evaluate((el) => {
    const p = new DOMPoint(0, 0).matrixTransform(el.getScreenCTM());
    return { x: p.x, y: p.y };
  });
  await p.mouse.move(point.x, point.y);
  await p.mouse.down();
  const beforeDrag = await readProgress(p);
  const alongRoute = await p
    .locator(".delivery-journey__route")
    .evaluate((el) => {
      const value =
        Number(document.querySelector(".delivery-journey input").value) / 1000;
      const point = el.getPointAtLength((value + 0.005) * el.getTotalLength());
      return new DOMPoint(point.x, point.y)
        .matrixTransform(el.getScreenCTM())
        .toJSON();
    });
  await p.mouse.move(alongRoute.x, alongRoute.y);
  assert.ok(
    (await readProgress(p)) > beforeDrag,
    "dragging along the route advances the capsule",
  );
  const beforeOffRoute = await readProgress(p);
  await p.mouse.move(point.x + 180, point.y + 80);
  await p.waitForTimeout(150);
  assert.equal(
    await p.locator(".delivery-journey--off-route").count(),
    1,
    "off-route drag gets gentle cue",
  );
  assert.ok(
    Math.abs((await readProgress(p)) - beforeOffRoute) < 2,
    "off-route drag cannot jump across intestinal loops",
  );
  await p.mouse.up();
  await deliveryAt(p, 0.97);
  assert.match(
    await p.locator(".delivery-journey__story").textContent(),
    /Elafin expression is constitutive/,
  );
  await p.getByRole("button", { name: "Look inside", exact: false }).click();
  await p.waitForTimeout(1400);
  assert.equal(
    await p.locator(".science-atlas").getAttribute("data-science-phase"),
    "colon-section",
  );
  findings.push(
    "Light opening; original artwork; accessible hotspots; continuous station seeks; synchronized manual/scroll progress; replay; pause; keyboard; off-route feedback; correct mechanism branch; continuation",
  );
  for (const [width, height] of [
    [390, 844],
    [360, 740],
  ]) {
    const mobile = await browser.newPage({
      viewport: { width, height },
      isMobile: true,
      hasTouch: true,
    });
    mobile.on("pageerror", (e) => errors.push(e.message));
    await ready(mobile);
    await deliveryAt(mobile, 0.97);
    assert.equal(
      await mobile.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    const box = await mobile.locator(".delivery-journey__dock").boundingBox();
    const storyBox = await mobile
      .locator(".delivery-journey__story")
      .boundingBox();
    const artBox = await mobile.locator(".delivery-journey__art").boundingBox();
    assert.ok(
      artBox.y >= storyBox.y + storyBox.height + 4,
      "mobile art leaves breathing room below the caption",
    );
    assert.ok(
      box.x >= 0 &&
        box.x + box.width <= width + 1 &&
        box.y + box.height < height - 48,
    );
    assert.ok(
      (await mobile
        .locator(".delivery-journey__stops button")
        .first()
        .evaluate((e) => parseFloat(getComputedStyle(e).fontSize))) >= 9,
    );
    await mobile.screenshot({
      path: resolve(out, `home-delivery-final-${width}.png`),
    });
    await mobile.close();
  }
  const reduced = await browser.newPage({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  reduced.on("pageerror", (e) => errors.push(e.message));
  await ready(reduced);
  assert.equal(
    await reduced
      .locator(".delivery-journey")
      .evaluate((el) => getComputedStyle(el).position),
    "relative",
  );
  const deliveryBox = await reduced.locator(".delivery-journey").boundingBox();
  const beforeBox = await reduced
    .locator(".treatment-bridge--static")
    .boundingBox();
  const nextBox = await reduced
    .locator(".journey-static-mechanism")
    .boundingBox();
  assert.ok(
    deliveryBox.y >= beforeBox.y + beforeBox.height - 2 &&
      deliveryBox.y + deliveryBox.height <= nextBox.y + 2,
    "static content has separate document-flow sections",
  );
  await reduced.close();
  assert.deepEqual(errors, []);
  findings.push(
    "390×844 and 360×740 controls visible; reduced-motion layout stays in document flow; no runtime or shader errors",
  );
  console.log(JSON.stringify({ passed: true, findings, errors }, null, 2));
  writeFileSync(
    resolve(out, "home-verification.json"),
    JSON.stringify(
      {
        passed: true,
        base,
        checkedAt: new Date().toISOString(),
        findings,
        errors,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
