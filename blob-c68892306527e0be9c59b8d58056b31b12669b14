/**
 * Mobile / iOS browsers usually block getUserMedia + video.play()
 * unless started from a direct user tap. Desktop can auto-request.
 */
export function prefersTapToStartCamera(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false;
  }

  const ua = navigator.userAgent || "";
  const isiOS =
    /iPad|iPhone|iPod/i.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (isiOS) return true;

  const coarse =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(pointer: coarse)").matches;
  const touchPoints = navigator.maxTouchPoints > 0;
  const isAndroid = /Android/i.test(ua);

  return Boolean(coarse || (isAndroid && touchPoints));
}

export function prepareCameraVideoElement(video: HTMLVideoElement) {
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.setAttribute("playsinline", "true");
  video.setAttribute("webkit-playsinline", "true");
  video.setAttribute("muted", "true");
  // Helps some Android WebViews keep the track alive.
  video.setAttribute("autoplay", "true");
}
