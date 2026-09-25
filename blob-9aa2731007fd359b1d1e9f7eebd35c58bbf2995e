import * as THREE from "three";
import { createNocturneMaterial, setNocturneDpr } from "./nocturneShader";

export type NocturneOpeningHandle = {
  resize: () => void;
  dispose: () => void;
};

/** 6174 — Kaprekar 常数，控制鼠标空洞强度（参考视频描述） */
const PULL_K = 6174 / 900_000;

const SIGMA = 10;
const RHO = 28;
const BETA = 8 / 3;
const L_DT = 0.0055;
const L_SCALE = 0.108;
const L_Z = 25;

type Stream = {
  x: number;
  y: number;
  z: number;
  mirror: 1 | -1;
  shift: number;
  trail: Float32Array;
  warm: boolean;
};

type RingDef = {
  rx: number;
  ry: number;
  tiltX: number;
  tiltZ: number;
  speed: number;
  phase: number;
};

const RINGS: RingDef[] = [
  { rx: 5.6, ry: 1.15, tiltX: 0.62, tiltZ: 0.18, speed: 0.038, phase: 0 },
  { rx: 4.8, ry: 0.95, tiltX: 0.38, tiltZ: -0.22, speed: 0.052, phase: 1.2 },
  { rx: 6.4, ry: 0.82, tiltX: 0.78, tiltZ: 0.42, speed: 0.028, phase: 2.4 },
];

function h(i: number, s: number) {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function lorenzStep(s: Stream) {
  let { x, y, z } = s;
  const dx = SIGMA * (y - x) * L_DT;
  const dy = (x * (RHO - z) - y) * L_DT;
  const dz = (x * y - BETA * z) * L_DT;
  s.x = x + dx;
  s.y = y + dy;
  s.z = z + dz;
}

function pushTrail(s: Stream, len: number) {
  const t = s.trail;
  for (let i = len - 1; i > 0; i--) {
    const j = i * 3;
    t[j] = t[j - 3]!;
    t[j + 1] = t[j - 2]!;
    t[j + 2] = t[j - 1]!;
  }
  t[0] = s.mirror * s.x * L_SCALE + s.shift;
  t[1] = s.y * L_SCALE;
  t[2] = (s.z - L_Z) * L_SCALE * 0.7;
}

function createStreams(n: number, len: number, mirror: 1 | -1, shift: number) {
  const out: Stream[] = [];
  for (let i = 0; i < n; i++) {
    const trail = new Float32Array(len * 3);
    let x = 0.05 + h(i, 1) * 0.55;
    let y = 0.05 + h(i, 2) * 0.55;
    let z = 17 + h(i, 3) * 13;
    if (mirror < 0) x *= -1;
    for (let t = 0; t < len; t++) {
      trail[t * 3] = mirror * x * L_SCALE + shift;
      trail[t * 3 + 1] = y * L_SCALE;
      trail[t * 3 + 2] = (z - L_Z) * L_SCALE * 0.7;
    }
    out.push({ x, y, z, mirror, shift, trail, warm: i % 7 === 0 });
  }
  return out;
}

function ringPoint(
  i: number,
  n: number,
  ring: RingDef,
  time: number,
) {
  const u = (i / n) * Math.PI * 2 + ring.phase + time * ring.speed;
  const fuzz = (h(i, ring.phase * 10) - 0.5) * 1.1;
  const rx = ring.rx + fuzz * 0.35;
  const ry = ring.ry + fuzz * 0.18;
  let x = Math.cos(u) * rx;
  let y = Math.sin(u) * ry;
  let z = (h(i, 11) - 0.5) * 0.55 + Math.sin(u * 3 + ring.phase) * 0.12;
  const cy = y * Math.cos(ring.tiltX) - z * Math.sin(ring.tiltX);
  const cz = y * Math.sin(ring.tiltX) + z * Math.cos(ring.tiltX);
  y = cy;
  z = cz;
  const cx = x * Math.cos(ring.tiltZ) - y * Math.sin(ring.tiltZ);
  const sy = x * Math.sin(ring.tiltZ) + y * Math.cos(ring.tiltZ);
  return { x: cx, y: sy, z };
}

function writeColor(
  out: Float32Array,
  idx: number,
  kind: "wing" | "ring" | "dust",
  fade: number,
  warm: boolean,
  i: number,
) {
  const o = idx * 3;
  const m = h(i, 77);
  if (kind === "wing" && warm) {
    out[o] = 0.52 + m * 0.12;
    out[o + 1] = 0.58 + m * 0.1;
    out[o + 2] = 0.72 + m * 0.08;
  } else if (kind === "wing") {
    out[o] = 0.2 + m * 0.1;
    out[o + 1] = 0.42 + m * 0.12;
    out[o + 2] = 0.68 + m * 0.1;
  } else if (kind === "ring") {
    out[o] = 0.24 + m * 0.08;
    out[o + 1] = 0.46 + m * 0.1;
    out[o + 2] = 0.7 + m * 0.08;
  } else {
    out[o] = 0.15 + m * 0.06;
    out[o + 1] = 0.28 + m * 0.08;
    out[o + 2] = 0.45 + m * 0.06;
  }
  const d = 0.5 + fade * 0.5;
  out[o] *= d;
  out[o + 1] *= d;
  out[o + 2] *= d;
}

export function mountNocturneOpening(
  canvas: HTMLCanvasElement,
  reduced: boolean,
): NocturneOpeningHandle {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x000000, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 250);
  camera.position.set(0, 0.2, 38);

  const mobile = window.matchMedia("(max-width: 768px)").matches;
  const streamsPerWing = mobile ? 260 : 380;
  const trailLen = mobile ? 75 : 95;
  const ringParticles = mobile ? 7000 : 15000;
  const dustCount = mobile ? 1200 : 2800;
  const lorenzCount = streamsPerWing * 2 * trailLen;
  const total = lorenzCount + ringParticles + dustCount;

  const streams = [
    ...createStreams(streamsPerWing, trailLen, 1, -4.6),
    ...createStreams(streamsPerWing, trailLen, -1, 4.6),
  ];

  const positions = new Float32Array(total * 3);
  const colors = new Float32Array(total * 3);
  const sizes = new Float32Array(total);

  for (let i = 0; i < lorenzCount; i++) {
    sizes[i] = 0.62 + h(i, 40) * 0.55;
  }
  for (let i = 0; i < ringParticles; i++) {
    sizes[lorenzCount + i] = 0.48 + h(i, 41) * 0.38;
  }
  for (let i = 0; i < dustCount; i++) {
    const o = (lorenzCount + ringParticles + i) * 3;
    positions[o] = (h(i, 60) - 0.5) * 40;
    positions[o + 1] = (h(i, 61) - 0.5) * 26;
    positions[o + 2] = (h(i, 62) - 0.5) * 18 - 6;
    writeColor(colors, lorenzCount + ringParticles + i, "dust", 0.4, false, i);
    sizes[lorenzCount + ringParticles + i] = 0.35 + h(i, 63) * 0.25;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));

  const mat = createNocturneMaterial(dpr);
  const group = new THREE.Group();
  group.add(new THREE.Points(geo, mat));
  scene.add(group);

  const mouseNdc = new THREE.Vector2(999, 999);
  const mouseWorld = new THREE.Vector3();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const raycaster = new THREE.Raycaster();
  let pointerActive = false;

  const onMove = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    mouseNdc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    mouseNdc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    pointerActive = true;
  };
  const onLeave = () => {
    pointerActive = false;
  };
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerleave", onLeave);

  const applyMouse = (x: number, y: number, px: number, py: number) => {
    if (!pointerActive) return { x, y };
    const dx = x - px;
    const dy = y - py;
    const distSq = dx * dx + dy * dy;
    const voidR = 2.2;
    const inf = 9;
    if (distSq > inf * inf) return { x, y };
    const dist = Math.sqrt(distSq) + 0.05;
    let nx = x;
    let ny = y;
    if (dist < voidR * 2.6) {
      const push = ((voidR * 2.6 - dist) / (voidR * 2.6)) ** 1.4 * 1.65;
      nx += (dx / dist) * push;
      ny += (dy / dist) * push;
    }
    const f = PULL_K / (distSq + 60);
    nx += dx * f * 80;
    ny += dy * f * 80;
    const swirl = (1 - dist / inf) * 0.32;
    nx += (-dy / dist) * swirl;
    ny += (dx / dist) * swirl;
    return { x: nx, y: ny };
  };

  const syncLorenz = (px: number, py: number) => {
    let ptr = 0;
    for (const s of streams) {
      for (let p = 0; p < trailLen; p++) {
        const ti = p * 3;
        let x = s.trail[ti]!;
        let y = s.trail[ti + 1]!;
        const z = s.trail[ti + 2]!;
        const m = applyMouse(x, y, px, py);
        x = m.x;
        y = m.y;
        const o = ptr * 3;
        positions[o] = x;
        positions[o + 1] = y;
        positions[o + 2] = z;
        writeColor(colors, ptr, "wing", 1 - p / trailLen, s.warm, ptr);
        ptr++;
      }
    }
  };

  const syncRings = (time: number, px: number, py: number) => {
    const perRing = Math.floor(ringParticles / RINGS.length);
    for (let i = 0; i < ringParticles; i++) {
      const ring = RINGS[i % RINGS.length]!;
      const p = ringPoint(i % perRing, perRing, ring, time);
      const m = applyMouse(p.x, p.y, px, py);
      const o = (lorenzCount + i) * 3;
      positions[o] = m.x;
      positions[o + 1] = m.y;
      positions[o + 2] = p.z;
      writeColor(colors, lorenzCount + i, "ring", 0.85, false, i);
    }
  };

  const updateMouse = () => {
    if (!pointerActive) return { x: 0, y: 0 };
    raycaster.setFromCamera(mouseNdc, camera);
    raycaster.ray.intersectPlane(plane, mouseWorld);
    return { x: mouseWorld.x, y: mouseWorld.y };
  };

  syncLorenz(0, 0);

  let raf = 0;
  const t0 = performance.now();

  const tick = (now: number) => {
    raf = requestAnimationFrame(tick);
    const time = (now - t0) * 0.001;
    const mouse = updateMouse();

    if (!reduced) {
      for (let step = 0; step < (mobile ? 1 : 2); step++) {
        for (const s of streams) {
          lorenzStep(s);
          pushTrail(s, trailLen);
        }
      }
      syncLorenz(mouse.x, mouse.y);
      syncRings(time, mouse.x, mouse.y);
      group.rotation.y = time * 0.055;
      group.rotation.x = 0.48 + Math.sin(time * 0.09) * 0.05;
      group.rotation.z = Math.sin(time * 0.06) * 0.035;
    }

    renderer.render(scene, camera);
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
    setNocturneDpr(mat, ratio);
  };

  resize();
  raf = requestAnimationFrame(tick);

  return {
    resize,
    dispose: () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      geo.dispose();
      mat.dispose();
      renderer.dispose();
    },
  };
}
