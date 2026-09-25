import * as THREE from "three";
import { createNocturneMaterial, setNocturneDpr } from "./nocturneShader";
import { MOUSE_K, type Vec3 } from "./nocturneMath";
import { bandParticleColor, bandPoint, bokehPoint, bokehColor } from "./nocturneShapes";

export type NocturneOpeningHandle = {
  resize: () => void;
  dispose: () => void;
};

/** 水平银河带阶段固定参数（参考视频 ~6s 帧） */
const CAM_Z = 38;
const ROT_X = 0.22;
const SPREAD = 0.95;

function applyMouse(x: number, y: number, px: number, py: number, active: boolean) {
  if (!active) return { x, y };
  const dx = x - px;
  const dy = y - py;
  const distSq = dx * dx + dy * dy;
  const voidR = 2.4;
  const inf = 10;
  if (distSq > inf * inf) return { x, y };
  const dist = Math.sqrt(distSq) + 0.04;
  let nx = x;
  let ny = y;
  if (dist < voidR * 2.8) {
    const push = ((voidR * 2.8 - dist) / (voidR * 2.8)) ** 1.35 * 1.85;
    nx += (dx / dist) * push;
    ny += (dy / dist) * push;
  }
  const f = MOUSE_K / (distSq + 55);
  nx += dx * f * 90;
  ny += dy * f * 90;
  const swirl = (1 - dist / inf) * 0.36;
  nx += (-dy / dist) * swirl;
  ny += (dx / dist) * swirl;
  return { x: nx, y: ny };
}

export function mountNocturneOpening(
  canvas: HTMLCanvasElement,
  reduced: boolean,
): NocturneOpeningHandle {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x000000, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 250);
  camera.position.set(0, 0.12, CAM_Z);

  const mobile = window.matchMedia("(max-width: 768px)").matches;
  const coreCount = mobile ? 20000 : 48000;
  const bokehCount = mobile ? 60 : 120;
  const total = coreCount + bokehCount;

  const positions = new Float32Array(total * 3);
  const colors = new Float32Array(total * 3);
  const sizes = new Float32Array(total);

  for (let i = 0; i < coreCount; i++) {
    sizes[i] = 0.48 + (i % 17) * 0.018;
    const p = bandPoint(i, coreCount, 0, SPREAD);
    const col = bandParticleColor(i, Math.abs(p.y));
    const j = i * 3;
    colors[j] = col.r;
    colors[j + 1] = col.g;
    colors[j + 2] = col.b;
  }
  for (let i = 0; i < bokehCount; i++) {
    const idx = coreCount + i;
    sizes[idx] = 1.8 + (i % 7) * 0.28;
    const bc = bokehColor(i);
    const o = idx * 3;
    colors[o] = bc.r;
    colors[o + 1] = bc.g;
    colors[o + 2] = bc.b;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const mat = createNocturneMaterial(dpr);
  const group = new THREE.Group();
  group.rotation.x = ROT_X;
  group.add(new THREE.Points(geo, mat));
  scene.add(group);

  const mouseNdc = new THREE.Vector2(999, 999);
  const mouseWorld = new THREE.Vector3();
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const raycaster = new THREE.Raycaster();
  let pointerActive = false;

  const onMove = (e: PointerEvent) => {
    const rect = canvas.getBoundingClientRect();
    mouseNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    pointerActive = true;
  };
  const onLeave = () => {
    pointerActive = false;
  };
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerleave", onLeave);

  let raf = 0;
  const t0 = performance.now();

  const tick = (now: number) => {
    raf = requestAnimationFrame(tick);
    const time = reduced ? 0 : (now - t0) * 0.001;

    group.rotation.y = Math.sin(time * 0.018) * 0.06;
    group.rotation.z = Math.sin(time * 0.025) * 0.012;

    raycaster.setFromCamera(mouseNdc, camera);
    const hit = raycaster.ray.intersectPlane(plane, mouseWorld);
    const mx = pointerActive && hit ? mouseWorld.x : 0;
    const my = pointerActive && hit ? mouseWorld.y : 0;

    if (!reduced) {
      for (let i = 0; i < coreCount; i++) {
        const p: Vec3 = bandPoint(i, coreCount, time, SPREAD);
        const m = applyMouse(p.x, p.y, mx, my, pointerActive);
        const j = i * 3;
        positions[j] = m.x;
        positions[j + 1] = m.y;
        positions[j + 2] = p.z;
      }

      for (let i = 0; i < bokehCount; i++) {
        const idx = coreCount + i;
        const o = idx * 3;
        const bp = bokehPoint(i, time);
        positions[o] = bp.x;
        positions[o + 1] = bp.y;
        positions[o + 2] = bp.z;
      }

      geo.attributes.position!.needsUpdate = true;
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
