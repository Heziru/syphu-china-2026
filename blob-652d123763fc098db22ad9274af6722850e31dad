import {
  BoxGeometry,
  CanvasTexture,
  CylinderGeometry,
  DoubleSide,
  Group,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  MeshToonMaterial,
  PlaneGeometry,
  SRGBColorSpace,
  TorusGeometry,
  type BufferGeometry,
  type Material,
} from "three";

export const LAMINAR_HOOD_REVISION = 1;

export const LAMINAR_HOOD_COLORS = {
  shell: "#F0F2F4",
  blue: "#2F6FB8",
  steel: "#B4BCC4",
  worktop: "#6E757D",
  glass: "#E8F2F8",
  duct: "#9AA5AE",
  dark: "#3C4248",
  outlet: "#3E84C8",
  warning: "#F1C40F",
  wheel: "#2E2E2E",
  pedal: "#C0392B",
} as const;

export type LaminarHoodStats = {
  triangles: number;
  meshes: number;
  materials: number;
  parts: string[];
};

export type LaminarHoodBuild = {
  group: Group;
  stats: LaminarHoodStats;
  materials: Material[];
};

type Mats = ReturnType<typeof makeMaterials>;

function part(name: string): Group {
  const g = new Group();
  g.name = name;
  return g;
}

function addMesh(
  parent: Group,
  geometry: BufferGeometry,
  material: Material,
  name: string,
  position?: [number, number, number],
  rotation?: [number, number, number],
  renderOrder?: number,
) {
  const mesh = new Mesh(geometry, material);
  mesh.name = name;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  if (position) mesh.position.set(...position);
  if (rotation) mesh.rotation.set(...rotation);
  if (renderOrder !== undefined) mesh.renderOrder = renderOrder;
  parent.add(mesh);
  return mesh;
}

function makeDisplayMaterial(): MeshStandardMaterial {
  if (typeof document === "undefined") {
    const m = new MeshStandardMaterial({ color: "#8AAFC8", emissive: "#4A7898", emissiveIntensity: 0.3 });
    m.name = "screen";
    return m;
  }
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 96;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#8CB4CC";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#102030";
    ctx.font = "600 22px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("ON", canvas.width * 0.5, canvas.height * 0.45);
  }
  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  const screen = new MeshStandardMaterial({
    map: tex,
    emissiveMap: tex,
    emissive: "#5088A8",
    emissiveIntensity: 0.35,
    roughness: 0.3,
  });
  screen.name = "screen";
  return screen;
}

function makeMaterials() {
  const shell = new MeshToonMaterial({ color: LAMINAR_HOOD_COLORS.shell });
  const blue = new MeshToonMaterial({ color: LAMINAR_HOOD_COLORS.blue });
  const steel = new MeshStandardMaterial({
    color: LAMINAR_HOOD_COLORS.steel,
    roughness: 0.38,
    metalness: 0.62,
  });
  const worktop = new MeshStandardMaterial({
    color: LAMINAR_HOOD_COLORS.worktop,
    roughness: 0.55,
    metalness: 0.25,
  });
  const glass = new MeshPhysicalMaterial({
    color: LAMINAR_HOOD_COLORS.glass,
    transmission: 0.78,
    transparent: true,
    opacity: 0.88,
    roughness: 0.06,
    thickness: 0.01,
    side: DoubleSide,
    depthWrite: true,
  });
  const duct = new MeshToonMaterial({ color: LAMINAR_HOOD_COLORS.duct });
  const dark = new MeshToonMaterial({ color: LAMINAR_HOOD_COLORS.dark });
  const outlet = new MeshToonMaterial({ color: LAMINAR_HOOD_COLORS.outlet });
  const warning = new MeshToonMaterial({ color: LAMINAR_HOOD_COLORS.warning });
  const wheel = new MeshToonMaterial({ color: LAMINAR_HOOD_COLORS.wheel });
  const pedal = new MeshToonMaterial({ color: LAMINAR_HOOD_COLORS.pedal });
  const screen = makeDisplayMaterial();

  shell.name = "shell";
  blue.name = "blue";
  steel.name = "steel";
  worktop.name = "worktop";
  glass.name = "glass";
  duct.name = "duct";
  dark.name = "dark";
  outlet.name = "outlet";
  warning.name = "warning";
  wheel.name = "wheel";
  pedal.name = "pedal";
  return { shell, blue, steel, worktop, glass, duct, dark, outlet, warning, wheel, pedal, screen };
}

function buildStand(parent: Group, mats: Mats, cabinetBottom: number) {
  const legH = 0.52;
  const spreadX = 0.3;
  const spreadZ = 0.22;
  const legPositions: Array<[number, number, number]> = [
    [-spreadX, cabinetBottom - legH * 0.5, spreadZ],
    [spreadX, cabinetBottom - legH * 0.5, spreadZ],
    [-spreadX, cabinetBottom - legH * 0.5, -spreadZ],
    [spreadX, cabinetBottom - legH * 0.5, -spreadZ],
  ];
  legPositions.forEach(([x, y, z], i) => {
    addMesh(parent, new BoxGeometry(0.04, legH, 0.04), mats.shell, `leg-${i}`, [x, y, z]);
    addMesh(parent, new CylinderGeometry(0.028, 0.028, 0.018, 10), mats.wheel, `caster-${i}`, [
      x,
      cabinetBottom - legH - 0.008,
      z,
    ]);
  });

  const braceY = cabinetBottom - legH + 0.12;
  addMesh(parent, new BoxGeometry(spreadX * 2 + 0.04, 0.03, 0.03), mats.shell, "braceFront", [
    0,
    braceY,
    spreadZ,
  ]);
  addMesh(parent, new BoxGeometry(spreadX * 2 + 0.04, 0.03, 0.03), mats.shell, "braceBack", [
    0,
    braceY,
    -spreadZ,
  ]);
  addMesh(parent, new BoxGeometry(0.03, 0.03, spreadZ * 2), mats.shell, "braceLeft", [-spreadX, braceY, 0]);
  addMesh(parent, new BoxGeometry(0.03, 0.03, spreadZ * 2), mats.shell, "braceRight", [spreadX, braceY, 0]);
}

function buildDuct(parent: Group, mats: Mats, topY: number) {
  const duct = part("exhaustDuct");
  addMesh(duct, new CylinderGeometry(0.045, 0.048, 0.14, 12, 3, true), mats.duct, "hose", [
    -0.2,
    topY + 0.07,
    -0.08,
  ]);
  addMesh(duct, new TorusGeometry(0.05, 0.012, 8, 16, Math.PI * 0.55), mats.duct, "bend", [
    -0.17,
    topY + 0.14,
    -0.05,
  ], [0, 0, -0.4]);
  parent.add(duct);
}

function buildCabinet(parent: Group, mats: Mats) {
  const w = 0.68;
  const d = 0.56;
  const h = 0.82;
  const halfW = w * 0.5;
  const halfD = d * 0.5;

  const shell = part("cabinetShell");
  addMesh(shell, new BoxGeometry(w, h, d), mats.shell, "body", [0, h * 0.5, 0]);
  addMesh(shell, new BoxGeometry(w * 0.98, 0.025, d * 0.98), mats.shell, "topCap", [0, h - 0.012, 0]);
  parent.add(shell);

  buildDuct(parent, mats, h);

  const front = part("frontPanel");
  addMesh(front, new BoxGeometry(0.16, 0.028, 0.008), mats.dark, "logoBar", [-0.2, h * 0.88, halfD + 0.002]);
  addMesh(front, new BoxGeometry(w * 0.96, 0.11, 0.012), mats.blue, "controlBand", [0, h * 0.62, halfD + 0.004]);
  addMesh(front, new PlaneGeometry(0.09, 0.07), mats.screen, "lcd", [0.02, h * 0.62, halfD + 0.012]);
  [-0.12, -0.06, 0.06, 0.12].forEach((x, i) => {
    addMesh(front, new CylinderGeometry(0.008, 0.008, 0.006, 8), mats.dark, `ctrl-${i}`, [
      x,
      h * 0.58,
      halfD + 0.011,
    ], [Math.PI / 2, 0, 0]);
  });
  parent.add(front);

  const chamber = part("workChamber");
  const chamberH = 0.38;
  const chamberD = 0.42;
  const floorY = 0.14;
  const backZ = -halfD + 0.08;

  addMesh(chamber, new BoxGeometry(w * 0.86, chamberH, 0.012), mats.steel, "backWall", [
    0,
    floorY + chamberH * 0.5,
    backZ,
  ]);
  addMesh(chamber, new BoxGeometry(0.012, chamberH, chamberD), mats.steel, "leftWall", [
    -halfW + 0.07,
    floorY + chamberH * 0.5,
    -0.02,
  ]);
  addMesh(chamber, new BoxGeometry(0.012, chamberH, chamberD * 0.92), mats.steel, "rightWall", [
    halfW - 0.07,
    floorY + chamberH * 0.5,
    -0.02,
  ]);
  addMesh(chamber, new BoxGeometry(w * 0.84, 0.018, chamberD * 0.9), mats.worktop, "workSurface", [
    0,
    floorY + 0.008,
    -0.02,
  ]);

  for (let i = -8; i <= 8; i += 1) {
    addMesh(chamber, new BoxGeometry(0.004, 0.04, 0.008), mats.dark, `vent-${i}`, [
      i * 0.018,
      floorY + 0.04,
      backZ + 0.008,
    ]);
  }

  addMesh(chamber, new BoxGeometry(0.028, 0.04, 0.012), mats.outlet, "outletA", [
    halfW - 0.09,
    floorY + 0.22,
    -0.01,
  ]);
  addMesh(chamber, new BoxGeometry(0.028, 0.04, 0.012), mats.outlet, "outletB", [
    halfW - 0.09,
    floorY + 0.14,
    -0.01,
  ]);
  addMesh(chamber, new BoxGeometry(0.035, 0.035, 0.004), mats.warning, "sticker", [
    halfW - 0.1,
    floorY + 0.3,
    -0.005,
  ]);

  const sash = part("sash");
  const sashH = 0.34;
  addMesh(
    sash,
    new BoxGeometry(w * 0.84, sashH, 0.006),
    mats.glass,
    "frontGlass",
    [0, floorY + chamberH * 0.52, halfD - 0.06],
    [-0.22, 0, 0],
    4,
  );
  addMesh(
    sash,
    new BoxGeometry(0.006, sashH * 0.92, chamberD * 0.75),
    mats.glass,
    "sideGlass",
    [-halfW + 0.065, floorY + chamberH * 0.5, 0.04],
    undefined,
    4,
  );
  chamber.add(sash);
  parent.add(chamber);

  [-0.14, 0.14].forEach((x, i) => {
    addMesh(parent, new CylinderGeometry(0.008, 0.008, 0.006, 8), mats.dark, `sidePort-${i}`, [
      x,
      h * 0.35,
      halfD + 0.002,
    ]);
  });
}

function buildFootPedal(parent: Group, mats: Mats) {
  const pedal = part("footPedal");
  addMesh(pedal, new BoxGeometry(0.12, 0.025, 0.18), mats.dark, "base", [0.22, 0.012, 0.28]);
  addMesh(pedal, new BoxGeometry(0.1, 0.018, 0.14), mats.pedal, "pad", [0.22, 0.028, 0.28]);
  addMesh(pedal, new CylinderGeometry(0.003, 0.003, 0.35, 6), mats.dark, "wire", [0.12, 0.2, 0.15], [
    0.5,
    0,
    0.3,
  ]);
  parent.add(pedal);
}

export function measureGroup(root: Group): LaminarHoodStats {
  let triangles = 0;
  let meshes = 0;
  const materialSet = new Set<Material>();
  const parts: string[] = [];
  root.traverse((obj) => {
    if (obj instanceof Group && obj !== root && obj.children.length > 0 && obj.name) parts.push(obj.name);
    if (!(obj instanceof Mesh)) return;
    meshes += 1;
    materialSet.add(obj.material as Material);
    const geo = obj.geometry;
    const index = geo.index;
    if (index) triangles += index.count / 3;
    else if (geo.attributes.position) triangles += geo.attributes.position.count / 3;
  });
  return { triangles: Math.round(triangles), meshes, materials: materialSet.size, parts };
}

export function createLaminarHoodModel(): LaminarHoodBuild {
  const group = new Group();
  group.name = "LaminarHood";
  const mats = makeMaterials();
  const materials = Object.values(mats);
  const cabinetBottom = 0.58;

  const stand = part("stand");
  buildStand(stand, mats, cabinetBottom);
  group.add(stand);

  const cabinet = part("cabinet");
  cabinet.position.y = cabinetBottom;
  buildCabinet(cabinet, mats);
  group.add(cabinet);

  buildFootPedal(group, mats);

  group.position.y = -0.02;
  return { group, stats: measureGroup(group), materials };
}
