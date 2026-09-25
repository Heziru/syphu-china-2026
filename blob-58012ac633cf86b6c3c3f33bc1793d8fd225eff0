import { useRef, type CSSProperties, type ReactNode } from "react";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { sceneOpacity, useSceneProgress } from "../hooks/useSceneProgress";

type Props = {
  children: (ctx: {
    progress: number;
    opacity: number;
    reducedMotion: boolean;
    pinned: boolean;
  }) => ReactNode;
  travel?: number;
  className?: string;
  tone?: "deep" | "cream" | "paper" | "ink";
  ariaLabel: string;
};

export function Scene({
  children,
  travel = 1.35,
  className = "",
  tone = "cream",
  ariaLabel,
}: Props) {
  const ref = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();
  const isNarrow = useMediaQuery("(max-width: 900px)");
  const pinned = !reducedMotion && !isNarrow;
  const progress = useSceneProgress(ref, pinned);
  const opacity = pinned ? sceneOpacity(progress) : 1;

  const pinStyle = pinned
    ? ({ ["--moto-travel" as string]: String(travel) } as CSSProperties)
    : undefined;

  return (
    <section
      ref={ref}
      className={`moto-scene moto-scene--${tone}${pinned ? " moto-scene--pin" : " moto-scene--static"}${className ? ` ${className}` : ""}`}
      style={pinStyle}
      aria-label={ariaLabel}
    >
      <div
        className="moto-scene__stage"
        style={pinned ? { opacity } : undefined}
      >
        {children({
          progress: pinned ? progress : 0.42,
          opacity,
          reducedMotion,
          pinned,
        })}
      </div>
    </section>
  );
}
