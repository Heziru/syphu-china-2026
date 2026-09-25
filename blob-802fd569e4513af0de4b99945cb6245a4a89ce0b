import { launchReviewBrowser } from "./browser-review.mjs";
import { mkdirSync, existsSync, readFileSync } from "node:fs";
import assert from "node:assert/strict";
import { build } from "esbuild";

async function load(entry) {
  const result = await build({
    entryPoints: [entry],
    bundle: true,
    platform: "node",
    format: "esm",
    write: false,
  });
  return import(
    "data:text/javascript;base64," +
      Buffer.from(result.outputFiles[0].text).toString("base64")
  );
}
const { galleryOffset, nearestGalleryPosition, galleryCurvePose } = await load(
  "src/contents/home/ui/literatureGalleryMotion.ts",
);
const { LITERATURE } = await load("src/contents/home/data/literature.ts");
for (let p = -100; p < 100; p += 0.13)
  for (let i = 0; i < LITERATURE.length; i++) {
    assert.ok(Math.abs(galleryOffset(i, p, 8)) <= 4);
    assert.ok(
      Math.abs(galleryOffset(i, p + 8, 8) - galleryOffset(i, p, 8)) < 1e-9,
    );
    const target = nearestGalleryPosition(i, p, 8);
    assert.ok(Math.abs(target - p) <= 4);
    assert.ok(Math.abs(galleryOffset(i, target, 8)) < 1e-9);
  }
assert.equal(new Set(LITERATURE.map((paper) => paper.source)).size, 8);
assert.ok(
  LITERATURE.every((paper) => /^https:\/\/doi\.org\/10\./.test(paper.source)),
);
const previews = JSON.parse(
  readFileSync(
    "public/assets/laboratory/literature/preview-sources.json",
    "utf8",
  ),
);
for (const paper of LITERATURE) {
  if (!paper.image) continue;
  const record = previews.papers.find(
    (preview) => preview.preview === paper.image,
  );
  assert.equal(
    record.doi.toLowerCase(),
    paper.source.replace("https://doi.org/", "").toLowerCase(),
  );
  assert.equal(record.page, 1);
  assert.ok(
    existsSync(`public/assets/laboratory/literature/${record.preview}`),
  );
  assert.ok(
    existsSync(`public/assets/laboratory/literature/${record.small_preview}`),
  );
}
for (const width of [390, 768, 1440])
  for (let position = -8; position < 16; position += 0.125) {
    const center = galleryCurvePose(0, position, 8, width);
    assert.ok(Math.hypot(center.x, center.y, center.z) < 1e-8);
    for (let offset = -3.2; offset <= 3.2; offset += 0.2) {
      const pose = galleryCurvePose(offset, position, 8, width);
      const nextTurn = galleryCurvePose(offset, position + 8, 8, width);
      assert.ok(
        pose.z <= 1e-8,
        "Nearby papers remain behind the focal tangent; no camera crossings",
      );
      for (const axis of ["x", "y", "z", "scale"]) {
        assert.ok(Number.isFinite(pose[axis]));
        assert.ok(
          Math.abs(pose[axis] - nextTurn[axis]) < 1e-7,
          "The travelling curve closes without a jump",
        );
      }
    }
  }

mkdirSync("outputs/gallery-review", { recursive: true });
const browser = await launchReviewBrowser();
const context = await browser.newContext({
  viewport: { width: 1440, height: 960 },
  reducedMotion: "reduce",
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
// Verify genuine native-anchor navigation without depending on publisher network access.
await context.route("https://doi.org/**", (route) =>
  route.fulfill({
    contentType: "text/html",
    body: "<title>DOI navigation check</title>",
  }),
);
try {
  await page.goto("http://127.0.0.1:5174/syphu-china/", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForSelector(".lab-literature-launch", { state: "attached" });
  await page.evaluate(() =>
    window.dispatchEvent(new CustomEvent("lab:literature", { detail: "teng" })),
  );
  await page.waitForSelector(".literature-gallery[open]");
  await page.waitForTimeout(300);
  const active = page.locator(
    '.literature-gallery__frame[data-focused="true"]',
  );
  assert.equal(
    await active.locator(".literature-gallery__doi").getAttribute("href"),
    LITERATURE[2].source,
  );
  await page.screenshot({ path: "outputs/gallery-review/gallery-desktop.png" });
  const popupPromise = page.waitForEvent("popup");
  await active.click();
  const popup = await popupPromise;
  await popup.waitForLoadState("domcontentloaded");
  assert.equal(popup.url(), LITERATURE[2].source);
  await popup.close();
  for (let i = 0; i < 8; i++) {
    await page.getByRole("button", { name: "Next paper", exact: true }).click();
    await page.waitForTimeout(80);
    const preview = active.locator("img");
    if (await preview.count())
      await preview.evaluate((image) =>
        image.complete && image.naturalWidth > 0
          ? Promise.resolve()
          : new Promise((resolve, reject) => {
              image.onload = resolve;
              image.onerror = reject;
            }),
      );
  }
  assert.equal(
    await active.locator(".literature-gallery__doi").getAttribute("href"),
    LITERATURE[2].source,
  );
  await page.getByRole("button", { name: "All papers" }).click();
  assert.equal(await page.locator(".literature-gallery__index a").count(), 8);
  for (let i = 0; i < 8; i++)
    assert.equal(
      await page
        .locator(".literature-gallery__index a")
        .nth(i)
        .getAttribute("href"),
      LITERATURE[i].source,
    );
  await page.screenshot({ path: "outputs/gallery-review/gallery-index.png" });
  await page.keyboard.press("Escape");
  assert.equal(await page.locator(".literature-gallery[open]").count(), 0);
  assert.notEqual(
    await page.evaluate(() => document.body.style.overflow),
    "hidden",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() =>
    window.dispatchEvent(new CustomEvent("lab:literature", { detail: "wang" })),
  );
  await page.waitForSelector(".literature-gallery[open]");
  await page.waitForTimeout(200);
  await page.screenshot({ path: "outputs/gallery-review/gallery-mobile.png" });
  const bounds = await active.boundingBox();
  assert.ok(
    bounds.x >= 0 && bounds.x + bounds.width <= 390,
    "Focused frame fits a narrow screen",
  );
  const footer = await page
    .locator(".literature-gallery__footer")
    .boundingBox();
  assert.ok(
    bounds.y + bounds.height < footer.y,
    "Frame and controls do not overlap",
  );
  await page.keyboard.press("ArrowLeft");
  await page.waitForTimeout(80);
  assert.equal(
    await active.locator(".literature-gallery__doi").getAttribute("href"),
    LITERATURE[0].source,
  );
  await page.keyboard.press("Escape");
  assert.deepEqual(errors, []);
  console.log(
    "PASS: closed depth curve, authentic preview manifest/images, direct DOI navigation, all references, keyboard, mobile layout, Escape and scroll restoration.",
  );
} finally {
  await browser.close();
}
