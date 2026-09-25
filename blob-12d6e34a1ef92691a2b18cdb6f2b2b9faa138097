import * as THREE from "three";
import { createNocturneMaterial, setNocturneDpr } from "./nocturneShader";
import { MOUSE_K, lerp, lerp3, smoothstep, type Vec3 } from "./nocturneMath";
import { bokehPoint, shapeColor, shapePoint } from "./nocturneShapes";
import { isDynamic, sampleTimeline, type SceneMode } from "./nocturneTimeline";

export type NocturneOpeningHandle = {
  resize: () => void;
  dispose: () => void;
};

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
  camera.position.set(0, 0.15, 38);

  const mobile = window.matchMedia("(max-width: 768px)").matches;
  const coreCount = mobile ? 20000 : 48000;
  const bokehCount = mobile ? 70 : 140;
  const total = coreCount + bokehCount;

  const positions = new Float32Array(total * 3);
  const colors = new Float32Array(total * 3);
  const sizes = new Float32Array(total);

  for (let i = 0; i < coreCount; i++) {
    sizes[i] = 0.52 + (i % 19) * 0.022;
  }
  for (let i = 0; i < bokehCount; i++) {
    sizes[coreCount + i] = 2.1 + (i % 8) * 0.32;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const mat = createNocturneMaterial(dpr);
  const group = new THREE.Group();
  group.add(new THREE.Points(geo, mat));
  scene.add(group);

  const orbitGroup = new THREE.Group();
  const orbitMat = new THREE.LineBasicMaterial({
    color: 0x3a3a48,
    transparent: true,
    opacity: 0.35,
  });
  for (let r = 0; r < 4; r++) {
    const pts: THREE.Vector3[] = [];
    const rad = [7.5, 9.2, 11, 13.5][r]!;
    for (let k = 0; k <= 128; k++) {
      const a = (k / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * rad, 0, Math.sin(a) * rad * 0.35));
    }
    const line = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), orbitMat);
    line.rotation.x = 0.35 + r * 0.12;
    line.rotation.z = r * 0.4;
    orbitGroup.add(line);
  }
  orbitGroup.visible = false;
  scene.add(orbitGroup);

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
  let frame = 0;

  const tick = (now: number) => {
    raf = requestAnimationFrame(tick);
    frame++;
    const elapsed = (now - t0) * 0.001;
    const time = reduced ? 12 : elapsed;
    const sceneState = sampleTimeline(time);
    const morphT = smoothstep(sceneState.blend);
    const modeA = sceneState.mode;
    const modeB = sceneState.next.mode;

    const camZ = lerp(sceneState.camZ, sceneState.next.camZ, morphT);
    const rotX = lerp(sceneState.rotX, sceneState.next.rotX, morphT);
    const rotY = lerp(sceneState.rotY, sceneState.next.rotY, morphT);
    const spread = lerp(sceneState.spread, sceneState.next.spread, morphT);
    const tint = morphT < 0.5 ? sceneState.tint : sceneState.next.tint;
    const activeMode: SceneMode = morphT < 0.5 ? modeA : modeB;

    camera.position.z = camZ;
    group.rotation.x = rotX + Math.sin(time * 0.07) * 0.025;
    group.rotation.y = rotY + time * 0.018;
    group.rotation.z = Math.sin(time * 0.05) * 0.02;

    orbitGroup.visible = activeMode === "orbit";
    orbitGroup.rotation.y = time * 0.04;

    raycaster.setFromCamera(mouseNdc, camera);
    const hit = raycaster.ray.intersectPlane(plane, mouseWorld);
    const mx = pointerActive && hit ? mouseWorld.x : 0;
    const my = pointerActive && hit ? mouseWorld.y : 0;

    const warmBias = tint === "warm" ? 0.75 : 0;
    const updateShapes = !reduced || frame % 2 === 0;

    for (let i = 0; i < coreCount; i++) {
      let p: Vec3;
      if (updateShapes) {
        const pa = shapePoint(modeA, i, coreCount, time, spread);
        if (modeB === modeA) {
          p = pa;
        } else {
          const pb = shapePoint(modeB, i, coreCount, time, spread);
          p = isDynamic(modeA) && !isDynamic(modeB) ? pb : isDynamic(modeB) && !isDynamic(modeA) ? pa : lerp3(pa, pb, morphT);
        }
      } else {
        const j = i * 3;
        p = { x: positions[j]!, y: positions[j + 1]!, z: positions[j + 2]! };
      }

      const m = applyMouse(p.x, p.y, mx, my, pointerActive);
      const j = i * 3;
      positions[j] = m.x;
      positions[j + 1] = m.y;
      positions[j + 2] = p.z;

      const dist = Math.hypot(p.x, p.y, p.z);
      const col = shapeColor(activeMode, tint, i, dist, warmBias);
      colors[j] = col.r;
      colors[j + 1] = col.g;
      colors[j + 2] = col.b;
    }

    for (let i = 0; i < bokehCount; i++) {
      const idx = coreCount + i;
      const o = idx * 3;
      const bp = bokehPoint(i, time);
      const alpha = 0.1 + (i % 5) * 0.018;
      positions[o] = bp.x;
      positions[o + 1] = bp.y;
      positions[o + 2] = bp.z;
      colors[o] = alpha;
      colors[o + 1] = alpha * 1.05;
      colors[o + 2] = alpha * 1.15;
    }

    geo.attributes.position!.needsUpdate = true;
    geo.attributes.color!.needsUpdate = true;
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
      orbitMat.dispose();
      orbitGroup.traverse((o) => {
        if (o instanceof THREE.LineLoop) o.geometry.dispose();
      });
      renderer.dispose();
    },
  };
}
