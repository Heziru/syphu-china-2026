import { useEffect, useRef, useState } from "react";
import { HOME_ASSETS, LOGO_CROP_RATIO } from "../homeAssets";
import {
  computeLogoLayout,
  generateLogoShards,
  pickShardCount,
} from "./generateShards";
import {
  DEBUG_LOGO_ALIGNMENT,
  HOLD_DURATION_MS,
  HOLD_SETTLE_MS,
  RELEASE_MS,
  REVEAL_MS,
  SNAP_PROGRESS,
  type AssemblyPhase,
  type LogoLayout,
  type LogoShard,
} from "./shardTypes";

type Props = {
  /** Sole assembly driver — stable Closed_Fist from camera. */
  fistStable: boolean;
  reducedMotion: boolean;
  /**
   * Camera denied / unavailable / disabled BEFORE assembly completes.
   * Keeps shards scattered — never shows clean logo or starts quote.
   */
  cameraError?: boolean;
  onPhaseChange?: (phase: AssemblyPhase) => void;
  onProgress?: (progress: number) => void;
};

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function smoothstep(t: number) {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function createCroppedLogo(
  logo: HTMLImageElement,
): HTMLCanvasElement | null {
  const sourceCropHeight = logo.naturalHeight * LOGO_CROP_RATIO;
  const cropped = document.createElement("canvas");
  cropped.width = logo.naturalWidth;
  cropped.height = Math.round(sourceCropHeight);
  const cctx = cropped.getContext("2d");
  if (!cctx) return null;
  cctx.drawImage(
    logo,
    0,
    0,
    logo.naturalWidth,
    sourceCropHeight,
    0,
    0,
    cropped.width,
    cropped.height,
  );
  return cropped;
}

function drawCleanLogo(
  ctx: CanvasRenderingContext2D,
  source: HTMLCanvasElement,
  layout: LogoLayout,
  alpha: number,
) {
  if (alpha <= 0.001) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.drawImage(
    source,
    0,
    0,
    source.width,
    source.height,
    layout.x,
    layout.y,
    layout.width,
    layout.height,
  );
  ctx.restore();
}

function drawSoftGlow(
  ctx: CanvasRenderingContext2D,
  layout: LogoLayout,
  alpha: number,
) {
  if (alpha <= 0.001) return;
  const glow = Math.min(0.12, alpha * 0.1);
  const cx = layout.centerX;
  const cy = layout.centerY;
  const r = Math.max(layout.width, layout.height) * 0.55;
  const g = ctx.createRadialGradient(cx, cy, r * 0.15, cx, cy, r);
  g.addColorStop(0, `rgba(46, 139, 87, ${glow})`);
  g.addColorStop(0.55, `rgba(26, 143, 138, ${glow * 0.45})`);
  g.addColorStop(1, "rgba(26, 143, 138, 0)");
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawShards(
  ctx: CanvasRenderingContext2D,
  shards: LogoShard[],
  source: HTMLCanvasElement,
  layout: LogoLayout,
  viewW: number,
  viewH: number,
  progress: number,
  now: number,
  shardAlpha: number,
  edgeAlpha: number,
) {
  if (shardAlpha <= 0.001) return;

  const eased = easeOutCubic(progress);
  const snapped = progress >= SNAP_PROGRESS;
  const time = now * 0.001;
  const driftAmp = snapped ? 0 : Math.max(0, 1 - progress);

  const ordered = shards.slice().sort((a, b) => {
    const rank = { background: 0, midground: 1, foreground: 2 };
    return rank[a.layer] - rank[b.layer];
  });

  for (const shard of ordered) {
    const sp = snapped
      ? 1
      : clamp01((eased - shard.delay) / Math.max(0.001, 1 - shard.delay));

    const assembledX = layout.x + shard.localCenterX * layout.width;
    const assembledY = layout.y + shard.localCenterY * layout.height;
    const scatterX = shard.scatterNX * viewW;
    const scatterY = shard.scatterNY * viewH;

    let x: number;
    let y: number;
    let rot: number;
    let sc: number;

    if (snapped || sp >= 1) {
      x = assembledX;
      y = assembledY;
      rot = 0;
      sc = 1;
    } else {
      const period = 5.5 + shard.localCenterX * 3;
      const idleX =
        Math.sin((time * (Math.PI * 2)) / period + shard.localCenterX) *
        (3 + shard.scatterScale * 4) *
        driftAmp;
      const idleY =
        Math.cos(
          (time * (Math.PI * 2)) / (period * 1.1) + shard.localCenterY,
        ) *
        (2.5 + shard.scatterScale * 3.5) *
        driftAmp;
      const idleRot =
        Math.sin(time / period + shard.delay * 8) * 0.03 * driftAmp;

      x = lerp(scatterX, assembledX, sp) + idleX * (1 - sp);
      y = lerp(scatterY, assembledY, sp) + idleY * (1 - sp);
      rot = lerp(shard.scatterRotation, 0, sp) + idleRot * (1 - sp);
      sc = lerp(shard.scatterScale, 1, sp);
    }

    ctx.save();
    ctx.globalAlpha = shardAlpha;
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(sc, sc);

    const buildPath = () => {
      ctx.beginPath();
      shard.localPolygon.forEach((p, i) => {
        const px = p.x * layout.width;
        const py = p.y * layout.height;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.closePath();
    };

    buildPath();
    ctx.save();
    ctx.clip();

    // Texture is always anchored to the assembled logo rect relative to
    // this shard's assembled center — never to the live scatter position.
    ctx.drawImage(
      source,
      0,
      0,
      source.width,
      source.height,
      layout.x - assembledX,
      layout.y - assembledY,
      layout.width,
      layout.height,
    );
    ctx.restore();

    if (edgeAlpha > 0.02) {
      buildPath();
      ctx.strokeStyle = `rgba(255,255,255,${0.16 * edgeAlpha})`;
      ctx.lineWidth = 0.65;
      ctx.stroke();
    }

    ctx.restore();
  }
}

function drawDebugAlignment(
  ctx: CanvasRenderingContext2D,
  layout: LogoLayout,
) {
  if (!DEBUG_LOGO_ALIGNMENT) return;
  ctx.save();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(255, 60, 60, 0.9)";
  ctx.strokeRect(layout.x, layout.y, layout.width, layout.height);
  ctx.strokeStyle = "rgba(60, 220, 120, 0.9)";
  ctx.strokeRect(
    layout.x + 0.5,
    layout.y + 0.5,
    layout.width - 1,
    layout.height - 1,
  );
  ctx.beginPath();
  ctx.moveTo(layout.centerX - 12, layout.centerY);
  ctx.lineTo(layout.centerX + 12, layout.centerY);
  ctx.moveTo(layout.centerX, layout.centerY - 12);
  ctx.lineTo(layout.centerX, layout.centerY + 12);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
  ctx.stroke();
  ctx.restore();
}

export function LogoAssembly({
  fistStable,
  reducedMotion,
  cameraError = false,
  onPhaseChange,
  onProgress,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const croppedRef = useRef<HTMLCanvasElement | null>(null);
  const shardsRef = useRef<LogoShard[]>([]);
  const layoutRef = useRef<LogoLayout>({
    x: 0,
    y: 0,
    width: 320,
    height: 286,
    centerX: 160,
    centerY: 143,
  });
  const sizeRef = useRef({ w: 1, h: 1 });
  const phaseRef = useRef<AssemblyPhase>(
    reducedMotion ? "quoteTyping" : "scattered",
  );
  const holdProgressRef = useRef(0);
  const revealTRef = useRef(0);
  const settleTRef = useRef(0);
  const finishLockedRef = useRef(false);
  const fistStableRef = useRef(fistStable);
  const cameraErrorRef = useRef(cameraError);
  const rafRef = useRef(0);
  const lastTsRef = useRef(0);
  const logoReadyRef = useRef(false);
  const onPhaseRef = useRef(onPhaseChange);
  const onProgressRef = useRef(onProgress);
  const stoppedRef = useRef(false);
  const aspectRef = useRef(1);

  const [phase, setPhase] = useState<AssemblyPhase>(
    reducedMotion ? "quoteTyping" : "scattered",
  );
  const [logoFailed, setLogoFailed] = useState(false);

  fistStableRef.current = fistStable;
  cameraErrorRef.current = cameraError;
  onPhaseRef.current = onPhaseChange;
  onProgressRef.current = onProgress;

  const setPhaseSafe = (next: AssemblyPhase) => {
    if (stoppedRef.current && next !== "completed" && next !== "quoteTyping") {
      return;
    }
    if (phaseRef.current === next) return;
    phaseRef.current = next;
    setPhase(next);
    onPhaseRef.current?.(next);
  };

  useEffect(() => {
    let disposed = false;
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) {
      setLogoFailed(true);
      setPhaseSafe("quoteTyping");
      return;
    }

    const applyLayout = (rebuildShards: boolean) => {
      const rect = wrap.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));
      sizeRef.current = { w, h };

      const isMobile = w < 900;
      const layout = computeLogoLayout(
        w,
        h,
        aspectRef.current,
        isMobile,
      );
      layoutRef.current = layout;

      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (stoppedRef.current) {
        // Completed: redraw clean logo only at new size
        const source = croppedRef.current;
        if (source) {
          ctx.clearRect(0, 0, w, h);
          drawSoftGlow(ctx, layout, 1);
          drawCleanLogo(ctx, source, layout, 1);
        }
        return;
      }

      if (rebuildShards || shardsRef.current.length === 0) {
        const cx = layout.centerX / w;
        const cy = layout.centerY / h;
        shardsRef.current = generateLogoShards(
          pickShardCount(w),
          cx,
          cy,
        );
      }
    };

    const paintFinalClean = () => {
      const { w, h } = sizeRef.current;
      const layout = layoutRef.current;
      const source = croppedRef.current;
      if (!source) return;
      ctx.clearRect(0, 0, w, h);
      drawSoftGlow(ctx, layout, 1);
      drawCleanLogo(ctx, source, layout, 1);
      drawDebugAlignment(ctx, layout);
    };

    const paint = (now: number) => {
      const { w, h } = sizeRef.current;
      const layout = layoutRef.current;
      const source = croppedRef.current;
      const shards = shardsRef.current;
      const progress = holdProgressRef.current;
      const phase = phaseRef.current;

      ctx.clearRect(0, 0, w, h);
      if (!source || !logoReadyRef.current) return;

      if (reducedMotion) {
        drawSoftGlow(ctx, layout, 1);
        drawCleanLogo(ctx, source, layout, 1);
        return;
      }

      let shardAlpha = 1;
      let cleanAlpha = 0;
      let edgeAlpha = Math.max(0, 1 - progress);

      if (phase === "assembled") {
        const settle = clamp01(settleTRef.current / HOLD_SETTLE_MS);
        edgeAlpha = 1 - settle;
        shardAlpha = 1;
        cleanAlpha = 0;
      } else if (phase === "logoReveal") {
        const revealEased = smoothstep(revealTRef.current);
        shardAlpha = 1 - revealEased;
        cleanAlpha = revealEased;
        edgeAlpha = 0;
      } else if (
        phase === "quoteTyping" ||
        phase === "quoteHold" ||
        phase === "quoteFade" ||
        phase === "completed"
      ) {
        shardAlpha = 0;
        cleanAlpha = 1;
        edgeAlpha = 0;
      } else {
        // scattered / scatteredError / assembling / returning — shards only
        edgeAlpha = Math.max(0, 1 - progress);
        cleanAlpha = 0;
        shardAlpha = 1;
      }

      drawSoftGlow(ctx, layout, cleanAlpha);

      drawShards(
        ctx,
        shards,
        source,
        layout,
        w,
        h,
        progress,
        now,
        shardAlpha,
        edgeAlpha,
      );

      drawCleanLogo(ctx, source, layout, cleanAlpha);
      drawDebugAlignment(ctx, layout);
    };

    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      if (disposed) return;
      const cropped = createCroppedLogo(img);
      if (!cropped) {
        setLogoFailed(true);
        setPhaseSafe("quoteTyping");
        return;
      }
      croppedRef.current = cropped;
      aspectRef.current = cropped.width / cropped.height;
      logoReadyRef.current = true;
      applyLayout(true);

      if (reducedMotion) {
        paintFinalClean();
        setPhaseSafe("quoteTyping");
        return;
      }

      lastTsRef.current = 0;
      rafRef.current = requestAnimationFrame(tick);
    };
    img.onerror = () => {
      if (disposed) return;
      setLogoFailed(true);
      setPhaseSafe("quoteTyping");
    };
    img.src = HOME_ASSETS.projectLogo;

    const ro = new ResizeObserver(() => {
      applyLayout(false);
      if (stoppedRef.current || reducedMotion) {
        paintFinalClean();
        return;
      }
      // Keep shard topology; only scatter cells need remapping on big resizes —
      // regenerate from same seed so positions stay coherent.
      if (!finishLockedRef.current && logoReadyRef.current) {
        const { w } = sizeRef.current;
        const layout = layoutRef.current;
        shardsRef.current = generateLogoShards(
          pickShardCount(w),
          layout.centerX / w,
          layout.centerY / sizeRef.current.h,
        );
      }
      if (!rafRef.current && logoReadyRef.current) {
        paint(performance.now());
      }
    });
    ro.observe(wrap);

    const tick = (ts: number) => {
      if (disposed) {
        rafRef.current = 0;
        return;
      }

      const dt = Math.min(0.05, (ts - (lastTsRef.current || ts)) / 1000);
      lastTsRef.current = ts;
      const isFistStable = fistStableRef.current;
      const phase = phaseRef.current;

      if (reducedMotion) {
        paintFinalClean();
        rafRef.current = 0;
        return;
      }

      // Camera error before completion: keep / return to scattered shards.
      // Never draw clean logo or enter quoteTyping from this path.
      if (cameraErrorRef.current && !finishLockedRef.current) {
        if (holdProgressRef.current > 0) {
          holdProgressRef.current = clamp01(
            holdProgressRef.current - (dt * 1000) / RELEASE_MS,
          );
          setPhaseSafe(
            holdProgressRef.current > 0.001 ? "returning" : "scatteredError",
          );
          if (holdProgressRef.current <= 0.001) {
            holdProgressRef.current = 0;
            setPhaseSafe("scatteredError");
          }
        } else {
          setPhaseSafe("scatteredError");
        }
        onProgressRef.current?.(holdProgressRef.current);
        paint(ts);
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      // Error cleared — resume waiting for fist from scattered.
      if (
        !cameraErrorRef.current &&
        phaseRef.current === "scatteredError"
      ) {
        setPhaseSafe("scattered");
      }

      if (
        phase === "scattered" ||
        phase === "scatteredError" ||
        phase === "assembling" ||
        phase === "returning" ||
        phase === "assembled"
      ) {
        if (finishLockedRef.current || holdProgressRef.current >= 1) {
          finishLockedRef.current = true;
          holdProgressRef.current = 1;
          if (phase !== "assembled") {
            setPhaseSafe("assembled");
          }
          if (phaseRef.current === "assembled") {
            settleTRef.current += dt * 1000;
            if (settleTRef.current >= HOLD_SETTLE_MS) {
              revealTRef.current = 0;
              setPhaseSafe("logoReveal");
            }
          }
        } else if (isFistStable && !cameraErrorRef.current) {
          if (holdProgressRef.current > 0.04) setPhaseSafe("assembling");
          else setPhaseSafe("scattered");
          holdProgressRef.current = clamp01(
            holdProgressRef.current + (dt * 1000) / HOLD_DURATION_MS,
          );
          if (holdProgressRef.current >= 1) {
            finishLockedRef.current = true;
            settleTRef.current = 0;
            setPhaseSafe("assembled");
          }
        } else if (holdProgressRef.current > 0) {
          holdProgressRef.current = clamp01(
            holdProgressRef.current - (dt * 1000) / RELEASE_MS,
          );
          settleTRef.current = 0;
          setPhaseSafe(
            holdProgressRef.current > 0.001 ? "returning" : "scattered",
          );
          if (holdProgressRef.current <= 0.001) holdProgressRef.current = 0;
        } else if (phase !== "scatteredError") {
          setPhaseSafe("scattered");
        }
        onProgressRef.current?.(holdProgressRef.current);
      } else if (phase === "logoReveal") {
        revealTRef.current = clamp01(
          revealTRef.current + (dt * 1000) / REVEAL_MS,
        );
        if (revealTRef.current >= 1) {
          stoppedRef.current = true;
          paintFinalClean();
          setPhaseSafe("quoteTyping");
          rafRef.current = 0;
          return;
        }
      } else {
        // quote / completed — keep final frame, stop loop
        paintFinalClean();
        rafRef.current = 0;
        return;
      }

      paint(ts);
      rafRef.current = requestAnimationFrame(tick);
    };

    return () => {
      disposed = true;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      ro.disconnect();
      croppedRef.current = null;
    };
  }, [reducedMotion]);

  return (
    <div ref={wrapRef} className="logo-assembly">
      <canvas
        ref={canvasRef}
        className="logo-shards-canvas"
        aria-hidden="true"
      />
      {logoFailed && (
        <img
          className="logo-assembly__fallback"
          src={HOME_ASSETS.projectLogo}
          alt="LBP-Mototype project symbol"
          decoding="async"
          draggable={false}
        />
      )}
      <span className="home-sr-only">
        {phase === "completed" || phase === "quoteTyping"
          ? "LBP-Mototype project symbol"
          : ""}
      </span>
    </div>
  );
}
