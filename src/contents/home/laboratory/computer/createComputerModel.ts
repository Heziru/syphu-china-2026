import {
  BoxGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  MeshToonMaterial,
  Shape,
  type BufferGeometry,
  type Material,
} from "three";

/** Bump when factory geometry changes so the R3F wrapper remounts. */
export const COMPUTER_REVISION = 1;

export const COMPUTER_COLORS = {
  mint: "#A8C5BE",
  darkTop: "#2F3338",
  bezel: "#D5D9DC",
  screen: "#3D6B72",
  chart: "#7EC8C0",
  peripheral: "#3A4246",
} as const;

export type ComputerModelOptions = {
  style?: "concept";
  /** Reserved for future GLB path; procedural is the only implemented source. */
  source?: "procedural" | "gltf";
};

export const DEFAULT_COMPUTER_OPTIONS: Required<ComputerModelOptions> = {
  style: "concept",
  source: "procedural",
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
  const r = Math.min(radius, hw, hh);
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

function extrudeY(shape: Shape, height: number, bevel = 0.008): BufferGeometry {
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
  const mint = new MeshToonMaterial({ color: COMPUTER_COLORS.mint });
  const darkTop = new MeshToonMaterial({ color: COMPUTER_COLORS.darkTop });
  const bezel = new MeshToonMaterial({ color: COMPUTER_COLORS.bezel });
  const screen = new MeshStandardMaterial({
    color: COMPUTER_COLORS.screen,
    emissive: COMPUTER_COLORS.chart,
    emissiveIntensity: 0.35,
    roughness: 0.55,
    metalness: 0.02,
  });
  const peripheral = new MeshToonMaterial({ color: COMPUTER_COLORS.peripheral });
  const accent = new MeshToonMaterial({ color: "#8FAEA7" });
  mint.name = "mint";
  darkTop.name = "darkTop";
  bezel.name = "bezel";
  screen.name = "screen";
  peripheral.name = "peripheral";
  accent.name = "accent";
  return { mint, darkTop, bezel, screen, peripheral, accent };
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

function createDesk(mats: Mats) {
  const group = part("desk");
  // Mint cabinet body (open knee space on the right).
  addMesh(group, extrudeY(roundedRect(1.15, 0.52, 0.04), 0.7, 0.01), mats.mint, "cabinet", [
    0, 0.02, 0,
  ]);
  // Black countertop
  addMesh(group, extrudeY(roundedRect(1.2, 0.56, 0.035), 0.045, 0.008), mats.darkTop, "countertop", [
    0, 0.72, 0,
  ]);
  // Left drawer stack (3)
  const drawerW = 0.34;
  const drawerD = 0.48;
  const drawerH = 0.16;
  const drawerX = -0.36;
  for (let i = 0; i < 3; i += 1) {
    const y = 0.12 + i * (drawerH + 0.04);
    addMesh(
      group,
      extrudeY(roundedRect(drawerW, drawerD, 0.02), drawerH, 0.004),
      mats.accent,
      `drawer${i}`,
      [drawerX, y, 0.02],
    );
    addMesh(
      group,
      new BoxGeometry(0.12, 0.012, 0.02),
      mats.darkTop,
      `drawerHandle${i}`,
      [drawerX, y + drawerH * 0.55, drawerD * 0.5 - 0.01],
    );
  }
  return group;
}

function createMonitor(mats: Mats) {
  const group = part("monitor");
  const deskTopY = 0.765;
  // Pedestal
  addMesh(group, new CylinderGeometry(0.07, 0.1, 0.04, 12), mats.bezel, "pedestal", [
    0.08, deskTopY + 0.02, -0.08,
  ]);
  addMesh(group, new CylinderGeometry(0.028, 0.032, 0.22, 10), mats.bezel, "neck", [
    0.08, deskTopY + 0.14, -0.08,
  ]);
  // Bezel + screen (slightly tilted back)
  const panel = part("panel");
  panel.position.set(0.08, deskTopY + 0.38, -0.1);
  panel.rotation.set(-0.08, 0, 0);
  addMesh(panel, extrudeY(roundedRect(0.62, 0.06, 0.02), 0.4, 0.006), mats.bezel, "bezelFrame", [
    0, -0.2, 0,
  ]);
  addMesh(panel, new BoxGeometry(0.54, 0.34, 0.012), mats.screen, "display", [0, 0.0, 0.028]);
  // Abstract chart stubs (no real UI chrome)
  addMesh(panel, new BoxGeometry(0.32, 0.012, 0.006), mats.bezel, "chartBase", [0, -0.08, 0.036]);
  addMesh(panel, new BoxGeometry(0.08, 0.12, 0.006), mats.bezel, "chartBar0", [-0.1, -0.02, 0.036]);
  addMesh(panel, new BoxGeometry(0.08, 0.18, 0.006), mats.bezel, "chartBar1", [0.0, 0.01, 0.036]);
  addMesh(panel, new BoxGeometry(0.08, 0.1, 0.006), mats.bezel, "chartBar2", [0.1, -0.03, 0.036]);
  group.add(panel);
  return group;
}

function createPeripherals(mats: Mats) {
  const group = part("peripherals");
  const deskTopY = 0.765;
  addMesh(
    group,
    extrudeY(roundedRect(0.42, 0.16, 0.02), 0.022, 0.003),
    mats.peripheral,
    "keyboard",
    [-0.05, deskTopY, 0.12],
  );
  addMesh(
    group,
    extrudeY(roundedRect(0.07, 0.11, 0.025), 0.028, 0.004),
    mats.peripheral,
    "mouse",
    [0.28, deskTopY, 0.14],
  );
  return group;
}

/**
 * Procedural Dry Lab workstation (desk + monitor + peripherals).
 * Chair is intentionally omitted — environment prop later.
 */
export function createComputerModel(options?: ComputerModelOptions): ComputerBuild {
  const { style, source } = { ...DEFAULT_COMPUTER_OPTIONS, ...options };
  void style;
  void source;

  const materials = makeMaterials();
  const group = part("computer");
  group.add(createDesk(materials));
  group.add(createMonitor(materials));
  group.add(createPeripherals(materials));

  const stats = measureGroup(group);
  group.userData.stats = stats;
  group.userData.options = { style, source };
  return {
    group,
    stats,
    materials: Object.values(materials),
  };
}
