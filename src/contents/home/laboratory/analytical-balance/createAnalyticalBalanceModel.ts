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
export const ANALYTICAL_BALANCE_REVISION = 1;

export const ANALYTICAL_BALANCE_COLORS = {
  body: "#C4C9CE",
  bodyDark: "#A8ADB2",
  panel: "#9EB0BE",
  screen: "#1E2A38",
  screenGlow: "#5A8FA8",
  button: "#5C6369",
  metal: "#D4DCE2",
  glass: "#E8F4F8",
  accent: "#C0392B",
} as const;

export type AnalyticalBalanceStats = {
  triangles: number;
  meshes: number;
  materials: number;
  parts: string[];
};

export type AnalyticalBalanceBuild = {
  group: Group;
  stats: AnalyticalBalanceStats;
  materials: Material[];
};

type Mats = ReturnType<typeof makeMaterials>;

function part(name: string): Group {
  const group = new Group();
  group.name = name;
  return group;
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

function roundedRect(width: number, height: number, radius: number): Shape {
  const hw = width * 0.5;
  const hh = height * 0.5;
  const r = Math.min(radius, hw * 0.45, hh * 0.45);
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
    curveSegments: 6,
  });
  geo.rotateX(-Math.PI / 2);
  geo.computeVertexNormals();
  return geo;
}

function makeMaterials() {
  const body = new MeshToonMaterial({ color: ANALYTICAL_BALANCE_COLORS.body });
  const bodyDark = new MeshToonMaterial({ color: ANALYTICAL_BALANCE_COLORS.bodyDark });
  const panel = new MeshToonMaterial({ color: ANALYTICAL_BALANCE_COLORS.panel });
  const screen = new MeshStandardMaterial({
    color: ANALYTICAL_BALANCE_COLORS.screen,
    emissive: ANALYTICAL_BALANCE_COLORS.screenGlow,
    emissiveIntensity: 0.35,
    roughness: 0.25,
    metalness: 0.05,
  });
  const button = new MeshToonMaterial({ color: ANALYTICAL_BALANCE_COLORS.button });
  const metal = new MeshStandardMaterial({
    color: ANALYTICAL_BALANCE_COLORS.metal,
    roughness: 0.18,
    metalness: 0.72,
  });
  const glass = new MeshStandardMaterial({
    color: ANALYTICAL_BALANCE_COLORS.glass,
    roughness: 0.06,
    metalness: 0.04,
    transparent: true,
    opacity: 0.28,
  });
  const accent = new MeshToonMaterial({ color: ANALYTICAL_BALANCE_COLORS.accent });

  body.name = "body";
  bodyDark.name = "bodyDark";
  panel.name = "panel";
  screen.name = "screen";
  button.name = "button";
  metal.name = "metal";
  glass.name = "glass";
  accent.name = "accent";

  return { body, bodyDark, panel, screen, button, metal, glass, accent };
}

function buildBase(parent: Group, mats: Mats) {
  const w = 0.52;
  const d = 0.42;
  const h = 0.1;
  addMesh(parent, extrudeY(roundedRect(w, d, 0.02), h, 0.006), mats.body, "deck", [0, h * 0.5, 0]);

  const slope = part("slopePanel");
  addMesh(slope, new BoxGeometry(w * 0.98, 0.002, 0.16), mats.panel, "panelOverlay", [0, 0, 0.02]);
  addMesh(slope, new BoxGeometry(0.2, 0.002, 0.05), mats.screen, "display", [0.02, 0.002, 0.04]);
  addMesh(slope, new BoxGeometry(0.012, 0.004, 0.012), mats.accent, "brandMark", [-0.08, 0.004, 0.04]);
  const buttonXs = [-0.14, -0.1, -0.06, -0.02, 0.02, 0.06, 0.1];
  buttonXs.forEach((x, i) => {
    addMesh(slope, new CylinderGeometry(0.012, 0.012, 0.006, 10), mats.button, `btn-${i}`, [x, 0.004, -0.02]);
  });
  slope.position.set(0, h + 0.01, d * 0.34);
  slope.rotation.set(-0.52, 0, 0);
  parent.add(slope);

  const feet: Array<[number, number, number]> = [
    [-0.22, 0.012, 0.16],
    [0.22, 0.012, 0.16],
    [-0.22, 0.012, -0.16],
    [0.22, 0.012, -0.16],
  ];
  feet.forEach(([x, y, z], i) => {
    addMesh(parent, new CylinderGeometry(0.014, 0.016, 0.024, 10), mats.bodyDark, `foot-${i}`, [x, y, z]);
  });
}

function buildDraftShield(parent: Group, mats: Mats, baseY: number) {
  const w = 0.34;
  const d = 0.34;
  const h = 0.26;
  const frameT = 0.014;

  const frame = part("frame");
  const postPositions: Array<[number, number, number]> = [
    [-w * 0.46, h * 0.5, -d * 0.46],
    [w * 0.46, h * 0.5, -d * 0.46],
    [-w * 0.46, h * 0.5, d * 0.46],
    [w * 0.46, h * 0.5, d * 0.46],
  ];
  postPositions.forEach(([x, y, z], i) => {
    addMesh(frame, new BoxGeometry(frameT, h, frameT), mats.body, `post-${i}`, [x, y, z]);
  });
  [
    [0, h, 0, w, frameT, d],
    [0, 0, 0, w, frameT, d],
    [0, h * 0.5, -d * 0.46, w, h, frameT],
    [0, h * 0.5, d * 0.46, w, h, frameT],
  ].forEach(([x, y, z, gw, gh, gd], i) => {
    addMesh(frame, new BoxGeometry(gw, gh, gd), mats.body, `rail-${i}`, [x, y, z]);
  });
  parent.add(frame);

  const glass = part("glassPanels");
  addMesh(glass, new BoxGeometry(w * 0.88, h * 0.88, 0.004), mats.glass, "front", [0, h * 0.5, d * 0.46]);
  addMesh(glass, new BoxGeometry(w * 0.88, h * 0.88, 0.004), mats.glass, "back", [0, h * 0.5, -d * 0.46]);
  addMesh(glass, new BoxGeometry(0.004, h * 0.88, d * 0.88), mats.glass, "left", [-w * 0.46, h * 0.5, 0]);
  addMesh(glass, new BoxGeometry(0.004, h * 0.88, d * 0.88), mats.glass, "right", [w * 0.46, h * 0.5, 0]);
  addMesh(glass, new BoxGeometry(w * 0.9, 0.004, d * 0.9), mats.glass, "top", [0, h, 0]);
  addMesh(glass, new BoxGeometry(0.018, 0.05, 0.008), mats.body, "handleLeft", [-w * 0.46, h * 0.52, 0.04]);
  addMesh(glass, new BoxGeometry(0.018, 0.05, 0.008), mats.body, "handleRight", [w * 0.46, h * 0.52, -0.04]);
  addMesh(glass, new BoxGeometry(0.05, 0.008, 0.018), mats.body, "handleTop", [0.06, h - 0.004, d * 0.46]);
  parent.add(glass);

  const pan = part("weighingPan");
  addMesh(pan, new CylinderGeometry(0.055, 0.052, 0.012, 20), mats.metal, "pan", [0, 0.04, 0]);
  addMesh(pan, new CylinderGeometry(0.018, 0.02, 0.018, 12), mats.metal, "stem", [0, 0.02, 0]);
  pan.position.y = baseY + 0.02;
  parent.add(pan);
}

export function measureGroup(root: Group): AnalyticalBalanceStats {
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
    materialSet.add(obj.material as Material);
    const geo = obj.geometry;
    const index = geo.index;
    if (index) triangles += index.count / 3;
    else if (geo.attributes.position) triangles += geo.attributes.position.count / 3;
  });
  return { triangles: Math.round(triangles), meshes, materials: materialSet.size, parts };
}

export function createAnalyticalBalanceModel(): AnalyticalBalanceBuild {
  const group = new Group();
  group.name = "AnalyticalBalance";
  const mats = makeMaterials();
  const materials = Object.values(mats);
  const baseY = 0.1;

  const base = part("base");
  buildBase(base, mats);
  group.add(base);

  const shield = part("draftShield");
  shield.position.set(0, baseY, -0.02);
  buildDraftShield(shield, mats, baseY);
  group.add(shield);

  group.position.y = -0.05;
  const stats = measureGroup(group);
  return { group, stats, materials };
}
