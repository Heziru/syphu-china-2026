export type ArchiveStarsHandle = {
  dispose: () => void;
};

type Star = {
  x: number;
  y: number;
  depth: number;
  bright: boolean;
  size: number;
  alpha: number;
  phase: number;
  phase2: number;
  speed: number;
  drift: number;
  vx: number;
  vy: number;
  halo: number;
  color: [number, number, number];
};

/**
 * Port of Nocturne-Memory-Core dashboard.html → initArchiveStars()
 * @see https://github.com/Pyruslili/Nocturne-Memory-Core
 */
export function mountArchiveStars(
  canvas: HTMLCanvasElement,
  reduced: boolean,
): ArchiveStarsHandle {
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return { dispose: () => undefined };

  const palette: [number, number, number][] = [
    [239, 224, 196],
    [214, 190, 156],
    [146, 178, 210],
    [101, 139, 181],
    [232, 149, 79],
  ];

  const pointer = { x: -9999, y: -9999, active: false };
  let stars: Star[] = [];
  let dpr = 1;
  let raf = 0;
  let frameTimer = 0;
  let lastStarFrame = 0;
  const targetFps = window.innerWidth < 900 ? 16 : 22;
  const frameInterval = 1000 / targetFps;

  const cancelStarFrame = () => {
    cancelAnimationFrame(raf);
    clearTimeout(frameTimer);
  };

  const scheduleStarFrame = () => {
    if (document.hidden) return;
    clearTimeout(frameTimer);
    frameTimer = window.setTimeout(() => {
      raf = requestAnimationFrame(drawStars);
    }, frameInterval);
  };

  const bounds = () => ({
    w: canvas.clientWidth || window.innerWidth,
    h: canvas.clientHeight || window.innerHeight,
  });

  const makeStars = () => {
    const { w, h } = bounds();
    const count = Math.max(120, Math.min(260, Math.round((w * h) / 7200)));
    stars = Array.from({ length: count }, () => {
      const roll = Math.random();
      const depthRoll = Math.random();
      const depth =
        depthRoll < 0.58
          ? 0.38 + Math.random() * 0.2
          : depthRoll < 0.9
            ? 0.62 + Math.random() * 0.2
            : 0.9 + Math.random() * 0.3;
      const bright = Math.random() > 0.94;
      const color =
        roll < 0.62
          ? palette[0]!
          : roll < 0.82
            ? palette[1]!
            : roll < 0.91
              ? palette[2]!
              : roll < 0.97
                ? palette[3]!
                : palette[4]!;
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        depth,
        bright,
        size:
          (0.32 + Math.pow(Math.random(), 2.2) * 1.55) *
          depth *
          (bright ? 1.55 : 1),
        alpha: (0.075 + Math.random() * 0.24) * (0.58 + depth * 0.5),
        phase: Math.random() * Math.PI * 2,
        phase2: Math.random() * Math.PI * 2,
        speed: 0.00012 + Math.random() * 0.00028,
        drift: (0.35 + Math.random() * 1.8) * depth,
        vx: (Math.random() - 0.5) * (0.004 + depth * 0.008),
        vy: (Math.random() - 0.56) * (0.003 + depth * 0.006),
        halo: bright
          ? 5 + Math.random() * 8
          : Math.random() > 0.9
            ? 2.4 + Math.random() * 2.8
            : 0,
        color,
      };
    });
  };

  const resizeStars = () => {
    const { w, h } = bounds();
    dpr = Math.min(window.devicePixelRatio || 1, 1.15);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    makeStars();
    if (reduced) drawStars(0, false);
  };

  const drawStars = (time: number, loop = true) => {
    const { w, h } = bounds();
    const dt = reduced ? 0 : Math.min(80, Math.max(0, time - (lastStarFrame || time)));
    lastStarFrame = time;
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";

    for (const star of stars) {
      if (!reduced) {
        star.x = (star.x + star.vx * dt + w) % w;
        star.y = (star.y + star.vy * dt + h) % h;
      }

      const breathe = reduced
        ? 0.82
        : 0.72 +
          Math.sin(time * star.speed + star.phase) * 0.28 +
          Math.sin(time * star.speed * 0.37 + star.phase2) * 0.12;
      const x =
        star.x +
        (reduced
          ? 0
          : Math.sin(time * 0.000055 * star.depth + star.phase) * star.drift);
      const y =
        star.y +
        (reduced
          ? 0
          : Math.cos(time * 0.000041 * star.depth + star.phase2) * star.drift);
      const dx = x - pointer.x;
      const dy = y - pointer.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const wake = pointer.active
        ? Math.pow(Math.max(0, 1 - distance / 180), 2)
        : 0;
      const alpha = Math.min(
        0.92,
        star.alpha * Math.max(0.18, breathe) + wake * 0.46,
      );
      const radius =
        star.size * (1 + wake * 0.75 + Math.max(0, breathe - 0.7) * 0.28);
      const [r, g, b] = star.color;

      if (star.halo || wake > 0.08) {
        const haloRadius = Math.max(radius * (star.halo || 4), radius * 4.2);
        const halo = ctx.createRadialGradient(x, y, 0, x, y, haloRadius);
        halo.addColorStop(
          0,
          `rgba(${r},${g},${b},${Math.min(0.32, alpha * 0.58 + wake * 0.09)})`,
        );
        halo.addColorStop(
          0.24,
          `rgba(${r},${g},${b},${Math.min(0.13, alpha * 0.22)})`,
        );
        halo.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.beginPath();
        ctx.fillStyle = halo;
        ctx.arc(x, y, haloRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      if (star.bright && alpha > 0.16) {
        const glint = radius * (2.6 + breathe * 1.3);
        ctx.strokeStyle = `rgba(${r},${g},${b},${alpha * 0.22})`;
        ctx.lineWidth = 0.45;
        ctx.beginPath();
        ctx.moveTo(x - glint, y);
        ctx.lineTo(x + glint, y);
        ctx.moveTo(x, y - glint * 0.65);
        ctx.lineTo(x, y + glint * 0.65);
        ctx.stroke();
      }

      ctx.beginPath();
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
      ctx.arc(x, y, Math.max(0.35, radius), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalCompositeOperation = "source-over";
    if (loop && !reduced) scheduleStarFrame();
  };

  const onPointerMove = (event: PointerEvent) => {
    if (event.pointerType === "touch") return;
    const rect = canvas.getBoundingClientRect();
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
    pointer.active = true;
    if (reduced) drawStars(performance.now(), false);
  };

  const onPointerLeave = () => {
    pointer.active = false;
    if (reduced) drawStars(0, false);
  };

  const onResize = () => {
    cancelStarFrame();
    resizeStars();
    if (!reduced) scheduleStarFrame();
  };

  const onVisibility = () => {
    if (reduced) return;
    if (document.hidden) {
      cancelStarFrame();
    } else {
      lastStarFrame = 0;
      scheduleStarFrame();
    }
  };

  canvas.addEventListener("pointermove", onPointerMove, { passive: true });
  canvas.addEventListener("pointerleave", onPointerLeave);
  window.addEventListener("resize", onResize, { passive: true });
  document.addEventListener("visibilitychange", onVisibility);

  resizeStars();
  if (!reduced) scheduleStarFrame();

  return {
    dispose: () => {
      cancelStarFrame();
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    },
  };
}
