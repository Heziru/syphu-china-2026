import { useEffect } from "react";
import { useThree } from "@react-three/fiber";

type Props = { paused: boolean };

export function SceneLifecycle({ paused }: Props) {
  const { gl, invalidate } = useThree();

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

  return null;
}
