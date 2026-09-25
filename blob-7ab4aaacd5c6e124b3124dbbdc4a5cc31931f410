import { useLayoutEffect, useMemo } from "react";
import {
  COMPUTER_REVISION,
  createComputerModel,
  type ComputerModelOptions,
  type ComputerStats,
} from "./createComputerModel";

type Props = {
  studio?: boolean;
  source?: "procedural" | "gltf";
  gltfUrl?: string;
  options?: ComputerModelOptions;
};

/**
 * R3F entry for the Dry Lab workstation.
 * gltf path is reserved; missing assets fall back to procedural.
 */
export function ComputerModel({
  studio = false,
  source = "procedural",
  gltfUrl,
  options,
}: Props) {
  const resolvedSource = source === "gltf" && gltfUrl ? "gltf" : "procedural";

  const { group, stats } = useMemo(() => {
    if (resolvedSource === "gltf") {
      // No GLB in repo yet — keep InteractiveObject stable.
      return createComputerModel(options);
    }
    return createComputerModel(options);
  }, [COMPUTER_REVISION, resolvedSource, options?.includeHeadphones, options?.style]);

  useLayoutEffect(() => {
    const host = window as Window & { __COMPUTER_STATS?: ComputerStats };
    host.__COMPUTER_STATS = stats;
    return () => {
      delete host.__COMPUTER_STATS;
    };
  }, [stats]);

  void studio;
  return <primitive object={group} position={[0, 0, 0]} />;
}
