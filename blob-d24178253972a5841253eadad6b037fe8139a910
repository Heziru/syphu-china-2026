import * as THREE from "three";

const SIGMA = 10;
const RHO = 28;
const BETA = 8 / 3;
const DT = 0.005;
const SCALE = 0.11;
const Z_OFFSET = 25;
/** Kaprekar constant — cursor “black hole” pull strength. */
const PULL_K = 6174 / 800_000;
const MOBIUS_PARTICLES = 900;

type StreamState = {
  x: number;
  y: number;
  z: number;
  mirror: 1 | -1;
  xShift: number;
  /** Ring buffer — latest sample at index 0. */
  trail: Float32Array;
  gold: boolean;
};

export type NocturneSceneHandle = {
  resize: () => void;
  dispose: () => void;
  particleCount: number;
};

function lorenzIntegrate(
  s: StreamState,
  mouseX: number,
  mouseY: number,
  pull: boolean,
) {
  let { x, y, z } = s;
  if (pull) {
    const px = s.mirror * x * SCALE + s.xShift;
    const py = y * SCALE;
    const dxm = mouseX - px;
    const dym = mouseY - py;
    const distSq = dxm * dxm + dym * dym + 70;
    const f = PULL_K / distSq;
    x += (dxm / SCALE) * f * 14 * s.mirror;
    y += (dym / SCALE) * f * 14;
  }
  const dx = SIGMA * (y - x) * DT;
  const dy = (x * (RHO - z) - y) * DT;
  const dz = (x * y - BETA * z) * DT;
  s.x = x + dx;
  s.y = y + dy;
  s.z = z + dz;
}

function pushTrail(s: StreamState, trailLen: number) {
  const t = s.trail;
  for (let i = trailLen - 1; i > 0; i--) {
    const j = i * 3;
    t[j] = t[j - 3]!;
    t[j + 1] = t[j - 2]!;
    t[j + 2] = t[j - 1]!;
  }
  t[0] = s.mirror * s.x * SCALE + s.xShift;
  t[1] = s.y * SCALE;
  t[2] = (s.z - Z_OFFSET) * SCALE * 0.85;
}

function mobiusPoint(u: number, v: number): THREE.Vector3 {
  const hu = u * 0.5;
  const rv = v * 0.42;
  return new THREE.Vector3(
    (1 + rv * Math.cos(hu)) * Math.cos(u),
    (1 + rv * Math.cos(hu)) * Math.sin(u),
    rv * Math.sin(hu),
  );
}

function fillColor(
  out: Float32Array,
  idx: number,
  gold: boolean,
  fade: number,
) {
  const i = idx * 3;
  const a = 0.35 + fade * 0.65;
  if (gold) {
    out[i] = 0.95 * a;
    out[i + 1] = 0.76 * a;
    out[i + 2] = 0.35 * a;
  } else {
    out[i] = 0.35 * a;
    out[i + 1] = 0.78 * a;
    out[i + 2] = 1 * a;
  }
}

function createStreams(
  count: number,
  trailLen: number,
  mirror: 1 | -1,
  xShift: number,
): StreamState[] {
  const streams: StreamState[] = [];
  for (let i = 0; i < count; i++) {
    const trail = new Float32Array(trailLen * 3);
    const sx = (0.1 + (Math.random() - 0.5) * 0.45) * (mirror < 0 ? -1 : 1);
    const sy = 0.1 + (Math.random() - 0.5) * 0.45;
    const sz = 19 + Math.random() * 12;
    for (let t = 0; t < trailLen; t++) {
      trail[t * 3] = mirror * sx * SCALE + xShift;
      trail[t * 3 + 1] = sy * SCALE;
      trail[t * 3 + 2] = (sz - Z_OFFSET) * SCALE * 0.85;
    }
    streams.push({
      x: sx,
      y: sy,
      z: sz,
      mirror,
      xShift,
      trail,
      gold: i % 3 === 0,
    });
  }
  return streams;
}

export function mountNocturneScene(
  canvas: HTMLCanvasElement,
  reducedMotion: boolean,
): NocturneSceneHandle {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x000000, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 300);
  camera.position.set(0, 0, 38);

  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  const streamsPerWing = isMobile ? 100 : 140;
  const particlesPerStream = isMobile ? 40 : 50;
  const trailLen = particlesPerStream;
  const lorenzParticleCount = streamsPerWing * 2 * particlesPerStream;
  const starCount = isMobile ? 1800 : 3200;
  const totalParticles = lorenzParticleCount + MOBIUS_PARTICLES + starCount;

  const wingL = createStreams(streamsPerWing, trailLen, 1, -5.8);
  const wingR = createStreams(streamsPerWing, trailLen, -1, 5.8);
  const allStreams = [...wingL, ...wingR];

  const lorenzPositions = new Float32Array(lorenzParticleCount * 3);
  const lorenzColors = new Float32Array(lorenzParticleCount * 3);
  const lorenzGeo = new THREE.BufferGeometry();
  lorenzGeo.setAttribute("position", new THREE.BufferAttribute(lorenzPositions, 3));
  lorenzGeo.setAttribute("color", new THREE.BufferAttribute(lorenzColors, 3));

  const lorenzMat = new THREE.PointsMaterial({
    size: isMobile ? 0.038 : 0.048,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0.92,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const lorenzPoints = new THREE.Points(lorenzGeo, lorenzMat);
  const lorenzGroup = new THREE.Group();
  lorenzGroup.add(lorenzPoints);
  scene.add(lorenzGroup);

  const mobiusPositions = new Float32Array(MOBIUS_PARTICLES * 3);
  const mobiusColors = new Float32Array(MOBIUS_PARTICLES * 3);
  const mobiusPhase = new Float32Array(MOBIUS_PARTICLES);
  for (let i = 0; i < MOBIUS_PARTICLES; i++) {
    mobiusPhase[i] = Math.random() * Math.PI * 2;
    const gold = i % 4 === 0;
    fillColor(mobiusColors, i, gold, 0.75);
  }
  const mobiusGeo = new THREE.BufferGeometry();
  mobiusGeo.setAttribute(
    "position",
    new THREE.BufferAttribute(mobiusPositions, 3),
  );
  mobiusGeo.setAttribute("color", new THREE.BufferAttribute(mobiusColors, 3));
  const mobiusPoints = new THREE.Points(
    mobiusGeo,
    new THREE.PointsMaterial({
      size: isMobile ? 0.032 : 0.04,
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  const mobiusGroup = new THREE.Group();
  mobiusGroup.add(mobiusPoints);
  scene.add(mobiusGroup);

  const starPositions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    starPositions[i * 3] = (Math.random() - 0.5) * 130;
    starPositions[i * 3 + 1] = (Math.random() - 0.5) * 90;
    starPositions[i * 3 + 2] = (Math.random() - 0.5) * 70 - 25;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
  scene.add(
    new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.035,
        transparent: true,
        opacity: 0.28,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    ),
  );
  const starPoints = scene.children[scene.children.length - 1] as THREE.Points;

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
  let t0 = performance.now();

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

  const applyCursorPull = (px: number, py: number) => {
    if (!pointerActive) return { px, py };
    const dx = mouseWorld.x - px;
    const dy = mouseWorld.y - py;
    const distSq = dx * dx + dy * dy;
    const r = 6.5;
    if (distSq > r * r) return { px, py };
    const f = (1 - Math.sqrt(distSq) / r) * 0.85;
    return { px: px + dx * f, py: py + dy * f };
  };

  const syncLorenzParticles = () => {
    let ptr = 0;
    for (let s = 0; s < allStreams.length; s++) {
      const stream = allStreams[s]!;
      for (let p = 0; p < particlesPerStream; p++) {
        const ti = p * 3;
        let px = stream.trail[ti]!;
        let py = stream.trail[ti + 1]!;
        let pz = stream.trail[ti + 2]!;
        const pulled = applyCursorPull(px, py);
        px = pulled.px;
        py = pulled.py;

        const o = ptr * 3;
        lorenzPositions[o] = px;
        lorenzPositions[o + 1] = py;
        lorenzPositions[o + 2] = pz;
        fillColor(lorenzColors, ptr, stream.gold, 1 - p / particlesPerStream);
        ptr++;
      }
    }
    (lorenzGeo.getAttribute("position") as THREE.BufferAttribute).needsUpdate =
      true;
    (lorenzGeo.getAttribute("color") as THREE.BufferAttribute).needsUpdate =
      true;
  };

  const syncMobiusParticles = (time: number) => {
    const R = 3.1;
    for (let i = 0; i < MOBIUS_PARTICLES; i++) {
      const u = mobiusPhase[i]! + time * 0.22 + (i / MOBIUS_PARTICLES) * Math.PI * 2;
      const v = Math.sin(time * 0.35 + i * 0.07) * 0.92;
      const p = mobiusPoint(u, v);
      const o = i * 3;
      mobiusPositions[o] = p.x * R;
      mobiusPositions[o + 1] = p.y * R;
      mobiusPositions[o + 2] = p.z * R;
    }
    (mobiusGeo.getAttribute("position") as THREE.BufferAttribute).needsUpdate =
      true;
  };

  syncLorenzParticles();

  const tick = (now: number) => {
    raf = requestAnimationFrame(tick);
    const time = (now - t0) * 0.001;
    updateMouseWorld();

    if (!reducedMotion) {
      const substeps = isMobile ? 1 : 2;
      for (let step = 0; step < substeps; step++) {
        for (const stream of allStreams) {
          lorenzIntegrate(stream, mouseWorld.x, mouseWorld.y, pointerActive);
          pushTrail(stream, trailLen);
        }
      }
      syncLorenzParticles();
      syncMobiusParticles(time);

      lorenzGroup.rotation.y = Math.sin(time * 0.11) * 0.07;
      lorenzGroup.rotation.x = Math.cos(time * 0.08) * 0.035;
      mobiusGroup.rotation.z = time * 0.13;
      mobiusGroup.rotation.x = 0.62 + Math.sin(time * 0.19) * 0.07;
    }

    renderer.render(scene, camera);
  };

  resize();
  raf = requestAnimationFrame(tick);

  const dispose = () => {
    cancelAnimationFrame(raf);
    canvas.removeEventListener("pointermove", onPointerMove);
    canvas.removeEventListener("pointerleave", onLeave);
    lorenzGeo.dispose();
    lorenzMat.dispose();
    mobiusGeo.dispose();
    (mobiusPoints.material as THREE.Material).dispose();
    starGeo.dispose();
    (starPoints.material as THREE.Material).dispose();
    renderer.dispose();
  };

  return { resize, dispose, particleCount: totalParticles };
}
