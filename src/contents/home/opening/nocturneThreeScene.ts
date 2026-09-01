import * as THREE from "three";
import {
  createGlowPointsMaterial,
  setGlowBrightness,
  updateGlowPixelRatio,
} from "./particleGlowMaterial";

export type OpeningPhase = "converge" | "interactive" | "disperse" | "title";

export type NocturneSceneHandle = {
  resize: () => void;
  dispose: () => void;
  particleCount: number;
};

type PhaseListener = (phase: OpeningPhase) => void;

type GalaxyPoint = {
  x: number;
  y: number;
  z: number;
  core: number;
  kind: 0 | 1 | 2;
  turb: number;
};

const CONVERGE_SEC = 6;
const INTERACTIVE_SEC = 8;
const DISPERSE_SEC = 5;

const SIGMA = 10;
const RHO = 28;
const BETA = 8 / 3;
const L_DT = 0.007;
const L_SCALE = 0.115;
const L_Z = 25;

function hash01(i: number, salt: number) {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function easeOutExpo(t: number) {
  return t >= 1 ? 1 : 1 - 2 ** (-10 * t);
}

function easeInOutQuart(t: number) {
  return t < 0.5 ? 8 * t * t * t * t : 1 - (-2 * t + 2) ** 4 / 2;
}

function scatterTarget(i: number) {
  const shell = 0.4 + hash01(i, 4) * 0.6;
  return {
    x: (hash01(i, 1) - 0.5) * 36 * shell,
    y: (hash01(i, 2) - 0.5) * 22 * shell,
    z: (hash01(i, 3) - 0.5) * 14 * shell,
  };
}

/** 洛伦兹轨迹采样 — 有机混沌，整体仍呈双翼 */
function lorenzTarget(i: number, mirror: 1 | -1): GalaxyPoint {
  let x = 0.06 + hash01(i, 20) * 0.55;
  let y = 0.06 + hash01(i, 21) * 0.55;
  let z = 17 + hash01(i, 22) * 14;
  if (mirror < 0) x *= -1;

  const steps = 24 + Math.floor(hash01(i, 23) * 260);
  for (let s = 0; s < steps; s++) {
    const dx = SIGMA * (y - x) * L_DT;
    const dy = (x * (RHO - z) - y) * L_DT;
    const dz = (x * y - BETA * z) * L_DT;
    x += dx;
    y += dy;
    z += dz;
  }

  const jx = (hash01(i, 24) - 0.5) * 0.55;
  const jy = (hash01(i, 25) - 0.5) * 0.38;
  const jz = (hash01(i, 26) - 0.5) * 0.45;

  return {
    x: mirror * x * L_SCALE + (mirror > 0 ? -4.2 : 4.2) + jx,
    y: y * L_SCALE + jy,
    z: (z - L_Z) * L_SCALE * 0.65 + jz,
    core: Math.max(0, 1 - Math.hypot(x * L_SCALE, y * L_SCALE) / 3.2),
    kind: 0,
    turb: hash01(i, 27) * Math.PI * 2,
  };
}

/** 弥散星云 — 不规则团块，无连续臂 */
function nebulaTarget(i: number): GalaxyPoint {
  const cluster = Math.floor(hash01(i, 30) * 18);
  const ca = (cluster / 18) * Math.PI * 2 + hash01(i, 31) * 1.4;
  const cr = 0.6 + hash01(i, 32) ** 0.55 * 5.5;
  const spread = 0.35 + hash01(i, 33) * 1.6;
  const lx = Math.cos(ca) * cr * 0.52;
  const ly = Math.sin(ca) * cr * 0.34;
  return {
    x: lx + (hash01(i, 34) - 0.5) * spread,
    y: ly + (hash01(i, 35) - 0.5) * spread * 0.7,
    z: (hash01(i, 36) - 0.5) * 2.2,
    core: Math.max(0, 1 - cr / 6),
    kind: 1,
    turb: hash01(i, 37) * Math.PI * 2,
  };
}

/** 断裂丝状团 — 仅暗示旋臂，不连成线 */
function clumpTarget(i: number): GalaxyPoint {
  const arm = Math.floor(hash01(i, 40) * 4);
  const blob = Math.floor(hash01(i, 41) * 9);
  const baseA = (arm / 4) * Math.PI * 2;
  const blobA = baseA + (blob / 9) * 0.65 + (hash01(i, 42) - 0.5) * 1.1;
  const blobR = 1.2 + (blob / 9) * 4.2 + (hash01(i, 43) - 0.5) * 1.8;
  const fuzz = 0.5 + hash01(i, 44) * 1.4;
  return {
    x: Math.cos(blobA) * blobR * 0.48 + (hash01(i, 45) - 0.5) * fuzz,
    y: Math.sin(blobA) * blobR * 0.32 + (hash01(i, 46) - 0.5) * fuzz * 0.65,
    z: (hash01(i, 47) - 0.5) * 1.6,
    core: Math.max(0, 1 - blobR / 5.5) * 0.6,
    kind: 2,
    turb: hash01(i, 48) * Math.PI * 2,
  };
}

function buildGalaxyTarget(i: number): GalaxyPoint {
  const roll = hash01(i, 0);
  if (roll < 0.52) {
    return lorenzTarget(i, i % 2 === 0 ? 1 : -1);
  }
  if (roll < 0.82) {
    return nebulaTarget(i);
  }
  return clumpTarget(i);
}

function fillParticleColor(
  out: Float32Array,
  i: number,
  g: GalaxyPoint,
) {
  const o = i * 3;
  const mix = hash01(i, 10);
  const dim = 0.72 + hash01(i, 11) * 0.22;

  if (g.kind === 0 && g.core > 0.45) {
    out[o] = (0.62 + mix * 0.18) * dim;
    out[o + 1] = (0.48 + mix * 0.12) * dim;
    out[o + 2] = (0.18 + mix * 0.08) * dim;
  } else if (g.kind === 0) {
    out[o] = (0.14 + mix * 0.1) * dim;
    out[o + 1] = (0.38 + mix * 0.14) * dim;
    out[o + 2] = (0.62 + mix * 0.12) * dim;
  } else if (g.kind === 1) {
    out[o] = (0.16 + mix * 0.08) * dim;
    out[o + 1] = (0.34 + mix * 0.12) * dim;
    out[o + 2] = (0.55 + mix * 0.1) * dim;
  } else {
    out[o] = (0.22 + mix * 0.1) * dim;
    out[o + 1] = (0.36 + mix * 0.1) * dim;
    out[o + 2] = (0.52 + mix * 0.08) * dim;
  }
}

export function mountNocturneScene(
  canvas: HTMLCanvasElement,
  reducedMotion: boolean,
  onPhase?: PhaseListener,
): NocturneSceneHandle {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x000000, 1);
  renderer.setPixelRatio(dpr);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x000000, 0.018);

  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);
  camera.position.set(0, 0, 32);

  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  const count = isMobile ? 72000 : 185000;

  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  const scatter = new Float32Array(count * 3);
  const galaxy = new Float32Array(count * 3);
  const meta: GalaxyPoint[] = new Array(count);

  for (let i = 0; i < count; i++) {
    const s = scatterTarget(i);
    const g = buildGalaxyTarget(i);
    meta[i] = g;
    const o = i * 3;
    scatter[o] = s.x;
    scatter[o + 1] = s.y;
    scatter[o + 2] = s.z;
    galaxy[o] = g.x;
    galaxy[o + 1] = g.y;
    galaxy[o + 2] = g.z;
    positions[o] = s.x;
    positions[o + 1] = s.y;
    positions[o + 2] = s.z;

    fillParticleColor(colors, i, g);

    const base = 0.65 + hash01(i, 12) * 0.85;
    sizes[i] = base + g.core * 0.9;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));

  const mat = createGlowPointsMaterial(dpr);
  const points = new THREE.Points(geo, mat);
  const group = new THREE.Group();
  group.add(points);
  scene.add(group);

  const mouseNdc = new THREE.Vector2(999, 999);
  const mouseWorld = new THREE.Vector3();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const raycaster = new THREE.Raycaster();
  let pointerActive = false;

  const onPointerMove = (e: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    mouseNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    pointerActive = true;
  };
  const onLeave = () => {
    pointerActive = false;
  };

  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerleave", onLeave);

  let raf = 0;
  const t0 = performance.now();
  let lastPhase: OpeningPhase | null = null;

  const emitPhase = (phase: OpeningPhase) => {
    if (phase === lastPhase) return;
    lastPhase = phase;
    onPhase?.(phase);
  };

  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w < 1 || h < 1) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(ratio);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    updateGlowPixelRatio(mat, ratio);
  };

  const updateMouseWorld = () => {
    if (!pointerActive) return;
    raycaster.setFromCamera(mouseNdc, camera);
    raycaster.ray.intersectPlane(plane, mouseWorld);
  };

  const applyMouseField = (x: number, y: number, time: number) => {
    if (!pointerActive) return { x, y };
    const dx = x - mouseWorld.x;
    const dy = y - mouseWorld.y;
    const distSq = dx * dx + dy * dy;
    const influenceR = 7.5;
    if (distSq > influenceR * influenceR) return { x, y };

    const dist = Math.sqrt(distSq) + 0.05;
    let nx = x;
    let ny = y;
    const voidR = 2;

    if (dist < voidR * 2.4) {
      const push = ((voidR * 2.4 - dist) / (voidR * 2.4)) ** 1.5 * 1.6;
      nx += (dx / dist) * push;
      ny += (dy / dist) * push;
    }

    const swirl = (1 - dist / influenceR) * 0.32;
    nx += (-dy / dist) * swirl * Math.sin(time * 1.2 + dist);
    ny += (dx / dist) * swirl * Math.sin(time * 1.2 + dist);

    return { x: nx, y: ny };
  };

  const tick = (now: number) => {
    raf = requestAnimationFrame(tick);
    const elapsed = (now - t0) * 0.001;
    updateMouseWorld();

    let phase: OpeningPhase = "converge";
    if (elapsed >= CONVERGE_SEC + INTERACTIVE_SEC + DISPERSE_SEC) {
      phase = "title";
    } else if (elapsed >= CONVERGE_SEC + INTERACTIVE_SEC) {
      phase = "disperse";
    } else if (elapsed >= CONVERGE_SEC) {
      phase = "interactive";
    }
    emitPhase(phase);

    if (!reducedMotion) {
      const convergeT =
        phase === "converge"
          ? easeOutExpo(Math.min(1, elapsed / CONVERGE_SEC))
          : 1;
      const disperseT =
        phase === "disperse" || phase === "title"
          ? easeInOutQuart(
              Math.min(
                1,
                (elapsed - CONVERGE_SEC - INTERACTIVE_SEC) / DISPERSE_SEC,
              ),
            )
          : 0;

      const spin = elapsed * 0.045;
      const galaxyScale =
        (phase === "interactive"
          ? 1 + Math.sin(elapsed * 0.7) * 0.025
          : 1 - disperseT * 0.15) *
        (0.88 + convergeT * 0.12);

      setGlowBrightness(
        mat,
        phase === "converge"
          ? 0.42 + convergeT * 0.22
          : phase === "title"
            ? 0.48
            : 0.62 - disperseT * 0.12,
      );

      for (let i = 0; i < count; i++) {
        const g = meta[i]!;
        const o = i * 3;
        let gx = galaxy[o]! * galaxyScale;
        let gy = galaxy[o + 1]! * galaxyScale;
        let gz = galaxy[o + 2]!;

        const cs = Math.cos(spin);
        const sn = Math.sin(spin);
        const rx = gx * cs - gy * sn * 0.45;
        const ry = gx * sn * 0.45 + gy * cs;
        gx = rx;
        gy = ry;

        const stagger = hash01(i, 13) * 0.45;
        const localConverge = Math.min(
          1,
          Math.max(0, (convergeT - stagger * 0.5) / (1 - stagger * 0.5)),
        );

        const turb =
          phase === "interactive" || phase === "converge"
            ? Math.sin(elapsed * (0.6 + g.kind * 0.15) + g.turb) *
              (0.04 + g.core * 0.06)
            : 0;

        let x = scatter[o]! * (1 - localConverge) + (gx + turb) * localConverge;
        let y =
          scatter[o + 1]! * (1 - localConverge) +
          (gy + turb * 0.7) * localConverge;
        let z =
          scatter[o + 2]! * (1 - localConverge) +
          (gz + Math.sin(elapsed * 0.55 + g.turb) * 0.06) * localConverge;

        if (disperseT > 0) {
          const drift =
            Math.sin(elapsed * 0.45 + g.turb) *
            (1.4 + hash01(i, 14) * 2) *
            disperseT;
          x =
            gx * (1 - disperseT * 0.4) +
            scatter[o]! * disperseT * 0.5 +
            drift;
          y =
            gy * (1 - disperseT * 0.4) +
            scatter[o + 1]! * disperseT * 0.5 +
            Math.cos(elapsed * 0.35 + g.turb) * drift * 0.4;
          z += disperseT * hash01(i, 15) * 4;
        }

        if (phase === "interactive" || phase === "disperse") {
          const def = applyMouseField(x, y, elapsed);
          x = def.x;
          y = def.y;
        }

        positions[o] = x;
        positions[o + 1] = y;
        positions[o + 2] = z;
      }

      (geo.getAttribute("position") as THREE.BufferAttribute).needsUpdate = true;

      group.rotation.y = Math.sin(elapsed * 0.05) * 0.025;
      group.rotation.x = Math.cos(elapsed * 0.04) * 0.015;
    }

    renderer.render(scene, camera);
  };

  if (reducedMotion) {
    emitPhase("title");
    for (let i = 0; i < count; i++) {
      const o = i * 3;
      positions[o] = galaxy[o]!;
      positions[o + 1] = galaxy[o + 1]!;
      positions[o + 2] = galaxy[o + 2]!;
    }
    (geo.getAttribute("position") as THREE.BufferAttribute).needsUpdate = true;
  }

  resize();
  raf = requestAnimationFrame(tick);

  const dispose = () => {
    cancelAnimationFrame(raf);
    canvas.removeEventListener("pointermove", onPointerMove);
    canvas.removeEventListener("pointerleave", onLeave);
    geo.dispose();
    mat.dispose();
    renderer.dispose();
  };

  return { resize, dispose, particleCount: count };
}
