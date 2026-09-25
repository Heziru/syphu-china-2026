import { ContactShadows } from "@react-three/drei";
import { LAB_ASSET_MANIFEST } from "../data/assetManifest";
import { LAB_OBJECTS } from "../data/labObjects";
import { CameraController } from "./CameraController";
import { InteractiveObject } from "./InteractiveObject";
import { Lighting } from "./Lighting";
import { RoomShell } from "./RoomShell";
import { SceneLifecycle } from "./SceneLifecycle";

type Props = {
  mobile: boolean;
  shadows: boolean;
  reduced: boolean;
  paused: boolean;
  onNavigate: (path: string) => void;
};

export function LaboratoryScene({
  mobile,
  shadows,
  reduced,
  paused,
  onNavigate,
}: Props) {
  const placeholders = LAB_ASSET_MANIFEST.room.kind === "placeholder";

  return (
    <>
      <SceneLifecycle paused={paused} />
      <Lighting shadows={placeholders ? shadows : shadows} />
      <RoomShell />
      <ContactShadows
        position={[0.08, 0.003, 0.28]}
        opacity={0.28}
        scale={7.5}
        blur={2.1}
        far={3.2}
        frames={30}
      />
      {LAB_OBJECTS.map((def) => (
        <InteractiveObject
          key={def.id}
          def={def}
          reduced={reduced}
          onNavigate={onNavigate}
        />
      ))}
      <CameraController mobile={mobile} reduced={reduced} onNavigate={onNavigate} />
    </>
  );
}
