import {
  CanvasTexture,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  MeshToonMaterial,
  RepeatWrapping,
  Shape,
  SphereGeometry,
  SRGBColorSpace,
  TorusGeometry,
  Vector3,
  type BufferGeometry,
  type Material,
} from "three";

export const LAB_CHAIR_REVISION = 5;

export const LAB_CHAIR_COLORS = {
  plastic: "#18181A",
  plasticHi: "#2A2A2E",
  metal: "#232327",
  glide: "#101012",
} as const;

export type LabChairStats = {
  triangles: number;
  meshes: number;
  materials: number;
  parts: string[];
};

export type LabChairBuild = {
  group: Group;
  stats: LabChairStats;
  materials: Material[];
};

type Mats = ReturnType<typeof makeMaterials>;
type Point3 = [number, number, number];

const SEAT_Y = 0.48;
const SEAT_W = 0.4;
const SEAT_D = 0.38;
const SEAT_T = 0.048;
const BACK_W = 0.36;
const BACK_H = 0.3;
const BACK_T = 0.034;
const BACK_Y = 0.67;
const BACK_Z = -0.1;
const TUBE_R = 0.011;
const PILLAR_R = 0.023;
const BASE_HUB: Point3 = [0, 0.095, 0.012];
const LEG_REACH = 0.25;
const FOOT_Y = 0.014;

const Y_AXIS = new Vector3(0, 1, 0);

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
  position?: Point3,
  rotation?: [number, number, number],
  scale?: Point3,
) {
  const mesh = new Mesh(geometry, material);
  mesh.name = name;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  if (position) mesh.position.set(...position);
  if (rotation) mesh.rotation.set(...rotation);
  if (scale) mesh.scale.set(...scale);
  parent.add(mesh);
  return mesh;
}

function roundedRect(width: number, height: number, radius: number): Shape {
  const hw = width * 0.5;
  const hh = height * 0.5;
  const r = Math.min(radius, hw * 0.42, hh * 0.42);
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

function extrudePanel(shape: Shape, depth: number, bevel = 0.01): BufferGeometry {
  const geo = new ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 2,
    curveSegments: 8,
  });
  geo.rotateX(-Math.PI / 2);
  geo.computeVertexNormals();
  return geo;
}

function tubeBetween(
  parent: Group,
  a: Point3,
  b: Point3,
  radius: number,
  mat: Material,
  name: string,
) {
  const dir = new Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
  const len = dir.length();
  if (len < 1e-6) return;
  dir.normalize();
  const mesh = new Mesh(new CylinderGeometry(radius, radius, len, 10), mat);
  mesh.name = name;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.position.set((a[0] + b[0]) * 0.5, (a[1] + b[1]) * 0.5, (a[2] + b[2]) * 0.5);
  mesh.quaternion.setFromUnitVectors(Y_AXIS, dir);
  parent.add(mesh);
}

function makeGridPlasticMaterial(): MeshStandardMaterial {
  if (typeof document === "undefined") {
    const m = new MeshStandardMaterial({ color: LAB_CHAIR_COLORS.plastic });
    m.name = "plastic";
    return m;
  }
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = LAB_CHAIR_COLORS.plastic;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const step = 14;
    for (let y = 0; y < canvas.height; y += step) {
      for (let x = 0; x < canvas.width; x += step) {
        const g = ctx.createLinearGradient(x, y, x + step, y + step);
        g.addColorStop(0, LAB_CHAIR_COLORS.plasticHi);
        g.addColorStop(1, LAB_CHAIR_COLORS.plastic);
        ctx.fillStyle = g;
        ctx.fillRect(x + 1, y + 1, step - 2, step - 2);
      }
    }
  }
  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  tex.wrapS = tex.wrapT = RepeatWrapping;
  tex.repeat.set(5, 5);
  const mat = new MeshStandardMaterial({
    map: tex,
    color: "#FFFFFF",
    roughness: 0.76,
    metalness: 0.03,
  });
  mat.name = "plastic";
  return mat;
}

function makeMaterials() {
  const plastic = makeGridPlasticMaterial();
  const metal = new MeshStandardMaterial({
    color: LAB_CHAIR_COLORS.metal,
    roughness: 0.44,
    metalness: 0.68,
  });
  const glide = new MeshToonMaterial({ color: LAB_CHAIR_COLORS.glide });
  plastic.name = "plastic";
  metal.name = "metal";
  glide.name = "glide";
  return { plastic, metal, glide };
}

function buildSeat(parent: Group, mats: Mats) {
  const seat = part("seat");
  const shape = roundedRect(SEAT_W, SEAT_D, 0.085);
  addMesh(
    seat,
    extrudePanel(shape, SEAT_T, 0.012),
    mats.plastic,
    "cushion",
    [0, SEAT_Y, 0.012],
  );
  addMesh(
    seat,
    new TorusGeometry(SEAT_W * 0.2, 0.01, 8, 14, Math.PI * 0.52),
    mats.plastic,
    "waterfallLip",
    [0, SEAT_Y - SEAT_T * 0.52, SEAT_D * 0.43],
    [Math.PI * 0.5, 0, 0],
  );
  parent.add(seat);
}

function buildBackrest(parent: Group, mats: Mats) {
  const back = part("backrest");
  const shape = roundedRect(BACK_W, BACK_H, 0.07);
  addMesh(
    back,
    extrudePanel(shape, BACK_T, 0.009),
    mats.plastic,
    "panel",
    [0, BACK_Y, BACK_Z],
    [-0.1, 0, 0],
  );
  parent.add(back);
}

function buildBackFrame(parent: Group, mats: Mats) {
  const frame = part("backFrame");
  const halfW = BACK_W * 0.44;
  const zFrame = -SEAT_D * 0.5 + 0.02;
  const yBottom = SEAT_Y - SEAT_T * 0.55;
  const yTop = BACK_Y + BACK_H * 0.28;

  const bl: Point3 = [-halfW, yBottom, zFrame];
  const br: Point3 = [halfW, yBottom, zFrame];
  const tl: Point3 = [-halfW, yTop, zFrame];
  const tr: Point3 = [halfW, yTop, zFrame];

  tubeBetween(frame, bl, tl, TUBE_R, mats.metal, "uprightLeft");
  tubeBetween(frame, br, tr, TUBE_R, mats.metal, "uprightRight");
  tubeBetween(frame, bl, br, TUBE_R, mats.metal, "underRail");

  parent.add(frame);
}

function buildPillar(parent: Group, mats: Mats) {
  const topY = SEAT_Y - SEAT_T * 0.45;
  tubeBetween(parent, BASE_HUB, [0, topY, 0.012], PILLAR_R, mats.metal, "pillar");
  addMesh(
    parent,
    new CylinderGeometry(PILLAR_R * 1.28, PILLAR_R * 1.12, 0.024, 12),
    mats.metal,
    "seatHub",
    [0, topY - 0.012, 0.012],
  );
}

function buildBase(parent: Group, mats: Mats) {
  const base = part("base");
  const angles = [Math.PI * 0.25, Math.PI * 0.75, Math.PI * 1.25, Math.PI * 1.75];

  addMesh(
    base,
    new CylinderGeometry(PILLAR_R * 1.55, PILLAR_R * 1.55, 0.026, 12),
    mats.metal,
    "baseHub",
    BASE_HUB,
  );

  angles.forEach((a, i) => {
    const foot: Point3 = [
      Math.cos(a) * LEG_REACH,
      FOOT_Y,
      Math.sin(a) * LEG_REACH + BASE_HUB[2],
    ];
    tubeBetween(base, BASE_HUB, foot, TUBE_R, mats.metal, `leg-${i}`);
    addMesh(
      base,
      new SphereGeometry(0.014, 10, 8),
      mats.glide,
      `glide-${i}`,
      [foot[0], FOOT_Y - 0.002, foot[2]],
      undefined,
      [1, 0.45, 1],
    );
  });

  parent.add(base);
}

export function measureGroup(root: Group): LabChairStats {
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

export function createLabChairModel(): LabChairBuild {
  const group = new Group();
  group.name = "LabChair";
  const mats = makeMaterials();
  const materials = Object.values(mats);

  buildBase(group, mats);
  buildPillar(group, mats);
  buildBackFrame(group, mats);
  buildSeat(group, mats);
  buildBackrest(group, mats);

  group.position.y = 0.02;
  return { group, stats: measureGroup(group), materials };
}
