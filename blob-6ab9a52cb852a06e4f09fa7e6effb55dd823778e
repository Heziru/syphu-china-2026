import assert from "node:assert/strict";
import { build } from "esbuild";
async function load(entry) {
  const output = await build({
    entryPoints: [entry],
    bundle: true,
    platform: "node",
    format: "esm",
    write: false,
  });
  return import(
    "data:text/javascript;base64," +
      Buffer.from(output.outputFiles[0].text).toString("base64")
  );
}
const math = await load("src/contents/home/laboratory/layoutMath.ts");
const layout = await load("src/contents/home/laboratory/roomPlacement.ts");
assert.equal(
  layout.validateLayout().valid,
  true,
  JSON.stringify(layout.validateLayout()),
);
const a = [-3.8, -4.6],
  b = [-5.65, 0.5];
const forward = math.wallAnchorFromSegment(a, b, 0.64, 1.9, 0.78);
const reverse = math.wallAnchorFromSegment(b, a, 0.36, 1.9, 0.78);
forward.position.forEach((v, i) =>
  assert.ok(Math.abs(v - reverse.position[i]) < 1e-9),
);
assert.ok(Math.abs(forward.rotationY - reverse.rotationY) < 1e-9);
const table = {
  id: "table",
  position: [0, 0, 0],
  rotationY: 0,
  size: [2, 0.8, 1],
};
const device = {
  id: "device",
  position: [0, 0.8, 0],
  rotationY: 0,
  size: [0.6, 0.5, 0.5],
};
// Regression: the old computer intersected the inward-projecting window sill.
const oldDryFrame = math.wallAnchorFromSegment(a, b, 0.64, 1.9, 0.78);
const oldComputer = {
  id: "old-computer",
  size: [1.35, 0.7, 0.66],
  position: math.transformPoint(oldDryFrame, [0, 0.8, -0.03]),
  rotationY: oldDryFrame.rotationY,
};
assert.equal(
  math.validateAABBNoOverlap([oldComputer, layout.WINDOW_SILL]).length,
  1,
);
assert.equal(
  math.validateAABBNoOverlap([
    layout.furnitureById("computer"),
    layout.WINDOW_SILL,
  ]).length,
  0,
);
const hood = layout.furnitureById("laminar-hood");
assert.equal(hood.mount, "floor");
assert.equal(hood.position[1], 0);
assert.ok(hood.position[0] > 3, "Hood belongs in the right service area");
assert.equal(hood.supportedBy, undefined);
assert.equal(
  math.validateAABBNoOverlap([table, device]).length,
  0,
  "support contact",
);
assert.equal(
  math.validateAABBNoOverlap([table, { ...device, position: [0, 0.79, 0] }])
    .length,
  1,
  "embedded device",
);
const diagonal = {
  id: "diagonal-a",
  position: [0, 0, 0],
  rotationY: Math.PI / 4,
  size: [2, 1, 0.2],
};
const adjacent = { ...diagonal, id: "diagonal-b", position: [0.3, 0, 0.3] };
assert.equal(
  math.validateAABBNoOverlap([diagonal, adjacent]).length,
  0,
  "rotated AABB false positive",
);
const moved = layout.WORLD_FURNITURE.map((f) =>
  f.id === "storage-b" ? { ...f, position: [-0.36, 0, -4.16] } : f,
);
assert.ok(
  math
    .validateAABBNoOverlap(moved)
    .some((p) => p.a === "storage-a" && p.b === "storage-b"),
);
const outside = { ...table, position: [5.5, 0, 4.2] };
assert.ok(math.validateRoomContainment([outside]).length);
assert.throws(() =>
  math.validateClearance([table], [{ a: "table", b: "missing", min: 0.1 }]),
);
assert.equal(layout.ROOM_FURNITURE.filter((f) => f.workstationId).length, 4);
assert.ok(
  math.validateCirculation([{ ...table, position: [-2.35, 0, 1] }]).length,
);
for (const f of layout.WORLD_FURNITURE.filter((f) => f.mount === "tabletop")) {
  const host = layout.furnitureById(f.supportedBy);
  assert.equal(f.position[1], host.position[1] + host.topY);
}
console.log(
  "Layout checks passed: wall direction, support contact, rotated collision, storage overlap, boundaries, clearances, four seats, circulation.",
);
console.log(JSON.stringify(layout.validateLayout(), null, 2));
