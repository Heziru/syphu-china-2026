import {
  BoxGeometry,
  CanvasTexture,
  CylinderGeometry,
  Group,
  Mesh,
  MeshStandardMaterial,
  MeshToonMaterial,
  SphereGeometry,
  SRGBColorSpace,
  TorusGeometry,
  RepeatWrapping,
  type BufferGeometry,
  type Material,
} from "three";

export const LAB_CHAIR_REVISION = 1;

export const LAB_CHAIR_COLORS = {
  plastic: "#1A1A1C",
  metal: "#222226",
  glide: "#141416",
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

const SEAT_Y = 0.48;
const SEAT_W = 0.4;
const SEAT_D = 0.38;
const SEAT_T = 0.055;
const BACK_W = 0.36;
const BACK_H = 0.3;
const BACK_T = 0.038;
const BACK_Y = 0.67;
const BACK_Z = -0.11;
const TUBE_R = 0.011;
const PILLAR_R = 0.024;

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

function makeGridPlasticMaterial(): MeshStandardMaterial {
  if (typeof document === "undefined") {
    const m = new MeshStandardMaterial({ color: LAB_CHAIR_COLORS.plastic });
    m.name = "plastic";
    return m;
  }
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = LAB_CHAIR_COLORS.plastic;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    const step = 10;
    for (let y = 0; y < canvas.height; y += step) {
      for (let x = 0; x < canvas.width; x += step) {
        ctx.fillRect(x, y, step - 1, step - 1);
      }
    }
  }
  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  tex.wrapS = tex.wrapT = RepeatWrapping;
  tex.repeat.set(4, 4);
  const mat = new MeshStandardMaterial({
    map: tex,
    color: LAB_CHAIR_COLORS.plastic,
    roughness: 0.82,
    metalness: 0.04,
  });
  mat.name = "plastic";
  return mat;
}

function makeMaterials() {
  const plastic = makeGridPlasticMaterial();
  const metal = new MeshStandardMaterial({
    color: LAB_CHAIR_COLORS.metal,
    roughness: 0.48,
    metalness: 0.62,
  });
  const glide = new MeshToonMaterial({ color: LAB_CHAIR_COLORS.glide });
  plastic.name = "plastic";
  metal.name = "metal";
  glide.name = "glide";
  return { plastic, metal, glide };
}

function buildSeat(parent: Group, mats: Mats) {
  const seat = part("seat");
  addMesh(
    seat,
    new BoxGeometry(SEAT_W, SEAT_T, SEAT_D),
    mats.plastic,
    "cushion",
    [0, SEAT_Y, 0.01],
  );
  addMesh(
    seat,
    new BoxGeometry(SEAT_W * 0.96, SEAT_T * 0.55, 0.028),
    mats.plastic,
    "waterfallLip",
    [0, SEAT_Y - SEAT_T * 0.28, SEAT_D * 0.46],
    [-0.28, 0, 0],
  );
  parent.add(seat);
}

function buildBackrest(parent: Group, mats: Mats) {
  const back = part("backrest");
  addMesh(
    back,
    new BoxGeometry(BACK_W, BACK_H, BACK_T),
    mats.plastic,
    "panel",
    [0, BACK_Y, BACK_Z],
    [-0.1, 0, 0],
  );
  parent.add(back);
}

function buildBackFrame(parent: Group, mats: Mats) {
  const frame = part("backFrame");
  const halfW = BACK_W * 0.46;
  const yLow = SEAT_Y + 0.02;
  const yHigh = BACK_Y + BACK_H * 0.42;
  const zLow = BACK_Z + BACK_T * 0.55;
  const zHigh = BACK_Z - BACK_T * 0.15;

  addMesh(
    frame,
    new CylinderGeometry(TUBE_R, TUBE_R, yHigh - yLow, 8),
    mats.metal,
    "uprightLeft",
    [-halfW, (yLow + yHigh) * 0.5, zHigh],
  );
  addMesh(
    frame,
    new CylinderGeometry(TUBE_R, TUBE_R, yHigh - yLow, 8),
    mats.metal,
    "uprightRight",
    [halfW, (yLow + yHigh) * 0.5, zHigh],
  );
  addMesh(
    frame,
    new CylinderGeometry(TUBE_R, TUBE_R, halfW * 2, 8),
    mats.metal,
    "crossBar",
    [0, yLow, zLow],
    [0, Math.PI / 2, 0],
  );
  addMesh(
    frame,
    new TorusGeometry(TUBE_R * 1.05, TUBE_R * 0.85, 6, 10, Math.PI * 0.5),
    mats.metal,
    "cornerLeft",
    [-halfW, yHigh, zHigh],
    [0, Math.PI / 2, 0],
  );
  addMesh(
    frame,
    new TorusGeometry(TUBE_R * 1.05, TUBE_R * 0.85, 6, 10, Math.PI * 0.5),
    mats.metal,
    "cornerRight",
    [halfW, yHigh, zHigh],
    [0, 0, 0],
  );
  parent.add(frame);
}

function buildPillar(parent: Group, mats: Mats) {
  const pillarH = SEAT_Y - SEAT_T * 0.5 - 0.1;
  addMesh(
    parent,
    new CylinderGeometry(PILLAR_R, PILLAR_R * 1.06, pillarH, 12),
    mats.metal,
    "pillar",
    [0, 0.1 + pillarH * 0.5, 0.01],
  );
  addMesh(
    parent,
    new CylinderGeometry(PILLAR_R * 1.35, PILLAR_R * 1.15, 0.022, 12),
    mats.metal,
    "hub",
    [0, 0.1, 0.01],
  );
}

function buildBase(parent: Group, mats: Mats) {
  const base = part("base");
  const hubY = 0.06;
  const legLen = 0.27;
  const legDrop = 0.04;
  const angles = [Math.PI * 0.25, Math.PI * 0.75, Math.PI * 1.25, Math.PI * 1.75];

  angles.forEach((a, i) => {
    const midX = Math.cos(a) * legLen * 0.5;
    const midZ = Math.sin(a) * legLen * 0.5;
    addMesh(
      base,
      new CylinderGeometry(TUBE_R * 1.05, TUBE_R * 1.05, legLen, 8),
      mats.metal,
      `leg-${i}`,
      [midX, hubY - legDrop * 0.5, midZ + 0.01],
      [legDrop / legLen, a, 0],
    );
    const footX = Math.cos(a) * legLen;
    const footZ = Math.sin(a) * legLen;
    addMesh(
      base,
      new SphereGeometry(0.016, 10, 8),
      mats.glide,
      `glide-${i}`,
      [footX, hubY - legDrop, footZ + 0.01],
    );
  });

  addMesh(
    base,
    new CylinderGeometry(PILLAR_R * 1.5, PILLAR_R * 1.5, 0.028, 12),
    mats.metal,
    "baseHub",
    [0, hubY, 0.01],
  );

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
  buildSeat(group, mats);
  buildBackFrame(group, mats);
  buildBackrest(group, mats);

  group.position.y = 0.02;
  return { group, stats: measureGroup(group), materials };
}
