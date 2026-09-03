import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  Mesh,
  MeshToonMaterial,
  SphereGeometry,
  type BufferGeometry,
  type Material,
} from "three";

/** Bump when factory geometry changes so the R3F wrapper remounts. */
export const RESEARCHER_REVISION = 1;

export const RESEARCHER_COLORS = {
  skin: "#E7D3C4",
  labCoat: "#F3F1EC",
  hair: "#4A3428",
  inner: "#4E827B",
  dark: "#3A474A",
  accent: "#8B7355",
} as const;

export type ResearcherModelOptions = {
  style?: "concept";
};

export const DEFAULT_RESEARCHER_OPTIONS: Required<ResearcherModelOptions> = {
  style: "concept",
};

export type ResearcherStats = {
  triangles: number;
  meshes: number;
  materials: number;
  parts: string[];
};

export type ResearcherBuild = {
  group: Group;
  stats: ResearcherStats;
  materials: MeshToonMaterial[];
};

type Mats = ReturnType<typeof makeMaterials>;

/** Total standing height ≈ 1.62; feet at y = 0. */
const H = 1.62;
const HEAD_R = 0.175;
const HEAD_Y = 1.38;

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
  const skin = new MeshToonMaterial({ color: RESEARCHER_COLORS.skin });
  const labCoat = new MeshToonMaterial({ color: RESEARCHER_COLORS.labCoat });
  const hair = new MeshToonMaterial({ color: RESEARCHER_COLORS.hair });
  const innerClothes = new MeshToonMaterial({ color: RESEARCHER_COLORS.inner });
  const darkAccessory = new MeshToonMaterial({ color: RESEARCHER_COLORS.dark });
  const accent = new MeshToonMaterial({ color: RESEARCHER_COLORS.accent });
  skin.name = "skin";
  labCoat.name = "labCoat";
  hair.name = "hair";
  innerClothes.name = "innerClothes";
  darkAccessory.name = "darkAccessory";
  accent.name = "accent";
  return { skin, labCoat, hair, innerClothes, darkAccessory, accent };
}

export function measureGroup(root: Group): ResearcherStats {
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

function createBody(mats: Mats) {
  const group = part("body");

  addMesh(
    group,
    new BoxGeometry(0.28, 0.4, 0.18),
    mats.innerClothes,
    "torso",
    [0, 0.92, 0.02],
  );

  const legH = 0.64;
  const legY = 0.36;
  addMesh(group, new CylinderGeometry(0.075, 0.085, legH, 8), mats.darkAccessory, "legL", [
    -0.1,
    legY,
    0,
  ]);
  addMesh(group, new CylinderGeometry(0.075, 0.085, legH, 8), mats.darkAccessory, "legR", [
    0.1,
    legY,
    0,
  ]);

  addMesh(group, new BoxGeometry(0.14, 0.05, 0.22), mats.labCoat, "shoeL", [-0.1, 0.025, 0.03]);
  addMesh(group, new BoxGeometry(0.14, 0.05, 0.22), mats.labCoat, "shoeR", [0.1, 0.025, 0.03]);

  // Arms angled forward for 3/4 clipboard pose
  addMesh(
    group,
    new BoxGeometry(0.1, 0.28, 0.1),
    mats.innerClothes,
    "armL",
    [-0.22, 1.02, 0.08],
    [0.35, 0.15, 0.25],
  );
  addMesh(
    group,
    new BoxGeometry(0.1, 0.28, 0.1),
    mats.innerClothes,
    "armR",
    [0.22, 1.02, 0.08],
    [0.35, -0.15, -0.25],
  );

  addMesh(group, new SphereGeometry(0.065, 8, 8), mats.skin, "handL", [-0.14, 0.9, 0.2]);
  addMesh(group, new SphereGeometry(0.065, 8, 8), mats.skin, "handR", [0.14, 0.9, 0.2]);

  return group;
}

function createLabCoat(mats: Mats) {
  const group = part("labCoat");
  const hemY = 0.44;

  addMesh(
    group,
    new BoxGeometry(0.38, H - hemY, 0.12),
    mats.labCoat,
    "coatBack",
    [0, hemY + (H - hemY) * 0.5 - 0.08, -0.04],
  );

  addMesh(
    group,
    new BoxGeometry(0.16, H - hemY - 0.05, 0.06),
    mats.labCoat,
    "coatFrontL",
    [-0.12, hemY + (H - hemY) * 0.5 - 0.08, 0.06],
  );
  addMesh(
    group,
    new BoxGeometry(0.16, H - hemY - 0.05, 0.06),
    mats.labCoat,
    "coatFrontR",
    [0.12, hemY + (H - hemY) * 0.5 - 0.08, 0.06],
  );

  // Open-front gap line
  addMesh(
    group,
    new BoxGeometry(0.02, H - hemY - 0.12, 0.04),
    mats.darkAccessory,
    "coatOpening",
    [0, hemY + (H - hemY) * 0.5 - 0.08, 0.09],
  );

  addMesh(
    group,
    new BoxGeometry(0.12, 0.32, 0.11),
    mats.labCoat,
    "sleeveL",
    [-0.28, 1.04, 0.04],
    [0.2, 0, 0.1],
  );
  addMesh(
    group,
    new BoxGeometry(0.12, 0.32, 0.11),
    mats.labCoat,
    "sleeveR",
    [0.28, 1.04, 0.04],
    [0.2, 0, -0.1],
  );

  // Collar / inner peek
  addMesh(group, new BoxGeometry(0.14, 0.06, 0.08), mats.innerClothes, "collarPeek", [
    0,
    1.12,
    0.06,
  ]);

  return group;
}

function createHead(mats: Mats) {
  const group = part("head");

  const skull = part("skull");
  addMesh(skull, new SphereGeometry(HEAD_R, 12, 10), mats.skin, "skullMesh", [0, HEAD_Y, 0.02]);

  const face = part("face");
  addMesh(face, new SphereGeometry(0.018, 6, 6), mats.darkAccessory, "eyeL", [
    -0.055,
    HEAD_Y + 0.02,
    HEAD_R + 0.01,
  ]);
  addMesh(face, new SphereGeometry(0.018, 6, 6), mats.darkAccessory, "eyeR", [
    0.055,
    HEAD_Y + 0.02,
    HEAD_R + 0.01,
  ]);
  skull.add(face);
  group.add(skull);

  const hairGroup = part("hair");
  addMesh(
    hairGroup,
    new SphereGeometry(0.19, 10, 8),
    mats.hair,
    "main",
    [0, HEAD_Y + 0.02, -0.02],
  );
  addMesh(hairGroup, new SphereGeometry(0.11, 8, 8), mats.hair, "bun", [
    0,
    HEAD_Y + 0.14,
    -0.1,
  ]);
  addMesh(hairGroup, new BoxGeometry(0.16, 0.06, 0.08), mats.hair, "fringe", [
    0,
    HEAD_Y + 0.06,
    HEAD_R - 0.02,
  ]);
  group.add(hairGroup);

  return group;
}

function createClipboard(mats: Mats) {
  const group = part("clipboard");
  addMesh(group, new BoxGeometry(0.18, 0.24, 0.025), mats.darkAccessory, "board", [
    0,
    0.98,
    0.22,
  ]);
  addMesh(group, new CylinderGeometry(0.012, 0.012, 0.14, 6), mats.accent, "pen", [
    0.06,
    1.02,
    0.24,
  ], [Math.PI / 2, 0, -0.4]);
  return group;
}

/**
 * Stylized iGEM lab researcher (runtime LAB id: researcher).
 * Static 3/4 pose, ~4-head-tall cartoon silhouette.
 */
export function createResearcherModel(options?: ResearcherModelOptions): ResearcherBuild {
  const opts = { ...DEFAULT_RESEARCHER_OPTIONS, ...options };
  void opts.style;

  const materials = makeMaterials();
  const group = part("researcher");
  group.add(createBody(materials));
  group.add(createLabCoat(materials));
  group.add(createHead(materials));
  group.add(createClipboard(materials));

  const stats = measureGroup(group);
  group.userData.stats = stats;
  return {
    group,
    stats,
    materials: Object.values(materials),
  };
}
