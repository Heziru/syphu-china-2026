export const NARRATIVE = [
  {
    at: 0,
    id: "origins",
    title: "A world in motion.",
    lines: [
      "Life moves in rhythm.",
      "Always in conversation with its environment.",
    ],
  },
  {
    at: 0.13,
    id: "world",
    title: "One world.\nMany lives.",
    lines: ["Inflammatory bowel disease", "reaches across borders."],
  },
  {
    at: 0.245,
    id: "person",
    title: "A day,\ninterrupted.",
    lines: [
      "A meal. A journey. A night’s sleep.",
      "IBD can change the ordinary.",
    ],
  },
  {
    at: 0.32,
    id: "anatomy",
    title: "Look within.",
    lines: ["From the whole digestive system", "to one local environment."],
  },
  {
    at: 0.43,
    id: "mucosa",
    title: "A living\nbarrier.",
    lines: ["A living barrier.", "A changing environment."],
  },
  {
    at: 0.535,
    id: "cell",
    title: "Life, with\nconditions.",
    lines: [
      "One engineered bacterium.",
      "A response shaped by its surroundings.",
    ],
  },
  {
    at: 0.625,
    id: "payload",
    title: "Made within.\nReleased\nover time.",
    lines: [
      "Elafin production is continuous.",
      "Availability follows the state of the cell.",
    ],
  },
  {
    at: 0.71,
    id: "exit",
    title: "A gradual\nexit.",
    lines: ["The signal changes first.", "Protection responds over time."],
  },
  {
    at: 0.79,
    id: "campus",
    title: "Questions\nfind a home.",
    lines: ["Shenyang Pharmaceutical University", "South Campus"],
  },
  {
    at: 0.855,
    id: "library",
    title: "Where ideas\nbegin.",
    lines: ["Every question", "has a place to begin."],
  },
  {
    at: 0.919,
    id: "research",
    title: "Ideas meet\nevidence.",
    lines: ["Observe. Test. Learn.", "Then ask again."],
  },
  {
    at: 0.973,
    id: "laboratory",
    title: "Step inside.",
    lines: ["Explore the work behind the idea."],
  },
] as const;
export function stageAt(p: number) {
  return NARRATIVE.reduce((n, s, i) => (p >= s.at ? i : n), 0);
}
export const clamp = (n: number) => Math.max(0, Math.min(1, n));
export const smooth = (a: number, b: number, p: number) => {
  const t = clamp((p - a) / (b - a));
  return t * t * (3 - 2 * t);
};
export const sciencePhase = (p: number) =>
  p < 0.43 ? 0 : p < 0.535 ? 1 : p < 0.625 ? 2 : p < 0.71 ? 3 : 4;

// Insert reading time without changing any of the calibrated globe, anatomy or
// campus camera intervals. Both scroll and chapter navigation use this mapping.
export const BRIDGE_AT = 0.32;
export const BRIDGE_LENGTH = 0.3;
export const DELIVERY_LENGTH = 0.2;
const READING_LENGTH = BRIDGE_LENGTH + DELIVERY_LENGTH;
export function journeyPosition(scroll: number) {
  const elapsed = clamp(scroll) * (1 + READING_LENGTH);
  const inBridge = elapsed >= BRIDGE_AT && elapsed < BRIDGE_AT + BRIDGE_LENGTH;
  const inDelivery =
    elapsed >= BRIDGE_AT + BRIDGE_LENGTH &&
    elapsed < BRIDGE_AT + READING_LENGTH;
  return {
    progress:
      inBridge || inDelivery
        ? BRIDGE_AT
        : elapsed < BRIDGE_AT
          ? elapsed
          : Math.min(1, elapsed - READING_LENGTH),
    bridge: inBridge ? (elapsed - BRIDGE_AT) / BRIDGE_LENGTH : null,
    delivery: inDelivery
      ? (elapsed - BRIDGE_AT - BRIDGE_LENGTH) / DELIVERY_LENGTH
      : null,
  };
}
export function storyScrollPosition(progress: number) {
  return (
    (progress + (progress >= BRIDGE_AT ? READING_LENGTH : 0)) /
    (1 + READING_LENGTH)
  );
}
export function bridgeScrollPosition(progress = 0.1) {
  return (BRIDGE_AT + clamp(progress) * BRIDGE_LENGTH) / (1 + READING_LENGTH);
}
export function deliveryScrollPosition(progress = 0) {
  return (
    (BRIDGE_AT + BRIDGE_LENGTH + clamp(progress) * DELIVERY_LENGTH) /
    (1 + READING_LENGTH)
  );
}
