import { createMicroscopeModel, type MicroscopeBuild } from "../laboratory/microscope/createMicroscopeModel";
import type { LabObjectId, ModelSource } from "../types/laboratory";
import type { LabStationContract, ProceduralModelBuild } from "../types/labStation";

export type LabModelRegistryEntry = Pick<
  LabStationContract<ProceduralModelBuild | MicroscopeBuild>,
  "modelSource" | "createModel" | "gltfUrl"
> & {
  id: LabObjectId;
};

/**
 * Mesh factories live here — not inside LAB_OBJECTS — so data stays serializable
 * and InteractiveObject never imports Three.js factories.
 */
export const MODEL_REGISTRY: Record<LabObjectId, LabModelRegistryEntry> = {
  computer: {
    id: "computer",
    modelSource: "placeholder",
  },
  microscope: {
    id: "microscope",
    modelSource: "procedural",
    // Phase 1: keep zero-arg export. Phase 2 will pass MicroscopeModelOptions.
    createModel: () => createMicroscopeModel(),
  },
  researcher: {
    id: "researcher",
    modelSource: "placeholder",
  },
  bookshelf: {
    id: "bookshelf",
    modelSource: "placeholder",
  },
  device: {
    id: "device",
    modelSource: "placeholder",
  },
};

export function getModelEntry(id: LabObjectId): LabModelRegistryEntry {
  return MODEL_REGISTRY[id];
}

export function resolveModelSource(id: LabObjectId, fallback?: ModelSource): ModelSource {
  return MODEL_REGISTRY[id]?.modelSource ?? fallback ?? "placeholder";
}
