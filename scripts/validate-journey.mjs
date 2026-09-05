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
const { journeyPose, spherePoint, PLANET_RADIUS } = await load(
  "src/contents/home/journey/journeyMotion.ts",
);
const { ORBITS, CAMPUS_ORBIT, CAMPUS_ANGLE, orbitPoint, orbitAngle } =
  await load("src/contents/home/journey/orbitLayout.ts");
for (const aspect of [0.48, 1, 1.92, 2.4]) {
  const narrow = aspect < 1;
  const rx = narrow ? aspect * 3.65 : Math.min(7.45, aspect * 3.6);
  const ry = narrow ? 3.15 : 2.5;
  const tilt = narrow ? -0.1 : 0.17;
  for (const radius of ORBITS) {
    for (let angle = 0; angle < Math.PI * 2; angle += 0.07) {
      const [x, shiftedY] = orbitPoint(
        radius,
        orbitAngle(angle, 12, 0),
        aspect,
      );
      const y = shiftedY - 0.15;
      const ex = x * Math.cos(tilt) + y * Math.sin(tilt);
      const ey = y * Math.cos(tilt) - x * Math.sin(tilt);
      assert.ok(
        Math.abs((ex / rx) ** 2 + (ey / ry) ** 2 - radius ** 2) < 1e-10,
        "Animated planets remain on their visible orbital ellipse",
      );
    }
  }
  const departure = orbitPoint(CAMPUS_ORBIT, CAMPUS_ANGLE, aspect);
  assert.ok(Math.abs(journeyPose(0, aspect).x - departure[0]) < 1e-10);
  assert.ok(Math.abs(journeyPose(0, aspect).y - departure[1]) < 1e-10);
  assert.ok(Math.abs(departure[0]) > 0.5, "Campus planet starts off-centre");
  assert.equal(
    orbitAngle(CAMPUS_ANGLE, 999, 0.08),
    CAMPUS_ANGLE,
    "Orbital movement settles before the approach so the transition is continuous",
  );
  let previous = journeyPose(0, aspect);
  assert.ok(previous.scale > 0, "The main planet must exist at first paint");
  for (let i = 1; i <= 10000; i++) {
    const pose = journeyPose(i / 10000, aspect);
    assert.ok(
      !(pose.libraryVisible && pose.researchVisible),
      "Never show both buildings together",
    );
    for (const key of ["scale", "x", "y", "rotation", "pitch"]) {
      assert.ok(Number.isFinite(pose[key]));
      assert.ok(
        Math.abs(pose[key] - previous[key]) < 0.06,
        `No ${key} jump at ${i / 10000}`,
      );
    }
    previous = pose;
  }
  assert.ok(
    journeyPose(0.42, aspect).scale > journeyPose(0.54, aspect).scale,
    "Retreat after library inspection",
  );
  assert.ok(
    journeyPose(0.81, aspect).scale > journeyPose(0.7, aspect).scale,
    "Approach research building separately",
  );
  assert.equal(
    journeyPose(0.39, aspect).rotation,
    journeyPose(0.46, aspect).rotation,
    "Hold rotation while inspecting",
  );
  for (const p of [0.54, 0.62, 0.7]) {
    assert.equal(
      journeyPose(p, aspect).pitch,
      0,
      "Rotate between sites in the screen plane; tilt only for inspection",
    );
  }
}
for (const x of [-4, -2, 0, 2, 4])
  for (const z of [-1, 0, 1, 2]) {
    const point = spherePoint(x, 0, z);
    assert.ok(
      Math.abs(
        Math.hypot(point[0], point[1] + PLANET_RADIUS, point[2]) -
          PLANET_RADIUS,
      ) < 1e-10,
      "All site ground points contact the spherical surface",
    );
  }

const { createLaminarHoodModel } = await load(
  "src/contents/home/laboratory/laminar-hood/createLaminarHoodModel.ts",
);
const { group, stats, materials } = createLaminarHoodModel();
const shell = group.getObjectByName("cabinetShell");
assert.ok(
  shell.getObjectByName("controlBacking"),
  "Control panel must have backing",
);
assert.equal(
  shell.getObjectByName("leftWall").geometry.type,
  "ExtrudeGeometry",
  "Side panels must have thickness",
);
assert.ok(
  shell.getObjectByName("backWall").geometry.getAttribute("normal").getZ(0) <
    -0.99,
  "Back surface faces outward",
);
assert.ok(
  group.getObjectByName("topSurface").geometry.getAttribute("normal").getY(0) >
    0.99,
  "Top surface faces upward",
);
const chamber = group.getObjectByName("workChamber");
const wall = chamber.getObjectByName("backWall");
const worktop = chamber.getObjectByName("workSurface");
const wallBottom = wall.position.y - wall.geometry.parameters.height / 2;
const worktopTop = worktop.position.y + worktop.geometry.parameters.height / 2;
assert.ok(
  Math.abs(wallBottom - worktopTop) < 1e-9,
  "No gap between chamber liner and worktop",
);
assert.ok(
  group.getObjectByName("continuousHose"),
  "Exhaust bend must be continuous",
);
group.traverse((mesh) => {
  if (!mesh.isMesh) return;
  for (const value of mesh.geometry.getAttribute("position").array)
    assert.ok(Number.isFinite(value));
  mesh.geometry.dispose();
});
materials.forEach((material) => material.dispose());
console.log(
  `Journey continuity, exclusive buildings, spherical ground contact, and hood shell/chamber checks passed (${stats.triangles} hood triangles).`,
);
