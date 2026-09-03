import {
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  LatheGeometry,
  Mesh,
  MeshStandardMaterial,
  MeshToonMaterial,
  Path,
  Shape,
  SphereGeometry,
  Vector2,
  type BufferGeometry,
  type Material,
} from "three";
import {
  DEFAULT_MICROSCOPE_OPTIONS,
  type MicroscopeModelOptions,
} from "../../types/labStation";

/** Bump when factory geometry changes so the R3F wrapper remounts. */
export const MICROSCOPE_REVISION = 9;
export const MICROSCOPE_COLORS = {
  shell: "#F0F2ED",
  turret: "#3A3E44",
  dark: "#2F3338",
  metal: "#A8B0B6",
  glass: "#D7E6EC",
  light: "#F4E8B2",
} as const;

export type { MicroscopeModelOptions };

export type MicroscopeStats = {
  triangles: number;
  meshes: number;
  materials: number;
  parts: string[];
};

export type MicroscopeBuild = {
  group: Group;
  stats: MicroscopeStats;
  materials: Array<MeshStandardMaterial | MeshToonMaterial>;
};

type Mats = ReturnType<typeof makeMaterials>;
type Style = NonNullable<MicroscopeModelOptions["style"]>;

function roundedPolygon(points: Array<[number, number]>, radius: number): Shape {
  const shape = new Shape();
  const count = points.length;
  const verts = points.map(([x, y]) => ({ x, y }));
  const dist = (a: { x: number; y: number }, b: { x: number; y: number }) =>
    Math.hypot(b.x - a.x, b.y - a.y);
  const lerp = (a: { x: number; y: number }, b: { x: number; y: number }, t: number) => ({
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  });

  for (let i = 0; i < count; i += 1) {
    const prev = verts[(i - 1 + count) % count];
    const curr = verts[i];
    const next = verts[(i + 1) % count];
    const d1 = dist(prev, curr);
    const d2 = dist(curr, next);
    const r = Math.min(radius, d1 * 0.42, d2 * 0.42);
    const p1 = lerp(curr, prev, r / Math.max(d1, 1e-6));
    const p2 = lerp(curr, next, r / Math.max(d2, 1e-6));
    if (i === 0) shape.moveTo(p1.x, p1.y);
    else shape.lineTo(p1.x, p1.y);
    shape.quadraticCurveTo(curr.x, curr.y, p2.x, p2.y);
  }
  shape.closePath();
  return shape;
}

function roundedRect(width: number, height: number, radius: number): Shape {
  const hw = width * 0.5;
  const hh = height * 0.5;
  return roundedPolygon(
    [
      [-hw, -hh],
      [hw, -hh],
      [hw, hh],
      [-hw, hh],
    ],
    radius,
  );
}

/** Shape in XY, extrude +Z, then lay it onto XZ so Y is height. */
function extrudeY(shape: Shape, height: number, bevel = 0.01): BufferGeometry {
  const geo = new ExtrudeGeometry(shape, {
    depth: height,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 1,
    curveSegments: 6,
  });
  geo.rotateX(-Math.PI / 2);
  geo.computeVertexNormals();
  return geo;
}

function addMesh(
  parent: Group,
  geometry: BufferGeometry,
  material: Material,
  name: string,
  position?: [number, number, number],
  rotation?: [number, number, number],
) {
  const mesh = new Mesh(geometry, material);
  mesh.name = name;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  if (position) mesh.position.set(...position);
  if (rotation) mesh.rotation.set(...rotation);
  parent.add(mesh);
  return mesh;
}

function part(name: string): Group {
  const group = new Group();
  group.name = name;
  return group;
}

function makeMaterials() {
  const shell = new MeshToonMaterial({ color: MICROSCOPE_COLORS.shell });
  const turret = new MeshToonMaterial({ color: MICROSCOPE_COLORS.turret });
  const dark = new MeshToonMaterial({ color: MICROSCOPE_COLORS.dark });
  const metal = new MeshStandardMaterial({
    color: MICROSCOPE_COLORS.metal,
    roughness: 0.45,
    metalness: 0.18,
  });
  const glass = new MeshStandardMaterial({
    color: MICROSCOPE_COLORS.glass,
    roughness: 0.2,
    metalness: 0.08,
  });
  const light = new MeshStandardMaterial({
    color: MICROSCOPE_COLORS.light,
    emissive: "#E8D48A",
    emissiveIntensity: 0.55,
    roughness: 0.35,
    metalness: 0.02,
  });
  shell.name = "shell";
  turret.name = "turret";
  dark.name = "dark";
  metal.name = "metal";
  glass.name = "glass";
  light.name = "light";
  return { shell, turret, dark, metal, glass, light };
}

function knurledKnob(radius: number, height: number, radial = 16): BufferGeometry {
  const pts: Vector2[] = [new Vector2(0, 0), new Vector2(radius * 0.55, 0)];
  const rings = 6;
  for (let i = 0; i <= rings; i += 1) {
    const y = 0.003 + (i / rings) * (height - 0.006);
    const r = radius + (i % 2 === 0 ? 0.0035 : -0.0006);
    pts.push(new Vector2(r, y));
  }
  pts.push(new Vector2(radius * 0.7, height), new Vector2(0, height));
  const geo = new LatheGeometry(pts, radial);
  geo.computeVertexNormals();
  return geo;
}

export function measureGroup(root: Group): MicroscopeStats {
  let triangles = 0;
  let meshes = 0;
  const materialSet = new Set<Material>();
  const parts: string[] = [];
  root.traverse((obj) => {
    if (obj instanceof Group && obj !== root && obj.children.length > 0 && obj.name) {
      parts.push(obj.name);
    }
    if (!(obj instanceof Mesh)) return;
    meshes += 1;
    const geo = obj.geometry;
    const index = geo.getIndex();
    if (index) triangles += index.count / 3;
    else {
      const pos = geo.getAttribute("position");
      if (pos) triangles += pos.count / 3;
    }
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    mats.forEach((mat) => materialSet.add(mat));
  });
  return {
    triangles: Math.round(triangles),
    meshes,
    materials: materialSet.size,
    parts,
  };
}

/* -------------------------------------------------------------------------- */
/* Legacy builders (horseshoe / monocular) — kept for style: "legacy"          */
/* -------------------------------------------------------------------------- */

function createBaseLegacy(mats: Mats) {
  const group = part("base");
  addMesh(group, extrudeY(roundedRect(0.54, 0.28, 0.045), 0.09, 0.01), mats.shell, "baseRear", [
    0, 0.03, -0.09,
  ]);
  addMesh(group, extrudeY(roundedRect(0.168, 0.3, 0.04), 0.09, 0.01), mats.shell, "baseToeL", [
    -0.186, 0.03, 0.155,
  ]);
  addMesh(group, extrudeY(roundedRect(0.168, 0.3, 0.04), 0.09, 0.01), mats.shell, "baseToeR", [
    0.186, 0.03, 0.155,
  ]);
  addMesh(group, extrudeY(roundedRect(0.56, 0.3, 0.04), 0.018, 0.004), mats.dark, "plateRear", [
    0, 0.008, -0.09,
  ]);
  addMesh(group, extrudeY(roundedRect(0.18, 0.312, 0.036), 0.018, 0.004), mats.dark, "plateToeL", [
    -0.186, 0.008, 0.155,
  ]);
  addMesh(group, extrudeY(roundedRect(0.18, 0.312, 0.036), 0.018, 0.004), mats.dark, "plateToeR", [
    0.186, 0.008, 0.155,
  ]);
  return group;
}

function createArmLegacy(mats: Mats) {
  const group = part("arm");
  const profile = roundedPolygon(
    [
      [-0.075, 0.122],
      [-0.2, 0.122],
      [-0.228, 0.16],
      [-0.228, 0.84],
      [-0.12, 0.965],
      [0.035, 0.972],
      [0.058, 0.9],
      [0.058, 0.78],
      [-0.055, 0.758],
      [-0.1, 0.64],
      [-0.1, 0.26],
      [-0.075, 0.175],
    ],
    0.04,
  );
  const depth = 0.108;
  const geo = new ExtrudeGeometry(profile, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.014,
    bevelSize: 0.014,
    bevelSegments: 1,
    curveSegments: 8,
  });
  geo.rotateY(-Math.PI / 2);
  geo.translate(depth * 0.5, 0, 0);
  geo.computeVertexNormals();
  addMesh(group, geo, mats.shell, "cArm");
  addMesh(group, extrudeY(roundedRect(0.13, 0.11, 0.024), 0.09, 0.008), mats.shell, "headBlock", [
    0, 0.81, 0.02,
  ]);
  return group;
}

function createEyepieceLegacy(mats: Mats) {
  const group = part("eyepiece");
  const tilt = Math.PI / 4;
  const dirY = Math.cos(tilt);
  const dirZ = Math.sin(tilt);
  const bottom: [number, number, number] = [0, 0.86, 0.04];
  const whiteH = 0.155;
  addMesh(
    group,
    new CylinderGeometry(0.046, 0.052, whiteH, 16),
    mats.shell,
    "bodyTube",
    [bottom[0], bottom[1] + dirY * (whiteH * 0.5), bottom[2] + dirZ * (whiteH * 0.5)],
    [tilt, 0, 0],
  );
  const eyeH = 0.108;
  const ocular = part("ocular");
  ocular.position.set(
    bottom[0],
    bottom[1] + dirY * (whiteH + eyeH * 0.42),
    bottom[2] + dirZ * (whiteH + eyeH * 0.42),
  );
  ocular.rotation.set(tilt, 0, 0);
  addMesh(ocular, new CylinderGeometry(0.033, 0.04, eyeH, 14), mats.dark, "ocularTube");
  addMesh(ocular, new CylinderGeometry(0.044, 0.035, 0.02, 14), mats.dark, "eyeCup", [0, eyeH * 0.48, 0]);
  group.add(ocular);
  return group;
}

function createTurretLegacy(mats: Mats) {
  const group = part("nosepiece");
  const cy = 0.705;
  const cz = 0.095;
  addMesh(group, new CylinderGeometry(0.096, 0.104, 0.032, 16), mats.turret, "turretDisk", [0, cy, cz]);
  addMesh(
    group,
    new SphereGeometry(0.086, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.5),
    mats.turret,
    "turretDome",
    [0, cy + 0.012, cz],
  );
  const specs = [
    { a: -1.05, len: 0.078 },
    { a: 0.12, len: 0.2 },
    { a: 1.08, len: 0.132 },
  ];
  specs.forEach((spec, i) => {
    const obj = part(`objective${i}`);
    obj.position.set(Math.sin(spec.a) * 0.058, cy - 0.018, cz + Math.cos(spec.a) * 0.012);
    addMesh(obj, new CylinderGeometry(0.02, 0.024, spec.len * 0.7, 12), mats.metal, "objBarrel", [
      0,
      -spec.len * 0.35,
      0,
    ]);
    addMesh(obj, new CylinderGeometry(0.012, 0.014, 0.012, 10), mats.dark, "objNose", [
      0,
      -spec.len * 0.72,
      0,
    ]);
    group.add(obj);
  });
  return group;
}

/* -------------------------------------------------------------------------- */
/* Concept builders (warm cartoon lab — rectangular base, binocular, 4 objs)  */
/* -------------------------------------------------------------------------- */

function createBase(mats: Mats, style: Style) {
  if (style === "legacy") return createBaseLegacy(mats);

  const group = part("base");
  addMesh(group, extrudeY(roundedRect(0.48, 0.36, 0.055), 0.088, 0.014), mats.shell, "baseShell", [
    0, 0.028, 0.02,
  ]);
  addMesh(group, extrudeY(roundedRect(0.5, 0.38, 0.05), 0.016, 0.004), mats.dark, "basePlate", [
    0, 0.006, 0.02,
  ]);
  const foot = new CylinderGeometry(0.016, 0.018, 0.012, 10);
  (
    [
      [-0.18, -0.12],
      [0.18, -0.12],
      [-0.18, 0.16],
      [0.18, 0.16],
    ] as Array<[number, number]>
  ).forEach((xz, i) => {
    addMesh(group, i === 0 ? foot : foot.clone(), mats.dark, `foot${i}`, [xz[0], 0.006, xz[1]]);
  });
  return group;
}

function createArm(mats: Mats, style: Style) {
  if (style === "legacy") return createArmLegacy(mats);

  const group = part("arm");
  // Side profile: +X → world +Z (front). Chunkier C for concept art.
  const profile = roundedPolygon(
    [
      [-0.06, 0.11],
      [-0.2, 0.11],
      [-0.22, 0.15],
      [-0.22, 0.78],
      [-0.1, 0.92],
      [0.06, 0.94],
      [0.08, 0.84],
      [0.08, 0.72],
      [-0.04, 0.7],
      [-0.1, 0.58],
      [-0.1, 0.28],
      [-0.06, 0.18],
    ],
    0.036,
  );
  const depth = 0.14;
  const geo = new ExtrudeGeometry(profile, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.012,
    bevelSize: 0.012,
    bevelSegments: 1,
    curveSegments: 8,
  });
  geo.rotateY(-Math.PI / 2);
  geo.translate(depth * 0.5, 0, 0);
  geo.computeVertexNormals();
  addMesh(group, geo, mats.shell, "cArm");
  addMesh(group, extrudeY(roundedRect(0.18, 0.12, 0.028), 0.1, 0.01), mats.shell, "headBlock", [
    0, 0.78, 0.04,
  ]);
  return group;
}

function createBody(mats: Mats, style: Style) {
  const body = part("body");
  body.add(createBase(mats, style));
  body.add(createArm(mats, style));
  return body;
}

function createEyepiece(mats: Mats, style: Style) {
  if (style === "legacy") return createEyepieceLegacy(mats);

  const group = part("eyepiece");
  const tilt = Math.PI / 4;
  // Binocular head block
  addMesh(group, extrudeY(roundedRect(0.16, 0.1, 0.022), 0.08, 0.008), mats.shell, "binocularHead", [
    0, 0.9, 0.08,
  ]);

  const tubeLen = 0.11;
  const spread = 0.038;
  ([-1, 1] as const).forEach((side, i) => {
    const tube = part(`ocularTube${i}`);
    tube.position.set(side * spread, 0.96, 0.14);
    tube.rotation.set(tilt, 0, 0);
    addMesh(tube, new CylinderGeometry(0.028, 0.032, tubeLen, 12), mats.shell, "tube");
    addMesh(tube, new CylinderGeometry(0.034, 0.03, 0.018, 12), mats.dark, "eyeCup", [
      0,
      tubeLen * 0.42,
      0,
    ]);
    addMesh(tube, new CylinderGeometry(0.02, 0.02, 0.006, 10), mats.glass, "lens", [
      0,
      tubeLen * 0.52,
      0,
    ]);
    group.add(tube);
  });
  return group;
}

function createTurret(mats: Mats, style: Style) {
  if (style === "legacy") return createTurretLegacy(mats);

  const group = part("nosepiece");
  const cy = 0.68;
  const cz = 0.1;
  addMesh(group, new CylinderGeometry(0.09, 0.098, 0.028, 16), mats.turret, "turretDisk", [0, cy, cz]);
  addMesh(
    group,
    new SphereGeometry(0.078, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.48),
    mats.turret,
    "turretDome",
    [0, cy + 0.01, cz],
  );

  // Four short cartoon objectives around the turret.
  const specs = [
    { a: -Math.PI * 0.75, len: 0.07 },
    { a: -Math.PI * 0.25, len: 0.095 },
    { a: Math.PI * 0.25, len: 0.085 },
    { a: Math.PI * 0.75, len: 0.078 },
  ];
  const ring = 0.055;
  specs.forEach((spec, i) => {
    const obj = part(`objective${i}`);
    obj.position.set(Math.sin(spec.a) * ring, cy - 0.02, cz + Math.cos(spec.a) * 0.02);
    addMesh(obj, new CylinderGeometry(0.018, 0.022, spec.len * 0.55, 10), mats.metal, "barrel", [
      0,
      -spec.len * 0.28,
      0,
    ]);
    addMesh(obj, new CylinderGeometry(0.024, 0.024, 0.01, 10), mats.dark, "band", [
      0,
      -spec.len * 0.45,
      0,
    ]);
    addMesh(obj, new CylinderGeometry(0.012, 0.016, spec.len * 0.28, 10), mats.metal, "tip", [
      0,
      -spec.len * 0.62,
      0,
    ]);
    group.add(obj);
  });
  return group;
}

function createStage(mats: Mats, style: Style) {
  const group = part("stage");
  const outline = roundedRect(style === "legacy" ? 0.36 : 0.34, style === "legacy" ? 0.27 : 0.24, 0.02);
  if (style === "concept") {
    const hole = new Path();
    hole.absarc(0, 0.01, 0.032, 0, Math.PI * 2, true);
    outline.holes.push(hole);
  }
  addMesh(group, extrudeY(outline, 0.022, 0.004), mats.dark, "stagePlate", [0, 0.5, 0.09]);
  addMesh(group, extrudeY(roundedRect(0.09, 0.08, 0.016), 0.11, 0.006), mats.shell, "stageBracket", [
    0,
    0.42,
    -0.05,
  ]);
  // Minimal under-stage mass (not a full condenser CAD model).
  addMesh(group, new CylinderGeometry(0.038, 0.044, 0.04, 12), mats.dark, "substage", [0, 0.455, 0.1]);
  return group;
}

function createKnobs(mats: Mats, style: Style) {
  const group = part("focusKnobs");
  const y = style === "concept" ? 0.34 : 0.36;
  const z = style === "concept" ? -0.1 : -0.12;
  // One prominent side stack (concept art readable); mirror thin axle on the other side.
  const side: 1 = 1;
  addMesh(
    group,
    new CylinderGeometry(0.014, 0.014, 0.12, 10),
    mats.dark,
    "axle",
    [0, y, z],
    [0, 0, Math.PI / 2],
  );
  addMesh(group, knurledKnob(0.058, 0.038, 16), mats.dark, "coarse", [side * 0.1, y, z], [
    0,
    0,
    Math.PI / 2,
  ]);
  addMesh(group, knurledKnob(0.036, 0.024, 14), mats.dark, "fine", [side * 0.132, y, z], [
    0,
    0,
    Math.PI / 2,
  ]);
  addMesh(group, knurledKnob(0.04, 0.02, 12), mats.dark, "coarseL", [-side * 0.1, y, z], [
    0,
    0,
    Math.PI / 2,
  ]);
  return group;
}

function createIlluminator(mats: Mats) {
  const group = part("illuminator");
  addMesh(group, new CylinderGeometry(0.048, 0.052, 0.03, 14), mats.dark, "lampBody", [0, 0.14, 0.06]);
  addMesh(group, new CylinderGeometry(0.034, 0.034, 0.008, 14), mats.light, "lampLens", [0, 0.158, 0.06]);
  addMesh(group, new CylinderGeometry(0.022, 0.022, 0.004, 12), mats.glass, "lampGlass", [
    0, 0.164, 0.06,
  ]);
  return group;
}

/**
 * Procedural compound microscope.
 * Zero-arg call stays valid for PlaceholderObject / modelRegistry.
 */
export function createMicroscopeModel(options?: MicroscopeModelOptions): MicroscopeBuild {
  const { includeIlluminator, style } = {
    ...DEFAULT_MICROSCOPE_OPTIONS,
    ...options,
  };

  const materials = makeMaterials();
  const group = part("microscope");
  group.add(createBody(materials, style));
  group.add(createStage(materials, style));
  group.add(createKnobs(materials, style));
  group.add(createTurret(materials, style));
  group.add(createEyepiece(materials, style));
  if (includeIlluminator) group.add(createIlluminator(materials));

  const stats = measureGroup(group);
  group.userData.stats = stats;
  group.userData.options = { includeIlluminator, style };
  return {
    group,
    stats,
    materials: Object.values(materials),
  };
}
