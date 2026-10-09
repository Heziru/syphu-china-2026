import { Link } from "react-router-dom";
import { ResearchPageShell } from "../components/ResearchPageShell";
import { SoftwareDemos } from "./software/SoftwareDemos";
import { assetUrl } from "../utils/assetUrl";
import { CodeBlock, Equation, M } from "./drylab/ResearchPrimitives";
import { MototypeWorkbench } from "./software/MototypeWorkbench";
import { ResearchArchive } from "./software/ResearchArchive";
import "./drylab/research.css";
import "./software/software.css";
const file = (name: string) => assetUrl("assets/software/mototype/" + name);
const contents = [
  ["software-overview", "Overview"],
  ["software-demos", "Watch & learn"],
  ["software-workbench", "Try Mototype"],
  ["software-methods", "Methods"],
  ["software-verification", "Verification"],
  ["software-usage", "Use & reproduce"],
  ["software-archive", "Research archive"],
  ["software-references", "References"],
] as const;
export function Software() {
  return (
    <ResearchPageShell
      className="research-page software-page"
      eyebrow="DRY LAB / SOFTWARE"
      title="Software"
      subtitle={
        <>
          Mototype Studio.
          <br />A reporter response workbench.
        </>
      }
      description="Fit early reporter readings, choose a follow-up time and check the prediction against data you held back. Watch the walkthroughs, then try the analysis directly in this page."
      actions={
        <a className="sw-button" href="#software-workbench">
          Open the workbench <span>↓</span>
        </a>
      }
      contents={contents}
      sidebarExtra={
        <a href={file("mototype-source.zip")} download>
          Source &amp; examples ↗
        </a>
      }
    >
      <section
        id="software-overview"
        className="research-section sw-section sw-introduction"
      >
        <p className="research-section-label">01 / THE QUESTION</p>
        <h2>What happens after the environment changes?</h2>
        <div className="sw-prose">
          <p>
            A falling reporter signal does not, by itself, tell us how far the
            response will fall. A rapid decline toward a high plateau and a
            slower decline toward a low plateau can explain the same early
            measurements. They can lead to different decisions about when to
            measure again.
          </p>
          <p>
            Mototype makes that ambiguity visible. It keeps the biological
            replicates separate, compares response profiles and checks their
            predictions with later readings. For SYPHU-China, this provides an
            exploratory way to examine an environment-responsive reporter before
            connecting that readout to the behaviour of an engineered strain.
            The examples below are synthetic; they are not measurements of
            Elafin release or bacterial clearance.
          </p>
        </div>
        <figure className="sw-workflow">
          <ol>
            <li>
              <span>INPUT</span>
              <b>Reporter time course</b>
              <small>CSV · samples · time · units</small>
            </li>
            <li>
              <span>FIT</span>
              <b>Candidate responses</b>
              <small>Rate · amplitude · plateau</small>
            </li>
            <li>
              <span>CHECK</span>
              <b>Unseen measurements</b>
              <small>Prediction error by replicate</small>
            </li>
            <li>
              <span>RECORD</span>
              <b>A repeatable run</b>
              <small>Inputs · settings · outputs</small>
            </li>
          </ol>
          <figcaption>
            Figure 1. The analysis follows a single measurement set from input
            records to an exported run. The fit and the observed requirement
            remain separate checks.
          </figcaption>
        </figure>
      </section>
      <section id="software-demos" className="research-section sw-section">
        <p className="research-section-label">02 / WATCH &amp; LEARN</p>
        <h2>See the workflow before you try it.</h2>
        <p className="sw-section-intro">
          Three short recordings show the actual controls, including a failed
          prediction. Everything shown can be repeated in the workbench below,
          without installation or an account.
        </p>
        <SoftwareDemos />
      </section>
      <section id="software-workbench" className="research-section sw-section">
        <div className="sw-section-heading">
          <div>
            <p className="research-section-label">03 / WORKING SOFTWARE</p>
            <h2>Try it with a small dataset.</h2>
          </div>
          <a href={file("synthetic-decay.csv")} download>
            Example CSV ↓
          </a>
        </div>
        <p className="sw-section-intro">
          Start with <strong>Early data</strong>, add the 2 h readings, then
          open <strong>Check 4 h</strong>. Switch to{" "}
          <strong>Model mismatch</strong> to see an early fit fail on later
          observations. The controls below run the calculations directly.
        </p>
        <MototypeWorkbench />
        <p className="sw-caption">
          Figure 2. Interactive response analysis. Filled circles are training
          readings; square markers are held-out readings. The shaded area spans
          conditional best-fit profiles on the scanned rate grid. It is not a
          confidence interval.
        </p>
      </section>
      <section id="software-methods" className="research-section sw-section">
        <p className="research-section-label">
          04 / METHODS &amp; ARCHITECTURE
        </p>
        <h2>Model and architecture</h2>
        <div className="sw-prose">
          <p>
            We use the established single-phase decay model with a residual
            plateau.
            <sup>
              <a href="#software-ref-3">[3]</a>
            </sup>{" "}
            Each biological replicate has its own amplitude and plateau; the
            decay rate is shared.
          </p>
          <Equation n={1}>
            {"y_r(t)=P_r+A_r e^{-kt},\\qquad P_r,A_r\\geq0,\\quad k>0"}
          </Equation>
          <p>
            Here <M>{"t"}</M> is the time since the environment switch,{" "}
            <M>{"P_r"}</M> the plateau and <M>{"A_r"}</M> the signal above that
            plateau. For each of 401 logarithmically spaced rates between 0.001
            and 10 h⁻¹, the solver finds the non-negative least-squares solution
            for the three replicates. The best rate is refined locally.
          </p>
          <p>
            Profiles whose training RMSE is within δ of the minimum enter the
            candidate set. Each rate keeps only its best-fitting plateau and
            amplitude, so this set does not describe every compatible parameter
            combination. If the grid is too coarse, the tool pauses the score
            rather than returning a misleadingly precise result.
          </p>
          <h3>Choosing a follow-up time</h3>
          <p>
            We rank the available future times using the disagreement between
            these candidates about the readout target. Model discrimination is
            an established experimental-design problem.
            <sup>
              <a href="#software-ref-4">[4]</a>
            </sup>{" "}
            The following combination is our exploratory scoring rule, not a
            validated information-gain estimate.
          </p>
          <Equation n={2}>
            {
              "J(t)=\\frac{\\displaystyle\\frac{1}{R}\\sum_{r=1}^{R}\\frac{\\Delta_r(t)}{\\delta}\\,4p_r(t)[1-p_r(t)]\\,\\mathbf{1}_{\\Delta_r(t)\\geq\\delta}}{1+\\lambda(t-t_{\\mathrm{now}})}"
            }
          </Equation>
          <dl className="sw-definitions">
            <div>
              <dt>Δ</dt>
              <dd>
                Prediction span across the scanned candidates for one replicate.
              </dd>
            </div>
            <div>
              <dt>p</dt>
              <dd>
                Fraction of those candidates predicting a reading at or below
                the target. It is not a probability.
              </dd>
            </div>
            <div>
              <dt>δ / λ</dt>
              <dd>
                Exploratory error budget and the penalty for waiting longer.
              </dd>
            </div>
          </dl>
          <p>
            A zero score means these candidates have no resolvable disagreement
            about the threshold at that time. It does not mean a measurement has
            no other value. Rate boundaries, the grid and the selected error
            budget influence the score. Its practical advantage over fixed or
            random sampling has not been demonstrated.
          </p>
          <h3>Where the calculations run</h3>
          <div className="sw-architecture">
            <div>
              <b>Input</b>
              <code>CSV / saved JSON</code>
              <span>Schema, units and identity checks</span>
            </div>
            <i aria-hidden="true">→</i>
            <div>
              <b>TypeScript core</b>
              <code>Observed check + profile fit</code>
              <span>The browser and CLI use the same functions</span>
            </div>
            <i aria-hidden="true">→</i>
            <div>
              <b>Output</b>
              <code>Plot / HTML / CSV / JSON</code>
              <span>Raw input stays with the run</span>
            </div>
          </div>
          <p>
            No account or remote model service is needed. A restored run is
            recalculated from its input; imported cached results are ignored.
            Censored or missing training readings pause this empirical fit
            instead of being replaced by zero.
          </p>
        </div>
      </section>
      <section
        id="software-verification"
        className="research-section sw-section"
      >
        <p className="research-section-label">05 / VERIFICATION</p>
        <h2>Tests include cases the model must reject.</h2>
        <p className="sw-section-intro">
          The numerical checks use known solutions and deliberately unsuitable
          inputs. Passing them checks the implementation; it does not establish
          biological validity.
        </p>
        <div className="sw-test-list">
          <article>
            <span>01</span>
            <div>
              <h3>Recover a known response</h3>
              <p>
                The noise-free fixture uses k = ln(2), plateaus [36, 40, 44] RFU
                and amplitudes [420, 440, 460] RFU. Fitting 0, 1 and 2 h
                predicts the unseen 4 h readings [62.25, 67.50, 72.75] RFU.
              </p>
            </div>
          </article>
          <article>
            <span>02</span>
            <div>
              <h3>Reject an inaccurate prediction</h3>
              <p>
                The mismatch example also decreases over time. Its late
                prediction errors exceed 10 RFU for every replicate, so the
                default 5 RFU budget rejects the prediction. A visually
                plausible curve is not enough.
              </p>
            </div>
          </article>
          <article>
            <span>03</span>
            <div>
              <h3>Keep information out of the fit</h3>
              <p>
                Changing held-out values must leave the early fitted profiles
                and sampling scores unchanged. A 2.05 h reading must not stand
                in for the promised 4 h check. Incomplete or censored holdouts
                remain unresolved.
              </p>
            </div>
          </article>
          <article>
            <span>04</span>
            <div>
              <h3>Recompute an exported run</h3>
              <p>
                Save a run, reload it in the workbench or pass it to the
                command-line runner. Inputs are checked again and results are
                recomputed with the declared model version. The source package
                contains the runnable checks.
              </p>
            </div>
          </article>
        </div>
        <p className="sw-method-note">
          Before displaying dynamic parameters, the tool also requires an
          acceptable training error, three distinct training times per
          replicate, a bounded scanned rate range and a passed holdout check.
          These rules are provisional diagnostics, not a proof of parameter
          identifiability.
        </p>
      </section>
      <section id="software-usage" className="research-section sw-section">
        <p className="research-section-label">06 / USE &amp; REPRODUCE</p>
        <h2>Use the page. Reproduce it when you need to.</h2>
        <div className="sw-prose">
          <p>
            Use the workbench without installation. For a CSV import, open Input
            records &amp; import, then Paste CSV. The built-in example shows the
            required columns: observation ID, biological replicate, sample and
            read times, units, value or reporting bound, and measurement scale.
            Confirm the fixed identity mapping in the import panel before
            loading your data.
          </p>
          <p>
            This release uses B1–B3, an environment change at experimental time
            2 h, and observations from 0–6 h. It accepts exact readings,
            reporting bounds and missing records, but only exact compatible
            training readings enter the model. Imported data remain in browser
            memory; export a run before refreshing.
          </p>
          <p>
            <a href={file("mototype-source.zip")} download>
              Download the source, CLI and checks (.zip)
            </a>
            . Extract the package into its own directory. The numerical core
            needs Node.js 22.14 or newer and has no third-party runtime
            dependencies. The Wiki frontend uses the repository’s existing React
            and Vite setup.
          </p>
          <CodeBlock
            title="Recompute from CSV or an exported run"
            language="bash"
            sourceUrl={file("README.txt")}
          >
            {[
              "# From the extracted package root",
              "node --experimental-strip-types scripts/software/mototype.mjs examples/synthetic-decay.csv --stage verify > result.json",
              "node --experimental-strip-types scripts/software/mototype.mjs mototype-run.json > replay.json",
              "",
              "# Independent numerical and replay checks",
              "node --experimental-strip-types scripts/software/observed-check.mjs",
              "node --experimental-strip-types scripts/software/kinetics-check.mjs",
              "node --experimental-strip-types scripts/software/replay-check.mjs",
            ].join("\n")}
          </CodeBlock>
          <p>
            <a href={file("README.txt")} download>
              Package instructions
            </a>{" "}
            and{" "}
            <a href={file("manifest.json")} download>
              SHA-256 manifest
            </a>{" "}
            accompany the download. The current repository license is CC BY 4.0;
            third-party tools and data keep their own terms. No separate
            OSI-approved software license is claimed.
          </p>
          <h3>What still needs experimental evidence</h3>
          <p>
            We have not calibrated the error budget against a plate reader,
            tested performance on wet-lab reporter series or shown that this
            score reduces experiments. A single exponential can miss delays,
            growth effects and multiple response phases. Reporter fluorescence
            does not establish cell viability, payload release or therapeutic
            clearance. The next evaluation should compare the score with
            prespecified sampling schedules on independent data.
          </p>
        </div>
      </section>
      <section id="software-archive" className="research-section sw-section">
        <p className="research-section-label">07 / PROJECT CALCULATIONS</p>
        <h2>The research archive remains available.</h2>
        <p>
          The <Link to="/model">Model page</Link> contains the project’s
          structural, binding, ecological, surface-retention and transport
          analyses. Their scripts and saved simulation outputs are a separate
          research collection from Mototype’s synthetic reporter examples.
        </p>
        <details className="sw-archive">
          <summary>
            Browse research modules, downloads and run instructions{" "}
            <span>↓</span>
          </summary>
          <ResearchArchive />
        </details>
      </section>
      <section id="software-references" className="research-section sw-section">
        <p className="research-section-label">
          08 / REFERENCES &amp; DESIGN NOTES
        </p>
        <h2>Sources and precedents.</h2>
        <ol className="sw-references">
          <li id="software-ref-1">
            <a
              href="https://2024.igem.wiki/vilnius-lithuania/software/"
              target="_blank"
              rel="noreferrer"
            >
              Vilnius-Lithuania 2024 — bioreactor software.
            </a>{" "}
            A reference for connecting lab needs, implementation, usage and
            explicitly unfinished work. Its hardware-control system is not part
            of Mototype.
          </li>
          <li id="software-ref-2">
            <a
              href="https://2025.igem.wiki/bit-china/software"
              target="_blank"
              rel="noreferrer"
            >
              BIT-China 2025 — BiGEM.
            </a>{" "}
            A reference for documenting architecture, engineering, installation
            and a concrete usage workflow. BiGEM is a project-search platform;
            its data and models are not incorporated here.
          </li>
          <li id="software-ref-3">
            <a
              href="https://www.graphpad.com/guides/prism/latest/curve-fitting/reg_classic_1decay.htm"
              target="_blank"
              rel="noreferrer"
            >
              GraphPad Prism — One phase decay.
            </a>{" "}
            Reference for the established decay-with-plateau model.
          </li>
          <li id="software-ref-4">
            <a
              href="https://pmc.ncbi.nlm.nih.gov/articles/PMC2743521/"
              target="_blank"
              rel="noreferrer"
            >
              Optimal experimental design for model discrimination.
            </a>{" "}
            Prior work motivating the comparison of competing predictions; our
            scoring rule is an unvalidated heuristic.
          </li>
        </ol>
      </section>
    </ResearchPageShell>
  );
}
