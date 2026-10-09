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
    lines: ["At the intestinal wall,", "local conditions shape the response."],
  },
  {
    at: 0.535,
    id: "cell",
    title: "Life, with\nconditions.",
    lines: [
      "In our design, ROS-responsive PspA expression",
      "supports survival under local stress.",
    ],
  },
  {
    at: 0.625,
    id: "payload",
    title: "Made within.\nReleased\nover time.",
    lines: [
      "Elafin is expressed constitutively.",
      "Its production is separate from ROS sensing.",
    ],
  },
  {
    at: 0.71,
    id: "exit",
    title: "A gradual\nexit.",
    lines: [
      "As the signal falls, protection is expected to decline.",
      "Clearance and escape still need testing.",
    ],
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
export const worldYearMix = (p: number) => smooth(0.178, 0.204, p);

// Preserve the calibrated scene cameras, inserting reading chapters. The route
// ends at the colon, so resume at its section rather than replaying whole anatomy.
export const BRIDGE_AT = 0.32;
export const BRIDGE_LENGTH = 0.49;
export const DELIVERY_LENGTH = 0.29;
export const WALL_AT = 0.436;
export const PRODUCT_AT = 0.785;
export const PRODUCT_LENGTH = 0.18;
const SKIPPED = WALL_AT - BRIDGE_AT;
const ROUTE_END = BRIDGE_AT + BRIDGE_LENGTH + DELIVERY_LENGTH;
const PRODUCT_START = ROUTE_END + PRODUCT_AT - WALL_AT;
const RESEARCH_OFFSET =
  BRIDGE_LENGTH + DELIVERY_LENGTH + PRODUCT_LENGTH - SKIPPED;

// Add scroll distance to reading holds without moving calibrated scene cameras.
// Holds use the elapsed timeline, including chapters inserted before a scene.
const READING_HOLDS = [
  { start: 0.13, end: 0.245, extra: 0.14 },
  { start: 0.284, end: 0.308, extra: 0.11 },
  // Give the colon and its surface time to read after the organ route.
  { start: ROUTE_END + 0.443 - WALL_AT, end: ROUTE_END + 0.46 - WALL_AT, extra: 0.08 },
  { start: ROUTE_END + 0.482 - WALL_AT, end: ROUTE_END + 0.526 - WALL_AT, extra: 0.08 },
  { start: ROUTE_END + 0.555 - WALL_AT, end: ROUTE_END + 0.615 - WALL_AT, extra: 0.06 },
  { start: 0.925 + RESEARCH_OFFSET, end: 0.965 + RESEARCH_OFFSET, extra: 0.2 },
];
const HOLD_EXTRA = READING_HOLDS.reduce((total, hold) => total + hold.extra, 0);
function expandHolds(elapsed: number) {
  return READING_HOLDS.reduce(
    (value, { start, end, extra }) =>
      value + clamp((elapsed - start) / (end - start)) * extra,
    elapsed,
  );
}
function contractHolds(stretched: number) {
  let offset = 0;
  for (const { start, end, extra } of READING_HOLDS) {
    if (stretched <= start + offset) return stretched - offset;
    const duration = end - start;
    if (stretched < end + offset + extra)
      return (
        start + ((stretched - start - offset) * duration) / (duration + extra)
      );
    offset += extra;
  }
  return stretched - offset;
}

const TOTAL =
  1 - SKIPPED + BRIDGE_LENGTH + DELIVERY_LENGTH + PRODUCT_LENGTH + HOLD_EXTRA;
// Preserve each chapter's pixel distance as reading holds are added.
export const STORY_SCROLL_HEIGHT = 100 + TOTAL * 1000;
export function journeyPosition(scroll: number) {
  const stretched = clamp(scroll) * TOTAL;
  const elapsed = contractHolds(stretched);
  const inBridge = elapsed >= BRIDGE_AT && elapsed < BRIDGE_AT + BRIDGE_LENGTH;
  const inDelivery =
    elapsed >= BRIDGE_AT + BRIDGE_LENGTH && elapsed < ROUTE_END;
  const inProduct =
    elapsed >= PRODUCT_START && elapsed < PRODUCT_START + PRODUCT_LENGTH;
  return {
    progress:
      inBridge || inDelivery
        ? BRIDGE_AT
        : inProduct
          ? PRODUCT_AT
          : elapsed < BRIDGE_AT
            ? elapsed
            : clamp(
                elapsed -
                  BRIDGE_LENGTH -
                  DELIVERY_LENGTH +
                  SKIPPED -
                  (elapsed >= PRODUCT_START ? PRODUCT_LENGTH : 0),
              ),
    bridge: inBridge ? (elapsed - BRIDGE_AT) / BRIDGE_LENGTH : null,
    delivery: inDelivery
      ? (elapsed - BRIDGE_AT - BRIDGE_LENGTH) / DELIVERY_LENGTH
      : null,
    product: inProduct ? (elapsed - PRODUCT_START) / PRODUCT_LENGTH : null,
  };
}
export function storyScrollPosition(progress: number) {
  const p = clamp(progress);
  if (p < BRIDGE_AT) return expandHolds(p) / TOTAL;
  return (
    expandHolds(
      Math.max(p, WALL_AT) -
        SKIPPED +
        BRIDGE_LENGTH +
        DELIVERY_LENGTH +
        (p >= PRODUCT_AT ? PRODUCT_LENGTH : 0),
    ) / TOTAL
  );
}
export function bridgeScrollPosition(progress = 0.1) {
  return expandHolds(BRIDGE_AT + clamp(progress) * BRIDGE_LENGTH) / TOTAL;
}
export function deliveryScrollPosition(progress = 0) {
  return (
    expandHolds(BRIDGE_AT + BRIDGE_LENGTH + clamp(progress) * DELIVERY_LENGTH) /
    TOTAL
  );
}
export function productScrollPosition(progress = 0) {
  return expandHolds(PRODUCT_START + clamp(progress) * PRODUCT_LENGTH) / TOTAL;
}
