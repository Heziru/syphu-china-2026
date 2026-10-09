/**
 * Record real Mototype interactions from the built wiki, without browser installs.
 *
 * 1. Build the wiki and serve it on port 5186 (or pass --url).
 * 2. node scripts/software/record-demos.mjs --check
 * 3. node scripts/software/record-demos.mjs --record
 *    Add --clip analysis|mismatch|import to repeat one recording.
 *
 * Outputs: public/assets/software/mototype/demos/{analysis,mismatch,import}
 *          .webm (VP9), .jpg (actual demonstration frame), .vtt (English captions).
 *
 * CDP captures the actual application at 10 fps. An invisible browser page only
 * encodes those frames with native MediaRecorder; it does not reconstruct UI.
 * Setup is completed before recording. Only a non-interactive pointer ring is
 * overlaid. These recordings use synthetic fixtures, never wet-lab results.
 * Watch each generated clip before publishing it. Rebuild after recording so
 * Vite copies the files into dist. No website source or data is modified here.
 */
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { launchReviewBrowser } from "../browser-review.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const out = resolve(root, "public/assets/software/mototype/demos");
const args = process.argv.slice(2);
const option = (name, fallback) => {
  const index = args.indexOf(name);
  return index < 0 ? fallback : args[index + 1];
};
const url = option("--url", "http://127.0.0.1:5186/syphu-china/software");
const only = option("--clip", "all");
assert(["all", "analysis", "mismatch", "import"].includes(only), "Unknown --clip");
const viewport = { width: 1512, height: 1080 };
const pause = (ms) => new Promise((done) => setTimeout(done, ms));
const browser = await launchReviewBrowser({
  args: ["--disable-background-timer-throttling", "--disable-renderer-backgrounding", "--disable-backgrounding-occluded-windows"],
});

// Chrome MediaRecorder writes a streaming WebM without duration metadata.
// Add a Duration to its Segment Info, preserving every encoded frame unchanged.
function withDuration(buffer, milliseconds) {
  function vint(offset, id = false) {
    let width = 1, mask = 128;
    while (!(buffer[offset] & mask) && width < 8) { width++; mask >>= 1; }
    let value = BigInt(buffer[offset] & (id ? 255 : mask - 1));
    for (let i = 1; i < width; i++) value = value * 256n + BigInt(buffer[offset + i]);
    return { width, value, unknown: !id && value === (1n << BigInt(7 * width)) - 1n };
  }
  function element(offset) {
    const id = vint(offset, true), size = vint(offset + id.width);
    const start = offset + id.width + size.width;
    return { id: Number(id.value), size, start, end: size.unknown ? buffer.length : start + Number(size.value), offset };
  }
  let segment;
  for (let p = 0; p < buffer.length;) {
    const el = element(p);
    if (el.id === 0x18538067) { segment = el; break; }
    p = el.end;
  }
  assert(segment?.size.unknown, "Expected a streaming WebM Segment");
  let info;
  for (let p = segment.start; p < segment.end;) {
    const el = element(p);
    if (el.id === 0x1549a966) { info = el; break; }
    p = el.end;
  }
  assert(info, "WebM Segment Info is missing");
  let scale = 1e6;
  for (let p = info.start; p < info.end;) {
    const el = element(p);
    if (el.id === 0x2ad7b1) scale = Number(BigInt("0x" + buffer.subarray(el.start, el.end).toString("hex")));
    assert(el.id !== 0x4489, "Unexpected existing WebM Duration");
    p = el.end;
  }
  const duration = Buffer.alloc(11);
  duration.set([0x44, 0x89, 0x88]);
  duration.writeDoubleBE(milliseconds * 1e6 / scale, 3);
  const length = info.end - info.start + duration.length;
  const size = Buffer.alloc(info.size.width);
  let encoded = BigInt(length) | (1n << BigInt(7 * size.length));
  assert(BigInt(length) < (1n << BigInt(7 * size.length)) - 1n, "Info size exceeds its existing encoding");
  for (let i = size.length - 1; i >= 0; i--) { size[i] = Number(encoded & 255n); encoded >>= 8n; }
  return Buffer.concat([
    buffer.subarray(0, info.start - info.size.width), size,
    buffer.subarray(info.start, info.end), duration, buffer.subarray(info.end),
  ]);
}

function timestamp(seconds) {
  const ms = Math.round(seconds * 1000);
  return [Math.floor(ms / 3600000), Math.floor(ms / 60000) % 60, Math.floor(ms / 1000) % 60]
    .map((n) => String(n).padStart(2, "0")).join(":") + "." + String(ms % 1000).padStart(3, "0");
}

async function startCapture(context, page, crop) {
  const encoder = await context.newPage();
  await encoder.setContent('<canvas id="frames"></canvas>');
  await encoder.evaluate(({ width, height }) => {
    const canvas = document.querySelector("canvas");
    canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext("2d", { alpha: false });
    const stream = canvas.captureStream(0);
    const chunks = [];
    const recorder = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp9", videoBitsPerSecond: 2600000 });
    recorder.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
    window.demoEncoder = { ctx, recorder, chunks, frame: null, stream };
    window.demoEncoder.timer = setInterval(() => {
      const state = window.demoEncoder;
      if (state.frame) {
        ctx.drawImage(state.frame, 0, 0, width, height);
        stream.getVideoTracks()[0].requestFrame();
      }
    }, 50);
  }, crop);
  async function draw(data) {
    await encoder.evaluate(async ({ data, crop }) => {
      const img = new Image(); img.src = "data:image/jpeg;base64," + data;
      await img.decode();
      const tile = document.createElement("canvas");
      tile.width = crop.width; tile.height = crop.height;
      tile.getContext("2d").drawImage(img, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);
      window.demoEncoder.frame = tile;
      window.demoEncoder.ctx.drawImage(tile, 0, 0);
    }, { data, crop });
  }
  await page.bringToFront();
  await draw((await page.screenshot({ type: "jpeg", quality: 92 })).toString("base64"));
  const cdp = await context.newCDPSession(page);
  await encoder.bringToFront();
  await encoder.evaluate(() => window.demoEncoder.recorder.start(1000));
  const start = performance.now();
  let running = true, frameCount = 0;
  // Active screenshot requests also render a background tab. Passive screencast
  // events can stall while the encoder tab is active in a headless browser.
  const frames = (async () => {
    while (running) {
      const tick = performance.now();
      const shot = await cdp.send("Page.captureScreenshot", { format: "jpeg", quality: 92, captureBeyondViewport: false });
      await draw(shot.data); frameCount++;
      await pause(Math.max(0, 100 - (performance.now() - tick)));
    }
  })();
  return {
    elapsed: () => (performance.now() - start) / 1000,
    async stop() {
      const duration = performance.now() - start;
      running = false;
      await frames;
      assert(frameCount >= duration / 1000 * 4, "Browser capture could not sustain 4 fps");
      const base64 = await encoder.evaluate(() => new Promise((done) => {
        const state = window.demoEncoder;
        state.recorder.onstop = () => {
          clearInterval(state.timer);
          state.stream.getTracks().forEach((track) => track.stop());
          const reader = new FileReader();
          reader.onload = () => done(reader.result.split(",")[1]);
          reader.readAsDataURL(new Blob(state.chunks, { type: "video/webm" }));
        };
        state.recorder.stop();
      }));
      await cdp.detach();
      await encoder.close();
      return { buffer: withDuration(Buffer.from(base64, "base64"), duration), duration };
    },
  };
}

async function prepare(context) {
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  await page.locator(".mt-workbench").waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => {
    const cursor = document.createElement("div");
    cursor.style.cssText = "position:fixed;left:-40px;top:-40px;width:22px;height:22px;border:2px solid #ae652c;background:#e5b95a33;border-radius:50%;pointer-events:none;z-index:2147483647;transform:translate(-50%,-50%)";
    document.body.append(cursor);
    document.addEventListener("mousemove", (e) => { cursor.style.left = e.clientX + "px"; cursor.style.top = e.clientY + "px"; });
  });
  await frameWorkbench(page);
  return page;
}

async function frameWorkbench(page) {
  await page.locator(".mt-workbench").evaluate((el) => window.scrollTo({ top: scrollY + el.getBoundingClientRect().top - 84, behavior: "instant" }));
}
async function frameResults(page) {
  await page.locator(".mt-decision").evaluate((el) => window.scrollTo({ top: scrollY + el.getBoundingClientRect().top - 530, behavior: "instant" }));
}
async function point(page, locator) {
  await locator.scrollIntoViewIfNeeded();
  await locator.evaluate((el) => {
    const bounds = el.getBoundingClientRect();
    const width = Math.floor((document.querySelector(".mt-workbench").getBoundingClientRect().width + 24) / 8) * 8;
    if (bounds.top < 90 || bounds.bottom > 72 + width * 3 / 4 - 20)
      scrollBy({ top: bounds.top - 150, behavior: "instant" });
  });
  const b = await locator.boundingBox();
  assert(b, "Demo target is not visible");
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 16 });
  await pause(450);
}
async function click(page, locator) { await point(page, locator); await locator.click(); }
async function expectResult(page, value) {
  await page.waitForFunction((expected) => document.querySelector(".mt-workbench")?.dataset.result === expected, value);
}

async function record(name) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion: "reduce" });
  const page = await prepare(context);
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const wb = await page.locator(".mt-workbench").boundingBox();
  const width = Math.floor((wb.width + 24) / 8) * 8;
  const crop = { x: Math.max(0, Math.floor(wb.x - 12)), y: 72, width, height: width * 3 / 4 };
  assert(crop.x + crop.width <= viewport.width, "Crop exceeds viewport");
  assert(crop.y + crop.height <= viewport.height, "Crop exceeds viewport height");
  const poster = () => page.screenshot({ path: resolve(out, name + ".jpg"), type: "jpeg", quality: 90, clip: crop });
  const capture = await startCapture(context, page, crop), cues = [];
  async function step(text, action = async () => {}, seconds = 4.5) {
    const start = capture.elapsed();
    await action();
    await pause(Math.max(0, seconds * 1000 - (capture.elapsed() - start) * 1000));
    cues.push({ start, end: capture.elapsed(), text });
  }
  const button = (label) => page.getByRole("button", { name: label, exact: true });
  if (name === "analysis") {
    await step("Synthetic example, not wet-lab data. Early readings allow several response profiles.");
    await step("Add the 2 h readings. The set of compatible profiles becomes narrower.", async () => {
      await click(page, button("02 Add 2 h")); await expectResult(page, "ready");
    }, 5);
    await step("Check 4 h against measurements that were not used to fit the curve.", async () => {
      await click(page, button("03 Check 4 h")); await expectResult(page, "pass");
      await poster();
    }, 5);
    await step("Compare held-out errors and the error budget. Passing the model check is a separate result from the observed requirement.", async () => {
      await frameResults(page);
      await point(page, page.locator(".mt-mini-table"));
    }, 6);
    await step("Read the run on this page: inputs, settings, results and model limitations.", async () => {
      await click(page, page.locator(".mt-report > summary"));
      await page.locator(".mt-report").evaluate((el) => scrollTo({ top: scrollY + el.getBoundingClientRect().top - 95, behavior: "instant" }));
    }, 6);
  } else if (name === "mismatch") {
    await step("Choose the synthetic model-mismatch example.", async () => {
      const select = page.getByLabel("Dataset", { exact: true });
      await point(page, select); await select.selectOption("mismatch");
    });
    await step("The held-out observations fail at the original 5 RFU error budget.", async () => {
      await click(page, button("03 Check 4 h")); await expectResult(page, "fail");
      await poster();
    }, 5);
    await step("Inspect prediction errors. Derived parameters are withheld when this check fails.", async () => {
      await frameResults(page);
      await point(page, page.locator(".mt-mini-table"));
      assert.equal(await page.locator(".mt-parameters").count(), 0);
    }, 5);
    await step("Increase the exploratory error budget to 20 RFU.", async () => {
      await frameWorkbench(page);
      const slider = page.getByLabel(/Error budget/);
      await point(page, slider); await slider.focus();
      for (let i = 0; i < 15; i++) { await slider.press("ArrowRight"); await pause(65); }
      await expectResult(page, "pass");
    }, 5);
    await step("The first rejection remains visible. Changing the budget after viewing holdout data is an exploratory reassessment.", async () => {
      await frameResults(page);
      await point(page, page.locator(".mt-history"));
      assert.match(await page.locator(".mt-history").innerText(), /rejected.*budget has changed/s);
    }, 7);
  } else {
    await step("Import a synthetic CSV directly on the page. No download is needed.", async () => {
      await click(page, page.locator(".mt-inputs > summary"));
      await click(page, page.locator(".mt-paste > summary"));
    }, 5);
    await step("Fill the editor with the synthetic example and inspect the CSV text.", async () => {
      await click(page, button("Fill with synthetic example"));
      await point(page, page.getByLabel("CSV text", { exact: true }));
      await poster();
    }, 5);
    await step("Confirm the fixed sample, environment and measurement mapping before loading.", async () => {
      const checkbox = page.locator(".mt-binding input[type=checkbox]");
      await point(page, checkbox); await checkbox.check();
    }, 5);
    await step("Load the pasted CSV. The browser validates the input and recomputes the analysis.", async () => {
      await click(page, button("Load pasted CSV"));
      await page.getByText("Input loaded.", { exact: false }).waitFor();
      await frameWorkbench(page);
      assert.equal(await page.locator(".mt-workbench").getAttribute("data-stage"), "early");
    }, 5);
    await step("Use the same fitting and held-out checks for this imported synthetic dataset.", async () => {
      await click(page, button("02 Add 2 h")); await expectResult(page, "ready");
      await pause(1000);
      await click(page, button("03 Check 4 h")); await expectResult(page, "pass");
    }, 6);
  }
  const result = await capture.stop();
  assert.deepEqual(errors, []);
  assert(result.duration >= 20000 && result.duration <= 40000, "Clip must be 20–40 seconds");
  await writeFile(resolve(out, name + ".webm"), result.buffer);
  await writeFile(resolve(out, name + ".vtt"), "WEBVTT\n\n" + cues.map((cue, i) =>
    `${i + 1}\n${timestamp(cue.start)} --> ${timestamp(cue.end)}\n${cue.text}\n`).join("\n"));
  console.log(`${name}: ${(result.duration / 1000).toFixed(1)} s, ${crop.width} × ${crop.height}, ${(result.buffer.length / 1048576).toFixed(2)} MiB; ${cues.length} English cues`);
  await context.close();
}

try {
  const context = await browser.newContext({ viewport });
  const page = await prepare(context);
  assert(await page.evaluate(() => MediaRecorder.isTypeSupported("video/webm;codecs=vp9")), "Browser cannot encode VP9");
  console.log(`Browser ${browser.version()}; native VP9 supported; ${url}`);
  console.log("Expected outputs: " + out + "/{analysis,mismatch,import}.{webm,jpg,vtt}");
  console.log("Application ready; setup is excluded from recordings.");
  if (args.includes("--check")) {
    // Exercise the capture and metadata path in memory; publish no test clip.
    const smoke = await startCapture(context, page, { x: 0, y: 0, width: 640, height: 480 });
    await pause(1500);
    const result = await smoke.stop();
    const metadata = await page.evaluate((base64) => new Promise((done, reject) => {
      const video = document.createElement("video");
      video.onloadedmetadata = () => done({ duration: video.duration, width: video.videoWidth, height: video.videoHeight });
      video.onerror = () => reject(new Error("Generated WebM could not be decoded"));
      video.src = "data:video/webm;base64," + base64;
    }), result.buffer.toString("base64"));
    assert(Number.isFinite(metadata.duration) && metadata.duration > 0);
    assert.equal(metadata.width, 640);
    assert.equal(metadata.height, 480);
    console.log("In-memory capture and browser playback metadata verified: " + JSON.stringify(metadata));
  }
  await context.close();
  if (args.includes("--record")) {
    await mkdir(out, { recursive: true });
    for (const name of only === "all" ? ["analysis", "mismatch", "import"] : [only]) await record(name);
  } else {
    console.log("Check only. Pass --record after the final UI build is ready.");
  }
} finally {
  await browser.close();
}
