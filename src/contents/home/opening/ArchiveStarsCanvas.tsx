import { useEffect, useRef } from "react";
import { initArchiveStars } from "./initArchiveStars";

export function ArchiveStarsCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    return initArchiveStars(canvas);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="archive-stars"
      aria-hidden="true"
    />
  );
}
