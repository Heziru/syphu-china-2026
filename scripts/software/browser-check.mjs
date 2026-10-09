import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { launchReviewBrowser } from "../browser-review.mjs";
const out = "outputs/software-integration";
mkdirSync(out, { recursive: true });
const browser = await launchReviewBrowser(),
  errors = [],
  checks = [];
const ok = (name) => {
  checks.push(name);
  console.log("✓ " + name);
};
try {
  const page = await browser.newPage({
    viewport: { width: 1512, height: 982 },
    deviceScaleFactor: 1,
  });
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("response", (r) => {
    if (r.status() >= 400) errors.push(r.status() + " " + r.url());
  });
  await page.goto("http://127.0.0.1:5186/syphu-china/software", {
    waitUntil: "networkidle",
  });
  await page.locator(".mt-workbench").waitFor();
  assert.equal(
    await page.locator(".mt-workbench").getAttribute("data-result"),
    "pending",
  );
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 1,
    ),
    false,
  );
  const invalidAnchors = await page
    .locator(".research-shell-sidebar a[href^='#']")
    .evaluateAll((links) =>
      links
        .filter((a) => !document.getElementById(a.hash.slice(1)))
        .map((a) => a.hash),
    );
  assert.deepEqual(invalidAnchors, []);
  assert.ok(await page.locator(".research-shell-sidebar a[href^='#']").count() >= 8);
  ok("page, navigation and initial analysis render");
  await page.screenshot({ path: out + "/desktop-overview.png" });
  await page.getByRole("button", { name: "02 Add 2 h" }).click();
  assert.equal(
    await page.locator(".mt-workbench").getAttribute("data-result"),
    "ready",
  );
  await page.getByRole("button", { name: "03 Check 4 h" }).click();
  assert.equal(
    await page.locator(".mt-workbench").getAttribute("data-result"),
    "pass",
  );
  assert.ok((await page.locator(".mt-parameters").innerText()).includes("1 h"));
  ok("positive example learns and passes held-out readings");
  const mini = await page.locator(".mt-mini-table").evaluate((el) => ({
    container: el.clientWidth,
    table: el.querySelector("table").scrollWidth,
  }));
  assert.ok(mini.table <= mini.container + 1, JSON.stringify(mini));
  ok("all result columns fit the table");
  await page.getByLabel("Dataset", { exact: true }).selectOption("mismatch");
  await page.getByRole("button", { name: "03 Check 4 h" }).click();
  assert.equal(
    await page.locator(".mt-workbench").getAttribute("data-result"),
    "fail",
  );
  assert.equal(await page.locator(".mt-parameters").count(), 0);
  await page.getByLabel(/Error budget/).focus();
  await page.getByLabel(/Error budget/).press("End");
  assert.equal(
    await page.locator(".mt-workbench").getAttribute("data-result"),
    "pass",
  );
  assert.match(
    await page.locator(".mt-history").innerText(),
    /rejected.*budget has changed/s,
  );
  ok("failed predictions and post-holdout budget changes are exposed");
  await page.getByLabel("Dataset", { exact: true }).selectOption("limit");
  await page.getByRole("button", { name: "03 Check 4 h" }).click();
  assert.equal(
    await page.locator(".mt-workbench").getAttribute("data-result"),
    "pending",
  );
  ok("censored holdout cannot pass");
  await page.getByLabel("Dataset", { exact: true }).selectOption("decay");
  await page.getByRole("button", { name: "03 Check 4 h" }).click();
  const save = page.waitForEvent("download");
  await page.getByRole("button", { name: "Save run ↓", exact: true }).click();
  const saved = await save;
  await saved.saveAs(out + "/saved-run.json");
  const original = JSON.parse(readFileSync(out + "/saved-run.json", "utf8"));
  assert.equal(original.analysis.holdoutPassed, true);
  const report = page.waitForEvent("download");
  await page.getByRole("button", { name: "Report ↓", exact: true }).click();
  await (await report).saveAs(out + "/report.html");
  assert.ok(
    readFileSync(out + "/report.html", "utf8").includes(
      "Within the holdout budget",
    ),
  );
  await page.locator(".mt-inputs>summary").click();
  await page
    .getByLabel("Load a CSV or saved run", { exact: true })
    .setInputFiles(resolve(out + "/saved-run.json"));
  await page.getByText("Input loaded.", { exact: false }).waitFor();
  assert.equal(
    await page.locator(".mt-workbench").getAttribute("data-result"),
    "pass",
  );
  assert.equal(await page.locator(".mt-history").count(), 1);
  assert.match(await page.locator(".mt-history").innerText(), /δ = 5 RFU/);
  assert.match(await page.locator(".mt-source").innerText(), /Synthetic/);
  ok("report and run download; saved input is reloaded and recomputed");
  const file = page.getByLabel("Load a CSV or saved run", { exact: true });
  await file.setInputFiles(
    resolve("public/assets/software/mototype/synthetic-decay.csv"),
  );
  await page.getByRole("alert").waitFor();
  assert.match(await page.getByRole("alert").innerText(), /Confirm/);
  await page.getByRole("checkbox").check();
  await file.setInputFiles({
    name: "invalid.csv",
    mimeType: "text/csv",
    buffer: Buffer.from("nonsense\n1"),
  });
  await page.getByRole("alert").waitFor();
  assert.match(
    await page.getByRole("alert").innerText(),
    /Missing required columns/,
  );
  assert.equal(
    await page.locator(".mt-workbench").getAttribute("data-result"),
    "pass",
  );
  await file.setInputFiles(
    resolve("public/assets/software/mototype/synthetic-decay.csv"),
  );
  await page.getByText("Input loaded.", { exact: false }).waitFor();
  assert.equal(
    await page.locator(".mt-workbench").getAttribute("data-stage"),
    "early",
  );
  ok("CSV mapping confirmation, invalid-file retention and valid import");
  await page.locator(".mt-paste > summary").click();
  await page.getByRole("button", { name: "Fill with synthetic example", exact: true }).click();
  const editor = page.getByLabel("CSV text", { exact: true });
  assert.match(await editor.inputValue(), /observation_id/);
  await page.getByRole("button", { name: "Load pasted CSV", exact: true }).click();
  await page.getByText("Input loaded.", { exact: false }).waitFor();
  assert.match(await page.locator(".mt-source").innerText(), /pasted-input/);
  await page.getByRole("button", { name: "03 Check 4 h" }).click();
  assert.equal(await page.locator(".mt-workbench").getAttribute("data-result"), "pass");
  await editor.fill("invalid\n1");
  await page.getByRole("button", { name: "Load pasted CSV", exact: true }).click();
  await page.getByRole("alert").waitFor();
  assert.equal(await page.locator(".mt-workbench").getAttribute("data-result"), "pass");
  await page.locator(".mt-report > summary").click();
  assert.match(await page.locator(".mt-report-body").innerText(), /User-supplied data/);
  assert.match(await page.locator(".mt-report-body").innerText(), /Available late readings fall within/);
  await page.locator(".mt-report > summary").click();
  ok("pasted CSV is analyzed without downloads; invalid edits preserve data; report reads inline");

  await page.locator(".mt-inputs>summary").click();
  await page.getByLabel("Dataset", { exact: true }).selectOption("decay");
  await page.evaluate(() => {
    const el = document.querySelector(".mt-workbench");
    scrollTo({
      top: el.getBoundingClientRect().top + scrollY - 85,
      behavior: "instant",
    });
  });
  await page.screenshot({ path: out + "/desktop-workbench.png" });
  await page.getByRole("button", { name: "03 Check 4 h" }).click();
  await page.screenshot({ path: out + "/desktop-holdout.png" });
  await page.locator(".sw-archive>summary").click();
  assert.equal(await page.locator(".sw-archive-content").isVisible(), true);
  const links = await page
    .locator(".research-shell-body a[download],.research-shell-sidebar-extra a[download]")
    .evaluateAll((els) => [...new Set(els.map((a) => a.href))]);
  for (const url of links) {
    const r = await page.request.head(url);
    assert.equal(r.status(), 200, url);
    assert.ok(!/text\/html/.test(r.headers()["content-type"] ?? ""), url);
  }
  ok("research archive is preserved; downloadable links respond as files");
  const phone = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
  });
  phone.on("pageerror", (e) => errors.push(e.message));
  await phone.goto("http://127.0.0.1:5186/syphu-china/software", {
    waitUntil: "networkidle",
  });
  assert.equal(
    await phone.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 1,
    ),
    false,
  );
  await phone.screenshot({ path: out + "/mobile-overview.png" });
  await phone.locator(".mt-stages").scrollIntoViewIfNeeded();
  await phone.getByRole("button", { name: "03 Check 4 h" }).click();
  assert.equal(
    await phone.locator(".mt-workbench").getAttribute("data-result"),
    "pass",
  );
  await phone
    .locator(".mt-analysis")
    .screenshot({ path: out + "/mobile-workbench.png" });
  assert.equal(
    await phone.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 1,
    ),
    false,
  );
  ok("phone layout and holdout workflow");
  assert.deepEqual(errors, []);
  writeFileSync(
    out + "/browser-checks.json",
    JSON.stringify({ url: page.url(), checks, errors }, null, 2),
  );
  console.log(checks.length + " browser checks passed.");
} finally {
  await browser.close();
}
