import { useLayoutEffect, useMemo } from "react";
import {
  RESEARCHER_REVISION,
  createResearcherModel,
  type ResearcherModelOptions,
  type ResearcherStats,
} from "./createResearcherModel";

type Props = {
  studio?: boolean;
  source?: "procedural" | "gltf";
  gltfUrl?: string;
  options?: ResearcherModelOptions;
};

/**
 * R3F entry for the laboratory researcher (runtime LAB id: researcher).
 * gltf path is reserved; missing assets fall back to procedural.
 */
export function ResearcherModel({
  studio = false,
  source = "procedural",
  gltfUrl,
  options,
}: Props) {
  const resolvedSource = source === "gltf" && gltfUrl ? "gltf" : "procedural";

  const { group, stats } = useMemo(() => {
    if (resolvedSource === "gltf") {
      return createResearcherModel(options);
    }
    return createResearcherModel(options);
  }, [RESEARCHER_REVISION, resolvedSource, options?.style]);

  useLayoutEffect(() => {
    const host = window as Window & { __RESEARCHER_STATS?: ResearcherStats };
    host.__RESEARCHER_STATS = stats;
    return () => {
      delete host.__RESEARCHER_STATS;
    };
  }, [stats]);

  void studio;
  return <primitive object={group} position={[0, 0, 0]} />;
}
