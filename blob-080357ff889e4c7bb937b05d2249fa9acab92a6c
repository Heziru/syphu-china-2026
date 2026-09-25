import { useLayoutEffect, useMemo } from "react";
import {
  COMPUTER_REVISION,
  createComputerModel,
  type ComputerModelOptions,
  type ComputerStats,
} from "./createComputerModel";

type Props = {
  /** Studio origin for future ?labReview=computer. */
  studio?: boolean;
  options?: ComputerModelOptions;
};

/**
 * R3F entry for the Dry Lab workstation.
 * Swap internals to GLB later via options.source without changing InteractiveObject.
 */
export function ComputerModel({ studio = false, options }: Props) {
  const { group, stats } = useMemo(() => createComputerModel(options), [COMPUTER_REVISION]);

  useLayoutEffect(() => {
    const host = window as Window & { __COMPUTER_STATS?: ComputerStats };
    host.__COMPUTER_STATS = stats;
    return () => {
      delete host.__COMPUTER_STATS;
    };
  }, [stats]);

  // Floor-standing desk under InteractiveObject transform (unlike bench-top microscope).
  void studio;
  return <primitive object={group} position={[0, 0, 0]} />;
}
