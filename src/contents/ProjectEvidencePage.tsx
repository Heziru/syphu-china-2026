import { useState } from "react";
import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { LITERATURE } from "./home/data/literature";
import "./projectEvidence.css";

type EvidenceKind = "design" | "experiments" | "model" | "results" | "safety";
const PAGES: { kind: EvidenceKind; label: string; path: string }[] = [
  { kind: "design", label: "Design", path: "/description" },
  { kind: "experiments", label: "Experiments", path: "/experiments" },
  { kind: "model", label: "Model", path: "/model" },
  { kind: "results", label: "Results", path: "/results" },
  { kind: "safety", label: "Safety", path: "/safety-and-security" },
];
const PAGE_REFS: Record<EvidenceKind, readonly string[]> = {
  design: ["simmonds", "rubens", "wang", "begley", "teng"],
  experiments: ["rubens", "wang", "teng", "andersen"],
  model: ["rubens", "andersen", "wang"],
  results: ["simmonds", "rubens", "wang", "teng", "andersen"],
  safety: ["begley", "hoffmann", "andersen", "teng"],
};

function Cite({ id }: { id: string }) {
  const paper = LITERATURE.find((item) => item.id === id);
  return paper ? (
    <a
      className="project-evidence__cite"
      href={`#ref-${paper.id}`}
      aria-label={`Reference ${paper.ref}: ${paper.author}`}
    >
      [{paper.ref}]
    </a>
  ) : null;
}
function Section({
  id,
  label,
  title,
  children,
}: {
  id: string;
  label: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="project-evidence__section">
      <div className="project-evidence__section-heading">
        <span>{label}</span>
        <h2>{title}</h2>
      </div>
      <div className="project-evidence__section-body">{children}</div>
    </section>
  );
}
function NextEvidence({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link className="project-evidence__next" to={to}>
      {children} <span aria-hidden="true">↗</span>
    </Link>
  );
}
function MechanismFigure() {
  return (
    <figure className="project-evidence__mechanism">
      <div className="project-evidence__chain">
        {[
          ["Input", "ROS", "H₂O₂-associated signal"],
          ["Control", "PspA", "pKatG / OxyR response"],
          ["State", "Membrane", "Protection and energetics"],
          ["Outcome", "Survival", "Conditional on bile stress"],
        ].map(([label, title, note]) => (
          <div key={title}>
            <small>{label}</small>
            <strong>{title}</strong>
            <span>{note}</span>
          </div>
        ))}
      </div>
      <figcaption>
        Proposed relationship · its operating window must be measured in the
        engineered strain.
      </figcaption>
    </figure>
  );
}

function DesignContent() {
  return (
    <>
      <Section
        id="project-context"
        label="The question"
        title="Where should a living medicine survive?"
      >
        <p>
          LBP-Mototype explores an environment-dependent survival system for an
          engineered <i>Escherichia coli</i> Nissle 1917 (EcN) strain, in the
          context of inflammatory bowel disease (IBD).
        </p>
        <p>
          Inflammatory environments can differ from surrounding tissue.
          Oxidative signals and the intestinal bile environment motivate our
          design, while their local variability sets an important limit: a
          signal is not a precise map of a lesion. <Cite id="simmonds" />
          <Cite id="begley" />
        </p>
        <p>
          Our question is whether one environmental control axis can connect a
          bacterium’s persistence, its therapeutic output and its eventual exit.
        </p>
      </Section>
      <Section id="project-design" label="The design" title="One control axis.">
        <p>
          The proposed chassis combines chromosomal <i>acrB</i> and <i>pspA</i>{" "}
          deletions with ROS-responsive PspA complementation. The design retains{" "}
          <i>tolC</i>. It aims to create a difference between unprotected and
          induced cells under bile-acid stress.
        </p>
        <MechanismFigure />
        <div className="project-evidence__pair">
          <article>
            <h3>A responsive protection module</h3>
            <p>
              The pKatG/OxyR input is intended to connect H₂O₂-associated
              signals to PspA production. PspA is studied here for its
              relationship to membrane protection and proton motive force.
              Published circuit and stress-response studies motivate this
              choice; they do not establish our strain’s performance.{" "}
              <Cite id="rubens" />
              <Cite id="wang" />
            </p>
          </article>
          <article>
            <h3>An environmental constraint</h3>
            <p>
              Bile acids supply the surrounding stress. The useful separation
              between induced and uninduced cells depends on measured
              susceptibility, signal response and culture conditions.
              “Targeting” therefore means a proposed survival difference, rather
              than directed movement toward a lesion. <Cite id="begley" />
            </p>
          </article>
        </div>
        <NextEvidence to="/experiments#validation-plan">
          How we will test the window
        </NextEvidence>
      </Section>
      <Section
        id="payload-design"
        label="The payload"
        title="Production and release are different."
      >
        <p>
          Elafin is the proposed therapeutic payload. An EcN–Elafin study
          provides preclinical precedent for the chassis–payload pairing, not
          clinical validation of LBP-Mototype. <Cite id="teng" />
        </p>
        <p>
          In VER16.9, Elafin and sfGFP are constitutively expressed from
          separate expression cassettes on the same plasmid. They are not
          directly switched on by the ROS-responsive PspA circuit.
        </p>
        <ol className="project-evidence__sequence">
          <li>
            <strong>Accumulate.</strong>
            <span>
              Intracellular production and background release are distinguished.
            </span>
          </li>
          <li>
            <strong>Leak.</strong>
            <span>
              Membrane damage may change the rate at which intracellular
              material enters the environment.
            </span>
          </li>
          <li>
            <strong>Release.</strong>
            <span>
              Lysis can release the remaining intracellular pool; it also ends
              further production by that cell.
            </span>
          </li>
        </ol>
        <NextEvidence to="/experiments#readouts">
          Separate payload measurements from proxies
        </NextEvidence>
      </Section>
      <Section
        id="design-boundaries"
        label="The boundary"
        title="A design to interrogate."
      >
        <p>
          Signal withdrawal is expected to reduce new PspA production. Existing
          protection can persist and change through degradation, dilution and
          cell state. Exit therefore has a time course, rather than an
          instantaneous visual switch.
        </p>
        <p>
          The project’s “subtractive design” concerns sharing a mechanism across
          several control functions. It does not mean that fewer mechanisms
          automatically guarantee containment, or that gene deletion alone
          proves safety.
        </p>
        <NextEvidence to="/model#model-framework">
          Explore the dependencies
        </NextEvidence>
        <NextEvidence to="/safety-and-security#containment">
          Inspect the safety questions
        </NextEvidence>
      </Section>
    </>
  );
}

function ExperimentsContent() {
  return (
    <>
      <Section
        id="validation-plan"
        label="Experimental design"
        title="Measure the window first."
      >
        <p>
          The VER16.9 verification plan begins with strain-specific calibration,
          then asks whether signal, survival and release remain distinguishable
          in a staged in vitro setting. The sequence below describes planned
          verification; linked team datasets are not yet available on this page.
        </p>
        <ol className="project-evidence__sequence">
          <li>
            <strong>Calibrate.</strong>
            <span>
              Compare bile-acid susceptibility in the proposed double-deletion
              chassis and its relevant genetic controls. Distinguish growth
              inhibition from loss of viability.
            </span>
          </li>
          <li>
            <strong>Separate the inputs.</strong>
            <span>
              Compare induced and uninduced cells in matched bile conditions,
              and use a signal-only arm to distinguish the ROS response from
              bile effects.
            </span>
          </li>
          <li>
            <strong>Follow transitions.</strong>
            <span>
              Track persistent signal, short interruption and sustained
              withdrawal through the staged environment. Assess viable cells and
              payload location together.
            </span>
          </li>
          <li>
            <strong>Test robustness.</strong>
            <span>
              Compare relevant plasmid-partitioning conditions and examine
              whether population differences support the proposed heterogeneity
              model.
            </span>
          </li>
        </ol>
        <NextEvidence to="/description#project-design">
          Return to the design question
        </NextEvidence>
      </Section>
      <Section
        id="readouts"
        label="Measurement"
        title="One colour is not one conclusion."
      >
        <div className="project-evidence__readouts">
          <article>
            <span className="project-evidence__dot" />
            <h3>Viability</h3>
            <p>
              Colony-forming units address survival. Optical density tracks bulk
              growth-related changes but cannot establish that cells are alive.
            </p>
          </article>
          <article>
            <span className="project-evidence__dot project-evidence__dot--rose" />
            <h3>mCherry</h3>
            <p>
              Co-transcription with <i>pspA</i> supports a qualitative readout
              of control-module activity. It is not a direct measurement of PspA
              protein abundance.
            </p>
          </article>
          <article>
            <span className="project-evidence__dot project-evidence__dot--sage" />
            <h3>sfGFP</h3>
            <p>
              Intracellular and supernatant signals help track the distribution
              of a reporter. Its relationship to Elafin release requires paired
              measurement, not an assumed conversion.
            </p>
          </article>
          <article>
            <span className="project-evidence__dot project-evidence__dot--gold" />
            <h3>Elafin</h3>
            <p>
              Payload-specific measurements distinguish the intracellular pool
              from released protein. Protein quantity alone does not establish
              retained therapeutic activity. <Cite id="teng" />
            </p>
          </article>
        </div>
        <details className="project-evidence__detail">
          <summary>Why sampling matters</summary>
          <p>
            The proposal uses anaerobic culture with post-sampling
            oxygen-dependent fluorescence maturation. A fluorescent signal after
            maturation must not be depicted as real-time fluorescence inside an
            anaerobic culture. Sampling and maturation need controls to
            establish how closely the readout reflects the original cell state.
          </p>
          <p>
            Reporter kinetics and degradation tags also depend on context.
            Published GFP-tag behaviour cannot be assigned directly to tagged
            PspA in this strain. <Cite id="andersen" />
          </p>
        </details>
      </Section>
      <Section
        id="experimental-controls"
        label="Interpretation"
        title="Controls make the contrast meaningful."
      >
        <p>
          Relevant comparisons include strain background, the uninduced state,
          signal without bile, matched handling, and plasmid-partitioning
          controls. The actual signal and stress exposure must be recorded
          alongside biological readouts.
        </p>
        <p>
          To publish a result, each figure needs a defined comparison, units,
          replicate information, raw data, analysis choices and an
          interpretation limited to that experiment. The model should then be
          updated from these measurements. <Cite id="rubens" />
          <Cite id="wang" />
        </p>
        <NextEvidence to="/results#evidence-status">
          See the evidence status
        </NextEvidence>
      </Section>
    </>
  );
}

const SCENARIOS = [
  {
    label: "Sustained signal",
    title: "Protection may persist.",
    text: "Continued input can support new PspA production. Survival still depends on bile stress and the actual protection achieved; signal alone is not a guarantee.",
    state: "sustained",
  },
  {
    label: "Brief interruption",
    title: "History may matter.",
    text: "Existing PspA can outlast a short change in input. A buffering interval is a hypothesis to test against protein turnover, growth and cell-to-cell variation.",
    state: "pulse",
  },
  {
    label: "Signal withdrawal",
    title: "Exit takes time.",
    text: "New production falls while the existing pool changes. The relevant test is viable-cell decline under the specified stress conditions, including residual survivors and possible recovery.",
    state: "withdrawn",
  },
];
function ScenarioExplorer() {
  const [selected, setSelected] = useState(0);
  const scenario = SCENARIOS[selected];
  return (
    <div className="project-evidence__scenario">
      <div
        className="project-evidence__scenario-tabs"
        role="tablist"
        aria-label="Conceptual signal scenarios"
      >
        {SCENARIOS.map((item, i) => (
          <button
            key={item.state}
            type="button"
            role="tab"
            id={`scenario-${item.state}`}
            aria-controls="scenario-panel"
            aria-selected={selected === i}
            tabIndex={selected === i ? 0 : -1}
            onClick={() => setSelected(i)}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
                event.preventDefault();
                const next =
                  (selected +
                    (event.key === "ArrowRight" ? 1 : -1) +
                    SCENARIOS.length) %
                  SCENARIOS.length;
                setSelected(next);
                document
                  .getElementById(`scenario-${SCENARIOS[next].state}`)
                  ?.focus();
              }
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div
        id="scenario-panel"
        role="tabpanel"
        aria-labelledby={`scenario-${scenario.state}`}
        className="project-evidence__scenario-body"
      >
        <span
          className="project-evidence__state-mark"
          data-state={scenario.state}
          aria-hidden="true"
        >
          <i />
          <i />
          <i />
          <i />
          <i />
        </span>
        <div>
          <h3>{scenario.title}</h3>
          <p>{scenario.text}</p>
        </div>
      </div>
      <small>
        Conceptual scenarios · qualitative relationships, not fitted
        predictions.
      </small>
    </div>
  );
}
function ModelContent() {
  return (
    <>
      <Section
        id="model-framework"
        label="Model framework"
        title="Connect signal, state and survival."
      >
        <p>
          The model described here is a conceptual framework derived from
          VER16.9. Its purpose is to identify which measurements the design
          requires. No calibrated simulation or predictive performance is
          claimed on this page.
        </p>
        <MechanismFigure />
        <div className="project-evidence__variables">
          <div>
            <strong>H</strong>
            <span>Environmental signal</span>
          </div>
          <div>
            <strong>m</strong>
            <span>Plasmid copy state</span>
          </div>
          <div>
            <strong>n</strong>
            <span>PspA inventory</span>
          </div>
          <div>
            <strong>B</strong>
            <span>Bile-acid stress</span>
          </div>
        </div>
        <p>
          The proposal’s <i>m,n</i> population description distinguishes plasmid
          copy state from existing PspA. Cells with the same current signal may
          therefore have different histories and survival capacities.
        </p>
      </Section>
      <Section
        id="signal-scenarios"
        label="Explore"
        title="The same circuit. Different histories."
      >
        <ScenarioExplorer />
        <NextEvidence to="/experiments#validation-plan">
          Test these scenarios experimentally
        </NextEvidence>
      </Section>
      <Section
        id="model-parameters"
        label="Calibration"
        title="Measure before predicting."
      >
        <p>
          The key quantities are the strain’s input response, protection under
          bile stress, PspA turnover, growth and viability, and the partitioning
          of intracellular versus released payload. Literature supplies context
          and starting questions, not interchangeable parameter values.{" "}
          <Cite id="rubens" />
          <Cite id="wang" />
        </p>
        <details className="project-evidence__detail">
          <summary>Two assumptions that need special care</summary>
          <p>
            <strong>Protein lifetime.</strong> A degradation-tag result obtained
            with GFP does not determine the lifetime or function of tagged PspA.
            Both must be assessed in the project’s strain and conditions.{" "}
            <Cite id="andersen" />
          </p>
          <p>
            <strong>Cycle versus exit.</strong> VER16.9 distinguishes ongoing
            cycles with signal from withdrawal-triggered exit in its later stage
            descriptions. An earlier environmental-rule statement differs. This
            framework keeps the two states separate; the final experimental
            schedule needs an explicit, consistent definition before
            quantitative simulation.
          </p>
        </details>
        <p>
          After calibration, model outputs should be compared with measurements
          not used for fitting. Uncertainty and sensitivity should accompany
          predictions, particularly where clearance depends on a small residual
          population.
        </p>
        <NextEvidence to="/results#evidence-status">
          Track what has been established
        </NextEvidence>
      </Section>
    </>
  );
}

function ResultsContent() {
  return (
    <>
      <Section
        id="evidence-status"
        label="Evidence status"
        title="Every claim needs its own evidence."
      >
        <p>
          This page separates the project’s design rationale from measurements
          of LBP-Mototype. The current source is the team’s VER16.9 design
          proposal. Team raw datasets and analysed result figures have not yet
          been linked here, so quantitative performance and therapeutic efficacy
          are not presented as demonstrated outcomes.
        </p>
        <div className="project-evidence__status-grid">
          <article>
            <span>Literature context</span>
            <h3>Published precedents</h3>
            <p>
              Work on oxidative signals, circuits, membrane energetics and
              EcN–Elafin informs the design. These studies have their own
              organisms and conditions.
            </p>
          </article>
          <article>
            <span>Design hypothesis</span>
            <h3>Conditional survival</h3>
            <p>
              The combined chassis, sensing and protection system is proposed to
              separate environmental states. That combined function needs direct
              testing.
            </p>
          </article>
          <article>
            <span>Awaiting linked data</span>
            <h3>Strain performance</h3>
            <p>
              Operating window, payload release, signal-withdrawal response and
              residual survival require strain-specific measurements.
            </p>
          </article>
        </div>
      </Section>
      <Section
        id="evidence-map"
        label="Evidence map"
        title="From a claim to a test."
      >
        <div className="project-evidence__claim">
          <div>
            <h3>Does the input control protection?</h3>
            <p>
              Relate the reporter response to direct PspA or functional
              protection measurements. Published sensing and energetics results
              are supporting context. <Cite id="rubens" />
              <Cite id="wang" />
            </p>
          </div>
          <NextEvidence to="/experiments#readouts">Readouts</NextEvidence>
        </div>
        <div className="project-evidence__claim">
          <div>
            <h3>Do environmental states separate survival?</h3>
            <p>
              Compare viable cells in matched induced and uninduced conditions.
              A difference in optical density or illustration colour alone
              cannot answer this.
            </p>
          </div>
          <NextEvidence to="/experiments#experimental-controls">
            Controls
          </NextEvidence>
        </div>
        <div className="project-evidence__claim">
          <div>
            <h3>Is payload released and functional?</h3>
            <p>
              Combine intracellular and supernatant measurements of Elafin with
              an appropriate activity assessment. A previous EcN–Elafin study
              motivates the question. <Cite id="teng" />
            </p>
          </div>
          <NextEvidence to="/description#payload-design">
            Payload design
          </NextEvidence>
        </div>
        <div className="project-evidence__claim">
          <div>
            <h3>What happens after withdrawal?</h3>
            <p>
              Follow the time course, detection limit, residual survivors and
              recovery. Published protein-tag kinetics cannot provide this
              strain’s clearance time. <Cite id="andersen" />
            </p>
          </div>
          <NextEvidence to="/safety-and-security#containment">
            Containment
          </NextEvidence>
        </div>
      </Section>
      <Section
        id="result-reporting"
        label="Reporting"
        title="Make the result inspectable."
      >
        <p>
          Each published result should connect the question, comparison, figure,
          raw dataset and analysis. Replicates, units, uncertainty, exclusions
          and detection limits belong with the result. Supporting and
          non-supporting observations both inform the next design decision.
        </p>
        <p>
          The homepage’s anatomy and mechanism scenes are explanatory
          illustrations. Their colours, particle counts and timing are not
          experimental measurements.
        </p>
        <NextEvidence to="/model#model-parameters">
          How measurements inform the model
        </NextEvidence>
      </Section>
    </>
  );
}

function SafetyContent() {
  return (
    <>
      <Section
        id="containment"
        label="Containment design"
        title="An exit must be tested."
      >
        <p>
          LBP-Mototype proposes to constrain survival through a combination of
          chassis defects, ROS-responsive PspA complementation and environmental
          bile stress. Moving the stress outside the cell does not eliminate
          genetic adaptation, environmental variability or escape routes.
        </p>
        <p>
          The relevant evidence is a measured loss of viability under defined
          conditions, including the limits of detection and the behaviour of
          residual survivors. Complete clearance, zero escape and clinical
          safety are not established by the current design proposal.
        </p>
        <NextEvidence to="/experiments#validation-plan">
          See the verification plan
        </NextEvidence>
      </Section>
      <Section
        id="safety-questions"
        label="Risk questions"
        title="Inspect the weak points."
      >
        <details className="project-evidence__detail">
          <summary>Environmental variation</summary>
          <p>
            ROS and bile composition vary across intestinal locations and
            physiological states. A window measured in one medium or strain
            cannot be treated as universal. The relationship between bacteria
            and bile supplies background for testing this variability.{" "}
            <Cite id="begley" />
          </p>
        </details>
        <details className="project-evidence__detail">
          <summary>Genetic change and residual survivors</summary>
          <p>
            Mutations, compensatory responses, plasmid loss and population
            heterogeneity can change the control response. Examine survivors and
            recovery rather than relying solely on an average signal or a short
            endpoint.
          </p>
          <p>
            Biocontainment studies in other systems help frame these questions
            but do not validate EcN containment. <Cite id="hoffmann" />
          </p>
        </details>
        <details className="project-evidence__detail">
          <summary>Protein persistence and release</summary>
          <p>
            The remaining PspA pool may delay susceptibility after signal
            withdrawal. Tagged PspA function and turnover require direct
            assessment. Reporter-tag literature cannot establish the relevant
            lifetime. <Cite id="andersen" />
          </p>
          <p>
            Cell death can release remaining payload; it does not imply that all
            extracellular protein immediately disappears.
          </p>
        </details>
        <details className="project-evidence__detail">
          <summary>Chassis, transfer and selection markers</summary>
          <p>
            The parental strain’s history does not establish the safety of the
            engineered derivative. The proposal uses a low-copy plasmid and
            includes a selection marker for the MVP; marker-free operation is a
            later objective. Non-conjugative design alone does not demonstrate
            absence of horizontal transfer.
          </p>
        </details>
      </Section>
      <Section
        id="research-boundaries"
        label="Research boundary"
        title="Bench evidence comes first."
      >
        <p>
          The current programme concerns in vitro verification. The proposal
          discusses future animal studies and possible external interventions,
          but this wiki does not present them as validated treatment regimens.
          Previous preclinical EcN–Elafin findings likewise do not establish
          human efficacy for our design. <Cite id="teng" />
        </p>
        <p>
          Strain handling, containment, waste treatment and any later study must
          follow the institution’s approved procedures and applicable iGEM
          requirements. This page does not assert that approvals or
          institutional assessments have already been obtained.
        </p>
        <NextEvidence to="/results#evidence-status">
          View the evidence boundaries
        </NextEvidence>
      </Section>
    </>
  );
}

export function ProjectEvidencePage({ kind }: { kind: EvidenceKind }) {
  const pageIndex = PAGES.findIndex((page) => page.kind === kind);
  const next = PAGES[(pageIndex + 1) % PAGES.length];
  const Content = {
    design: DesignContent,
    experiments: ExperimentsContent,
    model: ModelContent,
    results: ResultsContent,
    safety: SafetyContent,
  }[kind];
  return (
    <article className="project-evidence" data-evidence-page={kind}>
      <nav
        className="project-evidence__nav"
        aria-label="Project evidence chapters"
      >
        {PAGES.map((page) => (
          <Link
            key={page.kind}
            to={page.path}
            aria-current={page.kind === kind ? "page" : undefined}
          >
            {page.label}
          </Link>
        ))}
      </nav>
      <Content />
      <section id="references" className="project-evidence__references">
        <span className="project-evidence__eyebrow">Trace the sources</span>
        <h2>References.</h2>
        <p>
          Design basis: SYPHU-China project proposal VER16.9 · 28 August 2026.
          Published studies below support individual design questions; their
          findings retain their original experimental scope.
        </p>
        <ol>
          {LITERATURE.filter((paper) => PAGE_REFS[kind].includes(paper.id)).map(
            (paper) => (
              <li key={paper.id} id={`ref-${paper.id}`}>
                <span>[{paper.ref}]</span>
                <div>
                  <strong>{paper.title}</strong>
                  <small>
                    {paper.author} · {paper.year}
                  </small>
                  <a
                    href={paper.source}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    DOI ↗
                  </a>
                </div>
              </li>
            ),
          )}
        </ol>
      </section>
      <nav className="project-evidence__end" aria-label="Continue exploring">
        <Link to="/#laboratory">Return to laboratory ↙</Link>
        <Link to={next.path}>Continue to {next.label} ↗</Link>
      </nav>
    </article>
  );
}
