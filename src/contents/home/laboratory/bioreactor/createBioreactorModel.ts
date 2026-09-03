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
  type BufferGeometry,
  type Material,
} from "three";

/**
 * BioFlo-class benchtop bioprocess controller.
 * Phase 5.1: tall silhouette + three vertical front pumps (no culture vessel).
 */
export const BIOREACTOR_REVISION = 5;

export const BIOREACTOR_COLORS = {
  shell: "#F3F1EC",
  base: "#5E666C",
  pumpBlue: "#2F6FB3",
  dark: "#3C4146",
  metal: "#8D949C",
  accent: "#FF7A00",
} as const;

export type BioreactorModelOptions = {
  style?: "concept";
  includePumpModules?: boolean;
  includeSidePorts?: boolean;
};

export const DEFAULT_BIOREACTOR_OPTIONS: Required<BioreactorModelOptions> = {
  style: "concept",
  includePumpModules: true,
  includeSidePorts: true,
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

/** Keep width; enforce tall BioFlo silhouette (H:W ≈ 2.45). */
const W = 0.52;
const D = 0.55;
const H = W * 2.45;
const BASE_H = 0.09;
const FRONT_Z = D * 0.5;

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

function extrudeY(shape: Shape, height: number, bevel = 0.014): BufferGeometry {
  const geo = new ExtrudeGeometry(shape, {
    depth: height,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 1,
    curveSegments: 5,
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
  const base = new MeshToonMaterial({ color: BIOREACTOR_COLORS.base });
  const pumpBlue = new MeshToonMaterial({ color: BIOREACTOR_COLORS.pumpBlue });
  const dark = new MeshToonMaterial({ color: BIOREACTOR_COLORS.dark });
  const metal = new MeshStandardMaterial({
    color: BIOREACTOR_COLORS.metal,
    roughness: 0.42,
    metalness: 0.4,
  });
  const accent = new MeshToonMaterial({ color: BIOREACTOR_COLORS.accent });
  shell.name = "shell";
  base.name = "base";
  pumpBlue.name = "pumpBlue";
  dark.name = "dark";
  metal.name = "metal";
  accent.name = "accent";
  return { shell, base, pumpBlue, dark, metal, accent };
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

function createLowerBase(mats: Mats) {
  const group = part("lowerBase");
  addMesh(
    group,
    extrudeY(roundedRect(W * 0.92, D * 0.92, 0.09), BASE_H, 0.01),
    mats.base,
    "plinth",
    [0, 0, 0],
  );
  const fx = W * 0.3;
  const fz = D * 0.3;
  (
    [
      [0, -fx, -fz],
      [1, fx, -fz],
      [2, -fx, fz],
      [3, fx, fz],
    ] as const
  ).forEach(([i, x, z]) => {
    addMesh(
      group,
      new CylinderGeometry(0.024, 0.028, 0.016, 8),
      mats.base,
      `foot${i}`,
      [x, 0.008, z],
    );
  });
  return group;
}

/**
 * Tall rounded shell + front recess frame.
 * Single continuous height stack (not a squat double-box).
 */
function createMainBody(mats: Mats) {
  const group = part("mainBody");
  const y0 = BASE_H;

  // One tall rounded shell — primary silhouette
  addMesh(
    group,
    extrudeY(roundedRect(W, D, 0.11), H, 0.022),
    mats.shell,
    "roundedShell",
    [0, y0, 0],
  );

  // Front panel recess (dark inset plate for pumps + screen hierarchy)
  const frontPanel = part("frontPanel");
  addMesh(
    frontPanel,
    new BoxGeometry(W * 0.72, H * 0.78, 0.035),
    mats.dark,
    "frontRecess",
    [0.02, y0 + H * 0.48, FRONT_Z + 0.01],
  );
  // Pump bay border / mounting frame
  addMesh(
    frontPanel,
    new BoxGeometry(W * 0.48, H * 0.52, 0.02),
    mats.shell,
    "pumpBayFrame",
    [0.04, y0 + H * 0.36, FRONT_Z + 0.03],
  );

  const upperControlArea = part("upperControlArea");
  const screen = part("screen");
  addMesh(
    screen,
    new BoxGeometry(W * 0.58, H * 0.13, 0.04),
    mats.dark,
    "screenBezel",
    [0, 0, 0],
  );
  addMesh(
    screen,
    new BoxGeometry(W * 0.5, H * 0.1, 0.02),
    mats.dark,
    "screenFace",
    [0, 0, 0.018],
  );
  addMesh(
    screen,
    new BoxGeometry(W * 0.16, H * 0.045, 0.012),
    mats.accent,
    "uiMarkA",
    [-0.08, 0.01, 0.028],
  );
  addMesh(
    screen,
    new BoxGeometry(W * 0.12, H * 0.03, 0.012),
    mats.pumpBlue,
    "uiMarkB",
    [0.09, 0.012, 0.028],
  );
  screen.position.set(0, y0 + H * 0.86, FRONT_Z + 0.04);
  upperControlArea.add(screen);
  frontPanel.add(upperControlArea);

  group.add(frontPanel);
  return group;
}

/**
 * One BioFlo pump head — MUST protrude on +Z (not extrude along Y).
 * blueFrontCap + darkLowerHousing + centerHub
 */
function createPump(mats: Mats, name: string, y: number) {
  const group = part(name);
  const x = 0.04;
  const pumpW = 0.22;
  const pumpH = 0.14;
  const darkD = 0.1;
  const blueD = 0.08;

  // Dark housing sits against front, extends outward
  addMesh(
    group,
    new BoxGeometry(pumpW, pumpH * 0.55, darkD),
    mats.dark,
    "darkLowerHousing",
    [x, y - pumpH * 0.12, FRONT_Z + darkD * 0.5 + 0.02],
  );
  // Blue cap — primary identity, clearly in front
  addMesh(
    group,
    new BoxGeometry(pumpW * 0.95, pumpH * 0.55, blueD),
    mats.pumpBlue,
    "blueFrontCap",
    [x, y + pumpH * 0.18, FRONT_Z + darkD + blueD * 0.35],
  );
  // Hub faces camera
  addMesh(
    group,
    new CylinderGeometry(0.035, 0.035, 0.04, 10),
    mats.metal,
    "centerHub",
    [x, y, FRONT_Z + darkD + blueD * 0.55],
    [Math.PI / 2, 0, 0],
  );
  return group;
}

function createMiddlePumpArea(mats: Mats) {
  const group = part("middlePumpArea");
  const y0 = BASE_H + H * 0.22;
  const gap = H * 0.18;
  // Top → bottom: pump01, pump02, pump03
  group.add(createPump(mats, "pump01", y0 + gap * 2));
  group.add(createPump(mats, "pump02", y0 + gap));
  group.add(createPump(mats, "pump03", y0));
  return group;
}

/** 6 simplified left-side ports (within 5–8). */
function createSidePorts(mats: Mats) {
  const group = part("leftSidePorts");
  const x = -W * 0.5;
  const ports: Array<[number, number, number]> = [
    [BASE_H + H * 0.82, 0.08, 0.04],
    [BASE_H + H * 0.82, -0.08, 0.04],
    [BASE_H + H * 0.58, 0.06, 0.028],
    [BASE_H + H * 0.5, 0.06, 0.028],
    [BASE_H + H * 0.34, 0.0, 0.025],
    [BASE_H + H * 0.26, 0.0, 0.025],
  ];
  ports.forEach(([y, z, r], i) => {
    addMesh(
      group,
      new CylinderGeometry(r, r, 0.06, 8),
      mats.metal,
      `port${i}`,
      [x, y, z],
      [0, 0, Math.PI / 2],
    );
  });
  addMesh(
    group,
    new SphereGeometry(0.015, 6, 6),
    mats.accent,
    "indicator",
    [x - 0.01, BASE_H + H * 0.62, 0.1],
  );
  return group;
}

/**
 * Desktop BioFlo-class controller (runtime LAB id: device).
 */
export function createBioreactorModel(options?: BioreactorModelOptions): BioreactorBuild {
  const opts = { ...DEFAULT_BIOREACTOR_OPTIONS, ...options };
  void opts.style;

  const materials = makeMaterials();
  const group = part("bioreactor");
  group.add(createLowerBase(materials));
  group.add(createMainBody(materials));
  if (opts.includePumpModules) group.add(createMiddlePumpArea(materials));
  if (opts.includeSidePorts) group.add(createSidePorts(materials));

  const stats = measureGroup(group);
  group.userData.stats = stats;
  group.userData.options = opts;
  return {
    group,
    stats,
    materials: Object.values(materials),
  };
}
