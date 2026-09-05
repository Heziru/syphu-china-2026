import {
  Box3,
  BufferGeometry,
  CatmullRomCurve3,
  ExtrudeGeometry,
  Float32BufferAttribute,
  Group,
  Mesh,
  MeshToonMaterial,
  Shape,
  SphereGeometry,
  TorusGeometry,
  TubeGeometry,
  Vector3,
  type Material,
} from "three";

export const RESEARCHER_REVISION = 3;
export const RESEARCHER_COLORS = {
  skin: "#F4D7C5",
  labCoat: "#F5F5F2",
  hair: "#664432",
  inner: "#1F4E45",
  dark: "#2D3A3A",
  accent: "#A6ABA9",
} as const;
export type ResearcherModelOptions = { style?: "concept" };
export const DEFAULT_RESEARCHER_OPTIONS: Required<ResearcherModelOptions> = {
  style: "concept",
};
export type ResearcherStats = {
  triangles: number;
  meshes: number;
  materials: number;
  parts: string[];
};
export type ResearcherBuild = {
  group: Group;
  stats: ResearcherStats;
  materials: MeshToonMaterial[];
};
type V = [number, number, number];
type Ring = [number, number, number, number?];
function materials() {
  const palette = {
    ...RESEARCHER_COLORS,
    white: "#FFFFFF",
    seam: "#DADDD8",
    pupil: "#302C28",
    lip: "#BD816F",
    hairLight: "#78503A",
    hairDark: "#503626",
  };
  return Object.fromEntries(
    Object.entries(palette).map(([id, color]) => {
      const mat = new MeshToonMaterial({ color });
      mat.name = `researcher-${id}`;
      return [id, mat];
    }),
  ) as Record<keyof typeof palette, MeshToonMaterial>;
}
type Mats = ReturnType<typeof materials>;
function part(parent: Group, name: string, pivot: V = [0, 0, 0]) {
  const g = new Group();
  g.name = name;
  g.position.set(...pivot);
  g.userData = {
    componentId: name,
    restPosition: [...pivot],
    detachable: true,
    staticPose: true,
  };
  parent.add(g);
  return g;
}
function mesh(
  parent: Group,
  name: string,
  geometry: BufferGeometry,
  material: Material,
  p: V = [0, 0, 0],
) {
  const m = new Mesh(geometry, material);
  m.name = name;
  m.position.set(...p);
  m.castShadow = true;
  m.receiveShadow = true;
  parent.add(m);
  return m;
}
function ellipsoid(
  parent: Group,
  name: string,
  m: Material,
  p: V,
  size: V,
  seg = 18,
) {
  const g = new SphereGeometry(1, seg, 12);
  g.scale(...size);
  return mesh(parent, name, g, m, p);
}
function geometry(positions: number[], indices: number[]) {
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(positions, 3));
  g.setIndex(indices);
  g.computeVertexNormals();
  return g;
}
/** Closed elliptical loft: continuous cloth contours rather than stacked cylinders. */
function loft(rings: Ring[], segments = 28) {
  const pos: number[] = [],
    idx: number[] = [];
  for (const [y, w, d, z = 0] of rings)
    for (let j = 0; j < segments; j++) {
      const a = (j / segments) * Math.PI * 2;
      pos.push(Math.sin(a) * w, y, Math.cos(a) * d + z);
    }
  for (let i = 0; i < rings.length - 1; i++)
    for (let j = 0; j < segments; j++) {
      const a = i * segments + j,
        b = i * segments + ((j + 1) % segments),
        c = a + segments,
        d = b + segments;
      idx.push(a, b, c, b, d, c);
    }
  for (const top of [false, true]) {
    const r = top ? rings.length - 1 : 0,
      [y, , , z = 0] = rings[r],
      center = pos.length / 3;
    pos.push(0, y, z);
    for (let j = 0; j < segments; j++) {
      const a = r * segments + j,
        b = r * segments + ((j + 1) % segments);
      idx.push(center, top ? a : b, top ? b : a);
    }
  }
  return geometry(pos, idx);
}
/** Closed variable-section sweep using a transported frame through the elbow/fringe. */
function sweep(
  points: V[],
  widths: number[],
  depths: number[],
  steps = 20,
  radial = 12,
) {
  const curve = new CatmullRomCurve3(points.map((p) => new Vector3(...p))),
    frames = curve.computeFrenetFrames(steps, false),
    pos: number[] = [],
    idx: number[] = [];
  const sample = (v: number[], t: number) => {
    const f = t * (v.length - 1),
      i = Math.min(Math.floor(f), v.length - 2);
    return v[i] + (v[i + 1] - v[i]) * (f - i);
  };
  for (let i = 0; i <= steps; i++) {
    const t = i / steps,
      p = curve.getPointAt(t),
      w = sample(widths, t),
      d = sample(depths, t);
    for (let j = 0; j < radial; j++) {
      const a = (j / radial) * Math.PI * 2,
        v = p
          .clone()
          .addScaledVector(frames.normals[i], Math.cos(a) * w)
          .addScaledVector(frames.binormals[i], Math.sin(a) * d);
      pos.push(v.x, v.y, v.z);
    }
  }
  for (let i = 0; i < steps; i++)
    for (let j = 0; j < radial; j++) {
      const a = i * radial + j,
        b = i * radial + ((j + 1) % radial);
      idx.push(a, a + radial, b, b, a + radial, b + radial);
    }
  for (const top of [false, true]) {
    const p = curve.getPointAt(top ? 1 : 0),
      c = pos.length / 3;
    pos.push(p.x, p.y, p.z);
    const base = top ? steps * radial : 0;
    for (let j = 0; j < radial; j++) {
      const a = base + j,
        b = base + ((j + 1) % radial);
      idx.push(c, top ? b : a, top ? a : b);
    }
  }
  // Outward winding in the transported Frenet frame.
  for (let i = 0; i < idx.length; i += 3)
    [idx[i + 1], idx[i + 2]] = [idx[i + 2], idx[i + 1]];
  return geometry(pos, idx);
}
function line(
  parent: Group,
  name: string,
  points: V[],
  radius: number,
  mat: Material,
  steps = 20,
) {
  return mesh(
    parent,
    name,
    new TubeGeometry(
      new CatmullRomCurve3(points.map((p) => new Vector3(...p))),
      steps,
      radius,
      6,
      false,
    ),
    mat,
  );
}
function panel(points: [number, number][], depth: number, bevel = 0.003) {
  const s = new Shape();
  s.moveTo(...points[0]);
  points.slice(1).forEach((p) => s.lineTo(...p));
  s.closePath();
  return new ExtrudeGeometry(s, {
    depth,
    bevelEnabled: false,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 2,
    steps: 1,
    curveSegments: 8,
  });
}
function roundedPanel(w: number, h: number, depth: number, r = 0.012) {
  const s = new Shape(),
    x = -w / 2,
    y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return new ExtrudeGeometry(s, {
    depth,
    bevelEnabled: true,
    bevelSize: 0.002,
    bevelThickness: 0.002,
    bevelSegments: 2,
    steps: 1,
    curveSegments: 5,
  });
}
function body(root: Group, m: Mats) {
  const b = part(root, "body");
  mesh(
    b,
    "sweater",
    loft([
      [0.65, 0.128, 0.082],
      [0.73, 0.136, 0.091],
      [0.97, 0.132, 0.093],
      [1.15, 0.155, 0.093],
      [1.21, 0.139, 0.082],
      [1.25, 0.064, 0.052],
    ]),
    m.inner,
  );
  mesh(
    b,
    "ribbed-collar",
    loft([
      [1.21, 0.062, 0.051],
      [1.29, 0.059, 0.049],
    ]),
    m.inner,
  );
  mesh(
    b,
    "neck",
    loft([
      [1.265, 0.045, 0.04],
      [1.34, 0.047, 0.041],
    ]),
    m.skin,
  );
  for (const sign of [-1, 1]) {
    const side = sign === 1 ? "left" : "right",
      leg = part(b, `trouser-${side}`, [sign * 0.105, 0, 0]);
    mesh(
      leg,
      "cloth",
      loft([
        [0.077, 0.076, 0.065, 0.003],
        [0.105, 0.079, 0.073],
        [0.32, 0.066, 0.068],
        [0.5, 0.061, 0.061],
        [0.68, 0.052, 0.059],
        [0.76, 0.05, 0.054],
      ]),
      m.dark,
    );
    const shoe = part(b, `shoe-${side}`, [sign * 0.105, 0.04, 0.035]);
    const sole = new SphereGeometry(1, 24, 12);
    sole.scale(0.08, 0.025, 0.124);
    const p = sole.getAttribute("position");
    for (let i = 0; i < p.count; i++)
      p.setY(i, Math.max(-0.04, p.getY(i) - 0.022));
    sole.computeVertexNormals();
    mesh(shoe, "sole", sole, m.seam);
    const upper = new SphereGeometry(1, 24, 14);
    upper.scale(0.075, 0.056, 0.113);
    const up = upper.getAttribute("position");
    for (let i = 0; i < up.count; i++) up.setY(i, Math.max(-0.024, up.getY(i)));
    upper.computeVertexNormals();
    mesh(shoe, "upper", upper, m.white);
    line(
      shoe,
      "toe-seam",
      [
        [-0.058, 0.014, 0.076],
        [0, 0.029, 0.112],
        [0.058, 0.014, 0.076],
      ],
      0.0018,
      m.seam,
    );
  }
}
/** Continuous thick open-front coat; both surfaces, hem and opening edges are connected. */
function coatShell() {
  const rings: Ring[] = [
    [0.43, 0.195, 0.116],
    [0.49, 0.194, 0.117],
    [0.68, 0.182, 0.115],
    [0.9, 0.159, 0.11],
    [1.1, 0.166, 0.11],
    [1.17, 0.163, 0.103],
    [1.215, 0.15, 0.091],
    [1.245, 0.119, 0.075],
    [1.27, 0.067, 0.052],
  ];
  const n = 48,
    stride = n + 1,
    count = rings.length * stride,
    pos: number[] = [],
    idx: number[] = [];
  for (let inner = 0; inner < 2; inner++)
    for (let i = 0; i < rings.length; i++) {
      const [y, w, d] = rings[i],
        gap = i < 4 ? 0.36 : 0.4;
      for (let j = 0; j <= n; j++) {
        const a = gap + (j / n) * (Math.PI * 2 - 2 * gap),
          thickness = inner * 0.009,
          vent =
            i === 0 ? 0.057 * Math.exp(-Math.pow((a - Math.PI) / 0.09, 2)) : 0;
        pos.push(
          Math.sin(a) * (w - thickness),
          y + vent,
          Math.cos(a) * (d - thickness) - 0.004,
        );
      }
    }
  for (let inner = 0; inner < 2; inner++)
    for (let i = 0; i < rings.length - 1; i++)
      for (let j = 0; j < n; j++) {
        const a = inner * count + i * stride + j,
          b = a + 1,
          c = a + stride,
          d = c + 1;
        if (inner) idx.push(a, c, b, b, c, d);
        else idx.push(a, b, c, b, d, c);
      }
  for (let i = 0; i < rings.length - 1; i++)
    for (const j of [0, n]) {
      const a = i * stride + j,
        b = a + stride;
      if (j === 0) idx.push(a, b, a + count, b, b + count, a + count);
      else idx.push(a, a + count, b, b, a + count, b + count);
    }
  for (const i of [0, rings.length - 1])
    for (let j = 0; j < n; j++) {
      const a = i * stride + j,
        b = a + 1;
      if (i === 0) idx.push(a, a + count, b, b, a + count, b + count);
      else idx.push(a, b, a + count, b, b + count, a + count);
    }
  return geometry(pos, idx);
}
function coat(root: Group, m: Mats) {
  const c = part(root, "coat");
  mesh(c, "open-cloth-shell", coatShell(), m.labCoat);
  for (const sign of [-1, 1]) {
    const lapel = part(c, `lapel-${sign === 1 ? "left" : "right"}`),
      points: [number, number][] = [
        [0.056, 1.266],
        [0.116, 1.23],
        [0.142, 1.169],
        [0.11, 1.156],
        [0.134, 1.12],
        [0.047, 1.015],
        [0.075, 1.175],
      ];
    const mirrored = points.map(([x, y]) => [sign * x, y] as [number, number]);
    if (sign < 0) mirrored.reverse();
    mesh(lapel, "folded-lapel", panel(mirrored, 0.009), m.white, [0, 0, 0.095]);
    const pocket = part(c, `pocket-${sign === 1 ? "left" : "right"}`, [
      sign * 0.137,
      0.64,
      0.086,
    ]);
    pocket.rotation.y = sign * 0.4;
    mesh(pocket, "patch", roundedPanel(0.082, 0.11, 0.007, 0.008), m.labCoat);
    line(
      pocket,
      "pocket-opening",
      [
        [-0.036, 0.044, 0.011],
        [0, 0.042, 0.014],
        [0.036, 0.044, 0.011],
      ],
      0.002,
      m.seam,
    );
  }
  // Begin each sleeve inside the coat shell, then widen over the shoulder.
  // The overlap hides the old ball-and-tube seam without adding a visible cap.
  const right = part(c, "sleeve-right", [-0.145, 1.19, -0.002]);
  mesh(
    right,
    "continuous-sleeve",
    sweep(
      [
        [0, 0, 0],
        [-0.035, -0.085, 0.004],
        [-0.072, -0.235, 0.017],
        [-0.105, -0.45, 0.042],
      ],
      [0.068, 0.066, 0.058, 0.049],
      [0.063, 0.061, 0.055, 0.047],
      28,
    ),
    m.labCoat,
  );
  const left = part(c, "sleeve-left", [0.145, 1.19, -0.002]);
  mesh(
    left,
    "upper-bent-sleeve",
    sweep(
      [
        [0, 0, 0],
        [0.045, -0.075, 0.018],
        [0.085, -0.15, 0.06],
        [0.11, -0.195, 0.105],
      ],
      [0.068, 0.064, 0.055, 0.048],
      [0.063, 0.059, 0.052, 0.045],
      28,
    ),
    m.labCoat,
  );
  const forearm = part(left, "forearm-sleeve", [0.108, -0.19, 0.102]);
  mesh(
    forearm,
    "raised-forearm-sleeve",
    sweep(
      [
        [0, 0, 0],
        [-0.024, 0.012, 0.047],
        [-0.049, 0.024, 0.095],
        [-0.074, 0.036, 0.142],
      ],
      [0.043, 0.042, 0.04, 0.037],
      [0.041, 0.04, 0.038, 0.035],
      28,
    ),
    m.labCoat,
  );
  for (const sign of [-1, 1])
    line(
      c,
      `shoulder-seam-${sign < 0 ? "right" : "left"}`,
      [
        [sign * 0.09, 1.19, 0.087],
        [sign * 0.135, 1.18, 0.083],
        [sign * 0.175, 1.15, 0.068],
      ],
      0.0015,
      m.seam,
      10,
    );
  const handR = part(root, "hand-right", [-0.25, 0.697, 0.04]);
  ellipsoid(handR, "palm", m.skin, [0, 0, 0], [0.032, 0.058, 0.027]);
  ellipsoid(
    handR,
    "thumb",
    m.skin,
    [0.028, 0.012, 0.018],
    [0.014, 0.03, 0.016],
  );
  for (let i = 0; i < 3; i++)
    line(
      handR,
      `finger-${i}`,
      [
        [-0.018 + i * 0.013, -0.008, 0.026],
        [-0.017 + i * 0.013, -0.034, 0.021],
      ],
      0.0013,
      m.lip,
      5,
    );
  const handL = part(root, "hand-left", [0.179, 1.036, 0.242]);
  handL.rotation.z = -0.45;
  ellipsoid(handL, "palm", m.skin, [0, 0, 0], [0.044, 0.054, 0.026]);
  ellipsoid(
    handL,
    "thumb",
    m.skin,
    [-0.026, 0.034, 0.012],
    [0.018, 0.034, 0.017],
  );
  for (let i = 0; i < 3; i++)
    line(
      handL,
      `finger-${i}`,
      [
        [-0.031, -0.016 + i * 0.013, 0.024],
        [0.006, -0.024 + i * 0.013, 0.028],
        [0.03, -0.016 + i * 0.013, 0.021],
      ],
      0.0014,
      m.lip,
      8,
    );
  line(
    c,
    "back-waist-seam",
    [
      [-0.12, 0.91, -0.077],
      [0, 0.905, -0.117],
      [0.12, 0.91, -0.077],
    ],
    0.0015,
    m.seam,
  );
  ellipsoid(
    c,
    "badge",
    m.inner,
    [-0.137, 1.09, 0.087],
    [0.018, 0.022, 0.004],
    16,
  );
  line(
    c,
    "badge-stem",
    [
      [-0.137, 1.074, 0.092],
      [-0.137, 1.1, 0.092],
    ],
    0.002,
    m.white,
    4,
  );
}
function head(root: Group, m: Mats) {
  const h = part(root, "head", [0, 1.443, 0.006]),
    g = new SphereGeometry(1, 40, 28),
    p = g.getAttribute("position");
  // One unified craniofacial surface, shaped continuously through cheeks and jaw.
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i),
      y = p.getY(i),
      z = p.getZ(i),
      jaw = 1 - 0.19 * Math.pow(Math.max(0, -y), 1.25),
      cheek = 1 + 0.055 * Math.exp(-Math.pow((y + 0.22) / 0.3, 2));
    p.setXYZ(
      i,
      x * 0.169 * jaw * cheek,
      y * 0.181,
      z * 0.139 +
        (z > 0 ? 0.012 * Math.exp(-Math.pow((y + 0.18) / 0.46, 2)) * z : 0),
    );
  }
  g.computeVertexNormals();
  mesh(h, "unified-face", g, m.skin);
  for (const sign of [-1, 1]) {
    ellipsoid(
      h,
      `ear-${sign}`,
      m.skin,
      [sign * 0.163, -0.035, 0.001],
      [0.027, 0.044, 0.028],
    );
    ellipsoid(
      h,
      `ear-inner-${sign}`,
      m.lip,
      [sign * 0.177, -0.035, 0.017],
      [0.012, 0.026, 0.009],
      16,
    );
  }
  const face = part(h, "face");
  for (const sign of [-1, 1]) {
    const x = sign * 0.065;
    ellipsoid(
      face,
      `eye-${sign}`,
      m.pupil,
      [x, -0.013, 0.146],
      [0.0165, 0.024, 0.0075],
    );
    ellipsoid(
      face,
      `catchlight-${sign}`,
      m.white,
      [x - 0.004, -0.006, 0.154],
      [0.0045, 0.0055, 0.002],
      12,
    );
    line(
      face,
      `brow-${sign}`,
      [
        [x - 0.023, 0.027, 0.139],
        [x, 0.033, 0.148],
        [x + 0.022, 0.027, 0.138],
      ],
      0.0035,
      m.hairDark,
      12,
    );
  }
  ellipsoid(face, "nose", m.skin, [0, -0.051, 0.149], [0.017, 0.017, 0.021]);
  line(
    face,
    "smile",
    [
      [-0.021, -0.083, 0.133],
      [-0.012, -0.09, 0.138],
      [0, -0.093, 0.14],
      [0.012, -0.09, 0.138],
      [0.021, -0.083, 0.133],
    ],
    0.0025,
    m.lip,
    16,
  );
  const glasses = part(h, "glasses");
  for (const sign of [-1, 1]) {
    const ring = mesh(
      glasses,
      `round-frame-${sign}`,
      new TorusGeometry(0.048, 0.0044, 7, 40),
      m.accent,
      [sign * 0.063, -0.014, 0.16],
    );
    ring.scale.y = 0.91;
    line(
      glasses,
      `temple-${sign}`,
      [
        [sign * 0.112, -0.004, 0.16],
        [sign * 0.153, 0, 0.12],
        [sign * 0.17, -0.009, 0.032],
      ],
      0.0045,
      m.accent,
    );
  }
  line(
    glasses,
    "bridge",
    [
      [-0.015, -0.008, 0.163],
      [-0.009, 0.003, 0.167],
      [0.009, 0.003, 0.167],
      [0.015, -0.008, 0.163],
    ],
    0.004,
    m.accent,
    12,
  );
  hair(h, m);
}
function hair(h: Group, m: Mats) {
  const hair = part(h, "hair"),
    n = 48,
    rings = 18,
    pos: number[] = [],
    idx: number[] = [];
  // Continuous head-local cap trimmed by a varying angular hairline, not an entire covering sphere.
  for (let i = 0; i <= rings; i++)
    for (let j = 0; j <= n; j++) {
      const a = (j / n) * Math.PI * 2,
        front = Math.max(0, Math.cos(a)),
        end = 2.4 - 1.1 * Math.pow(front, 3),
        theta = 0.012 + ((end - 0.012) * i) / rings;
      pos.push(
        0.181 * Math.sin(theta) * Math.sin(a),
        0.012 + 0.191 * Math.cos(theta),
        -0.012 + 0.154 * Math.sin(theta) * Math.cos(a),
      );
    }
  for (let i = 0; i < rings; i++)
    for (let j = 0; j < n; j++) {
      const a = i * (n + 1) + j,
        b = a + 1,
        c = a + n + 1;
      idx.push(a, c, b, b, c, c + 1);
    }
  mesh(hair, "scalp-shell", geometry(pos, idx), m.hair);
  const bun = part(hair, "bun", [0, 0.18, -0.091]);
  ellipsoid(bun, "gathered-bun", m.hair, [0, 0, 0], [0.077, 0.077, 0.072], 28);
  for (let i = -2; i <= 2; i++) {
    const x = i * 0.022;
    line(
      bun,
      `bun-fold-${i}`,
      [
        [x * 0.5, 0.067, 0.012],
        [x, 0.037, 0.061],
        [x * 0.85, -0.025, 0.059],
        [x * 0.4, -0.06, 0.019],
      ],
      0.0017,
      m.hairDark,
      18,
    );
  }
  const locks: {
    id: string;
    root: [number, number];
    points: V[];
    w: number[];
    d: number[];
    light?: boolean;
  }[] = [
    {
      id: "swept-bang",
      root: [-0.35, 0.54],
      points: [
        [-0.056, 0.165, 0.069],
        [-0.077, 0.126, 0.131],
        [-0.116, 0.065, 0.138],
        [-0.145, 0.016, 0.104],
      ],
      w: [0.025, 0.047, 0.036, 0.001],
      d: [0.018, 0.024, 0.018, 0.001],
      light: true,
    },
    {
      id: "center-bang",
      root: [0.22, 0.4],
      points: [
        [0.036, 0.175, 0.059],
        [0.017, 0.132, 0.14],
        [-0.009, 0.082, 0.161],
        [-0.056, 0.049, 0.143],
      ],
      w: [0.026, 0.042, 0.027, 0.001],
      d: [0.021, 0.027, 0.016, 0.001],
    },
    {
      id: "parted-bang",
      root: [0.49, 0.55],
      points: [
        [0.078, 0.157, 0.073],
        [0.1, 0.115, 0.125],
        [0.131, 0.056, 0.124],
        [0.147, 0.009, 0.089],
      ],
      w: [0.022, 0.033, 0.025, 0.001],
      d: [0.018, 0.021, 0.016, 0.001],
    },
    {
      id: "temple-right",
      root: [-1.28, 1.35],
      points: [
        [-0.171, 0.056, 0.025],
        [-0.174, -0.013, 0.051],
        [-0.159, -0.096, 0.049],
        [-0.144, -0.157, 0.025],
      ],
      w: [0.016, 0.016, 0.011, 0.001],
      d: [0.014, 0.012, 0.009, 0.001],
    },
    {
      id: "temple-left",
      root: [1.28, 1.35],
      points: [
        [0.17, 0.052, 0.025],
        [0.176, -0.018, 0.048],
        [0.161, -0.099, 0.042],
        [0.145, -0.15, 0.023],
      ],
      w: [0.016, 0.015, 0.009, 0.001],
      d: [0.014, 0.011, 0.008, 0.001],
    },
  ];
  for (const lock of locks) {
    const l = mesh(
      hair,
      lock.id,
      sweep(lock.points, lock.w, lock.d, 22, 10),
      lock.light ? m.hairLight : m.hair,
    );
    l.userData.scalpRootUV = lock.root;
    l.userData.rootEmbedDepth = 0.012;
  }
  for (let i = -3; i <= 3; i++) {
    const a = Math.PI + i * 0.29,
      pts: V[] = [];
    for (let k = 0; k <= 6; k++) {
      const t = 0.48 + (k / 6) * 1.73;
      pts.push([
        Math.sin(a) * 0.182 * Math.sin(t),
        0.012 + 0.193 * Math.cos(t),
        -0.012 + 0.156 * Math.cos(a) * Math.sin(t),
      ]);
    }
    line(
      hair,
      `gathered-rear-fold-${i}`,
      pts,
      0.0015,
      i % 2 ? m.hairLight : m.hairDark,
      20,
    );
  }
}
function clipboard(root: Group, m: Mats) {
  const board = part(root, "clipboard", [0.105, 1.04, 0.197]);
  board.rotation.set(-0.065, 0.04, -0.2);
  mesh(
    board,
    "rounded-board",
    roundedPanel(0.19, 0.318, 0.016, 0.013),
    m.inner,
  );
  mesh(
    board,
    "metal-clip",
    roundedPanel(0.073, 0.035, 0.009, 0.005),
    m.accent,
    [0, 0.15, 0.021],
  );
  mesh(
    board,
    "clip-top",
    roundedPanel(0.036, 0.009, 0.007, 0.003),
    m.seam,
    [0, 0.168, 0.024],
  );
}
export function measureGroup(root: Group): ResearcherStats {
  let triangles = 0,
    meshes = 0;
  const materialSet = new Set<Material>(),
    parts: string[] = [];
  root.traverse((obj) => {
    if (obj instanceof Group && obj !== root && obj.children.length && obj.name)
      parts.push(obj.name);
    if (!(obj instanceof Mesh)) return;
    meshes++;
    triangles +=
      (obj.geometry.getIndex()?.count ??
        obj.geometry.getAttribute("position").count) / 3;
    (Array.isArray(obj.material) ? obj.material : [obj.material]).forEach(
      (mat) => materialSet.add(mat),
    );
  });
  return {
    triangles: Math.round(triangles),
    meshes,
    materials: materialSet.size,
    parts,
  };
}
/** Static procedural character; own left is +X, feet y=0. Existing public API preserved. */
export function createResearcherModel(
  options?: ResearcherModelOptions,
): ResearcherBuild {
  void options;
  const m = materials(),
    group = new Group();
  group.name = "researcher";
  body(group, m);
  coat(group, m);
  head(group, m);
  clipboard(group, m);
  group.updateMatrixWorld(true);
  const box = new Box3().setFromObject(group),
    size = box.getSize(new Vector3()),
    scale = Math.min(1.7 / size.y, 0.64 / size.x, 0.56 / size.z);
  group.scale.setScalar(scale);
  group.position.y = -box.min.y * scale;
  group.updateMatrixWorld(true);
  const bounds = new Box3().setFromObject(group),
    stats = measureGroup(group);
  group.userData.stats = stats;
  group.userData.sculptRuntime = {
    profile: "character",
    staticPose: true,
    revision: RESEARCHER_REVISION,
    coordinateFrame: { up: "+Y", forward: "+Z", left: "+X" },
    parts: stats.parts,
    bounds: { min: bounds.min.toArray(), max: bounds.max.toArray() },
    colliders: [
      {
        type: "box",
        center: bounds.getCenter(new Vector3()).toArray(),
        size: bounds.getSize(new Vector3()).toArray(),
      },
    ],
    sockets: { clipboardGrip: [0.179, 1.036, 0.242], neck: [0, 1.29, 0] },
  };
  return { group, stats, materials: Object.values(m) };
}
