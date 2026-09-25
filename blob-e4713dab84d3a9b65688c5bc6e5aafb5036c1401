import * as THREE from "three";

const SIGMA = 10;
const RHO = 28;
const BETA = 8 / 3;
const DT = 0.0048;
const SCALE = 0.11;
const Z_OFFSET = 25;
/** Kaprekar constant — scales cursor “black hole” pull (reference: 6174). */
const PULL_K = 6174 / 1_000_000;

type LorenzStream = {
  pos: THREE.Vector3;
  line: THREE.Line;
  positions: Float32Array;
  hue: "blue" | "gold";
  mirror: 1 | -1;
  xShift: number;
};

export type NocturneSceneHandle = {
  resize: () => void;
  dispose: () => void;
};

function lorenzStep(
  v: THREE.Vector3,
  mouse: THREE.Vector3,
  pull: boolean,
  mirror: 1 | -1,
  xShift: number,
): THREE.Vector3 {
  let { x, y, z } = v;
  if (pull) {
    const px = mirror * x * SCALE + xShift;
    const py = y * SCALE;
    const dxm = mouse.x - px;
    const dym = mouse.y - py;
    const distSq = dxm * dxm + dym * dym + 90;
    const f = PULL_K / distSq;
    x += (dxm / SCALE) * f * 12 * mirror;
    y += (dym / SCALE) * f * 12;
  }
  const dx = SIGMA * (y - x) * DT;
  const dy = (x * (RHO - z) - y) * DT;
  const dz = (x * y - BETA * z) * DT;
  return new THREE.Vector3(x + dx, y + dy, z + dz);
}

function mobiusPoint(u: number, v: number, r: number): THREE.Vector3 {
  const hu = u * 0.5;
  const rv = v * 0.42;
  return new THREE.Vector3(
    (r + rv * Math.cos(hu)) * Math.cos(u),
    (r + rv * Math.cos(hu)) * Math.sin(u),
    rv * Math.sin(hu),
  );
}

function createMobius(): THREE.Line {
  const segments = 220;
  const verts: number[] = [];
  for (let i = 0; i <= segments; i++) {
    const u = (i / segments) * Math.PI * 2;
    const p = mobiusPoint(u, 0.92, 1);
    verts.push(p.x * 3.2, p.y * 3.2, p.z * 3.2);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  const mat = new THREE.LineBasicMaterial({
    color: 0xf5f0e6,
    transparent: true,
    opacity: 0.55,
    blending: THREE.AdditiveBlending,
  });
  return new THREE.Line(geo, mat);
}

function createMobiusInner(): THREE.Line {
  const segments = 220;
  const verts: number[] = [];
  for (let i = 0; i <= segments; i++) {
    const u = (i / segments) * Math.PI * 2;
    const p = mobiusPoint(u, -0.92, 1);
    verts.push(p.x * 3.15, p.y * 3.15, p.z * 3.15);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
  const mat = new THREE.LineBasicMaterial({
    color: 0xd4af6a,
    transparent: true,
    opacity: 0.38,
    blending: THREE.AdditiveBlending,
  });
  return new THREE.Line(geo, mat);
}

function createStars(count: number): THREE.Points {
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 120;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 80;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 60 - 20;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.06,
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  return new THREE.Points(geo, mat);
}

function createLorenzWing(
  count: number,
  trailLen: number,
  mirror: 1 | -1,
  xShift: number,
): LorenzStream[] {
  const streams: LorenzStream[] = [];
  for (let i = 0; i < count; i++) {
    const positions = new Float32Array(trailLen * 3);
    const start = new THREE.Vector3(
      0.1 + (Math.random() - 0.5) * 0.4,
      0.1 + (Math.random() - 0.5) * 0.4,
      19 + Math.random() * 12,
    );
    if (mirror < 0) start.x *= -1;

    for (let t = 0; t < trailLen; t++) {
      positions[t * 3] = mirror * start.x * SCALE + xShift;
      positions[t * 3 + 1] = start.y * SCALE;
      positions[t * 3 + 2] = (start.z - Z_OFFSET) * SCALE * 0.85;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const hue = i % 3 === 0 ? "gold" : "blue";
    const mat = new THREE.LineBasicMaterial({
      color: hue === "gold" ? 0xe8b84a : 0x4db8ff,
      transparent: true,
      opacity: hue === "gold" ? 0.72 : 0.58,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const line = new THREE.Line(geo, mat);
    streams.push({ pos: start.clone(), line, positions, hue, mirror, xShift });
  }
  return streams;
}

function shiftTrail(
  positions: Float32Array,
  trailLen: number,
  x: number,
  y: number,
  z: number,
) {
  for (let i = trailLen - 1; i > 0; i--) {
    positions[i * 3] = positions[(i - 1) * 3]!;
    positions[i * 3 + 1] = positions[(i - 1) * 3 + 1]!;
    positions[i * 3 + 2] = positions[(i - 1) * 3 + 2]!;
  }
  positions[0] = x;
  positions[1] = y;
  positions[2] = z;
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
  const streamCount = isMobile ? 36 : 64;
  const trailLen = isMobile ? 120 : 200;

  const wingL = createLorenzWing(streamCount, trailLen, 1, -5.5);
  const wingR = createLorenzWing(streamCount, trailLen, -1, 5.5);
  const allStreams = [...wingL, ...wingR];

  const lorenzGroup = new THREE.Group();
  for (const s of allStreams) lorenzGroup.add(s.line);
  scene.add(lorenzGroup);

  const mobiusGroup = new THREE.Group();
  const mobiusA = createMobius();
  const mobiusB = createMobiusInner();
  mobiusGroup.add(mobiusA, mobiusB);
  scene.add(mobiusGroup);

  scene.add(createStars(isMobile ? 600 : 1400));

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

  const tick = (now: number) => {
    raf = requestAnimationFrame(tick);
    const time = (now - t0) * 0.001;
    updateMouseWorld();

    if (!reducedMotion) {
      const steps = isMobile ? 2 : 3;
      for (let step = 0; step < steps; step++) {
        for (const stream of allStreams) {
          stream.pos = lorenzStep(
            stream.pos,
            mouseWorld,
            pointerActive,
            stream.mirror,
            stream.xShift,
          );
          const px = stream.mirror * stream.pos.x * SCALE + stream.xShift;
          const py = stream.pos.y * SCALE;
          const pz = (stream.pos.z - Z_OFFSET) * SCALE * 0.85;
          shiftTrail(stream.positions, trailLen, px, py, pz);
          const attr = stream.line.geometry.getAttribute("position");
          (attr as THREE.BufferAttribute).needsUpdate = true;
        }
      }

      lorenzGroup.rotation.y = Math.sin(time * 0.12) * 0.08;
      lorenzGroup.rotation.x = Math.cos(time * 0.09) * 0.04;
      mobiusGroup.rotation.z = time * 0.14;
      mobiusGroup.rotation.x = 0.62 + Math.sin(time * 0.2) * 0.08;
    }

    renderer.render(scene, camera);
  };

  resize();
  raf = requestAnimationFrame(tick);

  const dispose = () => {
    cancelAnimationFrame(raf);
    canvas.removeEventListener("pointermove", onPointerMove);
    canvas.removeEventListener("pointerleave", onLeave);
    for (const s of allStreams) {
      s.line.geometry.dispose();
      (s.line.material as THREE.Material).dispose();
    }
    mobiusA.geometry.dispose();
    (mobiusA.material as THREE.Material).dispose();
    mobiusB.geometry.dispose();
    (mobiusB.material as THREE.Material).dispose();
    renderer.dispose();
  };

  return { resize, dispose };
}
