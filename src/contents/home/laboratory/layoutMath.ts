/** Deterministic furniture geometry. All distances are metres, yaw is radians. */
export type Vec2 = [number, number];
export type Vec3 = [number, number, number];
export type Size = [number, number, number]; // width, height, depth
export type Transform = { position: Vec3; rotationY: number };
export type Body = Transform & { id: string; size: Size };
export const EPS = 1e-6;
export const ROOM_POLYGON: Vec2[] = [
  [-3.8, -4.6],
  [3.8, -4.6],
  [5.65, 0.5],
  [4.85, 4.45],
  [-4.85, 4.45],
  [-5.65, 0.5],
];
export const normalizeYaw = (v: number) => Math.atan2(Math.sin(v), Math.cos(v));

export function transformPoint(t: Transform, p: Vec3): Vec3 {
  const c = Math.cos(t.rotationY),
    s = Math.sin(t.rotationY);
  return [
    t.position[0] + c * p[0] + s * p[2],
    t.position[1] + p[1],
    t.position[2] - s * p[0] + c * p[2],
  ];
}

export function wallAnchorFromSegment(
  a: Vec2,
  b: Vec2,
  t: number,
  width: number,
  depth: number,
  clearance = 0.04,
  wallThickness = 0.18,
): Transform {
  const dx = b[0] - a[0],
    dz = b[1] - a[1],
    length = Math.hypot(dx, dz);
  if (
    length < EPS ||
    t < 0 ||
    t > 1 ||
    Math.min(width, depth) <= 0 ||
    clearance < 0
  )
    throw new Error("Invalid wall anchor");
  if (Math.min(t, 1 - t) * length < width / 2 + 0.12 - EPS)
    throw new Error("Furniture exceeds its wall segment");
  let nx = -dz / length,
    nz = dx / length;
  const p: Vec2 = [a[0] + dx * t, a[1] + dz * t];
  if (nx * -p[0] + nz * -p[1] < 0) {
    nx = -nx;
    nz = -nz;
  }
  const inset = depth / 2 + wallThickness / 2 + clearance;
  return {
    position: [p[0] + nx * inset, 0, p[1] + nz * inset],
    rotationY: Math.atan2(nx, nz),
  };
}

export function packStrip(widths: number[], gap: number) {
  if (!widths.length || widths.some((w) => w <= 0) || gap < 0)
    throw new Error("Invalid strip");
  const span = widths.reduce((a, b) => a + b, 0) + gap * (widths.length - 1);
  let cursor = -span / 2;
  return {
    span,
    centers: widths.map((w) => {
      const x = cursor + w / 2;
      cursor += w + gap;
      return x;
    }),
  };
}

export function footprintCorners(b: Body): Vec2[] {
  const w = b.size[0] / 2,
    d = b.size[2] / 2;
  return [
    [-w, -d],
    [w, -d],
    [w, d],
    [-w, d],
  ].map(([x, z]) => {
    const p = transformPoint(b, [x, 0, z]);
    return [p[0], p[2]];
  });
}
const dot = (a: Vec2, b: Vec2) => a[0] * b[0] + a[1] * b[1];
export function footprintsOverlap(a: Vec2[], b: Vec2[]) {
  for (const poly of [a, b])
    for (let i = 0; i < 2; i++) {
      const p = poly[i],
        q = poly[(i + 1) % 4],
        length = Math.hypot(q[0] - p[0], q[1] - p[1]);
      const axis: Vec2 = [-(q[1] - p[1]) / length, (q[0] - p[0]) / length];
      const pa = a.map((v) => dot(v, axis)),
        pb = b.map((v) => dot(v, axis));
      if (
        Math.min(Math.max(...pa), Math.max(...pb)) -
          Math.max(Math.min(...pa), Math.min(...pb)) <=
        EPS
      )
        return false;
    }
  return true;
}
export function worldAABB(b: Body) {
  const p = footprintCorners(b),
    xs = p.map((v) => v[0]),
    zs = p.map((v) => v[1]);
  return {
    min: [Math.min(...xs), b.position[1], Math.min(...zs)],
    max: [Math.max(...xs), b.position[1] + b.size[1], Math.max(...zs)],
  };
}
/** AABB broad phase + upright OBB narrow phase. Supporting-face contact is allowed. */
export function validateAABBNoOverlap(bodies: Body[]) {
  const errors: { a: string; b: string }[] = [];
  for (let i = 0; i < bodies.length; i++)
    for (let j = i + 1; j < bodies.length; j++) {
      const a = bodies[i],
        b = bodies[j],
        aa = worldAABB(a),
        bb = worldAABB(b);
      if (
        [0, 1, 2].every(
          (k) =>
            Math.min(aa.max[k], bb.max[k]) - Math.max(aa.min[k], bb.min[k]) >
            EPS,
        ) &&
        footprintsOverlap(footprintCorners(a), footprintCorners(b))
      )
        errors.push({ a: a.id, b: b.id });
    }
  return errors;
}
function pointSegmentDistance(p: Vec2, a: Vec2, b: Vec2) {
  const dx = b[0] - a[0],
    dz = b[1] - a[1],
    l = dx * dx + dz * dz;
  const t =
    l < EPS * EPS
      ? 0
      : Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dz) / l));
  return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dz);
}
export function footprintGap(a: Body, b: Body) {
  const ca = footprintCorners(a),
    cb = footprintCorners(b);
  if (footprintsOverlap(ca, cb)) return 0;
  return Math.min(
    ...ca.flatMap((p) =>
      cb.map((q, i) => pointSegmentDistance(p, q, cb[(i + 1) % 4])),
    ),
    ...cb.flatMap((p) =>
      ca.map((q, i) => pointSegmentDistance(p, q, ca[(i + 1) % 4])),
    ),
  );
}
export type ClearanceRule = { a: string; b: string; min: number };
export function validateClearance(bodies: Body[], rules: ClearanceRule[]) {
  const byId = new Map(bodies.map((b) => [b.id, b]));
  return rules.map((rule) => {
    const a = byId.get(rule.a),
      b = byId.get(rule.b);
    if (!a || !b)
      throw new Error("Missing clearance object: " + rule.a + "/" + rule.b);
    const actual = footprintGap(a, b);
    return { ...rule, actual, valid: actual + EPS >= rule.min };
  });
}
export function validateRoomContainment(bodies: Body[]) {
  const errors: { id: string; edge: number }[] = [];
  for (const body of bodies)
    for (let i = 0; i < ROOM_POLYGON.length; i++) {
      const a = ROOM_POLYGON[i],
        b = ROOM_POLYGON[(i + 1) % ROOM_POLYGON.length];
      const dx = b[0] - a[0],
        dz = b[1] - a[1],
        length = Math.hypot(dx, dz),
        inset = i === 3 ? 0.1 : 0.13;
      if (
        footprintCorners(body).some(
          (p) =>
            (dx * (p[1] - a[1]) - dz * (p[0] - a[0])) / length < inset - EPS,
        )
      )
        errors.push({ id: body.id, edge: i });
    }
  return errors;
}
export const CIRCULATION: Body[] = [
  {
    id: "left-aisle",
    position: [-2.35, 0, 0.875],
    rotationY: 0,
    size: [1, 2, 5.85],
  },
  {
    id: "right-aisle",
    position: [2.35, 0, 0.875],
    rotationY: 0,
    size: [1, 2, 5.85],
  },
  {
    id: "rear-cross-aisle",
    position: [0, 0, -1.65],
    rotationY: 0,
    size: [5.7, 2, 1],
  },
  {
    id: "front-cross-aisle",
    position: [0, 0, 3.625],
    rotationY: 0,
    size: [5.7, 2, 1.05],
  },
];
export function validateCirculation(bodies: Body[]) {
  return CIRCULATION.flatMap((c) =>
    bodies
      .filter((b) => validateAABBNoOverlap([c, b]).length)
      .map((b) => ({ corridor: c.id, obstacle: b.id })),
  );
}
