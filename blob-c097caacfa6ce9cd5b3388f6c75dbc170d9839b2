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
 * Phase 5.2: thicker front pumps, mounting recess, weighty base (proportions unchanged).
 */
export const BIOREACTOR_REVISION = 6;

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
  // Deep gray weight strip under the white shell
  addMesh(
    group,
    extrudeY(roundedRect(W * 0.96, D * 0.96, 0.09), BASE_H * 0.55, 0.008),
    mats.base,
    "baseStrip",
    [0, 0, 0],
  );
  addMesh(
    group,
    extrudeY(roundedRect(W * 0.88, D * 0.88, 0.08), BASE_H * 0.5, 0.008),
    mats.dark,
    "plinthInset",
    [0, BASE_H * 0.45, 0],
  );
  // Side foot pads (weight / stance)
  const fx = W * 0.34;
  const fz = D * 0.34;
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
      new BoxGeometry(0.07, 0.022, 0.07),
      mats.base,
      `footPad${i}`,
      [x, 0.01, z],
    );
  });
  return group;
}

/**
 * Tall rounded shell + deeper front pump mounting recess.
 * Proportions locked from Phase 5.1.
 */
function createMainBody(mats: Mats) {
  const group = part("mainBody");
  const y0 = BASE_H;

  addMesh(
    group,
    extrudeY(roundedRect(W, D, 0.11), H, 0.022),
    mats.shell,
    "roundedShell",
    [0, y0, 0],
  );

  const frontPanel = part("frontPanel");
  // Wide dark face plate
  addMesh(
    frontPanel,
    new BoxGeometry(W * 0.7, H * 0.78, 0.03),
    mats.dark,
    "frontRecess",
    [0.02, y0 + H * 0.48, FRONT_Z + 0.008],
  );
  // Pump mounting recess — cavity so pumps read as embedded
  addMesh(
    frontPanel,
    new BoxGeometry(W * 0.42, H * 0.5, 0.055),
    mats.dark,
    "pumpMountingRecess",
    [0.05, y0 + H * 0.36, FRONT_Z - 0.01],
  );
  // Thin shell lip around recess (frame)
  addMesh(
    frontPanel,
    new BoxGeometry(W * 0.46, H * 0.54, 0.018),
    mats.shell,
    "pumpBayFrame",
    [0.05, y0 + H * 0.36, FRONT_Z + 0.028],
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
 * Thick BioFlo pump head — readable in front and side views.
 * blueCap + darkHousing + centerHub
 */
function createPump(mats: Mats, name: string, y: number) {
  const group = part(name);
  const x = 0.05;
  const pumpW = 0.24;
  const pumpH = 0.15;
  // Deeper stack so side view shows volume (not a flat sticker)
  const housingD = 0.12;
  const capD = 0.11;

  addMesh(
    group,
    new BoxGeometry(pumpW, pumpH * 0.62, housingD),
    mats.dark,
    "darkHousing",
    [x, y - pumpH * 0.08, FRONT_Z + housingD * 0.35],
  );
  addMesh(
    group,
    new BoxGeometry(pumpW * 0.96, pumpH * 0.58, capD),
    mats.pumpBlue,
    "blueCap",
    [x, y + pumpH * 0.2, FRONT_Z + housingD * 0.55 + capD * 0.35],
  );
  addMesh(
    group,
    new CylinderGeometry(0.04, 0.042, 0.05, 10),
    mats.metal,
    "centerHub",
    [x, y + 0.01, FRONT_Z + housingD * 0.55 + capD * 0.75],
    [Math.PI / 2, 0, 0],
  );
  return group;
}

function createMiddlePumpArea(mats: Mats) {
  const group = part("middlePumpArea");
  const y0 = BASE_H + H * 0.22;
  const gap = H * 0.18;
  group.add(createPump(mats, "pump01", y0 + gap * 2));
  group.add(createPump(mats, "pump02", y0 + gap));
  group.add(createPump(mats, "pump03", y0));
  return group;
}

/** 6 ports — size hierarchy only (no count change). */
function createSidePorts(mats: Mats) {
  const group = part("leftSidePorts");
  const x = -W * 0.5;
  // [y, z, radius, length] — larger gas → mid sensors → smaller liquid
  const ports: Array<[number, number, number, number]> = [
    [BASE_H + H * 0.82, 0.09, 0.045, 0.075],
    [BASE_H + H * 0.82, -0.09, 0.045, 0.075],
    [BASE_H + H * 0.58, 0.05, 0.03, 0.055],
    [BASE_H + H * 0.5, 0.05, 0.03, 0.055],
    [BASE_H + H * 0.34, 0.0, 0.022, 0.045],
    [BASE_H + H * 0.26, 0.0, 0.022, 0.045],
  ];
  ports.forEach(([y, z, r, len], i) => {
    addMesh(
      group,
      new CylinderGeometry(r, r, len, 8),
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
