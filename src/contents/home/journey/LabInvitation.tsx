import { useId, type CSSProperties } from "react";
import { smooth } from "./storyTimeline";
import "./labInvitation.css";

export function LabInvitation({
  progress,
  onEnter,
}: {
  progress: number;
  onEnter: () => void;
}) {
  const titleId = useId();
  const arrival = smooth(0.973, 0.989, progress);
  const invitation = smooth(0.978, 0.997, progress);
  const interactive = invitation > 0.5;

  return (
    <section
      className="lab-invitation"
      aria-labelledby={titleId}
      aria-hidden={arrival === 0}
      style={
        {
          "--lab-arrival": arrival,
          "--lab-invitation": invitation,
        } as CSSProperties
      }
    >
      <div className="lab-invitation__layout">
        <h2 className="lab-invitation__title" id={titleId}>
          From ideas
          <span>to discovery.</span>
        </h2>
        <button
          className="lab-invitation__enter"
          type="button"
          onClick={onEnter}
          disabled={!interactive}
          tabIndex={interactive ? 0 : -1}
        >
          <span className="lab-invitation__label">Enter the lab</span>
          <span className="lab-invitation__arrow" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14m-6-6 6 6-6 6" />
            </svg>
          </span>
        </button>
      </div>
    </section>
  );
}
