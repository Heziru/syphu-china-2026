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

export const PLACEMENT_REVISION = 8;

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

/** Central island — sole free-standing piece; long edge ≈ world X. */
export const CENTRAL_BENCH: FreeStandingPlacement & { height: number } = {
  id: "central-bench",
  category: "free-standing",
  position: [0, 0, 0.6],
  width: 2.65,
  depth: 1.45,
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

/** Back-left Wet Lab strip — lower bench segment. */
export const WET_LAB_BENCH = wallFurniture("wet-lab-bench", BACK, 0.135, 1.12, 0.58);

/** Laminar hood — continues Wet Lab strip along same back wall. */
export const LAMINAR_HOOD_BLOCKOUT = {
  ...wallFurniture("laminar-hood", BACK, 0.305, 1.45, 0.74),
  displayWidth: 1.45,
  displayDepth: 0.74,
  displayHeight: 1.42,
};

/** Back-center built-in storage. */
export const STORAGE_SHELF = wallFurniture("storage-shelf", BACK, 0.52, 1.02, 0.4);

/** Back-right Engineering strip. */
export const ENGINEERING_BENCH = wallFurniture("engineering-bench", BACK, 0.795, 1.52, 0.6);

/** Left-wall Dry Lab strip. */
export const DRY_LAB_BENCH = wallFurniture("dry-lab-bench", LEFT_BACK, 0.5, 2.32, 0.72);

export const WALL_FURNITURE: WallFurniturePlacement[] = [
  WET_LAB_BENCH,
  LAMINAR_HOOD_BLOCKOUT,
  STORAGE_SHELF,
  ENGINEERING_BENCH,
  DRY_LAB_BENCH,
];

/** Hero positions derived from wall-local coordinates on workstation surfaces. */
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
    position: localToWorldPosition(DRY_LAB_BENCH.anchor, 0.08, DRY_LAB_BENCH.depth * 0.38),
    rotation: [0, DRY_LAB_BENCH.anchor.rotationY + 0.12, 0] as [number, number, number],
  },
  device: {
    id: "device",
    category: "hero" as const,
    position: localToWorldPosition(
      ENGINEERING_BENCH.anchor,
      ENGINEERING_BENCH.width * 0.06,
      ENGINEERING_BENCH.depth * 0.38,
    ),
    rotation: [0, ENGINEERING_BENCH.anchor.rotationY, 0] as [number, number, number],
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
    position: [-1.35, 0, 2.35] as [number, number, number],
    rotation: [0, -1.58, 0] as [number, number, number],
  },
};

export const DRY_LAB_CHAIR = {
  position: localToWorldPosition(DRY_LAB_BENCH.anchor, -0.28, DRY_LAB_BENCH.depth * 0.78),
  rotationY: DRY_LAB_BENCH.anchor.rotationY + 0.82,
};

export type WallAlignmentValidation = {
  id: string;
  insidePolygon: boolean;
  backFaceDistanceToWall: number;
  tangentAlignment: number;
  inwardAlignment: number;
  valid: boolean;
  corners: FootprintXZ[];
  backFace: FootprintXZ;
  frontFace: FootprintXZ;
};

export type CirculationReport = {
  backAisle: number;
  leftAisle: number;
  rightAisle: number;
  frontClearance: number;
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

  const tangentAlignment = Math.abs(dotXZ(worldLocalX, tangent));
  const inwardAlignment = dotXZ(worldLocalZ, inward);

  const back = backFaceCenter(anchor, depth);
  const backFaceDistanceToWall = Math.hypot(
    back[0] - anchor.wallPoint[0],
    back[1] - anchor.wallPoint[1],
  );

  const valid =
    insidePolygon &&
    backFaceDistanceToWall <= 0.05 &&
    tangentAlignment >= 0.99 &&
    inwardAlignment >= 0.99;

  return {
    id: item.id,
    insidePolygon,
    backFaceDistanceToWall,
    tangentAlignment,
    inwardAlignment,
    valid,
    corners,
    backFace: back,
    frontFace: [
      anchor.position[0] + anchor.inwardX * (depth * 0.5),
      anchor.position[2] + anchor.inwardZ * (depth * 0.5),
    ],
  };
}

export function validatePlacements(): {
  furniture: WallAlignmentValidation[];
  centralBench: { id: string; insidePolygon: boolean; corners: FootprintXZ[] };
  allValid: boolean;
  circulation: CirculationReport;
} {
  const furniture = WALL_FURNITURE.map(validateWallAlignment);

  const centralCorners = centralBenchCorners();
  const centralBench = {
    id: "central-bench",
    insidePolygon: footprintInsideRoom(centralCorners),
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

  const dryCorners = furnitureFootprintCorners(
    DRY_LAB_BENCH.anchor,
    DRY_LAB_BENCH.width,
    DRY_LAB_BENCH.depth,
  );
  const dryRightX = Math.max(...dryCorners.map((c) => c[0]));

  const circulation: CirculationReport = {
    backAisle: benchBackZ - backFrontZ,
    leftAisle: benchLeftX - dryRightX,
    rightAisle: maxPolygonXAtZ(benchBackZ) - benchRightX,
    frontClearance: FLOOR_FOOTPRINT[4][1] - benchFrontZ,
  };

  const allValid =
    furniture.every((f) => f.valid) &&
    centralBench.insidePolygon &&
    circulation.backAisle >= 0.95 &&
    circulation.leftAisle >= 0.85 &&
    circulation.rightAisle >= 0.85;

  return { furniture, centralBench, allValid, circulation };
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

/** Local-axis audit for Phase 3.8 documentation. */
export const FURNITURE_AXIS_AUDIT = {
  "dry-lab-bench": {
    localPlusX: "width along left wall tangent",
    localPlusZ: "depth into room (front)",
    back: "-Z flush to wall",
    front: "+Z faces room",
    boxSize: "[width, height, depth]",
  },
  "wet-lab-bench": {
    localPlusX: "width along back wall tangent",
    localPlusZ: "depth into room (front)",
    back: "-Z flush to back wall",
    front: "+Z countertop faces room",
    boxSize: "[width, height, depth]",
  },
  "laminar-hood": {
    localPlusX: "hood width along back wall",
    localPlusZ: "depth; opening at +Z faces room",
    back: "-Z on wet-lab strip back plane",
    front: "+Z hood opening",
    boxSize: "[width, height, depth]",
  },
  "storage-shelf": {
    localPlusX: "width along back wall",
    localPlusZ: "depth into room",
    back: "-Z flush to back wall",
    front: "+Z faces room",
    boxSize: "[width, height, depth]",
  },
  "engineering-bench": {
    localPlusX: "width along back wall",
    localPlusZ: "depth into room",
    back: "-Z flush to back wall",
    front: "+Z bench surface; bioreactor sits on +Z",
    boxSize: "[width, height, depth]",
  },
  "central-bench": {
    localPlusX: "width (left-right, 2.65 m)",
    localPlusZ: "depth (front-back, 1.45 m)",
    back: "-Z toward back wall",
    front: "+Z toward open front",
    boxSize: "[width, height, depth]",
  },
  computer: {
    parent: "dry-lab-bench surface",
    placement: "local (+0.08, depth×0.38) on desk",
    rotation: "inherits desk rotationY + 0.12",
  },
  bioreactor: {
    parent: "engineering-bench surface",
    placement: "local (width×0.06, depth×0.38) on bench",
    rotation: "inherits engineering rotationY",
  },
} as const;

if (import.meta.env?.DEV) {
  const report = validatePlacements();
  if (!report.allValid) {
    console.warn("[roomPlacement] wall alignment validation failed:", report);
  }
}
