import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { assetUrl } from "../../utils/assetUrl";
import { CodeBlock, DataTable, Equation, M } from "./ResearchPrimitives";
import summary from "../../../public/assets/dry-lab/adhesion/retention-summary.json";
import preview from "../../../public/assets/dry-lab/adhesion/retention-preview.json";
import dimensions from "../../../public/assets/dry-lab/adhesion/figure-dimensions.json";
import ParticleTransport from "./ParticleTransport";
import "./adhesion.css";

const asset = (file: string) => assetUrl("assets/dry-lab/adhesion/" + file);
const pct = (n: number) => (n * 100).toFixed(2) + "%";
const colours = ["#769b89", "#285f50", "#a2aca7", "#c49d5c", "#b66f65"];
type Replay = {
  schemaVersion: number;
  nx: number;
  ny: number;
  L_um: number;
  H_um: number;
  time_s: number[];
  scenarios: {
    id: string;
    label: string;
    density: number[][];
    wall: number[][];
    ledger: number[][];
  }[];
};

function RetentionFigure({
  n,
  file,
  title,
  data,
  children,
}: {
  n: number;
  file: string;
  title: string;
  data: string;
  children: ReactNode;
}) {
  return (
    <figure className="research-figure" id={"fig-" + n}>
      <a
        href={asset(file + ".svg")}
        target="_blank"
        rel="noreferrer"
        aria-label={"Open Figure " + n + " at full size"}
      >
        <img
          src={asset(file + ".png")}
          alt={title}
          width={dimensions[file as keyof typeof dimensions].width}
          height={dimensions[file as keyof typeof dimensions].height}
          loading="lazy"
          decoding="async"
        />
      </a>
      <figcaption>
        <strong>
          Figure {n}. {title}
        </strong>{" "}
        {children}
      </figcaption>
      <div className="research-figure-files">
        <a href={asset(file + ".svg")} target="_blank" rel="noreferrer">
          Full size ↗
        </a>
        {["png", "svg", "pdf"].map((ext) => (
          <a key={ext} href={asset(file + "." + ext)} download>
            {ext.toUpperCase()}
          </a>
        ))}
        <a href={asset(data)} download>
          Source data
        </a>
      </div>
    </figure>
  );
}

function validReplay(value: unknown): value is Replay {
  if (!value || typeof value !== "object") return false;
  const d = value as Replay;
  return (
    d.schemaVersion === 1 &&
    d.nx === 96 &&
    d.ny === 24 &&
    Array.isArray(d.time_s) &&
    d.time_s.length === 121 &&
    d.time_s[0] === 0 &&
    d.time_s[120] === 600 &&
    Array.isArray(d.scenarios) &&
    d.scenarios.length === 5 &&
    d.scenarios.every(
      (s) =>
        s.density?.length === 121 &&
        s.wall?.length === 121 &&
        s.ledger?.length === 121 &&
        s.density.every(
          (row) =>
            row.length === d.nx * d.ny &&
            row.every((v) => Number.isFinite(v) && v >= 0),
        ) &&
        s.wall.every(
          (row) =>
            row.length === d.nx &&
            row.every((v) => Number.isFinite(v) && v >= 0),
        ) &&
        s.ledger.every(
          (row) =>
            row.length === 5 &&
            row.every((v) => Number.isFinite(v) && v >= 0) &&
            Math.abs(row.reduce((a, b) => a + b, 0) - 1) < 1e-6,
        ),
    )
  );
}

function ComputedReplay() {
  const [data, setData] = useState<Replay | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scenario, setScenario] = useState(1);
  const [frame, setFrame] = useState(2);
  const [playing, setPlaying] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const request = useRef<AbortController | null>(null);
  const load = useCallback(async () => {
    request.current?.abort();
    const control = new AbortController();
    request.current = control;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(asset("retention-animation.json"), {
        signal: control.signal,
      });
      if (!response.ok) throw new Error("Computed frames could not be loaded.");
      const value: unknown = await response.json();
      if (!validReplay(value))
        throw new Error(
          "The frame dimensions or fate ledger failed validation.",
        );
      setData(value);
    } catch (e) {
      if (!control.signal.aborted)
        setError(e instanceof Error ? e.message : "Loading failed.");
    } finally {
      if (!control.signal.aborted) setLoading(false);
    }
  }, []);
  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          void load();
        }
      },
      { rootMargin: "700px" },
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      request.current?.abort();
    };
  }, [load]);
  useEffect(() => {
    if (!playing || !data || frame >= data.time_s.length - 1) return;
    const timer = window.setTimeout(() => setFrame(frame + 1), 350);
    return () => window.clearTimeout(timer);
  }, [playing, data, frame]);
  useEffect(() => {
    if (!canvas.current) return;
    const ctx = canvas.current.getContext("2d");
    if (!ctx) return;
    const field = data?.scenarios[scenario].density[frame] ?? preview.density;
    const wall = data?.scenarios[scenario].wall[frame] ?? preview.wall;
    const nx = data?.nx ?? preview.nx;
    const ny = data?.ny ?? preview.ny;
    const left = 67,
      top = 46,
      width = 810,
      height = 223,
      cellW = width / nx,
      cellH = height / ny;
    ctx.clearRect(0, 0, 960, 400);
    ctx.fillStyle = "#fffef9";
    ctx.fillRect(0, 0, 960, 400);
    // Fixed logarithmic colour mapping; never rescale a weak late frame to its own maximum.
    function colour(value: number, max: number, floor: number) {
      const f = Math.max(
        0,
        Math.min(1, Math.log1p(value / floor) / Math.log1p(max / floor)),
      );
      const a = [248, 246, 237],
        b = [24, 78, 67];
      return `rgb(${a.map((x, i) => Math.round(x + (b[i] - x) * f)).join(",")})`;
    }
    field.forEach((value, index) => {
      const x = index % nx,
        y = Math.floor(index / nx);
      ctx.fillStyle = colour(value, 12, 0.001);
      ctx.fillRect(
        left + x * cellW,
        top + height - (y + 1) * cellH,
        cellW + 0.1,
        cellH + 0.1,
      );
    });
    wall.forEach((value, x) => {
      ctx.fillStyle = colour(value, 0.2, 0.0001);
      ctx.fillRect(left + x * cellW, top + height + 31, cellW + 0.1, 17);
    });
    ctx.strokeStyle = "#91a397";
    ctx.lineWidth = 1;
    ctx.strokeRect(left, top, width, height);
    ctx.strokeRect(left, top + height + 31, width, 17);
    ctx.fillStyle = "#254b40";
    ctx.font = "14px Arial";
    ctx.fillText("Free viable cells in the lumen →", left, 25);
    ctx.fillText(`t = ${data?.time_s[frame] ?? preview.time_s} s`, 800, 25);
    [0, 0.3, 0.6, 0.9, 1.2, 1.5, 1.8].forEach((v) =>
      ctx.fillText(
        v.toFixed(1),
        left + (width * v) / 1.8 - 10,
        top + height + 20,
      ),
    );
    [0, 60, 120, 180].forEach((v) =>
      ctx.fillText(String(v), 29, top + height - (height * v) / 180 + 5),
    );
    ctx.fillText("y / µm", 10, 25);
    ctx.fillText("x / mm", 893, top + height + 20);
    ctx.fillText("Mucus-bound cells", left, top + height + 69);
    const legendY = 375;
    for (let x = 0; x < 170; x++) {
      ctx.fillStyle = colour(
        0.001 * Math.expm1((x / 169) * Math.log1p(12000)),
        12,
        0.001,
      );
      ctx.fillRect(450 + x, legendY - 11, 1, 12);
    }
    ctx.fillStyle = "#45675b";
    ctx.font = "12px Arial";
    ctx.fillText("0", 438, legendY);
    ctx.fillText("12", 628, legendY);
    ctx.fillText("Free density: c / (M₀ / LH)", 65, legendY);
    ctx.fillText("Wall density: b / (M₀ / L), 0–0.2", 664, legendY);
  }, [data, frame, scenario]);
  const item = data?.scenarios[scenario];
  const values = item?.ledger[frame] ?? preview.ledger;
  const time = data?.time_s[frame] ?? preview.time_s;
  const last = frame === 120;
  return (
    <div className="adhesion-replay" ref={container}>
      <div
        className="adhesion-scenarios"
        role="group"
        aria-label="Retention control scenario"
      >
        {summary.scenarios.map((s, i) => (
          <button
            type="button"
            key={s.id}
            aria-pressed={i === scenario}
            disabled={!data}
            onClick={() => setScenario(i)}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div
        className="adhesion-plot-scroll"
        role="region"
        aria-label="Transport heatmap; scroll horizontally on small screens"
        tabIndex={0}
      >
        <canvas
          ref={canvas}
          width={960}
          height={400}
          role="img"
          aria-label={`${item?.label ?? preview.label}: computed free-cell density and mucus-bound density at ${time} seconds. ${pct(values[0] + values[1])} of the initial viable pulse remains.`}
        />
      </div>
      <div className="adhesion-playback">
        <button
          type="button"
          disabled={!data}
          title={loading ? "Loading computed frames" : undefined}
          aria-label={
            last
              ? "Restart simulation replay"
              : playing
                ? "Pause simulation replay"
                : "Play simulation replay"
          }
          onClick={() => {
            if (last) setFrame(0);
            setPlaying(last || !playing);
          }}
        >
          {last ? "Replay" : playing ? "Pause" : "Play"}
        </button>
        <label htmlFor="adhesion-time">
          Time <output>{time} s</output>
        </label>
        <input
          id="adhesion-time"
          type="range"
          min={0}
          max={120}
          step={1}
          value={frame}
          aria-valuetext={`${time} seconds`}
          disabled={!data}
          onChange={(e) => {
            setPlaying(false);
            setFrame(Number(e.target.value));
          }}
        />
      </div>
      {error && (
        <p className="adhesion-replay-error" role="alert">
          {error}{" "}
          <button type="button" onClick={() => void load()}>
            Retry
          </button>
        </p>
      )}
      <dl className="adhesion-ledger">
        {["Free", "Bound", "Outlet", "Shed", "Nonviable"].map((label, i) => (
          <div key={label} style={{ borderTopColor: colours[i] }}>
            <dt>{label}</dt>
            <dd>{pct(values[i])}</dd>
          </div>
        ))}
      </dl>
      <p className="adhesion-small">
        Fixed logarithmic colour mapping in every frame and control; vertical
        scale is expanded for visibility. The wall strip is a surface
        population, not a resolved mucus layer.
      </p>
    </div>
  );
}

export default function AdhesionSection() {
  const check = summary.verification;
  return (
    <section id="adhesion" className="adhesion-section">
      <h2>6. Mucosal retention: reaching a surface is not the same as staying</h2>
      <p>
        Our population model treats washout as a single rate. That
        simplification hides two different questions: can a bacterium reach the
        mucus before it exits, and how long can it remain after contact? We
        resolve these processes with a two-dimensional transport model and a
        reversible boundary population. Its outputs are retained viable-cell
        time and the fate of an initial pulse, which can inform a future spatial
        Elafin source model.
      </p>
      <div className="adhesion-evidence">
        <strong>What the current construct does—and does not—specify</strong>
        <p>
          VER16.9 specifies ΔacrB / ΔpspA with ROS-responsive PspA
          complementation and independent constitutive Elafin expression. Its
          page 22 discusses alginate encapsulation and subsequent release; it
          does not specify an engineered adhesin or measured attachment /
          detachment rates. The earlier VER9 Mfp proposal is not treated as the
          current construct. This section begins <em>after</em> carrier release.
          PspA is not assigned a direct adhesion function.
        </p>
      </div>
      <h3>A. Biological evidence and an experimentally accessible scale</h3>
      <p>
        Troge and colleagues demonstrated flagellum-dependent interaction of
        wild-type EcN with human mucus and porcine mucin; this supplies a
        biological reason to examine surface retention, not a binding-rate
        measurement for our modified chassis.
        <a
          href="https://pubmed.ncbi.nlm.nih.gov/23131416/"
          className="adhesion-cite"
        >
          [A1]
        </a>{" "}
        A 2025 tunable-flow gut-chip study observed EcN on mucin-bearing
        epithelial surfaces and used a 180 µm-high culture channel with a steady
        shear reference of 0.03 dyn cm⁻².
        <a
          href="https://pmc.ncbi.nlm.nih.gov/articles/PMC12087827/"
          className="adhesion-cite"
        >
          [A2]
        </a>{" "}
        We use that height and shear only to set a tractable chip-scale
        analogue. The flat boundary is not a patient-specific colon or a
        reconstruction of that chip.
      </p>
      <p>
        In buffer, Ahmed and Stocker measured effective random motility of{" "}
        <em>E. coli</em> HCB1 at approximately 330 µm² s⁻¹.
        <a
          href="https://stockerlab.ethz.ch/wp-content/uploads/2014/03/16.-Ahmed-Stocker_BiophysJ_2008.pdf"
          className="adhesion-cite"
        >
          [A3]
        </a>{" "}
        Our 10–330 µm² s⁻¹ scenario range deliberately allows much lower
        dispersal; it is not a measurement of EcN in mucus. We omit chemotaxis,
        growth, aggregation, crypt geometry and finite binding-site capacity.
        The experiment represented is a dilute, non-growing pulse-and-wash assay
        over ten minutes.
      </p>
      <DataTable
        caption="Table A1. Physical anchors are separated from scenario parameters."
        headers={["Quantity", "Reference / range", "Evidence status"]}
        rows={[
          [
            "Channel height H",
            "180 µm",
            "Literature chip geometry [A2]; not patient anatomy",
          ],
          [
            "Length L; viscosity",
            "1.8 mm; 1 mPa s",
            "Chosen domain and water-like luminal assay fluid",
          ],
          [
            "Mean speed U",
            "90 µm s⁻¹; sweep 20–300",
            "Derived from 0.003 Pa wall shear and the assumed viscosity",
          ],
          [
            "Effective dispersion D",
            "100 µm² s⁻¹; sweep 10–330",
            "Assumption; HCB1 buffer motility provides an external scale [A3]",
          ],
          [
            "Capture velocity κ",
            "1 µm s⁻¹; sweep 0.02–5",
            "Unknown for the current construct",
          ],
          [
            "Dissociation k_off",
            "0.005 s⁻¹; sweep 0.0005–0.05",
            "Unknown; low-occupancy reversible binding assumption",
          ],
          [
            "Mucus-associated removal k_s",
            "0.002 s⁻¹; sweep 0.0002–0.01",
            "Assumed removal of bound cells with shed mucus",
          ],
          [
            "Viability loss d",
            "0 in transport controls; 0.004 / 0.001 s⁻¹ in paired stress controls",
            "Hypothetical stress / support comparison, not fitted killing rates",
          ],
        ]}
      />
      <h3>B. From flow to a reversible mucus boundary</h3>
      <p>
        Let <M>{"c(x,y,t)"}</M> denote free viable-cell concentration and{" "}
        <M>{"b(x,t)"}</M> the viable population per unit mucus surface.
        Coordinates span <M>{"0<x<L,\\;0<y<H"}</M>. At the assumed Reynolds
        number 0.0162, we prescribe a steady planar Poiseuille profile. The free
        population obeys
      </p>
      <Equation
        n={18}
      >{String.raw`\frac{\partial c}{\partial t}+u(y)\frac{\partial c}{\partial x}=D\nabla^2c-dc,\qquad u(y)=6U\frac{y}{H}\left(1-\frac{y}{H}\right).`}</Equation>
      <p>
        The bottom boundary represents reversible capture at the accessible
        mucus interface. Positive <M>{"J_a"}</M> transfers cells from the fluid
        into the surface state. Detachment returns them to the adjacent fluid;
        mucus renewal removes attached cells from the observation domain.
      </p>
      <Equation
        n={19}
      >{String.raw`D\left.\frac{\partial c}{\partial y}\right|_{y=0}=J_a=\kappa c(x,0,t)-k_{\mathrm{off}}b,\qquad \frac{\partial b}{\partial t}=J_a-(k_s+d)b.`}</Equation>
      <p>
        The top is impermeable. Following a unit initial Gaussian pulse centred
        at <M>{"x=0.1L"}</M>, with width <M>{"0.035L"}</M> and uniform vertical
        distribution, the inlet has zero total influx and the outlet has
        advective escape with zero diffusive flux. We track escape, shedding and
        loss of viability separately. The resulting cell-fate balance is
      </p>
      <Equation
        n={20}
      >{String.raw`M_{\mathrm{free}}+M_{\mathrm{bound}}+M_{\mathrm{out}}+M_{\mathrm{shed}}+M_{\mathrm{nonviable}}=M_0=1.`}</Equation>
      <p>
        This is conservation of the initial cohort’s fate, rather than
        conservation of living biomass through growth. The absorbing ledgers
        mean cells already carried outside the field are not subsequently
        counted as deaths inside it. No cells are created and no curve is
        renormalised during integration.
      </p>
      <Equation
        n={21}
      >{String.raw`T=\frac LU=20\;\mathrm{s},\quad Pe_L=\frac{UL}{D}=1620,\quad \frac{H^2/D}{T}=16.2,\quad Da_a=\frac{\kappa H}{D}=1.8,\quad k_{\mathrm{off}}T=0.10.`}</Equation>
      <p>
        The transverse mixing time exceeds the mean advective transit scale.
        Consequently, stronger binding cannot guarantee capture of cells that
        never reach the surface. Conversely, a small captured subpopulation can
        generate a long residence tail after most of the pulse has escaped.
      </p>
      <ComputedReplay />
      <RetentionFigure
        n={8}
        file="11-retention-dynamics"
        data="retention-curves.csv"
        title="Spatial passage, reversible binding and complete fate accounting."
      >
        A: computed free-cell density at 15 s with logarithmic colour. B: viable
        retention on a logarithmic ordinate. C: attached fraction. D: free,
        bound and three absorbing fates sum to the initial pulse. The reference
        binding case includes mucus renewal. “No mucus renewal” removes only
        that process. The two stress cases have identical transport and
        attachment parameters.
      </RetentionFigure>
      <ParticleTransport />
      <h3>
        C. Residence as an input to delivery, rather than a therapeutic claim
      </h3>
      <p>
        We define two readouts as time integrals per initial viable cell. The
        first measures total viable time within the observation domain; the
        second measures viable time specifically at the mucus interface.
      </p>
      <Equation
        n={22}
      >{String.raw`R_{\mathrm{live}}=\frac1{M_0}\int_0^\infty(M_{\mathrm{free}}+M_{\mathrm{bound}})\,dt,\qquad R_{\mathrm{wall}}=\frac1{M_0}\int_0^\infty M_{\mathrm{bound}}\,dt.`}</Equation>
      <p>
        For the reference scenario, reversible capture raises{" "}
        <M>{"R_{\\mathrm{live}}"}</M> from{" "}
        {summary.scenarios[0].mean_live_s.toFixed(2)} to{" "}
        {summary.scenarios[1].mean_live_s.toFixed(2)} s. Turning off mucus
        renewal raises it to {summary.scenarios[2].mean_live_s.toFixed(2)} s.
        These are model expectations for a 1.8 mm assay segment, not
        gastrointestinal transit times, colonisation durations or therapeutic
        exposure. All initial cells eventually leave or enter a loss ledger in
        these controls.
      </p>
      <p>
        To connect this module to the proposed survival circuit, we compare two
        preconditioned support states. We hold{" "}
        <M>{"D,\\kappa,k_{\\mathrm{off}}"}</M> fixed and change only a uniform
        viability-loss rate:
      </p>
      <Equation
        n={23}
      >{String.raw`d(P)=\frac{d_0}{1+gP},\qquad d_0=0.004\;\mathrm{s}^{-1},\quad g=3,\quad P\in\{0,1\}.`}</Equation>
      <p>
        This constitutive equation is a hypothesis for comparing survival
        support, not measured PspA kinetics. We do not equate <M>{"P"}</M> with
        a protein concentration or use it to drive adhesion. With the same
        physical capture process, <M>{"R_{\\mathrm{wall}}"}</M> changes from{" "}
        {summary.scenarios[3].wall_live_s.toFixed(2)} to{" "}
        {summary.scenarios[4].wall_live_s.toFixed(2)} s. Uniform loss has an
        exact check: surviving free and bound fields equal the zero-loss
        solution multiplied by <M>{"e^{-dt}"}</M>. The support comparison
        therefore demonstrates this assumed survival effect, not an emergent
        adhesion improvement.
      </p>
      <p>
        Intracellular Elafin expression remains constitutive. Longer viable wall
        residence could change the time-integrated source available near mucus,
        but the conversion requires independently measured protein accumulation
        and extracellular release. The current design includes background
        release, membrane-damage leakage and terminal lysis; reduced damage
        could decrease release even while it prolongs survival. Retention alone
        cannot settle that trade-off.
      </p>
      <h3>D. Parameter landscapes and what must be measured first</h3>
      <RetentionFigure
        n={9}
        file="12-retention-landscapes"
        data="retention-parameter-planes.csv"
        title="Capture competes with transport and detachment."
      >
        Two 22 × 22 grids contain 968 solves. The shared colour scale shows
        cumulative viable wall residence, not an efficacy score. Crosses mark
        the reference scenario. The maps use a 96 × 24 mesh and hold other rates
        at their reference values; the separate grid audit checks 19
        representative and difficult scenarios.
      </RetentionFigure>
      <p>
        Increasing the capture velocity eventually competes with the supply of
        cells reaching the boundary. Faster flow and faster detachment can each
        shorten the time spent at the wall, but a simple rule connecting shear
        to bond strength is not assumed. FimH-mediated <em>E. coli</em> adhesion
        can exhibit force-enhanced catch-bond behaviour on specific ligands.
        <a
          href="https://pubmed.ncbi.nlm.nih.gov/15387828/"
          className="adhesion-cite"
        >
          [A4]
        </a>{" "}
        Without establishing the active adhesion mechanism in this chassis and
        assay, assigning either a slip-bond or catch-bond law would add
        unsupported biology.
      </p>
      <RetentionFigure
        n={10}
        file="13-retention-sensitivity"
        data="retention-ensemble.csv"
        title="Sensitivity across 256 independent parameter scenarios."
      >
        Six parameters are sampled log-uniformly within Table A1’s ranges; the
        viability-loss range is 0.0002–0.01 s⁻¹. Partial rank correlations
        condition on the ranks of all other parameters; bars show 95% percentile
        intervals from 256 bootstrap resamples. These are sampling-stability
        intervals within assumed ranges, not confidence intervals for biological
        measurements. Scatter displays the same ensemble with a logarithmic D
        colour scale.
      </RetentionFigure>
      <p>
        Within these specified scenarios, κ has PRCC{" "}
        {summary.sensitivity[2].prcc.toFixed(2)}, flow speed has{" "}
        {summary.sensitivity[0].prcc.toFixed(2)}, and detachment has{" "}
        {summary.sensitivity[3].prcc.toFixed(2)} for wall residence. The sign
        and ranking depend on the initial pulse geometry, ranges and model
        structure. Effective dispersal also transports cells away from slow
        near-wall flow; its relationship with retention is not universally
        positive. We would therefore measure entry distributions, free-cell
        dispersion and wash-off kinetics together rather than fit κ from a
        single endpoint.
      </p>
      <h3>E. Verification and numerical limits</h3>
      <p>
        We integrate cell mass in finite volumes. Streamwise advection uses an
        upwind flux, diffusion uses centred fluxes, and the reactive boundary
        includes the half-cell diffusive resistance{" "}
        <M>{"1+\\kappa\\Delta y/(2D)"}</M>. Opposite sides of every internal
        transfer share one flux. Backward Euler preserves nonnegative states.
        The infinite-time integrals in equation (22) are computed from the
        transient generator <M>{"A"}</M> using{" "}
        <M>{"\\int_0^\\infty m(t)\\,dt=-A^{-1}m(0)"}</M>, so they are not cut
        off at the last animation frame.
      </p>
      <RetentionFigure
        n={11}
        file="14-retention-verification"
        data="retention-time-convergence.csv"
        title="Conservation, temporal refinement, grid refinement and an analytic control."
      >
        A: complete fate closure across all five cases. B: backward-Euler error
        relative to the action of the same matrix exponential at 40 s; the
        finest observed temporal order is {check.timeFinestOrder.toFixed(3)}. C:
        reference wall-residence integral on 24 × 6 through 384 × 96 meshes. D:
        prebound cells with zero capture obey the independent exponential law
        exp[−(k_off + k_s + d)t].
      </RetentionFigure>
      <DataTable
        caption="Table A2. Computed verification results and their scope."
        headers={["Check", "Result", "Interpretation"]}
        rows={[
          [
            "Initial-cohort fate closure",
            check.massClosureMax.toExponential(2),
            "Maximum absolute error over stored frames and controls",
          ],
          [
            "Infinite-horizon fate closure",
            check.infiniteHorizonClosureMax.toExponential(2),
            "Maximum error across the 256 sampled scenarios",
          ],
          [
            "Prebound exponential benchmark",
            check.preboundAnalyticError.toExponential(2),
            "Absolute bound-fraction error at 100 s",
          ],
          [
            "Uniform viability-loss identity",
            check.uniformLossIdentityError.toExponential(2),
            "Maximum statewise discrepancy against exp(−dt) scaling",
          ],
          [
            "No-binding control",
            "Exactly zero wall population",
            "κ = 0 must not create an attached subpopulation",
          ],
          [
            "Time step 0.2 s",
            check.timeBaseError.toExponential(2),
            "L¹ state error at 40 s, 48 × 12 mesh; first-order time method",
          ],
          [
            "Reference 96 × 24 wall integral",
            pct(check.spatialBaseWallRelativeError),
            "Difference from 384 × 96; nonmonotone refinement, not a proven global error bound",
          ],
          [
            "19-case parameter grid audit",
            pct(check.parameterAuditMaxWallRelativeError),
            "Largest wall-integral difference, 96 × 24 versus 192 × 48",
          ],
        ]}
      />
      <p>
        Upwind advection adds numerical dispersion. The small reference error
        does not establish second-order spatial accuracy or prove every point in
        a parameter map equally resolved. The nonmonotone refinement and the
        wider scenario audit are reported alongside the figures. All controls
        use the same discretisation; an adhesion mechanism, growth and
        heterogeneous mucus would each require a new model and a new validation
        exercise.
      </p>
      <h3>F. Measurements that can falsify this model</h3>
      <ol className="adhesion-experiments">
        <li>
          <strong>Resolve arrival and capture.</strong> Record the actual
          released-cell distribution, free-cell spreading and the attached
          population under a measured flow profile. If one constant D fails to
          describe both upstream and downstream spreading, test a
          motility-resolved model.
        </li>
        <li>
          <strong>Separate binding from survival.</strong> Compare the chassis
          and the matched support controls at the same viable input, mucus
          preparation and flow. Measure viable retained cells and outlet cells
          independently; persistent fluorescence alone cannot establish
          survival.
        </li>
        <li>
          <strong>Measure the wash-off tail.</strong> After removing the
          free-cell pulse, jointly fit detachment and mucus-associated removal
          using outlet cells, retained cells and shed mucus. A single declining
          surface signal generally cannot distinguish k_off, k_s and death.
        </li>
        <li>
          <strong>Connect retention to actual Elafin release.</strong> Quantify
          intracellular and extracellular Elafin alongside viable counts and
          membrane damage. This tests whether a longer-lived wall population
          also gives a larger useful extracellular source.
        </li>
      </ol>
      <CodeBlock
        title="Conservative boundary exchange in the implemented solver"
        sourceUrl={asset("retention_model.py")}
      >{`resistance = 1 + kappa * dy / (2 * D)
attachment_rate = kappa / dy / resistance
detachment_rate = koff / resistance
# Equal and opposite transfers between fluid cell mass and wall mass.
transfer(fluid_bottom, wall, attachment_rate)
transfer(wall, fluid_bottom, detachment_rate)
transfer(wall, shed_ledger, shedding)
# All rates, meshes, controls, figures and audits are in the download.`}</CodeBlock>
      <CodeBlock
        title="Reproduce all retention calculations"
        language="bash"
        sourceUrl={asset("README.md")}
      >{`python retention_model.py --output-dir retention-results
# Python 3.12; NumPy 2.1; SciPy 1.15; Matplotlib 3.10
# No private data, network calls or fitted adhesion parameters.`}</CodeBlock>
      <div className="adhesion-downloads">
        <a href={asset("retention-summary.json")} download>
          Summary JSON
        </a>
        <a href={asset("retention-curves.csv")} download>
          Five-control curves
        </a>
        <a href={asset("retention-parameter-planes.csv")} download>
          Parameter planes
        </a>
        <a href={asset("retention-sensitivity.csv")} download>
          PRCC and intervals
        </a>
        <a href={asset("retention-grid-audit.csv")} download>
          Grid audit
        </a>
        <a href={asset("README.md")} download>
          Methods and provenance
        </a>
      </div>
    </section>
  );
}
