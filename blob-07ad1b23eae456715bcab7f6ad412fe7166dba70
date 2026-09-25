import { ContactShadows } from "@react-three/drei";
import { LAB_ASSET_MANIFEST } from "../data/assetManifest";
import { LAB_OBJECTS } from "../data/labObjects";
import { CameraController } from "./CameraController";
import { InteractiveObject } from "./InteractiveObject";
import { Lighting } from "./Lighting";
import { MicroscopeModel } from "./microscope/MicroscopeModel";
import type { MicroscopeReviewView } from "./microscope/reviewShots";
import { RoomShell } from "./RoomShell";
import { SceneLifecycle } from "./SceneLifecycle";

type Props = {
  mobile: boolean;
  shadows: boolean;
  reduced: boolean;
  paused: boolean;
  onNavigate: (path: string) => void;
  review?: boolean;
  reviewView?: MicroscopeReviewView;
};

export function LaboratoryScene({
  mobile,
  shadows,
  reduced,
  paused,
  onNavigate,
  review = false,
  reviewView = "ref",
}: Props) {
  const placeholders = LAB_ASSET_MANIFEST.room.kind === "placeholder";

  if (review) {
    return (
      <>
        <SceneLifecycle paused={paused} />
        <Lighting shadows={shadows} studio />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]} receiveShadow>
          <planeGeometry args={[6.5, 6.5]} />
          <meshStandardMaterial color="#F3F4EF" roughness={0.92} />
        </mesh>
        <MicroscopeModel studio />
        <CameraController
          mobile={mobile}
          reduced={reduced}
          onNavigate={onNavigate}
          review
          reviewView={reviewView}
        />
      </>
    );
  }

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
