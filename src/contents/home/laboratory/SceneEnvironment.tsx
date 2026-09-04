import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { PMREMGenerator } from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
/** Locally generated reflection environment; no HDR/CDN request. */
export function SceneEnvironment() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const generator = new PMREMGenerator(gl),
      room = new RoomEnvironment();
    const target = generator.fromScene(room, 0.03),
      previous = scene.environment,
      intensity = scene.environmentIntensity;
    scene.environment = target.texture;
    scene.environmentIntensity = 0.15;
    room.dispose();
    generator.dispose();
    return () => {
      scene.environment = previous;
      scene.environmentIntensity = intensity;
      target.dispose();
    };
  }, [gl, scene]);
  return null;
}
