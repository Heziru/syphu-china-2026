import { HOME_ASSETS, LOGO_CROP_RATIO } from "../homeAssets";

let cached: HTMLImageElement | null = null;
let inflight: Promise<HTMLImageElement | null> | null = null;

/** Load the official project logo (transparent AVIF). Failures resolve to null. */
export function loadProjectSymbol(): Promise<HTMLImageElement | null> {
  if (cached?.complete && cached.naturalWidth > 0) {
    return Promise.resolve(cached);
  }
  if (inflight) return inflight;

  inflight = new Promise((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      cached = img;
      resolve(img);
    };
    img.onerror = () => {
      inflight = null;
      resolve(null);
    };
    img.src = HOME_ASSETS.projectLogo;
  });

  return inflight;
}

export function getCachedProjectSymbol(): HTMLImageElement | null {
  return cached?.complete && cached.naturalWidth > 0 ? cached : null;
}

export function symbolSourceHeight(img: HTMLImageElement): number {
  return img.naturalHeight * LOGO_CROP_RATIO;
}

/** Draw only the circular symbol (top crop), preserving transparency. */
export function drawCroppedSymbol(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  dx: number,
  dy: number,
  dw: number,
  dh: number,
  alpha = 1,
): void {
  const sh = symbolSourceHeight(img);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.drawImage(
    img,
    0,
    0,
    img.naturalWidth,
    sh,
    dx,
    dy,
    dw,
    dh,
  );
  ctx.restore();
}
