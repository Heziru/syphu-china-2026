import type { SilhouetteAnchor } from "./particleTypes";

type Pt = [number, number];

function samplePolyline(points: Pt[], spacing: number): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[i]!;
    const [x1, y1] = points[i + 1]!;
    const len = Math.hypot(x1 - x0, y1 - y0);
    const n = Math.max(1, Math.ceil(len / spacing));
    for (let k = 0; k < n; k++) {
      const t = k / n;
      out.push([x0 + (x1 - x0) * t, y0 + (y1 - y0) * t]);
    }
  }
  const last = points[points.length - 1]!;
  out.push([last[0], last[1]]);
  return out;
}

/**
 * Circular project-symbol silhouette (right of title).
 * Procedural fallback — not sampling the logo wordmark region.
 */
export function buildSilhouetteAnchors(): SilhouetteAnchor[] {
  const anchors: SilhouetteAnchor[] = [];
  const cx = 0.62;
  const cy = 0.46;

  // Outer ring
  const ring: Pt[] = [];
  for (let i = 0; i <= 40; i++) {
    const a = (i / 40) * Math.PI * 2;
    ring.push([cx + Math.cos(a) * 0.16, cy + Math.sin(a) * 0.2]);
  }
  for (const [x, y] of samplePolyline(ring, 0.028)) {
    anchors.push({ x, y, weight: 1.1, role: "gut" });
  }

  // Soft M skeleton inside the circle (symbol language, not wordmark)
  const m: Pt[] = [
    [cx - 0.08, cy + 0.1],
    [cx - 0.08, cy - 0.1],
    [cx, cy + 0.02],
    [cx + 0.08, cy - 0.1],
    [cx + 0.08, cy + 0.1],
  ];
  for (const [x, y] of samplePolyline(m, 0.014)) {
    anchors.push({ x, y, weight: 1.2, role: "glyph" });
  }

  // Inner network
  anchors.push(
    { x: cx, y: cy, weight: 1.35, role: "core" },
    { x: cx - 0.05, y: cy - 0.04, weight: 0.95, role: "network" },
    { x: cx + 0.05, y: cy - 0.03, weight: 0.95, role: "network" },
    { x: cx + 0.02, y: cy + 0.06, weight: 0.9, role: "network" },
    { x: 0.14, y: 0.22, weight: 0.25, role: "fringe" },
    { x: 0.88, y: 0.72, weight: 0.22, role: "fringe" },
  );

  return anchors;
}
