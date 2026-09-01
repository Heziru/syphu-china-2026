import * as THREE from "three";
import { createParticleMaterial, setParticleDpr } from "./particleShader";

export type NocturneHandle = {
  resize: () => void;
  dispose: () => void;
};

const SIGMA = 10;
const RHO = 28;
const BETA = 8 / 3;
const L_DT = 0.006;
const L_SCALE = 0.105;
const L_Z = 25;

type Stream = {
  x: number;
  y: number;
  z: number;
  mirror: 1 | -1;
  shift: number;
  trail: Float32Array;
};

function hash01(i: number, s: number) {
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
  t[2] = (s.z - L_Z) * L_SCALE * 0.72;
}

function createStreams(count: number, len: number, mirror: 1 | -1, shift: number) {
  const out: Stream[] = [];
  for (let i = 0; i < count; i++) {
    const trail = new Float32Array(len * 3);
    let x = 0.08 + hash01(i, 1) * 0.5;
    let y = 0.08 + hash01(i, 2) * 0.5;
    let z = 18 + hash01(i, 3) * 12;
    if (mirror < 0) x *= -1;
    for (let t = 0; t < len; t++) {
      trail[t * 3] = mirror * x * L_SCALE + shift;
      trail[t * 3 + 1] = y * L_SCALE;
      trail[t * 3 + 2] = (z - L_Z) * L_SCALE * 0.72;
    }
    out.push({ x, y, z, mirror, shift, trail });
  }
  return out;
}

function ringPoint(i: number, n: number, ring: number) {
  const u = (i / n) * Math.PI * 2;
  const tilt = ring * 0.55 + 0.35;
  const rx = 4.2 + ring * 0.35;
  const ry = 1.05 + ring * 0.12;
  const wobble = hash01(i, ring + 10) * 0.35;
  const x = Math.cos(u + wobble) * rx;
  const y = Math.sin(u) * ry;
  const z = Math.sin(u * 2 + ring) * 0.65;
  const cy = y * Math.cos(tilt) - z * Math.sin(tilt);
  const cz = y * Math.sin(tilt) + z * Math.cos(tilt);
  return { x, y: cy, z: cz };
}

function setColor(
  out: Float32Array,
  idx: number,
  kind: "wing" | "ring",
  fade: number,
  i: number,
) {
  const o = idx * 3;
  const m = hash01(i, 99);
  if (kind === "wing" && i % 5 === 0) {
    out[o] = 0.55 + m * 0.15;
    out[o + 1] = 0.68 + m * 0.12;
    out[o + 2] = 0.82 + m * 0.1;
  } else if (kind === "wing") {
    out[o] = 0.22 + m * 0.12;
    out[o + 1] = 0.48 + m * 0.14;
    out[o + 2] = 0.72 + m * 0.12;
  } else {
    out[o] = 0.28 + m * 0.1;
    out[o + 1] = 0.52 + m * 0.12;
    out[o + 2] = 0.78 + m * 0.1;
  }
  const dim = 0.55 + fade * 0.45;
  out[o] *= dim;
  out[o + 1] *= dim;
  out[o + 2] *= dim;
}

export function mountNocturneScene(
  canvas: HTMLCanvasElement,
  reduced: boolean,
): NocturneHandle {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x000000, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(44, 1, 0.1, 300);
  camera.position.set(0, 0, 36);

  const mobile = window.matchMedia("(max-width: 768px)").matches;
  const streamsPerWing = mobile ? 220 : 360;
  const trailLen = mobile ? 70 : 95;
  const ringCount = mobile ? 3 : 4;
  const ringParticles = mobile ? 6000 : 14000;
  const lorenzCount = streamsPerWing * 2 * trailLen;
  const total = lorenzCount + ringParticles;

  const streams = [
    ...createStreams(streamsPerWing, trailLen, 1, -4.8),
    ...createStreams(streamsPerWing, trailLen, -1, 4.8),
  ];

  const positions = new Float32Array(total * 3);
  const colors = new Float32Array(total * 3);
  const sizes = new Float32Array(total);

  for (let i = 0; i < lorenzCount; i++) {
    sizes[i] = 0.75 + hash01(i, 50) * 0.65;
  }
  for (let i = 0; i < ringParticles; i++) {
    const ring = i % ringCount;
    const p = ringPoint(i, ringParticles / ringCount, ring);
    const o = (lorenzCount + i) * 3;
    positions[o] = p.x;
    positions[o + 1] = p.y;
    positions[o + 2] = p.z;
    setColor(colors, lorenzCount + i, "ring", 0.85, i);
    sizes[lorenzCount + i] = 0.55 + hash01(i, 51) * 0.45;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));

  const mat = createParticleMaterial(dpr);
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

  let raf = 0;
  const t0 = performance.now();

  const syncLorenz = () => {
    let ptr = 0;
    for (const s of streams) {
      for (let p = 0; p < trailLen; p++) {
        const ti = p * 3;
        let x = s.trail[ti]!;
        let y = s.trail[ti + 1]!;
        let z = s.trail[ti + 2]!;
        if (pointerActive) {
          raycaster.setFromCamera(mouseNdc, camera);
          raycaster.ray.intersectPlane(plane, mouseWorld);
          const dx = x - mouseWorld.x;
          const dy = y - mouseWorld.y;
          const dist = Math.sqrt(dx * dx + dy * dy) + 0.06;
          const voidR = 2.4;
          if (dist < voidR * 2.8) {
            const push = ((voidR * 2.8 - dist) / (voidR * 2.8)) * 1.5;
            x += (dx / dist) * push;
            y += (dy / dist) * push;
          }
          const inf = 8.5;
          if (dist < inf) {
            const swirl = (1 - dist / inf) * 0.38;
            x += (-dy / dist) * swirl;
            y += (dx / dist) * swirl;
          }
        }
        const o = ptr * 3;
        positions[o] = x;
        positions[o + 1] = y;
        positions[o + 2] = z;
        setColor(colors, ptr, "wing", 1 - p / trailLen, ptr);
        ptr++;
      }
    }
    (geo.getAttribute("position") as THREE.BufferAttribute).needsUpdate = true;
    (geo.getAttribute("color") as THREE.BufferAttribute).needsUpdate = true;
  };

  const syncRings = (time: number) => {
    for (let i = 0; i < ringParticles; i++) {
      const ring = i % ringCount;
      const u =
        (i / (ringParticles / ringCount)) * Math.PI * 2 +
        time * (0.08 + ring * 0.02);
      const p = ringPoint(i, ringParticles / ringCount, ring);
      const o = (lorenzCount + i) * 3;
      let x = p.x * Math.cos(u * 0.02 + ring) - p.y * Math.sin(u * 0.02 + ring) * 0.15;
      let y = p.x * Math.sin(u * 0.02 + ring) * 0.15 + p.y * Math.cos(u * 0.02 + ring);
      let z = p.z + Math.sin(time * 0.3 + i * 0.01) * 0.08;
      if (pointerActive) {
        raycaster.setFromCamera(mouseNdc, camera);
        raycaster.ray.intersectPlane(plane, mouseWorld);
        const dx = x - mouseWorld.x;
        const dy = y - mouseWorld.y;
        const dist = Math.sqrt(dx * dx + dy * dy) + 0.06;
        if (dist < 7) {
          const f = (1 - dist / 7) * 0.35;
          x += (dx / dist) * f;
          y += (dy / dist) * f;
        }
      }
      positions[o] = x;
      positions[o + 1] = y;
      positions[o + 2] = z;
    }
    (geo.getAttribute("position") as THREE.BufferAttribute).needsUpdate = true;
  };

  syncLorenz();

  const tick = (now: number) => {
    raf = requestAnimationFrame(tick);
    const time = (now - t0) * 0.001;
    if (!reduced) {
      for (let step = 0; step < (mobile ? 1 : 2); step++) {
        for (const s of streams) {
          lorenzStep(s);
          pushTrail(s, trailLen);
        }
      }
      syncLorenz();
      syncRings(time);
      group.rotation.y = time * 0.06;
      group.rotation.x = 0.42 + Math.sin(time * 0.12) * 0.06;
      group.rotation.z = Math.sin(time * 0.08) * 0.04;
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
    setParticleDpr(mat, ratio);
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
