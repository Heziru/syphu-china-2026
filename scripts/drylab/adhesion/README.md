# Post-release mucosal retention model

Version: 2026-10-09. These are uncalibrated, non-growing, chip-scale scenarios. They are not observations of our engineered strain, patient predictions, colonisation claims or dosage optimisation.

## Construct audit

The current supplied source is `敲除/VER16.9_20260828 (1).pdf`, 36 pages. Pages 1–6 describe ΔacrB / ΔpspA EcN, ROS-responsive pKatG/OxyR → PspA complementation, and independent constitutive intracellular Elafin and sfGFP expression. sfGFP uses J23100; the separate Elafin promoter is not named. Elafin reaches the exterior through proposed background release, membrane-damage leakage and terminal lysis. No validated secretion apparatus is assumed here.

Page 22 discusses alginate encapsulation and subsequent release and gives a literature-based colonisation-time discussion. It supplies neither an engineered adhesin nor measured attachment, detachment or mucus-renewal constants for this construct. Full-text searches for Mfp and adhesion terms yielded no current adhesion module. The older `二次选题/VER 9.0 EcN为底盘的IBD治疗思路/黏附模块.txt` proposes Mfp and references another team's design; it is not evidence that VER16.9 contains that module. In particular, release of an adhesive protein after lysis is not equivalent to validated anchoring of live cells at a surface.

The model starts after the carrier releases bacteria. It does not simulate encapsulation chemistry, gastric micromotors, an engineered adhesin, chemotaxis or protein secretion. PspA is not treated as a binding protein.

## Biological and physical anchors

1. Troge A et al. (2012). More than a marine propeller—the flagellum of the probiotic Escherichia coli strain Nissle 1917 is the major adhesin mediating binding to human mucus. *International Journal of Medical Microbiology* 302, 304–314. DOI: [10.1016/j.ijmm.2012.09.004](https://doi.org/10.1016/j.ijmm.2012.09.004). Native EcN interaction with human mucus / porcine mucin motivates studying retention; it does not calibrate our engineered-strain boundary rates.
2. Lee J, Menon NV, Truong HD, Lim CT (2025). Dynamics of Spatial Organization of Bacterial Communities in a Tunable Flow Gut Microbiome-on-a-Chip. *Small* 21, 2410258. DOI: [10.1002/smll.202410258](https://doi.org/10.1002/smll.202410258). The paper uses a 180 µm-high, 1500 µm-wide culture channel and a steady-flow shear reference of 0.03 dyn cm⁻². It studies EcN on mucus-bearing epithelial surfaces. Our flat two-dimensional assay analogue does not reconstruct its epithelial geometry or cyclic actuation.
3. Ahmed T, Stocker R (2008). Experimental Verification of the Behavioral Foundation of Bacterial Transport Parameters Using Microfluidics. *Biophysical Journal* 95, 4481–4493. DOI: [10.1529/biophysj.108.134510](https://doi.org/10.1529/biophysj.108.134510). HCB1 in motility buffer had mean random motility 3.3 × 10⁻⁶ cm²/s = 330 µm²/s. This is an external scale for effective cell dispersal, not an EcN mucus measurement. The scenario range 10–330 µm²/s deliberately extends below it.
4. Thomas WE et al. (2004). Shear-dependent ‘stick-and-roll’ adhesion of type 1 fimbriated Escherichia coli. *Molecular Microbiology* 53, 1545–1557. DOI: [10.1111/j.1365-2958.2004.04226.x](https://doi.org/10.1111/j.1365-2958.2004.04226.x). Ligand-specific FimH catch-bond behaviour cautions against imposing a universal shear-detachment law. No specific catch- or slip-bond mechanism is assigned to our construct.

The continuum advection-diffusion equation, planar Poiseuille flow and reversible low-occupancy binding are standard model forms. Our contribution is their conservative coupling, controls, numerical audits and connection to the project's proposed survival/release trade-off, not a new physical law.

## Equations and boundaries

Free cells c(x,y,t), per luminal volume, occupy 0 < x < L and 0 < y < H. Bound viable cells b(x,t), per mucus surface, occupy y = 0. With units µm and seconds:

```
u(y) = 6 U (y/H) (1-y/H)
dc/dt + u dc/dx = D (d²c/dx² + d²c/dy²) - d c
J_attachment = D dc/dy at y=0 = kappa c_wall - koff b
db/dt = J_attachment - (shedding + d) b
```

The top is impermeable. The post-pulse inlet has zero total influx. The outlet has zero diffusive flux and advective escape. The initial pulse is Gaussian in x, centred at 0.1 L with standard deviation 0.035 L, uniform in y, normalised to total viable fraction M0 = 1. Initial cell mass is integrated over each grid cell using the Gaussian CDF rather than centre-sampled. There is no continuous input, growth, wall-site saturation, aggregation, mucus penetration or chemotaxis.

The mucus is represented by a **surface boundary**. Neither its thickness nor a dense inner mucus layer is resolved. No assumption that bacteria penetrate healthy inner mucus is made. Shed bound cells leave the observation domain in a distinct ledger; they are not called dead or recirculated as free cells.

Fate accounting is:

```
free + bound + advected_out + shed_out + nonviable = initial_cohort = 1
```

This tracks the fate of initially viable cells, not the physical mass of all cellular constituents. Lost cells are absorbing bookkeeping states. Death is recorded only before cells leave the domain.

## Parameters and interpretation

Reference values: L = 1800 µm (chosen), H = 180 µm (chip-scale literature anchor), U = 90 µm/s, D = 100 µm²/s, kappa = 1 µm/s, koff = 0.005/s, shedding = 0.002/s, death d = 0 for transport controls. Assuming a Newtonian assay fluid of viscosity 1 mPa s and density 1000 kg/m³, U corresponds to planar wall shear 6 mu U/H = 0.003 Pa = 0.03 dyn/cm². The Reynolds number based on H is 0.0162. This viscosity assumption applies to the flowing assay fluid, not a claim that mucus is Newtonian.

Dimensionless groups: mean advective time L/U = 20 s; Pe_L = UL/D = 1620; transverse mixing time relative to transit (H²/D)/(L/U) = 16.2; capture Damkohler kappa H/D = 1.8; koff L/U = 0.1; shedding L/U = 0.04. All attachment, detachment, renewal and viability rates are unknown for the current chassis.

Five controls use the same initial pulse:

- No wall binding: kappa = 0; death = 0.
- Reversible binding: reference values; death = 0.
- No mucus renewal: only shedding set to zero; death = 0.
- Stress / no support: reference values, death = 0.004/s.
- Stress / support: reference values, death = 0.001/s.

The last pair is a deliberately explicit constitutive hypothesis d(P) = 0.004/(1+3P), P=0 or 1. P is a preconditioned support state, not protein concentration, and ROS is not simulated as a spatial attractant. Both cases use identical transport/binding rates. Uniform death exactly multiplies the surviving no-death solution by exp(-d t); this is independently verified. Therefore this pair illustrates an assumed survival effect, not discovery of improved adhesion.

Constitutive Elafin expression is unchanged. Cell residence is only a potential input to a later source calculation. A longer viable residence can coexist with lower damage-associated release. Neither residence integral is a concentration, protein activity, clinical benefit or dose.

## Numerical implementation and checks

The state stores **cell mass** (normalised cohort fractions) rather than mixing volume and surface concentrations. The generator transfers equal and opposite mass between neighbours. Streamwise advection is first-order upwind; molecular/effective diffusion uses centred finite-volume fluxes.

The bottom wall's cell-centre-to-wall diffusive resistance is explicitly included:

```
R = 1 + kappa*dy/(2*D)
fluid_to_wall_rate = kappa/(dy*R)
wall_to_fluid_rate = koff/R
```

This follows by eliminating the boundary concentration from the Robin flux. Omitting R would attach at the cell-centre concentration rather than the physical wall concentration.

Backward Euler uses (I-dt Q) m_next = m. It preserves nonnegative states and the complete fate ledger for this conservative generator. The animation uses a 96 × 24 grid, dt=0.2 s, and five-second output sampling up to 600 s. States are never rescaled during computation. The JSON rounds plotted concentrations to six decimals and ledgers to nine; CSV curves retain floating-point precision. The browser uses fixed logarithmic colour mapping for every frame and case and expands the vertical display scale. The frames represent an ensemble density, not tracked experimental cells.

Infinite-time live and wall residence integrals are computed by solving -A z = m0 for the transient free/bound generator A. Their units are seconds per initially viable cell. Absorbing fate totals are reconstructed from the sink rates times z. This avoids truncation at 600 s and supplies a second conservation check.

Checks included in the executable script:

- Generator column sums zero; all off-diagonal transfers nonnegative.
- Complete fate closure at all recorded times in all five cases.
- No-binding wall population exactly zero.
- Infinite-horizon fate closure for every sampled scenario.
- Prebound cohort benchmark at zero capture: b(t)=b(0) exp[-(koff+shedding+d)t].
- Exact exp(-d t) scaling of surviving fields with uniform viability loss.
- Time refinement dt = 0.8, 0.4, 0.2, 0.1, 0.05 s, compared to `scipy.sparse.linalg.expm_multiply` on the same grid at 40 s. This verifies the expected first-order backward-Euler convergence.
- Grid refinement 24×6, 48×12, 96×24, 192×48, 384×96 for infinite-time residence integrals. Convergence is nonmonotone; no second-order spatial claim is made.
- Separate 19-case grid audit, 96×24 against 192×48, including low-dispersal/high-flow/high-capture corners. The audit is not a rigorous bound for every unsampled parameter combination.

The exact latest errors and outputs are in `retention-summary.json`, not manually transcribed estimates. Upwind numerical dispersion remains a limitation, especially for high cell Péclet numbers.

## Parameter analysis

Two 22×22 maps vary capture versus flow and capture versus detachment, with other parameters at reference values. The maps share a colour scale and contain 968 generator solves. All map and ensemble solves use a 96×24 mesh.

An independent six-parameter Latin hypercube uses 256 scenarios, seed 20261009. Ranges are log-uniform: U 20–300 µm/s; D 10–330 µm²/s; kappa 0.02–5 µm/s; koff 0.0005–0.05/s; shedding 0.0002–0.01/s; viability loss 0.0002–0.01/s. These are exploration ranges, not experimental probability distributions.

Sensitivity is a partial rank correlation: rank the response and every input; regress each selected input rank and output rank on all other input ranks with an intercept; correlate the residuals. Percentile intervals come from 256 bootstrap resamples of rows, seed 337. They describe stability within this assumed ensemble, not biological uncertainty intervals. No Sobol or causal interpretation is claimed.

## Reproduction

```
python retention_model.py --output-dir retention-results
```

Tested with Python 3.12.7, NumPy 2.1.2, SciPy 1.15.2 and Matplotlib 3.10.1. The script makes no network calls and needs no private data. Outputs include four multi-panel scientific figures in PNG/SVG/PDF, numerical CSVs, the browser replay, summary JSON, and a copy of the script. Keep this README beside the script; it is the source/assumption record. The original team files are unchanged.

The main experimental readouts suggested by this model are input distributions and free-cell spreading, independently quantified attached and outlet viable cells, wash-off under measured flow, mucus-associated removal, and intracellular/extracellular Elafin with viability and damage. An endpoint retention image alone cannot identify all these rates.
