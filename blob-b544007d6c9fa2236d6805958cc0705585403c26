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
export const COMPUTER_REVISION = 4;

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

/** Thin cylinder between two points (screen-space edges / DNA rungs). */
function addLink(
  parent: Group,
  mats: Mats,
  name: string,
  a: [number, number, number],
  b: [number, number, number],
  radius: number,
  cool: boolean,
) {
  const from = new Vector3(...a);
  const to = new Vector3(...b);
  const dir = new Vector3().subVectors(to, from);
  const len = dir.length() || 0.001;
  const mesh = addMesh(
    parent,
    new CylinderGeometry(radius, radius, len, 6),
    cool ? mats.accentCool : mats.accent,
    name,
    [(a[0] + b[0]) * 0.5, (a[1] + b[1]) * 0.5, (a[2] + b[2]) * 0.5],
  );
  mesh.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), dir.normalize());
}

function addDnaCurve(parent: Group, mats: Mats, z: number) {
  const turns = 5;
  const amp = 0.055;
  const x0 = -0.2;
  const x1 = 0.2;
  const yMid = 0.04;
  for (let i = 0; i < turns; i += 1) {
    const t0 = i / (turns - 1);
    const t1 = (i + 0.5) / (turns - 1);
    const xA = x0 + (x1 - x0) * t0;
    const xB = x0 + (x1 - x0) * Math.min(1, t1);
    const phase = t0 * Math.PI * 2.2;
    const yA = yMid + Math.sin(phase) * amp;
    const yB = yMid + Math.sin(phase + Math.PI) * amp;
    const yA2 = yMid + Math.sin(phase + 0.55) * amp;
    const yB2 = yMid + Math.sin(phase + Math.PI + 0.55) * amp;
    const pA: [number, number, number] = [xA, yA, z];
    const pB: [number, number, number] = [xA, yB, z];
    const pA2: [number, number, number] = [xB, yA2, z];
    const pB2: [number, number, number] = [xB, yB2, z];
    addMesh(parent, new SphereGeometry(0.012, 6, 6), mats.accent, `dnaA${i}`, pA);
    addMesh(parent, new SphereGeometry(0.012, 6, 6), mats.accentCool, `dnaB${i}`, pB);
    addLink(parent, mats, `dnaRung${i}`, pA, pB, 0.004, i % 2 === 0);
    if (i < turns - 1) {
      addLink(parent, mats, `dnaStrandA${i}`, pA, pA2, 0.005, false);
      addLink(parent, mats, `dnaStrandB${i}`, pB, pB2, 0.005, true);
    }
  }
}

function addWaveform(parent: Group, mats: Mats, z: number) {
  const samples = 10;
  const x0 = -0.22;
  const x1 = 0.22;
  const yBase = -0.1;
  let prev: [number, number, number] | null = null;
  for (let i = 0; i < samples; i += 1) {
    const t = i / (samples - 1);
    const x = x0 + (x1 - x0) * t;
    const y = yBase + Math.sin(t * Math.PI * 3.2) * 0.045 + Math.sin(t * Math.PI * 7) * 0.012;
    const p: [number, number, number] = [x, y, z];
    addMesh(parent, new SphereGeometry(0.007, 5, 5), mats.accentCool, `waveDot${i}`, p);
    if (prev) addLink(parent, mats, `waveSeg${i}`, prev, p, 0.0035, true);
    prev = p;
  }
}

function addConnectedNodes(parent: Group, mats: Mats, z: number) {
  const nodes: [number, number, number][] = [
    [-0.18, 0.12, z],
    [-0.05, 0.16, z],
    [0.08, 0.13, z],
    [0.18, 0.09, z],
  ];
  nodes.forEach((p, i) => {
    addMesh(
      parent,
      new SphereGeometry(i === 1 ? 0.018 : 0.014, 6, 6),
      i % 2 === 0 ? mats.accent : mats.accentCool,
      `node${i}`,
      p,
    );
  });
  addLink(parent, mats, "nodeEdge0", nodes[0], nodes[1], 0.0035, true);
  addLink(parent, mats, "nodeEdge1", nodes[1], nodes[2], 0.0035, false);
  addLink(parent, mats, "nodeEdge2", nodes[2], nodes[3], 0.0035, true);
  addLink(parent, mats, "nodeEdge3", nodes[1], nodes[3], 0.003, false);
}

function addMicrobiomeNetwork(parent: Group, mats: Mats, z: number) {
  const hubs: [number, number, number][] = [
    [0.0, 0.05, z],
    [-0.1, 0.0, z],
    [0.1, 0.02, z],
    [-0.06, 0.1, z],
    [0.08, 0.1, z],
    [-0.14, 0.06, z],
    [0.14, -0.02, z],
  ];
  hubs.forEach((p, i) => {
    addMesh(
      parent,
      new SphereGeometry(i === 0 ? 0.016 : 0.01, 6, 6),
      i === 0 ? mats.accent : mats.accentCool,
      `micro${i}`,
      p,
    );
  });
  const edges: [number, number][] = [
    [0, 1],
    [0, 2],
    [0, 3],
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 5],
    [4, 6],
  ];
  edges.forEach(([i, j], e) => {
    addLink(parent, mats, `microEdge${e}`, hubs[i], hubs[j], 0.0028, e % 2 === 0);
  });
}

function addDataLines(parent: Group, mats: Mats, z: number) {
  const lengths = [0.22, 0.16, 0.28, 0.12];
  lengths.forEach((w, i) => {
    addMesh(
      parent,
      new BoxGeometry(w, 0.006, 0.004),
      i % 2 === 0 ? mats.accentCool : mats.accent,
      `dataLine${i}`,
      [-0.14 + w * 0.15, -0.08 + i * 0.028, z],
    );
  });
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

/** Procedural biological computation glyphs — no PNG, text, logos, or UI panels. */
function createDigitalElements(mats: Mats) {
  const group = part("digitalElements");
  const deskY = 0.09;
  const screenZ = 0.052;

  const monitorUi = part("monitorUi");
  monitorUi.position.set(0.28, deskY + 0.38, -0.14);
  monitorUi.rotation.set(-0.06, 0, 0);
  addDnaCurve(monitorUi, mats, screenZ);
  addWaveform(monitorUi, mats, screenZ);
  addConnectedNodes(monitorUi, mats, screenZ);
  group.add(monitorUi);

  const laptopUi = part("laptopUi");
  laptopUi.position.set(-0.28, deskY, 0.06);
  laptopUi.rotation.set(0, 0.35, 0);
  const lidUi = part("lidUi");
  lidUi.position.set(0, 0.02, -0.15);
  lidUi.rotation.set((-70 * Math.PI) / 180, 0, 0);
  addMicrobiomeNetwork(lidUi, mats, 0.032);
  addDataLines(lidUi, mats, 0.032);
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
