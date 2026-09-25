import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  LatheGeometry,
  Mesh,
  MeshStandardMaterial,
  MeshToonMaterial,
  SphereGeometry,
  TorusGeometry,
  Vector2,
  type BufferGeometry,
  type Material,
} from "three";

/** Bump when factory geometry changes so the R3F wrapper remounts. */
export const GLASSWARE_STATION_REVISION = 1;

export const GLASSWARE_STATION_COLORS = {
  metal: "#B4BBC2",
  metalDark: "#8D949C",
  glass: "#E8F4F8",
  red: "#E8253A",
  yellow: "#F5D020",
  green: "#2ECC40",
  blue: "#0074D9",
  orange: "#FF851B",
  cap: "#C8CDD2",
} as const;

export type GlasswareStationStats = {
  triangles: number;
  meshes: number;
  materials: number;
  parts: string[];
};

export type GlasswareStationBuild = {
  group: Group;
  stats: GlasswareStationStats;
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
  scale?: [number, number, number],
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

function makeMaterials() {
  const metal = new MeshStandardMaterial({
    color: GLASSWARE_STATION_COLORS.metal,
    roughness: 0.38,
    metalness: 0.55,
  });
  const metalDark = new MeshStandardMaterial({
    color: GLASSWARE_STATION_COLORS.metalDark,
    roughness: 0.42,
    metalness: 0.48,
  });
  const glass = new MeshStandardMaterial({
    color: GLASSWARE_STATION_COLORS.glass,
    roughness: 0.08,
    metalness: 0.05,
    transparent: true,
    opacity: 0.42,
  });
  const red = new MeshToonMaterial({ color: GLASSWARE_STATION_COLORS.red, transparent: true, opacity: 0.88 });
  const yellow = new MeshToonMaterial({ color: GLASSWARE_STATION_COLORS.yellow, transparent: true, opacity: 0.88 });
  const green = new MeshToonMaterial({ color: GLASSWARE_STATION_COLORS.green, transparent: true, opacity: 0.88 });
  const blue = new MeshToonMaterial({ color: GLASSWARE_STATION_COLORS.blue, transparent: true, opacity: 0.9 });
  const orange = new MeshToonMaterial({ color: GLASSWARE_STATION_COLORS.orange, transparent: true, opacity: 0.9 });
  const cap = new MeshStandardMaterial({
    color: GLASSWARE_STATION_COLORS.cap,
    roughness: 0.35,
    metalness: 0.62,
  });

  metal.name = "metal";
  metalDark.name = "metalDark";
  glass.name = "glass";
  red.name = "red";
  yellow.name = "yellow";
  green.name = "green";
  blue.name = "blue";
  orange.name = "orange";
  cap.name = "cap";

  return { metal, metalDark, glass, red, yellow, green, blue, orange, cap };
}

function roundBottomFlaskProfile(): Vector2[] {
  return [
    new Vector2(0.001, 0),
    new Vector2(0.09, 0.015),
    new Vector2(0.115, 0.07),
    new Vector2(0.1, 0.12),
    new Vector2(0.055, 0.155),
    new Vector2(0.032, 0.19),
    new Vector2(0.028, 0.24),
    new Vector2(0.028, 0.28),
  ];
}

function buildRoundBottomFlask(
  parent: Group,
  mats: Mats,
  liquidMat: MeshToonMaterial,
  scale = 1,
) {
  const profile = roundBottomFlaskProfile().map((p) => new Vector2(p.x * scale, p.y * scale));
  const glassGeo = new LatheGeometry(profile, 20);
  glassGeo.computeVertexNormals();
  addMesh(parent, glassGeo, mats.glass, "flaskGlass");

  const liquidProfile = profile
    .filter((p) => p.y <= 0.12 * scale)
    .map((p) => new Vector2(p.x * 0.88, p.y));
  if (liquidProfile.length >= 2) {
    const liquidGeo = new LatheGeometry(liquidProfile, 18);
    liquidGeo.computeVertexNormals();
    addMesh(parent, liquidGeo, liquidMat, "liquid");
  }
}

function buildErlenmeyerFlask(parent: Group, mats: Mats) {
  addMesh(
    parent,
    new CylinderGeometry(0.11, 0.14, 0.14, 18, 1, true),
    mats.glass,
    "body",
    [0, 0.1, 0],
  );
  addMesh(parent, new CylinderGeometry(0.028, 0.032, 0.16, 14), mats.glass, "neck", [0, 0.24, 0]);
  addMesh(parent, new CylinderGeometry(0.105, 0.105, 0.09, 16), mats.yellow, "liquid", [0, 0.07, 0]);
}

function buildTestTube(
  parent: Group,
  mats: Mats,
  liquidMat: MeshToonMaterial,
  height = 0.42,
) {
  addMesh(parent, new CylinderGeometry(0.028, 0.028, height, 14), mats.glass, "tube", [0, height * 0.5, 0]);
  addMesh(
    parent,
    new CylinderGeometry(0.024, 0.024, height * 0.72, 12),
    liquidMat,
    "liquid",
    [0, height * 0.38, 0],
  );
  addMesh(parent, new CylinderGeometry(0.034, 0.034, 0.05, 12), mats.cap, "cap", [0, height + 0.02, 0]);
}

function buildPlatform(parent: Group, mats: Mats) {
  const topY = 0.12;
  addMesh(
    parent,
    new BoxGeometry(1.35, 0.045, 0.58),
    mats.metal,
    "deck",
    [0, topY, 0],
  );
  const legPositions: Array<[number, number, number]> = [
    [-0.58, 0.06, 0.22],
    [0.58, 0.06, 0.22],
    [-0.58, 0.06, -0.22],
    [0.58, 0.06, -0.22],
  ];
  legPositions.forEach(([x, y, z], i) => {
    addMesh(parent, new CylinderGeometry(0.035, 0.038, 0.12, 10), mats.metalDark, `leg-${i}`, [x, y, z]);
  });
}

function buildRack(parent: Group, mats: Mats) {
  const postX = [-0.34, 0.34];
  const postZ = [-0.06, 0.06];
  postX.forEach((x) => {
    postZ.forEach((z, zi) => {
      addMesh(parent, new CylinderGeometry(0.012, 0.012, 0.52, 8), mats.metal, `post-${x}-${zi}`, [
        x,
        0.4,
        z,
      ]);
    });
  });
  [0.28, 0.46].forEach((y, i) => {
    addMesh(parent, new TorusGeometry(0.34, 0.012, 8, 28), mats.metal, `ring-${i}`, [0, y, 0], [
      Math.PI / 2,
      0,
      0,
    ]);
  });
}

function buildCentralRod(parent: Group, mats: Mats) {
  addMesh(parent, new CylinderGeometry(0.018, 0.018, 0.58, 10), mats.metal, "rod", [0, 0.42, 0]);
  addMesh(parent, new SphereGeometry(0.045, 14, 12), mats.metal, "knob", [0, 0.74, 0]);
}

export function measureGroup(root: Group): GlasswareStationStats {
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

export function createGlasswareStationModel(): GlasswareStationBuild {
  const group = new Group();
  group.name = "GlasswareStation";
  const mats = makeMaterials();
  const materials = Object.values(mats);

  const platform = part("platform");
  buildPlatform(platform, mats);
  group.add(platform);

  const rack = part("rack");
  buildRack(rack, mats);
  group.add(rack);

  const centralRod = part("centralRod");
  buildCentralRod(centralRod, mats);
  group.add(centralRod);

  const flaskRed = part("flaskRed");
  buildRoundBottomFlask(flaskRed, mats, mats.red, 1);
  flaskRed.position.set(-0.38, 0.145, 0.1);
  group.add(flaskRed);

  const flaskYellow = part("flaskYellow");
  buildErlenmeyerFlask(flaskYellow, mats);
  flaskYellow.position.set(0, 0.145, 0.12);
  group.add(flaskYellow);

  const flaskGreen = part("flaskGreen");
  buildRoundBottomFlask(flaskGreen, mats, mats.green, 1);
  flaskGreen.position.set(0.38, 0.145, 0.1);
  group.add(flaskGreen);

  const tubeBlue = part("tubeBlue");
  buildTestTube(tubeBlue, mats, mats.blue);
  tubeBlue.position.set(-0.26, 0.165, -0.04);
  group.add(tubeBlue);

  const tubeOrange = part("tubeOrange");
  buildTestTube(tubeOrange, mats, mats.orange);
  tubeOrange.position.set(0.26, 0.165, -0.04);
  group.add(tubeOrange);

  group.position.y = -0.12;
  const stats = measureGroup(group);
  return { group, stats, materials };
}
