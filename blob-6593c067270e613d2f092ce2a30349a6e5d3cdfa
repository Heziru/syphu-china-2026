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
  MODEL_BOUNDS,
  worldAABBFromPlacement,
  type WorldAABB,
} from "./modelBounds";

export const PLACEMENT_REVISION = 9;

const BACK = 0;
const LEFT_BACK = 4;

export type WallFurniturePlacement = {
  id: string;
  segmentIndex: number;
  t: number;
  width: number;
  depth: number;
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
): WallFurniturePlacement {
  return {
    id,
    segmentIndex,
    t,
    width,
    depth,
    anchor: wallAnchorFromSegment(segmentIndex, t, depth),
  };
}

/** Computer model includes desk platform — no separate blockout desk. */
export const DRY_LAB_COMPUTER_ANCHOR = wallAnchorFromSegment(
  LEFT_BACK,
  0.5,
  MODEL_BOUNDS.computer.depth,
);

/** Wet Lab — unified back-left strip (bench + hood share back plane). */
export const WET_LAB_BENCH = wallFurniture("wet-lab-bench", BACK, 0.135, 1.12, 0.58);

export const LAMINAR_HOOD_BLOCKOUT = {
  ...wallFurniture("laminar-hood", BACK, 0.305, 1.45, 0.74),
  displayWidth: 1.45,
  displayDepth: 0.74,
  displayHeight: 1.42,
};

export const STORAGE_SHELF = wallFurniture("storage-shelf", BACK, 0.52, 1.02, 0.4);

/** Engineering bench beside (not under) the floor-standing bioreactor. */
export const ENGINEERING_BENCH = wallFurniture("engineering-bench", BACK, 0.66, 1.22, 0.58);

export const WALL_FURNITURE: WallFurniturePlacement[] = [
  WET_LAB_BENCH,
  LAMINAR_HOOD_BLOCKOUT,
  STORAGE_SHELF,
  ENGINEERING_BENCH,
];

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
  /** Production computer asset = desk + monitor + laptop (no blockout desk). */
  usesBuiltInDesk: true as const,
  anchor: DRY_LAB_COMPUTER_ANCHOR,
  computer: {
    position: [
      DRY_LAB_COMPUTER_ANCHOR.position[0],
      0,
      DRY_LAB_COMPUTER_ANCHOR.position[2],
    ] as [number, number, number],
    rotation: [0, DRY_LAB_COMPUTER_ANCHOR.rotationY, 0] as [number, number, number],
  },
  chair: {
    id: "dry-lab-chair",
    position: localToWorldPosition(
      DRY_LAB_COMPUTER_ANCHOR,
      0.05,
      MODEL_BOUNDS.computer.depth * 0.5 + 0.62,
    ),
    rotationY: chairFacingDesk(DRY_LAB_COMPUTER_ANCHOR),
  },
};

export const WET_LAB_GROUP = {
  id: "wet-lab",
  bench: WET_LAB_BENCH,
  hood: LAMINAR_HOOD_BLOCKOUT,
  chair: {
    id: "wet-lab-stool",
    position: localToWorldPosition(LAMINAR_HOOD_BLOCKOUT.anchor, 0, 0.74 * 0.5 + 0.58),
    rotationY: chairFacingDesk(LAMINAR_HOOD_BLOCKOUT.anchor),
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
  bioreactor: BIOREACTOR_FLOOR,
  chair: {
    id: "engineering-stool",
    position: localToWorldPosition(ENGINEERING_BENCH.anchor, -0.15, 0.58 * 0.5 + 0.56),
    rotationY: chairFacingDesk(ENGINEERING_BENCH.anchor),
  },
};

export const STORAGE_GROUP = {
  id: "storage",
  shelf: STORAGE_SHELF,
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
    position: localToWorldPosition(STORAGE_SHELF.anchor, 0, STORAGE_SHELF.depth * 0.12),
    rotation: [0, STORAGE_SHELF.anchor.rotationY, 0] as [number, number, number],
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
        0.88,
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
    ["dry-lab-chair", "computer-workstation", 0.05],
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
  computerUsesBuiltInDesk: boolean;
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
    computerUsesBuiltInDesk: DRY_LAB_GROUP.usesBuiltInDesk,
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
