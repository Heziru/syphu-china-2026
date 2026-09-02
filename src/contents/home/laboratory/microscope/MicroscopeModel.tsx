import { useLayoutEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { CubeTexture, MeshStandardMaterial, SRGBColorSpace } from "three";
import { createMicroscopeModel, MICROSCOPE_REVISION, type MicroscopeStats } from "./createMicroscopeModel";

const BENCH_TOP = 0.892;

type Props = {
  /** Studio mode sits at the origin for reference-angle review. */
  studio?: boolean;
};

function makeStudioCube() {
  const size = 64;
  const paints: Array<[string, string]> = [
    ["#F7FBFF", "#D5DCE3"],
    ["#EEF3F7", "#C5CCD4"],
    ["#FFFFFF", "#E4EAEF"],
    ["#DDE3E8", "#A8B0B8"],
    ["#F4F7FA", "#CDD5DC"],
    ["#E8EEF2", "#B7BFC6"],
  ];
  const images = paints.map(([hi, lo]) => {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return canvas;
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, hi);
    gradient.addColorStop(1, lo);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillRect(size * 0.18, 0, size * 0.14, size);
    return canvas;
  });
  const texture = new CubeTexture(images);
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

export function MicroscopeModel({ studio = false }: Props) {
  const { scene } = useThree();
  const { group, stats, materials } = useMemo(() => createMicroscopeModel(), [MICROSCOPE_REVISION]);

  useLayoutEffect(() => {
    const host = window as Window & { __MICROSCOPE_STATS?: MicroscopeStats };
    host.__MICROSCOPE_STATS = stats;
    const env = makeStudioCube();
    const prevEnv = scene.environment;
    const prevIntensity = scene.environmentIntensity;
    materials.forEach((mat) => {
      if (!(mat instanceof MeshStandardMaterial)) return;
      if (mat.name !== "metal" && mat.name !== "glass") return;
      mat.envMap = env;
      mat.envMapIntensity = mat.name === "metal" ? 0.9 : 0.55;
      mat.needsUpdate = true;
    });
    if (studio) {
      scene.environment = env;
      scene.environmentIntensity = 0.7;
    }
    return () => {
      delete host.__MICROSCOPE_STATS;
      if (studio) {
        scene.environment = prevEnv;
        scene.environmentIntensity = prevIntensity;
      }
      materials.forEach((mat) => {
        if (mat instanceof MeshStandardMaterial) mat.envMap = null;
      });
      env.dispose();
    };
  }, [group, materials, scene, stats, studio]);

  return <primitive object={group} position={studio ? [0, 0, 0] : [0.02, BENCH_TOP, 0.04]} />;
}
