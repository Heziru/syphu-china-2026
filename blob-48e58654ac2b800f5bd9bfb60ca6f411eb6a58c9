export const LAB_COLORS = {
  wall: "#DCD0BC",
  bench: "#B6B9A3",
  cabinet: "#899983",
  cabinetLight: "#96A38C",
  shell: "#EDE6D7",
  teal: "#56796E",
  dark: "#414943",
  structure: "#5D675B",
  metal: "#777D70",
  coral: "#BE8965",
  floor: "#D5CBBA",
  window: "#EEE7D6",
  screen: "#3B5559",
  book: "#8E9B7D",
  glass: "#D8DFD2",
  paper: "#EAE1CE",
  wood: "#BCA17A",
} as const;
export function isWebGLAvailable() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}
