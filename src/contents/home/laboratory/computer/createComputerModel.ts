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
  Vector3,
  type BufferGeometry,
  type Material,
} from "three";

/** Bump when factory geometry changes so the R3F wrapper remounts. */
export const COMPUTER_REVISION = 6;

export const COMPUTER_COLORS = {
  wood: "#E2C9A8",
  /** External monitor / dark props */
  device: "#3A3E44",
  /** Laptop shell — lighter gray for hierarchy */
  laptopShell: "#5C6168",
  screen: "#2A2E33",
  /** Laptop accents */
  accent: "#E8A06A",
  /** Monitor biological viz */
  accentCool: "#6FB5A8",
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

/** Interior angle between keyboard deck and screen (degrees). */
const LAPTOP_OPEN_DEG = 115;

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
  const laptopShell = new MeshToonMaterial({
    color: COMPUTER_COLORS.laptopShell,
  });
  const screen = new MeshStandardMaterial({
    color: COMPUTER_COLORS.screen,
    roughness: 0.55,
    metalness: 0.02,
    emissive: "#1a2226",
    emissiveIntensity: 0.25,
  });
  const accent = new MeshToonMaterial({ color: COMPUTER_COLORS.accent });
  const accentCool = new MeshToonMaterial({
    color: COMPUTER_COLORS.accentCool,
  });
  wood.name = "wood";
  device.name = "device";
  laptopShell.name = "laptopShell";
  screen.name = "screen";
  accent.name = "accent";
  accentCool.name = "accentCool";
  return { wood, device, laptopShell, screen, accent, accentCool };
}

export function measureGroup(root: Group): ComputerStats {
  let triangles = 0;
  let meshes = 0;
  const materialSet = new Set<Material>();
  const parts: string[] = [];
  root.traverse((obj) => {
    if (
      obj instanceof Group &&
      obj !== root &&
      obj.children.length > 0 &&
      obj.name
    ) {
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
  addMesh(
    group,
    extrudeY(roundedRect(1.35, 0.72, 0.08), 0.09, 0.016),
    mats.wood,
    "deskSlab",
    [0, 0.0, 0],
  );
  return group;
}

function addLink(
  parent: Group,
  material: Material,
  name: string,
  a: [number, number, number],
  b: [number, number, number],
  radius: number,
) {
  const from = new Vector3(...a);
  const to = new Vector3(...b);
  const dir = new Vector3().subVectors(to, from);
  const len = dir.length() || 0.001;
  const mesh = addMesh(
    parent,
    new CylinderGeometry(radius, radius, len, 6),
    material,
    name,
    [(a[0] + b[0]) * 0.5, (a[1] + b[1]) * 0.5, (a[2] + b[2]) * 0.5],
  );
  mesh.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), dir.normalize());
}

/** Single teal biological curve/network for the external monitor. */
function addMonitorBioNetwork(parent: Group, mats: Mats, z: number) {
  const nodes: [number, number, number][] = [
    [-0.18, -0.02, z],
    [-0.06, 0.08, z],
    [0.04, -0.04, z],
    [0.14, 0.06, z],
    [0.0, 0.14, z],
    [-0.12, -0.12, z],
  ];
  nodes.forEach((p, i) => {
    addMesh(
      parent,
      new SphereGeometry(i === 1 || i === 4 ? 0.016 : 0.011, 6, 6),
      mats.accentCool,
      `bioNode${i}`,
      p,
    );
  });
  const edges: [number, number][] = [
    [0, 1],
    [1, 2],
    [2, 3],
    [1, 4],
    [2, 4],
    [0, 5],
    [2, 5],
  ];
  edges.forEach(([i, j], e) => {
    addLink(parent, mats.accentCool, `bioEdge${e}`, nodes[i], nodes[j], 0.0035);
  });
}

/** Minimal coral marks — secondary laptop display only. */
function addLaptopMarks(parent: Group, mats: Mats) {
  // Local space: screen lies in XZ, facing -Y (toward keyboard when open).
  const y = -0.004;
  addMesh(parent, new BoxGeometry(0.12, 0.005, 0.04), mats.accent, "markA", [
    -0.08,
    y,
    0.04,
  ]);
  addMesh(parent, new BoxGeometry(0.08, 0.005, 0.04), mats.accent, "markB", [
    0.06,
    y,
    0.02,
  ]);
  addMesh(parent, new BoxGeometry(0.05, 0.005, 0.05), mats.accent, "markC", [
    0.0,
    y,
    -0.06,
  ]);
  addMesh(parent, new SphereGeometry(0.012, 6, 6), mats.accent, "markDot", [
    0.1,
    y,
    -0.05,
  ]);
}

function createMonitor(mats: Mats) {
  const group = part("monitor");
  const deskY = 0.09;
  addMesh(
    group,
    extrudeY(roundedRect(0.28, 0.12, 0.03), 0.03, 0.004),
    mats.device,
    "standBase",
    [0.28, deskY, -0.12],
  );
  addMesh(group, new BoxGeometry(0.05, 0.18, 0.04), mats.device, "standNeck", [
    0.28,
    deskY + 0.12,
    -0.12,
  ]);
  const panel = part("monitorPanel");
  panel.position.set(0.28, deskY + 0.38, -0.14);
  panel.rotation.set(-0.06, 0, 0);
  addMesh(
    panel,
    extrudeY(roundedRect(0.7, 0.08, 0.045), 0.44, 0.012),
    mats.device,
    "bezel",
    [0, -0.22, 0],
  );
  addMesh(
    panel,
    new BoxGeometry(0.6, 0.36, 0.012),
    mats.screen,
    "display",
    [0, 0.0, 0.04],
  );
  group.add(panel);
  return group;
}

/**
 * Laptop as a separate station object.
 * Lid local (closed, rotation.x = 0): panel in XZ, extends +Z over the keyboard.
 * Open ~115°: rotation.x = -115° so screen faces the deck with a readable hinge.
 *
 * Hierarchy: laptopLid → bezel → screenContent
 */
function createLaptop(mats: Mats) {
  const group = part("laptop");
  const deskY = 0.09;
  const baseW = 0.48;
  const baseD = 0.32;
  const baseT = 0.028;
  const lidW = 0.48;
  const lidH = 0.3;
  const lidT = 0.02;

  const base = part("laptopBase");
  base.position.set(-0.28, deskY, 0.06);
  base.rotation.set(0, 0.35, 0);
  addMesh(
    base,
    extrudeY(roundedRect(baseW, baseD, 0.035), baseT, 0.006),
    mats.laptopShell,
    "baseShell",
  );
  // Key/trackpad centers sit clearly above the beveled base top to avoid z-fighting.
  // BoxGeometry is centered on Y, so bottom ≈ centerY - halfHeight.
  const keyboardSurfaceY = baseT + 0.008;
  const keyDeckH = 0.012;
  const trackpadH = 0.01;
  const keyLift = 0.016;
  addMesh(base, new BoxGeometry(0.36, keyDeckH, 0.18), mats.device, "keyDeck", [
    0,
    keyboardSurfaceY + keyLift + keyDeckH * 0.5,
    -0.02,
  ]);
  addMesh(
    base,
    new BoxGeometry(0.12, trackpadH, 0.08),
    mats.device,
    "trackpad",
    [0, keyboardSurfaceY + keyLift + trackpadH * 0.5, 0.08],
  );

  const hingeZ = -baseD * 0.5 + 0.012;
  addMesh(
    base,
    new CylinderGeometry(0.011, 0.011, lidW * 0.92, 10),
    mats.device,
    "hinge",
    [0, baseT * 0.55, hingeZ],
    [0, 0, Math.PI / 2],
  );

  const lid = part("laptopLid");
  lid.position.set(0, baseT * 0.55, hingeZ);
  lid.rotation.x = -((LAPTOP_OPEN_DEG * Math.PI) / 180);

  const bezel = part("bezel");
  addMesh(
    bezel,
    new BoxGeometry(lidW, lidT, lidH),
    mats.laptopShell,
    "bezelFrame",
    [0, 0, lidH * 0.5],
  );

  const screenContent = part("screenContent");
  // Centered inside bezel; sits on the underside (−Y) which faces the keyboard when open.
  screenContent.position.set(0, -lidT * 0.5 - 0.001, lidH * 0.5);
  addMesh(
    screenContent,
    new BoxGeometry(lidW * 0.86, 0.006, lidH * 0.82),
    mats.screen,
    "screenPlane",
  );
  addLaptopMarks(screenContent, mats);

  bezel.add(screenContent);
  lid.add(bezel);
  base.add(lid);
  group.add(base);
  return group;
}

/** Monitor-only glyphs (laptop marks live under lid → bezel → screenContent). */
function createDigitalElements(mats: Mats) {
  const group = part("digitalElements");
  const deskY = 0.09;
  const monitorUi = part("monitorUi");
  monitorUi.position.set(0.28, deskY + 0.38, -0.14);
  monitorUi.rotation.set(-0.06, 0, 0);
  addMonitorBioNetwork(monitorUi, mats, 0.052);
  group.add(monitorUi);
  return group;
}

function createHeadphones(mats: Mats) {
  const group = part("headphones");
  const deskY = 0.09;
  group.position.set(-0.15, deskY, 0.28);
  group.rotation.set(0, 0.4, 0);
  addMesh(
    group,
    new TorusGeometry(0.1, 0.018, 8, 16, Math.PI),
    mats.device,
    "headband",
    [0, 0.12, 0],
  );
  addMesh(
    group,
    new SphereGeometry(0.055, 10, 8),
    mats.device,
    "cupL",
    [-0.1, 0.05, 0],
  );
  addMesh(
    group,
    new SphereGeometry(0.055, 10, 8),
    mats.device,
    "cupR",
    [0.1, 0.05, 0],
  );
  addMesh(
    group,
    new CylinderGeometry(0.04, 0.04, 0.02, 10),
    mats.laptopShell,
    "padL",
    [-0.1, 0.05, 0.02],
    [Math.PI / 2, 0, 0],
  );
  addMesh(
    group,
    new CylinderGeometry(0.04, 0.04, 0.02, 10),
    mats.laptopShell,
    "padR",
    [0.1, 0.05, 0.02],
    [Math.PI / 2, 0, 0],
  );
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
export function createComputerModel(
  options?: ComputerModelOptions,
  includePlatform = true,
): ComputerBuild {
  const { style, includeHeadphones } = {
    ...DEFAULT_COMPUTER_OPTIONS,
    ...options,
  };
  void style;

  const materials = makeMaterials();
  const group = part("computer");
  if (includePlatform) group.add(createDeskPlatform(materials));
  group.add(createMonitor(materials));
  group.add(createLaptop(materials));
  group.add(createMouse(materials));
  if (includeHeadphones) group.add(createHeadphones(materials));
  group.add(createDigitalElements(materials));

  if (!includePlatform)
    group.children.forEach((child) => {
      child.position.y -= 0.09;
    });
  const stats = measureGroup(group);
  group.userData.stats = stats;
  group.userData.options = { style, includeHeadphones };
  return {
    group,
    stats,
    materials: Object.values(materials),
  };
}
