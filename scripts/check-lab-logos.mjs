import { launchReviewBrowser } from "./browser-review.mjs";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
const stage = process.argv[2] === "after" ? "after" : "before";
const out = resolve("outputs/lab-logo-review");
mkdirSync(out, { recursive: true });
const browser = await launchReviewBrowser();
try {
  const page = await browser.newPage({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 2,
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://127.0.0.1:5174/syphu-china/", {
    waitUntil: "networkidle",
  });
  const measurements = await page.evaluate(async () => {
    const paths = [
      "school/school-logo.jpg",
      "laboratory/team-logo.png",
      "laboratory/project-logo.png",
    ];
    return Promise.all(
      paths.map(async (path) => {
        const image = new Image();
        image.src = `/syphu-china/assets/${path}`;
        await image.decode();
        const canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0);
        const { data } = ctx.getImageData(0, 0, image.width, image.height);
        let left = image.width,
          top = image.height,
          right = 0,
          bottom = 0;
        for (let y = 0; y < image.height; y++)
          for (let x = 0; x < image.width; x++) {
            if (data[(y * image.width + x) * 4 + 3] > 0) {
              left = Math.min(left, x);
              top = Math.min(top, y);
              right = Math.max(right, x);
              bottom = Math.max(bottom, y);
            }
          }
        return {
          path,
          width: image.width,
          height: image.height,
          alphaBounds: {
            left,
            top,
            right,
            bottom,
            width: right - left + 1,
            height: bottom - top + 1,
          },
        };
      }),
    );
  });
  await page.getByRole("button", { name: /Skip to lab/ }).click();
  await page.waitForFunction(() => window.__LAB_CAMERA?.().phase === "idle");
  await page.waitForTimeout(1200);
  await page.screenshot({ path: resolve(out, `${stage}-overview.png`) });
  await page.mouse.move(1040, 660);
  await page.mouse.wheel(0, -520);
  await page.waitForTimeout(900);
  await page.screenshot({ path: resolve(out, `${stage}-near.png`) });
  await page.screenshot({
    path: resolve(out, `${stage}-logo-detail.png`),
    clip: { x: 998, y: 217, width: 207, height: 103 },
  });
  writeFileSync(
    resolve(out, `${stage}.json`),
    JSON.stringify({ measurements, errors }, null, 2),
  );
  console.log(JSON.stringify({ stage, measurements, errors }, null, 2));
} finally {
  await browser.close();
}
