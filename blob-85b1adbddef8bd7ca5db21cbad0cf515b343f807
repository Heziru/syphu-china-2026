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
export const COMPUTER_REVISION = 3;

export const COMPUTER_COLORS = {
  wood: "#E2C9A8",
  device: "#3A3E44",
  screen: "#2A2E33",
  accent: "#E8A06A",
  accentCool: "#7EB8C4",
  propDark: "#2C3034",
} as const;

export type ComputerModelOptions = {
  style?: "concept";
  includeHeadphones?: boolean;
};

export const DEFAULT_COMPUTER_OPTIONS: Required<ComputerModelOptions> = {
  style: "concept",
  includeHeadphones: true,
};

export type ComputerStats = {
  triangles: number;
  meshes: number;
  materials: number;
  parts: string[];
};

export type ComputerBuild = {
  group: Group;
  stats: ComputerStats;
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
  const wood = new MeshToonMaterial({ color: COMPUTER_COLORS.wood });
  const device = new MeshToonMaterial({ color: COMPUTER_COLORS.device });
  const screen = new MeshStandardMaterial({
    color: COMPUTER_COLORS.screen,
    roughness: 0.55,
    metalness: 0.02,
    emissive: "#1a2226",
    emissiveIntensity: 0.25,
  });
  const accent = new MeshToonMaterial({ color: COMPUTER_COLORS.accent });
  const accentCool = new MeshToonMaterial({ color: COMPUTER_COLORS.accentCool });
  const propDark = new MeshToonMaterial({ color: COMPUTER_COLORS.propDark });
  wood.name = "wood";
  device.name = "device";
  screen.name = "screen";
  accent.name = "accent";
  accentCool.name = "accentCool";
  propDark.name = "propDark";
  return { wood, device, screen, accent, accentCool, propDark };
}

export function measureGroup(root: Group): ComputerStats {
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

function createDeskPlatform(mats: Mats) {
  const group = part("deskPlatform");
  addMesh(group, extrudeY(roundedRect(1.35, 0.72, 0.08), 0.09, 0.016), mats.wood, "deskSlab", [
    0, 0.0, 0,
  ]);
  return group;
}

function addDigitalBars(
  parent: Group,
  mats: Mats,
  origin: [number, number, number],
  count: number,
  cool: boolean,
) {
  for (let i = 0; i < count; i += 1) {
    const h = 0.04 + (i % 3) * 0.025;
    addMesh(
      parent,
      new BoxGeometry(0.035, h, 0.006),
      cool || i % 2 === 0 ? mats.accentCool : mats.accent,
      `bar${i}`,
      [origin[0] + i * 0.048, origin[1] + h * 0.5 - 0.08, origin[2]],
    );
  }
}

function createMonitor(mats: Mats) {
  const group = part("monitor");
  const deskY = 0.09;
  // T-stand
  addMesh(group, extrudeY(roundedRect(0.28, 0.12, 0.03), 0.03, 0.004), mats.device, "standBase", [
    0.28, deskY, -0.12,
  ]);
  addMesh(group, new BoxGeometry(0.05, 0.18, 0.04), mats.device, "standNeck", [
    0.28, deskY + 0.12, -0.12,
  ]);
  const panel = part("monitorPanel");
  panel.position.set(0.28, deskY + 0.38, -0.14);
  panel.rotation.set(-0.06, 0, 0);
  addMesh(panel, extrudeY(roundedRect(0.7, 0.08, 0.045), 0.44, 0.012), mats.device, "bezel", [
    0, -0.22, 0,
  ]);
  addMesh(panel, new BoxGeometry(0.6, 0.36, 0.012), mats.screen, "display", [0, 0.0, 0.04]);
  group.add(panel);
  return group;
}

function createLaptop(mats: Mats) {
  const group = part("laptop");
  const deskY = 0.09;
  const base = part("laptopBase");
  base.position.set(-0.28, deskY, 0.06);
  base.rotation.set(0, 0.35, 0);
  addMesh(base, extrudeY(roundedRect(0.48, 0.32, 0.035), 0.028, 0.006), mats.device, "baseShell");
  addMesh(base, new BoxGeometry(0.36, 0.008, 0.18), mats.propDark, "keyDeck", [0, 0.018, -0.02]);
  addMesh(base, new BoxGeometry(0.12, 0.006, 0.08), mats.propDark, "trackpad", [0, 0.017, 0.08]);

  const lid = part("laptopLid");
  lid.position.set(0, 0.02, -0.15);
  // ~110° open: lid tilts back from base plane
  lid.rotation.set((-70 * Math.PI) / 180, 0, 0);
  addMesh(lid, extrudeY(roundedRect(0.48, 0.04, 0.035), 0.3, 0.006), mats.device, "lidShell", [
    0, 0.0, 0.0,
  ]);
  addMesh(lid, new BoxGeometry(0.42, 0.24, 0.01), mats.screen, "lidDisplay", [0, 0.02, 0.022]);
  base.add(lid);
  group.add(base);
  return group;
}

/** Procedural abstract UI glyphs — no PNG, no readable text, no logos. */
function createDigitalElements(mats: Mats) {
  const group = part("digitalElements");
  const deskY = 0.09;

  const monitorUi = part("monitorUi");
  monitorUi.position.set(0.28, deskY + 0.38, -0.14);
  monitorUi.rotation.set(-0.06, 0, 0);
  // Abstract { / } — block glyphs
  addMesh(monitorUi, new BoxGeometry(0.035, 0.14, 0.008), mats.accent, "braceL", [
    -0.12, 0.02, 0.05,
  ]);
  addMesh(monitorUi, new BoxGeometry(0.08, 0.035, 0.008), mats.accent, "slash", [0.0, 0.02, 0.05], [
    0, 0, -0.6,
  ]);
  addMesh(monitorUi, new BoxGeometry(0.035, 0.14, 0.008), mats.accent, "braceR", [
    0.12, 0.02, 0.05,
  ]);
  addDigitalBars(monitorUi, mats, [-0.26, 0.05, 0.05], 4, true);
  addDigitalBars(monitorUi, mats, [0.18, 0.05, 0.05], 4, false);
  group.add(monitorUi);

  const laptopUi = part("laptopUi");
  laptopUi.position.set(-0.28, deskY, 0.06);
  laptopUi.rotation.set(0, 0.35, 0);
  const lidUi = part("lidUi");
  lidUi.position.set(0, 0.02, -0.15);
  lidUi.rotation.set((-70 * Math.PI) / 180, 0, 0);
  addDigitalBars(lidUi, mats, [-0.14, 0.0, 0.03], 5, false);
  addMesh(lidUi, new BoxGeometry(0.06, 0.06, 0.008), mats.accentCool, "node", [0.12, 0.06, 0.03]);
  laptopUi.add(lidUi);
  group.add(laptopUi);

  return group;
}

function createHeadphones(mats: Mats) {
  const group = part("headphones");
  const deskY = 0.09;
  group.position.set(-0.15, deskY, 0.28);
  group.rotation.set(0, 0.4, 0);
  addMesh(group, new TorusGeometry(0.1, 0.018, 8, 16, Math.PI), mats.propDark, "headband", [
    0, 0.12, 0,
  ], [0, 0, 0]);
  addMesh(group, new SphereGeometry(0.055, 10, 8), mats.propDark, "cupL", [-0.1, 0.05, 0]);
  addMesh(group, new SphereGeometry(0.055, 10, 8), mats.propDark, "cupR", [0.1, 0.05, 0]);
  addMesh(group, new CylinderGeometry(0.04, 0.04, 0.02, 10), mats.device, "padL", [-0.1, 0.05, 0.02], [
    Math.PI / 2, 0, 0,
  ]);
  addMesh(group, new CylinderGeometry(0.04, 0.04, 0.02, 10), mats.device, "padR", [0.1, 0.05, 0.02], [
    Math.PI / 2, 0, 0,
  ]);
  return group;
}

function createMouse(mats: Mats) {
  const group = part("mouse");
  addMesh(
    group,
    extrudeY(roundedRect(0.06, 0.1, 0.025), 0.028, 0.005),
    mats.device,
    "mouseBody",
    [0.45, 0.09, 0.18],
  );
  return group;
}

/**
 * Dry Lab digital workstation: desk platform + monitor + laptop (+ headphones).
 * No readable text / logos / texture UI.
 */
export function createComputerModel(options?: ComputerModelOptions): ComputerBuild {
  const { style, includeHeadphones } = {
    ...DEFAULT_COMPUTER_OPTIONS,
    ...options,
  };
  void style;

  const materials = makeMaterials();
  const group = part("computer");
  group.add(createDeskPlatform(materials));
  group.add(createMonitor(materials));
  group.add(createLaptop(materials));
  group.add(createMouse(materials));
  if (includeHeadphones) group.add(createHeadphones(materials));
  group.add(createDigitalElements(materials));

  const stats = measureGroup(group);
  group.userData.stats = stats;
  group.userData.options = { style, includeHeadphones };
  return {
    group,
    stats,
    materials: Object.values(materials),
  };
}
