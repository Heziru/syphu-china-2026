import { launchReviewContext } from "./browser-review.mjs";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import assert from "node:assert/strict";
const out = resolve("outputs/best-wiki-review");
mkdirSync(out, { recursive: true });
const browser = await launchReviewContext(resolve(out, "profile"), {
  headless: true,
  viewport: { width: 1440, height: 960 },
  deviceScaleFactor: 1,
  acceptDownloads: false,
});
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const findings = [];
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
  await page.waitForTimeout(1100);
}
try {
  await page.goto("http://127.0.0.1:5174/syphu-china/", {
    waitUntil: "networkidle",
  });
  await page.waitForTimeout(3500);
  await at(0.175);
  await page
    .getByLabel("Explore a GBD region")
    .selectOption("High-income North America");
  const recent = await page.locator(".globe-value strong").textContent();
  await page.getByRole("button", { name: "1990", exact: true }).click();
  assert.notEqual(
    await page.locator(".globe-value strong").textContent(),
    recent,
    "Year toggle changes the actual regional estimate",
  );
  await page.getByRole("button", { name: "2019", exact: true }).click();
  const focus = page.getByRole("button", { name: "Focus", exact: true });
  await focus.focus();
  await page.keyboard.down("Space");
  await page.waitForFunction(
    () =>
      document
        .querySelector('button[aria-label="Focus"]')
        ?.getAttribute("aria-pressed") === "true",
  );
  assert.equal(
    await focus.getAttribute("aria-pressed"),
    "true",
    "Holding opens inspection immediately",
  );
  await page.keyboard.up("Space");
  await page.waitForFunction(
    () =>
      document
        .querySelector('button[aria-label="Focus"]')
        ?.getAttribute("aria-pressed") === "false",
  );
  assert.equal(
    await focus.getAttribute("aria-pressed"),
    "false",
    "Keyboard activation closes inspection",
  );
  await at(0.584);
  const inside = page.getByRole("button", { name: "Look inside", exact: true });
  await inside.click();
  assert.equal(await inside.getAttribute("aria-pressed"), "true");
  await at(0.04);
  const mask = await page.locator(".opening-title").getAttribute("style");
  await at(0.063);
  await at(0.04);
  assert.equal(
    await page.locator(".opening-title").getAttribute("style"),
    mask,
    "Reverse scrolling restores the exact title mask",
  );
  findings.push({
    contextualHoldAndTap: true,
    keyboard: true,
    dataYearChanges: true,
    reversibleTitle: true,
  });
  for (const [name, p] of [
    ["01-orbits", 0],
    ["02-title", 0.04],
    ["03-departure", 0.09],
    ["04-world", 0.175],
    ["05-person", 0.28],
    ["06-gut", 0.365],
    ["07-section", 0.449],
    ["08-mucosa", 0.5],
    ["09-ecn", 0.584],
    ["10-release", 0.669],
    ["11-exit", 0.75],
    ["12-library", 0.873],
    ["13-orbit-between", 0.912],
    ["14-research", 0.955],
    ["15-laboratory", 1],
  ]) {
    await at(p);
    await page.screenshot({ path: resolve(out, name + ".png") });
    findings.push({
      name,
      p,
      overflow: await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      heading: (await page.locator(".journey-editorial h1").count())
        ? await page.locator(".journey-editorial h1").textContent()
        : null,
    });
  }
  const before = await page.evaluate(() => scrollY);
  await page.mouse.move(830, 500);
  await page.mouse.wheel(0, -350);
  await page.waitForTimeout(900);
  findings.push({
    labWheelRetainsStory:
      Math.abs(before - (await page.evaluate(() => scrollY))) < 3,
  });
  await page.getByRole("button", { name: "Replay the story" }).click();
  await page.waitForTimeout(1000);
  await page.goto(
    "http://127.0.0.1:5174/syphu-china/description#project-design",
    { waitUntil: "networkidle" },
  );
  assert.ok(await page.locator("#project-design").isVisible());
  await page.getByRole("link", { name: "Return to laboratory" }).click();
  await page
    .locator(".cosmic-journey__sticky.is-in-lab")
    .waitFor({ timeout: 15000 });
  assert.equal(
    await page.evaluate(() => document.body.style.overflow),
    "hidden",
    "Returning from evidence docks in the lab",
  );
  await page.reload({ waitUntil: "networkidle" });
  await page
    .locator(".cosmic-journey__sticky.is-in-lab")
    .waitFor({ timeout: 15000 });
  await page.getByRole("button", { name: "Replay the story" }).click();
  await page.waitForTimeout(700);
  assert.equal(new URL(page.url()).hash, "", "Replay clears the lab deep link");
  assert.ok((await page.evaluate(() => scrollY)) < 5);
  findings.push({
    evidenceReturnToLab: true,
    directLabDeepLink: true,
    replayClearsLink: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  for (const [name, p] of [
    ["mobile-orbits", 0],
    ["mobile-world", 0.175],
    ["mobile-gut", 0.365],
    ["mobile-library", 0.873],
  ]) {
    await at(p);
    await page.screenshot({ path: resolve(out, name + ".png") });
    findings.push({
      name,
      overflow: await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    });
  }
  writeFileSync(
    resolve(out, "review.json"),
    JSON.stringify({ errors, findings }, null, 2),
  );
  assert.deepEqual(errors, [], "No uncaught browser errors");
  assert.ok(
    findings.every((f) => f.overflow !== true),
    "No horizontal overflow at desktop or mobile sizes",
  );
  assert.equal(
    findings.find((f) => "labWheelRetainsStory" in f).labWheelRetainsStory,
    true,
  );
  assert.equal(
    await page.getByRole("button", { name: /simple mode/i }).count(),
    0,
  );
  console.log(JSON.stringify({ errors, findings }, null, 2));
} finally {
  await browser.close();
}
