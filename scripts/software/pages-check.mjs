import assert from "node:assert/strict";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { launchReviewBrowser } from "../browser-review.mjs";

// Run against the final preview build: REVIEW_URL=<base> node scripts/software/pages-check.mjs.
// These are browser outcomes, not snapshots of CSS declarations.
const base = (process.env.REVIEW_URL || "http://127.0.0.1:5186/syphu-china").replace(/\/$/, "");
const output = fileURLToPath(new URL("../../outputs/software-integration/", import.meta.url));
mkdirSync(output, { recursive: true });
const routes = [
  "software", "model", "experiments", "notebook", "measurement",
  "alternative-platform", "safety-and-security", "description", "engineering",
  "results", "contribution", "hardware", "entrepreneurship", "human-practices",
  "education", "inclusivity", "sustainability",
];
const sizes = {
  desktop: { width: 1440, height: 1040 },
  phone: { width: 390, height: 844 },
};
const report = {
  base, checkedAt: new Date().toISOString(),
  scope: "17 research/content routes; Home and Team retain their independent designs. Existing template pages are not represented as completed research.",
  checks: [], failures: [], pages: {}, pageErrors: [], badResponses: [], screenshots: [],
};
const browser = await launchReviewBrowser();
const page = await browser.newPage({ viewport: sizes.desktop, deviceScaleFactor: 1 });
page.setDefaultTimeout(15000);
await page.emulateMedia({ reducedMotion: "reduce" });
page.on("pageerror", error => report.pageErrors.push({ url: page.url(), message: error.message }));
page.on("response", response => {
  if (response.status() >= 400) report.badResponses.push({ url: response.url(), status: response.status() });
});

async function check(name, fn) {
  try {
    await fn();
    report.checks.push(name);
    console.log("PASS " + name);
  } catch (error) {
    report.failures.push({ name, message: error.message });
    console.error("FAIL " + name + ": " + error.message);
  }
}

async function navigate(route) {
  await page.goto(base + "/" + route, { waitUntil: "networkidle" });
  await page.locator("main.research-shell").waitFor();
  await page.evaluate(() => document.fonts.ready);
}

async function capture(name, selector) {
  if (selector) {
    await page.locator(selector).first().evaluate(el => scrollTo({
      top: scrollY + el.getBoundingClientRect().top - 90, behavior: "instant",
    }));
  } else await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  const file = "pages-" + name + ".png";
  await page.screenshot({ path: output + file });
  report.screenshots.push(file);
}

async function inspect() {
  return page.evaluate(() => {
    const shell = document.querySelector("main.research-shell");
    const body = shell.querySelector(".research-shell-body");
    const style = el => {
      if (!el) return null;
      const s = getComputedStyle(el);
      return Object.fromEntries(["fontFamily", "fontSize", "fontWeight", "fontStyle", "lineHeight", "letterSpacing"].map(key => [key, s[key]]));
    };
    const rect = el => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { x: Math.round(r.x * 100) / 100, width: Math.round(r.width * 100) / 100 };
    };
    const excluded = ".mt-workbench,.sw-archive-content,figcaption,table,.research-code,.research-mobile-contents,.research-shell-mobile-contents,.sw-demos";
    const paragraphs = [...body.querySelectorAll("p")].filter(el => el.textContent.trim().length > 80 && !el.closest(excluded));
    const prose = paragraphs[0] ?? [...body.querySelectorAll("li")].find(el => el.textContent.trim().length > 60 && !el.closest(excluded) && !el.closest("nav"));
    const headings = [...body.querySelectorAll("h2")].filter(el => !el.closest(excluded));
    const ids = [...shell.querySelectorAll("[id]")].map(el => el.id);
    return {
      title: document.title, width: innerWidth, documentWidth: document.documentElement.scrollWidth,
      shellCount: document.querySelectorAll("main.research-shell").length,
      h1Count: document.querySelectorAll("h1").length,
      headers: [...document.querySelectorAll(".research-shell-header,.wiki-page-header,.sw-header,.research-header")].map(el => el.className),
      h1: style(shell.querySelector("h1")), h2: style(headings[0]), body: style(prose),
      longTitle: shell.querySelector(".research-shell-header").classList.contains("research-shell-header--long-title"),
      bodySample: prose?.textContent.trim().slice(0, 120),
      headingStyles: headings.map(el => ({ text: el.textContent.trim().slice(0, 80), style: style(el) })),
      layout: rect(shell.querySelector(".research-shell-layout")),
      article: rect(body), header: rect(shell.querySelector(".research-shell-header > div")),
      sidebarVisible: getComputedStyle(shell.querySelector(".research-shell-sidebar")).display !== "none",
      mobileContentsVisible: getComputedStyle(shell.querySelector(".research-shell-mobile-contents")).display !== "none",
      duplicateIds: [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))],
      brokenHashes: [...shell.querySelectorAll('a[href^="#"]')].filter(a => a.hash && !document.getElementById(decodeURIComponent(a.hash.slice(1)))).map(a => a.hash),
      missingImageAlt: [...shell.querySelectorAll("img")].filter(img => !img.hasAttribute("alt")).map(img => img.src),
      equationErrors: shell.querySelectorAll(".katex-error").length,
    };
  });
}

async function exerciseContents(viewport) {
  const nav = viewport === "desktop" ? ".research-shell-sidebar" : ".research-shell-mobile-contents";
  if (viewport === "phone") {
    const summary = page.locator(nav + " > summary");
    await summary.focus();
    await summary.press("Enter");
    assert.equal(await page.locator(nav).getAttribute("open"), "");
  }
  const links = page.locator(nav + ' a[href^="#"]');
  const count = await links.count();
  assert.ok(count > 0, "No contents links");
  const link = links.nth(Math.min(1, count - 1));
  const hash = await link.getAttribute("href");
  await link.focus();
  const focus = await link.evaluate(el => ({ active: document.activeElement === el, outline: getComputedStyle(el).outlineStyle }));
  assert.ok(focus.active && focus.outline !== "none", "Contents link has no visible keyboard focus");
  await link.press("Enter");
  await page.waitForFunction(expected => location.hash === expected, hash);
  const placement = await page.evaluate(expected => {
    const el = document.getElementById(decodeURIComponent(expected.slice(1)));
    const rect = el.getBoundingClientRect();
    const nav = document.querySelector(".navbar.fixed-top")?.getBoundingClientRect();
    return { top: rect.top, bottom: rect.bottom, navbarBottom: nav?.bottom ?? 0, height: innerHeight };
  }, hash);
  assert.ok(placement.top >= placement.navbarBottom - 2 && placement.top < placement.height - 30,
    "Anchor heading is obscured or off-screen: " + JSON.stringify(placement));
}

async function exerciseDetails(route) {
  const expected = route === "experiments" ? ["Why sampling matters"] : [
    "Environmental variation", "Genetic change and residual survivors",
    "Protein persistence and release", "Chassis, transfer and selection markers",
  ];
  for (const title of expected) {
    const summary = page.locator(".project-evidence__detail > summary").filter({ hasText: title });
    assert.equal(await summary.count(), 1, title + " is missing or duplicated");
    const details = summary.locator("..");
    if (await details.getAttribute("open") !== null) await summary.click();
    await summary.focus();
    await summary.press("Enter");
    assert.equal(await details.getAttribute("open"), "");
    assert.ok(await details.locator("p").first().isVisible(), title + " does not reveal its explanation");
    await summary.press("Space");
    assert.equal(await details.getAttribute("open"), null);
  }
}

try {
  for (const [viewport, size] of Object.entries(sizes)) {
    await page.setViewportSize(size);
    let reference;
    const titleSizes = new Map();
    for (const route of routes) {
      await check(viewport + "/" + route + " shared typography, layout and navigation", async () => {
        await navigate(route);
        const data = await inspect();
        report.pages[viewport + "/" + route] = data;
        if (["software", "model", "experiments"].includes(route)) await capture(viewport + "-" + route);
        await exerciseContents(viewport);
        assert.equal(data.shellCount, 1, "Missing or duplicate shared page shell");
        assert.equal(data.h1Count, 1, "Missing or duplicate page title");
        assert.equal(data.headers.length, 1, "Duplicate page headers: " + data.headers.join(", "));
        assert.ok(data.documentWidth <= data.width + 1, "Page overflows horizontally");
        assert.deepEqual(data.duplicateIds, [], "Duplicate IDs");
        assert.deepEqual(data.brokenHashes, [], "Broken in-page links");
        assert.deepEqual(data.missingImageAlt, [], "Images lack an alt attribute");
        assert.equal(data.equationErrors, 0, "Formula errors");
        assert.ok(data.h1 && data.h2 && data.body, "Missing title, section heading or narrative text");
        assert.equal(data.sidebarVisible, viewport === "desktop");
        assert.equal(data.mobileContentsVisible, viewport === "phone");
        if (!reference) reference = data;
        for (const key of ["fontFamily", "fontWeight", "fontStyle"]) assert.equal(data.h1[key], reference.h1[key], "Page-title " + key + " differs from Software");
        const titleSize = { fontSize: data.h1.fontSize, lineHeight: data.h1.lineHeight, letterSpacing: data.h1.letterSpacing };
        if (!titleSizes.has(data.longTitle)) titleSizes.set(data.longTitle, titleSize);
        assert.deepEqual(titleSize, titleSizes.get(data.longTitle), "Page-title size differs within the same short/long title variant");
        for (const part of ["h2", "body"]) assert.deepEqual(data[part], reference[part], part + " typography differs from Software");
        for (const part of ["layout", "article", "header"]) assert.deepEqual(data[part], reference[part], part + " alignment differs from Software");
        for (const heading of data.headingStyles) assert.deepEqual(heading.style, data.h2, "Inconsistent section heading: " + heading.text);
      });
      if (["experiments", "safety-and-security"].includes(route)) {
        await check(viewport + "/" + route + " keyboard disclosures", () => exerciseDetails(route));
      }
    }
  }

  await page.setViewportSize(sizes.desktop);
  await check("Software live stages remain interactive", async () => {
    await navigate("software");
    await page.getByRole("button", { name: "02 Add 2 h", exact: true }).click();
    assert.equal(await page.locator(".mt-workbench").getAttribute("data-result"), "ready");
    await page.getByRole("button", { name: "03 Check 4 h", exact: true }).click();
    assert.equal(await page.locator(".mt-workbench").getAttribute("data-result"), "pass");
    const readRun = page.locator("summary").filter({ hasText: "Read this run" });
    await readRun.focus();
    await readRun.press("Enter");
    assert.equal(await readRun.locator("..").getAttribute("open"), "");
    await capture("desktop-software-live", ".mt-workbench");
  });
  if (!process.env.SKIP_VIDEOS) await check("Three embedded recordings decode, play and expose captions", async () => {
    const media = [];
    const group = page.getByRole("group", { name: "Choose an operation walkthrough" });
    assert.equal(await group.getByRole("button").count(), 3);
    for (let i = 0; i < 3; i++) {
      const button = group.getByRole("button").nth(i);
      await button.click();
      assert.equal(await button.getAttribute("aria-pressed"), "true");
      const video = page.locator(".sw-demo-film video");
      assert.equal(await video.count(), 1);
      const data = await video.evaluate(async el => {
        el.muted = true;
        await el.play();
        return { source: el.currentSrc, controls: el.controls, duration: el.duration,
          width: el.videoWidth, height: el.videoHeight, title: el.getAttribute("aria-label"),
          poster: el.poster, tracks: [...el.querySelectorAll("track")].map(track => ({ kind: track.kind, lang: track.srclang, source: track.src })) };
      });
      await page.waitForFunction(() => {
        const video = document.querySelector(".sw-demo-film video");
        return video.currentTime > 0.15 && video.readyState >= 2;
      });
      await page.waitForFunction(() => document.querySelector(".sw-demo-film video track")?.readyState === 2);
      assert.ok(data.controls && data.width > 0 && data.height > 0 && data.duration > 0 && data.title);
      assert.ok(data.tracks.some(track => track.kind === "captions" && track.lang === "en"));
      const decoded = await video.evaluate(async el => {
        el.pause();
        const cues = [...(el.textTracks[0]?.cues ?? [])].map(cue => ({ start: cue.startTime, end: cue.endTime }));
        const canvas = document.createElement("canvas");
        canvas.width = 32;
        canvas.height = 20;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        const frames = [];
        for (const fraction of [0.05, 0.75]) {
          await new Promise(resolve => {
            el.addEventListener("seeked", resolve, { once: true });
            el.currentTime = el.duration * fraction;
          });
          ctx.drawImage(el, 0, 0, canvas.width, canvas.height);
          // A coarse decoded image signature detects a completely frozen recording.
          frames.push([...ctx.getImageData(0, 0, canvas.width, canvas.height).data]);
        }
        return { cues, changedPixels: frames[0].filter((value, index) => value !== frames[1][index]).length };
      });
      assert.ok(decoded.cues.length > 0, "Caption file contains no usable cues");
      assert.ok(decoded.cues.every(cue => cue.start >= 0 && cue.end > cue.start && cue.end <= data.duration + 0.25), "Caption timestamps exceed the recording");
      assert.ok(decoded.changedPixels > 0, "Recording image is identical near the beginning and after its main operation");
      const poster = await page.request.get(data.poster);
      assert.ok(poster.ok() && /^image\//.test(poster.headers()["content-type"] || ""), "Poster did not load as an image");
      media.push({ ...data, cues: decoded.cues.length, changedPixels: decoded.changedPixels });
    }
    report.media = media;
    await capture("desktop-recording", ".sw-demos");
  });
  await check("Model replays and controls remain interactive", async () => {
    await navigate("model");
    await page.locator(".adhesion-replay").scrollIntoViewIfNeeded();
    await page.waitForFunction(() => !document.querySelector("#adhesion-time")?.disabled, null, { timeout: 45000 });
    await page.getByRole("button", { name: "Play simulation replay", exact: true }).click();
    await page.waitForFunction(() => Number(document.querySelector("#adhesion-time")?.value) > 2);
    await page.getByRole("button", { name: "Pause simulation replay", exact: true }).click();
    await page.getByRole("button", { name: "No wall binding", exact: true }).click();
    assert.equal(await page.locator(".adhesion-ledger div").filter({ has: page.locator("dt", { hasText: /^Bound$/ }) }).locator("dd").textContent(), "0.00%");
    await page.getByRole("button", { name: "Reversible binding", exact: true }).click();
    await page.locator(".particle-replay").scrollIntoViewIfNeeded();
    await page.waitForFunction(() => !document.querySelector("#particle-time")?.disabled, null, { timeout: 45000 });
    await page.locator("#particle-time").fill("60");
    await page.waitForFunction(() => document.querySelector(".particle-replay canvas")?.dataset.time === "60");
    const actual = (await page.locator(".particle-ledger dd").allTextContents()).map(value => Number(value.replaceAll(",", "")));
    const data = await (await page.request.get(base + "/assets/dry-lab/adhesion/particle-replay.json")).json();
    const frame = data.frames[data.time_s.indexOf(60)];
    assert.deepEqual(actual, ["free", "attached", "exited", "shed"].map(key => frame.ledger[key]));
    await capture("desktop-model-replay", ".particle-replay");
  });
  await check("Model molecular viewers remain directly accessible", async () => {
    await page.locator("#structure-3d").scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelector(".researchStructureViewer__frame")?.getAttribute("aria-busy") === "false", null, { timeout: 45000 });
    assert.equal(await page.locator(".researchStructureViewer__fallback").count(), 0);
    assert.ok(await page.locator(".researchStructureViewer__frame canvas").isVisible());
    const viewer = page.locator(".atomistic-viewer");
    await viewer.scrollIntoViewIfNeeded();
    assert.equal(await viewer.evaluate(el => Boolean(el.closest("details"))), false);
    await page.waitForFunction(() => document.querySelector(".atomistic-viewer-frame")?.getAttribute("aria-busy") === "false", null, { timeout: 45000 });
    await viewer.locator("select").selectOption("1");
    await page.waitForFunction(() => document.querySelector(".atomistic-viewer-frame")?.getAttribute("aria-busy") === "false", null, { timeout: 45000 });
    assert.equal(await page.locator(".atomistic-viewer-fallback").count(), 0);
    await viewer.getByRole("checkbox").check();
    assert.ok(await viewer.getByRole("checkbox").isChecked());
  });
  await page.setViewportSize({ width: 320, height: 780 });
  for (const route of ["software", "model", "experiments"]) {
    await check("narrow phone/" + route + " no horizontal page overflow", async () => {
      await navigate(route);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    });
  }
  await check("No browser runtime or asset errors", async () => {
    assert.deepEqual(report.pageErrors, []);
    assert.deepEqual(report.badResponses, []);
  });
} finally {
  report.passed = report.failures.length === 0;
  writeFileSync(output + "pages-check.json", JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ passed: report.passed, checks: report.checks.length, failures: report.failures, screenshots: report.screenshots }));
  if (!report.passed) process.exitCode = 1;
  await browser.close();
}
