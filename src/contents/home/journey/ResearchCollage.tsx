import { useState } from "react";
import { assetUrl } from "../../../utils/assetUrl";
import { SectionDecor } from "../../../components/SectionDecor";
import { smooth } from "./storyTimeline";
import "./researchCollage.css";

/** The reader chooses the activity; scrolling only enters or leaves the chapter. */
export function ResearchCollage({
  progress,
  staticMode = false,
}: {
  progress: number;
  staticMode?: boolean;
}) {
  const [activity, setActivity] = useState<"observe" | "test">("observe");
  const opacity = staticMode
    ? 1
    : smooth(0.919, 0.923, progress) * (1 - smooth(0.97, 0.973, progress));
  const observing = activity === "observe";

  return (
    <section
      className={`research-collage${staticMode ? " research-collage--static" : ""}`}
      aria-labelledby="research-heading"
      data-research-activity={activity}
      style={{ opacity, visibility: opacity > 0 ? "visible" : "hidden" }}
    >
      {staticMode && <SectionDecor variant="research" />}
      <div className="research-collage__copy">
        <p className="research-collage__eyebrow">From questions to evidence</p>
        <h2 id="research-heading">
          Ideas meet
          <br />
          evidence.
        </h2>
        <div
          className="research-collage__controls"
          role="group"
          aria-label="Explore our research activities"
        >
          <button
            type="button"
            aria-pressed={observing}
            onClick={() => setActivity("observe")}
          >
            Observe
          </button>
          <button
            type="button"
            aria-pressed={!observing}
            onClick={() => setActivity("test")}
          >
            Test
          </button>
        </div>
      </div>
      <figure className="research-collage__photo">
        <img
          src={assetUrl("assets/school/research-photo.png")}
          alt="Research building at Shenyang Pharmaceutical University South Campus"
          loading="lazy"
        />
        <figcaption>Shenyang Pharmaceutical University</figcaption>
      </figure>
      <figure className="research-collage__scene">
        <img
          src={assetUrl(
            `assets/story/modular/${observing ? "10_research-microscope" : "11_research-pipette"}.png`,
          )}
          alt={
            observing
              ? "Researcher observing a sample through a microscope"
              : "Researcher working with a pipette at the laboratory bench"
          }
          draggable={false}
          decoding="async"
        />
        <figcaption aria-live="polite">
          {observing ? "Look closer." : "Put ideas to the test."}
        </figcaption>
      </figure>
    </section>
  );
}
