/** Signed shortest distance on the loop. Complete revolutions repeat the same papers. */
export function galleryOffset(index: number, position: number, count: number) {
  return (
    ((((index - position + count / 2) % count) + count) % count) - count / 2
  );
}

export function nearestGalleryPosition(
  index: number,
  position: number,
  count: number,
) {
  return position + galleryOffset(index, position, count);
}

/** A closed, vertically undulating ellipse, viewed from its moving tangent.
 * Cards travel in depth rather than translating across a flat carousel.
 * Exponential easing controls motion only; this is not a scientific data curve.
 */
export function galleryCurvePose(
  offset: number,
  position: number,
  count: number,
  width: number,
) {
  const phase = (position / count) * Math.PI * 2;
  const theta = (offset / count) * Math.PI * 2;
  const rx = Math.max(350, Math.min(width * 0.61, 920));
  const rz = Math.max(920, Math.min(width * 0.98, 1500));
  const height = width < 600 ? 45 : 105;
  const tangentLength = Math.hypot(rx * Math.cos(phase), rz * Math.sin(phase));
  const tx = (rx * Math.cos(phase)) / tangentLength;
  const tz = (-rz * Math.sin(phase)) / tangentLength;
  const dx = rx * (Math.sin(phase + theta) - Math.sin(phase));
  const dz = rz * (Math.cos(phase + theta) - Math.cos(phase));
  const x = dx * tx + dz * tz;
  // The ellipse is convex; its other points lie behind this tangent plane.
  const z = dx * -tz + dz * tx;
  const slope = (2 * height * Math.cos(phase * 2)) / tangentLength;
  const y =
    height * (Math.sin(2 * (phase + theta)) - Math.sin(phase * 2)) -
    x * slope * 0.62;
  const focus = Math.exp(-offset * offset * 2.4);
  return {
    x,
    y,
    z,
    rotateY: -theta * 18,
    rotateZ: Math.sin(theta) * -3.5,
    scale: 0.76 + 0.24 * focus,
    fog: Math.min(0.65, Math.abs(offset) * 0.17),
    visible: Math.abs(offset) < 3.25,
  };
}
