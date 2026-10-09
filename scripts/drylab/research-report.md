# From ecological persistence to spatial Elafin availability

## Scope and evidence boundary

This study asks which mathematical conditions would be needed for an introduced EcN population to persist under competition, and how an assumed extracellular Elafin source would propagate through a simplified layer. It combines an analytic ecological model, reproducible parameter ensembles, an analytic diffusion–clearance solution and a conservative numerical discretization. It does not estimate patient response, dosing, CFU, physical mucosal thickness, protein concentrations in nM, or a therapeutic threshold.

The project architecture is **an external ROS-related input driving proposed PspA-related support, with constitutive intracellular Elafin expression**. The project documents do not establish a validated secretion apparatus. Extracellular Elafin could instead reflect background release, membrane damage or terminal lysis. Consequently, the coefficient `q` below is an **assumed effective extracellular release/source coefficient**. A constant `q` is a baseline approximation, not proof that intracellular expression produces proportional extracellular protein. ROS does not directly gate Elafin expression in these models.

All numerical parameter values, initial conditions, pulse schedules and parameter ranges in this analysis are illustrative assumptions. No microbiome abundance trajectories, co-culture measurements, calibrated PspA protection curve, release measurements or Elafin transport measurements were available to calibrate these modules. Numerical verification checks implementation of the equations; it does not validate the biological assumptions.

The structure of the report—question, assumptions, equations, computation, verification and limitations—takes presentation inspiration from the [Peking 2025 Model page](https://2025.igem.wiki/peking/model/). Its scientific parameter values and efficacy claims are not reused.

## 1. Ecological competition and a conditional support state

### 1.1 State variables and assumptions

Let `x=E/K_E` and `y=R/K_R` denote introduced EcN and an aggregate resident guild, each normalized to its own carrying scale. They are **not relative abundances that must sum to one**. Dimensionless time is `τ=t/t_E`, with no fitted conversion from `τ` to hours or days. Let `p∈[0,1]` be a normalized proposed support state, and let `L` be a well-mixed relative extracellular-product surrogate.

The two guilds compete through a pairwise Lotka–Volterra approximation. This mathematical form is useful for explicit invasion and stability calculations, but cannot represent an entire microbiome. For general precedent see [Stein et al., 2013](https://doi.org/10.1371/journal.pcbi.1003388); for failures of pairwise approximations outside appropriate conditions see [Momeni et al., 2017](https://doi.org/10.7554/eLife.25051). Neither paper supplies the numerical parameters used here.

The equations are

\[
\frac{dx}{d\tau}=x\left[r_E(1-x-\alpha y)-w_E-\frac{b_s}{1+\gamma p}\right],
\tag{1}
\]

\[
\frac{dy}{d\tau}=y\left[r_R(1-y-\beta x)-w_R\right],
\tag{2}
\]

\[
\frac{dp}{d\tau}=k_p\,[S(\tau)-p],\qquad
\frac{dL}{d\tau}=q x-k_L L.
\tag{3}
\]

Here `α` measures the resident effect on EcN; `β` measures the EcN effect on residents; `w_E,w_R` are population-loss terms; `b_s` is an assumed stress-loss amplitude; `γ` controls the assumed magnitude of support; and `k_p` determines response and relaxation speed. `q` is an effective extracellular release coefficient, held constant in the baseline. The well-mixed `L` equation and the spatial model below are **alternative descriptions of extracellular availability**: `L` is not fed into the spatial source, and their outputs must not be added.

The function `b_s/(1+γp)` is explicitly a hypothesis. It encodes decreased stress-related loss under support. The model cannot independently discover or prove that PspA protects EcN under bile or ROS exposure, because that direction of effect has already been built into Eq. (1). The ecological model also omits expression burden, host response, cross-feeding, changing carrying capacities, migration and individual resident taxa.

The baseline parameters are `r_E=1`, `r_R=0.8`, `α=0.8`, `β=0.25`, `w_E=w_R=0.1`, `b_s=0.35`, `γ=2`, `k_p=0.8`, `q=0.3` and `k_L=0.5`. Initial states are `(x,y,p,L)=(0.08,0.8,0,0)`. The input is `S=1` for `0≤τ<8` and `S=0` thereafter. The matched support-off control uses `S=0` throughout with every other parameter unchanged.

For nonnegative initial states, the positive quadrant is invariant: `x=0` and `y=0` are invariant axes, the product derivative is nonnegative at `L=0`, and `p` remains in `[0,1]` when its input remains in that interval. Logistic self-limitation bounds the populations. These properties provide implementation checks without imposing artificial clipping.

### 1.2 An invasion criterion

First freeze support at a constant value `p̄`. Define

\[
a(\bar p)=1-\frac{w_E+b_s/(1+\gamma\bar p)}{r_E},\qquad
b_R=1-\frac{w_R}{r_R}.
\tag{4}
\]

The population subsystem becomes `x'=r_E x(a−x−αy)`, `y'=r_R y(b_R−y−βx)`. For `b_R>0`, the resident-only equilibrium is `(0,b_R)`. Linearizing the EcN equation around that equilibrium gives

\[
\lambda_{\rm inv}=r_E\,[a(\bar p)-\alpha b_R]
=r_E(1-\alpha b_R)-w_E-\frac{b_s}{1+\gamma\bar p}.
\tag{5}
\]

Thus a sufficiently rare invader initially increases when `λ_inv>0` and decreases when `λ_inv<0`, provided the residents are near their resident-only equilibrium. This is not a criterion for the immediate sign of growth at an arbitrary finite-population state.

Put `G=r_E(1−αb_R)−w_E`. For `γ>0` and `0<G<b_s`, the neutral threshold is

\[
p_c=\frac{b_s/G-1}{\gamma}.
\tag{6}
\]

If `G≤0`, no finite support can make the invasion rate positive. If `G>b_s`, invasion is already positive without support. At `G=b_s`, the no-support case is neutral. If `0<G<b_s` but `p_c≥1`, the allowed support interval cannot produce strictly positive invasion. If `γ=0`, support has no effect and Eq. (6) is not used.

For the baseline, `b_R=0.875`, `p_c=0.375`, and `λ_inv=0.0833333` at constant `p=1`. These are scenario outputs, not measured EcN thresholds.

### 1.3 Equilibria, stability and priority effects

When `1−αβ≠0`, the candidate coexistence equilibrium is

\[
x_* = \frac{a-\alpha b_R}{1-\alpha\beta},\qquad
y_* = \frac{b_R-\beta a}{1-\alpha\beta}.
\tag{7}
\]

Both coordinates must be positive for biological admissibility. At a positive coexistence equilibrium, the Jacobian has

\[
\operatorname{tr}J=-r_E x_*-r_R y_*<0,\qquad
\det J=r_E r_R x_*y_*(1-\alpha\beta).
\tag{8}
\]

Hence a positive equilibrium is locally stable when `αβ<1` and a saddle when `αβ>1`. The engineered-only equilibrium `(a,0)` exists for `a>0`; its resident invasion rate is `r_R(b_R−βa)`. For positive `a,b_R`, the two invasion signs distinguish stable coexistence, EcN exclusion, resident exclusion or a priority-effect region with two stable boundary equilibria separated by a saddle. Exactly neutral boundaries and `αβ=1` are degenerate cases and are not described as ordinary stable regions.

At constant `p=1`, the baseline stable coexistence point is `(0.1041667,0.8489583)`. Figure 1A–B evaluates 25,921 `(α,γ)` pairs under constant `p=1`; Figure 1C evaluates 32,761 reciprocal-competition pairs. These are analytic parameter maps, not thousands of independent experimental observations.

### 1.4 A pulse is not a steady state

For the prescribed pulse and `p(0)=0`, the exact support state is

\[
p(\tau)=1-e^{-k_p\tau},\;\tau<8;\qquad
p(\tau)=(1-e^{-8k_p})e^{-k_p(\tau-8)},\;\tau\ge 8.
\tag{9}
\]

The baseline support crosses the frozen resident-only threshold after signal removal at `τ≈9.22396`. This crossing is only a reference to the rare-invasion criterion: it is **not a predicted collapse, clearance, treatment or biosafety time**. The resident and EcN states are not frozen in the actual pulse integration. At `τ=24`, the baseline normalized EcN state is approximately `0.00791692`, versus `0.00165638` in the matched support-off control.

One hundred additional constant-support parameter sets were integrated independently with adaptive DOP853 and compared with Eq. (7) or the resident-only equilibrium. For 98 sets away from neutrality, maximum absolute error at `τ=1600` was below `1.9×10⁻¹⁰`. Two near-neutral sets had errors as large as `3.21×10⁻⁴`; extending those integrations to `τ=24000` reduced the maximum to `3.02×10⁻¹¹`. This critical slowing is reported explicitly rather than hidden by declaring a finite simulation endpoint to be equilibrium.

## 2. Parameter uncertainty and sensitivity

The global scenario ensemble uses a seeded 512-point Latin-hypercube design with independent uniform ranges: `α∈[0.35,1.25]`, `β∈[0.1,0.6]`, `b_s∈[0.2,0.5]`, `γ∈[0,4]`, `w_E∈[0.05,0.2]`, `q∈[0.15,0.6]`, `k_L∈[0.25,1]` and `k_p∈[0.4,1.6]`. Each set is integrated with support and its matched support-off control. The ranges represent deliberate mathematical exploration, **not literature-derived biological uncertainty distributions**.

Outputs are EcN AUC, relative `L` AUC and EcN at `τ=24`. The shading in Figure 2 is the empirical 5th–95th percentile envelope of the assumed scenarios. It is not an experimental confidence interval or a calibrated posterior predictive interval. For example, the assumed ensemble spans approximately `1.01×10⁻⁶` to `0.272` in the 5th–95th percentiles of EcN at `τ=24`; the width reflects the chosen ranges and equations.

For sensitivity, each parameter and output is ranked across the scenarios. Each ranked input and ranked output is residualized against the other seven ranked inputs plus an intercept. The Pearson correlation between their residuals is the partial rank correlation coefficient (PRCC). The interval shown is a percentile interval from 256 bootstrap resamples of the scenario rows. It estimates the numerical stability of this scenario association, not biological confidence. These are global monotonic associations, **not variance-based Sobol indices, causal effect sizes or experimental significance tests**. PRCC can miss nonmonotonic behavior and depends on parameter ranges; the scatter panel is retained to expose spread and interactions rather than relying only on a ranking.

The constant-source `q` and product-loss `k_L` have no feedback into the population equations. Their effects on product AUC, and their absence from EcN dynamics, partly follow directly from model structure. An experiment measuring release and decay would therefore be more informative than interpreting these mathematical correlations as discoveries about expression biology.

## 3. A spatial diffusion–clearance model

### 3.1 Conservation and nondimensionalization

Consider a one-dimensional layer `0≤z≤H`, with an effective source at `z=0` and a phenomenological exchange boundary at `z=H`. Let `C(z,t)` denote extracellular Elafin concentration. Assume constant diffusivity `D`, first-order loss `k`, and boundary exchange coefficient `h`. No advection, binding, spatial EcN distribution, heterogeneous mucus pores, immune feedback or concentration-dependent degradation is included.

Conservation with Fickian flux gives

\[
\partial_t C = D\partial_{zz}C-kC,\qquad
-D\partial_z C(0,t)=J(t),\qquad
-D\partial_z C(H,t)=hC(H,t).
\tag{10}
\]

The signs specify positive input at the left and positive outward flux at the right. The Robin boundary is a mathematical exchange/loss boundary; it is **not a calibrated epithelial uptake law or a therapeutic target**.

Choose `ξ=z/H`, `τ=t/t_E`, `c=CD/(J_ref H)` and `j=J/J_ref`. Define

\[
\delta=\frac{Dt_E}{H^2},\quad
\mathrm{Da}=\frac{kH^2}{D},\quad
\mathrm{Bi}=\frac{hH}{D}.
\tag{11}
\]

The dimensionless problem is

\[
\partial_\tau c=\delta(\partial_{\xi\xi}c-\mathrm{Da}\,c),\qquad
-c_\xi(0,\tau)=j(\tau),\qquad
-c_\xi(1,\tau)=\mathrm{Bi}\,c(1,\tau).
\tag{12}
\]

The baseline source is `j(τ)=q x(τ)` with constant effective release coefficient `q`; `c(ξ,0)=0`. Parameters `Da=Bi=δ=1` are assumed dimensionless reference values. No values of `D,k,h,H` are claimed for Elafin or diseased mucus. The same `Da` and `Bi` can arise from many dimensional parameter combinations, so these plots cannot identify physical permeability or clearance separately.

### 3.2 Closed-form steady state

For constant `j`, set the time derivative to zero. The spatial equation is `c''−Da c=0`. For `s=√Da>0`, represent its solution in coordinates centered on the far boundary:

\[
c(\xi)=A\cosh[s(1-\xi)]+B\sinh[s(1-\xi)].
\]

The Robin condition yields `sB=Bi A`. The left flux condition yields `j=A[s sinh(s)+Bi cosh(s)]`. Therefore

\[
c_*(\xi)=j\,\frac{\cosh[s(1-\xi)]+(\mathrm{Bi}/s)\sinh[s(1-\xi)]}
{s\sinh s+\mathrm{Bi}\cosh s}.
\tag{13}
\]

In particular,

\[
c_*(1)=\frac{j}{s\sinh s+\mathrm{Bi}\cosh s},\qquad
\frac{F_{\rm out,*}}{j}=\frac{\mathrm{Bi}}{s\sinh s+\mathrm{Bi}\cosh s}.
\tag{14}
\]

This outflow/source ratio describes transport partitioning only. At `Da=Bi=1`, it equals `e⁻¹≈0.367879`. The ratio is independent of `δ` because `δ` changes the time to approach steady state without changing the steady equation. For `Da→0` and `Bi>0`, the solution tends to `c_*=j(1−ξ+1/Bi)`, and all steady input exits through the far boundary. For `Bi=0,Da>0`, far-boundary outflow is zero and input is removed within the domain. If both `Da` and `Bi` vanish with positive constant input, no finite steady state exists.

### 3.3 A mass-balance identity

With `M(τ)=∫₀¹c(ξ,τ)dξ`, integrate Eq. (12):

\[
\frac{dM}{d\tau}=\delta\left[j-\mathrm{Bi}\,c(1,\tau)-\mathrm{Da}\,M\right].
\tag{15}
\]

For zero initial concentration, time-integrated source equals time-integrated outflow plus in-domain loss plus final stored mass divided by `δ`. For the baseline coupled calculation over `τ=0–24`, the respective terms are approximately `0.36992884`, `0.13540049`, `0.23287641` and `0.00165194`, with balance residual `1.01×10⁻¹³`. Their units are relative model amounts; none is a administered dose or an absorbed patient amount.

### 3.4 Conservative finite-volume discretization

Divide the unit interval into `N` cells of width `Δξ=1/N`, with cell centers `ξ_i=(i+1/2)Δξ`. Internal fluxes are `F_{i+1/2}=−(c_{i+1}−c_i)/Δξ`. The source face has `F_0=j`. The last half-cell and Robin boundary form two resistances in series:

\[
F_N=\frac{\mathrm{Bi}}{1+\mathrm{Bi}\,\Delta\xi/2}\,c_{N-1}
\equiv g\,c_{N-1}.
\tag{16}
\]

Using `Bi*c_last` without the half-cell correction would place the boundary at the last cell center and change the discrete problem. The cell balance is `c_i'=δ[(F_i−F_{i+1})/Δξ−Da c_i]`. Internal face fluxes cancel exactly when summing cells, leaving Eq. (15) in discrete form.

Writing `c'=A c+b j`, Crank–Nicolson is

\[
(I-\tfrac12\Delta\tau A)c^{n+1}
=(I+\tfrac12\Delta\tau A)c^n
+\tfrac12\Delta\tau\,b(j^n+j^{n+1}).
\tag{17}
\]

The matrix is tridiagonal and solved with the existing SciPy banded solver. The coupled figures use `N=120` and `Δτ=0.02`. The spatial source is sampled from RK4 ecological trajectories. Pulse discontinuities are aligned to the ecological integration grid; the same input is used throughout each RK4 step before a switch.

## 4. Verification: tests with separate purposes

1. **Steady continuum benchmark:** six grids from 15 to 480 cells are compared at cell centers with Eq. (13). The observed maximum-error order approaches two (`1.94,1.97,1.985,1.993,1.996`). Boundary-flux errors are also retained in the CSV.
2. **Smooth time-integration benchmark:** use a positive lowest eigenmode of the same tridiagonal spatial operator as the initial state, zero input, and compare against `exp(λτ)` times that mode. RMS errors at matched times give orders `2.0019,2.00048,2.00012,2.00003`. This isolates Crank–Nicolson's second-order temporal behavior without conflating spatial error.
3. **Discontinuous startup diagnostic:** a suddenly applied source excites high-frequency modes. Crank–Nicolson is A-stable but not L-stable, so coarse startup errors do not follow a clean two-order sequence. These measured errors are preserved separately in `discontinuous-startup-errors.csv`; they are not presented as a second-order proof.
4. **Practical coupled convergence:** recompute both ecology and transport at `Δτ=0.04,0.02,0.01,0.005` versus `0.0025`. At the displayed `0.02`, the outflow-AUC relative difference is `3.31×10⁻⁷`; at `0.005` it is `1.58×10⁻⁸`. Final-profile errors are recorded independently.
5. **Ecological convergence:** pulse-aligned RK4 steps `0.08,0.04,0.02,0.01` approach a reference step `0.0025` with approximately fourth-order state error.
6. **Conservation and limiting cases:** zero source yields zero product, zero EcN yields zero population-dependent release, `γ=0` makes support/control population trajectories identical, `q=0` yields zero `L`, `Bi=0` yields zero boundary outflow, `Da→0` recovers the linear profile, and doubling the spatial source doubles concentration to numerical precision.

All displayed computations are finite and nonnegative to numerical tolerance without clipping negative values away. Assertions stop the script if these checks fail. Verification is distinct from fitting or external validation.

## 5. A structural challenge: more retained cells need not mean more extracellular protein

The constant-`q` baseline predicts more integrated extracellular source when support retains more EcN. This is conditional on the release law, not an experimentally established benefit. To test that dependence, keep exactly the same EcN, support and transport trajectories/parameters but replace the source with

\[
j_{\rm alt}(\tau)=q_0 x(\tau)
\left[\epsilon+\frac{1-\epsilon}{1+\eta p(\tau)}\right].
\tag{18}
\]

The parameter `ε` is a hypothetical support-independent release fraction; `η` controls how strongly a damage-associated release component would decline under support. This law is a deliberately uncalibrated structural counterexample. It does not establish a damage mechanism or introduce ROS-gated Elafin expression. It also does not resolve terminal lysis events, biomass consumed by release, or intracellular protein accumulation.

When `η=0` or `ε=1`, Eq. (18) reduces to the constant-source baseline. The support-off control has `p=0`, so its source is unchanged for every `(ε,η)`. At `ε=0.05`, assumed values `η=0,2,8,32` give boundary-outflow AUC ratios to that control of approximately `2.686,1.654,1.133,0.794`. Thus an explicit alternative release assumption can reverse the comparison while leaving the EcN trajectory unchanged. The 3,315-point `(η,ε)` map locates this conditional reversal; its area is not the probability of a biological outcome.

Linearity of the transport operator allows sources to be mixed without independently integrating every `ε`: solve the constant and damage-linked components for each of 65 `η` values, then combine them for 51 `ε` values. A direct solve checks this shortcut; discrepancy is below `1.2×10⁻¹⁶` in the reference run.

This structural sensitivity motivates a concrete measurement: quantify **intracellular and extracellular Elafin separately**, alongside viable EcN and membrane integrity/lysis, under matched support-on and support-off conditions. Without that measurement, retained-cell counts alone do not determine extracellular availability.

## 6. What should be measured before calibration

- Absolute viable EcN and resident abundance over co-culture time, including controlled starting proportions, to distinguish growth, competition and loss.
- Matched support-on/off growth and loss under the same ROS-related and bile-related conditions. The assumed saturating protection function should be compared against alternatives.
- Intracellular Elafin, extracellular Elafin, membrane integrity and lysis in the same samples, to distinguish expression from release. Release per viable cell need not be constant.
- Extracellular Elafin decay and transport through a controlled layer of known geometry, with input and output mass balances.
- Held-out initial conditions and perturbations to test out-of-sample predictions after parameters are estimated. More simulated precision cannot substitute for these data.

No single fitted number would identify all mechanisms: loss and competition may compensate in population trajectories; production and release may compensate in extracellular signal; and the spatial steady profile depends on dimensionless groups rather than separately identifying every physical coefficient.

## 7. Figure and data guide

**Figure 1 — `01-ecological-landscape`:** invasion-rate map and neutral boundary; normalized stable EcN equilibrium; reciprocal-competition regimes; pulse trajectory with a frozen-state threshold reference. Constant-support panels and pulse panel are deliberately distinguished.

**Figure 2 — `02-uncertainty-sensitivity`:** 512-set scenario envelopes for EcN and relative `L`; global PRCC with bootstrap intervals; parameter-outcome scatter. The shading is parameter-scenario spread, not experimental error.

**Figure 3 — `03-spatial-transport`:** actual finite-volume space-time array; transient spatial profiles; source and boundary flux comparison; integrated mass accounting. All panels share the same default transport calculation.

**Figure 4 — `04-transport-landscape`:** analytic steady profiles; 3D surface and contour map of the analytic outflow fraction; distinct time-scale transients with the same steady state. No anatomical 3D structure is inferred.

**Figure 5 — `05-numerical-verification`:** spatial, smooth temporal and ecological convergence plus limiting-case checks. The startup diagnostic and coupled convergence CSVs supplement this figure.

**Figure 6 — `07-release-law-sensitivity`:** alternative effective release laws, matched outflow curves, structural reversal map and integrated comparisons. This is a test of a modelling assumption, not a release-mechanism result.

Every figure is available as PNG, SVG and PDF. `research-summary.json` records assumptions, parameters, scalar results, checks, software versions and array descriptions. The CSV files contain the numeric values plotted, including the phase maps and parameter samples. `spatial-preview.json` provides a downsampled interactive array; `spatial-full-array.npz` in the repository's raw-output directory preserves full spatial arrays. `manifest.json` records SHA-256 hashes.

## 8. Reproduction

The script uses existing Python, NumPy, SciPy and Matplotlib. The reference environment is Python 3.12, NumPy 2.1.2, SciPy 1.15.2 and Matplotlib 3.10.1. No downloads, remote datasets, hidden services, MATLAB installation, patient inputs or API keys are required.

From the repository run:

```sh
python scripts/drylab/research_models.py
```

For a downloaded standalone script, run:

```sh
python research_models.py --output-dir ./research-results
```

The seed is `20261008`. A typical reference run takes approximately 40 seconds. The script regenerates numerical arrays, parameter maps, CSVs, six multi-panel figures in three formats, checks and the JSON summary. Exact floating-point errors and figure-file hashes can vary across library versions; formulas, assumptions, seeds and output schema are explicit.
