import { labObjectById } from "../data/labObjects";
import { useLaboratoryStore } from "../store/laboratoryStore";

export function ObjectTooltip() {
  const hoveredId = useLaboratoryStore((s) => s.hoveredId);
  if (!hoveredId) return null;
  const obj = labObjectById(hoveredId);
  if (!obj) return null;

  return (
    <div className="lab-tooltip" role="status">
      <span>{obj.name} ↗</span>
    </div>
  );
}
