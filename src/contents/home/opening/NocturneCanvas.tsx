import { useEffect, useRef } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { mountNocturneScene } from "./nocturneScene";

export function NocturneCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let handle: ReturnType<typeof mountNocturneScene> | undefined;
    let observer: ResizeObserver | undefined;

    const start = () => {
      handle?.dispose();
      handle = mountNocturneScene(canvas, reduced);
    };

    const id = requestAnimationFrame(() => {
      start();
      observer = new ResizeObserver(() => handle?.resize());
      observer.observe(canvas.parentElement ?? canvas);
    });

    return () => {
      cancelAnimationFrame(id);
      observer?.disconnect();
      handle?.dispose();
    };
  }, [reduced]);

  return <canvas ref={canvasRef} className="nocturne-full__canvas" aria-hidden="true" />;
}
