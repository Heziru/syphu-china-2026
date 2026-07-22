import type { LogoLayout, LogoShard, Point, ShardLayer } from "./shardTypes";

export function createRng(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function centroid(pts: Point[]): Point {
  let x = 0;
  let y = 0;
  for (const p of pts) {
    x += p.x;
    y += p.y;
  }
  const n = Math.max(1, pts.length);
  return { x: x / n, y: y / n };
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = out[i]!;
    out[i] = out[j]!;
    out[j] = tmp;
  }
  return out;
}

type Cell = {
  nx: number;
  ny: number;
  edge: number;
};

function buildCells(
  columns: number,
  rows: number,
  logoNX: number,
  logoNY: number,
  logoRadiusN: number,
  rng: () => number,
): Cell[] {
  const cells: Cell[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < columns; c++) {
      const nx = (c + 0.5) / columns;
      const ny = (r + 0.5) / rows;
      const dx = nx - logoNX;
      const dy = ny - logoNY;
      const dist = Math.hypot(dx, dy);
      if (dist < logoRadiusN * 0.55) continue;
      const edge = Math.min(nx, 1 - nx, ny, 1 - ny);
      cells.push({
        nx: nx + (rng() - 0.5) * (0.7 / columns),
        ny: ny + (rng() - 0.5) * (0.7 / rows),
        edge,
      });
    }
  }
  for (let i = 0; i < 10; i++) {
    const side = Math.floor(rng() * 4);
    let nx = rng();
    let ny = rng();
    if (side === 0) ny = rng() * 0.12;
    if (side === 1) ny = 0.88 + rng() * 0.12;
    if (side === 2) nx = rng() * 0.12;
    if (side === 3) nx = 0.88 + rng() * 0.12;
    cells.push({ nx, ny, edge: 0.02 });
  }
  return shuffle(cells, rng);
}

/**
 * Radial glass shards in logo-normalized space + full-viewport scatter.
 * Polygon / center coords are 0–1 relative to the cropped logo.
 */
export function generateLogoShards(
  countHint: number,
  logoNX: number,
  logoNY: number,
  seed = 2026106,
): LogoShard[] {
  const rng = createRng(seed);
  // Work in a unit square; convert to normalized logo coords at the end.
  // Use a circular domain centered in the logo.
  const cx = 0.5;
  const cy = 0.5;
  const radius = 0.495;

  const rayCount = Math.max(11, Math.round(countHint / 4.5));
  const ringCount = Math.max(4, Math.round(countHint / rayCount));

  const rays: number[] = [];
  let angle = rng() * Math.PI * 2;
  for (let i = 0; i < rayCount; i++) {
    angle += ((Math.PI * 2) / rayCount) * (0.82 + rng() * 0.36);
    rays.push(angle);
  }
  rays.sort((a, b) => a - b);

  const rings: number[] = [0.1 + rng() * 0.04];
  for (let i = 1; i < ringCount; i++) {
    const t = i / ringCount;
    rings.push(
      lerp(0.2, 0.98, t * t * 0.3 + t * 0.7) + (rng() - 0.5) * 0.035,
    );
  }
  rings.push(1);

  const pieces: {
    local: Point[];
    center: Point;
    size: number;
  }[] = [];

  for (let r = 0; r < rings.length - 1; r++) {
    const r0 = rings[r]! * radius;
    const r1 = rings[r + 1]! * radius;
    for (let i = 0; i < rayCount; i++) {
      const a0 = rays[i]!;
      const a1 = rays[(i + 1) % rayCount]!;
      let span = a1 - a0;
      if (span <= 0) span += Math.PI * 2;
      const aMid = a0 + span * (0.35 + rng() * 0.3);
      const jitter = (base: number, amt: number) => base + (rng() - 0.5) * amt;

      const p00: Point = {
        x: cx + Math.cos(jitter(a0, 0.04)) * jitter(r0, radius * 0.02),
        y: cy + Math.sin(jitter(a0, 0.04)) * jitter(r0, radius * 0.02),
      };
      const p10: Point = {
        x: cx + Math.cos(jitter(a1, 0.04)) * jitter(r0, radius * 0.02),
        y: cy + Math.sin(jitter(a1, 0.04)) * jitter(r0, radius * 0.02),
      };
      const p11: Point = {
        x: cx + Math.cos(jitter(a1, 0.05)) * jitter(r1, radius * 0.025),
        y: cy + Math.sin(jitter(a1, 0.05)) * jitter(r1, radius * 0.025),
      };
      const p01: Point = {
        x: cx + Math.cos(jitter(a0, 0.05)) * jitter(r1, radius * 0.025),
        y: cy + Math.sin(jitter(a0, 0.05)) * jitter(r1, radius * 0.025),
      };

      let poly: Point[] = [p00, p10, p11, p01];
      if (rng() > 0.5) {
        poly = [
          p00,
          p10,
          p11,
          {
            x: cx + Math.cos(aMid) * lerp(r0, r1, 0.45 + rng() * 0.35),
            y: cy + Math.sin(aMid) * lerp(r0, r1, 0.45 + rng() * 0.35),
          },
          p01,
        ];
      } else if (rng() > 0.72) {
        poly = [p00, p10, p11];
      }

      const c = centroid(poly);
      // Relative to center, still in normalized logo space
      const local = poly.map((p) => ({ x: p.x - c.x, y: p.y - c.y }));
      let size = 0;
      for (const p of local) size = Math.max(size, Math.hypot(p.x, p.y));
      pieces.push({ local, center: c, size });
    }
  }

  pieces.sort((a, b) => b.size - a.size);
  const targetCount = Math.min(pieces.length, countHint);
  const selected = pieces.slice(0, targetCount);

  const logoRadiusN = 0.22;
  const cells = buildCells(
    8,
    6,
    logoNX,
    logoNY,
    Math.max(0.18, logoRadiusN),
    rng,
  );
  const edgeFirst = cells.slice().sort((a, b) => a.edge - b.edge);

  const shards: LogoShard[] = [];
  for (let i = 0; i < selected.length; i++) {
    const piece = selected[i]!;
    const cell = edgeFirst[i % edgeFirst.length]!;
    const roll = rng();
    let layer: ShardLayer = "midground";
    let scatterScale = 0.92 + rng() * 0.14;

    if (i < selected.length * 0.2) {
      layer = "background";
      scatterScale = 0.78 + rng() * 0.14;
    } else if (i > selected.length * 0.75 || cell.edge < 0.08) {
      layer = "foreground";
      scatterScale = 1.06 + rng() * 0.18;
    }

    let snx = cell.nx;
    let sny = cell.ny;
    if (layer === "midground" && roll > 0.7) {
      snx = lerp(snx, logoNX, 0.12);
      sny = lerp(sny, logoNY, 0.12);
    }

    shards.push({
      localPolygon: piece.local,
      localCenterX: piece.center.x,
      localCenterY: piece.center.y,
      scatterNX: Math.min(1.06, Math.max(-0.06, snx)),
      scatterNY: Math.min(1.06, Math.max(-0.06, sny)),
      scatterRotation: (rng() - 0.5) * 0.7,
      scatterScale,
      delay: rng() * 0.2,
      layer,
    });
  }

  return shards;
}

export function pickShardCount(width: number): number {
  if (width < 480) return 38;
  if (width < 768) return 42;
  if (width < 1200) return 58;
  return 68;
}

/**
 * Single layout for shards, clean logo, and reveal — CSS pixels only.
 */
export function computeLogoLayout(
  viewportWidth: number,
  viewportHeight: number,
  sourceAspectRatio: number,
  isMobile: boolean,
): LogoLayout {
  const maxWidth = isMobile
    ? Math.min(viewportWidth * 0.84, viewportHeight * 0.58, 520)
    : Math.min(viewportWidth * 0.52, viewportHeight * 0.72, 760);

  const width = maxWidth;
  const height = width / sourceAspectRatio;
  const centerX = isMobile ? viewportWidth * 0.5 : viewportWidth * 0.57;
  const centerY = isMobile ? viewportHeight * 0.42 : viewportHeight * 0.46;

  return {
    x: centerX - width / 2,
    y: centerY - height / 2,
    width,
    height,
    centerX,
    centerY,
  };
}

/** @deprecated Use computeLogoLayout — kept name alias for any residual imports. */
export function computeLogoBox(
  viewW: number,
  viewH: number,
  sourceAspectRatio = 971 / (870 * 0.845),
) {
  const layout = computeLogoLayout(viewW, viewH, sourceAspectRatio, viewW < 900);
  return {
    left: layout.x,
    top: layout.y,
    width: layout.width,
    height: layout.height,
  };
}
