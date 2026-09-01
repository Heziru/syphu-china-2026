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

const CONVERGE_SEC = 6;
const INTERACTIVE_SEC = 8;
const DISPERSE_SEC = 5;

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

/** 屏幕可见范围内的散落起点 */
function scatterTarget(i: number) {
  const hx = hash01(i, 1);
  const hy = hash01(i, 2);
  const hz = hash01(i, 3);
  const shell = 0.35 + hash01(i, 4) * 0.65;
  return {
    x: (hx - 0.5) * 38 * shell,
    y: (hy - 0.5) * 24 * shell,
    z: (hz - 0.5) * 16 * shell,
  };
}

/** 对数螺旋银河 + 致密核心 */
function galaxyTarget(i: number, n: number, arms: number) {
  const arm = i % arms;
  const bucket = Math.floor(i / arms);
  const u = bucket / (n / arms);
  const t = 0.35 + u ** 0.62 * 9.5;
  const angle = (arm / arms) * Math.PI * 2 + t * 1.05 + hash01(i, 5) * 0.08;
  const r = 0.25 + t ** 1.08 * 1.55;
  const j = hash01(i, 6) - 0.5;
  return {
    x: Math.cos(angle) * r + j * 0.22,
    y: Math.sin(angle) * r * 0.42 + (hash01(i, 7) - 0.5) * 0.14,
    z: (hash01(i, 8) - 0.5) * 1.1,
    core: Math.max(0, 1 - r / 2.8),
    arm: arm,
  };
}

function fillParticleColor(
  out: Float32Array,
  i: number,
  core: number,
  arm: number,
) {
  const o = i * 3;
  const warm = core > 0.55 || hash01(i, 9) > 0.82;
  const mix = hash01(i, 10);
  if (warm) {
    out[o] = 0.98 + mix * 0.02;
    out[o + 1] = 0.72 + mix * 0.18;
    out[o + 2] = 0.28 + mix * 0.2;
  } else if (arm % 2 === 0) {
    out[o] = 0.38 + mix * 0.22;
    out[o + 1] = 0.82 + mix * 0.12;
    out[o + 2] = 1;
  } else {
    out[o] = 0.55 + mix * 0.2;
    out[o + 1] = 0.92 + mix * 0.08;
    out[o + 2] = 1;
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
  scene.fog = new THREE.FogExp2(0x000000, 0.012);

  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);
  camera.position.set(0, 0, 32);

  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  const count = isMobile ? 72000 : 185000;
  const arms = 4;

  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  const scatter = new Float32Array(count * 3);
  const galaxy = new Float32Array(count * 3);
  const coreWeight = new Float32Array(count);
  const driftPhase = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const s = scatterTarget(i);
    const g = galaxyTarget(i, count, arms);
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

    coreWeight[i] = g.core;
    driftPhase[i] = hash01(i, 11) * Math.PI * 2;
    fillParticleColor(colors, i, g.core, g.arm);

    const base = 1.2 + hash01(i, 12) * 1.6;
    sizes[i] = base + g.core * 2.8;
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
    const influenceR = 8;
    if (distSq > influenceR * influenceR) return { x, y };

    const dist = Math.sqrt(distSq) + 0.05;
    let nx = x;
    let ny = y;
    const voidR = 2.2;

    if (dist < voidR * 2.5) {
      const push = ((voidR * 2.5 - dist) / (voidR * 2.5)) ** 1.4 * 2.1;
      nx += (dx / dist) * push;
      ny += (dy / dist) * push;
    }

    const swirl = (1 - dist / influenceR) * 0.48;
    nx += (-dy / dist) * swirl * Math.sin(time * 1.4 + dist * 0.8);
    ny += (dx / dist) * swirl * Math.sin(time * 1.4 + dist * 0.8);

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

      const spin = elapsed * 0.065;
      const breathe = 1 + Math.sin(elapsed * 0.9) * 0.04;
      const galaxyScale =
        (phase === "interactive" ? breathe : 1 - disperseT * 0.2) *
        (0.85 + convergeT * 0.15);

      setGlowBrightness(
        mat,
        phase === "converge"
          ? 0.85 + convergeT * 0.65
          : phase === "title"
            ? 0.75
            : 1.35 - disperseT * 0.35,
      );

      for (let i = 0; i < count; i++) {
        const o = i * 3;
        let gx = galaxy[o]! * galaxyScale;
        let gy = galaxy[o + 1]! * galaxyScale;
        let gz = galaxy[o + 2]!;

        const cs = Math.cos(spin);
        const sn = Math.sin(spin);
        const rx = gx * cs - gy * sn * 0.55;
        const ry = gx * sn * 0.55 + gy * cs;
        gx = rx;
        gy = ry;

        const core = coreWeight[i]!;
        const stagger = hash01(i, 13) * 0.35;
        const localConverge = Math.min(
          1,
          Math.max(0, (convergeT - stagger * 0.4) / (1 - stagger * 0.4)),
        );

        let x = scatter[o]! * (1 - localConverge) + gx * localConverge;
        let y = scatter[o + 1]! * (1 - localConverge) + gy * localConverge;
        let z =
          scatter[o + 2]! * (1 - localConverge) +
          gz * localConverge +
          Math.sin(elapsed * 0.8 + driftPhase[i]!) * core * 0.08;

        if (disperseT > 0) {
          const drift =
            Math.sin(elapsed * 0.5 + driftPhase[i]!) *
            (1.8 + hash01(i, 14) * 2.5) *
            disperseT;
          x =
            gx * (1 - disperseT * 0.35) +
            scatter[o]! * disperseT * 0.55 +
            drift;
          y =
            gy * (1 - disperseT * 0.35) +
            scatter[o + 1]! * disperseT * 0.55 +
            Math.cos(elapsed * 0.38 + driftPhase[i]!) * drift * 0.45;
          z += disperseT * hash01(i, 15) * 6;
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

      group.rotation.y = Math.sin(elapsed * 0.06) * 0.035;
      group.rotation.x = Math.cos(elapsed * 0.05) * 0.02;
      camera.position.z = 32 + Math.sin(elapsed * 0.15) * 0.6;
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
