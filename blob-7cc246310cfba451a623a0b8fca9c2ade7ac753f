import { useEffect, useRef } from "react";
import { OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import gsap from "gsap";
import { ENTER_CAMERA_OFFSET, OVERVIEW_CAMERA } from "../data/cameraPresets";
import { chapterForObject, labObjectById } from "../data/labObjects";
import { useLaboratoryStore } from "../store/laboratoryStore";

type Props = {
  mobile: boolean;
  reduced: boolean;
  onNavigate: (path: string) => void;
};

type OrbitHandle = {
  enabled: boolean;
  target: { set: (x: number, y: number, z: number) => void; x: number; y: number; z: number };
  update: () => void;
};

export function CameraController({ mobile, reduced, onNavigate }: Props) {
  const controls = useRef<OrbitHandle | null>(null);
  const { camera } = useThree();
  const phase = useLaboratoryStore((s) => s.phase);
  const selectedId = useLaboratoryStore((s) => s.selectedId);
  const setPhase = useLaboratoryStore((s) => s.setPhase);
  const setLocked = useLaboratoryStore((s) => s.setLocked);
  const overview = mobile ? OVERVIEW_CAMERA.mobile : OVERVIEW_CAMERA.desktop;

  useEffect(() => {
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
    const look = { x: overview.target[0], y: overview.target[1], z: overview.target[2] };
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
  }, [camera, overview, reduced, setPhase]);

  useEffect(() => {
    if (phase !== "focusing" || !selectedId) return;
    const def = labObjectById(selectedId);
    const chapter = chapterForObject(selectedId);
    if (!def || !chapter) return;

    const shot = mobile ? def.camera.mobile : def.camera.desktop;
    const look = {
      x: controls.current?.target.x ?? overview.target[0],
      y: controls.current?.target.y ?? overview.target[1],
      z: controls.current?.target.z ?? overview.target[2],
    };

    if (controls.current) controls.current.enabled = false;
    const orbit = controls.current;
    setLocked(true);

    const posTween = gsap.to(camera.position, {
      x: shot.position[0],
      y: shot.position[1],
      z: shot.position[2],
      duration: 0.75,
      ease: "power2.inOut",
    });
    const lookTween = gsap.to(look, {
      x: shot.target[0],
      y: shot.target[1],
      z: shot.target[2],
      duration: 0.75,
      ease: "power2.inOut",
      onUpdate: () => {
        camera.lookAt(look.x, look.y, look.z);
        controls.current?.target.set(look.x, look.y, look.z);
        controls.current?.update();
      },
      onComplete: () => {
        setPhase("transitioning");
        onNavigate(chapter.path);
      },
    });

    return () => {
      posTween.kill();
      lookTween.kill();
      if (orbit) orbit.enabled = true;
    };
  }, [camera, mobile, onNavigate, overview.target, phase, selectedId, setLocked, setPhase]);

  return (
    <OrbitControls
      ref={controls as never}
      makeDefault
      enablePan={false}
      enableDamping
      dampingFactor={0.08}
      minDistance={1.55}
      maxDistance={12}
      minPolarAngle={0.48}
      maxPolarAngle={1.18}
      minAzimuthAngle={-0.48}
      maxAzimuthAngle={0.78}
      enabled={phase === "idle"}
    />
  );
}
