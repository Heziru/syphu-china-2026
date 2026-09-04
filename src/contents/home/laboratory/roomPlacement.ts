import {
  FLOOR_FOOTPRINT,
  furnitureFootprintCorners,
  footprintInsideRoom,
  type FootprintXZ,
  type WallAnchor,
  wallAnchorFromSegment,
} from "./roomLayout";

export const PLACEMENT_REVISION = 7;

/** Wall-anchored furniture specs (segment index + t along wall). */
const BACK = 0;
const LEFT_BACK = 4;

export type WallFurniturePlacement = {
  id: string;
  category: "wall-anchored";
  segmentIndex: number;
  t: number;
  width: number;
  depth: number;
  anchor: WallAnchor;
};

export type FreeStandingPlacement = {
  id: string;
  category: "free-standing";
  position: [number, number, number];
  width: number;
  depth: number;
  rotationY: number;
};

export type HeroPlacement = {
  id: string;
  category: "hero";
  position: [number, number, number];
  rotation: [number, number, number];
};

/** Central island — only free-standing workstation. */
export const CENTRAL_BENCH: FreeStandingPlacement & { height: number } = {
  id: "central-bench",
  category: "free-standing",
  position: [0, 0, 0.52],
  width: 2.72,
  depth: 1.48,
  height: 0.89,
  rotationY: 0,
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
    category: "wall-anchored",
    segmentIndex,
    t,
    width,
    depth,
    anchor: wallAnchorFromSegment(segmentIndex, t, depth),
  };
}

/** Wet Lab lower cabinet — back-left. */
export const WET_LAB_BENCH = wallFurniture("wet-lab-bench", BACK, 0.14, 1.45, 0.56);

/** Laminar hood blockout envelope — back-left, horizontal clean bench. */
export const LAMINAR_HOOD_BLOCKOUT = {
  ...wallFurniture("laminar-hood", BACK, 0.3, 1.38, 0.72),
  displayWidth: 1.38,
  displayDepth: 0.72,
  displayHeight: 1.48,
};

/** Storage / bookshelf — back center. */
export const STORAGE_SHELF = wallFurniture("storage-shelf", BACK, 0.52, 1.05, 0.42);

/** Engineering bench — back-right (trimmed width for right circulation). */
export const ENGINEERING_BENCH = wallFurniture("engineering-bench", BACK, 0.77, 1.48, 0.62);

/** Dry Lab desk — left angled wall. */
export const DRY_LAB_BENCH = wallFurniture("dry-lab-bench", LEFT_BACK, 0.5, 2.28, 0.78);

function offsetFromAnchor(
  anchor: WallAnchor,
  alongTangent: number,
  alongInward: number,
): [number, number, number] {
  const [cx, , cz] = anchor.position;
  return [
    cx + anchor.tangentX * alongTangent + anchor.inwardX * alongInward,
    0,
    cz + anchor.tangentZ * alongTangent + anchor.inwardZ * alongInward,
  ];
}

/** Hero positions derived from architectural anchors. */
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
    position: offsetFromAnchor(DRY_LAB_BENCH.anchor, 0.15, DRY_LAB_BENCH.depth * 0.22),
    rotation: [0, DRY_LAB_BENCH.anchor.rotationY + 0.22, 0] as [number, number, number],
  },
  device: {
    id: "device",
    category: "hero" as const,
    position: offsetFromAnchor(ENGINEERING_BENCH.anchor, 0, ENGINEERING_BENCH.depth * 0.32),
    rotation: [0, ENGINEERING_BENCH.anchor.rotationY + 0.05, 0] as [number, number, number],
  },
  bookshelf: {
    id: "bookshelf",
    category: "hero" as const,
    position: [
      STORAGE_SHELF.anchor.position[0],
      0,
      STORAGE_SHELF.anchor.position[2] + STORAGE_SHELF.depth * 0.08,
    ] as [number, number, number],
    rotation: [0, STORAGE_SHELF.anchor.rotationY, 0] as [number, number, number],
  },
  researcher: {
    id: "researcher",
    category: "hero" as const,
    position: [-1.35, 0, 2.35] as [number, number, number],
    rotation: [0, -1.58, 0] as [number, number, number],
  },
};

export const DRY_LAB_CHAIR = {
  position: offsetFromAnchor(DRY_LAB_BENCH.anchor, -0.35, DRY_LAB_BENCH.depth * 0.72),
  rotationY: DRY_LAB_BENCH.anchor.rotationY + 0.95,
};

export const WALL_FURNITURE: WallFurniturePlacement[] = [
  WET_LAB_BENCH,
  LAMINAR_HOOD_BLOCKOUT,
  STORAGE_SHELF,
  ENGINEERING_BENCH,
  DRY_LAB_BENCH,
];

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

export type PlacementValidation = {
  id: string;
  insideRoom: boolean;
  corners: FootprintXZ[];
};

export type CirculationReport = {
  backAisle: number;
  leftAisle: number;
  rightAisle: number;
  frontClearance: number;
};

export function validatePlacements(): {
  furniture: PlacementValidation[];
  centralBench: PlacementValidation;
  allInside: boolean;
  circulation: CirculationReport;
} {
  const furniture = WALL_FURNITURE.map((item) => {
    const corners = furnitureFootprintCorners(item.anchor, item.width, item.depth);
    return { id: item.id, insideRoom: footprintInsideRoom(corners), corners };
  });

  const centralCorners = centralBenchCorners();
  const centralBench = {
    id: "central-bench",
    insideRoom: footprintInsideRoom(centralCorners),
    corners: centralCorners,
  };

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

  const sampleZ = benchBackZ;
  const rightBoundaryX = maxPolygonXAtZ(sampleZ);

  const dryCorners = furnitureFootprintCorners(
    DRY_LAB_BENCH.anchor,
    DRY_LAB_BENCH.width,
    DRY_LAB_BENCH.depth,
  );
  const dryRightX = Math.max(...dryCorners.map((c) => c[0]));

  const circulation: CirculationReport = {
    backAisle: benchBackZ - backFrontZ,
    leftAisle: benchLeftX - dryRightX,
    rightAisle: rightBoundaryX - benchRightX,
    frontClearance: FLOOR_FOOTPRINT[4][1] - benchFrontZ,
  };

  const allInside =
    furniture.every((f) => f.insideRoom) &&
    centralBench.insideRoom &&
    circulation.backAisle >= 0.95 &&
    circulation.leftAisle >= 0.85 &&
    circulation.rightAisle >= 0.85;

  return { furniture, centralBench, allInside, circulation };
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

/** Coordinate table for top-down inspection (no production camera change). */
export const PLACEMENT_COORDINATE_TABLE = [
  ...WALL_FURNITURE.map((f) => ({
    id: f.id,
    type: "wall-anchored" as const,
    position: f.anchor.position,
    rotationY: f.anchor.rotationY,
    width: f.width,
    depth: f.depth,
  })),
  {
    id: "central-bench",
    type: "free-standing" as const,
    position: CENTRAL_BENCH.position,
    rotationY: 0,
    width: CENTRAL_BENCH.width,
    depth: CENTRAL_BENCH.depth,
  },
  ...Object.values(HERO_PLACEMENTS).map((h) => ({
    id: h.id,
    type: "hero" as const,
    position: h.position,
    rotationY: h.rotation[1],
    width: 0,
    depth: 0,
  })),
];

if (import.meta.env?.DEV) {
  const report = validatePlacements();
  if (!report.allInside) {
    console.warn("[roomPlacement] layout validation failed:", report);
  }
}
