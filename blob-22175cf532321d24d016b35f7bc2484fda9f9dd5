import { build } from "esbuild";
import { readFileSync, writeFileSync } from "node:fs";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { gzipSync } from "node:zlib";
const compiled = await build({
  entryPoints: ["src/contents/home/journey/globeGeometry.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  write: false,
});
const { geography } = await import(
  "data:text/javascript;base64," +
    Buffer.from(compiled.outputFiles[0].text).toString("base64")
);
const data = JSON.parse(
  readFileSync("public/assets/cosmic/ibd-regions.json", "utf8"),
);
const t = performance.now();
const a = geography(data, 1990),
  b = geography(data, 2019);
let offset = 0;
const chunks = [];
const append = (array) => {
  const result = { offset, length: array.length };
  const bytes = Buffer.from(array.buffer, array.byteOffset, array.byteLength);
  chunks.push(bytes);
  offset += bytes.byteLength;
  const padding = (4 - (offset % 4)) % 4;
  if (padding) {
    chunks.push(Buffer.alloc(padding));
    offset += padding;
  }
  return result;
};
const regions = b.map((region, i) => {
  const g = region.geometry;
  g.morphAttributes.position.unshift(a[i].geometry.morphAttributes.position[0]);
  const indexed = mergeVertices(g, 0.00001);
  let x = 0,
    z = 0;
  for (const feature of data.features.filter((f) => f.region === region.name))
    for (const poly of feature.polygons)
      for (const q of poly[0]) {
        const lat = (q[1] * Math.PI) / 180,
          lon = (q[0] * Math.PI) / 180;
        x += Math.cos(lat) * Math.sin(lon);
        z += Math.cos(lat) * Math.cos(lon);
      }
  const quantized = (array, scale) =>
    Int16Array.from(array, (n) =>
      Math.round(Math.max(-1, Math.min(1, n / scale)) * 32767),
    );
  const heights = (array) =>
    Uint16Array.from({ length: array.length / 3 }, (_, j) =>
      Math.round(
        (Math.max(
          0,
          Math.hypot(array[j * 3], array[j * 3 + 1], array[j * 3 + 2]) - 2.052,
        ) /
          0.26) *
          65535,
      ),
    );
  const result = {
    name: region.name,
    focusLongitude: -Math.atan2(x, z),
    position: append(quantized(indexed.attributes.position.array, 2.052)),
    normal: append(quantized(indexed.attributes.normal.array, 1)),
    morph1990: append(heights(indexed.morphAttributes.position[0].array)),
    morph2019: append(heights(indexed.morphAttributes.position[1].array)),
    index: append(new Uint32Array(indexed.index.array)),
  };
  indexed.dispose();
  return result;
});
const meta = {
  source: data.source,
  metric: data.metric,
  regions: data.regions,
  geometry: regions,
};
writeFileSync("public/assets/cosmic/earth-geometry.bin", Buffer.concat(chunks));
const compressed = gzipSync(Buffer.concat(chunks), { level: 9 });
writeFileSync("public/assets/cosmic/earth-geometry.bin.gz", compressed);
writeFileSync("public/assets/cosmic/earth-manifest.json", JSON.stringify(meta));
// A tiny synchronous cartographic preview for the opening frame; detailed data
// can load independently without leaving an empty orbit.
function simplify(points, tolerance = 0.42) {
  if (points.length < 4) return points;
  const a = points[0],
    b = points.at(-1);
  let max = 0,
    index = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const p = points[i],
      dx = b[0] - a[0],
      dy = b[1] - a[1],
      l = dx * dx + dy * dy;
    const t = l
      ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l))
      : 0;
    const d = Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
    if (d > max) {
      max = d;
      index = i;
    }
  }
  if (max > tolerance) {
    const left = simplify(points.slice(0, index + 1), tolerance),
      right = simplify(points.slice(index), tolerance);
    return [...left.slice(0, -1), ...right];
  }
  return [a, b];
}
const preview = data.features
  .flatMap((f) => f.polygons)
  .map((poly) =>
    poly.map((r) => {
      const origin = r[0][0];
      const unwrapped = r.map(([lon, lat]) => {
        while (lon - origin > 180) lon -= 360;
        while (lon - origin < -180) lon += 360;
        return [lon, lat];
      });
      return simplify(unwrapped).map((q) =>
        q.map((n) => Math.round(n * 100) / 100),
      );
    }),
  )
  .filter((poly) => poly[0].length > 3);
writeFileSync(
  "src/contents/home/journey/globePreviewData.ts",
  "// Generated from the same Natural Earth geometry as the data globe.\nexport const PREVIEW_POLYGONS: number[][][][] = " +
    JSON.stringify(preview) +
    ";\n",
);
const benchmark = {
  buildMilliseconds: performance.now() - t,
  originalVertices: 7356234,
  vertices: regions.reduce((n, g) => n + g.position.length / 3, 0),
  triangles: regions.reduce((n, g) => n + g.index.length / 3, 0),
  bytes: offset,
  compressedBytes: compressed.length,
  regions: regions.length,
};
writeFileSync(
  "outputs/globe-geometry-benchmark.json",
  JSON.stringify(benchmark, null, 2),
);
console.log(benchmark);
