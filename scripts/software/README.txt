Mototype Studio — SYPHU-China Software workbench
Core: mototype-kinetics/0.2.0
Integration: Wiki workbench, CSV/JSON import, inline CSV editor and run report,
HTML/CSV/JSON export, operation recordings, CLI replay.
License: CC BY 4.0, matching this repository. See LICENSE; no OSI license claim.

Quick start (Node.js 22.14+; no npm installation required for the core)
Run from this extracted package directory:
  node --experimental-strip-types scripts/software/mototype.mjs examples/synthetic-decay.csv --stage verify > result.json
  node --experimental-strip-types scripts/software/mototype.mjs result.json > replay.json
  node --experimental-strip-types scripts/software/observed-check.mjs
  node --experimental-strip-types scripts/software/kinetics-check.mjs
  node --experimental-strip-types scripts/software/replay-check.mjs

Options: --stage early|learn|verify, --threshold 0..1000000,
--tolerance 1..20 RFU, --wait-cost 0..1 per hour.
Diagnostics go to stderr; stdout contains the recomputed JSON record.
The Node type-stripping warning is expected on Node 22.14.

The three examples are synthetic, not SYPHU-China wet-lab measurements:
synthetic-decay.csv: known single-exponential response with a residual plateau.
model-mismatch.csv: early fit fails on later data at the default 5 RFU budget.
reporting-limit.csv: a bounded late reading prevents a complete holdout check.

CSV identity and schema:
B1, B2 and B3 are separate biological replicates of C-DEMO-r1 / ENV-DEMO-01.
The environment event is at experimental time 2 h; input times span 0–6 h.
Sample time and read time are separate; times support h or min.
The model requires exact training readings in RFU / reader-demo-01.
The CSV header in each example lists the required fields. Unknown columns,
duplicate IDs/times, inconsistent exact/bound qualifiers and invalid numbers
are rejected. Do not map unrelated samples into this identity scheme.
The browser asks the user to confirm that mapping; using the CLI means the
operator supplies a file following this fixed schema.

Model and validation:
y_r(t) = P_r + A_r exp(-k t), P_r,A_r >= 0, shared k.
Scan 401 logarithmically spaced rates in [0.001,10] h^-1, then refine the
minimum. Candidate curves retain the best nonnegative amplitudes and
plateaus at each scanned rate and satisfy RMSE <= minimum RMSE + delta.
Their envelope is not the set of all compatible parameters or a confidence
interval. An empty coarse-grid candidate set pauses scoring.
Early fits 0–1 h after the event; learn/verify fits 0–2 h.
Verify requires all late readings to be usable and B1–B3 to cover 4 h +/-0.1 h.
Every late prediction error must be <= delta; missing/bounded records do not
silently pass. Dynamic parameters require additional range diagnostics.

Sampling score:
J(t) = mean_r[(range_r/delta)*4*p_r*(1-p_r)*I(range_r>=delta)]
       / (1 + waitCost*(t-now))
Only future candidates among 2,3,4 h are scored. Candidate fractions are not
probabilities. This is a proposed heuristic, not information gain or a proven
optimal design. delta is an exploratory setting, not calibrated instrument
precision. No wet-lab validation or experiment-saving benchmark is claimed.

Saved runs:
Input CSV and settings are retained with results and the engine version.
On import, the CSV is validated and numerical outputs recomputed; cached
analysis is ignored. The saved environment, replicate and readout context
must match the fixed contract. Source type is retained as a declared label,
not independently verified provenance. Imported first-check history is ignored;
opening a saved holdout records a fresh first budget before further edits.
The browser compares the current budget with its first holdout check in this
session. Budget changes after viewing the holdout are exploratory reassessment.
The all-observed window requirement remains separate from model predictions.

Package structure:
src/contents/software/engine/   numerical core, parser and replay validation
scripts/software/              CLI and independent checks
examples/                      synthetic CSVs
src/contents/software/MototypeWorkbench.tsx, SoftwareDemos.tsx and software.css
                               Wiki UI integration sources for inspection
The UI uses the existing Wiki's React/Vite build and surrounding page styles.
This small download does not contain the complete Wiki or a standalone web
server. The CLI works independently. The research/MD archive is separate.

References:
https://www.graphpad.com/guides/prism/latest/curve-fitting/reg_classic_1decay.htm
https://pmc.ncbi.nlm.nih.gov/articles/PMC2743521/
Page organization references (no models or data copied):
https://2024.igem.wiki/vilnius-lithuania/software/
https://2025.igem.wiki/bit-china/software
