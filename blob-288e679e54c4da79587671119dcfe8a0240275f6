import { useEffect, useRef } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { mountArchiveStars } from "./archiveStars";

export function ArchiveStarsCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    return mountArchiveStars(canvas, reducedMotion).dispose;
  }, [reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      id="archive-stars"
      className="nocturne-archive__stars"
      aria-hidden="true"
    />
  );
}
