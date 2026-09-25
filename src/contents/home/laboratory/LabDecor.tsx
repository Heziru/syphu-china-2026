import { useEffect, useMemo } from "react";
import { useTexture } from "@react-three/drei";
import { CanvasTexture, SRGBColorSpace, type Texture } from "three";
import { SoftBox } from "./SoftBox";
import { Plant, SpecimenBottles, TubeRack } from "./RoomAccents";
import { Supplies } from "./LabSupplies";
import { StaticBatch } from "./StaticBatch";
import { assetUrl } from "../../../utils/assetUrl";

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
    <mesh position={[-3.67, 0.42, 4.546]}>
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
function fitLogoTexture(source: Texture) {
  const image = source.image as HTMLImageElement;
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth || image.width;
  canvas.height = image.naturalHeight || image.height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(image, 0, 0);
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let left = canvas.width;
  let top = canvas.height;
  let right = -1;
  let bottom = -1;
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      if (data[(y * canvas.width + x) * 4 + 3] === 0) continue;
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);
    }
  }
  if (right < left) {
    left = top = 0;
    right = canvas.width - 1;
    bottom = canvas.height - 1;
  }
  const inkWidth = right - left + 1;
  const inkHeight = bottom - top + 1;
  // Only change the displayed UV window; the original artwork stays untouched.
  // Two transparent texels retain antialiased edges when the map is filtered.
  const x = Math.max(0, left - 2);
  const y = Math.max(0, top - 2);
  const width = Math.min(canvas.width, right + 3) - x;
  const height = Math.min(canvas.height, bottom + 3) - y;
  const texture = source.clone();
  texture.repeat.set(width / canvas.width, height / canvas.height);
  texture.offset.set(x / canvas.width, 1 - (y + height) / canvas.height);
  texture.needsUpdate = true;
  const scale = Math.min(0.54 / inkHeight, 0.62 / inkWidth);
  return { texture, width: width * scale, height: height * scale };
}

function LogoPlaque() {
  const textures = useTexture([
    assetUrl("assets/school/school-logo.jpg"),
    assetUrl("assets/laboratory/team-logo.png"),
    assetUrl("assets/laboratory/project-logo.png"),
  ]);
  const logos = useMemo(() => textures.map(fitLogoTexture), [textures]);
  useEffect(
    () => () => logos.forEach(({ texture }) => texture.dispose()),
    [logos],
  );
  return (
    <group name="school-team-project-identities" position={[0.12, 2.61, -4.45]}>
      {logos.map(({ texture, width, height }, i) => (
        <group key={i} position={[(i - 1) * 0.78, 0, 0]}>
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
            {i === 0 ? (
              <circleGeometry args={[0.27, 96]} />
            ) : (
              <planeGeometry args={[width, height]} />
            )}
            <meshBasicMaterial map={texture} transparent toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
export function LabDecor() {
  return (
    <group name="lab-dressing">
      <StaticBatch>
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
