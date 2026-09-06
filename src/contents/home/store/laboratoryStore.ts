import { create } from "zustand";
import type { LabObjectId, LabPhase } from "../types/laboratory";

type LaboratoryStore = {
  phase: LabPhase;
  hoveredId: string | null;
  selectedId: LabObjectId | null;
  inspectId: string | null;
  inspect: (id: string) => void;
  closeInspection: () => void;
  finishInspectionMotion: (returning: boolean) => void;
  locked: boolean;
  setPhase: (phase: LabPhase) => void;
  setHovered: (id: string | null) => void;
  setSelected: (id: LabObjectId | null) => void;
  setLocked: (value: boolean) => void;
  resetSession: () => void;
};

export const useLaboratoryStore = create<LaboratoryStore>((set) => ({
  phase: "loading",
  hoveredId: null,
  selectedId: null,
  inspectId: null,
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
            locked: false,
            inspectId: returning ? null : s.inspectId,
            selectedId: null,
          }
        : {},
    ),
  setPhase: (phase) => set({ phase }),
  setHovered: (hoveredId) => set({ hoveredId }),
  setSelected: (selectedId) => set({ selectedId }),
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
