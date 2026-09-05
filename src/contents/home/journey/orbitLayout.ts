/** All orbital curves and planet centres use exactly the same projected ellipse. */
export const ORBITS = [0.44, 0.66, 0.84, 1] as const;
export const CAMPUS_ORBIT = 0.84;
export const CAMPUS_ANGLE = 0.58;
export function orbitPoint(radius: number, angle: number, aspect: number) {
  const narrow = aspect < 1;
  const rx = narrow ? aspect * 3.65 : Math.min(7.45, aspect * 3.6);
  const ry = narrow ? 3.15 : 2.5;
  const tilt = narrow ? -0.1 : 0.17;
  const x = radius * rx * Math.cos(angle);
  const y = radius * ry * Math.sin(angle);
  return [
    x * Math.cos(tilt) - y * Math.sin(tilt),
    y * Math.cos(tilt) + x * Math.sin(tilt) + 0.15,
    0,
  ] as [number, number, number];
}
export function orbitAngle(angle: number, time: number, progress: number) {
  // As soon as the camera departs, orbital movement eases to a fixed departure point.
  return angle + Math.sin(time * 0.1) * 0.06 * Math.max(0, 1 - progress / 0.08);
}
