import { useEffect, useRef } from "react";
import { useReducedMotion } from "../hooks/useReducedMotion";
import {
  createLorenzSeeds,
  lorenzStep,
  mobiusPoint,
  project,
  rotateX,
  rotateY,
  type Vec3,
} from "./chaosMath";

type LorenzTrail = {
  pos: Vec3;
  hue: number;
  trail: Vec3[];
};

type Ambient = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  a: number;
};

type Props = {
  className?: string;
};

/**
 * Full-viewport canvas: Lorenz butterfly wings + rotating Möbius strip + particles.
 */
export function ChaosOpeningCanvas({ className = "" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const reducedMotion = useReducedMotion();
  const pointerRef = useRef({ x: 0, y: 0, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let t0 = performance.now();
    let disposed = false;

    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const lorenzCount = isMobile ? 28 : 52;
    const ambientCount = isMobile ? 90 : 180;
    const trailLen = isMobile ? 36 : 64;

    const leftWing: LorenzTrail[] = createLorenzSeeds(lorenzCount, 1).map(
      (pos, i) => ({
        pos: { ...pos },
        hue: 265 + (i / lorenzCount) * 55,
        trail: [{ ...pos }],
      }),
    );
    const rightWing: LorenzTrail[] = createLorenzSeeds(lorenzCount, -1).map(
      (pos, i) => ({
        pos: { ...pos },
        hue: 195 + (i / lorenzCount) * 45,
        trail: [{ ...pos }],
      }),
    );

    const ambients: Ambient[] = Array.from({ length: ambientCount }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00018,
      vy: (Math.random() - 0.5) * 0.00018,
      r: 0.4 + Math.random() * 1.6,
      a: 0.08 + Math.random() * 0.35,
    }));

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerRef.current = {
        x: (e.clientX - rect.left) / rect.width - 0.5,
        y: (e.clientY - rect.top) / rect.height - 0.5,
        active: true,
      };
    };
    const onLeave = () => {
      pointerRef.current.active = false;
    };

    window.addEventListener("resize", resize);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    resize();

    const integrateLorenz = (wing: LorenzTrail[], dt: number, side: number) => {
      const wingScale = Math.min(w, h) * 0.011;
      const offsetX = side * Math.min(w, h) * 0.22;

      for (const p of wing) {
        p.pos = lorenzStep(p.pos, dt);
        p.trail.push({ ...p.pos });
        if (p.trail.length > trailLen) p.trail.shift();
      }

      return { wingScale, offsetX };
    };

    const drawLorenzWing = (
      wing: LorenzTrail[],
      time: number,
      wingScale: number,
      offsetX: number,
      side: number,
    ) => {
      const ptr = pointerRef.current;
      const yaw = time * 0.22 + side * 0.35 + (ptr.active ? ptr.x * 0.45 : 0);
      const pitch = 0.55 + (ptr.active ? ptr.y * 0.25 : 0);
      const offset: Vec3 = { x: offsetX, y: 0, z: 0 };

      for (const p of wing) {
        for (let i = 1; i < p.trail.length; i++) {
          const a = p.trail[i - 1]!;
          const b = p.trail[i]!;
          let va: Vec3 = {
            x: a.x * wingScale,
            y: a.y * wingScale,
            z: (a.z - 24) * wingScale * 0.85,
          };
          let vb: Vec3 = {
            x: b.x * wingScale,
            y: b.y * wingScale,
            z: (b.z - 24) * wingScale * 0.85,
          };
          va = rotateX(rotateY(va, yaw), pitch);
          vb = rotateX(rotateY(vb, yaw), pitch);

          const pa = project(va, w, h, 420, offset);
          const pb = project(vb, w, h, 420, offset);
          const alpha = (i / p.trail.length) * 0.55;
          ctx.strokeStyle = `hsla(${p.hue}, 88%, 68%, ${alpha})`;
          ctx.lineWidth = 1.1;
          ctx.beginPath();
          ctx.moveTo(pa.x, pa.y);
          ctx.lineTo(pb.x, pb.y);
          ctx.stroke();
        }

        const head = p.trail[p.trail.length - 1]!;
        let v: Vec3 = {
          x: head.x * wingScale,
          y: head.y * wingScale,
          z: (head.z - 24) * wingScale * 0.85,
        };
        v = rotateX(rotateY(v, yaw), pitch);
        const ph = project(v, w, h, 420, offset);
        const g = ctx.createRadialGradient(ph.x, ph.y, 0, ph.x, ph.y, 5);
        g.addColorStop(0, `hsla(${p.hue}, 95%, 78%, 0.95)`);
        g.addColorStop(1, `hsla(${p.hue}, 90%, 55%, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(ph.x, ph.y, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawMobius = (time: number) => {
      const ptr = pointerRef.current;
      const uSeg = isMobile ? 48 : 72;
      const vSeg = 6;
      const R = Math.min(w, h) * 0.11;
      const spin = time * 0.38 + (ptr.active ? ptr.x * 0.6 : 0);
      const tilt = 0.65 + Math.sin(time * 0.25) * 0.12 + (ptr.active ? ptr.y * 0.2 : 0);

      const lines: Array<{ a: { x: number; y: number }; b: { x: number; y: number }; depth: number }> = [];

      const mapPt = (u: number, v: number) => {
        let p = mobiusPoint(u, v, 1);
        p = { x: p.x * R, y: p.y * R, z: p.z * R };
        p = rotateX(rotateY(p, spin), tilt);
        return project(p, w, h, 380, { x: 0, y: -h * 0.02, z: 0 });
      };

      for (let i = 0; i < uSeg; i++) {
        const u0 = (i / uSeg) * Math.PI * 2;
        const u1 = ((i + 1) / uSeg) * Math.PI * 2;
        for (let j = 0; j <= vSeg; j++) {
          const v = (j / vSeg) * 2 - 1;
          const p0 = mapPt(u0, v);
          const p1 = mapPt(u1, v);
          lines.push({ a: p0, b: p1, depth: (p0.depth + p1.depth) * 0.5 });
        }
      }

      for (let j = 0; j < vSeg; j++) {
        const v0 = (j / vSeg) * 2 - 1;
        const v1 = ((j + 1) / vSeg) * 2 - 1;
        for (let i = 0; i < uSeg; i += 2) {
          const u = (i / uSeg) * Math.PI * 2;
          const p0 = mapPt(u, v0);
          const p1 = mapPt(u, v1);
          lines.push({ a: p0, b: p1, depth: (p0.depth + p1.depth) * 0.5 });
        }
      }

      lines.sort((a, b) => b.depth - a.depth);

      ctx.lineCap = "round";
      for (const ln of lines) {
        const fade = Math.min(1, 420 / ln.depth);
        ctx.strokeStyle = `rgba(140, 210, 255, ${0.08 + fade * 0.35})`;
        ctx.lineWidth = 0.85 + fade * 0.6;
        ctx.beginPath();
        ctx.moveTo(ln.a.x, ln.a.y);
        ctx.lineTo(ln.b.x, ln.b.y);
        ctx.stroke();
      }

      // Bright rim highlight
      ctx.strokeStyle = "rgba(180, 130, 255, 0.55)";
      ctx.lineWidth = 1.4;
      for (let i = 0; i < uSeg; i += 2) {
        const u0 = (i / uSeg) * Math.PI * 2;
        const u1 = ((i + 1) / uSeg) * Math.PI * 2;
        const outer0 = mapPt(u0, 1);
        const outer1 = mapPt(u1, 1);
        ctx.beginPath();
        ctx.moveTo(outer0.x, outer0.y);
        ctx.lineTo(outer1.x, outer1.y);
        ctx.stroke();
      }
    };

    const drawAmbients = (time: number) => {
      const ptr = pointerRef.current;
      for (const p of ambients) {
        if (!reducedMotion) {
          p.x += p.vx + Math.sin(time * 0.4 + p.y * 12) * 0.00004;
          p.y += p.vy + Math.cos(time * 0.35 + p.x * 10) * 0.00004;
          if (ptr.active) {
            p.x += ptr.x * 0.00006;
            p.y += ptr.y * 0.00006;
          }
          if (p.x < 0 || p.x > 1) p.vx *= -1;
          if (p.y < 0 || p.y > 1) p.vy *= -1;
          p.x = Math.min(1, Math.max(0, p.x));
          p.y = Math.min(1, Math.max(0, p.y));
        }
        const px = p.x * w;
        const py = p.y * h;
        ctx.fillStyle = `rgba(160, 190, 255, ${p.a})`;
        ctx.beginPath();
        ctx.arc(px, py, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const frame = (now: number) => {
      if (disposed) return;
      const time = (now - t0) * 0.001;
      const dt = reducedMotion ? 0 : 0.0045;

      // Deep space fade trail
      ctx.fillStyle = reducedMotion
        ? "#03050c"
        : "rgba(3, 5, 12, 0.22)";
      ctx.fillRect(0, 0, w, h);

      if (!reducedMotion) {
        ctx.globalCompositeOperation = "lighter";
      }

      drawAmbients(time);

      const left = integrateLorenz(leftWing, dt, -1);
      const right = integrateLorenz(rightWing, dt, 1);
      drawLorenzWing(leftWing, time, left.wingScale, left.offsetX, -1);
      drawLorenzWing(rightWing, time, right.wingScale, right.offsetX, 1);
      drawMobius(time);

      ctx.globalCompositeOperation = "source-over";

      // Center glow behind Möbius
      const cg = ctx.createRadialGradient(
        w * 0.5,
        h * 0.48,
        0,
        w * 0.5,
        h * 0.48,
        Math.min(w, h) * 0.28,
      );
      cg.addColorStop(0, "rgba(99, 102, 241, 0.12)");
      cg.addColorStop(0.45, "rgba(168, 85, 247, 0.06)");
      cg.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = cg;
      ctx.fillRect(0, 0, w, h);

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, [reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
    />
  );
}
