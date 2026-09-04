import { useLayoutEffect, useMemo } from "react";
import {
  createComputerModel,
  type ComputerModelOptions,
  type ComputerStats,
} from "./createComputerModel";

type Props = {
  studio?: boolean;
  source?: "procedural" | "gltf";
  gltfUrl?: string;
  options?: ComputerModelOptions;
  tabletop?: boolean;
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
  tabletop = false,
}: Props) {
  const resolvedSource = source === "gltf" && gltfUrl ? "gltf" : "procedural";

  const { group, stats } = useMemo(() => {
    if (resolvedSource === "gltf") {
      // No GLB in repo yet — keep InteractiveObject stable.
      return createComputerModel(options, !tabletop);
    }
    return createComputerModel(options, !tabletop);
  }, [resolvedSource, options, tabletop]);

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
