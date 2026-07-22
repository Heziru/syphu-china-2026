/** Central gesture recognition parameters — do not scatter in components. */

export const GESTURE_ASSET_PATHS = {
  wasmDir: "mediapipe/wasm",
  modelFile: "mediapipe/models/gesture_recognizer.task",
} as const;

export const gestureConfig = {
  /** Target inference rate (recognizeForVideo), not canvas rAF. */
  inferenceFps: 15,

  /** Closed_Fist score threshold (FIST_SCORE_THRESHOLD). */
  candidateScoreMin: 0.7,

  /** Sliding window of recent inference frames. */
  windowSize: 8,

  /** Hits required in window → fistStable. */
  windowHitsRequired: 6,

  /** Hits at or below this → release fistStable. */
  windowReleaseMax: 2,

  /** Open_Palm at or above this score triggers release. */
  openPalmReleaseScore: 0.55,

  /** Duration of complete no-hand before release. */
  releaseLowMs: 400,

  numHands: 1,

  fistCenterLandmarkIndices: [0, 9] as const,
  fistCenterLerp: 0.18,

  videoConstraints: {
    facingMode: "user" as const,
    width: { ideal: 640 },
    height: { ideal: 480 },
    frameRate: { ideal: 24, max: 30 },
  },
} as const;

export const gestureUiCopy = {
  requestingTitle: "CAMERA ACCESS",
  requestingBody: "Waiting for permission",
  stillWaitingBody: "Camera permission is still waiting.",
  timedOutBody: "Camera permission was not completed.",
  checkPermission: "Check camera permission",
  checkPermissionAria: "Check camera permission status",
  loadingTitle: "INITIALIZING",
  loadingBody: "Preparing recognition",
  ready: "SHOW YOUR HAND",
  handDetected: "HAND DETECTED",
  candidate: "HOLD YOUR FIST",
  active: "KEEP HOLDING",
  noHand: "SHOW YOUR HAND",
  completed: "ASSEMBLY COMPLETE",
  privacy: "Processed locally. No video is uploaded.",
  unavailable: "The assembly is paused until the camera is available.",
  denied:
    "Camera access is blocked. Allow camera access in your browser site settings, then retry.",
  notFound: "No camera was found.",
  notReadable:
    "The camera is unavailable or being used by another application.",
  notReadableHint: "Close other camera applications, then retry.",
  disabled: "Camera disabled.",
  overconstrained: "The requested camera settings are not supported.",
  aborted: "Camera initialization was interrupted.",
  insecure: "Camera access requires HTTPS.",
  modelError: "Hand recognition could not be loaded.",
  genericError: "The camera could not be started.",
  retry: "Retry camera access",
  retryAria: "Retry camera permission",
  disableAria: "Disable camera",
  previewAria: "Live camera preview for hand gesture recognition",
  tapToStart: "Tap to start camera",
  tapToStartAria: "Tap to start camera preview",
} as const;

export const heroGestureHints = {
  requesting: "Allow camera access to begin.",
  loading: "Preparing hand recognition…",
  ready: "Make a fist and hold.",
  candidate: "Hold your fist steady.",
  assembling: "Keep holding.",
  denied: "Camera access is required to reassemble.",
  error: "Camera access is required to reassemble.",
  disabled: "Camera access is required to reassemble.",
} as const;

export function mediapipeAssetUrl(relativePath: string): string {
  const base = import.meta.env.BASE_URL;
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  const normalizedPath = relativePath.replace(/^\//, "");
  return `${normalizedBase}${normalizedPath}`;
}

export function classifyCameraError(err: unknown): {
  kind: "denied" | "not-found" | "not-readable" | "insecure" | "error";
  message: string;
} {
  if (!(err instanceof Error)) {
    return { kind: "error", message: gestureUiCopy.genericError };
  }
  const name = err.name;
  switch (name) {
    case "NotAllowedError":
    case "PermissionDeniedError":
    case "SecurityError":
      return { kind: "denied", message: gestureUiCopy.denied };
    case "NotFoundError":
    case "DevicesNotFoundError":
      return { kind: "not-found", message: gestureUiCopy.notFound };
    case "NotReadableError":
    case "TrackStartError":
      return { kind: "not-readable", message: gestureUiCopy.notReadable };
    case "OverconstrainedError":
      return { kind: "error", message: gestureUiCopy.overconstrained };
    case "AbortError":
      return { kind: "error", message: gestureUiCopy.aborted };
    default:
      return { kind: "error", message: gestureUiCopy.genericError };
  }
}

export function logGestureDev(
  level: "info" | "error",
  message: string,
  ...args: unknown[]
) {
  if (!import.meta.env.DEV) return;
  if (level === "error") {
    console.error(`[gesture-camera] ${message}`, ...args);
  } else {
    console.info(`[gesture-camera] ${message}`, ...args);
  }
}
