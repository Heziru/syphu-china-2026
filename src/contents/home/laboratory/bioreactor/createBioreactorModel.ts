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

/** Bump when factory geometry changes so the R3F wrapper remounts. */
export const BIOREACTOR_REVISION = 3;

export const BIOREACTOR_COLORS = {
  shell: "#F3F1EC",
  base: "#6A7278",
  pumpBlue: "#2F6FB3",
  dark: "#3C4146",
  metal: "#8D949C",
  accent: "#FF7A00",
} as const;

export type BioreactorModelOptions = {
  style?: "concept";
  /** Kept for API compat; BioFlo recreation has no free tubing. */
  includeTubing?: boolean;
  includePumpModules?: boolean;
};

export const DEFAULT_BIOREACTOR_OPTIONS: Required<BioreactorModelOptions> = {
  style: "concept",
  includeTubing: false,
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

/** Overall BioFlo-like tower proportions (scene units). */
const BODY_W = 0.62;
const BODY_D = 0.52;
const BODY_H = 1.18;
const BASE_H = 0.07;

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

function extrudeY(shape: Shape, height: number, bevel = 0.012): BufferGeometry {
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
    roughness: 0.45,
    metalness: 0.35,
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

function createBase(mats: Mats) {
  const group = part("base");
  // Slightly inset gray plinth
  addMesh(
    group,
    extrudeY(roundedRect(BODY_W * 0.92, BODY_D * 0.92, 0.08), BASE_H, 0.01),
    mats.base,
    "plinth",
    [0, 0, 0],
  );
  const footY = 0.012;
  const fx = BODY_W * 0.32;
  const fz = BODY_D * 0.32;
  for (const [i, x, z] of [
    [0, -fx, -fz],
    [1, fx, -fz],
    [2, -fx, fz],
    [3, fx, fz],
  ] as const) {
    addMesh(
      group,
      new CylinderGeometry(0.028, 0.032, 0.02, 8),
      mats.base,
      `foot${i}`,
      [x, footY, z],
    );
  }
  return group;
}

/** Tall white tower — wider upper mass, unified instrument shell. */
function createMainBody(mats: Mats) {
  const group = part("mainBody");
  const y0 = BASE_H;
  // Lower torso (slightly narrower)
  addMesh(
    group,
    extrudeY(roundedRect(BODY_W * 0.9, BODY_D * 0.88, 0.1), BODY_H * 0.55, 0.018),
    mats.shell,
    "torsoLower",
    [0, y0, 0],
  );
  // Upper torso (wider / taller presence)
  addMesh(
    group,
    extrudeY(roundedRect(BODY_W, BODY_D, 0.11), BODY_H * 0.48, 0.02),
    mats.shell,
    "torsoUpper",
    [0, y0 + BODY_H * 0.5, 0.01],
  );
  // Soft front brow above pumps
  addMesh(
    group,
    extrudeY(roundedRect(BODY_W * 0.72, 0.06, 0.03), 0.08, 0.008),
    mats.shell,
    "frontBrow",
    [0, y0 + BODY_H * 0.72, BODY_D * 0.42],
  );
  return group;
}

function createControlPanel(mats: Mats) {
  const group = part("controlPanel");
  const y = BASE_H + BODY_H * 0.88;
  const z = BODY_D * 0.38;
  addMesh(
    group,
    new BoxGeometry(BODY_W * 0.62, BODY_H * 0.16, 0.04),
    mats.dark,
    "screenBezel",
    [0, y, z],
  );
  const screen = part("screen");
  addMesh(
    screen,
    new BoxGeometry(BODY_W * 0.54, BODY_H * 0.12, 0.02),
    mats.dark,
    "screenFace",
    [0, 0, 0.012],
  );
  // Abstract UI marks — no text / logos
  addMesh(
    screen,
    new BoxGeometry(BODY_W * 0.18, BODY_H * 0.06, 0.01),
    mats.accent,
    "uiBlockA",
    [-0.1, 0.01, 0.02],
  );
  addMesh(
    screen,
    new BoxGeometry(BODY_W * 0.12, BODY_H * 0.035, 0.01),
    mats.pumpBlue,
    "uiBlockB",
    [0.1, 0.02, 0.02],
  );
  addMesh(
    screen,
    new BoxGeometry(BODY_W * 0.4, 0.012, 0.008),
    mats.metal,
    "uiBar",
    [0, -0.035, 0.02],
  );
  screen.position.set(0, y, z);
  group.add(screen);
  return group;
}

function createPump(mats: Mats, name: string, y: number) {
  const group = part(name);
  const z = BODY_D * 0.48;
  // Dark lower housing
  addMesh(
    group,
    extrudeY(roundedRect(0.22, 0.14, 0.04), 0.07, 0.008),
    mats.dark,
    "pumpHousing",
    [0.04, y, z],
  );
  // Blue lid / cover — key BioFlo identity
  addMesh(
    group,
    extrudeY(roundedRect(0.2, 0.12, 0.035), 0.055, 0.008),
    mats.pumpBlue,
    "pumpLid",
    [0.04, y + 0.065, z + 0.01],
  );
  addMesh(
    group,
    new CylinderGeometry(0.035, 0.035, 0.04, 10),
    mats.metal,
    "pumpHub",
    [0.04, y + 0.04, z + 0.08],
    [Math.PI / 2, 0, 0],
  );
  return group;
}

function createPumpModules(mats: Mats) {
  const group = part("pumpModules");
  const y0 = BASE_H + BODY_H * 0.22;
  const gap = BODY_H * 0.17;
  group.add(createPump(mats, "pump1", y0 + gap * 2));
  group.add(createPump(mats, "pump2", y0 + gap));
  group.add(createPump(mats, "pump3", y0));
  return group;
}

function createSidePorts(mats: Mats) {
  const group = part("sidePorts");
  const x = -BODY_W * 0.48;
  const z0 = 0.05;

  // Gas ports (larger, upper)
  addMesh(
    group,
    new CylinderGeometry(0.035, 0.038, 0.07, 10),
    mats.metal,
    "gasPortA",
    [x, BASE_H + BODY_H * 0.78, z0 + 0.08],
    [0, 0, Math.PI / 2],
  );
  addMesh(
    group,
    new CylinderGeometry(0.035, 0.038, 0.07, 10),
    mats.metal,
    "gasPortB",
    [x, BASE_H + BODY_H * 0.78, z0 - 0.08],
    [0, 0, Math.PI / 2],
  );

  // Sensor cluster
  const sensY = BASE_H + BODY_H * 0.58;
  for (let i = 0; i < 4; i += 1) {
    const row = Math.floor(i / 2);
    const col = i % 2;
    addMesh(
      group,
      new CylinderGeometry(0.022, 0.022, 0.05, 8),
      mats.metal,
      `sensor${i}`,
      [x, sensY - row * 0.08, z0 + 0.06 - col * 0.12],
      [0, 0, Math.PI / 2],
    );
  }
  addMesh(
    group,
    new SphereGeometry(0.015, 6, 6),
    mats.accent,
    "indicatorOrange",
    [x - 0.02, sensY + 0.05, z0 + 0.1],
  );
  addMesh(
    group,
    new SphereGeometry(0.015, 6, 6),
    mats.pumpBlue,
    "indicatorBlue",
    [x - 0.02, sensY + 0.05, z0 - 0.02],
  );

  // Liquid ports column
  const liqY = BASE_H + BODY_H * 0.32;
  for (let i = 0; i < 4; i += 1) {
    addMesh(
      group,
      new CylinderGeometry(0.02, 0.02, 0.045, 8),
      mats.metal,
      `liquidPort${i}`,
      [x, liqY - i * 0.07, z0],
      [0, 0, Math.PI / 2],
    );
  }

  // Bottom white-ish push fittings (use shell)
  const fitY = BASE_H + BODY_H * 0.12;
  for (let i = 0; i < 4; i += 1) {
    const col = i % 2;
    const row = Math.floor(i / 2);
    addMesh(
      group,
      new CylinderGeometry(0.016, 0.016, 0.04, 8),
      mats.shell,
      `fitting${i}`,
      [x, fitY - row * 0.05, z0 + 0.05 - col * 0.1],
      [0, 0, Math.PI / 2],
    );
  }
  return group;
}

/**
 * BioFlo-class desktop bioreactor controller (runtime id: device).
 * REFERENCE RECREATION: tall white body + 3 blue pumps + side ports.
 * No culture vessel / motor tower / tubing network.
 */
export function createBioreactorModel(options?: BioreactorModelOptions): BioreactorBuild {
  const opts = { ...DEFAULT_BIOREACTOR_OPTIONS, ...options };
  void opts.style;
  void opts.includeTubing;

  const materials = makeMaterials();
  const group = part("bioreactor");
  group.add(createBase(materials));
  group.add(createMainBody(materials));
  group.add(createControlPanel(materials));
  if (opts.includePumpModules !== false) group.add(createPumpModules(materials));
  group.add(createSidePorts(materials));

  const stats = measureGroup(group);
  group.userData.stats = stats;
  group.userData.options = opts;
  return {
    group,
    stats,
    materials: Object.values(materials),
  };
}
