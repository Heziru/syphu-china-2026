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
export const BIOREACTOR_REVISION = 2;

export const BIOREACTOR_COLORS = {
  shell: "#F0EBE3",
  structure: "#3D4A52",
  glass: "#C8D8DE",
  /** Coral culture medium — matches benchtop reference. */
  culture: "#D45A5A",
  darkMotor: "#2C3034",
  accent: "#6FB5A8",
} as const;

export type BioreactorModelOptions = {
  style?: "concept";
  includeTubing?: boolean;
  /** @deprecated Phase 4.1 — pumps folded into mainBody; ignored. */
  includePumpModules?: boolean;
};

export const DEFAULT_BIOREACTOR_OPTIONS: Required<
  Omit<BioreactorModelOptions, "includePumpModules">
> & { includePumpModules: boolean } = {
  style: "concept",
  includeTubing: true,
  includePumpModules: false,
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

/** Outer vessel diameter — hero scale. */
const D = 0.58;
const VESSEL_H = D * 1.8;
const VESSEL_X = 0.0;
const VESSEL_Z = 0.12;
const STAND_Y = 0.0;

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
    roughness: 0.28,
    metalness: 0.02,
    transparent: true,
    opacity: 0.4,
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

function createVesselStand(mats: Mats) {
  const group = part("vesselStand");
  const r = D * 0.55;

  addMesh(
    group,
    new CylinderGeometry(r, r * 1.05, 0.04, 20),
    mats.structure,
    "roundBase",
    [VESSEL_X, STAND_Y + 0.02, VESSEL_Z],
  );

  const colH = VESSEL_H * 0.55;
  const colY = STAND_Y + 0.04 + colH * 0.5;
  const colX = D * 0.42;
  addMesh(
    group,
    new CylinderGeometry(0.018, 0.018, colH, 8),
    mats.structure,
    "supportColumnL",
    [VESSEL_X - colX, colY, VESSEL_Z],
  );
  addMesh(
    group,
    new CylinderGeometry(0.018, 0.018, colH, 8),
    mats.structure,
    "supportColumnR",
    [VESSEL_X + colX, colY, VESSEL_Z],
  );

  const ringY = STAND_Y + 0.04 + VESSEL_H * 0.48;
  addMesh(
    group,
    new TorusGeometry(D * 0.52, 0.02, 8, 24),
    mats.structure,
    "clampRing",
    [VESSEL_X, ringY, VESSEL_Z],
    [Math.PI / 2, 0, 0],
  );
  return group;
}

function createCultureVessel(mats: Mats) {
  const group = part("cultureVessel");
  const wallR = D * 0.5;
  const y0 = STAND_Y + 0.04;
  const liquidH = VESSEL_H * 0.34;

  // Thick-wall feel: outer open cylinder + slightly smaller opaque floor
  addMesh(
    group,
    new CylinderGeometry(wallR, wallR, VESSEL_H, 18, 1, true),
    mats.glass,
    "glassShell",
    [VESSEL_X, y0 + VESSEL_H * 0.5, VESSEL_Z],
  );
  addMesh(
    group,
    new CylinderGeometry(wallR * 0.96, wallR * 0.96, 0.035, 16),
    mats.structure,
    "vesselFloor",
    [VESSEL_X, y0 + 0.02, VESSEL_Z],
  );
  addMesh(
    group,
    new CylinderGeometry(wallR * 0.88, wallR * 0.88, liquidH, 16),
    mats.culture,
    "cultureLiquid",
    [VESSEL_X, y0 + liquidH * 0.5 + 0.04, VESSEL_Z],
  );

  const impeller = part("impeller");
  const shaftH = VESSEL_H * 0.88;
  addMesh(
    impeller,
    new CylinderGeometry(0.022, 0.022, shaftH, 8),
    mats.shell,
    "shaft",
    [VESSEL_X, y0 + shaftH * 0.5 + 0.02, VESSEL_Z],
  );
  addMesh(
    impeller,
    new BoxGeometry(0.2, 0.025, 0.05),
    mats.shell,
    "bladeA",
    [VESSEL_X, y0 + 0.11, VESSEL_Z],
  );
  addMesh(
    impeller,
    new BoxGeometry(0.05, 0.025, 0.18),
    mats.shell,
    "bladeB",
    [VESSEL_X, y0 + 0.11, VESSEL_Z],
  );
  group.add(impeller);
  return group;
}

function createHeadplate(mats: Mats) {
  const group = part("headplate");
  const y = STAND_Y + 0.04 + VESSEL_H;
  addMesh(
    group,
    new CylinderGeometry(D * 0.58, D * 0.58, 0.11, 18),
    mats.shell,
    "cap",
    [VESSEL_X, y + 0.055, VESSEL_Z],
  );
  addMesh(
    group,
    new CylinderGeometry(0.03, 0.03, 0.09, 8),
    mats.structure,
    "portA",
    [VESSEL_X - 0.14, y + 0.14, VESSEL_Z + 0.08],
  );
  addMesh(
    group,
    new CylinderGeometry(0.026, 0.026, 0.11, 8),
    mats.structure,
    "portB",
    [VESSEL_X + 0.12, y + 0.15, VESSEL_Z - 0.06],
  );
  addMesh(
    group,
    new CylinderGeometry(0.022, 0.022, 0.08, 8),
    mats.structure,
    "portC",
    [VESSEL_X + 0.05, y + 0.13, VESSEL_Z + 0.12],
  );
  return group;
}

function createControlHead(mats: Mats) {
  const group = part("controlHead");
  const yCap = STAND_Y + 0.04 + VESSEL_H + 0.11;
  addMesh(
    group,
    new CylinderGeometry(0.07, 0.08, 0.08, 12),
    mats.shell,
    "whiteNeck",
    [VESSEL_X, yCap + 0.04, VESSEL_Z],
  );
  const motorH = D * 0.58;
  addMesh(
    group,
    extrudeY(roundedRect(0.2, 0.17, 0.035), motorH, 0.012),
    mats.darkMotor,
    "darkMotor",
    [VESSEL_X, yCap + 0.08, VESSEL_Z],
  );
  addMesh(
    group,
    new CylinderGeometry(0.045, 0.05, 0.045, 10),
    mats.darkMotor,
    "motorCap",
    [VESSEL_X, yCap + 0.08 + motorH + 0.02, VESSEL_Z],
  );
  return group;
}

/** Inlet + outlet only — connect vessel headplate toward mainBody. */
function createTubing(mats: Mats) {
  const group = part("tubing");
  const yPort = STAND_Y + 0.04 + VESSEL_H + 0.18;

  // Inlet: rises from headplate, arcs aft toward control cabinet
  addMesh(
    group,
    new TorusGeometry(0.18, 0.028, 6, 14, Math.PI * 0.9),
    mats.accent,
    "inletTube",
    [VESSEL_X + 0.16, yPort + 0.1, VESSEL_Z - 0.02],
    [0.15, 1.1, 0.35],
  );
  addMesh(
    group,
    new BoxGeometry(0.06, 0.05, 0.06),
    mats.shell,
    "inletFitting",
    [VESSEL_X + 0.22, yPort + 0.02, VESSEL_Z + 0.05],
  );

  // Outlet: shorter path from port toward mainBody front-top
  addMesh(
    group,
    new TorusGeometry(0.15, 0.026, 6, 12, Math.PI * 0.75),
    mats.glass,
    "outletTube",
    [VESSEL_X - 0.08, yPort + 0.06, VESSEL_Z - 0.08],
    [-0.2, -0.9, 0.4],
  );
  addMesh(
    group,
    new CylinderGeometry(0.024, 0.024, 0.22, 8),
    mats.accent,
    "outletDrop",
    [0.2, 0.72, -0.08],
    [0.85, 0.1, 0.2],
  );
  return group;
}

function createMainBody(mats: Mats) {
  const group = part("mainBody");
  // Large cabinet behind the vessel
  const bodyX = 0.08;
  const bodyZ = -0.28;
  addMesh(
    group,
    extrudeY(roundedRect(D * 1.35, D * 0.7, 0.08), D * 1.05, 0.02),
    mats.shell,
    "cabinet",
    [bodyX, STAND_Y + 0.04, bodyZ],
  );

  // Front panel recess + blank screen + button dots (no text)
  addMesh(
    group,
    new BoxGeometry(D * 0.7, D * 0.55, 0.03),
    mats.structure,
    "frontPanel",
    [bodyX, STAND_Y + 0.04 + D * 0.55, bodyZ + D * 0.34],
  );
  addMesh(
    group,
    new BoxGeometry(D * 0.38, D * 0.22, 0.025),
    mats.darkMotor,
    "screenBezel",
    [bodyX - 0.05, STAND_Y + 0.04 + D * 0.72, bodyZ + D * 0.36],
  );
  addMesh(
    group,
    new BoxGeometry(D * 0.32, D * 0.17, 0.016),
    mats.accent,
    "screenFace",
    [bodyX - 0.05, STAND_Y + 0.04 + D * 0.72, bodyZ + D * 0.375],
  );

  const btnY = STAND_Y + 0.04 + D * 0.42;
  const btnZ = bodyZ + D * 0.37;
  addMesh(group, new SphereGeometry(0.028, 8, 8), mats.accent, "btn0", [
    bodyX + 0.18,
    btnY + 0.08,
    btnZ,
  ]);
  addMesh(group, new SphereGeometry(0.028, 8, 8), mats.darkMotor, "btn1", [
    bodyX + 0.18,
    btnY,
    btnZ,
  ]);
  addMesh(group, new SphereGeometry(0.028, 8, 8), mats.accent, "btn2", [
    bodyX + 0.18,
    btnY - 0.08,
    btnZ,
  ]);

  // Side pump strip hint (replaces separate pumpModules)
  addMesh(
    group,
    extrudeY(roundedRect(0.1, 0.14, 0.025), 0.35, 0.008),
    mats.darkMotor,
    "sideStrip",
    [bodyX + D * 0.62, STAND_Y + 0.2, bodyZ + 0.05],
  );
  return group;
}

/**
 * Desktop bioreactor (runtime id: device).
 * Phase 4.1: benchtop silhouette — vessel stand + tall control head + aft cabinet.
 */
export function createBioreactorModel(options?: BioreactorModelOptions): BioreactorBuild {
  const opts = { ...DEFAULT_BIOREACTOR_OPTIONS, ...options };
  void opts.style;
  void opts.includePumpModules;

  const materials = makeMaterials();
  const group = part("bioreactor");
  group.add(createVesselStand(materials));
  group.add(createCultureVessel(materials));
  group.add(createHeadplate(materials));
  group.add(createControlHead(materials));
  if (opts.includeTubing) group.add(createTubing(materials));
  group.add(createMainBody(materials));

  const stats = measureGroup(group);
  group.userData.stats = stats;
  group.userData.options = {
    style: opts.style,
    includeTubing: opts.includeTubing,
    includePumpModules: false,
  };
  return {
    group,
    stats,
    materials: Object.values(materials),
  };
}
