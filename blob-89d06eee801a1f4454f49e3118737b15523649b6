import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import {
  FilesetResolver,
  GestureRecognizer,
  type NormalizedLandmark,
} from "@mediapipe/tasks-vision";
import {
  clearLandmarksCanvas,
  drawHandLandmarks,
  type LandmarkDrawState,
} from "../gesture/drawHandLandmarks";
import {
  GESTURE_ASSET_PATHS,
  classifyCameraError,
  gestureConfig,
  gestureUiCopy,
  logGestureDev,
  mediapipeAssetUrl,
} from "../gesture/gestureConfig";
import {
  prefersTapToStartCamera,
  prepareCameraVideoElement,
} from "../gesture/mobileCamera";
import type {
  CameraErrorKind,
  FistGesturePublicState,
  GestureCameraPhase,
  InteractionPoint,
  PermissionWaitLevel,
} from "../gesture/gestureTypes";

function getInferenceFps() {
  return prefersTapToStartCamera()
    ? gestureConfig.mobileInferenceFps
    : gestureConfig.inferenceFps;
}

function getFistScoreMin() {
  return prefersTapToStartCamera()
    ? gestureConfig.mobileCandidateScoreMin
    : gestureConfig.candidateScoreMin;
}

function getWindowHitsRequired() {
  return prefersTapToStartCamera()
    ? gestureConfig.mobileWindowHitsRequired
    : gestureConfig.windowHitsRequired;
}

function phaseStatus(
  phase: GestureCameraPhase,
  wait: PermissionWaitLevel = null,
): string {
  if (phase === "requesting-permission") {
    if (wait === "still-waiting") return gestureUiCopy.stillWaitingBody;
    if (wait === "timed-out") return gestureUiCopy.timedOutBody;
    return gestureUiCopy.requestingBody;
  }
  switch (phase) {
    case "loading-model":
      return gestureUiCopy.loadingBody;
    case "ready":
    case "no-hand":
      return gestureUiCopy.ready;
    case "hand-detected":
      return gestureUiCopy.handDetected;
    case "candidate":
      return gestureUiCopy.candidate;
    case "active":
      return gestureUiCopy.active;
    case "completed":
      return gestureUiCopy.completed;
    case "needs-tap":
      return gestureUiCopy.tapToStart;
    case "denied":
      return gestureUiCopy.denied;
    case "error":
      return gestureUiCopy.genericError;
    default:
      return gestureUiCopy.requestingBody;
  }
}

function fistCenterFromLandmarks(
  landmarks: NormalizedLandmark[],
): InteractionPoint | null {
  const indices = gestureConfig.fistCenterLandmarkIndices;
  let x = 0;
  let y = 0;
  let n = 0;
  for (const i of indices) {
    const p = landmarks[i];
    if (!p) continue;
    x += p.x;
    y += p.y;
    n += 1;
  }
  if (n === 0) return null;
  return { x: 1 - x / n, y: y / n };
}

function drawStateForPhase(phase: GestureCameraPhase): LandmarkDrawState {
  if (phase === "active") return "fist-stable";
  if (phase === "candidate") return "fist-candidate";
  return "hand";
}

type InternalRefs = {
  stream: MediaStream | null;
  recognizer: GestureRecognizer | null;
  video: HTMLVideoElement | null;
  landmarksCanvas: HTMLCanvasElement | null;
  rafId: number;
  lastInferTs: number;
  lastVideoTime: number;
  inferBusy: boolean;
  candidateBits: boolean[];
  fistStable: boolean;
  noHandSince: number | null;
  smoothedCenter: InteractionPoint | null;
  /** Generation for the in-flight enable(); incremented on each enable/retry. */
  initGen: number;
  completed: boolean;
  completeTimer: number | null;
  waitTimer8: number | null;
  waitTimer20: number | null;
  lastPublishedPhase: GestureCameraPhase | null;
  lastPublishedStable: boolean | null;
  permissionWaitLevel: PermissionWaitLevel;
};

const initialPublic = (): FistGesturePublicState => ({
  phase: "idle",
  statusText: phaseStatus("idle"),
  error: null,
  errorKind: null,
  fistStable: false,
  cameraEnabled: false,
  needsTapToStart: false,
  permissionWaitLevel: null,
  fistCenterNorm: null,
});

export type UseFistGestureResult = FistGesturePublicState & {
  videoRef: RefObject<HTMLVideoElement | null>;
  landmarksCanvasRef: RefObject<HTMLCanvasElement | null>;
  enable: () => Promise<void>;
  disable: () => void;
  resumePlayback: () => Promise<void>;
  completeAndStop: () => void;
  checkPermission: () => Promise<void>;
};

function syncLandmarksCanvasSize(canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect();
  const cssW = Math.max(1, Math.floor(rect.width));
  const cssH = Math.max(1, Math.floor(rect.height));
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const w = Math.floor(cssW * dpr);
  const h = Math.floor(cssH * dpr);
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
  const ctx = canvas.getContext("2d");
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { cssW, cssH, ctx };
}

async function loadRecognizer(): Promise<GestureRecognizer> {
  const wasmPath = mediapipeAssetUrl(GESTURE_ASSET_PATHS.wasmDir);
  const modelPath = mediapipeAssetUrl(GESTURE_ASSET_PATHS.modelFile);
  const wasmRoot = wasmPath.replace(/\/$/, "");
  const vision = await FilesetResolver.forVisionTasks(wasmRoot);
  return GestureRecognizer.createFromOptions(vision, {
    baseOptions: { modelAssetPath: modelPath },
    runningMode: "VIDEO",
    numHands: gestureConfig.numHands,
  });
}

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

/**
 * Request a camera stream with constraint fallbacks and a short retry for
 * NotReadableError (common when StrictMode briefly double-opens the camera).
 */
async function requestCameraStream(): Promise<MediaStream> {
  const constraintSets: Array<MediaTrackConstraints | boolean> = [
    { ...gestureConfig.videoConstraints },
    { ...gestureConfig.videoConstraintsFallback },
    true,
  ];

  let lastError: unknown;

  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) {
      // Let the OS release the previous track after StrictMode cleanup.
      await delay(400 * attempt);
    }

    for (const video of constraintSets) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video,
        });
        return stream;
      } catch (err) {
        lastError = err;
        const name = err instanceof Error ? err.name : "";
        logGestureDev(
          "error",
          `getUserMedia attempt failed (${name})`,
          err,
        );
        if (
          name === "NotAllowedError" ||
          name === "PermissionDeniedError" ||
          name === "SecurityError"
        ) {
          throw err;
        }
        // Overconstrained / NotReadable / Abort → try next constraint or retry.
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Camera could not be started");
}

async function queryCameraPermission(): Promise<PermissionState | "unknown"> {
  try {
    if (!navigator.permissions?.query) return "unknown";
    const status = await navigator.permissions.query({
      name: "camera" as PermissionName,
    });
    return status.state;
  } catch {
    return "unknown";
  }
}

function logDebugSnapshot(extra: Record<string, unknown>) {
  if (!import.meta.env.DEV) return;
  console.info("[gesture-camera] debug", {
    secureContext: window.isSecureContext,
    visibilityState: document.visibilityState,
    hasMediaDevices: Boolean(navigator.mediaDevices),
    hasGetUserMedia: Boolean(navigator.mediaDevices?.getUserMedia),
    ...extra,
  });
}

export function useFistGesture(): UseFistGestureResult {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const landmarksCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const mountedRef = useRef(true);
  /** Local disposed flag for the current mount cycle (StrictMode-safe). */
  const disposedRef = useRef(false);

  const internal = useRef<InternalRefs>({
    stream: null,
    recognizer: null,
    video: null,
    landmarksCanvas: null,
    rafId: 0,
    lastInferTs: 0,
    lastVideoTime: -1,
    inferBusy: false,
    candidateBits: [],
    fistStable: false,
    noHandSince: null,
    smoothedCenter: null,
    initGen: 0,
    completed: false,
    completeTimer: null,
    waitTimer8: null,
    waitTimer20: null,
    lastPublishedPhase: null,
    lastPublishedStable: null,
    permissionWaitLevel: null,
  });

  const [pub, setPub] = useState<FistGesturePublicState>(initialPublic);

  const clearWaitTimers = useCallback(() => {
    const refs = internal.current;
    if (refs.waitTimer8 !== null) {
      window.clearTimeout(refs.waitTimer8);
      refs.waitTimer8 = null;
    }
    if (refs.waitTimer20 !== null) {
      window.clearTimeout(refs.waitTimer20);
      refs.waitTimer20 = null;
    }
  }, []);

  const publish = useCallback(
    (phase: GestureCameraPhase, patch?: Partial<FistGesturePublicState>) => {
      const refs = internal.current;
      const fistStable = patch?.fistStable ?? refs.fistStable;
      const wait =
        patch?.permissionWaitLevel !== undefined
          ? patch.permissionWaitLevel
          : refs.permissionWaitLevel;
      if (patch?.permissionWaitLevel !== undefined) {
        refs.permissionWaitLevel = patch.permissionWaitLevel;
      }
      const samePhase = refs.lastPublishedPhase === phase;
      const sameStable = refs.lastPublishedStable === fistStable;
      if (
        samePhase &&
        sameStable &&
        patch?.error === undefined &&
        patch?.needsTapToStart === undefined &&
        patch?.cameraEnabled === undefined &&
        patch?.permissionWaitLevel === undefined &&
        patch?.statusText === undefined
      ) {
        return;
      }
      refs.lastPublishedPhase = phase;
      refs.lastPublishedStable = fistStable;
      setPub((prev) => ({
        ...prev,
        phase,
        statusText:
          patch?.statusText ?? phaseStatus(phase, wait),
        fistStable,
        permissionWaitLevel: wait,
        ...patch,
      }));
    },
    [],
  );

  const paintLandmarks = useCallback(
    (landmarks: NormalizedLandmark[] | null, phase: GestureCameraPhase) => {
      const canvas =
        landmarksCanvasRef.current ?? internal.current.landmarksCanvas;
      if (!canvas) return;
      const { cssW, cssH, ctx } = syncLandmarksCanvasSize(canvas);
      if (!ctx) return;
      ctx.clearRect(0, 0, cssW, cssH);
      if (!landmarks?.length) return;
      drawHandLandmarks(
        ctx,
        landmarks,
        cssW,
        cssH,
        false,
        drawStateForPhase(phase),
      );
    },
    [],
  );

  const stopTracks = useCallback(() => {
    const refs = internal.current;
    clearWaitTimers();
    if (refs.rafId) {
      cancelAnimationFrame(refs.rafId);
      refs.rafId = 0;
    }
    if (refs.completeTimer !== null) {
      window.clearTimeout(refs.completeTimer);
      refs.completeTimer = null;
    }
    if (refs.recognizer) {
      try {
        refs.recognizer.close();
      } catch {
        /* ignore */
      }
      refs.recognizer = null;
    }
    if (refs.stream) {
      for (const track of refs.stream.getTracks()) track.stop();
      refs.stream = null;
    }
    if (refs.video) {
      try {
        refs.video.pause();
      } catch {
        /* ignore */
      }
      refs.video.srcObject = null;
    }
    const canvas = landmarksCanvasRef.current;
    if (canvas) clearLandmarksCanvas(canvas);
    refs.candidateBits = [];
    refs.fistStable = false;
    refs.noHandSince = null;
    refs.smoothedCenter = null;
    refs.lastInferTs = 0;
    refs.lastVideoTime = -1;
    refs.inferBusy = false;
    refs.completed = false;
    refs.permissionWaitLevel = null;
  }, [clearWaitTimers]);

  const isCurrentInit = useCallback((gen: number) => {
    return (
      mountedRef.current &&
      !disposedRef.current &&
      internal.current.initGen === gen
    );
  }, []);

  const fail = useCallback(
    (
      gen: number,
      kind: CameraErrorKind,
      message: string,
      phase: GestureCameraPhase,
    ) => {
      if (!isCurrentInit(gen)) return;
      stopTracks();
      publish(phase, {
        error: message,
        errorKind: kind,
        cameraEnabled: false,
        fistStable: false,
        needsTapToStart: false,
        permissionWaitLevel: null,
        statusText: message,
      });
    },
    [isCurrentInit, publish, stopTracks],
  );

  const disable = useCallback(() => {
    // Invalidate any in-flight enable
    internal.current.initGen += 1;
    stopTracks();
    disposedRef.current = false;
    publish("error", {
      error: gestureUiCopy.disabled,
      errorKind: "error",
      cameraEnabled: false,
      fistStable: false,
      needsTapToStart: false,
      permissionWaitLevel: null,
      statusText: gestureUiCopy.disabled,
    });
  }, [publish, stopTracks]);

  const completeAndStop = useCallback(() => {
    const refs = internal.current;
    if (!refs.stream || refs.completed) return;
    refs.completed = true;
    refs.fistStable = false;
    clearWaitTimers();
    publish("completed", {
      fistStable: false,
      cameraEnabled: true,
      needsTapToStart: false,
      permissionWaitLevel: null,
    });
    refs.completeTimer = window.setTimeout(() => {
      refs.completeTimer = null;
      if (!mountedRef.current) return;
      stopTracks();
      publish("idle", {
        cameraEnabled: false,
        fistStable: false,
        error: null,
        errorKind: null,
        needsTapToStart: false,
        permissionWaitLevel: null,
      });
    }, 650);
  }, [clearWaitTimers, publish, stopTracks]);

  const loop = useCallback(() => {
    const refs = internal.current;
    if (disposedRef.current || refs.completed || !mountedRef.current) return;

    const video = refs.video;
    const recognizer = refs.recognizer;
    const minInterval = 1000 / getInferenceFps();
    const now = performance.now();

    if (
      video &&
      recognizer &&
      video.readyState >= 2 &&
      !refs.inferBusy &&
      now - refs.lastInferTs >= minInterval &&
      video.currentTime !== refs.lastVideoTime
    ) {
      refs.lastInferTs = now;
      refs.lastVideoTime = video.currentTime;
      refs.inferBusy = true;

      let result;
      try {
        result = recognizer.recognizeForVideo(video, now);
      } catch {
        result = null;
      }
      refs.inferBusy = false;

      const gestures = result?.gestures?.[0] ?? [];
      const landmarks = result?.landmarks?.[0] ?? null;

      let closedScore = 0;
      let openScore = 0;
      for (const g of gestures) {
        if (g.categoryName === "Closed_Fist") {
          closedScore = Math.max(closedScore, g.score);
        }
        if (g.categoryName === "Open_Palm") {
          openScore = Math.max(openScore, g.score);
        }
      }

      const hasHand = Boolean(landmarks && landmarks.length > 0);
      const isClosedFist = closedScore >= getFistScoreMin();

      if (hasHand && landmarks) {
        const center = fistCenterFromLandmarks(landmarks);
        if (center) {
          if (!refs.smoothedCenter) refs.smoothedCenter = center;
          else {
            const a = gestureConfig.fistCenterLerp;
            refs.smoothedCenter = {
              x: refs.smoothedCenter.x + (center.x - refs.smoothedCenter.x) * a,
              y: refs.smoothedCenter.y + (center.y - refs.smoothedCenter.y) * a,
            };
          }
        }
        refs.noHandSince = null;
      } else if (refs.noHandSince === null) {
        refs.noHandSince = now;
      }

      refs.candidateBits.push(isClosedFist);
      if (refs.candidateBits.length > gestureConfig.windowSize) {
        refs.candidateBits.shift();
      }
      const hits = refs.candidateBits.filter(Boolean).length;
      const windowFull =
        refs.candidateBits.length >= gestureConfig.windowSize;
      const hitsRequired = getWindowHitsRequired();

      if (windowFull && hits >= hitsRequired) {
        refs.fistStable = true;
      } else if (
        !windowFull ? !isClosedFist : hits <= gestureConfig.windowReleaseMax
      ) {
        refs.fistStable = false;
      }

      const noHandLong =
        refs.noHandSince !== null &&
        now - refs.noHandSince >= gestureConfig.releaseLowMs;
      if (noHandLong || openScore >= gestureConfig.openPalmReleaseScore) {
        refs.fistStable = false;
        refs.candidateBits = [];
      }

      let nextPhase: GestureCameraPhase;
      if (!hasHand) nextPhase = "no-hand";
      else if (refs.fistStable) nextPhase = "active";
      else if (isClosedFist || hits > gestureConfig.windowReleaseMax) {
        nextPhase = "candidate";
      } else nextPhase = "hand-detected";

      paintLandmarks(hasHand ? landmarks : null, nextPhase);
      publish(nextPhase, {
        fistStable: refs.fistStable,
        cameraEnabled: true,
        fistCenterNorm: hasHand ? refs.smoothedCenter : null,
        error: null,
        errorKind: null,
      });
    }

    refs.rafId = requestAnimationFrame(loop);
  }, [paintLandmarks, publish]);

  const startInference = useCallback(() => {
    const refs = internal.current;
    if (disposedRef.current || refs.completed || !refs.recognizer || !refs.video) {
      return;
    }
    if (refs.rafId) cancelAnimationFrame(refs.rafId);
    refs.rafId = requestAnimationFrame(loop);
  }, [loop]);

  /**
   * Request camera + load model.
   * StrictMode-safe: each enable() uses a local generation; cleanup only
   * invalidates that generation and stops tracks — it does NOT permanently
   * block a subsequent mount from calling getUserMedia again.
   */
  const enable = useCallback(async () => {
    if (!mountedRef.current) return;

    // Stop any prior attempt for THIS hook instance, then start fresh.
    clearWaitTimers();
    if (internal.current.rafId) {
      cancelAnimationFrame(internal.current.rafId);
      internal.current.rafId = 0;
    }
    if (internal.current.stream) {
      for (const t of internal.current.stream.getTracks()) t.stop();
      internal.current.stream = null;
    }
    if (internal.current.recognizer) {
      try {
        internal.current.recognizer.close();
      } catch {
        /* ignore */
      }
      internal.current.recognizer = null;
    }
    if (internal.current.video) {
      internal.current.video.srcObject = null;
    }

    disposedRef.current = false;
    const gen = ++internal.current.initGen;
    internal.current.completed = false;
    internal.current.fistStable = false;
    internal.current.permissionWaitLevel = null;

    if (
      typeof window !== "undefined" &&
      !window.isSecureContext &&
      location.hostname !== "localhost" &&
      location.hostname !== "127.0.0.1"
    ) {
      fail(gen, "insecure", gestureUiCopy.insecure, "error");
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      fail(gen, "error", gestureUiCopy.genericError, "error");
      return;
    }

    const perm = await queryCameraPermission();
    logGestureDev("info", "permission query", perm);
    logDebugSnapshot({
      cameraPermission: perm,
      cameraStatus: "requesting",
      initGen: gen,
    });

    if (!isCurrentInit(gen)) return;

    if (perm === "denied") {
      fail(gen, "denied", gestureUiCopy.denied, "denied");
      return;
    }

    publish("requesting-permission", {
      error: null,
      errorKind: null,
      cameraEnabled: false,
      fistStable: false,
      needsTapToStart: false,
      permissionWaitLevel: null,
      statusText: gestureUiCopy.requestingBody,
    });

    logGestureDev("info", "requesting camera");

    // Soft wait UI — do not reject the pending getUserMedia promise.
    internal.current.waitTimer8 = window.setTimeout(() => {
      if (!isCurrentInit(gen)) return;
      if (internal.current.stream) return;
      internal.current.permissionWaitLevel = "still-waiting";
      publish("requesting-permission", {
        permissionWaitLevel: "still-waiting",
        statusText: gestureUiCopy.stillWaitingBody,
      });
    }, 8000);

    internal.current.waitTimer20 = window.setTimeout(() => {
      if (!isCurrentInit(gen)) return;
      if (internal.current.stream) return;
      internal.current.permissionWaitLevel = "timed-out";
      publish("requesting-permission", {
        permissionWaitLevel: "timed-out",
        statusText: gestureUiCopy.timedOutBody,
        error: gestureUiCopy.timedOutBody,
        errorKind: null,
      });
    }, 20000);

    // Camera first (parallel model load) — never block the permission prompt on MediaPipe.
    // Use fallbacks + delayed retry to survive StrictMode double-mount camera locks.
    const cameraPromise = requestCameraStream();
    const recognizerPromise = loadRecognizer();

    let stream: MediaStream;
    try {
      stream = await cameraPromise;
    } catch (err) {
      clearWaitTimers();
      void recognizerPromise
        .then((r) => {
          try {
            r.close();
          } catch {
            /* ignore */
          }
        })
        .catch(() => undefined);

      const mediaError = err as DOMException;
      logGestureDev(
        "error",
        "camera request failed",
        mediaError?.name,
        mediaError?.message,
        err,
      );

      if (!isCurrentInit(gen)) return;
      const classified = classifyCameraError(err);
      fail(
        gen,
        classified.kind,
        classified.message,
        classified.kind === "denied" ? "denied" : "error",
      );
      return;
    }

    clearWaitTimers();

    if (!isCurrentInit(gen)) {
      // StrictMode first mount discarded — stop tracks; remount will call enable again.
      for (const t of stream.getTracks()) t.stop();
      void recognizerPromise
        .then((r) => {
          try {
            r.close();
          } catch {
            /* ignore */
          }
        })
        .catch(() => undefined);
      logGestureDev("info", "camera granted but mount disposed — discarding");
      return;
    }

    logGestureDev("info", "camera granted");
    internal.current.stream = stream;

    let video = videoRef.current;
    for (let i = 0; i < 40 && !video; i++) {
      await new Promise((r) => setTimeout(r, 25));
      if (!isCurrentInit(gen)) {
        for (const t of stream.getTracks()) t.stop();
        internal.current.stream = null;
        return;
      }
      video = videoRef.current;
    }

    if (!video) {
      for (const t of stream.getTracks()) t.stop();
      internal.current.stream = null;
      void recognizerPromise
        .then((r) => {
          try {
            r.close();
          } catch {
            /* ignore */
          }
        })
        .catch(() => undefined);
      fail(gen, "error", gestureUiCopy.genericError, "error");
      return;
    }

    video.srcObject = stream;
    prepareCameraVideoElement(video);
    internal.current.video = video;
    internal.current.landmarksCanvas = landmarksCanvasRef.current;

    publish("loading-model", {
      cameraEnabled: true,
      error: null,
      errorKind: null,
      permissionWaitLevel: null,
      needsTapToStart: false,
    });

    await new Promise<void>((resolve) => {
      if (video!.readyState >= 1) {
        resolve();
        return;
      }
      const onMeta = () => {
        video!.removeEventListener("loadedmetadata", onMeta);
        resolve();
      };
      video!.addEventListener("loadedmetadata", onMeta);
      window.setTimeout(resolve, 2000);
    });

    if (!isCurrentInit(gen)) return;

    let playOk = false;
    try {
      await video.play();
      playOk = true;
    } catch {
      playOk = false;
    }

    let recognizer: GestureRecognizer;
    try {
      recognizer = await recognizerPromise;
    } catch (err) {
      logGestureDev("error", "model load failed", err);
      fail(gen, "model", gestureUiCopy.modelError, "error");
      return;
    }

    if (!isCurrentInit(gen)) {
      try {
        recognizer.close();
      } catch {
        /* ignore */
      }
      stopTracks();
      return;
    }

    internal.current.recognizer = recognizer;

    logDebugSnapshot({
      cameraStatus: playOk ? "ready" : "needs-tap",
      videoReadyState: video.readyState,
      trackReadyState: stream.getVideoTracks()[0]?.readyState,
      recognizerLoaded: true,
    });

    if (!playOk) {
      publish("needs-tap", {
        cameraEnabled: true,
        needsTapToStart: true,
        fistStable: false,
        error: null,
        errorKind: null,
        permissionWaitLevel: null,
      });
      return;
    }

    publish("ready", {
      cameraEnabled: true,
      needsTapToStart: false,
      fistStable: false,
      error: null,
      errorKind: null,
      permissionWaitLevel: null,
    });
    startInference();
  }, [
    clearWaitTimers,
    fail,
    isCurrentInit,
    publish,
    startInference,
    stopTracks,
  ]);

  const checkPermission = useCallback(async () => {
    const perm = await queryCameraPermission();
    logGestureDev("info", "check permission", perm);
    if (perm === "denied") {
      const gen = internal.current.initGen;
      fail(gen, "denied", gestureUiCopy.denied, "denied");
      return;
    }
    if (perm === "granted") {
      // Permission already allowed — retry getUserMedia immediately.
      await enable();
      return;
    }
    // Still prompt / unknown — nudge UI and leave pending request alone,
    // or restart if timed out.
    if (internal.current.permissionWaitLevel === "timed-out") {
      await enable();
    } else {
      publish("requesting-permission", {
        permissionWaitLevel: "still-waiting",
        statusText: gestureUiCopy.stillWaitingBody,
      });
    }
  }, [enable, fail, publish]);

  const resumePlayback = useCallback(async () => {
    const refs = internal.current;
    const video = videoRef.current ?? refs.video;

    // No stream yet (typical mobile: waiting for a user tap) → full enable.
    if (!refs.stream || !refs.recognizer) {
      await enable();
      return;
    }
    if (!video) return;

    prepareCameraVideoElement(video);
    try {
      await video.play();
      publish("ready", {
        needsTapToStart: false,
        cameraEnabled: true,
        error: null,
        errorKind: null,
      });
      startInference();
    } catch {
      publish("needs-tap", {
        needsTapToStart: true,
        cameraEnabled: true,
      });
    }
  }, [enable, publish, startInference]);

  useEffect(() => {
    mountedRef.current = true;
    disposedRef.current = false;
    const refs = internal.current;
    return () => {
      // Invalidate in-flight enable for this mount only.
      disposedRef.current = true;
      mountedRef.current = false;
      refs.initGen += 1;
      stopTracks();
    };
  }, [stopTracks]);

  return {
    ...pub,
    videoRef,
    landmarksCanvasRef,
    enable,
    disable,
    resumePlayback,
    completeAndStop,
    checkPermission,
  };
}
