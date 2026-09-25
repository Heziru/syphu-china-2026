import { useMemo } from "react";
import { CatmullRomCurve3, Vector3 } from "three";
import { BioreactorModel } from "./bioreactor/BioreactorModel";
import { ModelAsset } from "./ModelAsset";
import { SoftBox } from "./SoftBox";
import { LAB_COLORS as C } from "./labPalette";
function ProcessTube({ x }: { x: number }) {
  const curve = useMemo(
    () =>
      new CatmullRomCurve3([
        new Vector3(-0.18 + x, 1.18, -0.06),
        new Vector3(-0.18 + x, 1.48, -0.09),
        new Vector3(0.18 + x, 1.48, -0.14),
        new Vector3(0.26 + x, 0.9, -0.12),
      ]),
    [x],
  );
  return (
    <mesh castShadow>
      <tubeGeometry args={[curve, 22, 0.014, 7, false]} />
      <meshStandardMaterial color="#B58A64" roughness={0.35} metalness={0.55} />
    </mesh>
  );
}
export function FloorBioreactor() {
  return (
    <group>
      <SoftBox
        position={[0, 0.07, 0]}
        size={[0.94, 0.08, 0.85]}
        color={C.dark}
        radius={0.025}
      />
      {[-0.37, 0.37].flatMap((x) =>
        [-0.3, 0.3].map((z) => (
          <mesh key={x + ":" + z} position={[x, 0.025, z]} castShadow>
            <cylinderGeometry args={[0.036, 0.04, 0.05, 12]} />
            <meshStandardMaterial color={C.structure} />
          </mesh>
        )),
      )}
      <group position={[-0.18, 0, -0.03]}>
        <mesh position={[0, 0.7, 0]}>
          <cylinderGeometry args={[0.25, 0.25, 0.86, 32, 1, true]} />
          <meshPhysicalMaterial
            color="#DDE7DB"
            transparent
            opacity={0.22}
            roughness={0.14}
            metalness={0.1}
            depthWrite={false}
            side={2}
          />
        </mesh>
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.231, 0.231, 0.4, 28]} />
          <meshStandardMaterial
            color="#BC8B53"
            roughness={0.3}
            transparent
            opacity={0.84}
          />
        </mesh>
        {[0.26, 1.14].map((y) => (
          <group key={y}>
            <mesh position={[0, y, 0]} castShadow>
              <cylinderGeometry args={[0.285, 0.285, 0.045, 28]} />
              <meshStandardMaterial
                color={C.metal}
                metalness={0.68}
                roughness={0.28}
              />
            </mesh>
            {Array.from({ length: 8 }, (_, i) => (
              <mesh
                key={i}
                position={[
                  Math.cos((i * Math.PI) / 4) * 0.26,
                  y + 0.03,
                  Math.sin((i * Math.PI) / 4) * 0.26,
                ]}
              >
                <cylinderGeometry args={[0.015, 0.015, 0.025, 6]} />
                <meshStandardMaterial color={C.structure} metalness={0.5} />
              </mesh>
            ))}
          </group>
        ))}
        {[-0.23, 0.23].flatMap((x) =>
          [-0.2, 0.2].map((z) => (
            <mesh key={x + ":" + z} position={[x, 0.69, z]} castShadow>
              <cylinderGeometry args={[0.012, 0.012, 1.18, 8]} />
              <meshStandardMaterial color={C.metal} metalness={0.65} />
            </mesh>
          )),
        )}
        <mesh position={[0, 1.32, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.075, 0.25, 16]} />
          <meshStandardMaterial color={C.teal} roughness={0.46} />
        </mesh>
        <mesh position={[0, 0.72, 0]}>
          <cylinderGeometry args={[0.01, 0.01, 0.91, 8]} />
          <meshStandardMaterial color={C.metal} metalness={0.7} />
        </mesh>
      </group>
      <ProcessTube x={0} />
      <ProcessTube x={0.1} />
      <SoftBox
        position={[0.29, 0.39, 0.15]}
        size={[0.07, 0.57, 0.08]}
        color={C.metal}
      />
      <group position={[0.3, 0.63, 0.18]}>
        <ModelAsset size={[0.32, 0.6, 0.38]} id="reactor-controller">
          <BioreactorModel />
        </ModelAsset>
      </group>
    </group>
  );
}
