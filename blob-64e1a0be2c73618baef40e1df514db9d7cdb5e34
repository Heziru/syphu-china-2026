import type { World } from "./particleFactory";
import type { Particle, SimConfig, Vec2 } from "./particleTypes";
import {
  drawCroppedSymbol,
  getCachedProjectSymbol,
} from "./projectSymbol";
import { ageSediments, pushSediment, sedimentBias } from "./sedimentMemory";

export type PointerState = {
  x: number;
  y: number;
  active: boolean;
};

export type SimRuntime = {
  progress: number;
  /** 1 while holding, -1 while releasing */
  holdSign: number;
  center: Vec2;
  targetCenter: Vec2;
  width: number;
  height: number;
  time: number;
  wasHolding: boolean;
  peakProgress: number;
  /** 0–1 finished emblem render (separate from particle progress) */
  emblemAlpha: number;
  /** Outward burst energy after release (seconds-ish) */
  releaseBurst: number;
  sedimentCaptured: boolean;
};

const COLORS = {
  bacillus: { fill: "#3d9b6a", stroke: "#7ecf4a" },
  plasmid: { fill: "transparent", stroke: "#2a9d9a" },
  dna: { stroke: "#5eb8a8" },
  membrane: { fill: "#1f5c4a", stroke: "#6bb89a" },
  inflam: { fill: "#c45c4a", stroke: "#e08a6a" },
  network: { fill: "#2e8b57", stroke: "#a8dcc0" },
  datum: { stroke: "#8fa8a0" },
  core: "#d8efe4",
  trail: "rgba(126, 207, 74, 0.12)",
  sediment: "rgba(168, 220, 192, 0.08)",
  emblem: "#b8f0c8",
};

function stageFactor(progress: number): {
  damp: number;
  attract: number;
  trail: number;
  inflamFade: number;
  pulse: number;
} {
  if (progress < 0.15) {
    const t = progress / 0.15;
    return {
      damp: 0.15 * t,
      attract: 0.04 * t,
      trail: 0,
      inflamFade: 0,
      pulse: 0,
    };
  }
  if (progress < 0.45) {
    const t = (progress - 0.15) / 0.3;
    return {
      damp: 0.15 + 0.35 * t,
      attract: 0.04 + 0.4 * t,
      trail: 0.4 * t,
      inflamFade: 0.2 * t,
      pulse: 0,
    };
  }
  if (progress < 0.75) {
    const t = (progress - 0.45) / 0.3;
    return {
      damp: 0.5 + 0.3 * t,
      attract: 0.44 + 0.4 * t,
      trail: 0.4 + 0.35 * t,
      inflamFade: 0.2 + 0.5 * t,
      pulse: 0.2 * t,
    };
  }
  const t = (progress - 0.75) / 0.25;
  return {
    damp: 0.8 + 0.15 * t,
    attract: 0.84 + 0.16 * t,
    trail: 0.75,
    inflamFade: 0.7 + 0.25 * t,
    pulse: 0.2 + 0.8 * t,
  };
}

export function createRuntime(width: number, height: number): SimRuntime {
  return {
    progress: 0,
    holdSign: 0,
    center: { x: width * 0.62, y: height * 0.46 },
    targetCenter: { x: width * 0.62, y: height * 0.46 },
    width,
    height,
    time: 0,
    wasHolding: false,
    peakProgress: 0,
    emblemAlpha: 0,
    releaseBurst: 0,
    sedimentCaptured: false,
  };
}

export function stepSimulation(
  world: World,
  runtime: SimRuntime,
  pointer: PointerState,
  config: SimConfig,
  dt: number,
): void {
  runtime.time += dt;
  const holding = runtime.holdSign > 0;

  // Detect release edge → chaos burst + start emblem fade-out
  if (runtime.wasHolding && !holding) {
    runtime.releaseBurst = 1;
    runtime.sedimentCaptured = false;
    for (const p of world.particles) {
      const dx = p.pos.x - runtime.center.x;
      const dy = p.pos.y - runtime.center.y;
      const d = Math.hypot(dx, dy) || 1;
      p.vel.x += (dx / d) * (2.2 + p.depth * 1.4) + (p.id % 5) * 0.08;
      p.vel.y += (dy / d) * (2.0 + p.depth * 1.2) - (p.id % 3) * 0.1;
      p.trail.length = 0;
    }
  }

  if (holding) {
    runtime.progress = Math.min(1, runtime.progress + dt * 0.28);
    runtime.wasHolding = true;
    runtime.peakProgress = Math.max(runtime.peakProgress, runtime.progress);
    runtime.releaseBurst = 0;
    // Emblem renders only near completion while held
    if (runtime.progress >= 0.92) {
      runtime.emblemAlpha = Math.min(1, runtime.emblemAlpha + dt * 2.4);
    } else {
      runtime.emblemAlpha = Math.max(0, runtime.emblemAlpha - dt * 1.5);
    }
  } else {
    runtime.wasHolding = false;
    // Emblem vanishes quickly on release
    runtime.emblemAlpha = Math.max(0, runtime.emblemAlpha - dt * 3.2);
    // Progress decays so attract drops → chaos returns
    if (runtime.progress > 0) {
      const releaseRate = 0.55 + runtime.progress * 0.35;
      runtime.progress = Math.max(0, runtime.progress - dt * releaseRate);
    }
    if (runtime.releaseBurst > 0) {
      runtime.releaseBurst = Math.max(0, runtime.releaseBurst - dt * 1.1);
    }
    if (
      !runtime.sedimentCaptured &&
      runtime.peakProgress > 0.55 &&
      runtime.progress < runtime.peakProgress * 0.85
    ) {
      const sample = world.particles
        .filter((p) => p.anchorIndex >= 0 && p.loyalty > 0.35)
        .slice(0, 22)
        .map((p) => ({ x: p.pos.x, y: p.pos.y }));
      pushSediment(world.sediments, sample, config.maxSedimentLayers);
      runtime.sedimentCaptured = true;
      runtime.peakProgress = 0;
    }
  }

  ageSediments(world.sediments, dt);

  const baseX = runtime.width * 0.5;
  const baseY = runtime.height * 0.48;
  if (pointer.active && holding) {
    runtime.targetCenter.x = baseX + (pointer.x - baseX) * 0.12;
    runtime.targetCenter.y = baseY + (pointer.y - baseY) * 0.1;
  } else {
    runtime.targetCenter.x = baseX;
    runtime.targetCenter.y = baseY;
  }
  runtime.center.x += (runtime.targetCenter.x - runtime.center.x) * 0.06;
  runtime.center.y += (runtime.targetCenter.y - runtime.center.y) * 0.06;

  const stage = stageFactor(runtime.progress);
  // While releasing, kill attract faster than progress alone
  const attract =
    holding ? stage.attract : stage.attract * Math.pow(runtime.progress, 1.6);
  const homePull = holding
    ? 0.004 * (1 - stage.attract * 0.85)
    : 0.018 + (1 - runtime.progress) * 0.025;
  const { width, height } = runtime;

  for (const p of world.particles) {
    const homeX = p.home.x * width;
    const homeY = p.home.y * height;

    const driftX = Math.sin(runtime.time * 0.35 + p.id * 0.7) * 0.2 * p.depth;
    const driftY = Math.cos(runtime.time * 0.28 + p.id * 0.5) * 0.16 * p.depth;

    let ax = 0;
    let ay = 0;

    ax += (homeX - p.pos.x) * homePull;
    ay += (homeY - p.pos.y) * homePull;
    ax += driftX * (holding ? 1 - stage.damp : 0.85);
    ay += driftY * (holding ? 1 - stage.damp : 0.85);

    if (p.anchorIndex >= 0 && attract > 0.02 && holding) {
      const anchor = world.anchors[p.anchorIndex]!;
      const tx =
        anchor.x * width +
        (runtime.center.x - baseX) * 0.35 +
        Math.sin(runtime.time * stage.pulse + p.id) * stage.pulse * 1.5;
      const ty =
        anchor.y * height +
        (runtime.center.y - baseY) * 0.35 +
        Math.cos(runtime.time * stage.pulse * 0.8 + p.id) * stage.pulse * 1.2;
      const pull = attract * p.loyalty * anchor.weight * 0.06;
      ax += (tx - p.pos.x) * pull;
      ay += (ty - p.pos.y) * pull;
    }

    if (world.sediments.length > 0 && holding) {
      const bias = sedimentBias(world.sediments, p.pos.x, p.pos.y);
      ax += bias.x * 0.015;
      ay += bias.y * 0.015;
    }

    if (runtime.releaseBurst > 0 && !holding) {
      ax += (homeX - runtime.center.x) * 0.002 * runtime.releaseBurst;
      ay += (homeY - runtime.center.y) * 0.002 * runtime.releaseBurst;
    }

    const damp = holding ? 0.04 + stage.damp * 0.08 : 0.03;
    p.vel.x = (p.vel.x + ax) * (1 - damp);
    p.vel.y = (p.vel.y + ay) * (1 - damp);

    const spd = Math.hypot(p.vel.x, p.vel.y);
    const maxSpd = holding ? 1.8 * (1 - stage.damp * 0.45) : 4.2;
    if (spd > maxSpd) {
      p.vel.x = (p.vel.x / spd) * maxSpd;
      p.vel.y = (p.vel.y / spd) * maxSpd;
    }

    p.pos.x += p.vel.x;
    p.pos.y += p.vel.y;
    p.rotation += p.spin * (holding ? 1 - stage.damp * 0.7 : 1.4);

    if (config.showTrails && stage.trail > 0.05 && holding) {
      if (p.trail.length >= config.trailLength) {
        p.trail.shift();
      }
      p.trail.push({ x: p.pos.x, y: p.pos.y });
    } else if (p.trail.length) {
      p.trail.length = 0;
    }
  }
}

export function paintFrame(
  ctx: CanvasRenderingContext2D,
  world: World,
  runtime: SimRuntime,
  config: SimConfig,
  staticMode: boolean,
): void {
  const { width, height, progress, time } = runtime;
  const stage = stageFactor(staticMode ? 0.85 : progress);
  const emblemAlpha = staticMode ? 0.85 : runtime.emblemAlpha;

  ctx.clearRect(0, 0, width, height);

  ctx.fillStyle = "rgba(8, 22, 20, 0.35)";
  ctx.fillRect(0, 0, width, height);

  for (const layer of world.sediments) {
    ctx.globalAlpha = layer.strength * 0.35;
    ctx.fillStyle = COLORS.sediment;
    ctx.strokeStyle = COLORS.sediment;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < layer.points.length; i++) {
      const p = layer.points[i]!;
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
    for (const p of layer.points) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;

  if (stage.attract > 0.35) {
    drawNetworkLinks(ctx, world, width, height, stage.attract, stage.inflamFade);
  }

  const order = world.particles;
  for (let i = 0; i < order.length; i++) {
    drawParticle(ctx, order[i]!, stage, config, time, staticMode);
  }

  if (emblemAlpha > 0.02) {
    drawMototypeEmblem(ctx, width, height, emblemAlpha, time);
  }

  if (stage.pulse > 0.05 && emblemAlpha < 0.4) {
    const cx = runtime.center.x;
    const cy = runtime.center.y;
    const r = 18 + Math.sin(time * 1.6) * 3 * stage.pulse;
    ctx.globalAlpha = 0.08 + stage.pulse * 0.1;
    ctx.strokeStyle = COLORS.core;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

function drawMototypeEmblem(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  alpha: number,
  time: number,
): void {
  const cx = width * 0.58;
  const cy = height * 0.46;
  const breathe = 1 + Math.sin(time * 1.4) * 0.01;
  const size = Math.min(width, height) * (width < 768 ? 0.42 : 0.38);
  const logo = getCachedProjectSymbol();

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(breathe, breathe);

  // Soft membrane glow behind symbol
  ctx.globalAlpha = alpha * 0.35;
  const glow = ctx.createRadialGradient(0, 0, size * 0.15, 0, 0, size * 0.55);
  glow.addColorStop(0, "rgba(46, 139, 87, 0.35)");
  glow.addColorStop(1, "rgba(46, 139, 87, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.55, 0, Math.PI * 2);
  ctx.fill();

  // Fine connection arcs
  ctx.globalAlpha = alpha * 0.4;
  ctx.strokeStyle = "rgba(168, 220, 192, 0.7)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.48, -0.8, 0.9);
  ctx.stroke();

  if (logo) {
    const dw = size;
    const dh = size * (870 / 971);
    drawCroppedSymbol(ctx, logo, -dw / 2, -dh / 2, dw, dh, alpha);
  } else {
    // Procedural fallback if logo fails to load
    ctx.globalAlpha = alpha * 0.9;
    ctx.strokeStyle = COLORS.emblem;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.32, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-size * 0.18, size * 0.2);
    ctx.lineTo(-size * 0.18, -size * 0.22);
    ctx.lineTo(0, size * 0.05);
    ctx.lineTo(size * 0.18, -size * 0.22);
    ctx.lineTo(size * 0.18, size * 0.2);
    ctx.stroke();
  }

  ctx.restore();
  ctx.globalAlpha = 1;
}

function drawNetworkLinks(
  ctx: CanvasRenderingContext2D,
  world: World,
  width: number,
  height: number,
  attract: number,
  inflamFade: number,
): void {
  const nodes = world.particles.filter(
    (p) =>
      (p.kind === "network" || p.kind === "bacillus" || p.kind === "plasmid") &&
      p.anchorIndex >= 0,
  );
  ctx.lineWidth = 0.8;
  ctx.strokeStyle = `rgba(110, 180, 150, ${0.08 + attract * 0.18 * (1 - inflamFade * 0.3)})`;
  const limit = Math.min(nodes.length, 14);
  for (let i = 0; i < limit; i++) {
    const a = nodes[i]!;
    const b = nodes[(i + 3) % nodes.length]!;
    const dx = a.pos.x - b.pos.x;
    const dy = a.pos.y - b.pos.y;
    if (dx * dx + dy * dy > (width * 0.22) ** 2) continue;
    ctx.beginPath();
    ctx.moveTo(a.pos.x, a.pos.y);
    ctx.lineTo(b.pos.x, b.pos.y);
    ctx.stroke();
  }
  void height;
}

function drawParticle(
  ctx: CanvasRenderingContext2D,
  p: Particle,
  stage: ReturnType<typeof stageFactor>,
  config: SimConfig,
  time: number,
  staticMode: boolean,
): void {
  let alpha = p.alpha;
  if (p.kind === "inflam") {
    alpha *= 1 - stage.inflamFade * 0.85;
  }
  if (alpha < 0.04) return;

  if (config.showTrails && p.trail.length > 1 && stage.trail > 0) {
    ctx.globalAlpha = alpha * 0.25 * stage.trail;
    ctx.strokeStyle = COLORS.trail;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(p.trail[0]!.x, p.trail[0]!.y);
    for (let i = 1; i < p.trail.length; i++) {
      ctx.lineTo(p.trail[i]!.x, p.trail[i]!.y);
    }
    ctx.stroke();
  }

  ctx.save();
  ctx.translate(p.pos.x, p.pos.y);
  ctx.rotate(p.rotation + (staticMode ? 0 : Math.sin(time * 0.5 + p.id) * 0.02));
  ctx.globalAlpha = alpha;

  const s = p.size;

  switch (p.kind) {
    case "bacillus": {
      const c = COLORS.bacillus;
      ctx.fillStyle = c.fill;
      ctx.strokeStyle = c.stroke;
      ctx.lineWidth = 1;
      roundRect(ctx, -s * 1.1, -s * 0.35, s * 2.2, s * 0.7, s * 0.35);
      ctx.fill();
      ctx.stroke();
      break;
    }
    case "plasmid": {
      ctx.strokeStyle = COLORS.plasmid.stroke;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 0.9, s * 0.7, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(s * 0.55, 0, 1.6, 0, Math.PI * 2);
      ctx.fillStyle = COLORS.plasmid.stroke;
      ctx.fill();
      break;
    }
    case "dna": {
      ctx.strokeStyle = COLORS.dna.stroke;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let i = 0; i <= 6; i++) {
        const t = i / 6;
        const x = (t - 0.5) * s * 2.4;
        const y = Math.sin(t * Math.PI * 2) * s * 0.35;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      break;
    }
    case "membrane": {
      ctx.strokeStyle = COLORS.membrane.stroke;
      ctx.fillStyle = COLORS.membrane.fill;
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.arc(0, 0, s, -0.6, 1.8);
      ctx.stroke();
      ctx.globalAlpha = alpha * 0.35;
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.85, -0.4, 1.5);
      ctx.lineTo(0, 0);
      ctx.fill();
      break;
    }
    case "inflam": {
      ctx.fillStyle = COLORS.inflam.fill;
      ctx.strokeStyle = COLORS.inflam.stroke;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.7);
      ctx.lineTo(0, s * 0.7);
      ctx.moveTo(-s * 0.55, 0);
      ctx.lineTo(s * 0.55, 0);
      ctx.stroke();
      break;
    }
    case "network": {
      ctx.fillStyle = COLORS.network.fill;
      ctx.strokeStyle = COLORS.network.stroke;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      break;
    }
    case "datum": {
      ctx.strokeStyle = COLORS.datum.stroke;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-s, 0);
      ctx.lineTo(s, 0);
      ctx.moveTo(-s * 0.4, -s * 0.35);
      ctx.lineTo(-s * 0.4, s * 0.35);
      ctx.moveTo(s * 0.5, -s * 0.25);
      ctx.lineTo(s * 0.5, s * 0.25);
      ctx.stroke();
      break;
    }
  }

  ctx.restore();
  ctx.globalAlpha = 1;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

/** Layout particles into a static partial aggregation for reduced-motion. */
export function applyStaticPose(world: World, width: number, height: number): void {
  for (const p of world.particles) {
    if (p.anchorIndex >= 0) {
      const a = world.anchors[p.anchorIndex]!;
      p.pos.x = a.x * width + (p.home.x - 0.5) * 8;
      p.pos.y = a.y * height + (p.home.y - 0.5) * 8;
    } else {
      p.pos.x = p.home.x * width;
      p.pos.y = p.home.y * height;
    }
    p.trail.length = 0;
  }
}
