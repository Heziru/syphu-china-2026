import type { Group } from "three";
import type { ChapterDef } from "./laboratory";
import type {
  LabObjectCategory,
  LabObjectDef,
  LabObjectId,
  LabObjectMetadata,
  ModelSource,
} from "./laboratory";

/** Hit volume used by InteractiveObject (unchanged consumer). */
export type LabStationHitbox = {
  size: [number, number, number];
  offset: [number, number, number];
};

/**
 * Unified contract for future lab stations (computer, bioreactor, researcher, …).
 * Runtime wiring stays: LabObjectDef + CHAPTERS + modelRegistry → InteractiveObject.
 */
export type LabStationContract<TBuild = unknown> = {
  id: LabObjectId;
  category: LabObjectCategory;
  route: string;
  modelSource: ModelSource;
  createModel?: () => TBuild;
  hitbox: LabStationHitbox;
  metadata: LabObjectMetadata;
  /** Optional GLB/GLTF URL when modelSource is "gltf". */
  gltfUrl?: string;
};

/** Procedural microscope factory options (geometry phase will honor these). */
export type MicroscopeModelOptions = {
  includeIlluminator?: boolean;
  style?: "concept" | "legacy";
};

export const DEFAULT_MICROSCOPE_OPTIONS: Required<MicroscopeModelOptions> = {
  includeIlluminator: true,
  style: "concept",
};

export type ProceduralModelBuild = {
  group: Group;
  stats?: unknown;
  materials?: unknown[];
};

/** Adapt scene def + chapter into the unified contract (no createModel). */
export function toStationContract(
  def: LabObjectDef,
  chapter: ChapterDef,
): Omit<LabStationContract, "createModel" | "gltfUrl"> {
  return {
    id: def.id,
    category: def.category,
    route: def.metadata.route || chapter.path,
    modelSource: def.modelSource,
    hitbox: { size: def.hitSize, offset: def.hitOffset },
    metadata: def.metadata,
  };
}

/** Fail fast in dev if metadata.route drifts from CHAPTERS. */
export function assertMetadataRoute(def: LabObjectDef, chapter: ChapterDef): void {
  if (def.metadata.route !== chapter.path) {
    throw new Error(
      `Lab object "${def.id}" metadata.route (${def.metadata.route}) !== chapter.path (${chapter.path})`,
    );
  }
  if (def.metadata.id !== def.id) {
    throw new Error(`Lab object "${def.id}" metadata.id mismatch (${def.metadata.id})`);
  }
}
