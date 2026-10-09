import { useState } from "react";
import { assetUrl } from "../../utils/assetUrl";

const demos = [
  {
    id: "analysis",
    title: "From readings to a checked prediction",
    short: "Fit & check",
    intro:
      "Follow a synthetic reporter series from an ambiguous early fit to a comparison with unseen measurements.",
    steps: [
      [
        "Choose Synthetic decay",
        "Early data shows several responses that could explain the same readings. The shaded band spans those candidate profiles.",
      ],
      [
        "Select Add 2 h",
        "The extra readings narrow the fitted responses. Compare the follow-up scores; they rank the available times under the current settings.",
      ],
      [
        "Select Check 4 h",
        "Square markers reveal measurements excluded from the fit. Compare each predicted value with its observation, then open Read this run for the analysis summary.",
      ],
    ],
    outcome:
      "Expected result at the default 5 RFU budget: Within the holdout budget. This is an implementation example, not biological validation.",
  },
  {
    id: "mismatch",
    title: "A good early fit can still fail",
    short: "Inspect a failure",
    intro:
      "See why an attractive curve is not sufficient evidence, and what happens when the error budget is changed after seeing the result.",
    steps: [
      [
        "Choose Model mismatch",
        "Use the default error budget of 5 RFU and add the 2 h readings. The early response can still be fitted.",
      ],
      [
        "Check the held-out readings",
        "Select Check 4 h. The later observations disagree with the prediction, so the result is rejected and dynamic parameters stay hidden.",
      ],
      [
        "Explore a different budget",
        "Move the error budget to 20 RFU. The page preserves the first rejected check and labels the new result an exploratory reassessment.",
      ],
    ],
    outcome:
      "Changing the acceptance rule does not improve the prediction. The first-check record makes that distinction visible.",
  },
  {
    id: "import",
    title: "Inspect and load data in the page",
    short: "Work with inputs",
    intro:
      "Try the input format without downloading a file. The editor loads the same CSV schema as the file importer.",
    steps: [
      [
        "Open Input records & import",
        "Inspect the rows behind the plot. Experimental times include the 2 h pre-switch period; plot times start at the switch.",
      ],
      [
        "Open Paste CSV",
        "Select Fill with synthetic example and confirm the displayed mapping. Review the text, then select Load pasted CSV. Locally pasted values are user-supplied; their provenance is not independently verified.",
      ],
      [
        "Read the recalculated result",
        "Return to the stages and select Check 4 h. Open Read this run to inspect the current settings and result directly in the page. File export is optional.",
      ],
    ],
    outcome:
      "Invalid input leaves the current dataset in place. Nothing is uploaded; browser input is lost on refresh unless you save a run.",
  },
] as const;

export function SoftwareDemos() {
  const [selected, setSelected] = useState(0);
  const [failed, setFailed] = useState(false);
  const demo = demos[selected];
  const media = (extension: string) =>
    assetUrl("assets/software/mototype/demos/" + demo.id + extension);
  return (
    <div className="sw-demos">
      <div
        className="sw-demo-choices"
        role="group"
        aria-label="Choose an operation walkthrough"
      >
        {demos.map((item, i) => (
          <button
            key={item.id}
            aria-pressed={selected === i}
            onClick={() => {
              setSelected(i);
              setFailed(false);
            }}
          >
            <span>{String(i + 1).padStart(2, "0")}</span>
            {item.short}
          </button>
        ))}
      </div>
      <h3>{demo.title}</h3>
      <p>{demo.intro}</p>
      <figure className="sw-demo-film">
        <video
          key={demo.id}
          controls
          playsInline
          preload="none"
          poster={media(".jpg")}
          aria-label={demo.title}
          onError={() => setFailed(true)}
        >
          <source src={media(".webm")} type="video/webm" />
          <track
            key={demo.id}
            kind="captions"
            src={media(".vtt")}
            srcLang="en"
            label="English instructions"
            default
          />
          Your browser cannot play this recording. The complete steps are
          written below.
        </video>
        <figcaption>
          Recorded in this workbench using synthetic examples. No audio; English
          captions and a text walkthrough are provided.
        </figcaption>
      </figure>
      {failed && (
        <p role="status">
          The recording could not be loaded. Follow the steps below in the live
          workbench.
        </p>
      )}
      <ol className="sw-demo-steps">
        {demo.steps.map(([title, detail], i) => (
          <li key={title}>
            <span>{i + 1}</span>
            <div>
              <h4>{title}</h4>
              <p>{detail}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="sw-demo-outcome">{demo.outcome}</p>
      <a className="sw-button sw-button--quiet" href="#software-workbench">
        Try these steps in the workbench <span>↓</span>
      </a>
    </div>
  );
}
