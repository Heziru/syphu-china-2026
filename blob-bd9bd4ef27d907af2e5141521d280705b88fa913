import { createPortal } from "react-dom";
import { useEffect, useRef } from "react";
import { EQUIPMENT_DETAILS } from "../data/equipmentDetails";
import { useLaboratoryStore } from "../store/laboratoryStore";
import "./labFocus.css";

/** One caption beside the model. The scene stays interactive; there is no modal stack. */
export function EquipmentInspector({
  onNavigate,
}: {
  onNavigate: (path: string) => void;
}) {
  const phase = useLaboratoryStore((s) => s.phase);
  const id = useLaboratoryStore((s) => s.inspectId);
  const inspect = useLaboratoryStore((s) => s.inspect);
  const close = useLaboratoryStore((s) => s.closeInspection);
  const picker = useRef<HTMLDetailsElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const detail = id ? EQUIPMENT_DETAILS[id] : null;
  const visible = phase === "inspecting" && detail;

  useEffect(() => {
    if (phase === "focusing" && !previousFocus.current) {
      const active = document.activeElement;
      previousFocus.current =
        active instanceof HTMLElement
          ? (active.closest("details")?.querySelector("summary") ?? active)
          : null;
    }
    if (
      phase === "inspecting" &&
      previousFocus.current === picker.current?.querySelector("summary")
    )
      closeButton.current?.focus({ preventScroll: true });
    if (phase === "idle" && previousFocus.current) {
      if (previousFocus.current.isConnected)
        previousFocus.current.focus({ preventScroll: true });
      previousFocus.current = null;
    }
    if (phase !== "inspecting" && phase !== "focusing") return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !document.querySelector("dialog[open]")) {
        event.preventDefault();
        close();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, close]);

  return (
    <>
      <details ref={picker} className="lab-inspect-picker lab-focus-picker">
        <summary>Explore objects</summary>
        <select
          aria-label="Inspect laboratory equipment"
          value=""
          disabled={!["idle", "inspecting"].includes(phase)}
          onChange={(event) => {
            if (picker.current) picker.current.open = false;
            inspect(event.target.value);
          }}
        >
          <option value="" disabled>
            Choose an object
          </option>
          {Object.entries(EQUIPMENT_DETAILS)
            .filter(([, value]) => !value.doi)
            .map(([key, value]) => (
              <option key={key} value={key}>
                {value.name}
              </option>
            ))}
        </select>
      </details>
      {visible &&
        createPortal(
          <section
            key={id}
            className="lab-focus-caption"
            aria-labelledby="lab-focus-title"
            data-object={id}
          >
            <button
              ref={closeButton}
              type="button"
              className="lab-focus-caption__back"
              onClick={close}
              aria-label="Return to previous laboratory view"
            >
              ↙ <span>Laboratory</span>
            </button>
            <div aria-live="polite" aria-atomic="true">
              <h2 id="lab-focus-title">{detail.name}</h2>
              <p>{detail.description}</p>
            </div>
            {detail.path && (
              <button
                type="button"
                className="lab-focus-caption__link"
                onClick={() => onNavigate(detail.path!)}
              >
                {detail.linkLabel ?? "Explore"}{" "}
                <span aria-hidden="true">↗</span>
              </button>
            )}
            {!detail.path && detail.doi && (
              <a
                className="lab-focus-caption__link"
                href={detail.doi}
                target="_blank"
                rel="noreferrer noopener"
              >
                DOI ↗
              </a>
            )}
          </section>,
          document.body,
        )}
    </>
  );
}
