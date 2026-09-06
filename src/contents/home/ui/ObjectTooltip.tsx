import { labObjectById } from "../data/labObjects";
import { EQUIPMENT_DETAILS } from "../data/equipmentDetails";
import { useLaboratoryStore } from "../store/laboratoryStore";

export function ObjectTooltip() {
  const hoveredId = useLaboratoryStore((s) => s.hoveredId);
  const phase = useLaboratoryStore((s) => s.phase);
  if (!["idle", "inspecting"].includes(phase)) return null;
  if (!hoveredId) return null;
  const obj = labObjectById(hoveredId);
  const name = EQUIPMENT_DETAILS[hoveredId]?.name ?? obj?.name;
  if (!name) return null;

  return (
    <div className="lab-tap-hint" role="status">
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path
          d="M16 3 19 13 29 16 19 19 16 29 13 19 3 16 13 13Z"
          fill="currentColor"
          stroke="#466560"
          strokeWidth=".7"
        />
        <path
          d="M22 3a14 14 0 0 1 7 18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
      <span>TAP · {name}</span>
    </div>
  );
}
