import * as THREE from "three";
import { createNocturneMaterial, setNocturneDpr } from "./nocturneShader";
import { MOUSE_K, lerp, smoothstep, type Vec3 } from "./nocturneMath";
import {
  bandParticleColor,
  bandParticleSize,
  bokehColor,
  bokehPoint,
  morphPoint,
  shapeDensity,
} from "./nocturneShapes";
import { DURATION, sampleTimeline } from "./nocturneTimeline";

export type NocturneOpeningHandle = {
  resize: () => void;
  dispose: () => void;
};

const SPREAD = 1.05;

function applyMouse(x: number, y: number, px: number, py: number, active: boolean) {
  if (!active) return { x, y };
  const dx = x - px;
  const dy = y - py;
  const distSq = dx * dx + dy * dy;
  const voidR = 2.2;
  const inf = 9;
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
  camera.position.set(0, 0.08, 38);

  const mobile = window.matchMedia("(max-width: 768px)").matches;
  const coreCount = mobile ? 9000 : 16000;
  const bokehCount = mobile ? 45 : 90;
  const total = coreCount + bokehCount;
  const timeScale = reduced ? 0.55 : 1;

  const positions = new Float32Array(total * 3);
  const colors = new Float32Array(total * 3);
  const sizes = new Float32Array(total);
  const alphas = new Float32Array(total);

  for (let i = 0; i < coreCount; i++) {
    const density = shapeDensity(i, 0, SPREAD);
    sizes[i] = bandParticleSize(i, density);
    alphas[i] = 0.18 + density * 0.42;
    const col = bandParticleColor(i, density);
    const j = i * 3;
    colors[j] = col.r;
    colors[j + 1] = col.g;
    colors[j + 2] = col.b;
  }
  for (let i = 0; i < bokehCount; i++) {
    const idx = coreCount + i;
    sizes[idx] = 1.1 + (i % 5) * 0.18;
    alphas[idx] = 0.06 + (i % 4) * 0.015;
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
    const sceneState = sampleTimeline(cycle);
    const morphT = smoothstep(sceneState.blend);

    const camZ = lerp(sceneState.camZ, sceneState.next.camZ, morphT);
    const rotX = lerp(sceneState.rotX, sceneState.next.rotX, morphT);

    camera.position.z = camZ;
    group.rotation.x = rotX + Math.sin(elapsed * 0.35) * 0.04;
    group.rotation.y = elapsed * 0.12 + Math.sin(elapsed * 0.5) * 0.06;
    group.rotation.z = Math.sin(elapsed * 0.28) * 0.02;

    raycaster.setFromCamera(mouseNdc, camera);
    const hit = raycaster.ray.intersectPlane(plane, mouseWorld);
    const mx = pointerActive && hit ? mouseWorld.x : 0;
    const my = pointerActive && hit ? mouseWorld.y : 0;

    for (let i = 0; i < coreCount; i++) {
      const p: Vec3 = morphPoint(i, coreCount, cycle, SPREAD);
      const m = applyMouse(p.x, p.y, mx, my, pointerActive);
      const j = i * 3;
      positions[j] = m.x;
      positions[j + 1] = m.y;
      positions[j + 2] = p.z;
    }

    for (let i = 0; i < bokehCount; i++) {
      const idx = coreCount + i;
      const o = idx * 3;
      const bp = bokehPoint(i, elapsed);
      positions[o] = bp.x;
      positions[o + 1] = bp.y;
      positions[o + 2] = bp.z;
    }

    geo.attributes.position!.needsUpdate = true;
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
