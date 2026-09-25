import { useLayoutEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { CubeTexture, MeshStandardMaterial, SRGBColorSpace } from "three";
import {
  createGlasswareStationModel,
  GLASSWARE_STATION_REVISION,
  type GlasswareStationStats,
} from "./createGlasswareStationModel";

type Props = {
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
    return canvas;
  });
  const texture = new CubeTexture(images);
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

export function GlasswareStationModel({ studio = false }: Props) {
  const { scene } = useThree();
  const { group, stats, materials } = useMemo(
    () => createGlasswareStationModel(),
    [GLASSWARE_STATION_REVISION],
  );

  useLayoutEffect(() => {
    const host = window as Window & { __GLASSWARE_STATION_STATS?: GlasswareStationStats };
    host.__GLASSWARE_STATION_STATS = stats;
    const env = makeStudioCube();
    const prevEnv = scene.environment;
    const prevIntensity = scene.environmentIntensity;
    materials.forEach((mat) => {
      if (!(mat instanceof MeshStandardMaterial)) return;
      if (mat.name !== "metal" && mat.name !== "glass" && mat.name !== "cap") return;
      mat.envMap = env;
      mat.envMapIntensity = mat.name === "glass" ? 0.65 : 0.85;
      mat.needsUpdate = true;
    });
    if (studio) {
      scene.environment = env;
      scene.environmentIntensity = 0.75;
    }
    return () => {
      delete host.__GLASSWARE_STATION_STATS;
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

  return <primitive object={group} position={[0, 0, 0]} />;
}
