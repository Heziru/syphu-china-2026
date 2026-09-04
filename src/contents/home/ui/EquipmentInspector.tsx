import { useEffect, useRef } from "react";
import { EQUIPMENT_DETAILS } from "../data/equipmentDetails";
import { chapterForObject } from "../data/labObjects";
import { useLaboratoryStore } from "../store/laboratoryStore";

export function EquipmentInspector({
  onNavigate,
}: {
  onNavigate: (path: string) => void;
}) {
  const phase = useLaboratoryStore((s) => s.phase);
  const id = useLaboratoryStore((s) => s.inspectId);
  const inspect = useLaboratoryStore((s) => s.inspect);
  const close = useLaboratoryStore((s) => s.closeInspection);
  const dialog = useRef<HTMLDialogElement>(null);
  const selector = useRef<HTMLSelectElement>(null);
  const detail = id ? EQUIPMENT_DETAILS[id] : null;
  const chapter = id
    ? chapterForObject(id === "storage-a" ? "bookshelf" : id)
    : undefined;
  useEffect(() => {
    const node = dialog.current;
    if (phase === "inspecting" && detail) node?.showModal();
    else if (node?.open) {
      node.close();
      selector.current?.focus({ preventScroll: true });
    }
  }, [phase, detail]);
  return (
    <>
      <label className="lab-inspect-picker">
        <span>Look closer</span>
        <select
          ref={selector}
          aria-label="Inspect laboratory equipment"
          value=""
          disabled={phase !== "idle"}
          onChange={(e) => inspect(e.target.value)}
        >
          <option value="" disabled>
            Choose an object
          </option>
          {Object.entries(EQUIPMENT_DETAILS).map(([key, value]) => (
            <option key={key} value={key}>
              {value.name}
            </option>
          ))}
        </select>
      </label>
      <dialog
        ref={dialog}
        className="lab-detail"
        aria-labelledby="lab-detail-title"
        onCancel={(e) => {
          e.preventDefault();
          close();
        }}
      >
        <button
          type="button"
          className="lab-detail__close"
          aria-label="Close details"
          onClick={close}
        >
          ×
        </button>
        <p className="lab-detail__eyebrow">iGEM Lab · Close-up</p>
        <h2 id="lab-detail-title">{detail?.name}</h2>
        <p>{detail?.description}</p>
        <div className="lab-detail__actions">
          <button type="button" onClick={close}>
            Back to laboratory
          </button>
          {chapter && (
            <button type="button" onClick={() => onNavigate(chapter.path)}>
              Explore {chapter.name} →
            </button>
          )}
        </div>
      </dialog>
    </>
  );
}
