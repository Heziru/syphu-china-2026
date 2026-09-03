import {
  BoxGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  MeshToonMaterial,
  Shape,
  SphereGeometry,
  TorusGeometry,
  type BufferGeometry,
  type Material,
} from "three";

/** Bump when factory geometry changes so the R3F wrapper remounts. */
export const BIOREACTOR_REVISION = 1;

export const BIOREACTOR_COLORS = {
  shell: "#F0EBE3",
  structure: "#3D4A52",
  glass: "#C8D8DE",
  culture: "#7EBA8A",
  darkMotor: "#2C3034",
  accent: "#6FB5A8",
} as const;

export type BioreactorModelOptions = {
  style?: "concept";
  includeTubing?: boolean;
  includePumpModules?: boolean;
};

export const DEFAULT_BIOREACTOR_OPTIONS: Required<BioreactorModelOptions> = {
  style: "concept",
  includeTubing: true,
  includePumpModules: true,
};

export type BioreactorStats = {
  triangles: number;
  meshes: number;
  materials: number;
  parts: string[];
};

export type BioreactorBuild = {
  group: Group;
  stats: BioreactorStats;
  materials: Array<MeshStandardMaterial | MeshToonMaterial>;
};

type Mats = ReturnType<typeof makeMaterials>;

function roundedRect(width: number, height: number, radius: number): Shape {
  const hw = width * 0.5;
  const hh = height * 0.5;
  const r = Math.min(radius, hw * 0.49, hh * 0.49);
  const shape = new Shape();
  shape.moveTo(-hw + r, -hh);
  shape.lineTo(hw - r, -hh);
  shape.quadraticCurveTo(hw, -hh, hw, -hh + r);
  shape.lineTo(hw, hh - r);
  shape.quadraticCurveTo(hw, hh, hw - r, hh);
  shape.lineTo(-hw + r, hh);
  shape.quadraticCurveTo(-hw, hh, -hw, hh - r);
  shape.lineTo(-hw, -hh + r);
  shape.quadraticCurveTo(-hw, -hh, -hw + r, -hh);
  return shape;
}

function extrudeY(shape: Shape, height: number, bevel = 0.01): BufferGeometry {
  const geo = new ExtrudeGeometry(shape, {
    depth: height,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 1,
    curveSegments: 4,
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
  const shell = new MeshToonMaterial({ color: BIOREACTOR_COLORS.shell });
  const structure = new MeshToonMaterial({ color: BIOREACTOR_COLORS.structure });
  const glass = new MeshStandardMaterial({
    color: BIOREACTOR_COLORS.glass,
    roughness: 0.25,
    metalness: 0.02,
    transparent: true,
    opacity: 0.42,
    depthWrite: false,
  });
  const culture = new MeshToonMaterial({ color: BIOREACTOR_COLORS.culture });
  const darkMotor = new MeshToonMaterial({ color: BIOREACTOR_COLORS.darkMotor });
  const accent = new MeshToonMaterial({ color: BIOREACTOR_COLORS.accent });
  shell.name = "shell";
  structure.name = "structure";
  glass.name = "glass";
  culture.name = "culture";
  darkMotor.name = "darkMotor";
  accent.name = "accent";
  return { shell, structure, glass, culture, darkMotor, accent };
}

export function measureGroup(root: Group): BioreactorStats {
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

/** Shared layout: chamber forward, control body aft. */
const D = 0.42;
const CHAMBER_H = 0.78;
const CHAMBER_X = -0.12;
const CHAMBER_Z = 0.08;
const BASE_Y = 0;

function createBase(mats: Mats) {
  const group = part("base");
  addMesh(
    group,
    extrudeY(roundedRect(0.95, 0.62, 0.1), 0.07, 0.014),
    mats.structure,
    "baseSlab",
    [0.02, BASE_Y, 0.02],
  );
  // Neck ring around chamber
  addMesh(
    group,
    new TorusGeometry(D * 0.52, 0.022, 8, 20),
    mats.structure,
    "neckRing",
    [CHAMBER_X, BASE_Y + 0.62, CHAMBER_Z],
    [Math.PI / 2, 0, 0],
  );
  addMesh(
    group,
    new CylinderGeometry(0.02, 0.02, 0.55, 8),
    mats.structure,
    "supportRod",
    [CHAMBER_X + D * 0.55, BASE_Y + 0.34, CHAMBER_Z],
  );
  return group;
}

function createCultureChamber(mats: Mats) {
  const group = part("cultureChamber");
  const wallR = D * 0.5;
  const liquidH = CHAMBER_H * 0.4;
  const y0 = BASE_Y + 0.07;

  addMesh(
    group,
    new CylinderGeometry(wallR, wallR, CHAMBER_H, 16, 1, true),
    mats.glass,
    "chamberWall",
    [CHAMBER_X, y0 + CHAMBER_H * 0.5, CHAMBER_Z],
  );
  // Closed bottom disk (slightly opaque glass)
  addMesh(
    group,
    new CylinderGeometry(wallR * 0.98, wallR * 0.98, 0.03, 16),
    mats.structure,
    "chamberFloor",
    [CHAMBER_X, y0 + 0.02, CHAMBER_Z],
  );
  // Opaque culture liquid — primary biological identity
  addMesh(
    group,
    new CylinderGeometry(wallR * 0.9, wallR * 0.9, liquidH, 14),
    mats.culture,
    "cultureLiquid",
    [CHAMBER_X, y0 + liquidH * 0.5 + 0.03, CHAMBER_Z],
  );
  // Stirrer shaft + paddle (static)
  addMesh(
    group,
    new CylinderGeometry(0.018, 0.018, CHAMBER_H * 0.85, 8),
    mats.shell,
    "stirrerShaft",
    [CHAMBER_X, y0 + CHAMBER_H * 0.42, CHAMBER_Z],
  );
  addMesh(
    group,
    new BoxGeometry(0.14, 0.02, 0.04),
    mats.shell,
    "paddle",
    [CHAMBER_X, y0 + 0.12, CHAMBER_Z],
  );
  return group;
}

function createHeadplate(mats: Mats) {
  const group = part("headplate");
  const y = BASE_Y + 0.07 + CHAMBER_H;
  addMesh(
    group,
    new CylinderGeometry(D * 0.56, D * 0.56, 0.1, 16),
    mats.shell,
    "cap",
    [CHAMBER_X, y + 0.05, CHAMBER_Z],
  );
  // Port stubs (no logos / text)
  addMesh(
    group,
    new CylinderGeometry(0.028, 0.028, 0.08, 8),
    mats.structure,
    "portA",
    [CHAMBER_X - 0.1, y + 0.14, CHAMBER_Z + 0.06],
  );
  addMesh(
    group,
    new CylinderGeometry(0.022, 0.022, 0.1, 8),
    mats.structure,
    "portB",
    [CHAMBER_X + 0.08, y + 0.15, CHAMBER_Z - 0.05],
  );
  return group;
}

function createDriveMotor(mats: Mats) {
  const group = part("driveMotor");
  const y = BASE_Y + 0.07 + CHAMBER_H + 0.1;
  addMesh(
    group,
    extrudeY(roundedRect(0.16, 0.14, 0.03), 0.22, 0.01),
    mats.darkMotor,
    "motorBlock",
    [CHAMBER_X, y, CHAMBER_Z],
  );
  addMesh(
    group,
    new CylinderGeometry(0.04, 0.045, 0.04, 10),
    mats.darkMotor,
    "motorHub",
    [CHAMBER_X, y + 0.24, CHAMBER_Z],
  );
  return group;
}

function createTubing(mats: Mats) {
  const group = part("tubing");
  const yCap = BASE_Y + 0.07 + CHAMBER_H + 0.12;
  // Thick short arcs — few tubes only
  addMesh(
    group,
    new TorusGeometry(0.16, 0.022, 6, 12, Math.PI * 0.85),
    mats.accent,
    "tubeA",
    [CHAMBER_X + 0.12, yCap + 0.08, CHAMBER_Z + 0.1],
    [0.4, 0.6, 0.2],
  );
  addMesh(
    group,
    new TorusGeometry(0.14, 0.02, 6, 12, Math.PI * 0.7),
    mats.glass,
    "tubeB",
    [CHAMBER_X - 0.05, yCap + 0.06, CHAMBER_Z + 0.14],
    [-0.3, -0.5, 0.1],
  );
  addMesh(
    group,
    new CylinderGeometry(0.02, 0.02, 0.28, 8),
    mats.accent,
    "tubeDrop",
    [0.22, 0.55, 0.12],
    [0.5, 0, 0.3],
  );
  return group;
}

function createPumpModules(mats: Mats) {
  const group = part("pumpModules");
  addMesh(
    group,
    extrudeY(roundedRect(0.16, 0.14, 0.03), 0.12, 0.008),
    mats.shell,
    "pumpA",
    [0.28, BASE_Y + 0.07, 0.18],
  );
  addMesh(
    group,
    extrudeY(roundedRect(0.12, 0.1, 0.025), 0.1, 0.006),
    mats.shell,
    "pumpB",
    [0.34, BASE_Y + 0.07, -0.02],
  );
  addMesh(
    group,
    new SphereGeometry(0.025, 8, 8),
    mats.accent,
    "pumpAccent",
    [0.28, BASE_Y + 0.2, 0.18],
  );
  return group;
}

function createMainBody(mats: Mats) {
  const group = part("mainBody");
  addMesh(
    group,
    extrudeY(roundedRect(0.48, 0.36, 0.06), 0.42, 0.016),
    mats.shell,
    "controlBox",
    [0.28, BASE_Y + 0.07, -0.12],
  );
  // Blank screen slab — no text / UI glyphs
  addMesh(
    group,
    new BoxGeometry(0.22, 0.12, 0.02),
    mats.darkMotor,
    "screenBezel",
    [0.28, BASE_Y + 0.42, 0.05],
  );
  addMesh(
    group,
    new BoxGeometry(0.18, 0.09, 0.012),
    mats.accent,
    "screenFace",
    [0.28, BASE_Y + 0.42, 0.06],
  );
  return group;
}

/**
 * Desktop bioreactor / prototype station (runtime id: device).
 * Transparent chamber + opaque culture liquid; no logos / text / particles.
 */
export function createBioreactorModel(options?: BioreactorModelOptions): BioreactorBuild {
  const opts = { ...DEFAULT_BIOREACTOR_OPTIONS, ...options };
  void opts.style;

  const materials = makeMaterials();
  const group = part("bioreactor");
  group.add(createBase(materials));
  group.add(createCultureChamber(materials));
  group.add(createHeadplate(materials));
  group.add(createDriveMotor(materials));
  if (opts.includeTubing) group.add(createTubing(materials));
  if (opts.includePumpModules) group.add(createPumpModules(materials));
  group.add(createMainBody(materials));

  const stats = measureGroup(group);
  group.userData.stats = stats;
  group.userData.options = opts;
  return {
    group,
    stats,
    materials: Object.values(materials),
  };
}
