import {
  type Particle,
  type ParticleKind,
  type SedimentLayer,
  type SilhouetteAnchor,
  type Vec2,
} from "./particleTypes";
import { createRng, randRange } from "./rng";
import { buildSilhouetteAnchors } from "./targetSilhouette";

export type World = {
  particles: Particle[];
  anchors: SilhouetteAnchor[];
  sediments: SedimentLayer[];
  seed: number;
};

function pickKind(rng: () => number): ParticleKind {
  const roll = rng();
  if (roll < 0.22) return "bacillus";
  if (roll < 0.36) return "plasmid";
  if (roll < 0.5) return "dna";
  if (roll < 0.62) return "membrane";
  if (roll < 0.74) return "inflam";
  if (roll < 0.88) return "network";
  return "datum";
}

/** Bias home positions into uneven density pockets (not a uniform grid). */
function sampleHome(rng: () => number): Vec2 {
  const pocket = rng();
  if (pocket < 0.35) {
    return {
      x: randRange(rng, 0.05, 0.38),
      y: randRange(rng, 0.08, 0.55),
    };
  }
  if (pocket < 0.65) {
    return {
      x: randRange(rng, 0.55, 0.95),
      y: randRange(rng, 0.2, 0.85),
    };
  }
  if (pocket < 0.85) {
    return {
      x: randRange(rng, 0.25, 0.75),
      y: randRange(rng, 0.55, 0.92),
    };
  }
  return {
    x: randRange(rng, 0.1, 0.9),
    y: randRange(rng, 0.05, 0.95),
  };
}

export function createWorld(seed: number, count: number): World {
  const rng = createRng(seed);
  const anchors = buildSilhouetteAnchors();
  const particles: Particle[] = [];

  for (let i = 0; i < count; i++) {
    const kind = pickKind(rng);
    const home = sampleHome(rng);
    const depth = randRange(rng, 0.35, 1);
    const loyalty = randRange(rng, 0.15, 1);
    // ~12% stay peripheral (incomplete structure)
    const stayOut = rng() < 0.12 || loyalty < 0.22;
    let anchorIndex = -1;
    if (!stayOut) {
    // Prefer glyph anchors for structure; keep some ecology roles
    const preferred =
      kind === "inflam"
        ? "fringe"
        : kind === "network"
          ? "network"
          : kind === "bacillus" || kind === "plasmid" || kind === "dna"
            ? "glyph"
            : kind === "membrane"
              ? "gut"
              : "glyph";
    const candidates = anchors
      .map((a, idx) => ({ a, idx }))
      .filter(({ a }) => a.role === preferred || a.role === "glyph");
    const pool =
      candidates.length > 0
        ? candidates
        : anchors.map((a, idx) => ({ a, idx }));
    anchorIndex = pool[Math.floor(rng() * pool.length)]!.idx;
    }

    particles.push({
      id: i,
      kind,
      home,
      pos: { x: 0, y: 0 },
      vel: {
        x: randRange(rng, -0.12, 0.12),
        y: randRange(rng, -0.1, 0.1),
      },
      depth,
      size: randRange(rng, 5, 16) * depth,
      rotation: randRange(rng, 0, Math.PI * 2),
      spin: randRange(rng, -0.004, 0.004),
      alpha: randRange(rng, 0.35, 0.85) * depth,
      hueShift: randRange(rng, -12, 18),
      anchorIndex,
      loyalty,
      trail: [],
    });
  }

  return { particles, anchors, sediments: [], seed };
}

export function layoutParticlesToCanvas(
  world: World,
  width: number,
  height: number,
): void {
  for (const p of world.particles) {
    p.pos.x = p.home.x * width;
    p.pos.y = p.home.y * height;
    p.trail.length = 0;
  }
}
