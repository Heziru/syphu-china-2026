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
  TorusGeometry,
  Vector2,
  type BufferGeometry,
  type Material,
} from "three";

/** Bump when factory geometry changes so the R3F wrapper remounts. */
export const MICROSCOPE_REVISION = 8;
export const MICROSCOPE_COLORS = {
  shell: "#F0F2ED",
  turret: "#3A3E44",
  dark: "#2F3338",
  metal: "#D7DEE4",
  glass: "#D7E6EC",
  light: "#F4E8B2",
} as const;

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
function extrudeY(shape: Shape, height: number, bevel = 0.012): BufferGeometry {
  const geo = new ExtrudeGeometry(shape, {
    depth: height,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 3,
    curveSegments: 12,
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
    color: "#9AA4AC",
    roughness: 0.22,
    metalness: 0.38,
  });
  const glass = new MeshStandardMaterial({
    color: MICROSCOPE_COLORS.glass,
    roughness: 0.06,
    metalness: 0.2,
  });
  const light = new MeshStandardMaterial({
    color: MICROSCOPE_COLORS.light,
    emissive: "#E8D48A",
    emissiveIntensity: 0.7,
    roughness: 0.28,
    metalness: 0.04,
  });
  shell.name = "shell";
  turret.name = "turret";
  dark.name = "dark";
  metal.name = "metal";
  glass.name = "glass";
  light.name = "light";
  return { shell, turret, dark, metal, glass, light };
}

function knurledKnob(radius: number, height: number, radial = 36): BufferGeometry {
  const pts: Vector2[] = [new Vector2(0, 0), new Vector2(radius * 0.52, 0)];
  const rings = 10;
  for (let i = 0; i <= rings; i += 1) {
    const y = 0.003 + (i / rings) * (height - 0.006);
    const r = radius + (i % 2 === 0 ? 0.0042 : -0.001);
    pts.push(new Vector2(r, y));
  }
  pts.push(new Vector2(radius * 0.7, height));
  pts.push(new Vector2(0, height));
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

function buildBase(mats: ReturnType<typeof makeMaterials>) {
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

  const footGeo = new CylinderGeometry(0.018, 0.02, 0.014, 12);
  (
    [
      [-0.19, -0.18],
      [0.19, -0.18],
      [-0.186, 0.26],
      [0.186, 0.26],
    ] as Array<[number, number]>
  ).forEach((xz, i) => {
    addMesh(group, i === 0 ? footGeo : footGeo.clone(), mats.dark, `foot${i}`, [xz[0], 0.007, xz[1]]);
  });
  return group;
}

function buildIlluminator(mats: ReturnType<typeof makeMaterials>) {
  const group = part("illuminator");
  addMesh(group, new CylinderGeometry(0.05, 0.056, 0.038, 24), mats.dark, "lampBody", [0, 0.152, 0.08]);
  addMesh(group, new CylinderGeometry(0.036, 0.036, 0.01, 24), mats.light, "lampLens", [0, 0.174, 0.08]);
  addMesh(group, new CylinderGeometry(0.026, 0.026, 0.005, 20), mats.glass, "lampGlass", [0, 0.18, 0.08]);
  return group;
}

function buildArm(mats: ReturnType<typeof makeMaterials>) {
  const group = part("arm");
  // Side profile in XY: +X = world +Z (front). Thick C that opens toward the stage.
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
    bevelThickness: 0.016,
    bevelSize: 0.016,
    bevelSegments: 3,
    curveSegments: 14,
  });
  geo.rotateY(-Math.PI / 2);
  geo.translate(depth * 0.5, 0, 0);
  geo.computeVertexNormals();
  addMesh(group, geo, mats.shell, "cArm");

  const head = extrudeY(roundedRect(0.13, 0.11, 0.024), 0.09, 0.008);
  addMesh(group, head, mats.shell, "headBlock", [0, 0.81, 0.02]);
  return group;
}

function lClip(sign: 1 | -1): Shape {
  return roundedPolygon(
    [
      [sign * 0.0, -0.012],
      [sign * 0.13, -0.012],
      [sign * 0.13, 0.018],
      [sign * 0.034, 0.018],
      [sign * 0.034, 0.078],
      [sign * 0.0, 0.078],
    ],
    0.007,
  );
}

function buildStage(mats: ReturnType<typeof makeMaterials>) {
  const group = part("stage");
  const outline = roundedRect(0.36, 0.27, 0.022);
  const hole = new Path();
  hole.absarc(0, 0.02, 0.038, 0, Math.PI * 2, true);
  outline.holes.push(hole);
  addMesh(group, extrudeY(outline, 0.024, 0.004), mats.dark, "stagePlate", [0, 0.508, 0.08]);

  addMesh(group, extrudeY(lClip(-1), 0.01, 0.0015), mats.metal, "clipL", [-0.1, 0.528, 0.05]);
  addMesh(group, extrudeY(lClip(1), 0.01, 0.0015), mats.metal, "clipR", [0.1, 0.528, 0.05]);

  addMesh(group, extrudeY(roundedRect(0.1, 0.086, 0.018), 0.13, 0.008), mats.shell, "stageBracket", [
    0,
    0.42,
    -0.06,
  ]);
  return group;
}

function buildCondenser(mats: ReturnType<typeof makeMaterials>) {
  const group = part("condenser");
  addMesh(group, new CylinderGeometry(0.044, 0.05, 0.06, 22), mats.dark, "condenserBody", [
    0, 0.452, 0.1,
  ]);
  addMesh(group, new CylinderGeometry(0.034, 0.036, 0.02, 20), mats.dark, "iris", [0, 0.418, 0.1]);
  addMesh(group, new CylinderGeometry(0.022, 0.022, 0.008, 18), mats.glass, "condenserLens", [
    0, 0.484, 0.1,
  ]);
  return group;
}

function buildKnobStack(mats: ReturnType<typeof makeMaterials>, side: 1 | -1) {
  const group = part(side > 0 ? "focusKnobsR" : "focusKnobsL");
  const y = 0.36;
  const z = -0.12;
  addMesh(
    group,
    new CylinderGeometry(0.017, 0.017, 0.046, 12),
    mats.dark,
    "axle",
    [side * 0.092, y, z],
    [0, 0, Math.PI / 2],
  );
  addMesh(group, knurledKnob(0.056, 0.034), mats.dark, "coarse", [side * 0.112, y, z], [
    0,
    0,
    Math.PI / 2,
  ]);
  addMesh(group, knurledKnob(0.036, 0.024, 30), mats.dark, "fine", [side * 0.146, y, z], [
    0,
    0,
    Math.PI / 2,
  ]);
  return group;
}

function buildNosepiece(mats: ReturnType<typeof makeMaterials>) {
  const group = part("nosepiece");
  const cx = 0;
  const cy = 0.705;
  const cz = 0.095;
  addMesh(group, new CylinderGeometry(0.096, 0.104, 0.032, 28), mats.turret, "turretDisk", [
    cx,
    cy,
    cz,
  ]);
  addMesh(
    group,
    new SphereGeometry(0.086, 22, 12, 0, Math.PI * 2, 0, Math.PI * 0.5),
    mats.turret,
    "turretDome",
    [cx, cy + 0.012, cz],
  );
  addMesh(group, new TorusGeometry(0.098, 0.008, 8, 28), mats.dark, "turretKnurl", [cx, cy - 0.002, cz], [
    Math.PI / 2,
    0,
    0,
  ]);

  const specs = [
    { a: -1.05, len: 0.078 },
    { a: 0.12, len: 0.2 },
    { a: 1.08, len: 0.132 },
  ];
  specs.forEach((spec, i) => {
    const obj = part(`objective${i}`);
    const radius = 0.058;
    obj.position.set(Math.sin(spec.a) * radius, cy - 0.018, cz + Math.cos(spec.a) * 0.012);
    obj.rotation.set(0.08, 0, spec.a * 0.08);
    addMesh(obj, new CylinderGeometry(0.024, 0.024, 0.016, 20), mats.dark, "objMount");
    addMesh(obj, new CylinderGeometry(0.021, 0.026, spec.len * 0.38, 20), mats.metal, "objUpper", [
      0,
      -0.024 - spec.len * 0.1,
      0,
    ]);
    addMesh(obj, new CylinderGeometry(0.028, 0.028, 0.012, 20), mats.dark, "objBand", [
      0,
      -0.04 - spec.len * 0.16,
      0,
    ]);
    addMesh(obj, new CylinderGeometry(0.015, 0.023, spec.len * 0.42, 20), mats.metal, "objLower", [
      0,
      -0.06 - spec.len * 0.32,
      0,
    ]);
    addMesh(obj, new CylinderGeometry(0.013, 0.015, 0.014, 16), mats.dark, "objNose", [
      0,
      -0.078 - spec.len * 0.42,
      0,
    ]);
    addMesh(obj, new CylinderGeometry(0.009, 0.009, 0.006, 16), mats.glass, "objGlass", [
      0,
      -0.088 - spec.len * 0.42,
      0,
    ]);
    group.add(obj);
  });
  return group;
}

function buildOptics(mats: ReturnType<typeof makeMaterials>) {
  const group = part("optics");
  const tilt = Math.PI / 4;
  const dirY = Math.cos(tilt);
  const dirZ = Math.sin(tilt);
  const bottom: [number, number, number] = [0, 0.86, 0.04];
  const whiteH = 0.155;
  const whitePos: [number, number, number] = [
    bottom[0],
    bottom[1] + dirY * (whiteH * 0.5),
    bottom[2] + dirZ * (whiteH * 0.5),
  ];
  addMesh(group, new CylinderGeometry(0.046, 0.052, whiteH, 24), mats.shell, "bodyTube", whitePos, [
    tilt,
    0,
    0,
  ]);
  addMesh(
    group,
    new TorusGeometry(0.048, 0.01, 10, 24),
    mats.dark,
    "collar",
    [bottom[0], bottom[1] + dirY * whiteH, bottom[2] + dirZ * whiteH],
    [tilt, 0, 0],
  );

  const ocular = part("eyepiece");
  const eyeH = 0.108;
  const eyeBase = whiteH;
  ocular.position.set(
    bottom[0],
    bottom[1] + dirY * (eyeBase + eyeH * 0.42),
    bottom[2] + dirZ * (eyeBase + eyeH * 0.42),
  );
  ocular.rotation.set(tilt, 0, 0);
  addMesh(ocular, new CylinderGeometry(0.033, 0.04, eyeH, 22), mats.dark, "ocularTube");
  addMesh(ocular, new CylinderGeometry(0.044, 0.035, 0.02, 22), mats.dark, "eyeCup", [0, eyeH * 0.48, 0]);
  addMesh(ocular, new CylinderGeometry(0.025, 0.025, 0.008, 20), mats.glass, "ocularLens", [
    0,
    eyeH * 0.58,
    0,
  ]);
  group.add(ocular);
  return group;
}

export function createMicroscopeModel(): MicroscopeBuild {
  const materials = makeMaterials();
  const group = part("microscope");
  group.add(buildBase(materials));
  group.add(buildIlluminator(materials));
  group.add(buildArm(materials));
  group.add(buildStage(materials));
  group.add(buildCondenser(materials));
  group.add(buildKnobStack(materials, -1));
  group.add(buildKnobStack(materials, 1));
  group.add(buildNosepiece(materials));
  group.add(buildOptics(materials));

  const stats = measureGroup(group);
  group.userData.stats = stats;
  return {
    group,
    stats,
    materials: Object.values(materials),
  };
}
