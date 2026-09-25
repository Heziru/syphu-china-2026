import { ContactShadows } from "@react-three/drei";
import { LAB_ASSET_MANIFEST } from "../data/assetManifest";
import { LAB_OBJECTS } from "../data/labObjects";
import { CameraController } from "./CameraController";
import { BioreactorModel } from "./bioreactor/BioreactorModel";
import type { BioreactorReviewView } from "./bioreactor/reviewShots";
import { ComputerModel } from "./computer/ComputerModel";
import type { ComputerReviewView } from "./computer/reviewShots";
import { InteractiveObject } from "./InteractiveObject";
import type { LabReviewAsset } from "./labReview";
import { Lighting } from "./Lighting";
import { MicroscopeModel } from "./microscope/MicroscopeModel";
import type { MicroscopeReviewView } from "./microscope/reviewShots";
import { LaminarHoodModel } from "./laminar-hood/LaminarHoodModel";
import type { LaminarHoodReviewView } from "./laminar-hood/reviewShots";
import { LabChairModel } from "./lab-chair/LabChairModel";
import type { LabChairReviewView } from "./lab-chair/reviewShots";
import { AnalyticalBalanceModel } from "./analytical-balance/AnalyticalBalanceModel";
import type { AnalyticalBalanceReviewView } from "./analytical-balance/reviewShots";
import { GlasswareStationModel } from "./glassware-station/GlasswareStationModel";
import type { GlasswareStationReviewView } from "./glassware-station/reviewShots";
import { ResearcherModel } from "./researcher/ResearcherModel";
import type { ResearcherReviewView } from "./researcher/reviewShots";
import { RoomShell } from "./RoomShell";
import { SceneLifecycle } from "./SceneLifecycle";

type ReviewView =
  | MicroscopeReviewView
  | ComputerReviewView
  | BioreactorReviewView
  | ResearcherReviewView
  | GlasswareStationReviewView
  | AnalyticalBalanceReviewView
  | LaminarHoodReviewView
  | LabChairReviewView;

type Props = {
  mobile: boolean;
  shadows: boolean;
  reduced: boolean;
  paused: boolean;
  onNavigate: (path: string) => void;
  review?: boolean;
  reviewAsset?: LabReviewAsset | null;
  reviewView?: ReviewView;
};

export function LaboratoryScene({
  mobile,
  shadows,
  reduced,
  paused,
  onNavigate,
  review = false,
  reviewAsset = null,
  reviewView = "ref",
}: Props) {
  const placeholders = LAB_ASSET_MANIFEST.room.kind === "placeholder";

  if (review && reviewAsset) {
    return (
      <>
        <SceneLifecycle paused={paused} />
        <Lighting shadows={shadows} studio />
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]} receiveShadow>
          <planeGeometry args={[6.5, 6.5]} />
          <meshStandardMaterial color="#F3F4EF" roughness={0.92} />
        </mesh>
        {reviewAsset === "computer" ? (
          <ComputerModel studio />
        ) : reviewAsset === "bioreactor" ? (
          <BioreactorModel studio />
        ) : reviewAsset === "researcher" ? (
          <ResearcherModel studio />
        ) : reviewAsset === "glassware-station" ? (
          <GlasswareStationModel studio />
        ) : reviewAsset === "analytical-balance" ? (
          <AnalyticalBalanceModel studio />
        ) : reviewAsset === "laminar-hood" ? (
          <LaminarHoodModel studio />
        ) : reviewAsset === "lab-chair" ? (
          <LabChairModel studio />
        ) : (
          <MicroscopeModel studio />
        )}
        <CameraController
          mobile={mobile}
          reduced={reduced}
          onNavigate={onNavigate}
          review
          reviewAsset={reviewAsset}
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
        position={[0, 0.003, 0.12]}
        opacity={0.28}
        scale={9.5}
        blur={2.1}
        far={3.6}
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
