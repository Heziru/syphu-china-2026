import { createBioreactorModel, type BioreactorBuild } from "../laboratory/bioreactor/createBioreactorModel";
import { createComputerModel, type ComputerBuild } from "../laboratory/computer/createComputerModel";
import { createMicroscopeModel, type MicroscopeBuild } from "../laboratory/microscope/createMicroscopeModel";
import type { LabObjectId, ModelSource } from "../types/laboratory";
import type { LabStationContract, ProceduralModelBuild } from "../types/labStation";

export type LabModelRegistryEntry = Pick<
  LabStationContract<ProceduralModelBuild | MicroscopeBuild | ComputerBuild | BioreactorBuild>,
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
    modelSource: "procedural",
    createModel: () => createComputerModel(),
  },
  microscope: {
    id: "microscope",
    modelSource: "procedural",
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
    modelSource: "procedural",
    createModel: () => createBioreactorModel(),
  },
};

export function getModelEntry(id: LabObjectId): LabModelRegistryEntry {
  return MODEL_REGISTRY[id];
}

export function resolveModelSource(id: LabObjectId, fallback?: ModelSource): ModelSource {
  return MODEL_REGISTRY[id]?.modelSource ?? fallback ?? "placeholder";
}
