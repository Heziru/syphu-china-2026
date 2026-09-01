import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion";
import {
  mountNocturneScene,
  type OpeningPhase,
} from "./nocturneThreeScene";

type Props = {
  onPhase?: (phase: OpeningPhase) => void;
};

export function NocturneThreeCanvas({ onPhase }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reducedMotion = useReducedMotion();
  const onPhaseRef = useRef(onPhase);

  useEffect(() => {
    onPhaseRef.current = onPhase;
  }, [onPhase]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handle = mountNocturneScene(canvas, reducedMotion, (phase) => {
      onPhaseRef.current?.(phase);
    });
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

export function useOpeningPhase() {
  const reducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<OpeningPhase>(
    reducedMotion ? "title" : "converge",
  );
  return { phase, setPhase, reducedMotion };
}
