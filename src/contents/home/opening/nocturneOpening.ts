import * as THREE from "three";
import { createNocturneMaterial, setNocturneDpr } from "./nocturneShader";
import { MOUSE_K, type Vec3 } from "./nocturneMath";
import {
  bokehColor,
  bokehPoint,
  morphPoint,
  particleAlpha,
  particleColor,
  particleSize,
  SCENE_SCALE,
  shapeDensity,
} from "./nocturneShapes";
import { bandWeight, DURATION, sampleCamera } from "./nocturneTimeline";

export type NocturneOpeningHandle = {
  resize: () => void;
  dispose: () => void;
};

const SPREAD = 1.28;

function applyMouse(x: number, y: number, px: number, py: number, active: boolean) {
  if (!active) return { x, y };
  const dx = x - px;
  const dy = y - py;
  const distSq = dx * dx + dy * dy;
  const voidR = 2.2 * SCENE_SCALE;
  const inf = 9 * SCENE_SCALE;
  if (distSq > inf * inf) return { x, y };
  const dist = Math.sqrt(distSq) + 0.04;
  let nx = x;
  let ny = y;
  if (dist < voidR * 2.6) {
    const push = ((voidR * 2.6 - dist) / (voidR * 2.6)) ** 1.3 * 1.5;
    nx += (dx / dist) * push;
    ny += (dy / dist) * push;
  }
  const f = MOUSE_K / (distSq + 60);
  nx += dx * f * 70;
  ny += dy * f * 70;
  const swirl = (1 - dist / inf) * 0.3;
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
  const camera = new THREE.PerspectiveCamera(44, 1, 0.1, 250);
  camera.position.set(0, 0.05, 30);

  const mobile = window.matchMedia("(max-width: 768px)").matches;
  const coreCount = mobile ? 12000 : 20000;
  const bokehCount = mobile ? 120 : 220;
  const total = coreCount + bokehCount;
  const timeScale = reduced ? 0.6 : 1;

  const positions = new Float32Array(total * 3);
  const colors = new Float32Array(total * 3);
  const sizes = new Float32Array(total);
  const alphas = new Float32Array(total);

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
  geo.setAttribute("aAlpha", new THREE.BufferAttribute(alphas, 1));

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
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
    const elapsed = ((now - t0) * 0.001) * timeScale;
    const cycle = elapsed % DURATION;
    const cam = sampleCamera(cycle);
    const bandW = bandWeight(cycle);

    camera.position.z = cam.camZ;
    group.rotation.x = cam.rotX + Math.sin(elapsed * 0.3) * 0.03;
    group.rotation.y = elapsed * (0.06 + bandW * 0.06) + Math.sin(elapsed * 0.45) * 0.04;
    group.rotation.z = Math.sin(elapsed * 0.22) * 0.015;

    raycaster.setFromCamera(mouseNdc, camera);
    const hit = raycaster.ray.intersectPlane(plane, mouseWorld);
    const mx = pointerActive && hit ? mouseWorld.x : 0;
    const my = pointerActive && hit ? mouseWorld.y : 0;

    for (let i = 0; i < coreCount; i++) {
      const p: Vec3 = morphPoint(i, cycle, SPREAD);
      const m = applyMouse(p.x, p.y, mx, my, pointerActive);
      const j = i * 3;
      positions[j] = m.x;
      positions[j + 1] = m.y;
      positions[j + 2] = p.z;

      const density = shapeDensity(i, cycle, SPREAD);
      const col = particleColor(i, density, cycle);
      colors[j] = col.r;
      colors[j + 1] = col.g;
      colors[j + 2] = col.b;
      sizes[i] = particleSize(i, density, cycle);
      alphas[i] = particleAlpha(i, density, cycle);
    }

    for (let i = 0; i < bokehCount; i++) {
      const idx = coreCount + i;
      const o = idx * 3;
      const bp = bokehPoint(i, elapsed);
      positions[o] = bp.x;
      positions[o + 1] = bp.y;
      positions[o + 2] = bp.z;
      const bc = bokehColor(i);
      colors[o] = bc.r;
      colors[o + 1] = bc.g;
      colors[o + 2] = bc.b;
      sizes[idx] = 0.9 + (i % 4) * 0.15;
      alphas[idx] = 0.08 + (i % 3) * 0.02;
    }

    geo.attributes.position!.needsUpdate = true;
    geo.attributes.color!.needsUpdate = true;
    geo.attributes.aSize!.needsUpdate = true;
    geo.attributes.aAlpha!.needsUpdate = true;
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
