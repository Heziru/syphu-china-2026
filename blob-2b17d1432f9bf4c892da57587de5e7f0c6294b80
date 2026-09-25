import { useEffect, useRef } from "react";
import {
  createWorld,
  layoutParticlesToCanvas,
  type World,
} from "./sedimentation/particleFactory";
import {
  applyStaticPose,
  createRuntime,
  paintFrame,
  stepSimulation,
  type PointerState,
  type SimRuntime,
} from "./sedimentation/particlePhysics";
import {
  DESKTOP_SIM,
  MOBILE_SIM,
  type SimConfig,
} from "./sedimentation/particleTypes";
import { loadProjectSymbol } from "./sedimentation/projectSymbol";

const WORLD_SEED = 2026106;

type Props = {
  reducedMotion: boolean;
  holding: boolean;
  pointerCss: { x: number; y: number } | null;
  onProgress: (progress: number) => void;
};

function pickConfig(width: number): SimConfig {
  return width < 768 ? MOBILE_SIM : DESKTOP_SIM;
}

export function SedimentationCanvas({
  reducedMotion,
  holding,
  pointerCss,
  onProgress,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<World | null>(null);
  const runtimeRef = useRef<SimRuntime | null>(null);
  const configRef = useRef<SimConfig>(DESKTOP_SIM);
  const pointerRef = useRef<PointerState>({
    x: 0,
    y: 0,
    active: false,
  });
  const holdingRef = useRef(holding);
  const rafRef = useRef(0);
  const lastTsRef = useRef(0);
  const lastReportedRef = useRef(-1);
  const onProgressRef = useRef(onProgress);

  holdingRef.current = holding;
  onProgressRef.current = onProgress;

  useEffect(() => {
    pointerRef.current.active = holding && pointerCss !== null;
    if (pointerCss) {
      pointerRef.current.x = pointerCss.x;
      pointerRef.current.y = pointerCss.y;
    }
  }, [holding, pointerCss]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let disposed = false;

    void loadProjectSymbol();

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const width = Math.max(1, Math.floor(rect.width));
      const height = Math.max(1, Math.floor(rect.height));
      const config = pickConfig(width);
      configRef.current = config;
      const dpr = Math.min(window.devicePixelRatio || 1, config.maxDpr);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (
        !worldRef.current ||
        worldRef.current.particles.length !== config.particleCount
      ) {
        worldRef.current = createWorld(WORLD_SEED, config.particleCount);
        layoutParticlesToCanvas(worldRef.current, width, height);
      } else {
        const prevW = runtimeRef.current?.width ?? width;
        const prevH = runtimeRef.current?.height ?? height;
        if (prevW !== width || prevH !== height) {
          const sx = width / Math.max(1, prevW);
          const sy = height / Math.max(1, prevH);
          for (const p of worldRef.current.particles) {
            p.pos.x *= sx;
            p.pos.y *= sy;
          }
        }
      }

      if (!runtimeRef.current) {
        runtimeRef.current = createRuntime(width, height);
      } else {
        runtimeRef.current.width = width;
        runtimeRef.current.height = height;
        runtimeRef.current.center.x = width * 0.62;
        runtimeRef.current.center.y = height * 0.46;
        runtimeRef.current.targetCenter.x = width * 0.62;
        runtimeRef.current.targetCenter.y = height * 0.46;
      }

      if (reducedMotion) {
        applyStaticPose(worldRef.current, width, height);
        runtimeRef.current.emblemAlpha = 0.85;
        runtimeRef.current.progress = 0.92;
        paintFrame(ctx, worldRef.current, runtimeRef.current, config, true);
        onProgressRef.current(0.92);
      }
    };

    resize();

    const ro = new ResizeObserver(() => {
      resize();
    });
    ro.observe(wrap);

    if (reducedMotion) {
      return () => {
        disposed = true;
        ro.disconnect();
      };
    }

    const tick = (ts: number) => {
      if (disposed) return;
      const world = worldRef.current;
      const runtime = runtimeRef.current;
      if (!world || !runtime) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const dt = Math.min(0.033, (ts - (lastTsRef.current || ts)) / 1000);
      lastTsRef.current = ts;

      runtime.holdSign = holdingRef.current ? 1 : runtime.progress > 0 ? -1 : 0;

      stepSimulation(world, runtime, pointerRef.current, configRef.current, dt);
      paintFrame(ctx, world, runtime, configRef.current, false);

      const rounded = Math.round(runtime.progress * 40) / 40;
      if (rounded !== lastReportedRef.current) {
        lastReportedRef.current = rounded;
        onProgressRef.current(runtime.progress);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [reducedMotion]);

  return (
    <div ref={wrapRef} className="sedimentation-canvas" aria-hidden="true">
      <canvas ref={canvasRef} className="sedimentation-canvas__el" />
    </div>
  );
}
