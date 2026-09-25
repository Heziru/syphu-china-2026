import {
  BufferGeometry,
  Float32BufferAttribute,
  Vector2,
  ShapeUtils,
  Color,
} from "three";
import type { GlobeData } from "./DataGlobe";
export function point(lon: number, lat: number, r: number) {
  const a = (lon * Math.PI) / 180,
    b = (lat * Math.PI) / 180;
  return [
    r * Math.cos(b) * Math.sin(a),
    r * Math.sin(b),
    r * Math.cos(b) * Math.cos(a),
  ];
}
export function geography(data: GlobeData, year: number) {
  const buckets = new Map<
    string,
    { p: number[]; target: number[]; normals: number[] }
  >();
  for (const f of data.features) {
    const key = f.region ?? "No regional estimate",
      value = Number(data.regions[key]?.[year] ?? 0);
    const bucket = buckets.get(key) ?? { p: [], target: [], normals: [] };
    buckets.set(key, bucket);
    let rise = f.region?.length ? Math.min(0.26, (value / 350) * 0.26) : 0.006;
    const vertex = (q: number[], h: number, n?: number[]) => {
      bucket.p.push(...point(q[0], q[1], 2.052));
      bucket.target.push(...point(q[0], q[1], 2.052 + h));
      bucket.normals.push(...(n ?? point(q[0], q[1], 1)));
    };
    const wall = (a: number[], b: number[], c: number[], heights: number[]) => {
      const v = [a, b, c].map((q, i) => point(q[0], q[1], 2.052 + heights[i]));
      const u = v[1].map((q, i) => q - v[0][i]),
        w = v[2].map((q, i) => q - v[0][i]);
      const n = [
        u[1] * w[2] - u[2] * w[1],
        u[2] * w[0] - u[0] * w[2],
        u[0] * w[1] - u[1] * w[0],
      ];
      const l = Math.hypot(...n) || 1;
      [a, b, c].forEach((q, i) =>
        vertex(
          q,
          heights[i],
          n.map((x) => x / l),
        ),
      );
    };
    const tri = (a: number[], b: number[], c: number[], depth = 0) => {
      const unit = [a, b, c].map((q) => point(q[0], q[1], 1));
      const lengths = unit.map((u, i) =>
        Math.hypot(...u.map((n, j) => n - unit[(i + 1) % 3][j])),
      );
      const longest = Math.max(...lengths);
      // Split only the longest spherical edge. Four-way subdivision exploded
      // narrow coastline triangles into millions of almost coincident faces.
      if (depth < 20 && longest > 0.085) {
        const i = lengths.indexOf(longest),
          j = (i + 1) % 3,
          k = (i + 2) % 3;
        const u = unit[i].map((n, index) => n + unit[j][index]),
          len = Math.hypot(...u);
        const mid = [
          (Math.atan2(u[0], u[2]) * 180) / Math.PI,
          (Math.asin(u[1] / len) * 180) / Math.PI,
        ];
        const q = [a, b, c];
        tri(q[i], mid, q[k], depth + 1);
        tri(mid, q[j], q[k], depth + 1);
      } else {
        vertex(a, rise);
        vertex(b, rise);
        vertex(c, rise);
      }
    };
    for (const poly of f.polygons) {
      const origin = poly[0][0][0];
      const rings = poly.map((r) =>
        r.slice(0, -1).map((q) => {
          let x = q[0];
          if (f.iso !== "ATA") {
            while (x - origin > 180) x -= 360;
            while (x - origin < -180) x += 360;
          }
          return [x, q[1]];
        }),
      );
      if (rings[0].length < 3) continue;
      const area = Math.abs(
        ShapeUtils.area(rings[0].map((q) => new Vector2(q[0], q[1]))),
      );
      // Tiny islands retain their outline and data color; flat rendering avoids needle-like extrusions.
      rise =
        area < 0.45
          ? 0.008
          : f.region?.length
            ? Math.min(0.26, (value / 350) * 0.26)
            : 0.006;
      const points = rings.flat();
      const project = (q: number[]) =>
        f.iso === "ATA"
          ? new Vector2(
              (90 + q[1]) * Math.sin((q[0] * Math.PI) / 180),
              (90 + q[1]) * Math.cos((q[0] * Math.PI) / 180),
            )
          : new Vector2(q[0], q[1]);
      const faces = ShapeUtils.triangulateShape(
        rings[0].map(project),
        rings.slice(1).map((r) => r.map(project)),
      );
      for (const [a, b, c] of faces) tri(points[a], points[b], points[c]);
      for (const ring of rings)
        for (let i = 0; i < ring.length; i++) {
          const a = ring[i],
            b = ring[(i + 1) % ring.length];
          wall(a, b, b, [0, 0, rise]);
          wall(a, b, a, [0, rise, rise]);
        }
    }
  }
  return [...buckets].map(([name, b]) => {
    const g = new BufferGeometry();
    g.setAttribute("position", new Float32BufferAttribute(b.p, 3));
    g.morphAttributes.position = [new Float32BufferAttribute(b.target, 3)];
    g.setAttribute("normal", new Float32BufferAttribute(b.normals, 3));
    const v = Number(data.regions[name]?.[year] ?? 0);
    const c = new Color("#eee0b9").lerp(
      new Color("#cd6551"),
      Math.min(1, v / 350),
    );
    return {
      name,
      geometry: g,
      color: name === "No regional estimate" ? new Color("#abb9b4") : c,
    };
  });
}
