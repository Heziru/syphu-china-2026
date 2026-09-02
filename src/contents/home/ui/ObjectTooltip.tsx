import { labObjectById } from "../data/labObjects";
import { CHAPTERS } from "../data/chapters";
import { useLaboratoryStore } from "../store/laboratoryStore";

export function ObjectTooltip() {
  const hoveredId = useLaboratoryStore((s) => s.hoveredId);
  if (!hoveredId) return null;
  const obj = labObjectById(hoveredId);
  if (!obj) return null;
  const chapter = CHAPTERS[obj.chapterId];

  return (
    <div className="lab-tooltip" role="status">
      <strong>{obj.nameZh}</strong>
      <span>{chapter.name}</span>
      <p>{obj.description}</p>
    </div>
  );
}
