import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { Box3, Vector3, Mesh } from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
const names = [
  "library",
  "research-building",
  "digestive-system",
  "colon-section",
  "engineered-ecn",
  "clean-bench",
];
for (const name of names) {
  const bytes = await readFile("public/assets/models/" + name + ".glb");
  const asset = await new GLTFLoader().parseAsync(
    bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
    "",
  );
  asset.scene.updateMatrixWorld(true);
  const box = new Box3().setFromObject(asset.scene),
    size = box.getSize(new Vector3());
  const buckets = new Map();
  let meshes = 0;
  asset.scene.traverse((o) => {
    if (!(o instanceof Mesh)) return;
    meshes++;
    const g = o.geometry.clone().applyMatrix4(o.matrixWorld);
    for (const a of Object.keys(g.attributes))
      if (!["position", "normal"].includes(a)) g.deleteAttribute(a);
    if (!g.getAttribute("normal")) g.computeVertexNormals();
    for (const n of g.getAttribute("position").array)
      assert.ok(Number.isFinite(n), name + " invalid vertex");
    const b = buckets.get(o.material) ?? [];
    b.push(g);
    buckets.set(o.material, b);
  });
  assert.ok(meshes > 5, name + " must retain detailed semantic parts");
  for (const [, geometries] of buckets) {
    const merged = mergeGeometries(geometries, false);
    assert.ok(merged, name + " material batch must preserve all its geometry");
    const count = geometries.reduce(
      (n, g) => n + g.attributes.position.count,
      0,
    );
    assert.equal(
      merged.attributes.position.count,
      count,
      name + " cannot lose geometry while batching",
    );
    geometries.forEach((g) => g.dispose());
    merged.dispose();
  }
  if (name === "clean-bench") {
    assert.ok(box.min.y > -0.001 && box.min.y < 0.04, "casters near floor");
    assert.ok(
      size.y > 1.4 && size.y < 1.7,
      "hood fits existing scale contract",
    );
  }
  if (name === "digestive-system")
    assert.ok(size.y > size.x * 1.5, "digestive tract is exported upright");
  if (name === "library")
    assert.ok(size.x > size.y * 1.9, "library silhouette proportion");
  if (name === "engineered-ecn")
    assert.ok(
      [...buckets.keys()].some((m) => /pspa/i.test(m.name)),
      "PspA must remain a separately controllable material",
    );
  console.log(
    name +
      ": " +
      meshes +
      " parts → " +
      buckets.size +
      " material batches; " +
      Math.round(bytes.length / 1024) +
      " KiB",
  );
}
