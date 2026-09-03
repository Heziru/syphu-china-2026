import {
  BoxGeometry,
  BufferGeometry,
  CanvasTexture,
  CylinderGeometry,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  MeshToonMaterial,
  PlaneGeometry,
  SRGBColorSpace,
  TorusGeometry,
  type BufferGeometry as BufferGeometryType,
  type Material,
} from "three";

export const LAMINAR_HOOD_REVISION = 6;

export const LAMINAR_HOOD_COLORS = {
  shell: "#F2F4F6",
  blue: "#2F6FB8",
  steel: "#8E9DAA",
  worktop: "#6A737A",
  glass: "#C8DCE8",
  duct: "#9AA5AE",
  dark: "#2E3338",
  outlet: "#3E84C8",
  warning: "#F1C40F",
  wheel: "#2E2E2E",
  logo: "#1A6B8C",
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

const H = 0.88;
const WB = 0.44;
const DB = 0.36;
const DT = 0.2;
const FLOOR_Y = 0.14;
const GLASS_TOP = 0.5;
const CONTROL_BOTTOM = 0.5;
const CONTROL_TOP = 0.62;
const LOGO_TOP = H;
const FRAME = 0.016;
const FRAME_DEPTH = 0.013;

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function depthAt(y: number) {
  return lerp(DB, DT, y / H);
}

function glassOpening() {
  const openW = WB * 2 - FRAME * 4 - 0.032;
  const openH = GLASS_TOP - FLOOR_Y - FRAME * 2;
  const openY0 = FLOOR_Y + FRAME;
  const openY1 = GLASS_TOP - FRAME;
  const openMidY = (openY0 + openY1) * 0.5;
  const frameZ = depthAt(FLOOR_Y) + 0.005;
  return { openW, openH, openY0, openY1, openMidY, frameZ };
}

function part(name: string): Group {
  const g = new Group();
  g.name = name;
  return g;
}

function addMesh(
  parent: Group,
  geometry: BufferGeometryType,
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

function quad(
  a: [number, number, number],
  b: [number, number, number],
  c: [number, number, number],
  d: [number, number, number],
): BufferGeometry {
  const geo = new BufferGeometry();
  const verts = new Float32Array([...a, ...b, ...c, ...d]);
  geo.setAttribute("position", new Float32BufferAttribute(verts, 3));
  geo.setIndex([0, 1, 2, 0, 2, 3]);
  geo.computeVertexNormals();
  return geo;
}

function makeLogoPanelMaterial(): MeshStandardMaterial {
  if (typeof document === "undefined") {
    const m = new MeshStandardMaterial({ color: LAMINAR_HOOD_COLORS.shell });
    m.name = "logoPanel";
    return m;
  }
  const canvas = document.createElement("canvas");
  canvas.width = 480;
  canvas.height = 120;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = LAMINAR_HOOD_COLORS.shell;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = LAMINAR_HOOD_COLORS.logo;
    ctx.font = "700 34px Arial, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("LABTRON", 18, canvas.height * 0.5);
    ctx.beginPath();
    ctx.arc(190, canvas.height * 0.5, 10, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  const mat = new MeshStandardMaterial({ map: tex, roughness: 0.55, metalness: 0.02 });
  mat.name = "logoPanel";
  return mat;
}

function makeControlPanelMaterial(): MeshStandardMaterial {
  if (typeof document === "undefined") {
    const m = new MeshStandardMaterial({ color: LAMINAR_HOOD_COLORS.blue });
    m.name = "controlPanel";
    return m;
  }
  const canvas = document.createElement("canvas");
  canvas.width = 720;
  canvas.height = 140;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = LAMINAR_HOOD_COLORS.blue;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "rgba(0,0,0,0.18)";
    ctx.lineWidth = 3;
    ctx.strokeRect(3, 3, canvas.width - 6, canvas.height - 6);

    const lcdW = 168;
    const lcdH = 52;
    const lcdX = canvas.width * 0.5 - lcdW * 0.5;
    ctx.fillStyle = "#1A2838";
    ctx.fillRect(lcdX - 4, 18, lcdW + 8, lcdH + 8);
    ctx.fillStyle = "#9CB8CC";
    ctx.fillRect(lcdX, 22, lcdW, lcdH);
    ctx.fillStyle = "#0B1520";
    ctx.font = "700 28px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("ON", canvas.width * 0.5, 48);

    const btnXs = [0.18, 0.28, 0.38, 0.62, 0.72, 0.82];
    btnXs.forEach((t) => {
      const cx = canvas.width * t;
      ctx.beginPath();
      ctx.arc(cx, 102, 13, 0, Math.PI * 2);
      ctx.fillStyle = "#2A3038";
      ctx.fill();
      ctx.strokeStyle = "#E8ECF0";
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }
  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  const mat = new MeshStandardMaterial({
    map: tex,
    roughness: 0.42,
    metalness: 0.06,
  });
  mat.name = "controlPanel";
  return mat;
}

function makeMaterials() {
  const shell = new MeshToonMaterial({ color: LAMINAR_HOOD_COLORS.shell });
  const logoPanel = makeLogoPanelMaterial();
  const steel = new MeshStandardMaterial({
    color: LAMINAR_HOOD_COLORS.steel,
    roughness: 0.22,
    metalness: 0.78,
  });
  const worktop = new MeshStandardMaterial({
    color: LAMINAR_HOOD_COLORS.worktop,
    roughness: 0.38,
    metalness: 0.42,
  });
  const glass = new MeshPhysicalMaterial({
    color: LAMINAR_HOOD_COLORS.glass,
    transmission: 0.78,
    transparent: true,
    opacity: 0.88,
    roughness: 0.03,
    metalness: 0,
    thickness: 0.016,
    ior: 1.48,
    side: DoubleSide,
    depthWrite: false,
  });
  const duct = new MeshToonMaterial({ color: LAMINAR_HOOD_COLORS.duct });
  const dark = new MeshToonMaterial({ color: LAMINAR_HOOD_COLORS.dark });
  const outlet = new MeshToonMaterial({ color: LAMINAR_HOOD_COLORS.outlet });
  const warning = new MeshToonMaterial({ color: LAMINAR_HOOD_COLORS.warning });
  const wheel = new MeshToonMaterial({ color: LAMINAR_HOOD_COLORS.wheel });
  const controlPanel = makeControlPanelMaterial();

  shell.name = "shell";
  logoPanel.name = "logoPanel";
  steel.name = "steel";
  worktop.name = "worktop";
  glass.name = "glass";
  duct.name = "duct";
  dark.name = "dark";
  outlet.name = "outlet";
  warning.name = "warning";
  wheel.name = "wheel";
  controlPanel.name = "controlPanel";
  return { shell, logoPanel, steel, worktop, glass, duct, dark, outlet, warning, wheel, controlPanel };
}

function buildTrapezoidShell(parent: Group, mats: Mats) {
  const shell = part("cabinetShell");
  const zb = -DB;
  const zf0 = DB;

  addMesh(
    shell,
    quad([-WB, 0, zb], [-WB, 0, zf0], [-WB, H, depthAt(H)], [-WB, H, zb]),
    mats.shell,
    "leftWall",
  );
  addMesh(
    shell,
    quad([WB, 0, zf0], [WB, 0, zb], [WB, H, zb], [WB, H, depthAt(H)]),
    mats.shell,
    "rightWall",
  );
  addMesh(
    shell,
    quad([-WB, 0, zb], [WB, 0, zb], [WB, H, zb], [-WB, H, zb]),
    mats.shell,
    "backWall",
  );
  addMesh(
    shell,
    quad([-WB, H, zb], [WB, H, zb], [WB, H, depthAt(H)], [-WB, H, depthAt(H)]),
    mats.shell,
    "topCap",
  );
  addMesh(
    shell,
    quad([-WB, 0, zb], [WB, 0, zb], [WB, 0, zf0], [-WB, 0, zf0]),
    mats.shell,
    "bottomDeck",
  );

  const dTop = depthAt(CONTROL_TOP);
  addMesh(
    shell,
    quad([-WB, CONTROL_TOP, dTop], [WB, CONTROL_TOP, dTop], [WB, H, depthAt(H)], [-WB, H, depthAt(H)]),
    mats.shell,
    "frontTopFace",
  );

  const dGlass = depthAt(GLASS_TOP);
  addMesh(
    shell,
    quad([-WB, 0, zf0], [WB, 0, zf0], [WB, FLOOR_Y, dGlass], [-WB, FLOOR_Y, dGlass]),
    mats.shell,
    "frontSill",
  );

  parent.add(shell);
}

function buildBackPanel(parent: Group, mats: Mats) {
  const panel = part("backPanel");
  const inset = 0.028;
  addMesh(
    panel,
    new BoxGeometry(WB * 2 - inset * 2, H - 0.06, 0.012),
    mats.shell,
    "backPlate",
    [0, H * 0.5, -DB - 0.006],
  );
  addMesh(
    panel,
    new BoxGeometry(WB * 2 - inset * 2 - 0.04, H - 0.14, 0.006),
    mats.duct,
    "backRecess",
    [0, H * 0.48, -DB - 0.014],
  );
  parent.add(panel);
}

function buildLogoBand(parent: Group, mats: Mats) {
  const midY = (CONTROL_TOP + LOGO_TOP) * 0.5;
  const bandH = LOGO_TOP - CONTROL_TOP - 0.02;
  const bandW = WB * 1.88;
  const bandZ = depthAt(midY) + 0.006;
  addMesh(
    parent,
    new PlaneGeometry(bandW, bandH),
    mats.logoPanel,
    "logoPanel",
    [0, midY, bandZ],
    undefined,
    5,
  );
}

function buildControlBand(parent: Group, mats: Mats) {
  const midY = (CONTROL_BOTTOM + CONTROL_TOP) * 0.5;
  const bandH = CONTROL_TOP - CONTROL_BOTTOM;
  const bandW = WB * 1.92;
  const bandZ = depthAt(midY) + 0.028;
  addMesh(
    parent,
    new PlaneGeometry(bandW, bandH),
    mats.controlPanel,
    "controlPanel",
    [0, midY, bandZ],
    undefined,
    6,
  );
}

function buildFrontFrame(parent: Group, mats: Mats) {
  const frame = part("frontFrame");
  const { openW, openH, openY0, openY1, openMidY, frameZ } = glassOpening();
  const outerW = openW + FRAME * 2;

  addMesh(
    frame,
    new BoxGeometry(FRAME, openH, FRAME_DEPTH),
    mats.shell,
    "frameLeft",
    [-outerW * 0.5 + FRAME * 0.5, openMidY, frameZ],
    undefined,
    7,
  );
  addMesh(
    frame,
    new BoxGeometry(FRAME, openH, FRAME_DEPTH),
    mats.shell,
    "frameRight",
    [outerW * 0.5 - FRAME * 0.5, openMidY, frameZ],
    undefined,
    7,
  );
  addMesh(
    frame,
    new BoxGeometry(outerW, FRAME, FRAME_DEPTH),
    mats.shell,
    "frameBottom",
    [0, openY0 - FRAME * 0.5, frameZ],
    undefined,
    7,
  );
  addMesh(
    frame,
    new BoxGeometry(outerW, FRAME, FRAME_DEPTH),
    mats.shell,
    "frameTop",
    [0, openY1 + FRAME * 0.5, frameZ],
    undefined,
    7,
  );

  const sideFrameZ = -DB * 0.08;
  addMesh(
    frame,
    new BoxGeometry(FRAME, openH, FRAME_DEPTH),
    mats.shell,
    "sideFrameLeft",
    [-WB + FRAME * 0.5, openMidY, sideFrameZ],
    undefined,
    7,
  );
  addMesh(
    frame,
    new BoxGeometry(FRAME, openH, FRAME_DEPTH),
    mats.shell,
    "sideFrameRight",
    [WB - FRAME * 0.5, openMidY, sideFrameZ],
    undefined,
    7,
  );

  parent.add(frame);
}

function buildDuct(parent: Group, mats: Mats) {
  const duct = part("exhaustDuct");
  addMesh(duct, new CylinderGeometry(0.048, 0.052, 0.15, 12, 3, true), mats.duct, "hose", [
    -0.22,
    H + 0.075,
    -0.06,
  ]);
  addMesh(
    duct,
    new TorusGeometry(0.054, 0.013, 8, 16, Math.PI * 0.55),
    mats.duct,
    "bend",
    [-0.19,
    H + 0.15,
    -0.03],
    [0, 0, -0.42],
  );
  parent.add(duct);
}

function buildWorkChamber(parent: Group, mats: Mats) {
  const chamber = part("workChamber");
  const chamberH = GLASS_TOP - FLOOR_Y - 0.04;
  const midY = FLOOR_Y + chamberH * 0.5 + 0.02;
  const backZ = -DB + 0.05;
  const innerW = WB * 1.68;
  const innerD = DB * 1.48;

  addMesh(
    chamber,
    new PlaneGeometry(innerW, chamberH),
    mats.steel,
    "backWall",
    [0, midY, backZ],
    undefined,
    1,
  );
  addMesh(
    chamber,
    new PlaneGeometry(innerD, chamberH),
    mats.steel,
    "leftWall",
    [-WB + 0.038, midY, -0.02],
    [0, Math.PI / 2, 0],
    1,
  );
  addMesh(
    chamber,
    new PlaneGeometry(innerD, chamberH),
    mats.steel,
    "rightWall",
    [WB - 0.038, midY, -0.02],
    [0, Math.PI / 2, 0],
    1,
  );
  addMesh(
    chamber,
    new PlaneGeometry(innerW * 0.94, innerD * 0.9),
    mats.worktop,
    "workSurface",
    [0, FLOOR_Y + 0.012, -0.02],
    [-Math.PI / 2, 0, 0],
    1,
  );

  const ventY = FLOOR_Y + 0.028;
  const ventZ = backZ + 0.006;
  for (let i = 0; i < 14; i += 1) {
    const t = i / 13;
    const x = lerp(-innerW * 0.42, innerW * 0.42, t);
    addMesh(
      chamber,
      new BoxGeometry(0.022, 0.004, 0.008),
      mats.dark,
      `vent-${i}`,
      [x, ventY, ventZ],
      undefined,
      2,
    );
  }

  addMesh(
    chamber,
    new PlaneGeometry(0.032, 0.05),
    mats.outlet,
    "outletA",
    [WB - 0.075, FLOOR_Y + 0.26, backZ + 0.004],
    undefined,
    2,
  );
  addMesh(
    chamber,
    new PlaneGeometry(0.032, 0.05),
    mats.outlet,
    "outletB",
    [WB - 0.075, FLOOR_Y + 0.18, backZ + 0.004],
    undefined,
    2,
  );
  addMesh(
    chamber,
    new PlaneGeometry(0.038, 0.038),
    mats.warning,
    "sticker",
    [WB - 0.085, FLOOR_Y + 0.36, backZ + 0.004],
    undefined,
    2,
  );

  parent.add(chamber);
}

function buildGlassSash(parent: Group, mats: Mats) {
  const sash = part("sash");
  const { openW, openH, openMidY, frameZ } = glassOpening();
  const tilt = -0.3;
  const glassW = openW - 0.012;
  const glassH = (openH - 0.012) * Math.cos(Math.abs(tilt));
  const glassY = openMidY - openH * Math.sin(Math.abs(tilt)) * 0.1;
  const glassZ = frameZ + FRAME_DEPTH * 0.5 + 0.001;

  addMesh(
    sash,
    new PlaneGeometry(glassW, glassH),
    mats.glass,
    "frontGlass",
    [0, glassY, glassZ],
    [tilt, 0, 0],
    10,
  );

  const sideGlassX = WB - FRAME - 0.004;
  const sideGlassD = DB * 2 - 0.12;
  const sideGlassZ = -DB + sideGlassD * 0.5 + 0.03;
  addMesh(
    sash,
    new PlaneGeometry(sideGlassD, glassH),
    mats.glass,
    "leftGlass",
    [-sideGlassX, openMidY, sideGlassZ],
    [0, Math.PI / 2, 0],
    10,
  );
  addMesh(
    sash,
    new PlaneGeometry(sideGlassD, glassH),
    mats.glass,
    "rightGlass",
    [sideGlassX, openMidY, sideGlassZ],
    [0, Math.PI / 2, 0],
    10,
  );

  parent.add(sash);
}

function buildStand(parent: Group, mats: Mats, cabinetBottom: number) {
  const legH = 0.52;
  const spreadX = 0.32;
  const spreadZ = 0.24;
  const legPositions: Array<[number, number, number]> = [
    [-spreadX, cabinetBottom - legH * 0.5, spreadZ],
    [spreadX, cabinetBottom - legH * 0.5, spreadZ],
    [-spreadX, cabinetBottom - legH * 0.5, -spreadZ],
    [spreadX, cabinetBottom - legH * 0.5, -spreadZ],
  ];
  legPositions.forEach(([x, y, z], i) => {
    addMesh(parent, new CylinderGeometry(0.024, 0.026, legH, 8), mats.shell, `leg-${i}`, [x, y, z]);
    addMesh(parent, new CylinderGeometry(0.028, 0.028, 0.018, 10), mats.wheel, `caster-${i}`, [
      x,
      cabinetBottom - legH - 0.008,
      z,
    ]);
  });
  const braceY = cabinetBottom - legH + 0.12;
  addMesh(parent, new BoxGeometry(spreadX * 2 + 0.04, 0.032, 0.032), mats.shell, "braceFront", [
    0,
    braceY,
    spreadZ,
  ]);
  addMesh(parent, new BoxGeometry(spreadX * 2 + 0.04, 0.032, 0.032), mats.shell, "braceBack", [
    0,
    braceY,
    -spreadZ,
  ]);
}

function buildCabinet(parent: Group, mats: Mats) {
  buildWorkChamber(parent, mats);
  buildTrapezoidShell(parent, mats);
  buildBackPanel(parent, mats);
  buildLogoBand(parent, mats);
  buildControlBand(parent, mats);
  buildFrontFrame(parent, mats);
  buildGlassSash(parent, mats);
  buildDuct(parent, mats);

  const portY = H * 0.36;
  [-0.15, 0.15].forEach((x, i) => {
    addMesh(
      parent,
      new CylinderGeometry(0.009, 0.009, 0.007, 8),
      mats.dark,
      `sidePort-${i}`,
      [x, portY, depthAt(portY) + 0.004],
      [Math.PI / 2, 0, 0],
    );
  });
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

  group.position.y = -0.02;
  return { group, stats: measureGroup(group), materials };
}
