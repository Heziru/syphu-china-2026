import { orbitPoint, CAMPUS_ORBIT, CAMPUS_ANGLE } from "./orbitLayout";
export const PLANET_RADIUS = 8;
export const SITE_SEPARATION = Math.PI;
export const smooth = (a: number, b: number, p: number) => {
  const t = Math.max(0, Math.min(1, (p - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Explicit holds separate inspecting a building from rotating to the next one. */
export function journeyPose(p: number, aspect: number, angle = CAMPUS_ANGLE) {
  const narrow = aspect < 1;
  const arrive = smooth(0.08, 0.29, p);
  const firstClose = smooth(0.31, 0.39, p) * (1 - smooth(0.46, 0.53, p));
  const secondClose = smooth(0.71, 0.79, p) * (1 - smooth(0.85, 0.9, p));
  const rotation =
    -0.65 * (1 - arrive) + SITE_SEPARATION * smooth(0.54, 0.7, p);
  const origin = orbitPoint(CAMPUS_ORBIT, angle, aspect);
  const initialScale = (narrow ? 0.34 : 0.56) / PLANET_RADIUS;
  const baseScale = narrow ? 0.45 : 0.83;
  const closeScale = Math.min(narrow ? 0.65 : 1.4, (aspect * 9) / 7.2);
  const magnification = Math.max(firstClose, secondClose);
  const scale =
    initialScale +
    (baseScale - initialScale) * arrive +
    (closeScale - baseScale) * magnification;
  const enterLab = smooth(0.91, 0.985, p);
  const finalScale = scale * (1 + enterLab * 0.8);
  const pitch = magnification * 0.18;
  // Keep the local horizon in frame as the planet grows, not the centre of the globe.
  const horizon = -0.65 - magnification * 0.8;
  const y =
    origin[1] * (1 - arrive) +
    arrive * (horizon - PLANET_RADIUS * finalScale * Math.cos(pitch)) -
    enterLab * 1.8;
  return {
    scale: finalScale,
    y,
    x: origin[0] * (1 - arrive),
    rotation,
    pitch,
    libraryVisible: p < 0.62,
    researchVisible: p > 0.62,
    firstClose,
    secondClose,
    enterLab,
  };
}

export function spherePoint(x: number, y: number, z: number) {
  const r = PLANET_RADIUS + y;
  return [
    Math.sin(x / PLANET_RADIUS) * Math.cos(z / PLANET_RADIUS) * r,
    Math.cos(x / PLANET_RADIUS) * Math.cos(z / PLANET_RADIUS) * r -
      PLANET_RADIUS,
    Math.sin(z / PLANET_RADIUS) * r,
  ] as [number, number, number];
}
