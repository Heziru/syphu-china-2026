import { useEffect, useMemo } from "react";
import { useTexture } from "@react-three/drei";
import { CanvasTexture, SRGBColorSpace } from "three";
import { SoftBox } from "./SoftBox";
import { Plant, SpecimenBottles, TubeRack } from "./RoomAccents";
import { Supplies } from "./LabSupplies";
import { StaticBatch } from "./StaticBatch";

function Sign() {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#40564B";
    ctx.textAlign = "center";
    ctx.font = "600 112px Arial";
    ctx.fillText("iGEM Lab", 512, 130);
    ctx.font = "22px Arial";
    ctx.fillText("PEOPLE  ·  IDEAS  ·  BIOLOGY  ·  IMPACT", 512, 198);
    const t = new CanvasTexture(canvas);
    t.colorSpace = SRGBColorSpace;
    return t;
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <mesh position={[-3.5, 0.42, 4.398]}>
      <planeGeometry args={[1.65, 0.4125]} />
      <meshBasicMaterial
        map={texture}
        transparent
        toneMapped={false}
        depthWrite={false}
      />
    </mesh>
  );
}
function LogoPlaque() {
  const texture = useTexture(
    import.meta.env.BASE_URL + "assets/laboratory/project-logo.png",
  );
  // Original PNG, no cropping, recolouring or resampling; preserve its native aspect.
  return (
    <group name="original-project-logo" position={[0.12, 2.61, -4.45]}>
      <SoftBox
        position={[0, 0, 0]}
        size={[0.75, 0.72, 0.055]}
        color="#C1AB86"
        radius={0.016}
      />
      <SoftBox
        position={[0, 0, 0.032]}
        size={[0.7, 0.67, 0.016]}
        color="#F7F3E8"
        radius={0.009}
      />
      <mesh position={[0, 0, 0.043]}>
        <planeGeometry args={[0.62, (0.62 * 874) / 971]} />
        <meshBasicMaterial map={texture} transparent toneMapped={false} />
      </mesh>
    </group>
  );
}
export function LabDecor() {
  return (
    <group name="lab-dressing">
      <StaticBatch>
        <SoftBox
          position={[-3.5, 0.36, 4.31]}
          size={[2, 0.72, 0.16]}
          color="#DDD4C1"
          radius={0.018}
        />
        <SoftBox
          position={[-3.5, 0.733, 4.31]}
          size={[2.04, 0.036, 0.19]}
          color="#F0E6D3"
          radius={0.006}
        />
        <group position={[-4.46, 0, 3.72]}>
          <Plant scale={1.45} />
        </group>
        <SoftBox
          position={[-3.65, 0.48, 4.02]}
          size={[1.42, 0.045, 0.35]}
          color="#BAA381"
          radius={0.01}
        />
        {[-4.25, -3.05].map((x) => (
          <SoftBox
            key={x}
            position={[x, 0.23, 4.02]}
            size={[0.045, 0.46, 0.24]}
            color="#ABB4A3"
          />
        ))}
        <group position={[-4.14, 0.503, 4.02]} scale={0.85}>
          <TubeRack />
        </group>
        <group position={[-3.61, 0.503, 3.99]}>
          <SpecimenBottles count={4} />
        </group>
        {[1.83, 2.27].map((y, i) => (
          <group key={y} position={[-2.5, y, -4.31]}>
            <SoftBox
              position={[0, 0, 0]}
              size={[2.15, 0.045, 0.31]}
              color="#BAA381"
              radius={0.006}
            />
            <group position={[-0.72, 0.024, 0]}>
              <Supplies variant="kits" />
            </group>
            <group position={[-0.12, 0.024, -0.035]}>
              <SpecimenBottles count={5} scale={i ? 0.9 : 1} />
            </group>
            <group position={[0.68, 0.024, 0]}>
              <Supplies variant="kits" />
            </group>
          </group>
        ))}
      </StaticBatch>
      <Sign />
      <LogoPlaque />
    </group>
  );
}
