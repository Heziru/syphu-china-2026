import { useId, useState, type CSSProperties } from "react";
import "./treatmentBridge.css";

const NIDDK =
  "https://www.niddk.nih.gov/health-information/digestive-diseases/";
const LIVING_REVIEW = "https://www.nature.com/articles/s41467-020-15508-1";
const CHAPTERS = [
  {
    label: "01 / EXISTING CARE",
    title: "MORE OPTIONS.\nSTILL A NEED.",
    intro: "IBD care has come far. Each approach brings different trade-offs.",
    choices: [
      {
        label: "Medicine",
        title: "Response is personal.",
        text: "Medicines can bring remission. Some people experience side effects, an incomplete response, or a response that changes over time.",
        source: `${NIDDK}ulcerative-colitis/treatment`,
        sourceLabel: "NIDDK · Treatment",
      },
      {
        label: "Surgery",
        title: "Relief, with a recovery.",
        text: "Surgery can treat complications and improve lives. It is a major intervention; in Crohn’s disease, inflammation can return.",
        source: `${NIDDK}crohns-disease/treatment`,
        sourceLabel: "NIDDK · Surgery",
      },
      {
        label: "Nutrition",
        title: "The right support matters.",
        text: "Nutritional therapy has an important role. Exclusive enteral nutrition can induce remission in selected Crohn’s cases; needs and feasibility vary.",
        source: "https://pubmed.ncbi.nlm.nih.gov/38276922/",
        sourceLabel: "AGA · Nutrition",
      },
    ],
    note: "A reason to explore. A commitment to existing care.",
  },
  {
    label: "02 / LIVING THERAPEUTICS",
    title: "ALIVE.\nAND COMPLEX.",
    intro:
      "A cell can sense and respond. Turning that potential into a therapy takes control.",
    choices: [
      {
        label: "Where & when",
        title: "The environment keeps changing.",
        text: "Activity, persistence and clearance need to be understood together, across different places and times in the gut.",
        source: LIVING_REVIEW,
        sourceLabel: "Read the perspective",
      },
      {
        label: "Resources",
        title: "Every circuit has a cost.",
        text: "Engineered functions share cellular resources. Burden and interactions can affect both cell fitness and genetic stability.",
        source: "https://www.nature.com/articles/s41467-024-50639-9",
        sourceLabel: "Read the research",
      },
      {
        label: "Containment",
        title: "A switch is a starting point.",
        text: "Genetic changes can undermine intended control. Escape, persistence and environmental release need evidence of their own.",
        source: LIVING_REVIEW,
        sourceLabel: "Read the perspective",
      },
    ],
    note: "Three design questions. No single shortcut.",
  },
  {
    label: "03 / OUR STARTING POINT",
    title: "START WITH\nA LIVING CELL.",
    intro: "Escherichia coli Nissle 1917. EcN, for short.",
    choices: [
      {
        label: "A studied chassis",
        title: "Build on what is known.",
        text: "EcN has a long research history in the gut and in engineered bacterial therapeutics. It is our chosen chassis for prototype validation.",
        source: LIVING_REVIEW,
        sourceLabel: "EcN · Background",
      },
      {
        label: "A genetic toolbox",
        title: "A platform to ask questions.",
        text: "Established tools for E. coli help us connect environmental sensing with a testable cellular response.",
        source: "https://doi.org/10.1111/1751-7915.13967",
        sourceLabel: "EcN · Engineering",
      },
      {
        label: "A prototype first",
        title: "A design, ready to be tested.",
        text: "Choosing EcN does not establish safety or efficacy. Our engineered strain needs its own evidence, from function to containment.",
        source: LIVING_REVIEW,
        sourceLabel: "Development · Evidence",
      },
    ],
    note: "Next: follow the environment, then the response.",
  },
];

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const asset = (file: string) =>
  `${import.meta.env.BASE_URL}assets/story/artist/${file}`;
const CARE_IMAGES = [
  "drug-therapy-original.png",
  "surgery-original.png",
  "diet-original.png",
];
const CARE_ALTS = [
  "The art team's original chemical structure illustration, with its atom labels and bonds preserved.",
  "The art team's original scalpel and surgical scissors illustration.",
  "The art team's original plate, knife and fork illustration.",
];
const BOTTLENECKS = [
  {
    choice: 1,
    title: "Circuit resources",
    x: 45,
    y: 9,
    cx: 1455,
    cy: 300,
    r: 265,
  },
  { choice: 0, title: "Where & when", x: 8, y: 72, cx: 1033, cy: 1610, r: 282 },
  { choice: 2, title: "Escape risk", x: 94, y: 53, cx: 2541, cy: 1190, r: 266 },
];

type Choice = (typeof CHAPTERS)[number]["choices"][number];
function Source({ choice }: { choice: Choice }) {
  return (
    <a
      className="treatment-source"
      href={choice.source}
      target="_blank"
      rel="noreferrer"
    >
      {choice.sourceLabel}
      <span aria-hidden="true"> ↗</span>
    </a>
  );
}
function SectionHeading({ index }: { index: number }) {
  const chapter = CHAPTERS[index];
  return (
    <header className="treatment-heading">
      <p className="treatment-bridge-kicker">{chapter.label}</p>
      <h2>{chapter.title}</h2>
      <p className="treatment-bridge-intro">{chapter.intro}</p>
    </header>
  );
}
function CareScene({
  progress,
  reduced,
}: {
  progress: number;
  reduced: boolean;
}) {
  const [focus, setFocus] = useState<number | null>(null);
  const active = focus ?? Math.min(2, Math.floor(progress * 3));
  return (
    <>
      <SectionHeading index={0} />
      <div
        className="treatment-care-grid"
        aria-label="Three approaches to IBD care"
      >
        {CHAPTERS[0].choices.map((choice, index) => (
          <article
            className={`treatment-care-column${active === index ? " is-selected" : ""}`}
            key={choice.label}
          >
            <button
              className="treatment-care-art"
              aria-label={`Focus on ${choice.label}`}
              aria-pressed={active === index}
              onClick={() => setFocus(index)}
              style={
                reduced
                  ? undefined
                  : {
                      transform: `translateY(${(1 - clamp(progress * 5 - index * 0.2)) * 15}px)`,
                    }
              }
            >
              <img
                src={asset(CARE_IMAGES[index])}
                alt={CARE_ALTS[index]}
                width="1080"
                height="1080"
                loading="eager"
                decoding="async"
              />
            </button>
            <div className="treatment-care-copy">
              <h3>
                <span>0{index + 1}</span>
                {choice.label}
              </h3>
              <p>{choice.text}</p>
              <Source choice={choice} />
            </div>
          </article>
        ))}
      </div>
      <p className="treatment-mobile-hint">
        Swipe to explore each approach <span aria-hidden="true">→</span>
      </p>
      <p className="treatment-bridge-note">{CHAPTERS[0].note}</p>
    </>
  );
}
function BottleneckScene({
  progress,
  reduced,
  id,
}: {
  progress: number;
  reduced: boolean;
  id: string;
}) {
  const [focus, setFocus] = useState<number | null>(null);
  const step = focus ?? Math.min(2, Math.floor(progress * 3));
  const current = BOTTLENECKS[step];
  const choice = CHAPTERS[1].choices[current.choice];
  return (
    <>
      <SectionHeading index={1} />
      <div className="treatment-bottleneck-layout">
        <div
          className="treatment-bottleneck-art"
          style={
            reduced
              ? undefined
              : { transform: `translateY(${-progress * 9}px)` }
          }
        >
          <svg
            viewBox="700 0 2180 1950"
            role="img"
            aria-label="The original living therapeutics illustration: a central bacterium, blocked and branching pathways above, a flowchart and controller below left, and a broken cage with escaping bacteria on the right."
          >
            <image
              href={asset("biotherapeutic-bottlenecks-original.png")}
              x="0"
              y="0"
              width="3497"
              height="2473"
            />
            <circle
              className="treatment-art-focus"
              cx={current.cx}
              cy={current.cy}
              r={current.r}
            />
          </svg>
          {BOTTLENECKS.map((item, index) => (
            <button
              key={item.title}
              className="treatment-hotspot"
              style={{ left: `${item.x}%`, top: `${item.y}%` }}
              aria-label={`Explore ${item.title}`}
              aria-pressed={step === index}
              aria-controls={`${id}-bottleneck-caption`}
              onClick={() => setFocus(index)}
            >
              <span>0{index + 1}</span>
            </button>
          ))}
        </div>
        <aside
          className="treatment-bottleneck-caption"
          id={`${id}-bottleneck-caption`}
          aria-live="polite"
          aria-atomic="true"
        >
          <span className="treatment-caption-index">
            0{step + 1} / {current.title}
          </span>
          <h3>{choice.title}</h3>
          <p>{choice.text}</p>
          <Source choice={choice} />
          <nav
            className="treatment-detail-nav"
            aria-label="Explore the bottlenecks"
          >
            <button
              aria-label="Previous bottleneck"
              onClick={() => setFocus((step + 2) % 3)}
            >
              ←
            </button>
            <span>{String(step + 1).padStart(2, "0")} / 03</span>
            <button
              aria-label="Next bottleneck"
              onClick={() => setFocus((step + 1) % 3)}
            >
              →
            </button>
          </nav>
        </aside>
      </div>
      <p className="treatment-bridge-note">{CHAPTERS[1].note}</p>
    </>
  );
}
function EcNScene({
  progress,
  reduced,
}: {
  progress: number;
  reduced: boolean;
}) {
  const chapter = CHAPTERS[2];
  return (
    <>
      <SectionHeading index={2} />
      <figure
        className="treatment-ecn-portrait"
        style={
          reduced
            ? undefined
            : {
                transform: `translateY(${-Math.sin(progress * Math.PI) * 8}px) rotate(${(progress - 0.5) * 1.5}deg)`,
              }
        }
      >
        <svg
          viewBox="215 85 730 875"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="The original smiling EcN mascot, with its crown, DNA ribbons and hand-drawn stars preserved."
        >
          <image
            href={asset("ecn-original.png")}
            x="0"
            y="0"
            width="1210"
            height="1210"
          />
        </svg>
      </figure>
      <div className="treatment-ecn-fact treatment-ecn-fact--chassis">
        <span className="treatment-caption-index">A studied chassis</span>
        <h3>{chapter.choices[0].title}</h3>
        <p className="treatment-ecn-copy-full">{chapter.choices[0].text}</p>
        <p className="treatment-ecn-copy-compact">
          EcN is a studied gut chassis, chosen for our prototype validation.
        </p>
        <Source choice={chapter.choices[0]} />
      </div>
      <div className="treatment-ecn-fact treatment-ecn-fact--toolbox">
        <span className="treatment-caption-index">A genetic toolbox</span>
        <h3>{chapter.choices[1].title}</h3>
        <p className="treatment-ecn-copy-full">{chapter.choices[1].text}</p>
        <p className="treatment-ecn-copy-compact">
          Established E. coli tools let us test how a cell responds to its
          environment.
        </p>
        <Source choice={chapter.choices[1]} />
      </div>
      <div className="treatment-ecn-evidence">
        <strong>A prototype first.</strong>
        <p className="treatment-ecn-copy-full">{chapter.choices[2].text}</p>
        <p className="treatment-ecn-copy-compact">
          Our engineered strain still needs evidence of function, safety and
          efficacy.
        </p>
        <Source choice={chapter.choices[2]} />
      </div>
    </>
  );
}

/** Artist-led bridge: care (0–⅓), living therapeutics (⅓–⅔), EcN (⅔–1). */
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
  const position = clamp(progress) * 3;
  const active = Math.min(2, Math.floor(position));
  return (
    <div
      className={`treatment-bridge${staticView ? " treatment-bridge--static" : ""}${reduced ? " treatment-bridge--reduced" : ""}`}
      data-bridge-scene={active}
    >
      {CHAPTERS.map((chapter, index) => {
        const visible = staticView || active === index;
        const local = staticView ? 0.5 : clamp(position - index);
        const style: CSSProperties = {
          opacity: visible ? 1 : 0,
          visibility: visible ? "visible" : "hidden",
        };
        return (
          <section
            key={chapter.label}
            className={`treatment-bridge-scene treatment-bridge-scene--${index}`}
            style={style}
            aria-hidden={!visible}
            inert={!visible}
            aria-label={chapter.label.slice(5)}
          >
            {index === 0 ? (
              <CareScene progress={local} reduced={reduced || staticView} />
            ) : index === 1 ? (
              <BottleneckScene
                progress={local}
                reduced={reduced || staticView}
                id={id}
              />
            ) : (
              <EcNScene progress={local} reduced={reduced || staticView} />
            )}
          </section>
        );
      })}
    </div>
  );
}
