import {
  readFile,
  readdir,
  mkdir,
  copyFile,
  writeFile,
  rm,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const output = path.join(root, ".igem-pages");
const manifest = JSON.parse(
  await readFile(path.join(root, "src/data/igem-assets.json"), "utf8"),
);

// These belong to previous, unreachable scenes. Keep the sources for local work.
const unused = [
  /^mediapipe\//,
  /^assets\/laboratory\/simple-lab-reference\.png$/,
  /^assets\/models\/(colon-section|digestive-system|engineered-ecn)\.glb$/,
  /^assets\/cosmic\/(earth-geometry\.bin|ibd-regions\.json|world-map\.svg)$/,
  /^assets\/school\/school-building\.jpg$/,
  /^assets\/story\/mascot-.*\.svg$/,
];

async function listFiles(directory, prefix = "") {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relative = prefix + entry.name;
    if (entry.isDirectory())
      files.push(
        ...(await listFiles(path.join(directory, entry.name), relative + "/")),
      );
    else if (entry.isFile()) files.push(relative);
  }
  return files;
}

if (process.env.VITE_IGEM_CDN !== "true") {
  throw new Error(
    "Official packaging requires VITE_IGEM_CDN=true for both build and packaging.",
  );
}
if (!Object.keys(manifest).length)
  throw new Error("The official asset upload manifest is empty.");
for (const [key, value] of Object.entries(manifest)) {
  if (!key.startsWith("assets/") || key.includes("..") || key.includes("\\")) {
    throw new Error(`Invalid public asset path: ${key}`);
  }
  const url = new URL(value);
  if (
    url.protocol !== "https:" ||
    url.hostname !== "static.igem.wiki" ||
    url.username ||
    url.password
  ) {
    throw new Error(
      `An official static.igem.wiki upload is required for ${key}`,
    );
  }
}

const files = await listFiles(dist);
const scripts = (
  await Promise.all(
    files
      .filter((file) => file.endsWith(".js"))
      .map((file) => readFile(path.join(dist, file), "utf8")),
  )
).join("\n");
// Catch an accidentally packaged local/GitHub build or a stale manifest.
for (const url of Object.values(manifest)) {
  if (!scripts.includes(url))
    throw new Error(`Rebuild with the current iGEM upload manifest: ${url}`);
}

const keep = files.filter(
  (file) => !manifest[file] && !unused.some((pattern) => pattern.test(file)),
);
const unmapped = keep.filter((file) =>
  /\.(png|jpe?g|webp|avif|gif|glb)$/i.test(file),
);
if (unmapped.length)
  throw new Error(
    `Assets still need official uploads (or review-only imports need guarding):\n${unmapped.join("\n")}`,
  );

const redirects =
  "/syphu-china/* /syphu-china/index.html 200\n/* /index.html 200\n";
const sizes = await Promise.all(
  keep.map(async (file) => (await readFile(path.join(dist, file))).byteLength),
);
const total = sizes.reduce(
  (sum, size) => sum + size,
  Buffer.byteLength(redirects),
);
// A raw-size budget plus generous ZIP headers fits even without artifact compression.
if (total + (keep.length + 1) * 512 >= 5_000_000) {
  throw new Error(
    `Official Pages package exceeds the 5 MB budget: ${total} bytes before ZIP headers.`,
  );
}

// Fixed, resolved output under this repository; never touch source public/ assets.
if (path.dirname(output) !== root || path.basename(output) !== ".igem-pages")
  throw new Error("Unsafe output path");
await rm(output, { recursive: true, force: true });
for (const file of keep) {
  const destination = path.join(output, file);
  await mkdir(path.dirname(destination), { recursive: true });
  await copyFile(path.join(dist, file), destination);
}
await writeFile(path.join(output, "_redirects"), redirects);
console.log(
  `Official Pages: ${keep.length + 1} files, ${total} bytes raw; ${Object.keys(manifest).length} official CDN mappings.`,
);
