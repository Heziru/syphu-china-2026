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
  reducedMotion: boolean;
  hidden: boolean;
};

/**
 * Bottom-left camera PiP — always visible during hero interaction.
 * No Enable button; Home auto-requests permission on mount.
 */
export function FistGestureControls({
  fist,
  assemblyProgress,
  onRetry,
  onCheckPermission,
  onDisable,
  onTapToStart,
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
  const showLive =
    fist.cameraEnabled &&
    !isError &&
    fist.phase !== "requesting-permission";

  const progress = Math.min(1, Math.max(0, assemblyProgress));
  const stillWaiting = fist.permissionWaitLevel === "still-waiting";
  const timedOut = fist.permissionWaitLevel === "timed-out";

  let frameTitle: string = gestureUiCopy.requestingTitle;
  let frameBody: string = gestureUiCopy.requestingBody;
  if (isLoading) {
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

  const showRetry =
    isError || timedOut;
  const showCheckPermission =
    isRequesting && (stillWaiting || timedOut);

  return (
    <div
      className={`gesture-dock${fadingOut ? " gesture-dock--fade" : ""}`}
    >
      <div
        className={`gesture-preview${isError || timedOut ? " gesture-preview--error" : ""}${isRequesting || isLoading ? " gesture-preview--placeholder" : ""}`}
        style={
          {
            "--gesture-progress": String(progress),
          } as CSSProperties
        }
        aria-label={gestureUiCopy.previewAria}
      >
        <div
          className={
            showLive ? "gesture-preview__mirror" : "home-sr-only"
          }
          aria-hidden={!showLive}
        >
          <video
            ref={fist.videoRef}
            className="gesture-preview__video"
            playsInline
            muted
            autoPlay
          />
          <canvas
            ref={fist.landmarksCanvasRef}
            className="gesture-landmarks"
            aria-hidden="true"
          />
        </div>

        {!showLive && (
          <div className="gesture-preview__placeholder">
            <span className="gesture-preview__eyebrow">{frameTitle}</span>
            <span className="gesture-preview__body">{frameBody}</span>
            {(isRequesting || isLoading) && !timedOut && (
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

        {fist.needsTapToStart && (
          <button
            type="button"
            className="gesture-tap-start"
            onClick={onTapToStart}
            aria-label={gestureUiCopy.tapToStartAria}
          >
            {gestureUiCopy.tapToStart}
          </button>
        )}

        {!isError &&
          !timedOut &&
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
