import { useEffect, useRef } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { mountNocturneOpening } from "./nocturneOpening";

export function NocturneOpeningCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let handle: ReturnType<typeof mountNocturneOpening> | undefined;
    let observer: ResizeObserver | undefined;

    const id = requestAnimationFrame(() => {
      handle = mountNocturneOpening(canvas, reduced);
      observer = new ResizeObserver(() => handle?.resize());
      observer.observe(canvas.parentElement ?? canvas);
    });

    return () => {
      cancelAnimationFrame(id);
      observer?.disconnect();
      handle?.dispose();
    };
  }, [reduced]);

  return <canvas ref={canvasRef} className="nocturne-gate__canvas" aria-hidden="true" />;
}
