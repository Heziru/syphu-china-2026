import { access, mkdir, readdir, rm, copyFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const srcDir = path.join(
  root,
  "node_modules",
  "@mediapipe",
  "tasks-vision",
  "wasm",
);
const destDir = path.join(root, "public", "mediapipe", "wasm");

const REQUIRED = [
  "vision_wasm_internal.js",
  "vision_wasm_internal.wasm",
  "vision_wasm_nosimd_internal.js",
  "vision_wasm_nosimd_internal.wasm",
  "vision_wasm_module_internal.js",
  "vision_wasm_module_internal.wasm",
];

async function assertExists(filePath, label) {
  try {
    await access(filePath);
  } catch {
    throw new Error(`[copy-mediapipe] Missing ${label}: ${filePath}`);
  }
}

async function main() {
  await assertExists(srcDir, "MediaPipe wasm source directory");

  await rm(destDir, { recursive: true, force: true });
  await mkdir(destDir, { recursive: true });

  const entries = await readdir(srcDir, { withFileTypes: true });
  let copied = 0;
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const from = path.join(srcDir, entry.name);
    const to = path.join(destDir, entry.name);
    await copyFile(from, to);
    copied += 1;
  }

  for (const name of REQUIRED) {
    await assertExists(path.join(destDir, name), `required wasm file ${name}`);
  }

  console.log(
    `[copy-mediapipe] Copied ${copied} file(s) → public/mediapipe/wasm/`,
  );
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
