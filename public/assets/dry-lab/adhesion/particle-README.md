# Particle transport replay

Fixed-seed numerical trajectories, not random visual decoration or observed EcN tracks.

## Geometry and status

The solver uses a flat computational strip: axial coordinate s in [0,1800] µm and transverse y in [0,180] µm. For display only, a cubic spline passes through chosen ascending, transverse, descending, sigmoid and rectal control points. Its sampled arclength fraction is indexed by s/L; y/H maps across the local normal between lightly scalloped walls. The displayed X,Y use arbitrary schematic units, not micrometres or organ dimensions. This creates a recognisable colon outline without solving a curved-domain velocity field, metric diffusion, pressure, peristalsis or patient anatomy. Display-space area density is not physical concentration. It is a chip-scale illustration of a post-release colonic-mucosal retention question, not organ CFD.

Both displayed walls are reactive. The previous finite-volume module uses one reactive wall and a different downstream diffusion boundary, so its numerical values are not interchangeable with this replay.

## Model

Free particles follow dS = 6 U (y/H)(1−y/H) dt + sqrt(2D) dW_s and dY = sqrt(2D) dW_y. Independent Gaussian increments are sampled at dt=0.01 s. The inlet reflects; a sampled endpoint S>=L exits irreversibly. This is a time-discrete absorbing-endpoint approximation, not exact Brownian first-passage detection. Both transverse walls mirror-reflect unless a crossing is adsorbed.

For the **crossed-endpoint Euler scheme**, adsorption probability per crossing is p=κ sqrt(π dt/D). This is not a rate-times-dt rule and does not detect Brownian-bridge encounters. Its small-step Robin limit is κ=P sqrt(D/π) when p=P sqrt(dt). A local derivation: an initially uniform near-wall density c has c sqrt(D dt/π) crossing endpoints per unit wall length during a step; multiplying by p gives κ c dt. See Erban & Chapman (2007), section 2.2 equation (10), https://doi.org/10.1088/1478-3975/4/1/003, with the primary full text at https://people.maths.ox.ac.uk/erban/papers/PhysicalBiology.pdf (page 4); their equation (9) uses a different bridge-corrected rule and a factor of two. See also Singer et al. (2008), https://doi.org/10.1137/060663258. These establish the method, not our biological parameter values.

Attached particles remain at their attachment coordinate. In a step they leave with probability 1−exp[−(koff+ks)dt]; conditional on leaving, koff/(koff+ks) detach and ks/(koff+ks) enter the absorbing shed ledger. A detached particle starts at the same wall and resumes reflected diffusion on the next step. Newly attached particles first undergo hazards in the following step. This splitting and the discrete boundary rule require a time-step check.

κ=1 µm/s, koff=.005/s, ks=.002/s, U=90 µm/s and effective D=100 µm²/s are the existing uncalibrated assay scenarios. The 180 µm transverse scale was motivated by the earlier chip literature audit; length and the schematic colon embedding are chosen. D is coarse-grained cell dispersion, not molecular Brownian diffusivity. The initial pulse is a truncated axial Gaussian centred at .1L, SD=.035L, uniform across y; no subsequent injection.

No specific engineered adhesin, wall-site saturation, growth, mucus penetration, PspA-mediated attachment or validated Elafin secretion is introduced. Attached and shed denote model states, not measured phenotypes.

## Replay and bookkeeping

N=4000, seed=202610093, 0–180 s, one recorded frame per second; 600 fixed, uniformly indexed IDs are displayed. The full counts always satisfy Free+Attached+Exited+Shed=N. Terminal positions are frozen bookkeeping coordinates. Hide states 2/3 in the channel and show them only in the cumulative counters; do not scatter invented exited/shed locations. Counters describe all 4000 particles, not just the 600 drawn. Dot size is for visibility and not bacterial scale. Display coordinates are rounded to .001 schematic units for JSON; final cohort CSV retains full precision.

JSON has geometry wall polylines, fixed particle_ids, time_s, and frames with particles [[X,Y,state],...] plus ledger and display_ledger. State 0=Free (blue), 1=Attached (red), 2=Exited (purple), 3=Shed (grey). particle-preview.json contains the actual 20 s frame.

## Verification

The script checks integer ledger closure and bounded finite positions, zero-κ absence of attachment/shedding, and competing exponential hazards against exact multinomial probabilities. dt=.04/.02/.01 s are each run with six independent seeds and 6000 particles per seed to 60 s. Reported 95% t intervals quantify variability between numerical seeds; they are not experimental or biological confidence intervals. Resolution differences and pooled standard errors are included rather than claiming convergence from three noisy trajectories or assigning a deterministic order.

Reproduce with `python particle-transport.py --output-dir .` using NumPy, SciPy, Matplotlib and Pillow. This download is the same script as `scripts/drylab/adhesion/particle_transport.py`. All generated filenames begin particle-.
