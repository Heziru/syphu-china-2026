import {
  backFaceCenter,
  dotXZ,
  FLOOR_FOOTPRINT,
  footprintInsideRoom,
  furnitureFootprintCorners,
  localToWorldPosition,
  type FootprintXZ,
  type WallAnchor,
  wallAnchorFromSegment,
  worldAxisFromLocal,
} from "./roomLayout";
import {
  aabbGapXZ,
  aabbOverlap,
  COMPUTER_DESK_TOP_Y,
  MODEL_BOUNDS,
  worldAABBFromPlacement,
  type WorldAABB,
} from "./modelBounds";
import { FURNITURE_DIMS } from "./labFurnitureSystem";

export const PLACEMENT_REVISION = 10;

const BACK = 0;
const LEFT_BACK = 4;

export type WallFurniturePlacement = {
  id: string;
  segmentIndex: number;
  t: number;
  width: number;
  depth: number;
  height: number;
  anchor: WallAnchor;
};

export type ChairPlacement = {
  id: string;
  group: string;
  position: [number, number, number];
  rotationY: number;
  facesWorkstation: string;
};

export type FreeStandingHero = {
  id: string;
  position: [number, number, number];
  rotation: [number, number, number];
};

/** Central island — primary shared experiment surface. */
export const CENTRAL_BENCH = {
  id: "central-bench",
  position: [0, 0, 0.6] as [number, number, number],
  width: 2.65,
  depth: 1.45,
  height: 0.89,
  rotationY: 0,
  countertopY: 0.82,
};

function wallFurniture(
  id: string,
  segmentIndex: number,
  t: number,
  width: number,
  depth: number,
  height = 0.88,
): WallFurniturePlacement {
  return {
    id,
    segmentIndex,
    t,
    width,
    depth,
    height,
    anchor: wallAnchorFromSegment(segmentIndex, t, depth),
  };
}

/** Environment laboratory desk — computer sits on deskTopY, not floor. */
export const DRY_LAB_DESK = wallFurniture("dry-lab-desk", LEFT_BACK, 0.5, 1.85, 0.74, 0.85);

export const DESK_TOP_Y = FURNITURE_DIMS.deskTopY;

/** Computer group Y so internal desk surface aligns with environment desk top. */
export const COMPUTER_FLOOR_Y = DESK_TOP_Y - COMPUTER_DESK_TOP_Y;

/** Wet Lab — coherent workstation (cabinets + hood integrated). */
export const WET_LAB_WORKSTATION = wallFurniture(
  "wet-lab-workstation",
  BACK,
  0.195,
  2.45,
  0.62,
  1.48,
);

export const WET_LAB_UPPER = wallFurniture("wet-lab-upper", BACK, 0.09, 0.95, 0.32, 0.52);

/** Back-center tall storage — two modules with rhythm gap. */
export const TALL_STORAGE_A = wallFurniture("tall-storage-a", BACK, 0.435, 0.86, 0.52, 2.05);
export const TALL_STORAGE_B = wallFurniture("tall-storage-b", BACK, 0.515, 0.86, 0.52, 2.05);

/** Engineering side bench + tall cabinet (bioreactor remains floor-standing). */
export const ENGINEERING_BENCH = wallFurniture("engineering-bench", BACK, 0.655, 1.3, 0.58, 0.88);
export const ENGINEERING_TALL = wallFurniture("engineering-tall", BACK, 0.835, 0.82, 0.52, 2.05);

export const WALL_FURNITURE: WallFurniturePlacement[] = [
  DRY_LAB_DESK,
  WET_LAB_WORKSTATION,
  WET_LAB_UPPER,
  TALL_STORAGE_A,
  TALL_STORAGE_B,
  ENGINEERING_BENCH,
  ENGINEERING_TALL,
];

/** Modular cabinet count for Phase 3.10 acceptance. */
export const CABINET_MODULE_COUNT = {
  dryLabLower: 2,
  wetLabLower: 2,
  tallStorage: 2,
  engineeringLower: 2,
  engineeringTall: 1,
  upperCabinets: 1,
  total: 10,
} as const;

/** Free-standing bioreactor — floor hero in Engineering zone. */
export const BIOREACTOR_FLOOR: FreeStandingHero = {
  id: "device",
  position: [3.05, 0, -3.05],
  rotation: [0, 0, 0],
};

function chairFacingDesk(anchor: WallAnchor): number {
  return anchor.rotationY + Math.PI;
}

/** Functional furniture groups (semantic only — LAB_OBJECTS unchanged). */
export const DRY_LAB_GROUP = {
  id: "dry-lab",
  desk: DRY_LAB_DESK,
  deskTopY: DESK_TOP_Y,
  hasEnvironmentDesk: true as const,
  computer: {
    position: [
      DRY_LAB_DESK.anchor.position[0],
      COMPUTER_FLOOR_Y,
      DRY_LAB_DESK.anchor.position[2],
    ] as [number, number, number],
    rotation: [0, DRY_LAB_DESK.anchor.rotationY, 0] as [number, number, number],
  },
  chair: {
    id: "dry-lab-chair",
    position: localToWorldPosition(DRY_LAB_DESK.anchor, 0.05, DRY_LAB_DESK.depth * 0.5 + 0.62),
    rotationY: chairFacingDesk(DRY_LAB_DESK.anchor),
  },
};

export const WET_LAB_GROUP = {
  id: "wet-lab",
  workstation: WET_LAB_WORKSTATION,
  upper: WET_LAB_UPPER,
  chair: {
    id: "wet-lab-stool",
    position: localToWorldPosition(
      WET_LAB_WORKSTATION.anchor,
      0,
      WET_LAB_WORKSTATION.depth * 0.5 + 0.58,
    ),
    rotationY: chairFacingDesk(WET_LAB_WORKSTATION.anchor),
  },
};

export const CENTRAL_LAB_GROUP = {
  id: "central-lab",
  bench: CENTRAL_BENCH,
  chairs: [
    {
      id: "central-stool-front-right",
      position: [1.72, 0, 1.68] as [number, number, number],
      rotationY: -0.65,
    },
    {
      id: "central-stool-rear-left",
      position: [-1.72, 0, -0.4] as [number, number, number],
      rotationY: 0.35,
    },
  ] satisfies Omit<ChairPlacement, "group" | "facesWorkstation">[],
};

export const ENGINEERING_GROUP = {
  id: "engineering",
  bench: ENGINEERING_BENCH,
  tall: ENGINEERING_TALL,
  bioreactor: BIOREACTOR_FLOOR,
  chair: {
    id: "engineering-stool",
    position: localToWorldPosition(ENGINEERING_BENCH.anchor, -0.15, 0.58 * 0.5 + 0.56),
    rotationY: chairFacingDesk(ENGINEERING_BENCH.anchor),
  },
};

export const STORAGE_GROUP = {
  id: "storage",
  tallA: TALL_STORAGE_A,
  tallB: TALL_STORAGE_B,
};

export const CHAIR_PLACEMENTS: ChairPlacement[] = [
  {
    id: DRY_LAB_GROUP.chair.id,
    group: "dry-lab",
    position: DRY_LAB_GROUP.chair.position,
    rotationY: DRY_LAB_GROUP.chair.rotationY,
    facesWorkstation: "computer",
  },
  {
    id: WET_LAB_GROUP.chair.id,
    group: "wet-lab",
    position: WET_LAB_GROUP.chair.position,
    rotationY: WET_LAB_GROUP.chair.rotationY,
    facesWorkstation: "laminar-hood",
  },
  ...CENTRAL_LAB_GROUP.chairs.map((c) => ({
    id: c.id,
    group: "central-lab",
    position: c.position,
    rotationY: c.rotationY,
    facesWorkstation: "central-bench",
  })),
  {
    id: ENGINEERING_GROUP.chair.id,
    group: "engineering",
    position: ENGINEERING_GROUP.chair.position,
    rotationY: ENGINEERING_GROUP.chair.rotationY,
    facesWorkstation: "engineering-bench",
  },
];

/** Hero placements for LAB_OBJECTS import. */
export const HERO_PLACEMENTS = {
  microscope: {
    id: "microscope",
    category: "hero" as const,
    position: [CENTRAL_BENCH.position[0], 0, CENTRAL_BENCH.position[2]] as [
      number,
      number,
      number,
    ],
    rotation: [0, -0.12, 0] as [number, number, number],
  },
  computer: {
    id: "computer",
    category: "hero" as const,
    position: DRY_LAB_GROUP.computer.position,
    rotation: DRY_LAB_GROUP.computer.rotation,
  },
  device: {
    id: "device",
    category: "free-standing-hero" as const,
    position: BIOREACTOR_FLOOR.position,
    rotation: BIOREACTOR_FLOOR.rotation,
  },
  bookshelf: {
    id: "bookshelf",
    category: "hero" as const,
    position: localToWorldPosition(TALL_STORAGE_A.anchor, 0, TALL_STORAGE_A.depth * 0.12),
    rotation: [0, TALL_STORAGE_A.anchor.rotationY, 0] as [number, number, number],
  },
  researcher: {
    id: "researcher",
    category: "hero" as const,
    position: [-0.95, 0, 2.45] as [number, number, number],
    rotation: [0, -1.52, 0] as [number, number, number],
  },
};

export type WallAlignmentValidation = {
  id: string;
  insidePolygon: boolean;
  backFaceDistanceToWall: number;
  tangentAlignment: number;
  inwardAlignment: number;
  valid: boolean;
};

export type CollisionReport = {
  pair: string;
  overlaps: boolean;
  gapM: number;
};

function centralBenchCorners(): FootprintXZ[] {
  const [cx, , cz] = CENTRAL_BENCH.position;
  const hw = CENTRAL_BENCH.width * 0.5;
  const hd = CENTRAL_BENCH.depth * 0.5;
  return [
    [cx - hw, cz - hd],
    [cx + hw, cz - hd],
    [cx + hw, cz + hd],
    [cx - hw, cz + hd],
  ];
}

export function validateWallAlignment(item: WallFurniturePlacement): WallAlignmentValidation {
  const { anchor, width, depth } = item;
  const corners = furnitureFootprintCorners(anchor, width, depth);
  const insidePolygon = footprintInsideRoom(corners);
  const worldLocalX = worldAxisFromLocal(anchor.rotationY, 1, 0);
  const worldLocalZ = worldAxisFromLocal(anchor.rotationY, 0, 1);
  const tangent: FootprintXZ = [anchor.tangentX, anchor.tangentZ];
  const inward: FootprintXZ = [anchor.inwardX, anchor.inwardZ];
  const back = backFaceCenter(anchor, depth);
  const backFaceDistanceToWall = Math.hypot(
    back[0] - anchor.wallPoint[0],
    back[1] - anchor.wallPoint[1],
  );
  const valid =
    insidePolygon &&
    backFaceDistanceToWall <= 0.05 &&
    Math.abs(dotXZ(worldLocalX, tangent)) >= 0.99 &&
    dotXZ(worldLocalZ, inward) >= 0.99;
  return {
    id: item.id,
    insidePolygon,
    backFaceDistanceToWall,
    tangentAlignment: Math.abs(dotXZ(worldLocalX, tangent)),
    inwardAlignment: dotXZ(worldLocalZ, inward),
    valid,
  };
}

export function buildCollisionAABBs(): WorldAABB[] {
  const boxes: WorldAABB[] = [];

  for (const item of WALL_FURNITURE) {
    boxes.push(
      worldAABBFromPlacement(
        item.id,
        item.anchor.position,
        item.anchor.rotationY,
        item.width,
        item.depth,
        item.height,
      ),
    );
  }

  boxes.push(
    worldAABBFromPlacement(
      "central-bench",
      CENTRAL_BENCH.position,
      CENTRAL_BENCH.rotationY,
      CENTRAL_BENCH.width,
      CENTRAL_BENCH.depth,
      CENTRAL_BENCH.height,
    ),
  );

  boxes.push(
    worldAABBFromPlacement(
      "computer-workstation",
      DRY_LAB_GROUP.computer.position,
      DRY_LAB_GROUP.computer.rotation[1],
      MODEL_BOUNDS.computer.width,
      MODEL_BOUNDS.computer.depth,
      MODEL_BOUNDS.computer.height,
      MODEL_BOUNDS.computer.minY,
    ),
  );

  boxes.push(
    worldAABBFromPlacement(
      "bioreactor",
      BIOREACTOR_FLOOR.position,
      BIOREACTOR_FLOOR.rotation[1],
      MODEL_BOUNDS.bioreactor.width,
      MODEL_BOUNDS.bioreactor.depth,
      MODEL_BOUNDS.bioreactor.height,
    ),
  );

  for (const chair of CHAIR_PLACEMENTS) {
    boxes.push(
      worldAABBFromPlacement(
        chair.id,
        chair.position,
        chair.rotationY,
        MODEL_BOUNDS.labChair.width,
        MODEL_BOUNDS.labChair.depth,
        MODEL_BOUNDS.labChair.height,
      ),
    );
  }

  boxes.push(
    worldAABBFromPlacement(
      "researcher",
      HERO_PLACEMENTS.researcher.position,
      HERO_PLACEMENTS.researcher.rotation[1],
      0.55,
      0.45,
      1.75,
    ),
  );

  return boxes;
}

export function validateCollisions(): CollisionReport[] {
  const boxes = buildCollisionAABBs();
  const criticalPairs: [string, string, number][] = [
    ["bioreactor", "engineering-bench", 0.25],
    ["bioreactor", "central-bench", 0.2],
    ["dry-lab-chair", "central-bench", 0.15],
    ["dry-lab-chair", "dry-lab-desk", 0.08],
    ["computer-workstation", "dry-lab-desk", 0.02],
    ["computer-workstation", "engineering-bench", 0.1],
    ["researcher", "central-bench", 0.2],
    ["central-stool-front-right", "central-bench", 0.12],
    ["central-stool-rear-left", "central-bench", 0.12],
    ["wet-lab-stool", "central-bench", 0.15],
    ["engineering-stool", "bioreactor", 0.2],
  ];

  const byId = new Map(boxes.map((b) => [b.id, b]));
  return criticalPairs.map(([a, b, _minGap]) => {
    const boxA = byId.get(a)!;
    const boxB = byId.get(b)!;
    const gap = aabbGapXZ(boxA, boxB);
    return {
      pair: `${a} ↔ ${b}`,
      overlaps: aabbOverlap(boxA, boxB),
      gapM: gap,
    };
  });
}

export function validateFunctionalPlacement(): {
  wallAlignment: WallAlignmentValidation[];
  collisions: CollisionReport[];
  chairCount: number;
  allValid: boolean;
  circulation: {
    backAisle: number;
    leftAisle: number;
    rightAisle: number;
    frontClearance: number;
  };
  hasEnvironmentDesk: boolean;
  deskTopY: number;
  cabinetModuleCount: number;
} {
  const wallAlignment = WALL_FURNITURE.map(validateWallAlignment);
  const collisions = validateCollisions();

  const [cx, , cz] = CENTRAL_BENCH.position;
  const benchBackZ = cz - CENTRAL_BENCH.depth * 0.5;
  const benchFrontZ = cz + CENTRAL_BENCH.depth * 0.5;
  const benchLeftX = cx - CENTRAL_BENCH.width * 0.5;
  const benchRightX = cx + CENTRAL_BENCH.width * 0.5;

  const backFrontZ = Math.max(
    ...WALL_FURNITURE.filter((f) => f.segmentIndex === BACK).flatMap((f) =>
      furnitureFootprintCorners(f.anchor, f.width, f.depth).map((c) => c[1]),
    ),
  );

  const computerCorners = furnitureFootprintCorners(
    {
      position: DRY_LAB_GROUP.computer.position,
      rotationY: DRY_LAB_GROUP.computer.rotation[1],
    },
    MODEL_BOUNDS.computer.width,
    MODEL_BOUNDS.computer.depth,
  );
  const dryRightX = Math.max(...computerCorners.map((c) => c[0]));

  const bioreactorEng = collisions.find((c) => c.pair.includes("bioreactor") && c.pair.includes("engineering"));
  const noCriticalOverlap = !collisions.some((c) => c.overlaps);
  const bioreactorClear = bioreactorEng ? bioreactorEng.gapM >= 0.25 : true;

  const allValid =
    wallAlignment.every((w) => w.valid) &&
    footprintInsideRoom(centralBenchCorners()) &&
    noCriticalOverlap &&
    bioreactorClear &&
    benchBackZ - backFrontZ >= 0.95 &&
    benchLeftX - dryRightX >= 0.85;

  return {
    wallAlignment,
    collisions,
    chairCount: CHAIR_PLACEMENTS.length,
    allValid,
    circulation: {
      backAisle: benchBackZ - backFrontZ,
      leftAisle: benchLeftX - dryRightX,
      rightAisle: maxPolygonXAtZ(benchBackZ) - benchRightX,
      frontClearance: FLOOR_FOOTPRINT[4][1] - benchFrontZ,
    },
    hasEnvironmentDesk: DRY_LAB_GROUP.hasEnvironmentDesk,
    deskTopY: DESK_TOP_Y,
    cabinetModuleCount: CABINET_MODULE_COUNT.total,
  };
}

function maxPolygonXAtZ(z: number): number {
  let maxX = -Infinity;
  for (let i = 0; i < FLOOR_FOOTPRINT.length; i += 1) {
    const [x0, z0] = FLOOR_FOOTPRINT[i];
    const [x1, z1] = FLOOR_FOOTPRINT[(i + 1) % FLOOR_FOOTPRINT.length];
    if ((z >= Math.min(z0, z1) && z <= Math.max(z0, z1)) || Math.abs(z1 - z0) < 1e-6) {
      const t = Math.abs(z1 - z0) < 1e-6 ? 0.5 : (z - z0) / (z1 - z0);
      maxX = Math.max(maxX, x0 + t * (x1 - x0));
    }
  }
  return maxX;
}

/** @deprecated use validateFunctionalPlacement */
export function validatePlacements() {
  const r = validateFunctionalPlacement();
  return {
    furniture: r.wallAlignment,
    centralBench: { id: "central-bench", insidePolygon: true, corners: centralBenchCorners() },
    allValid: r.allValid,
    circulation: r.circulation,
  };
}

if (import.meta.env?.DEV) {
  const report = validateFunctionalPlacement();
  if (!report.allValid) {
    console.warn("[roomPlacement] functional placement validation failed:", report);
  }
}
