import {
  BoxGeometry,
  CylinderGeometry,
  DoubleSide,
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  MeshToonMaterial,
  Shape,
  type BufferGeometry,
  type Material,
} from "three";

/** Bump when factory geometry changes so the R3F wrapper remounts. */
export const ANALYTICAL_BALANCE_REVISION = 4;

export const ANALYTICAL_BALANCE_COLORS = {
  body: "#C4C9CE",
  bodyDark: "#A8ADB2",
  panel: "#9EB0BE",
  screen: "#1E2A38",
  screenGlow: "#5A8FA8",
  button: "#5C6369",
  buttonFace: "#E8ECF0",
  metal: "#E2EAF0",
  platform: "#B0B8C0",
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
    emissiveIntensity: 0.45,
    roughness: 0.22,
    metalness: 0.05,
  });
  const button = new MeshToonMaterial({ color: ANALYTICAL_BALANCE_COLORS.button });
  const buttonFace = new MeshToonMaterial({ color: ANALYTICAL_BALANCE_COLORS.buttonFace });
  const metal = new MeshStandardMaterial({
    color: ANALYTICAL_BALANCE_COLORS.metal,
    roughness: 0.12,
    metalness: 0.88,
    emissive: "#A8B4BE",
    emissiveIntensity: 0.08,
  });
  const platform = new MeshStandardMaterial({
    color: ANALYTICAL_BALANCE_COLORS.platform,
    roughness: 0.35,
    metalness: 0.55,
  });
  const glass = new MeshPhysicalMaterial({
    color: ANALYTICAL_BALANCE_COLORS.glass,
    roughness: 0.04,
    metalness: 0,
    transmission: 0.82,
    transparent: true,
    opacity: 0.92,
    thickness: 0.012,
    ior: 1.45,
    side: DoubleSide,
    depthWrite: true,
  });
  const accent = new MeshToonMaterial({
    color: ANALYTICAL_BALANCE_COLORS.accent,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });

  body.name = "body";
  bodyDark.name = "bodyDark";
  panel.name = "panel";
  screen.name = "screen";
  button.name = "button";
  buttonFace.name = "buttonFace";
  metal.name = "metal";
  platform.name = "platform";
  glass.name = "glass";
  accent.name = "accent";

  return { body, bodyDark, panel, screen, button, buttonFace, metal, platform, glass, accent };
}

function buildSlopePanel(parent: Group, mats: Mats, deckTop: number, depth: number) {
  const slope = part("slopePanel");
  const tilt = 0.58;

  addMesh(slope, new BoxGeometry(0.5, 0.07, 0.17), mats.body, "slopeBlock", [0, 0.035, 0]);
  slope.position.set(0, deckTop, depth * 0.31);
  slope.rotation.set(-tilt, 0, 0);
  parent.add(slope);

  const face = part("panelFace");
  const faceZ = 0.038;
  addMesh(face, new BoxGeometry(0.44, 0.13, 0.012), mats.panel, "panelPlate", [0, 0.02, faceZ]);
  addMesh(face, new BoxGeometry(0.19, 0.075, 0.006), mats.screen, "display", [0.04, 0.045, faceZ + 0.012]);
  addMesh(face, new BoxGeometry(0.034, 0.026, 0.004), mats.accent, "brandMark", [-0.13, 0.06, faceZ + 0.022]);
  addMesh(face, new BoxGeometry(0.07, 0.022, 0.003), mats.bodyDark, "brandBar", [-0.075, 0.065, faceZ + 0.013]);
  addMesh(face, new BoxGeometry(0.045, 0.018, 0.003), mats.bodyDark, "modelTag", [-0.16, 0.04, faceZ + 0.013]);

  const buttonXs = [-0.17, -0.12, -0.07, -0.02, 0.03, 0.08, 0.13];
  buttonXs.forEach((x, i) => {
    addMesh(face, new CylinderGeometry(0.014, 0.014, 0.012, 12), mats.button, `btn-${i}`, [x, -0.02, faceZ + 0.01], [
      Math.PI / 2,
      0,
      0,
    ]);
    addMesh(face, new CylinderGeometry(0.009, 0.009, 0.003, 10), mats.buttonFace, `btn-cap-${i}`, [
      x,
      -0.014,
      faceZ + 0.016,
    ]);
  });

  face.position.set(0, deckTop + 0.04, depth * 0.31 + 0.04);
  face.rotation.set(-tilt, 0, 0);
  parent.add(face);
}

function buildBase(parent: Group, mats: Mats) {
  const w = 0.52;
  const d = 0.42;
  const h = 0.09;
  const deckTop = h;

  addMesh(parent, extrudeY(roundedRect(w, d, 0.02), h, 0.006), mats.body, "deck", [0, h * 0.5, 0]);
  buildSlopePanel(parent, mats, deckTop, d);

  const feet: Array<[number, number, number]> = [
    [-0.22, 0.012, 0.16],
    [0.22, 0.012, 0.16],
    [-0.22, 0.012, -0.16],
    [0.22, 0.012, -0.16],
  ];
  feet.forEach(([x, y, z], i) => {
    addMesh(parent, new CylinderGeometry(0.014, 0.016, 0.024, 10), mats.bodyDark, `foot-${i}`, [x, y, z]);
  });

  return deckTop;
}

/** Open corner-post frame; glass sits in each bay without solid side walls. */
function buildDraftShield(parent: Group, mats: Mats) {
  const w = 0.34;
  const d = 0.34;
  const h = 0.55;
  const frameT = 0.012;
  const glassT = 0.008;
  const halfW = w * 0.5;
  const halfD = d * 0.5;
  const openingW = w - frameT * 2;
  const openingD = d - frameT * 2;
  const openingH = h - frameT * 2;
  const glassY = frameT + openingH * 0.5;

  const frame = part("frame");
  const corners: Array<[number, number, number]> = [
    [-halfW + frameT * 0.5, h * 0.5, -halfD + frameT * 0.5],
    [halfW - frameT * 0.5, h * 0.5, -halfD + frameT * 0.5],
    [-halfW + frameT * 0.5, h * 0.5, halfD - frameT * 0.5],
    [halfW - frameT * 0.5, h * 0.5, halfD - frameT * 0.5],
  ];
  corners.forEach(([x, y, z], i) => {
    addMesh(frame, new BoxGeometry(frameT, h, frameT), mats.body, `post-${i}`, [x, y, z]);
  });

  const edgeY = (y: number) => y;
  [
    [0, edgeY(frameT * 0.5), halfD - frameT * 0.5, openingW, frameT, frameT],
    [0, edgeY(frameT * 0.5), -halfD + frameT * 0.5, openingW, frameT, frameT],
    [-halfW + frameT * 0.5, edgeY(frameT * 0.5), 0, frameT, frameT, openingD],
    [halfW - frameT * 0.5, edgeY(frameT * 0.5), 0, frameT, frameT, openingD],
    [0, edgeY(h - frameT * 0.5), halfD - frameT * 0.5, openingW, frameT, frameT],
    [0, edgeY(h - frameT * 0.5), -halfD + frameT * 0.5, openingW, frameT, frameT],
    [-halfW + frameT * 0.5, edgeY(h - frameT * 0.5), 0, frameT, frameT, openingD],
    [halfW - frameT * 0.5, edgeY(h - frameT * 0.5), 0, frameT, frameT, openingD],
  ].forEach(([x, y, z, gw, gh, gd], i) => {
    addMesh(frame, new BoxGeometry(gw, gh, gd), mats.body, `edge-${i}`, [x, y, z]);
  });

  [0.42, 0.58].forEach((t, i) => {
    const y = frameT + openingH * t;
    addMesh(frame, new BoxGeometry(openingW, frameT * 0.6, frameT * 0.6), mats.bodyDark, `trackFront-${i}`, [
      0,
      y,
      halfD - frameT * 0.5,
    ]);
    addMesh(frame, new BoxGeometry(frameT * 0.6, frameT * 0.6, openingD), mats.bodyDark, `trackLeft-${i}`, [
      -halfW + frameT * 0.5,
      y,
      0,
    ]);
    addMesh(frame, new BoxGeometry(frameT * 0.6, frameT * 0.6, openingD), mats.bodyDark, `trackRight-${i}`, [
      halfW - frameT * 0.5,
      y,
      0,
    ]);
  });

  parent.add(frame);

  const glass = part("glassPanels");
  const glassOffset = frameT * 0.5 + glassT * 0.5;

  addMesh(
    glass,
    new BoxGeometry(openingW, openingH, glassT),
    mats.glass,
    "front",
    [0, glassY, halfD - glassOffset],
    undefined,
    3,
  );
  addMesh(
    glass,
    new BoxGeometry(openingW, openingH, glassT),
    mats.glass,
    "back",
    [0, glassY, -halfD + glassOffset],
    undefined,
    3,
  );
  addMesh(
    glass,
    new BoxGeometry(glassT, openingH, openingD),
    mats.glass,
    "left",
    [-halfW + glassOffset, glassY, 0],
    undefined,
    3,
  );
  addMesh(
    glass,
    new BoxGeometry(glassT, openingH, openingD),
    mats.glass,
    "right",
    [halfW - glassOffset, glassY, 0],
    undefined,
    3,
  );
  addMesh(
    glass,
    new BoxGeometry(openingW, glassT, openingD),
    mats.glass,
    "top",
    [0, h - glassOffset, 0],
    undefined,
    3,
  );

  addMesh(glass, new BoxGeometry(0.018, 0.055, 0.008), mats.body, "handleLeft", [
    -halfW + frameT,
    h * 0.52,
    0.04,
  ]);
  addMesh(glass, new BoxGeometry(0.018, 0.055, 0.008), mats.body, "handleRight", [
    halfW - frameT,
    h * 0.52,
    -0.04,
  ]);
  addMesh(glass, new BoxGeometry(0.055, 0.008, 0.018), mats.body, "handleTop", [0.05, h - frameT, halfD - frameT]);
  parent.add(glass);

  const pan = part("weighingPan");
  const floorY = frameT + 0.018;
  const platformH = 0.006;
  const stemH = 0.016;
  const panH = 0.018;

  addMesh(
    pan,
    new CylinderGeometry(0.078, 0.078, platformH, 18),
    mats.platform,
    "platform",
    [0, floorY + platformH * 0.5, 0],
    undefined,
    12,
  );
  addMesh(
    pan,
    new CylinderGeometry(0.018, 0.02, stemH, 12),
    mats.metal,
    "stem",
    [0, floorY + platformH + stemH * 0.5, 0],
    undefined,
    13,
  );
  addMesh(
    pan,
    new CylinderGeometry(0.062, 0.056, panH, 24),
    mats.metal,
    "pan",
    [0, floorY + platformH + stemH + panH * 0.5, 0],
    undefined,
    14,
  );
  addMesh(
    pan,
    new CylinderGeometry(0.064, 0.064, 0.003, 24),
    mats.metal,
    "panRim",
    [0, floorY + platformH + stemH + panH - 0.001, 0],
    undefined,
    14,
  );
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

  const base = part("base");
  const deckTop = buildBase(base, mats);
  group.add(base);

  const shield = part("draftShield");
  shield.position.set(0, deckTop, -0.03);
  buildDraftShield(shield, mats);
  group.add(shield);

  group.position.y = -0.05;
  const stats = measureGroup(group);
  return { group, stats, materials };
}
