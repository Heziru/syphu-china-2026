import type { CSSProperties, RefObject } from "react";
import { gestureUiCopy } from "./gesture/gestureConfig";
import type { FistGesturePublicState } from "./gesture/gestureTypes";

type FistApi = FistGesturePublicState & {
  videoRef: RefObject<HTMLVideoElement | null>;
  landmarksCanvasRef: RefObject<HTMLCanvasElement | null>;
};

type Props = {
  fist: FistApi;
  assemblyProgress: number;
  onRetry: () => void;
  onCheckPermission: () => void;
  onDisable: () => void;
  onTapToStart: () => void;
  /** Phones / iOS: show a tap CTA instead of auto-requesting the camera. */
  requireTapToEnable?: boolean;
  reducedMotion: boolean;
  hidden: boolean;
};

/**
 * Bottom-left camera PiP.
 * Desktop auto-requests; mobile waits for an explicit tap (browser policy).
 */
export function FistGestureControls({
  fist,
  assemblyProgress,
  onRetry,
  onCheckPermission,
  onDisable,
  onTapToStart,
  requireTapToEnable = false,
  reducedMotion,
  hidden,
}: Props) {
  if (reducedMotion || hidden) return null;

  const isError =
    fist.phase === "denied" ||
    fist.phase === "error" ||
    (Boolean(fist.error) && fist.permissionWaitLevel !== "timed-out");
  const isRequesting = fist.phase === "requesting-permission";
  const isLoading = fist.phase === "loading-model";
  const fadingOut = fist.phase === "completed";
  const awaitingTap =
    requireTapToEnable &&
    !fist.cameraEnabled &&
    !isError &&
    (fist.phase === "idle" || fist.needsTapToStart);
  const showLive =
    fist.cameraEnabled &&
    !isError &&
    fist.phase !== "requesting-permission" &&
    !fist.needsTapToStart;

  const progress = Math.min(1, Math.max(0, assemblyProgress));
  const stillWaiting = fist.permissionWaitLevel === "still-waiting";
  const timedOut = fist.permissionWaitLevel === "timed-out";

  let frameTitle: string = gestureUiCopy.requestingTitle;
  let frameBody: string = gestureUiCopy.requestingBody;
  if (awaitingTap) {
    frameTitle = "CAMERA";
    frameBody = gestureUiCopy.tapHint;
  } else if (isLoading) {
    frameTitle = gestureUiCopy.loadingTitle;
    frameBody = gestureUiCopy.loadingBody;
  } else if (isError) {
    frameTitle = "CAMERA";
    frameBody = fist.error ?? gestureUiCopy.genericError;
  } else if (isRequesting && timedOut) {
    frameTitle = gestureUiCopy.requestingTitle;
    frameBody = gestureUiCopy.timedOutBody;
  } else if (isRequesting && stillWaiting) {
    frameTitle = gestureUiCopy.requestingTitle;
    frameBody = gestureUiCopy.stillWaitingBody;
  } else if (showLive) {
    frameTitle = "";
    frameBody =
      fist.phase === "completed"
        ? gestureUiCopy.completed
        : fist.statusText;
  }

  const showRetry = isError || timedOut;
  const showCheckPermission =
    isRequesting && (stillWaiting || timedOut);
  const showTapCta = awaitingTap || fist.needsTapToStart;

  return (
    <div
      className={`gesture-dock${fadingOut ? " gesture-dock--fade" : ""}`}
    >
      <div
        className={`gesture-preview${isError || timedOut ? " gesture-preview--error" : ""}${isRequesting || isLoading || awaitingTap ? " gesture-preview--placeholder" : ""}`}
        style={
          {
            "--gesture-progress": String(progress),
          } as CSSProperties
        }
        aria-label={gestureUiCopy.previewAria}
      >
        <div className="gesture-preview__mirror">
          <video
            ref={fist.videoRef}
            className="gesture-preview__video"
            playsInline
            muted
            autoPlay
          />
        </div>
        {/* Keep canvas outside CSS mirror — iOS often blanks canvas under transform. */}
        <canvas
          ref={fist.landmarksCanvasRef}
          className="gesture-landmarks"
          aria-hidden="true"
        />

        {!showLive && (
          <div className="gesture-preview__placeholder">
            <span className="gesture-preview__eyebrow">{frameTitle}</span>
            <span className="gesture-preview__body">{frameBody}</span>
            {(isRequesting || isLoading) && !timedOut && !awaitingTap && (
              <span className="gesture-preview__privacy">
                {gestureUiCopy.privacy}
              </span>
            )}
            {(isError || timedOut) && (
              <span className="gesture-preview__unavailable">
                {fist.errorKind === "not-readable"
                  ? gestureUiCopy.notReadableHint
                  : gestureUiCopy.unavailable}
              </span>
            )}
            {showCheckPermission && (
              <button
                type="button"
                className="gesture-retry"
                onClick={onCheckPermission}
                aria-label={gestureUiCopy.checkPermissionAria}
              >
                {gestureUiCopy.checkPermission}
              </button>
            )}
            {showRetry && (
              <button
                type="button"
                className="gesture-retry"
                onClick={onRetry}
                aria-label={gestureUiCopy.retryAria}
              >
                {gestureUiCopy.retry}
              </button>
            )}
          </div>
        )}

        {showLive && (
          <div className="gesture-preview-status" aria-live="polite">
            {frameBody}
          </div>
        )}

        {showLive && (
          <div className="gesture-preview__progress" aria-hidden="true" />
        )}

        {showTapCta && (
          <button
            type="button"
            className="gesture-tap-start"
            onClick={onTapToStart}
            aria-label={
              awaitingTap
                ? gestureUiCopy.tapToEnableAria
                : gestureUiCopy.tapToStartAria
            }
          >
            {awaitingTap
              ? gestureUiCopy.tapToEnable
              : gestureUiCopy.tapToStart}
          </button>
        )}

        {!isError &&
          !timedOut &&
          !awaitingTap &&
          fist.phase !== "requesting-permission" && (
            <button
              type="button"
              className="gesture-close"
              onClick={onDisable}
              aria-label={gestureUiCopy.disableAria}
            >
              ×
            </button>
          )}
      </div>
    </div>
  );
}
