import { Fragment } from "react";
import { StaticBatch } from "./StaticBatch";
import { LAB_OBJECTS } from "../data/labObjects";
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
    case "computer":
      return (
        <ModelAsset id={spec.id} size={spec.size}>
          <ComputerModel tabletop />
        </ModelAsset>
      );
    case "hood":
      return (
        <ModelAsset id={spec.id} size={spec.size}>
          <LaminarHoodModel tabletop />
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
                    >
                      <StaticBatch>
                        <Furniture spec={spec} />
                      </StaticBatch>
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
