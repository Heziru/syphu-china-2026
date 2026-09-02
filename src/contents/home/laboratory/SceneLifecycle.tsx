import { useEffect } from "react";
import { useThree } from "@react-three/fiber";

type Props = { paused: boolean };

type LabPerf = {
  fps: number;
  triangles: number;
  calls: number;
  geometries: number;
  textures: number;
};

export function SceneLifecycle({ paused }: Props) {
  const { gl, camera, controls, invalidate } = useThree();

  useEffect(() => {
    if (!paused) invalidate();
  }, [invalidate, paused]);

  useEffect(() => {
    const onLost = (event: Event) => {
      event.preventDefault();
    };
    const canvas = gl.domElement;
    canvas.addEventListener("webglcontextlost", onLost);
    return () => {
      canvas.removeEventListener("webglcontextlost", onLost);
    };
  }, [gl]);

  useEffect(() => {
    let frames = 0;
    const start = performance.now();
    let raf = 0;
    const sample = (now: number) => {
      frames += 1;
      if (now - start < 1000) {
        raf = requestAnimationFrame(sample);
        return;
      }
      const info = gl.info;
      const payload: LabPerf = {
        fps: Math.round((frames * 1000) / (now - start)),
        triangles: info.render.triangles,
        calls: info.render.calls,
        geometries: info.memory.geometries,
        textures: info.memory.textures,
      };
      const host = window as Window & {
        __LAB_PERF?: LabPerf;
        __LAB_SHOT?: (name: "overview" | "micro") => void;
      };
      host.__LAB_PERF = payload;
    };
    raf = requestAnimationFrame(sample);
    return () => cancelAnimationFrame(raf);
  }, [gl]);

  useEffect(() => {
    const host = window as Window & { __LAB_SHOT?: (name: "overview" | "micro") => void };
    host.__LAB_SHOT = (name) => {
      const shot =
        name === "micro"
          ? { position: [1.05, 1.68, 1.82] as const, target: [0.05, 1.22, 0.38] as const }
          : { position: [4.05, 3.15, 5.05] as const, target: [0.35, 0.95, 0.05] as const };
      camera.position.set(shot.position[0], shot.position[1], shot.position[2]);
      camera.lookAt(shot.target[0], shot.target[1], shot.target[2]);
      const orbit = controls as { target?: { set: (x: number, y: number, z: number) => void }; update?: () => void } | null;
      orbit?.target?.set(shot.target[0], shot.target[1], shot.target[2]);
      orbit?.update?.();
    };
    return () => {
      delete host.__LAB_SHOT;
    };
  }, [camera, controls]);

  return null;
}
