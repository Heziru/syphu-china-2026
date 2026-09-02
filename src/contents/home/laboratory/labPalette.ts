export const LAB_COLORS = {
  wall: "#E8E4DA",
  bench: "#C5D9D2",
  teal: "#4E827B",
  dark: "#283C40",
  coral: "#D88B72",
  floor: "#D7D1C4",
  window: "#F4F1EA",
  screen: "#2F4A4E",
  book: "#8AA39C",
} as const;

export function isWebGLAvailable() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}
