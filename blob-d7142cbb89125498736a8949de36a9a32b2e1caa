import { LAB_COLORS as C } from "./labPalette";
import { SoftBox } from "./SoftBox";
import { SpecimenBottles } from "./RoomAccents";

export function Countertop({
  width,
  depth,
  topY,
}: {
  width: number;
  depth: number;
  topY: number;
}) {
  return (
    <SoftBox
      position={[0, topY - 0.025, 0]}
      size={[width, 0.05, depth]}
      radius={0.017}
      color={C.dark}
      roughness={0.56}
    />
  );
}
export function Cabinet({
  width,
  depth,
  height,
  drawers = false,
  glass = false,
}: {
  width: number;
  depth: number;
  height: number;
  drawers?: boolean;
  glass?: boolean;
}) {
  const panel = 0.035,
    front = depth / 2 - 0.06;
  return (
    <group>
      <SoftBox
        position={[0, 0.045, 0]}
        size={[width - 0.09, 0.09, depth - 0.08]}
        radius={0.008}
        color={C.structure}
      />
      {[-1, 1].map((s) => (
        <SoftBox
          key={s}
          position={[s * (width / 2 - panel / 2), height / 2, 0]}
          size={[panel, height, depth]}
          radius={0.008}
          color={C.cabinet}
        />
      ))}
      <SoftBox
        position={[0, height / 2, -depth / 2 + panel / 2]}
        size={[width - 0.05, height, panel]}
        radius={0.004}
        color={C.cabinet}
      />
      {[0.1, height - 0.02].map((y) => (
        <SoftBox
          key={y}
          position={[0, y, 0]}
          size={[width - 0.04, 0.035, depth - 0.04]}
          color={C.cabinet}
          radius={0.005}
        />
      ))}
      {glass ? (
        <>
          {[0.42, 0.86, 1.3, 1.72]
            .filter((y) => y < height - 0.12)
            .map((y, i) => (
              <group key={y}>
                <SoftBox
                  position={[0, y, 0]}
                  size={[width - 0.07, 0.024, depth - 0.07]}
                  color={C.wood}
                  radius={0.004}
                />
                <group position={[-width * 0.22, y + 0.014, 0]}>
                  <SpecimenBottles count={3} scale={0.62 + i * 0.05} />
                </group>
              </group>
            ))}
          <mesh position={[0, height * 0.52, front]}>
            <boxGeometry args={[width - 0.12, height - 0.17, 0.008]} />
            <meshPhysicalMaterial
              color="#DCE4D9"
              transparent
              opacity={0.17}
              roughness={0.2}
              metalness={0.1}
              depthWrite={false}
            />
          </mesh>
          {[-1, 1].map((s) => (
            <SoftBox
              key={s}
              position={[s * (width / 2 - 0.06), height * 0.52, front]}
              size={[0.045, height - 0.13, 0.028]}
              color={C.cabinet}
              radius={0.004}
            />
          ))}
          <SoftBox
            position={[0, height * 0.52, front]}
            size={[0.028, height - 0.13, 0.028]}
            color={C.cabinet}
            radius={0.004}
          />
          {[0.12, height - 0.02].map((y) => (
            <SoftBox
              key={y}
              position={[0, y, front]}
              size={[width - 0.04, 0.045, 0.028]}
              color={C.cabinet}
              radius={0.004}
            />
          ))}
          <Handle
            x={width * 0.13}
            y={height * 0.49}
            z={depth / 2 - 0.026}
            vertical
          />
        </>
      ) : (
        (drawers ? [0.23, 0.5, 0.77] : [0.5]).map((fraction, i) => {
          const h = drawers ? (height - 0.12) / 3 - 0.015 : height - 0.12;
          return (
            <group key={fraction}>
              <SoftBox
                position={[0, 0.08 + (height - 0.08) * fraction, front]}
                size={[width - 0.085, h, 0.032]}
                radius={0.008}
                color={i === 1 ? C.cabinetLight : C.cabinet}
              />
              <Handle
                x={drawers ? 0 : width * 0.23}
                y={0.08 + (height - 0.08) * fraction + h * 0.3}
                z={depth / 2 - 0.026}
              />
            </group>
          );
        })
      )}
    </group>
  );
}
function Handle({
  x,
  y,
  z,
  vertical = false,
}: {
  x: number;
  y: number;
  z: number;
  vertical?: boolean;
}) {
  return (
    <SoftBox
      position={[x, y, z]}
      size={vertical ? [0.018, 0.14, 0.036] : [0.14, 0.018, 0.036]}
      radius={0.008}
      color={C.metal}
      metalness={0.65}
      roughness={0.3}
    />
  );
}
export function LabDesk({
  width,
  depth,
  height,
}: {
  width: number;
  depth: number;
  height: number;
}) {
  const cabW = 0.5,
    x = width / 2 - 0.02 - cabW / 2;
  return (
    <group>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * x, 0, 0]}>
          <Cabinet
            width={cabW}
            depth={depth - 0.06}
            height={height - 0.05}
            drawers={s === -1}
          />
        </group>
      ))}
      <SoftBox
        position={[0, height * 0.55, -depth / 2 + 0.06]}
        size={[width - 1, 0.14, 0.035]}
        radius={0.005}
        color={C.wood}
      />
      <Countertop width={width} depth={depth} topY={height} />
    </group>
  );
}
export function LabBench({
  width,
  depth,
  height,
}: {
  width: number;
  depth: number;
  height: number;
}) {
  const n = width > 1.5 ? 2 : 1,
    gap = 0.025,
    w = (width - 0.04 - (n - 1) * gap) / n;
  return (
    <group>
      {Array.from({ length: n }, (_, i) => (
        <group
          key={i}
          position={[-width / 2 + 0.02 + w / 2 + i * (w + gap), 0, 0]}
        >
          <Cabinet
            width={w}
            depth={depth - 0.06}
            height={height - 0.05}
            drawers={i === 0}
          />
        </group>
      ))}
      <Countertop width={width} depth={depth} topY={height} />
    </group>
  );
}
