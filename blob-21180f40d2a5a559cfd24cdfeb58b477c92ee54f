import { createPortal } from "react-dom";
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
  const requestClose = () => {
    dialog.current?.close();
    close();
  };
  useEffect(() => {
    const node = dialog.current;
    if (phase === "inspecting" && detail && node && !node.open)
      node.showModal();
    else if (node?.open) {
      node.close();
    }
    if (phase === "idle" && document.activeElement === document.body)
      selector.current?.focus({ preventScroll: true });
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
      {createPortal(
        <dialog
          ref={dialog}
          className="lab-detail"
          aria-labelledby="lab-detail-title"
          onCancel={(e) => {
            e.preventDefault();
            requestClose();
          }}
        >
          <button
            type="button"
            className="lab-detail__close"
            aria-label="Close details"
            onClick={requestClose}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M6 6l12 12M18 6L6 18"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <p className="lab-detail__eyebrow">iGEM Lab · Close-up</p>
          <h2 id="lab-detail-title">{detail?.name}</h2>
          <p>{detail?.description}</p>
          {detail?.citation && (
            <p className="lab-detail__citation">{detail.citation}</p>
          )}
          <div className="lab-detail__actions">
            <button type="button" onClick={requestClose}>
              Back to laboratory
            </button>
            {chapter && (
              <button type="button" onClick={() => onNavigate(chapter.path)}>
                Explore {chapter.name} →
              </button>
            )}
            {detail?.doi && (
              <a href={detail.doi} target="_blank" rel="noreferrer noopener">
                Open DOI source <span aria-hidden="true">↗</span>
              </a>
            )}
          </div>
        </dialog>,
        document.body,
      )}
    </>
  );
}
