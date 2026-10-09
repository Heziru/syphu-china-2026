import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { assetUrl } from "../../utils/assetUrl";
import { ResearchPageShell } from "../../components/ResearchPageShell";
import {
  Cite,
  CodeBlock,
  DataTable,
  Equation,
  Figure,
  M,
  References,
} from "./ResearchPrimitives";
import { researchAsset } from "./researchAssets";
import DataSourcesSection from "./DataSourcesSection";
import AdhesionSection from "./AdhesionSection";
import AtomisticSection from "./AtomisticSection";
import StructureViewer from "./ResearchStructureViewer";
import "./research.css";

const chapters = [
  ["overview", "Overview"],
  ["structure", "1. Elafin structure"],
  ["atomistic", "2. Docking & dynamics"],
  ["binding", "3. Binding kinetics"],
  ["community", "4. Ecological persistence"],
  ["transport", "5. Spatial delivery"],
  ["adhesion", "6. Mucosal retention"],
  ["sensitivity", "7. Uncertainty & verification"],
  ["experiments", "8. Experimental decisions"],
  ["evidence", "Evidence audit"],
  ["data-sources", "Data sources"],
  ["code", "Code & data"],
  ["references", "References"],
];

export default function DryLabPage() {
  const { hash } = useLocation();
  useEffect(() => {
    if (!hash) return;
    const frame = requestAnimationFrame(() =>
      document
        .getElementById(decodeURIComponent(hash.slice(1)))
        ?.scrollIntoView(),
    );
    return () => cancelAnimationFrame(frame);
  }, [hash]);
  return (
    <ResearchPageShell
      title="Model"
      eyebrow="DRY LAB / MODEL"
      subtitle="Elafin delivery by a living system."
      description="From molecular binding to ecological persistence and spatial transport."
      contents={chapters.map(([id, title]) => [id, title] as const)}
      className="research-page"
    >
          <section id="overview">
            <h2>Overview</h2>
            <p>
              Our design combines constitutive Elafin expression with a proposed
              ROS-responsive PspA support mechanism in engineered{" "}
              <em>Escherichia coli</em> Nissle 1917 (EcN). The central modeling
              question is whether a local change in bacterial persistence could
              sustain extracellular Elafin in a competitive, clearing
              environment. Answering it requires more than a protein structure
              or a single growth curve.
            </p>
            <p>
              We therefore examine four connected scales: the deposited
              structures of Elafin, its reversible binding to elastase, the
              persistence of EcN among resident organisms, and the transport of
              released protein away from its source. Each module has an explicit
              input, a calculation and an experimental consequence. The binding
              constants come from published purified-protein measurements; the
              ecological and transport parameters are uncalibrated scenarios. We
              do not convert these scenarios into a therapeutic dose.
            </p>
            <figure className="research-figure" id="fig-1">
              <a href={assetUrl("assets/dry-lab/illustrations/model-overview.png")} target="_blank" rel="noreferrer" aria-label="Open model overview at full size">
                <img src={assetUrl("assets/dry-lab/illustrations/model-overview.png")} width="1774" height="887"
                  alt="Model overview connecting intestinal residence, stress-responsive support, independent Elafin production and local exposure." />
              </a>
              <figcaption><strong>Figure 1. From a living cell to local protein delivery.</strong>{" "}
                Project-specific conceptual illustration, created with Image and reviewed against VER16.9.
                Dashed relations require measurement; binding is an independent reference calculation until local concentration is calibrated.
              </figcaption>
              <div className="research-figure-files">
                <a href={assetUrl("assets/dry-lab/illustrations/model-overview.png")} target="_blank" rel="noreferrer">Full size ↗</a>
                <a href={assetUrl("assets/dry-lab/illustrations/model-overview.png")} download>PNG</a>
                <a href={assetUrl("assets/dry-lab/illustrations/overview-prompt.txt")} download>Illustration prompt</a>
              </div>
            </figure>
            <h3>What is being modeled?</h3>
            <p>
              The current VER16.9 design uses a <em>ΔacrB / ΔpspA</em> chassis
              and proposes pKatG/OxyR-driven PspA complementation. Elafin and
              sfGFP are co-expressed from separate constitutive cassettes on the
              same plasmid. VER16.9 names J23100 for sfGFP and leaves the Elafin
              promoter unspecified. The design describes background release,
              membrane-damage-associated leakage and terminal lysis as possible
              routes into the extracellular space. It does not establish a
              validated secretion system. This distinction determines how the
              source term is written below.{" "}
              <Link to="/design">See the project design.</Link>
            </p>
            <figure className="research-figure" id="project-pathway">
              <a href={assetUrl("assets/dry-lab/illustrations/project-pathway.svg")} target="_blank" rel="noreferrer" aria-label="Open project pathway at full size">
                <img src={assetUrl("assets/dry-lab/illustrations/project-pathway.svg")} width="1500" height="1030"
                  alt="The ROS–OxyR–pKatG–PspA branch and independent constitutive Elafin production inside EcN. Dashed arrows indicate unmeasured support and release." loading="lazy" />
              </a>
              <figcaption><strong>Figure 1b. The project pathway and its evidence boundaries.</strong>{" "}
                PspA and the co-transcribed mCherry reporter belong to the stress-responsive branch.
                Elafin is produced independently; sfGFP is a separate constitutive reporter cassette, omitted for clarity.
                No secretion machinery is assumed. The extracellular binding relation is supported by purified-protein kinetics.
                <Cite id="ying-simon-1993" />
              </figcaption>
              <div className="research-figure-files">
                <a href={assetUrl("assets/dry-lab/illustrations/project-pathway.svg")} target="_blank" rel="noreferrer">Full size ↗</a>
                <a href={assetUrl("assets/dry-lab/illustrations/project-pathway.svg")} download>Editable SVG</a>
                <a href={assetUrl("assets/dry-lab/illustrations/draw_pathway.py")} download>Diagram source</a>
              </div>
            </figure>
            <DataTable
              caption="Table 1. Questions and evidence used in this analysis."
              headers={["Module", "Input", "Output and scope"]}
              rows={[
                [
                  "Structure",
                  "Deposited PDB coordinates; UniProt annotation",
                  "Ensemble dispersion and geometric contacts in experimental structures.",
                ],
                [
                  "Docking and dynamics",
                  "1FLE bound chains; human NE from 2Z7F; mature Elafin from 2REL",
                  "Redocking validation, exploratory human-complex poses and an isolated-Elafin MD pilot; no affinity prediction.",
                ],
                [
                  "Binding",
                  "Published association/dissociation constants",
                  "Mass-conserving reference-buffer binding curves; assumed total concentrations.",
                ],
                [
                  "Ecology",
                  "Current circuit logic; assumed growth and interaction terms",
                  "Invasion threshold, coexistence and pulse responses; no inferred microbiome interactions.",
                ],
                [
                  "Transport",
                  "Relative extracellular source; assumed dimensionless groups",
                  "Spatial profiles and source–loss balance; no tissue concentration calibration.",
                ],
                [
                  "Mucosal retention",
                  "Chip-scale geometry; assumed attachment, detachment and mucus renewal",
                  "Conserved cell fates and cumulative residence; no measured colonization duration.",
                ],
              ]}
            />
          </section>
          <section id="structure">
            <h2>1. Elafin structure and the inhibitory interface</h2>
            <h3>1.1 Structural identity before structural interpretation</h3>
            <p>
              Human PI3 encodes a 117-residue precursor. The annotated mature
              Elafin peptide is residues 61–117, or 57 residues when renumbered
              from its mature N-terminus. The WAP domain spans precursor
              residues 69–117, corresponding to mature residues 9–57. Four
              annotated disulfide bonds connect precursor residues 76–105,
              83–109, 92–104 and 98–113.
              <Cite id="uniprot-p19957" /> These boundaries must be
              distinguished from whichever residues are resolved in a structure.
            </p>
            <p>
              We use two complementary experimental records. PDB 2REL contains
              11 deposited NMR conformers of the 57-residue recombinant human
              peptide.
              <Cite id="pdb-2rel" /> PDB 1FLE is a 1.90 Å crystal structure of
              human Elafin bound to <strong>porcine pancreatic elastase</strong>
              ; the Elafin chain resolves mature residues 11–57.
              <Cite id="tsunemi-1996" /> The complex is useful for inspecting an
              experimental inhibitory interface, but its enzyme is not human
              neutrophil elastase and it is not a docking pose generated by this
              project.
            </p>
            <h3>1.2 Aligning the NMR ensemble</h3>
            <p>
              Translation and rotation obscure meaningful comparisons between
              coordinate sets. For every unique pair of conformers, we center
              matched Cα positions and use a proper-rotation Kabsch fit. The
              objective is
            </p>
            <Equation
              n={1}
            >{String.raw`\operatorname{RMSD}_{ab}=\min_{R\in SO(3),\,t}\sqrt{\frac{1}{N}\sum_{i=1}^{N}\left\|R\mathbf r_i^{(a)}+t-\mathbf r_i^{(b)}\right\|^2}.`}</Equation>
            <p>
              We repeat the fit over all 57 residues and over the annotated WAP
              domain, residues 9–57. To describe where the ensemble differs, we
              align the conformers to an iteratively refined consensus and
              calculate residue-wise coordinate dispersion:
            </p>
            <Equation
              n={2}
            >{String.raw`d_i=\sqrt{\frac{1}{M}\sum_{m=1}^{M}\left\|\widetilde{\mathbf r}_{mi}-\overline{\mathbf r}_i\right\|^2},\qquad M=11.`}</Equation>
            <Figure
              n={2}
              file="structure-nmr-ensemble"
              title="Coordinate variation across the deposited Elafin NMR ensemble."
              data="2rel-pairwise-rmsd.csv"
            >
              The aligned conformers, pairwise RMSD matrix, per-residue
              dispersion and fitting-domain comparison are calculated from 2REL.
              There are 55 unique conformer pairs. Ensemble dispersion reflects
              differences among deposited models, not a molecular-dynamics
              trajectory or a time-dependent RMSF measurement.
            </Figure>
            <p>
              The mean pairwise Cα RMSD is <strong>3.429 Å</strong> for the full
              peptide and <strong>2.461 Å</strong> for WAP-domain-only alignment
              and scoring. After WAP alignment, mean dispersion is 5.727 Å in
              residues 1–8 and 1.534 Å within residues 9–57. The larger
              N-terminal spread makes the fitting region consequential. These
              values quantify this coordinate ensemble; they neither measure an
              in-vivo fluctuation rate nor prove the folding quality of our
              engineered product.
            </p>
            <h3>1.3 Resolving contacts in the experimental complex</h3>
            <p>
              For each Elafin residue <M>{"i"}</M> and elastase residue{" "}
              <M>{"j"}</M>, we calculate the minimum distance between their
              protein heavy atoms, excluding solvent and hydrogen atoms:
            </p>
            <Equation
              n={3}
            >{String.raw`D_{ij}=\min_{a\in i,\,b\in j}\|\mathbf r_a-\mathbf r_b\|,\qquad A_{ij}(d_c)=\mathbb 1[D_{ij}<d_c].`}</Equation>
            <Figure
              n={3}
              file="structure-interface"
              title="The 1FLE interface, from atomic geometry to a contact map."
              data="1fle-residue-contacts-under-6A.csv"
            >
              Cartoon and stick views use deposited atomic coordinates and
              secondary-structure annotations. The interface heatmap reports
              minimum heavy-atom distances; the cutoff sweep tests how a contact
              count changes with the distance definition. Chain I is human
              Elafin; chain E is porcine pancreatic elastase. Dashed
              atom-to-atom distances are geometric contacts, not automatically
              hydrogen bonds or binding energies.
            </Figure>
            <p>
              A strict cutoff of <M>{String.raw`d_c=4\,\text{Å}`}</M> gives{" "}
              <strong>40 distinct residue pairs</strong>, involving 14 Elafin
              residues and 22 enzyme residues. The shortest recorded pair is
              Elafin Arg31 NH2 to elastase Asp97 OD2 at 1.988 Å. Such a short
              distance merits attention to local geometry and refinement; we do
              not convert it into an affinity or classify every contact as
              favorable. The full distance matrix is available alongside the
              thresholded analysis.
            </p>
            <div className="research-structure" id="structure-3d">
              <h3>Elafin in three dimensions</h3>
              <StructureViewer />
            </div>
            <p>
              <strong>Design implication.</strong> Sequence identity, processing
              and disulfide-compatible folding should be checked before activity
              is inferred from expression. The structural analysis also
              establishes what our existing files cannot answer: 2Z7F contains
              SLPI rather than Elafin, so its molecular-dynamics trajectory
              cannot validate the Elafin construct. We therefore evaluate new
              docking poses separately from an isolated-Elafin dynamics pilot.
              Dynamics of a human-elastase–Elafin complex would additionally
              require a defensible binding pose.
            </p>
            <CodeBlock
              title="Coordinate analysis: inspect the fitting calculation"
              file="analyze_structures.py"
            >{`# Each pair is fit independently; NMR model number is not time.
P0 = P - P.mean(axis=0)
Q0 = Q - Q.mean(axis=0)
U, singular_values, Vt = np.linalg.svd(P0.T @ Q0)
handedness = np.diag([1, 1, np.linalg.det(U @ Vt)])
R = U @ handedness @ Vt
rmsd = np.sqrt(np.mean(np.sum((P0 @ R - Q0)**2, axis=1)))`}</CodeBlock>
          </section>
          <AtomisticSection />
          <section id="binding">
            <h2>3. Binding kinetics under mass conservation</h2>
            <h3>3.1 Why affinity alone is insufficient</h3>
            <p>
              An inhibitor cannot bind more enzyme molecules than the number of
              inhibitor molecules available. This becomes important when Elafin
              and elastase are present at comparable concentrations. We
              therefore retain both total-protein mass balances instead of
              treating free Elafin as an unlimited reservoir.
            </p>
            <p>
              Ying and Simon measured reversible Elafin binding to human
              leukocyte elastase.
              <Cite id="ying-simon-1993" /> For a reference calculation at pH
              8.0 and 25 °C, we use their reported association and dissociation
              rates. The enzyme concentrations below are deliberately chosen
              scenarios, not measured gut concentrations.
            </p>
            <DataTable
              caption="Table 2. Binding parameters and their provenance."
              headers={["Quantity", "Value", "Basis"]}
              rows={[
                [
                  <M>{String.raw`k_{\mathrm{on}}`}</M>,
                  <M>{String.raw`0.216\;\mathrm{nM}^{-1}\mathrm{min}^{-1}`}</M>,
                  "Published 3.6 × 10⁶ M⁻¹ s⁻¹; pH 8.0, 25 °C.",
                ],
                [
                  <M>{String.raw`k_{\mathrm{off}}`}</M>,
                  <M>{String.raw`0.036\;\mathrm{min}^{-1}`}</M>,
                  "Published 6.0 × 10⁻⁴ s⁻¹; complex dissociation.",
                ],
                [
                  <M>{"K_D"}</M>,
                  "0.1667 nM",
                  "Calculated as koff / kon from the reported rates.",
                ],
                [
                  <M>{"E_T"}</M>,
                  "0.1, 1 and 10 nM",
                  "Chosen total-enzyme scenarios.",
                ],
                [
                  <M>{"I_T"}</M>,
                  "0.01–100 nM for the isotherms",
                  "Chosen total-inhibitor scan.",
                ],
              ]}
            />
            <h3>3.2 Deriving the tight-binding solution</h3>
            <p>
              Let <M>{"E"}</M> and <M>{"I"}</M> denote free enzyme and free
              Elafin, and <M>{"B"}</M> the complex. In a closed, well-mixed
              volume with a single reversible binding site, <M>{"E=E_T-B"}</M>{" "}
              and <M>{"I=I_T-B"}</M>. Mass action gives
            </p>
            <Equation
              n={4}
            >{String.raw`E+I\;\mathop{\rightleftharpoons}^{k_{\mathrm{on}}}_{k_{\mathrm{off}}}\;B,\qquad \frac{dB}{dt}=k_{\mathrm{on}}(E_T-B)(I_T-B)-k_{\mathrm{off}}B.`}</Equation>
            <p>
              Setting the derivative to zero gives a quadratic. The physically
              admissible root is the smaller root, bounded by both total
              concentrations. We evaluate its rationalized form to avoid
              subtracting nearly equal floating-point numbers:
            </p>
            <Equation
              n={5}
            >{String.raw`B_{\mathrm{eq}}=\frac{2E_TI_T}{E_T+I_T+K_D+\sqrt{(E_T+I_T+K_D)^2-4E_TI_T}}.`}</Equation>
            <p>
              Substituting <M>{String.raw`B_{\mathrm{eq}}=E_T/2`}</M> yields a
              simple experimental consequence:
            </p>
            <Equation n={6}>{String.raw`I_{T,50}=\frac{E_T}{2}+K_D.`}</Equation>
            <p>
              This is the total inhibitor required for half the enzyme to be
              bound in this binding model. It is not a substrate-dependent
              activity-assay IC50. The inhibitor-excess approximation,{" "}
              <M>{String.raw`B/E_T\approx I_T/(K_D+I_T)`}</M>, drops the
              depletion term and becomes misleading when a substantial fraction
              of total inhibitor is bound.
            </p>
            <Figure
              n={4}
              file="06-binding-kinetics"
              title="Reference-buffer kinetics and the stoichiometric limit of binding."
              data="binding-trajectories.csv"
            >
              (A) Association at 1 nM total enzyme with three chosen Elafin
              totals. Dotted lines show the analytic equilibria. (B) Exact
              isotherms compared with the inhibitor-excess approximation. (C)
              Equilibrium bound fraction as a function of total-protein ratios.
              (D) First-order complex decay in the ideal limit of continuously
              suppressed rebinding. All panels use the same published rate
              constants; none is an experimental curve from this project.
            </Figure>
            <p>
              At <M>{String.raw`E_T=I_T=1\;\mathrm{nM}`}</M>, the equilibrium
              bound fraction is <strong>66.7%</strong>, rather than the 85.7%
              predicted by the inhibitor-excess approximation. Raising the
              chosen Elafin total to 4 nM gives 94.8% binding; lowering it to
              0.25 nM gives 20.7%. For 1 nM total enzyme, equation (6) gives
              0.667 nM total inhibitor at half binding. These results show why
              an activity experiment must record enzyme and inhibitor totals
              together.
            </p>
            <p>
              When released inhibitor is continuously removed so that rebinding
              is suppressed,{" "}
              <M>{String.raw`B(t)=B(0)e^{-k_{\mathrm{off}}t}`}</M>, giving a
              derived half-time of <strong>19.25 min</strong>. This is a
              dissociation timescale in the reference conditions. It is neither
              the degradation half-life of free Elafin nor a prediction of its
              residence time in intestinal mucus.
            </p>
            <p>
              <strong>Design implication.</strong> Measure active protein using
              a defined enzyme concentration and a substrate-based inhibition
              assay, alongside protein abundance. The current model omits
              competing substrate and does not connect normalized extracellular
              source strength to nM. Establishing that conversion is necessary
              before this module can be coupled quantitatively to tissue
              transport.
            </p>
            <CodeBlock
              title="Binding calculation: the mass-conserving equilibrium"
              file="binding_kinetics.py"
            >{`kon = 3.6e6 * 1e-9 * 60  # nM^-1 min^-1
koff = 6.0e-4 * 60       # min^-1
KD = koff / kon
S = E_total + I_total + KD
B_equilibrium = 2 * E_total * I_total / (
    S + np.sqrt(S**2 - 4 * E_total * I_total)
)`}</CodeBlock>
          </section>
          <section id="community">
            <h2>4. Ecological persistence under conditional support</h2>
            <h3>4.1 From circuit logic to population dynamics</h3>
            <p>
              Improved stress tolerance is useful only if it matters in the
              community where the strain is introduced. We use a two-population
              competition model to ask when a rare EcN population can grow in an
              established resident community. Generalized Lotka–Volterra models
              provide a tractable starting point for such questions,
              <Cite id="stein-2013" /> while measured monoculture and co-culture
              time series are needed to infer actual interaction coefficients.
              <Cite id="venturelli-2018" />
            </p>
            <p>
              Here <M>{"x"}</M> is normalized engineered-EcN abundance,{" "}
              <M>{"y"}</M> is a normalized resident aggregate, <M>{"p"}</M> is a
              proposed PspA-related support state, and <M>{"L"}</M> is relative
              extracellular Elafin in a well-mixed comparison compartment. Each
              population is normalized to its own carrying scale; the abundances
              do not sum to one. The resident aggregate is a modeling
              simplification, not an identified taxon. Time{" "}
              <M>{String.raw`\tau`}</M> is dimensionless. The imposed ROS input
              is <M>{String.raw`u=1`}</M> until <M>{String.raw`\tau=8`}</M> and
              zero afterward.
            </p>
            <Equation n={7}>{String.raw`\begin{aligned}
\frac{dx}{d\tau}&=x\left[r_E(1-x-\alpha y)-w_E-\frac{\sigma}{1+\gamma p}\right],\\
\frac{dy}{d\tau}&=y\left[r_R(1-y-\beta x)-w_R\right],\\
\frac{dp}{d\tau}&=\kappa(u-p),\\
\frac{dL}{d\tau}&=qx-k_L L.
\end{aligned}`}</Equation>
            <p>
              Competition acts through <M>{String.raw`\alpha`}</M> and{" "}
              <M>{String.raw`\beta`}</M>; washout and basal stress reduce
              growth. We hypothesize that support decreases the stress-loss term
              through <M>{String.raw`\sigma/(1+\gamma p)`}</M>. This saturating
              form is an assumption to test, not a measured PspA response law.
              The effective extracellular release coefficient <M>{"q"}</M> is
              held constant in the baseline model. It is not a ROS-controlled
              Elafin promoter and does not claim constitutive secretion.
            </p>
            <DataTable
              caption="Table 3. Baseline ecological scenario; every value is assumed, not fitted."
              headers={["Symbol", "Meaning", "Value"]}
              rows={[
                [
                  <M>{String.raw`r_E,\;r_R`}</M>,
                  "Growth scales per unit model time",
                  "1.0, 0.8",
                ],
                [
                  <M>{String.raw`\alpha,\;\beta`}</M>,
                  "Resident effect on EcN; EcN effect on residents",
                  "0.8, 0.25",
                ],
                [
                  <M>{String.raw`w_E,\;w_R`}</M>,
                  "Population loss rates",
                  "0.10, 0.10",
                ],
                [
                  <M>{String.raw`\sigma,\;\gamma`}</M>,
                  "Baseline stress loss; support strength",
                  "0.35, 2.0",
                ],
                [
                  <M>{String.raw`\kappa`}</M>,
                  "Support-state response rate",
                  "0.8",
                ],
                [
                  <M>{String.raw`q,\;k_L`}</M>,
                  "Effective release; well-mixed protein loss",
                  "0.30, 0.50",
                ],
                [
                  <M>{String.raw`(x_0,y_0,p_0,L_0)`}</M>,
                  "Initial state",
                  "(0.08, 0.80, 0, 0)",
                ],
              ]}
            />
            <h3>4.2 Deriving an invasion criterion</h3>
            <p>
              With support held constant, define effective carrying-capacity
              terms <M>{"A(p)"}</M> and <M>{"B_R"}</M>. At the resident-only
              equilibrium, <M>{"x=0"}</M> and <M>{"y=B_R"}</M>. Linearizing the
              EcN equation at this state gives
            </p>
            <Equation n={8}>{String.raw`\begin{aligned}
A(p)&=1-\frac{w_E+\sigma/(1+\gamma p)}{r_E},\qquad B_R=1-\frac{w_R}{r_R},\\
\lambda_{\mathrm{inv}}(p)&=r_E\left[A(p)-\alpha B_R\right].
\end{aligned}`}</Equation>
            <p>
              A positive eigenvalue permits growth of a rare invader; a negative
              one implies decay near that resident equilibrium. Solving{" "}
              <M>{String.raw`\lambda_{\mathrm{inv}}=0`}</M> for support gives
              the threshold
            </p>
            <Equation
              n={9}
            >{String.raw`p_c=\frac{\sigma/G-1}{\gamma},\qquad G=r_E(1-\alpha B_R)-w_E.`}</Equation>
            <p>
              This expression requires <M>{String.raw`G>0`}</M> and{" "}
              <M>{String.raw`\gamma>0`}</M>. An interior, reachable threshold
              also requires <M>{"0<p_c<1"}</M>. If <M>{String.raw`G\leq0`}</M>,
              even removal of the stress term cannot give positive invasion
              growth. If <M>{String.raw`G>\sigma`}</M>, support is unnecessary
              for invasion under these assumptions. Thus stronger support does
              not compensate arbitrarily for competition or washout.
            </p>
            <h3>4.3 Coexistence and stability</h3>
            <p>
              Solving the two zero-growth lines gives a candidate coexistence
              equilibrium. Its biological relevance requires both populations to
              be positive. At that equilibrium the Jacobian determinant and
              trace are
            </p>
            <Equation n={10}>{String.raw`\begin{aligned}
x^*&=\frac{A-\alpha B_R}{1-\alpha\beta},\qquad y^*=\frac{B_R-\beta A}{1-\alpha\beta},\\
\det J&=r_Er_Rx^*y^*(1-\alpha\beta),\qquad \operatorname{tr}J=-r_Ex^*-r_Ry^*.
\end{aligned}`}</Equation>
            <p>
              For positive <M>{"x^*,y^*"}</M> and{" "}
              <M>{String.raw`\alpha\beta<1`}</M>, the equilibrium is locally
              stable. If each population can invade the other’s
              single-population state, coexistence is possible; if neither can
              invade, a priority effect can make the outcome depend on initial
              abundance. These regimes are different from a single “support
              works” outcome.
            </p>
            <Figure
              n={5}
              file="01-ecological-landscape"
              title="Competition determines when conditional support can change persistence."
              data="invasion-plane.csv"
            >
              (A) Rare-EcN invasion rate over competition and assumed support
              strength. (B) Long-time EcN abundance under constant support. (C)
              Four competition regimes. (D) The finite ROS pulse and support-off
              control. Constant-support equilibria and transient pulse responses
              are separate calculations; the pulse does not establish an
              equilibrium.
            </Figure>
            <p>
              For the baseline scenario, the resident-only abundance is{" "}
              <strong>0.875</strong>, the critical support is{" "}
              <strong>0.375</strong>, and sustained maximal support gives an
              invasion rate of <strong>0.0833</strong> per unit model time. The
              stable coexistence point is{" "}
              <M>{String.raw`(x^*,y^*)=(0.1042,0.8490)`}</M>. These are
              consequences of the chosen coefficients. They are not measurements
              of EcN abundance in the gut.
            </p>
            <h3>4.4 The memory of a transient input</h3>
            <p>
              After the input is removed, the support state decays continuously
              rather than switching off immediately. For a pulse ending at{" "}
              <M>{String.raw`\tau_s=8`}</M>, its exact solution gives
            </p>
            <Equation
              n={11}
            >{String.raw`p(\tau)=p(\tau_s)e^{-\kappa(\tau-\tau_s)},\qquad \tau_c=\tau_s+\frac{1}{\kappa}\ln\!\frac{p(\tau_s)}{p_c}.`}</Equation>
            <p>
              The baseline state crosses the rare-invasion threshold at{" "}
              <M>{String.raw`\tau_c=9.224`}</M>. This is{" "}
              <strong>not a clearance time</strong>: the criterion was derived
              for a rare population at a resident-only equilibrium. Finite
              populations and resident transients require the full differential
              equations. At <M>{String.raw`\tau=24`}</M>, the simulated EcN
              abundance is 0.00792 with the support pulse and 0.00166 in the
              support-off control. A small positive deterministic abundance also
              does not establish biological clearance or biocontainment.
            </p>
            <p>
              <strong>Design implication.</strong> Measure the post-input
              decline of viable EcN and the support state separately. Fixed
              pairwise interactions can miss resource mediation and context
              dependence,
              <Cite id="momeni-2017" /> so the resident aggregate should be
              replaced by measured strain-resolved interactions before
              predicting a real community.
            </p>
          </section>

          <section id="transport">
            <h2>5. From a bacterial source to spatial protein delivery</h2>
            <h3>5.1 A minimal diffusion–clearance model</h3>
            <p>
              The well-mixed variable <M>{"L"}</M> cannot tell us whether
              released protein reaches a distant interface. To ask that
              question, we replace the comparison compartment with a
              one-dimensional layer of thickness <M>{"H"}</M>. Protein diffuses
              with effective coefficient <M>{"D"}</M>, is lost at rate{" "}
              <M>{"k"}</M>, enters at one side with flux <M>{"J(t)"}</M>, and
              leaves the opposite side through a Robin boundary with transfer
              coefficient <M>{"h"}</M>:
            </p>
            <Equation n={12}>{String.raw`\begin{aligned}
\frac{\partial C}{\partial t}&=D\frac{\partial^2 C}{\partial z^2}-kC,\quad 0<z<H,\\
-D C_z(0,t)&=J(t),\qquad -D C_z(H,t)=hC(H,t),\qquad C(z,0)=0.
\end{aligned}`}</Equation>
            <p>
              The layer is homogeneous, diffusion is Fickian and the source is
              laterally averaged. Convection, reversible mucus binding,
              spatially varying proteolysis and substrate binding are omitted.
              Hydrodynamic protein size can inform diffusion estimates in water,
              <Cite id="brune-kim-1993" /> but a water estimate is not an Elafin
              diffusion coefficient in intestinal mucus. We therefore analyze
              dimensionless groups rather than choose unsupported tissue
              constants.
            </p>
            <h3>5.2 Nondimensionalization and the source coupling</h3>
            <p>
              Let <M>{"t_E"}</M> be the ecological time scale and{" "}
              <M>{String.raw`J_{\mathrm{ref}}`}</M> a reference flux. Define
            </p>
            <Equation n={13}>{String.raw`\begin{gathered}
\xi=\frac{z}{H},\quad \tau=\frac{t}{t_E},\quad c=\frac{CD}{J_{\mathrm{ref}}H},\quad j=\frac{J}{J_{\mathrm{ref}}},\\
\mathrm{Da}=\frac{kH^2}{D},\qquad \mathrm{Bi}=\frac{hH}{D},\qquad \delta=\frac{Dt_E}{H^2}.
\end{gathered}`}</Equation>
            <p>
              The Damköhler number compares loss and diffusion, the Biot-type
              transfer number compares boundary transfer and diffusion, and{" "}
              <M>{String.raw`\delta`}</M> compares the ecological and diffusion
              timescales. The dimensionless system is
            </p>
            <Equation n={14}>{String.raw`\begin{aligned}
c_\tau&=\delta(c_{\xi\xi}-\mathrm{Da}\,c),\\
-c_\xi(0,\tau)&=j(\tau)=qx(\tau),\qquad -c_\xi(1,\tau)=\mathrm{Bi}\,c(1,\tau).
\end{aligned}`}</Equation>
            <p>
              The coupling uses <M>{"x"}</M> from the ecological model and the
              same baseline assumption of constant effective release. The
              spatial model is an alternative description of extracellular
              protein; the well-mixed <M>{"L"}</M> compartment is not added
              again as a second source or loss term.
            </p>
            <DataTable
              caption="Table 4. Transport scenarios and numerical settings."
              headers={["Quantity", "Setting", "Interpretation"]}
              rows={[
                [
                  <M>{String.raw`\mathrm{Da},\;\mathrm{Bi},\;\delta`}</M>,
                  "1, 1, 1",
                  "Assumed dimensionless baseline.",
                ],
                [
                  "Transport parameter scan",
                  "Da and Bi: 0.03–30; 101 × 101 grid",
                  "Hypothesis space, not a measured physiological interval.",
                ],
                [
                  "Spatial grid",
                  "120 finite-volume cells",
                  "Verified against 15–480 cells.",
                ],
                [
                  "Time step",
                  "Δτ = 0.02",
                  "Verified against finer steps and a smooth exact solution.",
                ],
                [
                  "Source",
                  "j = qx; q = 0.3",
                  "Relative extracellular release, not an absolute secretion rate.",
                ],
              ]}
            />
            <h3>5.3 An analytic benchmark</h3>
            <p>
              For constant input <M>{"j"}</M>, the steady problem is linear.
              Solving the two boundary conditions gives a closed form with{" "}
              <M>{String.raw`s=\sqrt{\mathrm{Da}}`}</M>:
            </p>
            <Equation
              n={15}
            >{String.raw`c^*(\xi)=j\frac{\cosh[s(1-\xi)]+(\mathrm{Bi}/s)\sinh[s(1-\xi)]}{s\sinh s+\mathrm{Bi}\cosh s}.`}</Equation>
            <p>
              This solution provides an independent benchmark for the spatial
              solver. For zero domain loss and positive boundary transfer, the
              limit is <M>{String.raw`c^*=j(1-\xi+1/\mathrm{Bi})`}</M>. If both
              loss and boundary transfer vanish under a positive source, no
              finite steady state exists. These limiting cases help detect
              boundary-condition errors.
            </p>
            <Figure
              n={6}
              file="03-spatial-transport"
              title="Time and position jointly determine relative Elafin exposure."
              data="spatial-profiles.csv"
            >
              The source–profile calculation includes a spatial–temporal
              heatmap, selected concentration profiles, boundary behavior and
              source/output comparison. The source comes from the finite
              ecological input scenario. Concentration and time are
              dimensionless; the curves do not establish a therapeutic threshold
              or a clinical delivery time.
            </Figure>
            <h3>5.4 Conservation and competing routes of loss</h3>
            <p>
              Integrating across the layer makes the balance between
              accumulation, input, distal outflow and internal loss explicit:
            </p>
            <Equation
              n={16}
            >{String.raw`\frac{1}{\delta}\frac{d}{d\tau}\int_0^1c\,d\xi=j-\mathrm{Bi}\,c(1,\tau)-\mathrm{Da}\int_0^1c\,d\xi.`}</Equation>
            <p>
              At steady state, the fraction of incoming flux leaving through the
              distal boundary is
            </p>
            <Equation
              n={17}
            >{String.raw`F_{\mathrm{out}}=\frac{\mathrm{Bi}\,c^*(1)}{j}=\frac{\mathrm{Bi}}{\sqrt{\mathrm{Da}}\sinh\sqrt{\mathrm{Da}}+\mathrm{Bi}\cosh\sqrt{\mathrm{Da}}}.`}</Equation>
            <Figure
              n={7}
              file="04-transport-landscape"
              title="Diffusion, internal loss and boundary transfer define different delivery regimes."
              data="transport-parameter-surface.csv"
            >
              Analytic parameter surfaces and contour maps vary Da and Bi
              independently. Higher distal transfer can lower boundary
              concentration even while increasing outflow. The plotted response
              surface is a model calculation, not a measured three-dimensional
              tissue concentration map.
            </Figure>
            <p>
              At <M>{String.raw`\mathrm{Da}=\mathrm{Bi}=1`}</M>, equation (17)
              yields <M>{String.raw`F_{\mathrm{out}}=e^{-1}=0.3679`}</M>. The
              remaining 0.6321 of steady incoming flux is removed within the
              layer. In the transient baseline, integrated distal outflow is
              0.13540 with the support pulse and 0.05040 without it. This
              difference follows from the assumed constant-release law; the next
              section tests that assumption explicitly.
            </p>
            <p>
              <strong>Design implication.</strong> A high source flux is not
              interchangeable with a high concentration at the target boundary.
              Measuring extracellular release, protein loss and effective
              transport is necessary to determine which limitation dominates.
              Distal outflow here is simply a mathematical boundary flux, not
              epithelial uptake or treatment efficacy.
            </p>
          </section>

          <AdhesionSection />
          <section id="sensitivity">
            <h2>
              7. Uncertainty, alternative mechanisms and numerical verification
            </h2>
            <h3>7.1 Which measurements would reduce uncertainty?</h3>
            <p>
              We sampled 512 parameter sets using a Latin-hypercube design with
              independent uniform ranges, repeating each set with and without
              the support input. The seed is 20261008. The three outputs are EcN
              abundance integrated over model time 0–24, relative well-mixed
              Elafin over the same interval, and EcN abundance at time 24. These
              ranges define an exploratory design space; they are not posterior
              distributions or biological confidence intervals.
            </p>
            <DataTable
              caption="Table 5. Assumed ranges for the global parameter analysis."
              headers={["Parameter", "Range", "Question tested"]}
              rows={[
                [
                  <M>{String.raw`\alpha`}</M>,
                  "0.35–1.25",
                  "How strongly do residents limit EcN?",
                ],
                [
                  <M>{String.raw`\beta`}</M>,
                  "0.10–0.60",
                  "How strongly does EcN alter residents?",
                ],
                [
                  <M>{String.raw`\sigma`}</M>,
                  "0.20–0.50",
                  "How large is unsupported stress loss?",
                ],
                [
                  <M>{String.raw`\gamma`}</M>,
                  "0–4",
                  "How much can support change stress loss?",
                ],
                [
                  <M>{String.raw`w_E`}</M>,
                  "0.05–0.20",
                  "How important is washout?",
                ],
                [
                  <M>{String.raw`q`}</M>,
                  "0.15–0.60",
                  "How large is the effective extracellular source?",
                ],
                [
                  <M>{String.raw`k_L`}</M>,
                  "0.25–1.00",
                  "How rapidly is well-mixed protein lost?",
                ],
                [
                  <M>{String.raw`\kappa`}</M>,
                  "0.40–1.60",
                  "How quickly does support track the input?",
                ],
              ]}
            />
            <p>
              To separate monotonic associations, we compute partial rank
              correlation coefficients (PRCC). Each parameter and output is
              ranked, both are regressed on the ranks of all remaining
              parameters, and the residuals are correlated. We bootstrap the
              sampled scenarios 256 times to examine estimator stability:
            </p>
            <Equation
              n={24}
            >{String.raw`\mathrm{PRCC}_k=\operatorname{corr}\!\left(\operatorname{resid}[\operatorname{rank}(\theta_k)\mid\operatorname{rank}(\theta_{-k})],\operatorname{resid}[\operatorname{rank}(Y)\mid\operatorname{rank}(\theta_{-k})]\right).`}</Equation>
            <Figure
              n={12}
              file="02-uncertainty-sensitivity"
              title="The assumed interaction and release parameters change the model outcome."
              data="parameter-ensemble.csv"
            >
              Results from 512 sampled scenarios; partial rank correlations and
              bootstrap intervals describe the numerical design space. They are
              not variance-based Sobol indices or confidence intervals from
              biological measurements. The plotted distributions depend on the
              declared ranges and independent-uniform sampling assumption.
            </Figure>
            <p>
              For relative Elafin AUC, resident competition has PRCC{" "}
              <strong>−0.979</strong>, effective release <strong>+0.844</strong>
              , and protein loss <strong>−0.835</strong>. The model therefore
              points toward co-culture persistence and active extracellular
              protein measurements as useful next experiments. These rankings do
              not prove causal biological effect sizes, and nonmonotonic
              responses or correlated parameter priors could change them.
            </p>
            <h3>
              7.2 Does better survival necessarily mean more extracellular
              protein?
            </h3>
            <p>
              The constant-release model encodes a benefit whenever more viable
              EcN produces a larger source. However, our design also considers
              damage-associated leakage and terminal lysis. If support reduces
              damage, it may reduce release per viable cell. To test that
              structural uncertainty, we compare the baseline law with an
              alternative phenomenological source:
            </p>
            <Equation
              n={25}
            >{String.raw`j(\tau)=q_0\,x(\tau)\left[\varepsilon+\frac{1-\varepsilon}{1+\eta p(\tau)}\right],\qquad 0\leq\varepsilon\leq1,\quad\eta\geq0.`}</Equation>
            <p>
              Here <M>{String.raw`\eta=0`}</M> returns the constant-source
              model. The residual fraction <M>{String.raw`\varepsilon`}</M> and
              suppression strength <M>{String.raw`\eta`}</M> determine how
              strongly support reduces the damage-associated release component.
              The expression is a counterfactual mechanism test. It does not
              model intracellular protein accumulation or individual lysis
              events, and neither parameter has been measured. It preserves the
              separation between ROS-responsive support and constitutive Elafin
              expression.
            </p>
            <Figure
              n={13}
              file="07-release-law-sensitivity"
              title="A survival benefit and an extracellular-release benefit need not coincide."
              data="release-law-scenarios.csv"
            >
              Alternative release laws share the same ecological trajectory and
              differ only in how the source depends on support. The calculation
              examines whether the sign and size of a delivery comparison
              survive that change in model structure. Parameters are assumed; no
              release mechanism has been fitted to team data.
            </Figure>
            <p>
              With the residual release fraction fixed at{" "}
              <M>{String.raw`\varepsilon=0.05`}</M>, increasing the assumed
              suppression strength <M>{String.raw`\eta`}</M> from 0 to 2, 8 and
              32 changes the ratio of supported to control distal-outflow AUC
              from <strong>2.686</strong> to <strong>1.654</strong>,{" "}
              <strong>1.133</strong> and <strong>0.794</strong>. The last
              scenario reverses the apparent delivery benefit despite identical
              underlying population dynamics. This is a sensitivity result, not
              evidence that the actual strain follows any of these release laws.
            </p>
            <p>
              <strong>Experimental consequence.</strong> Compare viable CFU,
              intracellular Elafin, active Elafin in cell-free supernatant and a
              lysis/leakage marker in the same time course. A fluorescence
              reporter alone cannot distinguish higher production from greater
              release, nor abundance from inhibitory activity. This comparison
              is essential before claiming that persistence engineering improves
              delivery.
            </p>
            <h3>7.3 Independent checks of the numerical solution</h3>
            <p>
              The ecological system is integrated by fourth-order Runge–Kutta,
              with steps aligned to the input transition. A separate adaptive
              integrator checks constant-support equilibria. For the spatial
              equation, cell-centered finite volumes enforce a flux balance in
              each cell. The Robin boundary includes its half-cell diffusion
              resistance. If <M>{String.raw`\Delta\xi=1/N`}</M>, the boundary
              flux coefficient is{" "}
              <M>{String.raw`g=\mathrm{Bi}/(1+\mathrm{Bi}\,\Delta\xi/2)`}</M>.
            </p>
            <Equation
              n={26}
            >{String.raw`\frac{dc_i}{d\tau}=\delta\left[\frac{F_{i-1/2}-F_{i+1/2}}{\Delta\xi}-\mathrm{Da}\,c_i\right],\quad F_{1/2}=j,\quad F_{N+1/2}=g\,c_N.`}</Equation>
            <p>
              Crank–Nicolson advances the resulting linear system, using
              trapezoidal source integration:
            </p>
            <Equation
              n={27}
            >{String.raw`\left(I-\frac{\Delta\tau}{2}A\right)\mathbf c^{n+1}=\left(I+\frac{\Delta\tau}{2}A\right)\mathbf c^n+\frac{\Delta\tau}{2}\left(\mathbf b^{n+1}+\mathbf b^n\right).`}</Equation>
            <Figure
              n={14}
              file="05-numerical-verification"
              title="Analytic solutions, refinement and conservation check the computation."
              data="space-convergence.csv"
            >
              Spatial refinement is compared with the closed-form steady
              profile. Temporal refinement uses a smooth eigenmode of the same
              discrete operator with an exact exponential solution. ODE
              refinement is checked independently. A discontinuous startup is
              recorded separately because it excites fast modes and cannot be
              used to infer the asymptotic temporal order from coarse steps.
            </Figure>
            <p>
              The spatial convergence order approaches <strong>2.00</strong>;
              the smooth temporal test gives orders 2.0019 to 2.0000. At 120
              cells, the maximum absolute cell-center concentration error
              against the steady analytic profile is{" "}
              <M>{String.raw`1.16\times10^{-6}`}</M>. In the coupled baseline,
              reducing the time step from 0.02 to the 0.0025 reference changes
              integrated distal outflow by a relative difference of
              approximately <M>{String.raw`3.30\times10^{-7}`}</M>. The
              accumulated source–loss balance residual is about{" "}
              <M>{String.raw`10^{-13}`}</M>.
            </p>
            <p>
              Among 100 independently checked constant-support ecological
              scenarios, the 98 cases away from a stability boundary agree with
              analytic equilibria to within{" "}
              <M>{String.raw`1.9\times10^{-10}`}</M>. Two near-boundary cases
              converge more slowly; extending the integration to model time
              24,000 reduces their maximum residual to{" "}
              <M>{String.raw`3.1\times10^{-11}`}</M>. That extra check prevents
              a slowly relaxing trajectory from being mistaken for a different
              equilibrium.
            </p>
            <p>
              For the binding calculation, all 30 tested total-concentration
              pairs respect <M>{String.raw`0\leq B\leq\min(E_T,I_T)`}</M>. An
              independent closed-form time solution also agrees with the
              numerical integrator. These checks establish numerical consistency
              of the chosen equations. They do not establish that the equations
              or parameter values describe an actual gut.
            </p>
            <CodeBlock
              title="Finite-volume boundary and source terms"
              file="research_models.py"
            >{`dx = 1 / number_of_cells
g = Bi / (1 + Bi * dx / 2)  # half-cell boundary resistance
# Fluxes are positive from the source toward the distal boundary.
F_left = source_flux
F_right = g * concentration[-1]
mass_rate = delta * (F_left - F_right - Da * concentration.mean())
# Compare this expression with the summed per-cell numerical update.`}</CodeBlock>
          </section>

          <section id="experiments">
            <h2>8. How the models inform the next experiment</h2>
            <p>
              The equations above use established mass action, competition and
              diffusion frameworks. The project-specific contribution is their
              explicit separation and coupling: a ROS-dependent support state
              changes EcN persistence; persistence supplies a hypothesized
              extracellular source; transport partitions that source between
              internal loss and boundary outflow. The release-law comparison
              tests a weakness in that coupling. We do not describe the
              underlying classical equations as newly discovered laws.
            </p>
            <DataTable
              caption="Table 6. From computational result to a falsifiable measurement."
              headers={[
                "Model result",
                "Measurement required",
                "What would challenge the model?",
              ]}
              rows={[
                [
                  "Structural spread depends on the fitting region",
                  "Confirm the expressed sequence, processing and fold; assay inhibitory activity.",
                  "Protein abundance without a properly processed, active Elafin product.",
                ],
                [
                  "Total enzyme changes the binding isotherm",
                  "Titrate Elafin at multiple known elastase totals with a defined substrate.",
                  "A systematic mismatch with reversible 1:1 binding under matched conditions.",
                ],
                [
                  "Invasion changes at a competition-dependent threshold",
                  "Strain-resolved CFU in monoculture and co-culture, with matched stress and input controls.",
                  "Persistence dominated by changing resources or interactions absent from fixed coefficients.",
                ],
                [
                  "Post-input support can outlast the signal",
                  "Measure support decay and viable abundance after input removal.",
                  "Reporter decay fails to track PspA or viable-cell persistence.",
                ],
                [
                  "Release law can change the delivery comparison",
                  "Paired intracellular, supernatant and lysis/leakage measurements.",
                  "Higher viable counts accompanied by lower active extracellular Elafin.",
                ],
                [
                  "Diffusion and loss have different spatial signatures",
                  "Time-resolved concentration or activity at multiple positions in a defined layer.",
                  "Advection, binding or heterogeneous loss causes persistent structured residuals.",
                ],
              ]}
            />
            <p>
              Calibration should begin with independently measurable quantities.
              Monocultures constrain growth and loss; co-cultures constrain
              interaction terms; cell-free protein measurements constrain
              release and inactivation; spatial experiments constrain diffusion
              and boundary transfer. Fit on one subset and test on withheld
              conditions. The present results are a reproducible basis for
              choosing those measurements, not a substitute for them.
            </p>
          </section>

          <section id="evidence">
            <h2>Evidence audit and excluded analyses</h2>
            <p>
              We reviewed the submitted Elafin-IBD analyses before choosing what
              could support this page. The archived Mendelian-randomization
              result for IBD is not statistically significant (reported IVW{" "}
              <M>{"p=0.6904"}</M>). More importantly, the instrument set mixes
              tissues and contains unresolved effect-allele harmonization and
              LD-pruning issues. We therefore do not present its coefficient as
              a validated causal estimate or treat the nonsignificant result as
              evidence that local Elafin delivery cannot work.
            </p>
            <p>
              The archived 2Z7F simulation concerns an elastase–SLPI structure,
              not an Elafin complex. It cannot supply Elafin-specific RMSD,
              RMSF, binding-energy or solvent-trajectory figures. We also
              excluded hard-coded differential-expression outputs, immune
              predictions for a mismatched sequence and an uncalibrated
              clinical-dose threshold. The GTEx PI3 snapshot remains useful as
              normal-tissue expression context, but it cannot calibrate
              bacterial release or disease-specific efficacy.
            </p>
            <p>
              The audit files retain the inclusion decisions:{" "}
              <a href={assetUrl("assets/dry-lab/evidence-audit.json")} download>
                genetic and expression evidence
              </a>
              ,{" "}
              <a
                href={assetUrl("assets/dry-lab/structure-audit.json")}
                download
              >
                structural identity
              </a>
              , and{" "}
              <a href={assetUrl("assets/dry-lab/model-audit.json")} download>
                earlier dynamical models
              </a>
              .
            </p>
          </section>

          <DataSourcesSection />
          <section id="code">
            <h2>Code and data availability</h2>
            <p>
              The overview and pathway are conceptual illustrations. All
              quantitative figures are generated from deposited coordinates or
              explicitly specified calculations. Python
              scripts, exact input structures, parameter settings, random seeds,
              raw CSV values and verification summaries are included. The
              scientific plots are not image-generated measurements. The
              structure renderings use their associated coordinate files through a local
              copy of 3Dmol.js; mathematical notation is typeset locally with
              KaTeX.
            </p>
            <DataTable
              caption="Table 7. Reproduce the analyses and inspect their numerical outputs."
              headers={["Analysis", "Source", "Values and verification"]}
              rows={[
                [
                  "Conceptual overview",
                  <><a href={assetUrl("assets/dry-lab/illustrations/overview-prompt.txt")} download>Image prompt</a>{" · "}
                    <a href={assetUrl("assets/dry-lab/illustrations/draw_pathway.py")} download>Pathway source</a></>,
                  "Design relationships and model interfaces; no measured values.",
                ],
                [
                  "Protein coordinates",
                  <>
                    <a href={researchAsset("analyze_structures.py")} download>
                      Analysis script
                    </a>{" "}
                    ·{" "}
                    <a href={researchAsset("structure-methods.txt")} download>
                      Methods
                    </a>
                  </>,
                  <>
                    <a href={researchAsset("structure-summary.json")} download>
                      Summary
                    </a>{" "}
                    ·{" "}
                    <a
                      href={researchAsset(
                        "1fle-minimum-heavy-atom-distance-matrix.csv",
                      )}
                      download
                    >
                      Full distance matrix
                    </a>
                  </>,
                ],
                [
                  "Binding kinetics",
                  <a href={researchAsset("binding_kinetics.py")} download>
                    Python script
                  </a>,
                  <>
                    <a href={researchAsset("binding-summary.json")} download>
                      Verification
                    </a>{" "}
                    ·{" "}
                    <a href={researchAsset("binding-isotherms.csv")} download>
                      Isotherms
                    </a>
                  </>,
                ],
                [
                  "Ecology and transport",
                  <a href={researchAsset("research_models.py")} download>
                    Python script
                  </a>,
                  <>
                    <a href={researchAsset("research-summary.json")} download>
                      All parameters and checks
                    </a>{" "}
                    ·{" "}
                    <a
                      href={researchAsset("global-rank-sensitivity.csv")}
                      download
                    >
                      PRCC
                    </a>
                  </>,
                ],
                [
                  "Mucosal retention",
                  <a href={assetUrl("assets/dry-lab/adhesion/retention_model.py")} download>Finite-volume model</a>,
                  <><a href={assetUrl("assets/dry-lab/adhesion/retention-summary.json")} download>Parameters and verification</a>{" · "}
                    <a href={assetUrl("assets/dry-lab/adhesion/retention-curves.csv")} download>Time courses</a></>,
                ],
                [
                  "Source structures",
                  <>
                    <a
                      href={assetUrl("assets/dry-lab/structures/1fle.pdb")}
                      download
                    >
                      1FLE PDB
                    </a>{" "}
                    ·{" "}
                    <a
                      href={assetUrl("assets/dry-lab/structures/2rel.pdb")}
                      download
                    >
                      2REL PDB
                    </a>
                  </>,
                  <a href={researchAsset("2rel-rmsd-matrix.csv")} download>
                    Pairwise RMSD matrix
                  </a>,
                ],
              ]}
            />
            <CodeBlock title="Reproduce coordinate and continuum analyses" language="bash">{`python scripts/drylab/analyze_structures.py
node scripts/drylab/render_structures.mjs
python scripts/drylab/plot_structures.py
python scripts/drylab/binding_kinetics.py
python scripts/drylab/research_models.py
python scripts/drylab/adhesion/retention_model.py
python scripts/drylab/draw_pathway.py
# Python: NumPy, SciPy, Matplotlib; structural rendering: local Playwright.
# Generated values and figures: public/assets/dry-lab/research/`}</CodeBlock>
            <p>
              Environment: Python 3.12.7, NumPy 2.1.2, SciPy 1.15.2 and
              Matplotlib 3.10.1. Output manifests record reproducible inputs and
              figures. <Link to="/software">The Software page</Link> provides
              the downloadable research bundle and file guide. The team’s
              original submitted files remain separate from the recalculated
              outputs.
            </p>
            <p className="research-attribution">
              The organization of this article—model questions, derivations,
              parameter tables, numbered figures, code and references—was
              informed by the Peking 2025 Model page.
              <Cite id="peking-model-format" /> We also reviewed the Model pages of{" "}
              <a href="https://2024.igem.wiki/heidelberg/model" target="_blank" rel="noreferrer">Heidelberg 2024</a>,{" "}
              <a href="https://2023.igem.wiki/zju-china/model" target="_blank" rel="noreferrer">ZJU-China 2023</a>{" "}
              and <a href="https://2024.igem.wiki/utoronto/model.html" target="_blank" rel="noreferrer">UToronto 2024</a>,
              particularly their treatment of validation and unsuccessful results.{" "}
              <a href={assetUrl("assets/dry-lab/literature-2026/wiki-presentation-audit.json")} download>Review notes and award sources</a>. The biological systems,
              calculations and conclusions here are specific to our Elafin–EcN
              design. The new computations and draft were prepared with AI
              assistance and require team interpretation and review before
              scientific submission.
            </p>
          </section>
          <section id="references">
            <h2>References</h2>
            <References />
          </section>
    </ResearchPageShell>
  );
}
