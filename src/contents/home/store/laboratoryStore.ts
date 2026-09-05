import { create } from "zustand";
import type { LabObjectId, LabPhase } from "../types/laboratory";

type LaboratoryStore = {
  phase: LabPhase;
  hoveredId: LabObjectId | null;
  selectedId: LabObjectId | null;
  inspectId: string | null;
  inspect: (id: string) => void;
  closeInspection: () => void;
  finishInspectionMotion: (returning: boolean) => void;
  simpleMode: boolean;
  locked: boolean;
  setPhase: (phase: LabPhase) => void;
  setHovered: (id: LabObjectId | null) => void;
  setSelected: (id: LabObjectId | null) => void;
  setSimpleMode: (value: boolean) => void;
  setLocked: (value: boolean) => void;
  resetSession: () => void;
};

const SIMPLE_KEY = "syphu-lab-simple";

function readSimpleMode() {
  try {
    return window.localStorage.getItem(SIMPLE_KEY) === "1";
  } catch {
    return false;
  }
}

export const useLaboratoryStore = create<LaboratoryStore>((set) => ({
  phase: "loading",
  hoveredId: null,
  selectedId: null,
  inspectId: null,
  simpleMode: typeof window !== "undefined" ? readSimpleMode() : false,
  locked: false,
  inspect: (inspectId) =>
    set({ inspectId, phase: "focusing", locked: true, hoveredId: null }),
  closeInspection: () =>
    set((s) =>
      s.phase === "inspecting" || s.phase === "focusing"
        ? { phase: "returning", locked: true }
        : {},
    ),
  finishInspectionMotion: (returning) =>
    set((s) =>
      s.phase === (returning ? "returning" : "focusing")
        ? {
            phase: returning ? "idle" : "inspecting",
            locked: !returning,
            inspectId: returning ? null : s.inspectId,
            selectedId: null,
          }
        : {},
    ),
  setPhase: (phase) => set({ phase }),
  setHovered: (hoveredId) => set({ hoveredId }),
  setSelected: (selectedId) => set({ selectedId }),
  setSimpleMode: (simpleMode) => {
    try {
      window.localStorage.setItem(SIMPLE_KEY, simpleMode ? "1" : "0");
    } catch {
      /* ignore */
    }
    set({ simpleMode, phase: simpleMode ? "fallback" : "loading" });
  },
  setLocked: (locked) => set({ locked }),
  resetSession: () =>
    set({
      phase: "loading",
      hoveredId: null,
      selectedId: null,
      inspectId: null,
      locked: false,
    }),
}));
