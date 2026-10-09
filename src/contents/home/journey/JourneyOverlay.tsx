import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { NARRATIVE, smooth, clamp, worldYearMix } from "./storyTimeline";
import "./storyTypography.css";

const source = "https://pmc.ncbi.nlm.nih.gov/articles/PMC10069527/";

export function GlobeCaption({
  hiddenContext = false,
}: {
  hiddenContext?: boolean;
}) {
  return (
    <aside className="globe-caption" aria-label="Estimated global IBD cases">
      <p>
        <strong>1990 · 3.32 million</strong>
        <br />
        <strong>2019 · 4.90 million</strong>
      </p>
      <p>
        Estimated global cases. 95% uncertainty intervals: 2.90–3.79 million in
        1990; 4.35–5.50 million in 2019. In the data chapter, map colour and
        relief show regional age-standardised prevalence per 100,000, rather
        than case counts. The opening globe is illustrative. The
        transition blends the two measured endpoints; it is not annual data.
      </p>
      <a
        href={source}
        target="_blank"
        rel="noreferrer"
        tabIndex={hiddenContext ? -1 : undefined}
      >
        GBD 2019 · Evidence ↗
      </a>
    </aside>
  );
}
const evidence = [
  ["Anatomical context", "/description#project-context", "Anatomical context"],
  ["Local environment", "/description#project-context", "Project context"],
  ["Proposed mechanism", "/description#project-design", "Design & rationale"],
  ["Proposed mechanism", "/experiments", "Experimental work"],
  ["Proposed mechanism", "/safety-and-security", "Containment & limitations"],
];
export function ScienceCaption({
  step,
  hiddenContext = false,
}: {
  step: number;
  hiddenContext?: boolean;
}) {
  const [status, path, label] = evidence[step];
  return (
    <div className="journey-science-caption">
      <span>{status}</span>
      <Link to={path} tabIndex={hiddenContext ? -1 : undefined}>
        {label} ↗
      </Link>
    </div>
  );
}

// Depth comes from coordinated motion within clear reading areas, not occlusion.
function depthStyle(local: number, far = false, last = false) {
  const enter = smooth(0, far ? 0.12 : 0.2, local);
  const exit = last ? 0 : smooth(0.84, 1, local);
  const drift = smooth(0.2, 0.8, local);
  return {
    opacity: enter * (1 - exit),
    transform: `perspective(1100px) translate3d(${-drift * 10}px, ${(1 - enter) * 24 - drift * 12 - exit * 24}px, ${-(1 - enter) * 100 - (far ? drift * 35 : drift * 14) - exit * 70}px)`,
  };
}
function GlobeStory({
  progress,
  backLayer,
}: {
  progress: number;
  backLayer: boolean;
}) {
  const local = clamp((progress - 0.13) / 0.115);
  const mix = worldYearMix(progress);
  const visibility = smooth(0.166, 0.178, progress) * (1 - smooth(0.87, 1, local));
  if (backLayer) return null;
  // Scroll interpolates the two published endpoints, not an annual dataset.
  const year = Math.round(1990 + 29 * mix);
  const count = (3.32 + (4.9 - 3.32) * mix).toFixed(2);
  return (
    <div
      className="world-type world-type--front"
      style={{ opacity: visibility }}
    >
      <p className="world-type__label" style={depthStyle(local, true)}>
        Inflammatory bowel disease, worldwide.
      </p>
      <div
        className="world-type__counts"
        aria-label="Estimated cases rose from 3.32 million in 1990 to 4.90 million in 2019. Intermediate figures are animated interpolation."
      >
        <p aria-hidden="true">
          <span className="world-type__year">{year}</span>
          <strong>
            {count}
            <span className="world-type__unit">million</span>
          </strong>
          <span className="world-type__note">Estimated cases · animated transition</span>
        </p>
      </div>
      <div className="story-sr-only">
        <GlobeCaption hiddenContext />
      </div>
    </div>
  );
}
const screenCopy: Record<string, [string, string]> = {
  person: ["A day,\ninterrupted.", "Meals. Journeys. Sleep."],
  anatomy: ["Look within.", "Follow the route."],
  mucosa: ["A living\nbarrier.", "At the intestinal wall."],
  cell: ["Designed to\nrespond.", "A proposed ROS–PspA response."],
  payload: ["Elafin,\nfrom within.", "Constitutive production, by design."],
  exit: ["A gradual\nexit.", "Clearance still needs testing."],
  campus: ["Questions\nfind a home.", "SYPHU · South Campus."],
  library: ["Where ideas\nbegin.", "Read. Question. Discover."],
  research: ["Ideas meet\nevidence.", "Observe. Test. Learn."],
  laboratory: ["Step inside.", "The work behind the idea."],
};
export function StoryCopy({
  stage,
  progress,
  staticView = false,
  backLayer = false,
  children,
}: {
  stage: number;
  progress: number;
  staticView?: boolean;
  backLayer?: boolean;
  children?: ReactNode;
}) {
  const item = NARRATIVE[stage];
  const colonOverview = item.id === "mucosa" && progress < 0.467;
  if (!staticView && stage === 1)
    return <GlobeStory progress={progress} backLayer={backLayer} />;
  if (staticView)
    return (
      <div className="journey-editorial">
        <h2>{colonOverview ? "A closer look." : item.title}</h2>
        <div className="journey-editorial__detail">
          <p>
            {colonOverview
              ? "From the colon to its living surface."
              : item.lines.join(" ")}
          </p>
          {children}
        </div>
      </div>
    );
  const end = colonOverview ? 0.467 : (NARRATIVE[stage + 1]?.at ?? 1.015);
  const local = clamp((progress - item.at) / (end - item.at));
  const [heading, supporting] = screenCopy[item.id] ?? [item.title, ""];
  if (backLayer) return null;
  return (
    <div className="story-depth story-depth--front" data-copy={item.id}>
      <div className="story-depth__copy">
        <h2 style={depthStyle(local, false, stage === 11)}>
          {colonOverview ? "A closer\nlook." : heading}
        </h2>
        <div
          className="story-depth__near"
          style={depthStyle(local, true, stage === 11)}
        >
          <p>
            {colonOverview ? "From the colon to its living surface." : supporting}
          </p>
          {stage === 11 && children}
        </div>
      </div>
      <div className="story-sr-only">
        <p>{item.lines.join(" ")}</p>
        {stage !== 11 && children}
      </div>
    </div>
  );
}
