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
