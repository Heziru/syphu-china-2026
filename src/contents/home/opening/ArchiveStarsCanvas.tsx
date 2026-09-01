import { useEffect, useRef } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { mountArchiveStars } from "./archiveStars";

export function ArchiveStarsCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let handle: ReturnType<typeof mountArchiveStars> | undefined;
    let observer: ResizeObserver | undefined;

    const start = () => {
      handle?.dispose();
      handle = mountArchiveStars(canvas, reducedMotion);
    };

    // 等布局完成后再初始化，避免 clientWidth/Height 为 0
    const raf = requestAnimationFrame(() => {
      start();
      observer = new ResizeObserver(() => {
        handle?.resize();
      });
      observer.observe(canvas.parentElement ?? canvas);
    });

    return () => {
      cancelAnimationFrame(raf);
      observer?.disconnect();
      handle?.dispose();
    };
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
