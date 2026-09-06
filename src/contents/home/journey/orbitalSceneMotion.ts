import { orbitAngle, orbitPoint } from "./orbitLayout";
import { smooth } from "./storyTimeline";
export const campusDeparture = (p: number) => smooth(0.08, 0.13, p);

export const SOLAR_PLANETS = [
  {
    orbit: 0.44,
    angle: 3.25,
    radius: 0.22,
    color: "#82bac7",
    band: "#badbd7",
    ring: false,
  },
  {
    orbit: 0.66,
    angle: 4.08,
    radius: 0.42,
    color: "#c1b4cf",
    band: "#e7d4d5",
    ring: false,
  },
  {
    orbit: 1,
    angle: 5.42,
    radius: 0.53,
    color: "#aaa8c6",
    band: "#dcd0d7",
    ring: true,
  },
  {
    orbit: 1,
    angle: 2.94,
    radius: 0.29,
    color: "#93c6be",
    band: "#c6ddcb",
    ring: false,
  },
  {
    orbit: 0.84,
    angle: 1.44,
    radius: 0.2,
    color: "#baacd2",
    band: "#dcd0e6",
    ring: false,
  },
];
export function solarPose(p: number) {
  const leave = smooth(0.08, 0.13, p);
  return {
    x: -leave * 11,
    y: leave * 2,
    scale: 1 + leave * 0.55,
    visible: p < 0.13,
  };
}
export function earthPose(p: number, time: number, aspect: number) {
  const arrive = smooth(0.093, 0.14, p),
    leave = smooth(0.225, 0.275, p);
  const origin = orbitPoint(0.66, orbitAngle(2.3, time, p), aspect);
  const travel = smooth(0.078, 0.098, p);
  const departure = orbitPoint(0.66, 2.3 - travel * 1.55, aspect);
  const start = p < 0.078 ? origin : departure;
  const initial = aspect < 1 ? 0.16 : 0.23;
  return {
    x: start[0] * (1 - arrive) + (aspect < 1 ? 0 : 2.65) * arrive,
    y:
      start[1] * (1 - arrive) +
      (aspect < 1 ? -0.05 : -0.15) * arrive -
      leave * 8,
    scale:
      (initial + (Math.min(1.25, aspect * 1.5) - initial) * arrive) *
      (1 - leave * 0.65),
    visible: p < 0.27,
  };
}
