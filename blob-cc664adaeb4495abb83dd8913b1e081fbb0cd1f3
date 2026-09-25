import { launchReviewContext } from "./browser-review.mjs";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import assert from "node:assert/strict";
const out = resolve("outputs/lab-focus-review");
mkdirSync(out, { recursive: true });
const browser = await launchReviewContext(resolve(out, "browser-profile"), {
  headless: true,
  viewport: { width: 1440, height: 960 },
  deviceScaleFactor: 1,
  acceptDownloads: false,
});
const errors = [];
try {
  const page = await browser.newPage();
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://127.0.0.1:5174/syphu-china/", {
    waitUntil: "networkidle",
  });
  await page.getByRole("button", { name: /Skip to lab/ }).click();
  await page.waitForFunction(() => window.__LAB_CAMERA?.().phase === "idle");
  await page.waitForTimeout(500);
  const pose = () => page.evaluate(() => window.__LAB_CAMERA());
  const distance = (a, b) =>
    Math.hypot(...a.position.map((v, i) => v - b.position[i]));
  const evidence = page.locator(".lab-evidence-links a");
  await evidence.first().waitFor({ state: "visible" });
  await page.waitForFunction(
    () =>
      window.__LAB_CAMERA?.().phase === "idle" &&
      [...document.querySelectorAll(".lab-evidence-links a")].every(
        (n) =>
          getComputedStyle(n).visibility === "visible" &&
          n.getBoundingClientRect().width > 0,
      ),
  );
  await page.waitForTimeout(600);
  assert.equal(
    await evidence.count(),
    5,
    "All five evidence entries remain available",
  );
  for (const link of await evidence.all())
    assert.ok(await link.isVisible(), "Overview evidence is visible");
  const defaultPose = await pose();
  await page.screenshot({ path: resolve(out, "laboratory-overview.png") });
  // Regression: opening the literature gallery must not reset a user-selected view.
  await page.mouse.move(850, 760);
  await page.mouse.down();
  await page.mouse.move(1010, 690, { steps: 12 });
  await page.mouse.up();
  await page.mouse.wheel(0, -180);
  await page.waitForTimeout(900);
  const original = await pose();
  assert.ok(
    distance(defaultPose, original) > 0.1,
    "Use a rotated and zoomed non-default view",
  );
  await page.getByRole("button", { name: "Literature", exact: true }).click();
  const gallery = page.locator(".literature-gallery[open]");
  await gallery.waitFor();
  await page.waitForTimeout(600);
  assert.ok(
    distance(await pose(), original) < 0.02,
    "Opening literature preserves the camera",
  );
  await page.mouse.move(900, 500);
  await page.mouse.wheel(0, 380);
  await page.waitForTimeout(450);
  assert.ok(
    distance(await pose(), original) < 0.02,
    "Gallery scrolling does not move the background camera",
  );
  await page.getByRole("button", { name: "Back to lab" }).click();
  await gallery.waitFor({ state: "hidden" });
  await page.waitForTimeout(650);
  const afterGallery = await pose();
  assert.ok(
    distance(afterGallery, original) < 0.02,
    "Closing literature restores the user's view",
  );
  for (const link of await evidence.all())
    assert.ok(
      await link.isVisible(),
      "Closing gallery restores evidence navigation",
    );
  await page.screenshot({
    path: resolve(out, "gallery-return-custom-view.png"),
  });
  const inspect = async (id) => {
    const picker = page.locator(".lab-focus-picker");
    if (!(await picker.evaluate((n) => n.open)))
      await picker.locator("summary").click();
    await page.getByLabel("Inspect laboratory equipment").selectOption(id);
    await page.locator(`.lab-focus-caption[data-object="${id}"]`).waitFor();
    await page.waitForTimeout(350);
    assert.equal(
      await page.locator(".lab-focus-caption").count(),
      1,
      "Only one active caption",
    );
    assert.equal(
      await page.locator("dialog[open]").count(),
      0,
      "Equipment does not open a modal",
    );
  };
  await inspect("laminar-hood");
  for (const link of await evidence.all())
    assert.equal(
      await link.isVisible(),
      false,
      "Evidence dock stays hidden during object inspection",
    );
  await page.screenshot({ path: resolve(out, "clean-bench-focus.png") });
  const beforeZoom = await pose(),
    scroll = await page.evaluate(() => scrollY);
  await page.mouse.move(960, 510);
  await page.mouse.wheel(0, -220);
  await page.waitForTimeout(700);
  const zoomed = await pose();
  assert.ok(
    Math.hypot(...zoomed.position.map((v, i) => v - beforeZoom.position[i])) >
      0.01,
    "Wheel zoom works during inspection",
  );
  assert.equal(
    await page.evaluate(() => scrollY),
    scroll,
    "Lab zoom does not replay the story",
  );
  await inspect("microscope");
  await page.screenshot({ path: resolve(out, "microscope-focus.png") });
  await inspect("tube-rack");
  await page.screenshot({ path: resolve(out, "tube-rack-focus.png") });
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => window.__LAB_CAMERA?.().phase === "idle");
  const restored = await pose();
  for (const link of await evidence.all())
    assert.ok(
      await link.isVisible(),
      "Evidence dock returns after object inspection",
    );
  assert.ok(
    Math.hypot(...restored.position.map((v, i) => v - original.position[i])) <
      0.02,
    "Closing restores the original view after switching and zooming",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(1000);
  await inspect("laminar-hood");
  await page.screenshot({ path: resolve(out, "mobile-clean-bench-focus.png") });
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    "No horizontal overflow",
  );
  await page
    .getByRole("button", { name: "Return to previous laboratory view" })
    .click();
  await page.waitForFunction(() => window.__LAB_CAMERA?.().phase === "idle");
  await page.getByRole("button", { name: "Literature", exact: true }).click();
  await gallery.waitFor();
  await gallery.evaluate(
    (node) => (node.dataset.regressionIdentity = "retained"),
  );
  await page.setViewportSize({ width: 430, height: 900 });
  await page.waitForTimeout(750);
  assert.equal(
    await gallery.getAttribute("data-regression-identity"),
    "retained",
    "Resizing mobile does not remount the open dialog",
  );
  assert.ok(
    await page.getByRole("heading", { name: "Ideas in orbit." }).isVisible(),
    "Gallery content survives mobile resize",
  );
  await page.screenshot({ path: resolve(out, "mobile-gallery-resize.png") });
  await page.getByRole("button", { name: "Back to lab" }).click();
  await gallery.waitFor({ state: "hidden" });
  assert.equal(errors.length, 0, JSON.stringify(errors));
  writeFileSync(
    resolve(out, "verification.json"),
    JSON.stringify(
      {
        original,
        defaultPose,
        afterGallery,
        restored,
        errors,
        checks: [
          "single caption",
          "no modal stack",
          "wheel zoom",
          "preserve scroll",
          "switch objects",
          "restore camera",
          "mobile",
          "custom camera preserved across literature gallery",
          "gallery wheel isolated from lab",
          "five evidence entries restored",
          "mobile gallery retained during resize",
        ],
      },
      null,
      2,
    ),
  );
  console.log(
    "PASS: single-focus camera, wheel zoom, exact return, gallery camera retention, evidence visibility, mobile gallery resize; no page errors.",
  );
} finally {
  await browser.close();
}
