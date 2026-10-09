import { useId } from "react";
import { assetUrl } from "../../../utils/assetUrl";
import { SectionDecor } from "../../../components/SectionDecor";
import { clamp, smooth } from "./storyTimeline";
import "./treatmentBridge.css";

const NIDDK =
  "https://www.niddk.nih.gov/health-information/digestive-diseases/";
const LIVING_REVIEW = "https://www.nature.com/articles/s41467-020-15508-1";
const asset = (file: string) => assetUrl(`assets/story/artist/${file}`);
const CARE_ART = [
  ["drug-therapy-original.png", "The original hand-drawn chemical structure."],
  [
    "surgery-original.png",
    "The original scalpel and surgical scissors illustration.",
  ],
  ["diet-original.png", "The original plate, knife and fork illustration."],
];
const FOCUS_LABELS = ["Cellular resources", "Where and when", "Containment"];
const STEPS = [
  {
    label: "Existing care · Medicine",
    title: "More options.\nStill unmet needs.",
    words: ["Medicine.", "Response\nvaries."],
    text: "Medicines can induce remission, but response and tolerability vary between people and may change over time.",
    source: `${NIDDK}ulcerative-colitis/treatment`,
    sourceLabel: "NIDDK · Treatment",
  },
  {
    label: "Existing care · Surgery",
    title: "Relief through\nmajor intervention.",
    words: ["Surgery.", "Major\nintervention."],
    text: "Surgery can treat complications and improve symptoms; it is a major intervention, and Crohn’s disease can recur.",
    source: `${NIDDK}crohns-disease/treatment`,
    sourceLabel: "NIDDK · Surgery",
  },
  {
    label: "Existing care · Nutrition",
    title: "Nutrition has\na therapeutic role.",
    words: ["Nutrition.", "A therapeutic\nrole.", "Individual\nneeds."],
    text: "Exclusive enteral nutrition can induce remission in selected Crohn’s cases; nutritional needs and feasibility differ.",
    source:
      "https://gastro.org/clinical-guidance/diet-and-nutritional-therapies-in-patients-with-ibd/",
    sourceLabel: "AGA · Nutrition",
  },
  {
    label: "Living therapies · Cellular resources",
    title: "Living cells.\nShared resources.",
    words: ["Living cells.", "Shared resources."],
    text: "Engineered functions share finite cellular resources, so circuit burden can affect cell fitness and genetic stability.",
    source: "https://www.nature.com/articles/s41467-024-50639-9",
    sourceLabel: "Nature Communications · Cellular burden",
  },
  {
    label: "Living therapies · Where and when",
    title: "Where, when,\nand how long.",
    words: ["Where.", "When.", "How long."],
    text: "Activity, persistence and clearance must be understood across changing locations and conditions in the gut.",
    source: LIVING_REVIEW,
    sourceLabel: "Nature Communications · Development",
  },
  {
    label: "Living therapies · Escape risk",
    title: "Containment needs\nits own evidence.",
    words: ["Containment.", "Needs\nevidence."],
    text: "Genetic changes can weaken control; escape, persistence and environmental release each require evidence.",
    source: LIVING_REVIEW,
    sourceLabel: "Nature Communications · Containment",
  },
  {
    label: "Escherichia coli Nissle 1917",
    title: "Our starting\npoint: EcN.",
    words: ["EcN.", "Our starting\npoint."],
    text: "EcN is a studied gut chassis with genetic tools; our engineered strain still needs evidence of function, containment, safety and efficacy.",
    source: LIVING_REVIEW,
    sourceLabel: "EcN · Development",
  },
];

function CareArt({ active }: { active: number }) {
  return (
    <div className="treatment-care-artwork">
      {CARE_ART.map(([file, alt], index) => (
        <figure
          key={file}
          className="treatment-care-figure"
          data-depth={
            index === active
              ? "focus"
              : index === (active + 1) % 3
                ? "next"
                : "previous"
          }
          aria-hidden={index !== active}
        >
          <img
            src={asset(file)}
            style={{ maskImage: `url("${asset(file)}")` }}
            alt={index === active ? alt : ""}
            width="1080"
            height="1080"
            decoding="async"
          />
        </figure>
      ))}
    </div>
  );
}

function BottleneckArt({ focus }: { focus: number }) {
  const file = asset("biotherapeutic-bottlenecks-original.png");
  return (
    <svg
      className="treatment-bottleneck-artwork"
      viewBox="700 0 2180 1940"
      role="img"
      aria-label={`Complete original living-therapy illustration. Current topic: ${FOCUS_LABELS[focus].toLowerCase()}.`}
    >
      {/* The viewBox removes transparent canvas margins, retaining every source mark. */}
      <image href={file} width="3497" height="2473" />
    </svg>
  );
}

/** Seven reading beats; a shared illustration stays still through each topic group. */
export function TreatmentBridge({
  progress,
  reduced = false,
  staticView = false,
}: {
  progress: number;
  reduced?: boolean;
  staticView?: boolean;
}) {
  const id = useId().replace(/:/g, "");
  const position = clamp(progress) * STEPS.length;
  const active = Math.min(STEPS.length - 1, Math.floor(position));
  const local = clamp(position - active);
  const still = reduced || staticView;
  const enter = still ? 1 : smooth(0, 0.12, local);
  const copyStyle = {
    opacity: 0.6 + enter * 0.4,
    transform: `translateY(${(1 - enter) * 6}px)`,
  };
  const groupEnter = still || active % 3 !== 0 ? 1 : enter;
  const artStyle = {
    opacity: 0.8 + groupEnter * 0.2,
    transform: `translateY(${(1 - groupEnter) * 8}px)`,
  };

  return (
    <div
      className={`treatment-bridge${staticView ? " treatment-bridge--static" : ""}${reduced ? " treatment-bridge--reduced" : ""}`}
      data-bridge-scene={active < 3 ? 0 : active < 6 ? 1 : 2}
      data-bridge-beat={active}
    >
      {STEPS.map((step, index) => {
        const visible = staticView || index === active;
        const kind = index < 3 ? "care" : index < 6 ? "bottleneck" : "ecn";
        return (
          <section
            key={step.label}
            className={`treatment-bridge-scene treatment-bridge-scene--${kind}`}
            data-treatment-beat={index}
            style={{ visibility: visible ? "visible" : "hidden" }}
            aria-hidden={!visible}
            inert={!visible}
            aria-labelledby={`${id}-title-${index}`}
          >
            <SectionDecor variant={index < 3 ? "care" : "cell"} />
            {!staticView && (
              <div className="treatment-type-zone">
                <p
                  className="treatment-depth-word treatment-depth-word--back"
                  style={copyStyle}
                  aria-hidden="true"
                >
                  {step.words[0]}
                </p>
                <p
                  className="treatment-depth-word treatment-depth-word--front"
                  style={copyStyle}
                  aria-hidden="true"
                >
                  {step.words[1]}
                </p>
                {step.words[2] && (
                  <p
                    className="treatment-depth-word treatment-depth-word--side"
                    style={copyStyle}
                    aria-hidden="true"
                  >
                    {step.words[2]}
                  </p>
                )}
                {kind === "bottleneck" && (
                  <>
                    <img
                      className="treatment-ecn-companion"
                      src={asset("ecn-original.png")}
                      alt=""
                      width={1210}
                      height={1210}
                      decoding="async"
                      draggable={false}
                    />
                    <div className="treatment-topics" aria-hidden="true">
                      {FOCUS_LABELS.map((label, topic) => (
                        <span key={label} data-current={topic === index - 3}>
                          {label}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
            <header
              className={`treatment-context${staticView ? "" : " treatment-context--sr"}`}
            >
              <p className="treatment-context-label">{step.label}</p>
              <h2 id={`${id}-title-${index}`}>{step.title}</h2>
              <p className="treatment-context-copy">{step.text}</p>
              <div className="treatment-sources">
                <a
                  href={step.source}
                  target="_blank"
                  rel="noreferrer"
                  tabIndex={staticView ? undefined : -1}
                >
                  {step.sourceLabel}
                  <span aria-hidden="true"> ↗</span>
                </a>
                {index === 6 && (
                  <a
                    href="https://pmc.ncbi.nlm.nih.gov/articles/PMC9049610/"
                    target="_blank"
                    rel="noreferrer"
                    tabIndex={staticView ? undefined : -1}
                  >
                    Genetic tools<span aria-hidden="true"> ↗</span>
                  </a>
                )}
              </div>
            </header>
            <div className="treatment-art-stage" style={artStyle}>
              {index < 3 ? (
                <CareArt active={index} />
              ) : index < 6 ? (
                <BottleneckArt focus={index - 3} />
              ) : (
                <svg
                  className="treatment-ecn-artwork"
                  viewBox="215 85 730 875"
                  role="img"
                  aria-label="The original EcN mascot, with its crown, DNA ribbons and hand-drawn stars."
                >
                  <image
                    href={asset("ecn-original.png")}
                    width="1210"
                    height="1210"
                  />
                </svg>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
