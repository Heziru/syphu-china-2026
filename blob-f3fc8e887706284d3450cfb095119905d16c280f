import * as THREE from "three";

export type OpeningPhase = "converge" | "interactive" | "disperse" | "title";

export type NocturneSceneHandle = {
  resize: () => void;
  dispose: () => void;
  particleCount: number;
};

type PhaseListener = (phase: OpeningPhase) => void;

const CONVERGE_SEC = 5.5;
const INTERACTIVE_SEC = 7;
const DISPERSE_SEC = 4.5;

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3;
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

function galaxyTarget(i: number, n: number, arms: number) {
  const arm = i % arms;
  const u = i / n;
  const t = 0.15 + u * 11.5;
  const angle = (arm / arms) * Math.PI * 2 + t * 0.92 + (i % 97) * 0.0018;
  const r = 0.4 + t * 2.15;
  const jitter = ((i * 7919) % 1000) / 1000 - 0.5;
  return {
    x: Math.cos(angle) * r + jitter * 0.35,
    y: Math.sin(angle) * r * 0.38 + jitter * 0.18,
    z: (((i * 6271) % 1000) / 1000 - 0.5) * 1.6,
  };
}

function scatterTarget(i: number, n: number) {
  const u = i / n;
  const theta = u * Math.PI * 2 * 13.7 + (i % 503) * 0.017;
  const phi = Math.acos(2 * (((i * 3571) % 1000) / 1000) - 1);
  const r = 14 + ((i * 9829) % 1000) / 1000 * 38;
  return {
    x: r * Math.sin(phi) * Math.cos(theta),
    y: r * Math.sin(phi) * Math.sin(theta) * 0.55,
    z: r * Math.cos(phi) * 0.35 - 8,
  };
}

export function mountNocturneScene(
  canvas: HTMLCanvasElement,
  reducedMotion: boolean,
  onPhase?: PhaseListener,
): NocturneSceneHandle {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x000000, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 400);
  camera.position.set(0, 0, 42);

  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  const count = isMobile ? 95000 : 260000;
  const arms = isMobile ? 3 : 4;

  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  const scatter = new Float32Array(count * 3);
  const galaxy = new Float32Array(count * 3);
  const driftPhase = new Float32Array(count);
  const driftAmp = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const s = scatterTarget(i, count);
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

    driftPhase[i] = (i % 628) * 0.01;
    driftAmp[i] = 0.35 + ((i * 4177) % 1000) / 1000 * 1.4;

    const warm = i % 5 === 0;
    const mix = ((i * 2659) % 1000) / 1000;
    if (warm) {
      colors[o] = 0.92 + mix * 0.08;
      colors[o + 1] = 0.72 + mix * 0.12;
      colors[o + 2] = 0.38 + mix * 0.15;
    } else {
      colors[o] = 0.55 + mix * 0.25;
      colors[o + 1] = 0.78 + mix * 0.15;
      colors[o + 2] = 1;
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: isMobile ? 0.082 : 0.118,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0.94,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
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
    const voidR = 2.8;
    const influenceR = 9.5;
    if (distSq > influenceR * influenceR) return { x, y };

    const dist = Math.sqrt(distSq) + 0.08;
    let nx = x;
    let ny = y;

    if (dist < voidR * 2.2) {
      const push = ((voidR * 2.2 - dist) / (voidR * 2.2)) * 1.35;
      nx += (dx / dist) * push;
      ny += (dy / dist) * push;
    }

    const swirl = (1 - dist / influenceR) * 0.55;
    nx += (-dy / dist) * swirl * Math.sin(time * 1.6 + dist);
    ny += (dx / dist) * swirl * Math.sin(time * 1.6 + dist);

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
          ? easeOutCubic(Math.min(1, elapsed / CONVERGE_SEC))
          : 1;
      const disperseT =
        phase === "disperse" || phase === "title"
          ? easeInOutCubic(
              Math.min(
                1,
                (elapsed - CONVERGE_SEC - INTERACTIVE_SEC) / DISPERSE_SEC,
              ),
            )
          : 0;

      const spin = elapsed * 0.07;
      const galaxyPull = phase === "interactive" ? 1 : 1 - disperseT * 0.15;

      for (let i = 0; i < count; i++) {
        const o = i * 3;
        let gx = galaxy[o]!;
        let gy = galaxy[o + 1]!;
        let gz = galaxy[o + 2]!;

        if (phase === "interactive" || phase === "converge") {
          const cs = Math.cos(spin);
          const sn = Math.sin(spin);
          const rx = gx * cs - gy * sn * 0.4;
          const ry = gx * sn * 0.4 + gy * cs;
          gx = rx;
          gy = ry;
        }

        let x =
          scatter[o]! * (1 - convergeT) +
          gx * convergeT * galaxyPull +
          scatter[o]! * disperseT * 0.92;
        let y =
          scatter[o + 1]! * (1 - convergeT) +
          gy * convergeT * galaxyPull +
          scatter[o + 1]! * disperseT * 0.92;
        let z =
          scatter[o + 2]! * (1 - convergeT) +
          gz * convergeT * galaxyPull +
          scatter[o + 2]! * disperseT * 0.75;

        if (phase === "disperse" || phase === "title") {
          const drift =
            Math.sin(elapsed * 0.55 + driftPhase[i]!) * driftAmp[i]! * disperseT;
          x += drift;
          y += Math.cos(elapsed * 0.42 + driftPhase[i]! * 1.3) * driftAmp[i]! * 0.35 * disperseT;
        }

        if (phase === "interactive" || phase === "disperse") {
          const deflected = applyMouseField(x, y, elapsed);
          x = deflected.x;
          y = deflected.y;
        }

        positions[o] = x;
        positions[o + 1] = y;
        positions[o + 2] = z;
      }

      (geo.getAttribute("position") as THREE.BufferAttribute).needsUpdate = true;

      group.rotation.y = Math.sin(elapsed * 0.09) * 0.04;
      group.rotation.x = Math.cos(elapsed * 0.07) * 0.025;
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
