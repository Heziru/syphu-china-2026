import type { ReactNode } from "react";
import { assetUrl } from "../../utils/assetUrl";
import { CodeBlock, DataTable, M } from "./ResearchPrimitives";
import docking from "../../../public/assets/dry-lab/atomistic/docking-summary.json";
import md from "../../../public/assets/dry-lab/atomistic/md-summary.json";
import dimensions from "../../../public/assets/dry-lab/atomistic/figure-dimensions.json";
import closeup from "../../../public/assets/dry-lab/atomistic/closeup-metadata.json";
import PoseViewer from "./AtomisticPoseViewer";
import "./atomisticSection.css";

const asset = (name: string) => assetUrl("assets/dry-lab/atomistic/" + name);
const benchmark = docking.cases["1fle-redocking"];
const human = docking.cases["human-ne-elafin"];
const candidate = human.posthoc_geometry_screen.selected;
const fixed = (n: number, digits = 2) => n.toFixed(digits);
const figureDimensions: Record<string, number[]> = { ...dimensions, "docking-interface-closeup": [closeup.width, closeup.height] };

function AtomisticFigure({ id, file, title, data, children }: { id: string; file: string; title: string; data: string; children: ReactNode }) {
  const size = figureDimensions[file];
  return <figure className="research-figure" id={"fig-" + id}>
    <a href={asset(file + ".svg")} target="_blank" rel="noreferrer" aria-label={"Open Figure " + id + " at full size"}>
      <img src={asset(file + ".png")} width={size[0]} height={size[1]} alt={title} loading="lazy" decoding="async" />
    </a>
    <figcaption><strong>Figure {id}. {title}.</strong> {children}</figcaption>
    <div className="research-figure-files"><a href={asset(file + ".svg")} target="_blank" rel="noreferrer">Full size ↗</a>{["png", "svg", "pdf"].map(ext => <a key={ext} href={asset(file + "." + ext)} download>{ext.toUpperCase()}</a>)}<a href={asset(data)} download>Source data</a></div>
  </figure>;
}

export default function AtomisticSection() {
  return <section id="atomistic" className="atomistic-section">
    <h2>2. From coordinates to a testable molecular hypothesis</h2>
    <p>We added two new calculations: blind protein–protein docking and explicit-water molecular dynamics of human Elafin. A structure-identity audit changed the starting point: <a href="https://www.rcsb.org/structure/2Z7F" target="_blank" rel="noreferrer">2Z7F</a> contains human neutrophil elastase (NE) with <strong>SLPI</strong>, not Elafin. Its earlier complex trajectory is therefore not evidence for Elafin. The simulations below instead use the complete 57-residue human Elafin chain in <a href="https://www.rcsb.org/structure/2REL" target="_blank" rel="noreferrer">2REL</a>, conformer 1.</p>

    <h3>2.1 Validate docking on a known interface before interpreting a new pose</h3>
    <p>We split the published <a href="https://www.rcsb.org/structure/1FLE" target="_blank" rel="noreferrer">1FLE</a> complex into porcine pancreatic elastase (chain E) and human Elafin (chain I), then independently rotated and translated the ligand. HDOCKlite 1.2 performed a global rigid-body search with 1.2 Å grid spacing, a 15° angular step and 4,392 rotations, without binding-site restraints. The native relative orientation was not supplied as a restraint; the bound monomer conformations were retained. This is an easier retrospective <em>bound redocking</em> benchmark.</p>
    <p>Among 100 ranked predictions, rank 1 recovered <strong>{benchmark.top1.recovered_native_contacts} / {benchmark.native_reference_contact_pairs_under_5A} native residue contacts</strong> at a 5 Å cutoff. Its ligand-backbone RMSD was <strong>{fixed(benchmark.top1.ligand_backbone_RMSD_A)} Å</strong> after fitting the receptor backbone, and its interface-backbone RMSD was <strong>{fixed(benchmark.top1.interface_backbone_RMSD_A)} Å</strong>. These measurements assess pose recovery; the HDOCK score of {fixed(benchmark.top1.HDOCK_score_arbitrary_units)} is an arbitrary ranking potential, not a binding free energy.</p>
    <div className="atomistic-equation" id="eq-A1" tabIndex={0} aria-label="Equation A1"><M>{String.raw`F_{\mathrm{nat}}=\frac{|C_{\mathrm{pose}}\cap C_{\mathrm{native}}|}{|C_{\mathrm{native}}|},\quad C=\{(i,j):\min_{a\in i,b\in j}d_{ab}<5\,\mathrm{\AA}\}`}</M><span>(A1)</span></div>
    <AtomisticFigure id="A1" file="docking-validation" title="Blind redocking recovers the reference Elafin interface" data="docking/1fle-redocking/pose-metrics.csv">
      (a) Computed rank 1 versus the X-ray ligand orientation. (b) Ranking potential versus receptor-fitted ligand backbone RMSD for all 100 poses. (c) Actual predicted coordinates and geometric contact distances. (d) Native contact recovery. Backbone means N, Cα, C and O; interface residues have a native interchain heavy-atom distance below 10 Å. Elafin residues 1–10 are unresolved in 1FLE. Secondary structure comes from deposited HELIX/SHEET records, transferred with each rigid monomer.
    </AtomisticFigure>

    <h3>2.2 Human NE cross-docking exposes a ranking limitation</h3>
    <p>For the human target, we removed SLPI, waters and non-protein records from 2Z7F and retained only NE chain E. The independent ligand was 2REL conformer 1, renamed chain I. The same unrestricted search returned a top score of {fixed(human.top1.HDOCK_score_arbitrary_units)}, but Elafin’s reactive-site Ala24 carbonyl C was <strong>{fixed(human.top1.Elafin_A24_C_to_NE_S195_OG_A)} Å</strong> from NE Ser195 OG. The pose also contained {human.top1.interchain_heavy_atom_pairs_under_2A} interchain heavy-atom pairs closer than 2 Å. These are geometric warning signs; this top-ranked pose does not support a native inhibitory arrangement.</p>
    <p>We then applied an explicitly <strong>post-hoc</strong> screen: Ala24 C–Ser195 OG below 5 Å and no interchain heavy-atom pair below 2 Å. Only original <strong>rank {candidate.rank}</strong> passed, with a {fixed(candidate.Elafin_A24_C_to_NE_S195_OG_A)} Å separation and score {fixed(candidate.HDOCK_score_arbitrary_units)}. The screen still selects that rank at cutoffs 3.5–6 Å and selects none below 3 Å. Short contacts are a steric flag, not a complete interaction-energy calculation. This candidate remains a hypothesis, and its original rank is retained.</p>
    <AtomisticFigure id="A2" file="docking-human-ne" title="A mechanistic check changes which docking pose deserves follow-up" data="docking/human-ne-elafin/pose-metrics.csv">
      (a–c) Original rank {candidate.rank}, selected after inspecting reactive-site proximity, shown as a cartoon, an atom-level contact view and a residue contact map. (d) All 100 original poses, including the score-ranked first pose. Human NE is teal; human Elafin is coral. No experimentally established human NE–Elafin complex validates this prediction. The receptor was crystallized with SLPI, only one free-Elafin NMR conformer was sampled, and neither induced fit nor glycans were included.
    </AtomisticFigure>
    <div id="docking-closeup">
      <AtomisticFigure id="A2b" file="docking-interface-closeup" title="Inside the predicted human NE–Elafin interface" data="closeup-contacts.csv">
        The actual coordinates of original rank {candidate.rank}, enlarged around Elafin residues 24–27 and the NE active site. Element-coloured sticks and spheres show carbon (grey), oxygen (red), nitrogen (blue) and sulfur (yellow); ribbons retain the local protein context. Dashed lines mark measured atom separations, not assigned hydrogen bonds. The 2.18 Å O···O contact is unusually short and requires refinement. This post-hoc candidate is not a validated complex.
      </AtomisticFigure>
    </div>
    <PoseViewer />
    <CodeBlock title="Actual global docking commands (Linux / WSL)" language="bash" sourceUrl={asset("run_docking.sh")}>{`hdock receptor.pdb ligand-independent.pdb -out docking.out
createpl docking.out top100.pdb -nmax 100 -complex -models
# Score-ranked poses remain model_1.pdb ... model_100.pdb.
# Native-pose RMSD is calculated separately, after receptor fitting.`}</CodeBlock>

    <h3>2.3 Build the Elafin topology and force field explicitly</h3>
    <p>The 2REL input contains all 57 mature residues. We regenerated hydrogen atoms at pH 7.4 and verified four covalent disulfide bonds: Cys16–Cys45, Cys23–Cys49, Cys32–Cys44 and Cys38–Cys53. OpenMM {md.preparation.environment.OpenMM} assigned AMBER ff14SB protein parameters and TIP3P-FB water parameters. The solvated dodecahedral box contained <strong>{md.preparation.system.total_atoms.toLocaleString()} atoms</strong>: 830 protein atoms, 4,008 water molecules, 11 Na⁺ and 14 Cl⁻ ions, including counterions for neutrality.</p>
    <DataTable caption="Atomistic protocol and reproducible system definition" headers={["Setting", "Value / implementation"]} rows={[
      ["Input", "2REL model 1, chain A; 57-residue mature human Elafin"],
      ["Force field", "amber14/protein.ff14SB.xml + amber14/tip3pfb.xml"],
      ["Solvent / salt", "TIP3P-FB, 1.0 nm initial padding, 0.15 M NaCl plus neutralization"],
      ["Electrostatics", "Particle Mesh Ewald; 0.9 nm real-space cutoff; tolerance 5 × 10⁻⁴"],
      ["Integration", "Langevin middle, 300 K, friction 1 ps⁻¹, 2 fs step; H-bond constraints and rigid water"],
      ["Pressure", "Monte Carlo barostat, 1 bar, attempted every 25 steps during NPT"],
      ["Equilibration", "20 ps NVT restrained + 30 ps NPT restrained + 50 ps NPT unrestrained"],
      ["Backbone restraints", "Periodic harmonic restraint: 1,000 then 250 then 0 kJ mol⁻¹ nm⁻²"],
      ["Production", `${md.number_of_completed_replicas} completed replicas × 1 ns, unrestrained; frames every 5 ps`],
      ["Independent velocity seeds", md.replicas.map(run => run.seed).join(", ")],
      ["Execution", "OpenMM OpenCL mixed precision on AMD Radeon 780M"],
    ]} />
    <p>Energy minimization reduced the system potential energy from {fixed(md.preparation.minimization.initial_energy_kJ_mol, 0)} to {fixed(md.preparation.minimization.minimized_energy_kJ_mol, 0)} kJ mol⁻¹. That decrease indicates relaxation of this specified system, not biological stabilization. The downloadable serialized System contains bonded, nonbonded and constraint parameters; atom and bond tables expose the assigned masses, charges, Lennard–Jones terms and connectivity.</p>
    <div className="atomistic-downloads"><a href={asset("md/system.xml")} download>System / force-field XML</a><a href={asset("md/topology-atoms.csv")} download>Atom parameters</a><a href={asset("md/topology-bonds.csv")} download>Bond topology</a><a href={asset("md/solvated-minimized.pdb")} download>Solvated initial PDB</a></div>

    <h3>2.4 Measure real trajectory fluctuations, with the fitting window stated</h3>
    <p>Each completed production trajectory has 201 stored coordinate frames including time zero, and a 200-frame protein DCD. We reconstruct the periodic protein through its covalent bonds before analysis, then apply a proper-rotation Kabsch fit. RMSD is measured against the energy-minimized starting structure, using either all 57 Cα atoms or the WAP domain (mature residues 9–57). RMSF is a temporal statistic over 0.2–1.0 ns, about each replica’s own mean after WAP alignment; it is separate from the NMR ensemble dispersion shown earlier.</p>
    <div className="atomistic-equation" id="eq-A2" tabIndex={0} aria-label="Equation A2"><M>{String.raw`\mathrm{RMSF}_i=\sqrt{\left\langle\left\|\widetilde{\mathbf r}_i(t)-\left\langle\widetilde{\mathbf r}_i\right\rangle_t\right\|^2\right\rangle_t}`}</M><span>(A2)</span></div>
    <AtomisticFigure id="A3" file="md-dynamics" title="Explicit-water Elafin trajectories with separate replica curves" data="md-summary.json">
      Full-length and WAP-fitted Cα RMSD, temporal Cα RMSF, mass-weighted protein radius of gyration, temperature and solvent density. Lines show actual trajectory samples without smoothing. Shading marks the first 0.2 ns omitted from RMSF and summary means; it is not a confidence band. All replicas start from the same minimized conformer and solvent configuration, with different velocity and barostat seeds.
    </AtomisticFigure>
    <DataTable caption="Per-replica results over 0.2–1.0 ns; no pooled confidence interval" headers={["Replica", "Full Cα RMSD (Å)", "WAP Cα RMSD (Å)", "N-terminal RMSF (Å)", "WAP RMSF (Å)", "Rg (Å)"]} rows={md.replicas.map(run => [String(run.replica), fixed(run.mean_full_CA_RMSD_A), fixed(run.mean_WAP_CA_RMSD_A), fixed(run.mean_N_terminal_CA_RMSF_A), fixed(run.mean_WAP_CA_RMSF_A), fixed(run.mean_Rg_A)])} />
    <AtomisticFigure id="A4" file="md-topology-contacts" title="Covalent geometry and intramolecular contact occupancy" data="md/replica-1/contact-occupancy.csv">
      (a) SG–SG geometry of the four explicitly bonded disulfides. (b) Mean N-terminal and WAP-domain Cα RMSF within each replica. (c) Equal-weight mean contact occupancy from the completed replicas: Cα distance below 8 Å, excluding sequence neighbours with |i−j| ≤ 3. These are intramolecular contacts in isolated Elafin. Disulfides are part of the force-field topology, so their persistence is a consistency check, not independent evidence of biological stability.
    </AtomisticFigure>
    <div className="atomistic-limit"><strong>What this establishes.</strong> The pipeline produces physically integrated, reproducible short trajectories and resolves how fitting and residue selection change structural readouts. A 1 ns pilot cannot establish convergence, proteolytic resistance, target binding, an inhibition constant or clinical efficacy. The monomer trajectories do not validate either docking complex.</div>
    <CodeBlock title="Specified force field and production integrator" sourceUrl={asset("run_md.py")}>{`forcefield = app.ForceField(
    "amber14/protein.ff14SB.xml", "amber14/tip3pfb.xml")
system = forcefield.createSystem(topology,
    nonbondedMethod=app.PME, nonbondedCutoff=0.9*unit.nanometer,
    constraints=app.HBonds, rigidWater=True)
integrator = mm.LangevinMiddleIntegrator(
    300*unit.kelvin, 1/unit.picosecond, 0.002*unit.picoseconds)
# 500,000 unrestrained integration steps = 1 ns per replica.
# RMSF window: 200–1000 ps; WAP fit: mature residues 9–57.`}</CodeBlock>
    <h3>Reproduce, inspect and extend</h3>
    <p>Our source files preserve all 100 docking ranks, explicit input identities, raw trajectory coordinates, per-frame thermodynamics, analysis CSVs and system parameters. An early test with a non-periodic positional restraint produced non-finite coordinates and was discarded before production; the final periodic-distance implementation passed equilibration and finite-coordinate checks. No failed trajectory was used in the figures. The next validation should vary Elafin starting conformers, refine candidate complexes, extend independently seeded MD and compare against a target-binding experiment.</p>
    <div className="atomistic-downloads"><a href={asset("README.md")} download>Methods / reproduction guide</a><a href={asset("docking-summary.json")} download>Docking audit JSON</a><a href={asset("md-summary.json")} download>MD audit JSON</a>{md.replicas.map(run => <a key={run.replica} href={asset(`md/replica-${run.replica}/protein-coordinates.npz`)} download>Replica {run.replica} coordinates</a>)}</div>
    <ul className="atomistic-reference-list">
      <li>Yan et al. (2020), <a href="https://doi.org/10.1038/s41596-020-0312-x" target="_blank" rel="noreferrer">The HDOCK server for integrated protein–protein docking</a>. Native HDOCKlite 1.2 was run locally; no server-supplied prediction is presented as an experiment.</li>
      <li>Eastman et al. (2017), <a href="https://doi.org/10.1371/journal.pcbi.1005659" target="_blank" rel="noreferrer">OpenMM 7: rapid development of high performance algorithms for molecular dynamics</a>. Computations here use OpenMM 8.6.1.</li>
      <li>Maier et al. (2015), <a href="https://doi.org/10.1021/acs.jctc.5b00255" target="_blank" rel="noreferrer">ff14SB: improving the accuracy of protein side chain and backbone parameters</a>.</li>
      <li>Wang et al. (2014), <a href="https://doi.org/10.1021/jz500737m" target="_blank" rel="noreferrer">Building force fields: an automatic, systematic, and reproducible approach</a>, including TIP3P-FB.</li>
    </ul>
  </section>;
}


