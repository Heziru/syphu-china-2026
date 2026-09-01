import { useEffect, useRef } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { mountNocturneScene } from "./nocturneThreeScene";

export function NocturneThreeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handle = mountNocturneScene(canvas, reducedMotion);
    const onResize = () => handle.resize();
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      handle.dispose();
    };
  }, [reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className="nocturne-particle__canvas"
      aria-hidden="true"
    />
  );
}
