import { useLayoutEffect, useMemo } from "react";
import {
  createBioreactorModel,
  type BioreactorModelOptions,
  type BioreactorStats,
} from "./createBioreactorModel";

type Props = {
  studio?: boolean;
  source?: "procedural" | "gltf";
  gltfUrl?: string;
  options?: BioreactorModelOptions;
};

/**
 * R3F entry for the desktop bioreactor (runtime LAB id: device).
 * gltf path is reserved; missing assets fall back to procedural.
 */
export function BioreactorModel({
  studio = false,
  source = "procedural",
  gltfUrl,
  options,
}: Props) {
  const resolvedSource = source === "gltf" && gltfUrl ? "gltf" : "procedural";

  const { group, stats } = useMemo(() => {
    if (resolvedSource === "gltf") {
      return createBioreactorModel(options);
    }
    return createBioreactorModel(options);
  }, [resolvedSource, options]);

  useLayoutEffect(() => {
    const host = window as Window & { __BIOREACTOR_STATS?: BioreactorStats };
    host.__BIOREACTOR_STATS = stats;
    return () => {
      delete host.__BIOREACTOR_STATS;
    };
  }, [stats]);

  void studio;
  return <primitive object={group} position={[0, 0, 0]} />;
}
