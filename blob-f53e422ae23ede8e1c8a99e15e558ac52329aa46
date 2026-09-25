import { build } from "esbuild";
import assert from "node:assert/strict";
async function source(entry) {
  const bundle = await build({
    entryPoints: [entry],
    bundle: true,
    platform: "node",
    format: "esm",
    write: false,
  });
  return import(
    "data:text/javascript;base64," +
      Buffer.from(bundle.outputFiles[0].text).toString("base64")
  );
}
const { solarPose, earthPose, SOLAR_PLANETS, campusDeparture } = await source(
  "src/contents/home/journey/orbitalSceneMotion.ts",
);
const { orbitPoint, orbitAngle, ORBITS, CAMPUS_ANGLE, CAMPUS_ORBIT } =
  await source("src/contents/home/journey/orbitLayout.ts");
assert.ok(
  SOLAR_PLANETS.every((planet) => ORBITS.includes(planet.orbit)),
  "Every planet has an orbit",
);
let closest = { gap: Infinity };
const failures = [];
for (const aspect of [0.39, 0.495, 0.78, 1, 1.5, 2.05]) {
  for (let index = 0; index <= 650; index++) {
    const p = index / 5000,
      time = 20;
    const sun = solarPose(p),
      earth = earthPose(p, time, aspect);
    const balls = [
      { name: "Earth", x: earth.x, y: earth.y, r: 2.052 * earth.scale },
      {
        name: "Star",
        x: sun.x,
        y: sun.y + 0.15 * sun.scale,
        r: (aspect < 1 ? 0.4 : 0.74) * sun.scale,
      },
    ];
    const campus = orbitPoint(
        CAMPUS_ORBIT,
        orbitAngle(CAMPUS_ANGLE, time, 0),
        aspect,
      ),
      departure = campusDeparture(p);
    balls.push({
      name: "Campus",
      x: campus[0] + departure * 12,
      y: campus[1] + departure * 3,
      r: aspect < 1 ? 0.34 : 0.56,
    });
    SOLAR_PLANETS.forEach((planet, i) => {
      const at = orbitPoint(
        planet.orbit,
        orbitAngle(planet.angle, time, p),
        aspect,
      );
      balls.push({
        name: "Orbiter " + i,
        x: sun.x + at[0] * sun.scale,
        y: sun.y + at[1] * sun.scale,
        r: planet.radius * (aspect < 1 ? 0.64 : 1) * sun.scale,
      });
    });
    for (let a = 0; a < balls.length; a++)
      for (let b = a + 1; b < balls.length; b++) {
        const A = balls[a],
          B = balls[b];
        if (
          Math.abs(A.x) - A.r > aspect * 4.5 ||
          Math.abs(B.x) - B.r > aspect * 4.5
        )
          continue;
        const gap = Math.hypot(A.x - B.x, A.y - B.y) - A.r - B.r;
        if (gap < closest.gap)
          closest = { aspect, p, gap, pair: [A.name, B.name] };
        if (gap < -0.015)
          failures.push({ aspect, p, gap, pair: [A.name, B.name] });
      }
  }
}
console.log(
  JSON.stringify(
    { closest, failures: failures.slice(0, 12), count: failures.length },
    null,
    2,
  ),
);
assert.equal(
  failures.length,
  0,
  "Visible planets must not intersect throughout the camera transition",
);
