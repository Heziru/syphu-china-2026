import { Canvas } from "@react-three/fiber";
import { useEffect } from "react";
import { ACESFilmicToneMapping, SRGBColorSpace } from "three";
import { useQualityProfile } from "../hooks/useQualityProfile";
import { useLaboratoryStore } from "../store/laboratoryStore";
import type { LabReviewAsset } from "./labReview";
import { LaboratoryScene } from "./LaboratoryScene";

type Props = {
  reduced: boolean;
  paused: boolean;
  onNavigate: (path: string) => void;
  onContextLost: () => void;
  review?: boolean;
  reviewAsset?: LabReviewAsset | null;
  reviewView?: "ref" | "side" | "back";
};

export default function LaboratoryCanvas({
  reduced,
  paused,
  onNavigate,
  onContextLost,
  review = false,
  reviewAsset = null,
  reviewView = "ref",
}: Props) {
  const { dpr, shadows, mobile } = useQualityProfile();
  const phase = useLaboratoryStore((s) => s.phase);
  const setPhase = useLaboratoryStore((s) => s.setPhase);

  useEffect(() => {
    if (phase === "loading") setPhase("entering");
  }, [phase, setPhase]);

  return (
    <Canvas
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      className="lab-canvas"
      dpr={dpr}
      shadows={shadows ? "variance" : false}
      frameloop={paused ? "never" : "always"}
      camera={{ fov: review ? 28 : mobile ? 42 : 34, near: 0.1, far: 80 }}
      gl={{
        antialias: true,
        powerPreference: "high-performance",
        alpha: false,
      }}
      onCreated={({ gl }) => {
        gl.toneMapping = ACESFilmicToneMapping;
        gl.toneMappingExposure = review ? 1 : 1.05;
        gl.outputColorSpace = SRGBColorSpace;
        gl.setClearColor(review ? "#F4F5F0" : "#E9E9DD", 1);
        gl.domElement.addEventListener("webglcontextlost", (event) => {
          event.preventDefault();
          onContextLost();
        });
      }}
    >
      <LaboratoryScene
        mobile={mobile}
        shadows={shadows}
        reduced={reduced}
        paused={paused}
        onNavigate={onNavigate}
        review={review}
        reviewAsset={reviewAsset}
        reviewView={reviewView}
      />
    </Canvas>
  );
}
