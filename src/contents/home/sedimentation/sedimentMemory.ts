import type { SedimentLayer, Vec2 } from "./particleTypes";

export function pushSediment(
  layers: SedimentLayer[],
  points: Vec2[],
  maxLayers: number,
): void {
  if (points.length === 0) return;
  layers.unshift({
    points: points.map((p) => ({ x: p.x, y: p.y })),
    age: 0,
    strength: 0.55,
  });
  while (layers.length > maxLayers) {
    layers.pop();
  }
}

export function ageSediments(layers: SedimentLayer[], dt: number): void {
  for (let i = layers.length - 1; i >= 0; i--) {
    const layer = layers[i]!;
    layer.age += dt;
    layer.strength = Math.max(0, layer.strength - dt * 0.015);
    if (layer.strength <= 0.02) {
      layers.splice(i, 1);
    }
  }
}

/** Soft bias toward past sediment points (decision residue). */
export function sedimentBias(
  layers: SedimentLayer[],
  x: number,
  y: number,
): Vec2 {
  let bx = 0;
  let by = 0;
  let wsum = 0;
  for (const layer of layers) {
    for (const p of layer.points) {
      const dx = p.x - x;
      const dy = p.y - y;
      const d2 = dx * dx + dy * dy + 40;
      const w = (layer.strength * 18) / d2;
      bx += dx * w;
      by += dy * w;
      wsum += w;
    }
  }
  if (wsum < 1e-6) return { x: 0, y: 0 };
  return { x: bx / wsum, y: by / wsum };
}
