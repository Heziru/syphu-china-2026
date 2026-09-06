import { DETAIL_ANCHORS, EQUIPMENT_DETAILS } from "../data/equipmentDetails";
import { useLaboratoryStore } from "../store/laboratoryStore";
import { Supplies, SupplyCart } from "./LabSupplies";
import { LabEquipment, GlassVessel } from "./LabEquipment";
import { Fragment } from "react";
import { StaticBatch } from "./StaticBatch";
import { LAB_OBJECTS } from "../data/labObjects";
import { AnalyticalBalanceModel } from "./analytical-balance/AnalyticalBalanceModel";
import { ComputerModel } from "./computer/ComputerModel";
import { MicroscopeModel } from "./microscope/MicroscopeModel";
import { LaminarHoodModel } from "./laminar-hood/LaminarHoodModel";
import { LabChairModel } from "./lab-chair/LabChairModel";
import { ResearcherModel } from "./researcher/ResearcherModel";
import { InteractiveObject } from "./InteractiveObject";
import { ModelAsset } from "./ModelAsset";
import { LabDesk, LabBench, Cabinet } from "./labFurnitureSystem";
import { CentralBench } from "./CentralBench";
import { FloorBioreactor } from "./FloorBioreactor";
import { Plant, LabStool, TubeRack } from "./RoomAccents";
import { LiteratureFrame } from "./LiteratureFrame";
import {
  GROUP_FRAMES,
  ROOM_FURNITURE,
  type FurnitureSpec,
  type GroupId,
} from "./roomPlacement";
function Furniture({ spec }: { spec: FurnitureSpec }) {
  const [width, height, depth] = spec.size;
  switch (spec.role) {
    case "desk":
      return <LabDesk {...{ width, height, depth }} />;
    case "bench":
      return spec.id === "central-bench" ? (
        <CentralBench spec={spec} />
      ) : (
        <LabBench {...{ width, height, depth }} />
      );
    case "cabinet":
      return height > 1 ? (
        <Cabinet {...{ width, height, depth }} glass />
      ) : (
        <LabBench {...{ width, height, depth }} />
      );
    case "balance":
      return (
        <ModelAsset id={spec.id} size={spec.size}>
          <AnalyticalBalanceModel />
        </ModelAsset>
      );
    case "computer":
      return (
        <ModelAsset id={spec.id} size={spec.size}>
          <ComputerModel tabletop />
        </ModelAsset>
      );
    case "hood":
      return (
        <ModelAsset id={spec.id} size={spec.size}>
          <LaminarHoodModel />
        </ModelAsset>
      );
    case "microscope":
      return (
        <ModelAsset id={spec.id} size={spec.size}>
          <MicroscopeModel />
        </ModelAsset>
      );
    case "bioreactor":
      return (
        <ModelAsset id={spec.id} size={spec.size}>
          <FloorBioreactor />
        </ModelAsset>
      );
    case "researcher":
      return (
        <ModelAsset id={spec.id} size={spec.size}>
          <ResearcherModel />
        </ModelAsset>
      );
    case "chair":
      return (
        <ModelAsset id={spec.id} size={spec.size}>
          <LabChairModel />
        </ModelAsset>
      );
    case "centrifuge":
    case "ultrasonic":
    case "shaker":
    case "fridge":
    case "nitrogen":
    case "coat-rack":
      return (
        <ModelAsset id={spec.id} size={spec.size}>
          <LabEquipment kind={spec.role} />
        </ModelAsset>
      );
    case "supply-cart":
      return <SupplyCart />;
    case "literature-frame":
      return <LiteratureFrame id={spec.id} size={spec.size} />;
    case "stool":
      return <LabStool />;
  }
}
export function LaboratoryFurniture({
  reduced,
  onNavigate,
}: {
  reduced: boolean;
  onNavigate: (path: string) => void;
}) {
  return (
    <>
      {(Object.keys(GROUP_FRAMES) as GroupId[]).map((id) => {
        const frame = GROUP_FRAMES[id];
        return (
          <group
            key={id}
            name={"zone:" + id}
            position={frame.position}
            rotation={[0, frame.rotationY, 0]}
          >
            {ROOM_FURNITURE.filter((spec) => spec.group === id).map((spec) => {
              const interactiveId =
                spec.id === "storage-a" ? "bookshelf" : spec.id;
              const def = LAB_OBJECTS.find((o) => o.id === interactiveId);
              return (
                <Fragment key={spec.id}>
                  {def ? (
                    <InteractiveObject
                      def={def}
                      placement={spec}
                      reduced={reduced}
                      onNavigate={onNavigate}
                    >
                      <StaticBatch>
                        <Furniture spec={spec} />
                      </StaticBatch>
                    </InteractiveObject>
                  ) : (
                    <group
                      name={spec.id}
                      position={spec.position}
                      rotation={[0, spec.rotationY, 0]}
                      onClick={(event) => {
                        if (spec.role === "literature-frame") {
                          event.stopPropagation();
                          if (event.delta <= 6)
                            window.dispatchEvent(
                              new CustomEvent("lab:literature", {
                                detail: spec.id.replace("paper-", ""),
                              }),
                            );
                          return;
                        }
                        if (!EQUIPMENT_DETAILS[spec.id] || event.delta > 6)
                          return;
                        event.stopPropagation();
                        const state = useLaboratoryStore.getState();
                        if (["idle", "inspecting"].includes(state.phase))
                          state.inspect(spec.id);
                      }}
                    >
                      <StaticBatch>
                        <Furniture spec={spec} />
                      </StaticBatch>
                    </group>
                  )}
                  {Object.entries(DETAIL_ANCHORS)
                    .filter(([, anchor]) => anchor.parent === spec.id)
                    .map(([key, anchor]) => (
                      <group
                        key={key}
                        position={spec.position}
                        rotation={[0, spec.rotationY, 0]}
                      >
                        <DetailHitbox
                          id={key}
                          position={anchor.offset}
                          size={anchor.hitSize}
                        />
                      </group>
                    ))}
                  {spec.id === "preparation-bench" && (
                    <group
                      position={spec.position}
                      rotation={[0, spec.rotationY, 0]}
                    >
                      <group position={[0.35, 0.82, 0]}>
                        <Supplies variant="kits" />
                      </group>
                    </group>
                  )}
                  {spec.id === "engineering-cabinet" && (
                    <group position={[spec.position[0], spec.size[1], 0]}>
                      <Supplies variant="kits" />
                    </group>
                  )}
                  {spec.id === "storage-b" && (
                    <group position={[spec.position[0], spec.size[1], 0]}>
                      <Plant scale={0.8} />
                    </group>
                  )}
                  {spec.id === "engineering-bench" && (
                    <group position={[spec.position[0], spec.size[1], 0]}>
                      <TubeRack />
                      <group position={[0.34, 0, 0]}>
                        <GlassVessel kind="cylinder" />
                      </group>
                      <group position={[-0.35, 0, 0.05]}>
                        <GlassVessel />
                      </group>
                    </group>
                  )}
                </Fragment>
              );
            })}
          </group>
        );
      })}
    </>
  );
}

function DetailHitbox({
  id,
  position,
  size,
}: {
  id: string;
  position: [number, number, number];
  size: [number, number, number];
}) {
  const hovered = useLaboratoryStore((s) => s.hoveredId === id);
  return (
    <mesh
      name={"detail:" + id}
      position={position}
      onPointerOver={(event) => {
        event.stopPropagation();
        const state = useLaboratoryStore.getState();
        if (["idle", "inspecting"].includes(state.phase)) state.setHovered(id);
      }}
      onPointerOut={(event) => {
        event.stopPropagation();
        const state = useLaboratoryStore.getState();
        if (state.hoveredId === id) state.setHovered(null);
      }}
      onClick={(event) => {
        event.stopPropagation();
        const state = useLaboratoryStore.getState();
        if (event.delta <= 6 && ["idle", "inspecting"].includes(state.phase))
          state.inspect(id);
      }}
    >
      <boxGeometry args={size} />
      <meshBasicMaterial
        color="#f6e5b8"
        transparent
        opacity={hovered ? 0.12 : 0}
        depthWrite={false}
      />
    </mesh>
  );
}
