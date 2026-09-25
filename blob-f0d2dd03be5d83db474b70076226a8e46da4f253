import type { NormalizedLandmark } from "@mediapipe/tasks-vision";

/** MediaPipe hand connections (21 landmarks). */
export const HAND_CONNECTIONS: ReadonlyArray<readonly [number, number]> = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [5, 9],
  [9, 10],
  [10, 11],
  [11, 12],
  [9, 13],
  [13, 14],
  [14, 15],
  [15, 16],
  [13, 17],
  [0, 17],
  [17, 18],
  [18, 19],
  [19, 20],
] as const;

export type LandmarkDrawState =
  | "hand"
  | "fist-candidate"
  | "fist-stable";

const STATE_COLORS: Record<
  LandmarkDrawState,
  { stroke: string; fill: string }
> = {
  hand: {
    stroke: "rgba(120, 190, 160, 0.72)",
    fill: "rgba(120, 190, 160, 0.72)",
  },
  "fist-candidate": {
    stroke: "rgba(80, 190, 150, 0.88)",
    fill: "rgba(80, 190, 150, 0.88)",
  },
  "fist-stable": {
    stroke: "rgba(185, 225, 160, 0.96)",
    fill: "rgba(185, 225, 160, 0.96)",
  },
};

/** Map normalized landmarks into a box the same way `object-fit: cover` crops video. */
export function coverLandmarkPoint(
  lm: NormalizedLandmark,
  boxW: number,
  boxH: number,
  videoW: number,
  videoH: number,
  mirrored: boolean,
) {
  const vw = Math.max(1, videoW);
  const vh = Math.max(1, videoH);
  const videoAspect = vw / vh;
  const boxAspect = boxW / boxH;
  let drawW: number;
  let drawH: number;
  let offsetX: number;
  let offsetY: number;
  if (videoAspect > boxAspect) {
    drawH = boxH;
    drawW = boxH * videoAspect;
    offsetX = (boxW - drawW) / 2;
    offsetY = 0;
  } else {
    drawW = boxW;
    drawH = boxW / videoAspect;
    offsetX = 0;
    offsetY = (boxH - drawH) / 2;
  }
  const nx = mirrored ? 1 - lm.x : lm.x;
  return {
    x: nx * drawW + offsetX,
    y: lm.y * drawH + offsetY,
  };
}

/**
 * Draw 21 hand landmarks + connections.
 * If `mirrored` is true, x is flipped in draw space (use when canvas is NOT CSS-mirrored).
 * If the video+canvas wrapper already uses scaleX(-1), pass mirrored=false.
 * Pass video intrinsic size so dots align with `object-fit: cover` video.
 */
export function drawHandLandmarks(
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmark[],
  width: number,
  height: number,
  mirrored: boolean,
  state: LandmarkDrawState,
  scale = 1,
  videoWidth = 0,
  videoHeight = 0,
) {
  if (!landmarks.length || width < 1 || height < 1) return;

  const colors = STATE_COLORS[state];
  const vw = videoWidth > 0 ? videoWidth : width;
  const vh = videoHeight > 0 ? videoHeight : height;
  const pt = (lm: NormalizedLandmark) =>
    coverLandmarkPoint(lm, width, height, vw, vh, mirrored);

  const s = Math.max(0.8, scale);
  const underR = 3.1 * s;
  const dotR = 2.2 * s;
  const underStroke = 2.6 * s;
  const stroke = 1.5 * s;

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Soft dark under-stroke for contrast on light skin
  ctx.strokeStyle = "rgba(10, 20, 16, 0.45)";
  ctx.lineWidth = underStroke;
  for (const [a, b] of HAND_CONNECTIONS) {
    const pa = landmarks[a];
    const pb = landmarks[b];
    if (!pa || !pb) continue;
    const A = pt(pa);
    const B = pt(pb);
    ctx.beginPath();
    ctx.moveTo(A.x, A.y);
    ctx.lineTo(B.x, B.y);
    ctx.stroke();
  }

  ctx.strokeStyle = colors.stroke;
  ctx.lineWidth = stroke;
  for (const [a, b] of HAND_CONNECTIONS) {
    const pa = landmarks[a];
    const pb = landmarks[b];
    if (!pa || !pb) continue;
    const A = pt(pa);
    const B = pt(pb);
    ctx.beginPath();
    ctx.moveTo(A.x, A.y);
    ctx.lineTo(B.x, B.y);
    ctx.stroke();
  }

  for (const lm of landmarks) {
    const { x, y } = pt(lm);
    ctx.beginPath();
    ctx.fillStyle = "rgba(10, 20, 16, 0.4)";
    ctx.arc(x, y, underR, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.fillStyle = colors.fill;
    ctx.arc(x, y, dotR, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

export function clearLandmarksCanvas(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
