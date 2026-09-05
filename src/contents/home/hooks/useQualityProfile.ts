import { useEffect, useState } from "react";
import type { QualityTier } from "../types/laboratory";

export function useQualityProfile(): {
  tier: QualityTier;
  dpr: number;
  shadows: boolean;
  mobile: boolean;
} {
  const [tier, setTier] = useState<QualityTier>(() => detectTier());

  useEffect(() => {
    const onResize = () => setTier(detectTier());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const mobile = tier !== "desktop";
  return {
    tier,
    dpr: tier === "desktop" ? 1.75 : tier === "mobile" ? 1.5 : 1,
    shadows: tier === "desktop",
    mobile,
  };
}

function detectTier(): QualityTier {
  if (typeof window === "undefined") return "desktop";
  const narrow = window.matchMedia("(max-width: 768px)").matches;
  const cores = navigator.hardwareConcurrency || 4;
  const saveData =
    "connection" in navigator &&
    (navigator as Navigator & { connection?: { saveData?: boolean } })
      .connection?.saveData;
  if (saveData || (cores <= 4 && narrow)) return "low";
  if (narrow) return "mobile";
  return "desktop";
}
