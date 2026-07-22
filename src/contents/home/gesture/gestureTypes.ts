export type GestureCameraPhase =
  | "idle"
  | "requesting-permission"
  | "loading-model"
  | "ready"
  | "hand-detected"
  | "candidate"
  | "active"
  | "no-hand"
  | "completed"
  | "denied"
  | "error"
  | "needs-tap";

export type CameraErrorKind =
  | "denied"
  | "not-found"
  | "not-readable"
  | "insecure"
  | "model"
  | "error"
  | null;

/** Soft wait hints while getUserMedia is still pending. */
export type PermissionWaitLevel = null | "still-waiting" | "timed-out";

export type InteractionPoint = { x: number; y: number };

export type FistGesturePublicState = {
  phase: GestureCameraPhase;
  statusText: string;
  error: string | null;
  errorKind: CameraErrorKind;
  /** Stable Closed_Fist — the sole assembly driver. */
  fistStable: boolean;
  cameraEnabled: boolean;
  needsTapToStart: boolean;
  permissionWaitLevel: PermissionWaitLevel;
  fistCenterNorm: InteractionPoint | null;
};
