import {
  BoxGeometry,
  CylinderGeometry,
  DoubleSide,
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
export const ANALYTICAL_BALANCE_REVISION = 2;

export const ANALYTICAL_BALANCE_COLORS = {
  body: "#C4C9CE",
  bodyDark: "#A8ADB2",
  panel: "#9EB0BE",
  screen: "#1E2A38",
  screenGlow: "#5A8FA8",
  button: "#5C6369",
  buttonFace: "#E8ECF0",
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
    emissiveIntensity: 0.45,
    roughness: 0.22,
    metalness: 0.05,
  });
  const button = new MeshToonMaterial({ color: ANALYTICAL_BALANCE_COLORS.button });
  const buttonFace = new MeshToonMaterial({ color: ANALYTICAL_BALANCE_COLORS.buttonFace });
  const metal = new MeshStandardMaterial({
    color: ANALYTICAL_BALANCE_COLORS.metal,
    roughness: 0.18,
    metalness: 0.72,
  });
  const glass = new MeshStandardMaterial({
    color: ANALYTICAL_BALANCE_COLORS.glass,
    roughness: 0.05,
    metalness: 0.06,
    transparent: true,
    opacity: 0.38,
    side: DoubleSide,
    depthWrite: false,
  });
  const accent = new MeshToonMaterial({ color: ANALYTICAL_BALANCE_COLORS.accent });

  body.name = "body";
  bodyDark.name = "bodyDark";
  panel.name = "panel";
  screen.name = "screen";
  button.name = "button";
  buttonFace.name = "buttonFace";
  metal.name = "metal";
  glass.name = "glass";
  accent.name = "accent";

  return { body, bodyDark, panel, screen, button, buttonFace, metal, glass, accent };
}

function buildSlopePanel(parent: Group, mats: Mats, deckTop: number, depth: number) {
  const slope = part("slopePanel");
  const tilt = 0.58;

  addMesh(slope, new BoxGeometry(0.5, 0.07, 0.17), mats.body, "slopeBlock", [0, 0.035, 0]);
  slope.position.set(0, deckTop, depth * 0.31);
  slope.rotation.set(-tilt, 0, 0);
  parent.add(slope);

  const face = part("panelFace");
  const faceZ = 0.036;
  addMesh(face, new BoxGeometry(0.44, 0.13, 0.012), mats.panel, "panelPlate", [0, 0.02, faceZ]);
  addMesh(face, new BoxGeometry(0.19, 0.075, 0.008), mats.screen, "display", [0.04, 0.045, faceZ + 0.01]);
  addMesh(face, new BoxGeometry(0.035, 0.028, 0.008), mats.accent, "brandMark", [-0.13, 0.06, faceZ + 0.01]);
  addMesh(face, new BoxGeometry(0.07, 0.022, 0.006), mats.bodyDark, "brandBar", [-0.08, 0.065, faceZ + 0.011]);
  addMesh(face, new BoxGeometry(0.045, 0.018, 0.006), mats.bodyDark, "modelTag", [-0.16, 0.04, faceZ + 0.011]);

  const buttonXs = [-0.17, -0.12, -0.07, -0.02, 0.03, 0.08, 0.13];
  buttonXs.forEach((x, i) => {
    addMesh(face, new CylinderGeometry(0.014, 0.014, 0.012, 12), mats.button, `btn-${i}`, [x, -0.02, faceZ + 0.008], [
      Math.PI / 2,
      0,
      0,
    ]);
    addMesh(face, new CylinderGeometry(0.009, 0.009, 0.003, 10), mats.buttonFace, `btn-cap-${i}`, [
      x,
      -0.014,
      faceZ + 0.014,
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

function buildDraftShield(parent: Group, mats: Mats) {
  const w = 0.33;
  const d = 0.33;
  const h = 0.38;
  const frameT = 0.016;
  const inset = 0.006;
  const glassT = 0.005;

  const frame = part("frame");
  const halfW = w * 0.5;
  const halfD = d * 0.5;
  const postPositions: Array<[number, number, number]> = [
    [-halfW + frameT * 0.5, h * 0.5, -halfD + frameT * 0.5],
    [halfW - frameT * 0.5, h * 0.5, -halfD + frameT * 0.5],
    [-halfW + frameT * 0.5, h * 0.5, halfD - frameT * 0.5],
    [halfW - frameT * 0.5, h * 0.5, halfD - frameT * 0.5],
  ];
  postPositions.forEach(([x, y, z], i) => {
    addMesh(frame, new BoxGeometry(frameT, h, frameT), mats.body, `post-${i}`, [x, y, z]);
  });

  addMesh(frame, new BoxGeometry(w, frameT, d), mats.body, "railTop", [0, h - frameT * 0.5, 0]);
  addMesh(frame, new BoxGeometry(w, frameT, d), mats.body, "railBottom", [0, frameT * 0.5, 0]);
  addMesh(frame, new BoxGeometry(frameT, h, d), mats.body, "railLeft", [-halfW + frameT * 0.5, h * 0.5, 0]);
  addMesh(frame, new BoxGeometry(frameT, h, d), mats.body, "railRight", [halfW - frameT * 0.5, h * 0.5, 0]);
  parent.add(frame);

  const glass = part("glassPanels");
  const innerW = w - frameT * 2 - inset * 2;
  const innerD = d - frameT * 2 - inset * 2;
  const innerH = h - frameT * 2 - inset * 2;
  const glassY = frameT + inset + innerH * 0.5;

  addMesh(
    glass,
    new BoxGeometry(innerW, innerH, glassT),
    mats.glass,
    "front",
    [0, glassY, halfD - frameT - inset - glassT * 0.5],
  );
  addMesh(
    glass,
    new BoxGeometry(innerW, innerH, glassT),
    mats.glass,
    "back",
    [0, glassY, -halfD + frameT + inset + glassT * 0.5],
  );
  addMesh(
    glass,
    new BoxGeometry(glassT, innerH, innerD),
    mats.glass,
    "left",
    [-halfW + frameT + inset + glassT * 0.5, glassY, 0],
  );
  addMesh(
    glass,
    new BoxGeometry(glassT, innerH, innerD),
    mats.glass,
    "right",
    [halfW - frameT - inset - glassT * 0.5, glassY, 0],
  );
  addMesh(
    glass,
    new BoxGeometry(innerW, glassT, innerD),
    mats.glass,
    "top",
    [0, h - frameT - inset - glassT * 0.5, 0],
  );

  addMesh(glass, new BoxGeometry(0.02, 0.06, 0.01), mats.body, "handleLeft", [
    -halfW + frameT * 0.6,
    h * 0.55,
    0.05,
  ]);
  addMesh(glass, new BoxGeometry(0.02, 0.06, 0.01), mats.body, "handleRight", [
    halfW - frameT * 0.6,
    h * 0.55,
    -0.05,
  ]);
  addMesh(glass, new BoxGeometry(0.06, 0.01, 0.02), mats.body, "handleTop", [0.05, h - frameT, halfD - frameT]);

  glass.children.forEach((child, index) => {
    if (child instanceof Mesh && child.name.startsWith("handle") === false) {
      child.renderOrder = 2 + index;
    }
  });
  parent.add(glass);

  const pan = part("weighingPan");
  const floorY = frameT + 0.004;
  const stemH = 0.006;
  const panH = 0.008;
  addMesh(pan, new CylinderGeometry(0.062, 0.062, 0.004, 16), mats.metal, "platform", [0, floorY + 0.002, 0]);
  addMesh(pan, new CylinderGeometry(0.014, 0.016, stemH, 10), mats.metal, "stem", [0, floorY + stemH * 0.5 + 0.004, 0]);
  addMesh(pan, new CylinderGeometry(0.05, 0.048, panH, 20), mats.metal, "pan", [
    0,
    floorY + stemH + panH * 0.5 + 0.004,
    0,
  ]);
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
