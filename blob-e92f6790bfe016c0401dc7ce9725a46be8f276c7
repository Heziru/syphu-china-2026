import { useLayoutEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { CubeTexture, MeshPhysicalMaterial, MeshStandardMaterial, SRGBColorSpace } from "three";
import {
  createLaminarHoodModel,
  LAMINAR_HOOD_REVISION,
  type LaminarHoodStats,
} from "./createLaminarHoodModel";

type Props = { studio?: boolean };

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
    const g = ctx.createLinearGradient(0, 0, size, size);
    g.addColorStop(0, hi);
    g.addColorStop(1, lo);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    return canvas;
  });
  const texture = new CubeTexture(images);
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

export function LaminarHoodModel({ studio = false }: Props) {
  const { scene } = useThree();
  const { group, stats, materials } = useMemo(
    () => createLaminarHoodModel(),
    [LAMINAR_HOOD_REVISION],
  );

  useLayoutEffect(() => {
    const host = window as Window & { __LAMINAR_HOOD_STATS?: LaminarHoodStats };
    host.__LAMINAR_HOOD_STATS = stats;
    const env = makeStudioCube();
    const prevEnv = scene.environment;
    const prevIntensity = scene.environmentIntensity;
    materials.forEach((mat) => {
      if (!(mat instanceof MeshStandardMaterial || mat instanceof MeshPhysicalMaterial)) return;
      if (mat.name !== "steel" && mat.name !== "worktop" && mat.name !== "glass" && mat.name !== "screen") return;
      mat.envMap = env;
      mat.envMapIntensity =
        mat.name === "glass" ? 0.7 : mat.name === "steel" ? 0.85 : mat.name === "screen" ? 0.35 : 0.55;
      mat.needsUpdate = true;
    });
    if (studio) {
      scene.environment = env;
      scene.environmentIntensity = 0.72;
    }
    return () => {
      delete host.__LAMINAR_HOOD_STATS;
      if (studio) {
        scene.environment = prevEnv;
        scene.environmentIntensity = prevIntensity;
      }
      materials.forEach((mat) => {
        if (mat instanceof MeshStandardMaterial || mat instanceof MeshPhysicalMaterial) {
          if (mat.map) mat.map.dispose();
          mat.envMap = null;
        }
      });
      env.dispose();
    };
  }, [group, materials, scene, stats, studio]);

  return <primitive object={group} position={[0, 0, 0]} />;
}
