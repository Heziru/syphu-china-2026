import {
  type Body,
  type Size,
  type Transform,
  type Vec2,
  type Vec3,
  ROOM_POLYGON,
  EPS,
  normalizeYaw,
  packStrip,
  transformPoint,
  wallAnchorFromSegment,
  validateAABBNoOverlap,
  validateClearance,
  validateCirculation,
  validateRoomContainment,
  type ClearanceRule,
} from "./layoutMath";
export type GroupId =
  | "dry"
  | "wet"
  | "storage"
  | "engineering"
  | "central"
  | "team";
export type Role =
  | "desk"
  | "bench"
  | "cabinet"
  | "computer"
  | "hood"
  | "chair"
  | "stool"
  | "bioreactor"
  | "microscope"
  | "researcher";
export type FurnitureSpec = Body & {
  group: GroupId;
  parent: GroupId;
  role: Role;
  mount: "floor" | "tabletop";
  topY?: number;
  supportedBy?: string;
  workstationId?: string;
};
export const PLACEMENT_REVISION = 11;
export const GROUP_LABELS: Record<GroupId, string> = {
  dry: "Dry Lab",
  wet: "Wet Lab",
  storage: "Archive",
  engineering: "Engineering",
  central: "Central Lab",
  team: "Team",
};
export function placeOnTabletop(
  device: FurnitureSpec,
  table: FurnitureSpec,
  offset: Vec2 = [0, 0],
  yaw = 0,
): FurnitureSpec {
  if (device.parent !== table.parent || table.topY === undefined)
    throw new Error("Invalid support");
  const c = Math.abs(Math.cos(yaw)),
    s = Math.abs(Math.sin(yaw));
  const hx = (c * device.size[0]) / 2 + (s * device.size[2]) / 2,
    hz = (s * device.size[0]) / 2 + (c * device.size[2]) / 2;
  if (
    Math.abs(offset[0]) + hx > table.size[0] / 2 - 0.03 + EPS ||
    Math.abs(offset[1]) + hz > table.size[2] / 2 - 0.03 + EPS
  )
    throw new Error(device.id + " exceeds tabletop");
  return {
    ...device,
    position: transformPoint(table, [offset[0], table.topY, offset[1]]),
    rotationY: normalizeYaw(table.rotationY + yaw),
    mount: "tabletop",
    supportedBy: table.id,
  };
}
export function chairFromWorkstation(
  chair: FurnitureSpec,
  station: FurnitureSpec,
  side: "front" | "back",
  along: number,
  gap: number,
): FurnitureSpec {
  if (
    chair.parent !== station.parent ||
    station.mount !== "floor" ||
    gap < 0 ||
    Math.abs(along) + chair.size[0] / 2 > station.size[0] / 2 + EPS
  )
    throw new Error("Invalid chair relation");
  const sign = side === "front" ? 1 : -1;
  return {
    ...chair,
    position: transformPoint(station, [
      along,
      0,
      sign * (station.size[2] / 2 + chair.size[2] / 2 + gap),
    ]),
    rotationY: normalizeYaw(
      station.rotationY + (side === "front" ? Math.PI : 0),
    ),
    workstationId: station.id,
  };
}
const rear = packStrip([2.3, 1.8, 1.9], 0.5),
  rearCenter = ROOM_POLYGON[0][0] + 0.2 + rear.span / 2;
function back(x: number, w: number, d: number) {
  return wallAnchorFromSegment(
    ROOM_POLYGON[0],
    ROOM_POLYGON[1],
    (x + 3.8) / 7.6,
    w,
    d,
  );
}
export const GROUP_FRAMES: Record<GroupId, Transform> = {
  dry: wallAnchorFromSegment(ROOM_POLYGON[0], ROOM_POLYGON[5], 0.64, 1.9, 0.78),
  wet: back(rearCenter + rear.centers[0], 2.3, 0.8),
  storage: back(rearCenter + rear.centers[1], 1.8, 0.62),
  engineering: back(rearCenter + rear.centers[2], 1.9, 0.76),
  central: { position: [0, 0, 0.6], rotationY: 0 },
  team: { position: [0, 0, 0], rotationY: 0 },
};
function item(
  id: string,
  group: GroupId,
  role: Role,
  size: Size,
  position: Vec3 = [0, 0, 0],
): FurnitureSpec {
  return {
    id,
    group,
    parent: group,
    role,
    size,
    position,
    rotationY: 0,
    mount: "floor",
  };
}
function table(
  id: string,
  group: GroupId,
  role: "desk" | "bench" | "cabinet",
  size: Size,
  position: Vec3 = [0, 0, 0],
): FurnitureSpec {
  return { ...item(id, group, role, size, position), topY: size[1] };
}
const dry = table("dry-desk", "dry", "desk", [1.9, 0.8, 0.78]);
const wet = table("wet-bench", "wet", "bench", [2.3, 0.86, 0.8]);
const central = table("central-bench", "central", "bench", [2.7, 0.86, 1.45]);
const storage = packStrip([0.88, 0.88], 0.04),
  eng = packStrip([1.2, 0.66], 0.04);
const engBench = table(
  "engineering-bench",
  "engineering",
  "bench",
  [1.2, 0.86, 0.76],
  [eng.centers[0], 0, 0],
);
const engCab = table(
  "engineering-cabinet",
  "engineering",
  "cabinet",
  [0.66, 0.86, 0.76],
  [eng.centers[1], 0, 0],
);
const reactorSize: Size = [1, 1.65, 1.2];
const reactorX =
  engBench.position[0] + engBench.size[0] / 2 + 0.3 + reactorSize[0] / 2;
const reactorZ = engCab.size[2] / 2 + 0.42 + reactorSize[2] / 2;
export const ROOM_FURNITURE: FurnitureSpec[] = [
  dry,
  placeOnTabletop(
    item("computer", "dry", "computer", [1.35, 0.7, 0.66]),
    dry,
    [0, -0.03],
  ),
  chairFromWorkstation(
    item("dry-chair", "dry", "chair", [0.7, 1.03, 0.7]),
    dry,
    "front",
    0,
    0.36,
  ),
  wet,
  placeOnTabletop(item("laminar-hood", "wet", "hood", [1.8, 1, 0.7]), wet),
  chairFromWorkstation(
    item("wet-stool", "wet", "stool", [0.64, 0.6, 0.64]),
    wet,
    "front",
    0,
    0.36,
  ),
  item(
    "storage-a",
    "storage",
    "cabinet",
    [0.88, 2.05, 0.62],
    [storage.centers[0], 0, 0],
  ),
  item(
    "storage-b",
    "storage",
    "cabinet",
    [0.88, 2.05, 0.62],
    [storage.centers[1], 0, 0],
  ),
  engBench,
  engCab,
  item("device", "engineering", "bioreactor", reactorSize, [
    reactorX,
    0,
    reactorZ,
  ]),
  central,
  placeOnTabletop(
    item("microscope", "central", "microscope", [0.65, 0.88, 0.6]),
    central,
  ),
  chairFromWorkstation(
    item("central-stool-front-right", "central", "stool", [0.64, 0.6, 0.64]),
    central,
    "front",
    0.92,
    0.3,
  ),
  chairFromWorkstation(
    item("central-stool-rear-left", "central", "stool", [0.64, 0.6, 0.64]),
    central,
    "back",
    -0.92,
    0.3,
  ),
  item("researcher", "team", "researcher", [0.64, 1.7, 0.56], [-1.25, 0, 2.45]),
];
export const WORLD_FURNITURE = ROOM_FURNITURE.map((spec) => ({
  ...spec,
  position: transformPoint(GROUP_FRAMES[spec.parent], spec.position),
  rotationY: normalizeYaw(GROUP_FRAMES[spec.parent].rotationY + spec.rotationY),
}));
export function furnitureById(id: string) {
  const result = WORLD_FURNITURE.find((f) => f.id === id);
  if (!result) throw new Error("Unknown furniture: " + id);
  return result;
}
export const CLEARANCE_RULES: ClearanceRule[] = [
  { a: "device", b: "engineering-cabinet", min: 0.4 },
  { a: "device", b: "engineering-bench", min: 0.4 },
  { a: "dry-chair", b: "dry-desk", min: 0.36 },
  { a: "wet-stool", b: "wet-bench", min: 0.36 },
  { a: "central-stool-front-right", b: "central-bench", min: 0.3 },
  { a: "central-stool-rear-left", b: "central-bench", min: 0.3 },
  { a: "researcher", b: "central-bench", min: 0.8 },
  { a: "storage-a", b: "storage-b", min: 0.04 },
  { a: "engineering-bench", b: "engineering-cabinet", min: 0.04 },
];
export function validateLayout() {
  const collisions = validateAABBNoOverlap(WORLD_FURNITURE),
    containment = validateRoomContainment(WORLD_FURNITURE);
  const clearance = validateClearance(WORLD_FURNITURE, CLEARANCE_RULES),
    circulation = validateCirculation(WORLD_FURNITURE);
  const chairCount = ROOM_FURNITURE.filter(
    (f) => f.role === "chair" || f.role === "stool",
  ).length;
  return {
    collisions,
    containment,
    clearance,
    circulation,
    chairCount,
    valid:
      !collisions.length &&
      !containment.length &&
      clearance.every((c) => c.valid) &&
      !circulation.length &&
      chairCount === 4,
  };
}
export const INTERACTIVE_FURNITURE = {
  computer: furnitureById("computer"),
  microscope: furnitureById("microscope"),
  device: furnitureById("device"),
  researcher: furnitureById("researcher"),
  bookshelf: furnitureById("storage-a"),
};
