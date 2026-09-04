import { Supplies } from "./LabSupplies";
import { GlassVessel } from "./LabEquipment";
import { LAB_COLORS as C } from "./labPalette";
import { SoftBox } from "./SoftBox";
import { Cabinet, Countertop } from "./labFurnitureSystem";
import { Plant, TubeRack, PetriDishes } from "./RoomAccents";
import type { FurnitureSpec } from "./roomPlacement";
export function CentralBench({ spec }: { spec: FurnitureSpec }) {
  const [w, h, d] = spec.size;
  return (
    <group>
      <Countertop width={w} depth={d} topY={h} />
      <group position={[-0.05, 0, 0]}>
        <Cabinet width={1.2} depth={d - 0.1} height={h - 0.05} />
      </group>
      <group position={[w / 2 - 0.33, 0, 0]}>
        <Cabinet width={0.6} depth={d - 0.1} height={h - 0.05} drawers />
      </group>
      <SoftBox
        position={[-w / 2 + 0.32, 0.42, -d / 2 + 0.07]}
        size={[0.61, 0.77, 0.04]}
        color={C.cabinet}
      />
      {[-w / 2 + 0.025, -0.68].map((x) => (
        <SoftBox
          key={x}
          position={[x, 0.42, 0]}
          size={[0.03, 0.77, d - 0.1]}
          color={C.cabinet}
        />
      ))}
      {[0.1, 0.44, 0.79].map((y) => (
        <SoftBox
          key={y}
          position={[-1.0, y, 0]}
          size={[0.61, 0.025, d - 0.1]}
          color={C.wood}
        />
      ))}
      {[0.2, 0.55].map((y) => (
        <group key={y}>
          <SoftBox
            position={[-1, y, 0.34]}
            size={[0.44, 0.18, 0.36]}
            color={C.paper}
            radius={0.015}
          />
          <SoftBox
            position={[-1, y + 0.01, 0.523]}
            size={[0.11, 0.034, 0.006]}
            color={C.metal}
            radius={0.004}
          />
        </group>
      ))}
      <group position={[0.76, h, -0.25]} scale={0.82}>
        <Supplies />
      </group>
      <group position={[-1.05, h, 0.4]}>
        <GlassVessel kind="cylinder" />
      </group>
      <group position={[-0.91, h, -0.18]}>
        <TubeRack />
      </group>
      <group position={[0.75, h, 0.3]}>
        <PetriDishes />
      </group>
      <group position={[1.12, h, -0.48]}>
        <Plant scale={0.58} />
      </group>
      <group position={[-0.5, h, 0.45]}>
        <SoftBox
          position={[0, 0.009, 0]}
          size={[0.24, 0.018, 0.18]}
          color={C.paper}
          radius={0.002}
        />
      </group>
    </group>
  );
}
