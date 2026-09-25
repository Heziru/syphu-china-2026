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
 * Sculpt brief: .img2threejs/bioreactor/ (image-analysis + sculpt-pass-log).
 * Culture-vessel designs are abandoned.
 */
export const BIOREACTOR_REVISION = 4;

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

/** Reference #1 proportions: tall tower. */
const W = 0.58;
const D = W * 1.05;
const H = W * 2.45;
const BASE_H = 0.08;

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

function createBottomBase(mats: Mats) {
  const group = part("bottomBase");
  addMesh(
    group,
    extrudeY(roundedRect(W * 0.9, D * 0.9, 0.09), BASE_H, 0.01),
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
      new CylinderGeometry(0.026, 0.03, 0.018, 8),
      mats.base,
      `foot${i}`,
      [x, 0.01, z],
    );
  });
  return group;
}

function createMainBody(mats: Mats) {
  const group = part("mainBody");
  const y0 = BASE_H;

  // Lower mass (slightly narrower — taper toward base)
  addMesh(
    group,
    extrudeY(roundedRect(W * 0.88, D * 0.92, 0.11), H * 0.52, 0.02),
    mats.shell,
    "roundedShellLower",
    [0, y0, 0],
  );
  // Upper mass (wider presence under screen)
  addMesh(
    group,
    extrudeY(roundedRect(W, D, 0.12), H * 0.5, 0.022),
    mats.shell,
    "roundedShellUpper",
    [0, y0 + H * 0.48, 0.015],
  );

  const controlPanel = part("controlPanel");
  const screenY = y0 + H * 0.86;
  const screenZ = D * 0.42;
  addMesh(
    controlPanel,
    new BoxGeometry(W * 0.7, H * 0.14, 0.045),
    mats.dark,
    "screenBezel",
    [0, screenY, screenZ],
  );

  const screen = part("screen");
  addMesh(
    screen,
    new BoxGeometry(W * 0.6, H * 0.11, 0.02),
    mats.dark,
    "screenFace",
    [0, 0, 0.014],
  );
  // Abstract UI — no text
  addMesh(
    screen,
    new BoxGeometry(W * 0.2, H * 0.05, 0.01),
    mats.accent,
    "uiMarkA",
    [-0.1, 0.01, 0.022],
  );
  addMesh(
    screen,
    new BoxGeometry(W * 0.14, H * 0.03, 0.01),
    mats.pumpBlue,
    "uiMarkB",
    [0.1, 0.015, 0.022],
  );
  addMesh(
    screen,
    new BoxGeometry(W * 0.42, 0.012, 0.008),
    mats.metal,
    "uiBar",
    [0, -0.03, 0.022],
  );
  screen.position.set(0, screenY, screenZ);
  controlPanel.add(screen);
  group.add(controlPanel);
  return group;
}

function createPump(mats: Mats, name: string, y: number) {
  const group = part(name);
  const z = D * 0.5;
  const x = 0.05;
  addMesh(
    group,
    extrudeY(roundedRect(0.24, 0.15, 0.04), 0.075, 0.008),
    mats.dark,
    "housing",
    [x, y, z],
  );
  addMesh(
    group,
    extrudeY(roundedRect(0.22, 0.13, 0.038), 0.06, 0.008),
    mats.pumpBlue,
    "blueLid",
    [x, y + 0.07, z + 0.012],
  );
  addMesh(
    group,
    new CylinderGeometry(0.038, 0.038, 0.045, 10),
    mats.metal,
    "hub",
    [x, y + 0.045, z + 0.09],
    [Math.PI / 2, 0, 0],
  );
  return group;
}

function createPumpModules(mats: Mats) {
  const group = part("pumpModules");
  const y0 = BASE_H + H * 0.2;
  const gap = H * 0.175;
  group.add(createPump(mats, "pump01", y0 + gap * 2));
  group.add(createPump(mats, "pump02", y0 + gap));
  group.add(createPump(mats, "pump03", y0));
  return group;
}

function createSidePorts(mats: Mats) {
  const group = part("sidePorts");
  const x = -W * 0.48;
  const z0 = 0.04;

  addMesh(
    group,
    new CylinderGeometry(0.038, 0.04, 0.08, 10),
    mats.metal,
    "gasA",
    [x, BASE_H + H * 0.78, z0 + 0.09],
    [0, 0, Math.PI / 2],
  );
  addMesh(
    group,
    new CylinderGeometry(0.038, 0.04, 0.08, 10),
    mats.metal,
    "gasB",
    [x, BASE_H + H * 0.78, z0 - 0.09],
    [0, 0, Math.PI / 2],
  );

  const sensY = BASE_H + H * 0.58;
  for (let i = 0; i < 4; i += 1) {
    const row = Math.floor(i / 2);
    const col = i % 2;
    addMesh(
      group,
      new CylinderGeometry(0.02, 0.02, 0.05, 8),
      mats.metal,
      `sensor${i}`,
      [x, sensY - row * 0.07, z0 + 0.07 - col * 0.12],
      [0, 0, Math.PI / 2],
    );
  }

  const liqY = BASE_H + H * 0.34;
  for (let i = 0; i < 4; i += 1) {
    addMesh(
      group,
      new CylinderGeometry(0.018, 0.018, 0.045, 8),
      mats.metal,
      `liquid${i}`,
      [x, liqY - i * 0.065, z0],
      [0, 0, Math.PI / 2],
    );
  }

  const fitY = BASE_H + H * 0.12;
  for (let i = 0; i < 4; i += 1) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    addMesh(
      group,
      new CylinderGeometry(0.015, 0.015, 0.04, 8),
      mats.shell,
      `fitting${i}`,
      [x, fitY - row * 0.045, z0 + 0.05 - col * 0.1],
      [0, 0, Math.PI / 2],
    );
  }
  return group;
}

function createIndicators(mats: Mats) {
  const group = part("indicators");
  const x = -W * 0.5;
  const y = BASE_H + H * 0.62;
  addMesh(group, new SphereGeometry(0.016, 6, 6), mats.accent, "indOrange", [
    x,
    y,
    0.12,
  ]);
  addMesh(group, new SphereGeometry(0.016, 6, 6), mats.pumpBlue, "indBlue", [
    x,
    y - 0.04,
    0.02,
  ]);
  return group;
}

/**
 * Desktop BioFlo-class controller (runtime LAB id: device).
 * No culture vessel / glass / liquid / tubing network.
 */
export function createBioreactorModel(options?: BioreactorModelOptions): BioreactorBuild {
  const opts = { ...DEFAULT_BIOREACTOR_OPTIONS, ...options };
  void opts.style;

  const materials = makeMaterials();
  const group = part("bioreactor");
  group.add(createBottomBase(materials));
  group.add(createMainBody(materials));
  if (opts.includePumpModules) group.add(createPumpModules(materials));
  if (opts.includeSidePorts) group.add(createSidePorts(materials));
  group.add(createIndicators(materials));

  const stats = measureGroup(group);
  group.userData.stats = stats;
  group.userData.options = opts;
  return {
    group,
    stats,
    materials: Object.values(materials),
  };
}
