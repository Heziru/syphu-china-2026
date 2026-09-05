import { useEffect, useRef, useMemo } from "react";
import { OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import gsap from "gsap";
import { PerspectiveCamera, Vector3 } from "three";
import {
  ENTER_CAMERA_OFFSET,
  OVERVIEW_CAMERA,
  fitOverviewShot,
} from "../data/cameraPresets";
import { equipmentShot } from "../data/equipmentDetails";
import { useLaboratoryStore } from "../store/laboratoryStore";
import {
  MICROSCOPE_REVIEW_SHOTS,
  type MicroscopeReviewView,
} from "./microscope/reviewShots";
import { COMPUTER_REVIEW_SHOTS } from "./computer/reviewShots";
import { BIOREACTOR_REVIEW_SHOTS } from "./bioreactor/reviewShots";
import { LAMINAR_HOOD_REVIEW_SHOTS } from "./laminar-hood/reviewShots";
import { ANALYTICAL_BALANCE_REVIEW_SHOTS } from "./analytical-balance/reviewShots";
import { GLASSWARE_STATION_REVIEW_SHOTS } from "./glassware-station/reviewShots";
import { RESEARCHER_REVIEW_SHOTS } from "./researcher/reviewShots";
import { LAB_CHAIR_REVIEW_SHOTS } from "./lab-chair/reviewShots";
import type { LabReviewAsset } from "./labReview";

type Props = {
  mobile: boolean;
  reduced: boolean;
  onNavigate: (path: string) => void;
  review?: boolean;
  reviewAsset?: LabReviewAsset | null;
  reviewView?: MicroscopeReviewView;
};

type OrbitHandle = {
  enabled: boolean;
  target: {
    set: (x: number, y: number, z: number) => void;
    x: number;
    y: number;
    z: number;
  };
  update: () => void;
};

export function CameraController({
  mobile,
  reduced,
  review = false,
  reviewAsset = null,
  reviewView = "ref",
}: Props) {
  const controls = useRef<OrbitHandle | null>(null);
  const { camera, size } = useThree();
  const phase = useLaboratoryStore((s) => s.phase);
  const inspectId = useLaboratoryStore((s) => s.inspectId);
  const setPhase = useLaboratoryStore((s) => s.setPhase);
  const setLocked = useLaboratoryStore((s) => s.setLocked);
  const finishMotion = useLaboratoryStore((s) => s.finishInspectionMotion);
  const returnPose = useRef<{
    position: [number, number, number];
    target: [number, number, number];
    aspect: number;
  } | null>(null);
  const overview = useMemo(
    () =>
      fitOverviewShot(
        mobile ? OVERVIEW_CAMERA.mobile : OVERVIEW_CAMERA.desktop,
        size.width / size.height,
        mobile ? 42 : 34,
      ),
    [mobile, size.width, size.height],
  );
  const overviewRef = useRef(overview);
  const aspectRef = useRef(size.width / Math.max(1, size.height));
  overviewRef.current = overview;
  aspectRef.current = size.width / Math.max(1, size.height);

  useEffect(() => {
    if (camera instanceof PerspectiveCamera) {
      camera.fov = review ? 28 : mobile ? 42 : 34;
      camera.updateProjectionMatrix();
    }
    if (review) {
      const shotTable =
        reviewAsset === "computer"
          ? COMPUTER_REVIEW_SHOTS
          : reviewAsset === "bioreactor"
            ? BIOREACTOR_REVIEW_SHOTS
            : reviewAsset === "researcher"
              ? RESEARCHER_REVIEW_SHOTS
              : reviewAsset === "glassware-station"
                ? GLASSWARE_STATION_REVIEW_SHOTS
                : reviewAsset === "analytical-balance"
                  ? ANALYTICAL_BALANCE_REVIEW_SHOTS
                  : reviewAsset === "laminar-hood"
                    ? LAMINAR_HOOD_REVIEW_SHOTS
                    : reviewAsset === "lab-chair"
                      ? LAB_CHAIR_REVIEW_SHOTS
                      : MICROSCOPE_REVIEW_SHOTS;
      const shot = shotTable[reviewView];
      camera.position.set(shot.position[0], shot.position[1], shot.position[2]);
      camera.lookAt(shot.target[0], shot.target[1], shot.target[2]);
      controls.current?.target.set(
        shot.target[0],
        shot.target[1],
        shot.target[2],
      );
      controls.current?.update();
      setPhase("idle");
      return;
    }

    if (
      ["focusing", "inspecting", "returning"].includes(
        useLaboratoryStore.getState().phase,
      )
    )
      return;
    camera.position.set(
      overview.position[0],
      overview.position[1] + (reduced ? 0 : ENTER_CAMERA_OFFSET),
      overview.position[2] + (reduced ? 0 : ENTER_CAMERA_OFFSET * 0.4),
    );
    const [tx, ty, tz] = overview.target;
    camera.lookAt(tx, ty, tz);
    controls.current?.target.set(tx, ty, tz);
    controls.current?.update();

    if (reduced) {
      setPhase("idle");
      return;
    }

    setPhase("entering");
    const look = {
      x: overview.target[0],
      y: overview.target[1],
      z: overview.target[2],
    };
    const tween = gsap.to(camera.position, {
      x: overview.position[0],
      y: overview.position[1],
      z: overview.position[2],
      duration: 0.75,
      ease: "power2.out",
      onUpdate: () => {
        camera.lookAt(look.x, look.y, look.z);
      },
      onComplete: () => setPhase("idle"),
    });

    return () => {
      tween.kill();
    };
  }, [
    camera,
    mobile,
    overview,
    reduced,
    review,
    reviewAsset,
    reviewView,
    setPhase,
  ]);

  useEffect(() => {
    if (review || (phase !== "focusing" && phase !== "returning")) return;
    if (phase === "focusing" && !inspectId) return;
    const currentOverview = overviewRef.current;
    const currentAspect = aspectRef.current;
    const returning = phase === "returning";
    if (!returning && !returnPose.current) {
      returnPose.current = {
        position: camera.position.toArray() as [number, number, number],
        target: [
          controls.current?.target.x ?? currentOverview.target[0],
          controls.current?.target.y ?? currentOverview.target[1],
          controls.current?.target.z ?? currentOverview.target[2],
        ],
        aspect: currentAspect,
      };
    }
    const saved = returnPose.current;
    const shot = returning
      ? saved && Math.abs(saved.aspect - currentAspect) < 0.01
        ? saved
        : currentOverview
      : equipmentShot(inspectId!, mobile);
    const look = {
      x: controls.current?.target.x ?? currentOverview.target[0],
      y: controls.current?.target.y ?? currentOverview.target[1],
      z: controls.current?.target.z ?? currentOverview.target[2],
    };

    if (controls.current) controls.current.enabled = false;
    setLocked(true);

    const from = camera.position.clone();
    const to = new Vector3(...shot.position);
    const fromLook = new Vector3(look.x, look.y, look.z);
    const toLook = new Vector3(...shot.target);
    const target = new Vector3();
    const clock = { t: 0 };
    const tween = gsap.to(clock, {
      t: 1,
      duration: reduced ? 0 : returning ? 0.65 : 0.8,
      ease: "power2.inOut",
      onUpdate: () => {
        camera.position.lerpVectors(from, to, clock.t);
        target.lerpVectors(fromLook, toLook, clock.t);
        camera.lookAt(target);
        controls.current?.target.set(target.x, target.y, target.z);
      },
      onComplete: () => {
        if (returning) returnPose.current = null;
        finishMotion(returning);
      },
    });
    return () => {
      tween.kill();
    };
  }, [
    camera,
    mobile,
    reduced,
    phase,
    review,
    inspectId,
    finishMotion,
    setLocked,
  ]);

  return (
    <OrbitControls
      ref={controls as never}
      makeDefault
      enablePan={false}
      enableZoom
      enableDamping
      dampingFactor={0.08}
      minDistance={review ? 1.2 : phase === "idle" ? 8 : 1}
      maxDistance={review ? 4.2 : 38}
      minPolarAngle={review ? 0.18 : 0.48}
      maxPolarAngle={review ? 1.45 : 1.18}
      minAzimuthAngle={review ? -Math.PI : -0.48}
      maxAzimuthAngle={review ? Math.PI : 0.78}
      enabled={phase === "idle"}
    />
  );
}
