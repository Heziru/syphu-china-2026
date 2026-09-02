import { Canvas } from "@react-three/fiber";
import { useEffect } from "react";
import { ACESFilmicToneMapping, SRGBColorSpace } from "three";
import { useQualityProfile } from "../hooks/useQualityProfile";
import { useLaboratoryStore } from "../store/laboratoryStore";
import { LaboratoryScene } from "./LaboratoryScene";

type Props = {
  reduced: boolean;
  paused: boolean;
  onNavigate: (path: string) => void;
  onContextLost: () => void;
};

export default function LaboratoryCanvas({
  reduced,
  paused,
  onNavigate,
  onContextLost,
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
      shadows={shadows}
      frameloop={paused ? "never" : "always"}
      camera={{ fov: mobile ? 42 : 38, near: 0.1, far: 80 }}
      gl={{ antialias: !mobile, powerPreference: "high-performance", alpha: false }}
      onCreated={({ gl }) => {
        gl.toneMapping = ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.16;
        gl.outputColorSpace = SRGBColorSpace;
        gl.setClearColor("#E8E4DA", 1);
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
      />
    </Canvas>
  );
}
