export const LAB_COLORS = {
  wall: "#E8E4DA",
  bench: "#C5D9D2",
  cabinet: "#9CBBB4",
  shell: "#F2EDE4",
  teal: "#4E827B",
  dark: "#3A474A",
  structure: "#5B676B",
  metal: "#8E989C",
  coral: "#D88B72",
  floor: "#D7D1C4",
  window: "#F4F1EA",
  screen: "#3B5559",
  book: "#8AA39C",
  glass: "#D9E7EA",
  paper: "#F7F1E4",
} as const;

export function isWebGLAvailable() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}
