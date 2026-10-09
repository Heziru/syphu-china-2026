# Ecological competition: an uncalibrated scenario model

This is a teaching and design-exploration model created for the SYPHU-China wiki.
It is **not** an inferred microbiome network, a fitted EcN model, a patient
prediction, or evidence of efficacy, safety, clearance, or a clinical dose.

## Reproduce

Download ecology_scenarios.py and run:

    python ecology_scenarios.py

Python 3 standard library is sufficient. The script writes
ecology-scenarios.json alongside itself and runs its numerical self-checks.
The delivered JSON is the output of that script.

## States and equations

- x: normalized engineered EcN population
- y: normalized aggregate resident population (not a named taxon)
- p: normalized proposed PspA-related support
- L: relative Elafin product state

    dx/dt = x [rE (1 - x - alpha*y) - washE - bileStress/(1 + protection*p)]
    dy/dt = y [rR (1 - y - aRE*x) - washR]
    dp/dt = supportRate * (signal - p)
    dL/dt = qElafin*x - elafinLoss*L

All four equations are modelling hypotheses. All numerical parameters and
initial conditions are illustrative assumptions. No parameter was fitted to
measurements in the supplied project folder.

Model time is dimensionless. The curves do not represent days, CFU, percentages,
nM, or a clinical inflammatory score. Normalized populations need not sum to 1.

The hypothetical ROS signal is 1 from t=0 to 8 and 0 thereafter. It influences
the proposed support state only. **qElafin is constant**, so secretion per cell
is constitutive and is not ROS-gated. Changing the number of cells changes total
product. The PspA-to-bile-protection function is unmeasured and must be tested.

Initial state: [x,y,p,L] = [0.08,0.80,0,0].

Default parameters: rE=1; rR=0.8; aRE=0.25; washE=0.1; washR=0.1;
bileStress=0.35; protection=2; supportRate=0.8; qElafin=0.3;
elafinLoss=0.5. Resident competition alpha is 0.45, 0.80, or 1.10.
These are scenario choices, not biological estimates or literature values.

The support-off control sets the target support to zero but preserves all
other parameters. The script also checks protection=0, qElafin=0, absence of
engineered cells, finite nonnegative states, and the response to halving the
RK4 integration step from 0.02 to 0.01. Maximum sampled-state difference was
1.91e-10. These checks establish numerical consistency, not biological validity.

## Read the explorer

1. Select lower, intermediate, or higher competition.
2. Toggle the dashed support-off curves to compare otherwise matched runs.
3. Move the time slider to read values and locate them on each curve.
4. Switch the second graph between support and Elafin.
5. Orange shading marks the assumed signal-on window; a vertical line marks
   switch-off at t=8.

The population chart uses a fixed 0-to-1 y axis. The support chart also uses
0-to-1; Elafin uses a fixed 0-to-0.3 relative-unit y axis across all scenarios
and controls. This makes the three Elafin scenarios visually comparable.
Population, support and product are distinct states with different units.

## What this can and cannot say

Within the chosen assumptions, competition can oppose a protective response.
With weaker competition, the engineered population can remain even after the
signal falls. Neither a falling curve nor loss of support proves clearance.

The resident guild is a coarse abstraction. Cross-feeding, spatial structure,
immune interactions, species composition, metabolite mediation and evolutionary
change are not modelled. No real interaction coefficients can be inferred from
this exercise.

To become predictive, collect absolute-abundance co-culture time series,
matched PspA-on/off measurements under the same ROS and bile-acid conditions,
per-cell Elafin secretion and decay, and burden measurements. Fit parameters
on some conditions and test predictions on held-out perturbations.

## Model-form references

- Stein et al. (2013), Ecological Modeling from Time-Series Inference:
  https://doi.org/10.1371/journal.pcbi.1003388
  Supports the use of population interaction models and external forcing.
  No numeric values were borrowed from this paper.
- Momeni et al. (2017), Lotka-Volterra pairwise modeling fails to capture
  diverse pairwise microbial interactions:
  https://doi.org/10.7554/eLife.25051
  Explains limitations of pairwise microbial population models.

