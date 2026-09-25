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

/**
 * Draw 21 hand landmarks + connections.
 * If `mirrored` is true, x is flipped in draw space (use when canvas is NOT CSS-mirrored).
 * If the video+canvas wrapper already uses scaleX(-1), pass mirrored=false.
 */
export function drawHandLandmarks(
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmark[],
  width: number,
  height: number,
  mirrored: boolean,
  state: LandmarkDrawState,
) {
  if (!landmarks.length || width < 1 || height < 1) return;

  const colors = STATE_COLORS[state];
  const pt = (lm: NormalizedLandmark) => ({
    x: mirrored ? (1 - lm.x) * width : lm.x * width,
    y: lm.y * height,
  });

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Soft dark under-stroke for contrast on light skin
  ctx.strokeStyle = "rgba(10, 20, 16, 0.45)";
  ctx.lineWidth = 2.6;
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
  ctx.lineWidth = 1.5;
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
    ctx.arc(x, y, 3.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.fillStyle = colors.fill;
    ctx.arc(x, y, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

export function clearLandmarksCanvas(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
