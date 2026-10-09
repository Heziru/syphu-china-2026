# Human Elafin: actual docking and explicit-water molecular dynamics

This directory contains newly computed, coordinate-based research results. It is not an image-generation mockup. Original team source files were not modified.

## Identity and evidential boundaries

- 1FLE: published 1.90 Å X-ray structure; porcine pancreatic elastase chain E and human Elafin chain I. Elafin has 47 resolved residues, mature numbering 11–57. This is the known-pose redocking benchmark, not the human NE target.
- 2REL: 11-model solution NMR ensemble of mature human Elafin (57 residues). New MD and cross-docking use model 1, chain A. The WAP domain corresponds to mature residues 9–57, UniProt precursor residues 69–117.
- 2Z7F: published 1.70 Å structure of human NE and SLPI. ONLY human NE chain E is extracted for new docking; the SLPI ligand is removed. The original team's long 2Z7F complex trajectory cannot be relabelled as Elafin MD.
- HDOCK scores are ranking potentials, not binding free energies, dissociation constants, or efficacy estimates. A post-hoc geometric screen is not independent validation.
- The MD system contains isolated Elafin, water and ions. It does not contain either protease and cannot validate a docking complex.

## Environments

Analysis: Python 3.12.7, NumPy 2.1.2, SciPy 1.15.2, Matplotlib 3.10.1, Pillow 11.1.0. Exact analysis dependencies are in `requirements-analysis.txt`.

MD: OpenMM 8.6.1, `requirements-md.txt`; runs used OpenCL mixed precision on AMD Radeon 780M. CPU fallback is supported but substantially slower. `runtime.py` uses a temporary ASCII drive alias on Windows to load plugin DLLs from a Unicode repository path, then removes the alias immediately. No external drive data are scanned or modified.

Docking: official HDOCKlite 1.2 Linux binaries, run under Ubuntu WSL, and FFTW3. HDOCKlite is free for academic/noncommercial use but its license prohibits redistribution outside the user's group/laboratory. **No HDOCK executable is included in the downloadable bundle.** Obtain it independently from https://github.com/huang-laboratory/HDOCKlite and follow its license; executable hashes are in `software-provenance.json`. HDOCK binaries are expected under `outputs/dry-lab-atomistic/hdocklite/`. On a standard Linux installation with system FFTW, the optional local `runtime/usr/lib/x86_64-linux-gnu` search path can be omitted.

Rendering: local 3Dmol.js 2.5.5 (MIT) and the repository's Playwright/Edge browser launcher. The Node dependency manifest and vendor license are included in the full research bundle; install the declared Node dependencies before rendering. No external image-generation service produces these molecular views.

## Reanalyse the supplied results without rerunning simulations

Run from the extracted full research bundle/repository root, retaining its directory structure:

```bash
python scripts/drylab/atomistic/analyze_docking.py
node scripts/drylab/atomistic/render_docking.mjs
python scripts/drylab/atomistic/analyze_md.py
python scripts/drylab/atomistic/plot_atomistic.py
python scripts/drylab/atomistic/validate_atomistic.py
```

The standalone scripts beside this README are convenient source downloads. For execution use the canonical `scripts/drylab/atomistic/` versions: they intentionally resolve the repository root relative to that path. `analyze_md.py` creates its output working directory automatically. Analysis reads only completed replicas with `run.json`; partial ongoing trajectories are never interpreted as complete runs.

## Rerun the actual protein–protein docking

```bash
python scripts/drylab/atomistic/prepare_docking.py
bash scripts/drylab/atomistic/run_docking.sh
python scripts/drylab/atomistic/analyze_docking.py
node scripts/drylab/atomistic/render_docking.mjs
python scripts/drylab/atomistic/plot_atomistic.py --only docking
```

`prepare_docking.py` creates heavy-atom, separate-chain inputs with a deterministic ligand rotation (Euler xyz 37, −63, 101 degrees) and translation (80, −40, 65 Å). HDOCK's default grid spacing is 1.2 Å, its angular interval 15°, and its global search samples 4,392 rotations. No binding-site restraint is supplied. `createpl` returns 100 representative poses using its default 5.0 Å RMSD clustering cutoff; reported rank means the original order of these representatives, not the row number in the raw search output. Each case retains original `model_1.pdb` through `model_100.pdb`, `docking.out`, logs, input hashes, and provenance. To force a fresh search when outputs exist, archive/rename the case output directory before `prepare_docking.py`; never overwrite evidence unintentionally.

1FLE evaluation definitions:

- Ligand RMSD: N/CA/C/O atoms of Elafin after least-squares fitting receptor N/CA/C/O atoms to native 1FLE, preserving residue insertion codes.
- Interface RMSD: best-fit N/CA/C/O RMSD over residues participating in a native interchain heavy-atom contact below 10 Å.
- Fnat: recovered native interchain residue contacts divided by native contacts; both use strictly <5 Å heavy-atom distances.
- HDOCK's embedded `REMARK RMSD` is not used, because it measures displacement relative to the deliberately translated ligand input, not the native complex.

Human NE post-hoc screen: require Elafin Ala24 C–NE Ser195 OG <5 Å and zero interchain heavy-atom pairs below 2 Å, then retain the original best HDOCK rank among passing poses. The 2 Å flag is a simple geometric clash diagnostic, not a universal molecular-interaction classification. Rank 29 passes; rank 1 does not place the reactive-site carbonyl near Ser195. The screen and its 3–6 Å sensitivity are published in `docking-summary.json`. No experimental pose validates this cross-docking.

The source chains' deposited HELIX/SHEET records are transferred with rigid monomers for cartoon rendering; actual 3Dmol h/s/c residue counts are recorded. PDB records are padded to 80 columns because 3Dmol 2.5.5 otherwise clears deposited secondary-structure metadata at an unpadded literal END record. Display derivatives also assign globally unique atom serial numbers: raw HDOCK files preserve separate monomer numbering and may contain duplicate serials across chains. These display formatting corrections leave atom identity, coordinates and original prediction rank unchanged. Static interface views select residues by both chain and residue number.

## Rerun the Elafin MD pilots

```bash
python scripts/drylab/atomistic/prepare_md.py
python scripts/drylab/atomistic/run_md.py --replicas 3 --production-ps 1000
python scripts/drylab/atomistic/analyze_md.py
python scripts/drylab/atomistic/plot_atomistic.py --only md
```

Before a fresh MD run, archive/rename existing `public/assets/dry-lab/atomistic/md/replica-*` and `outputs/dry-lab-atomistic/replica-*` directories. The hardened runner reuses a completed result only when its duration and preparation fingerprint match; published runs launched before that guard was added intentionally do not silently reuse. Running `prepare_md.py` again rebuilds solvent/hydrogens and may produce a different microscopic starting configuration even with the same preparation seed. To rerun with the identical prepared input, keep the supplied `system.xml`, `minimized-state.xml`, `solvated-minimized.pdb` and `protein-prepared.pdb`, and start at `run_md.py` after archiving previous replica outputs. OpenCL stochastic trajectories are not promised bitwise-identical across hardware; reanalysis of supplied NPZ coordinates is deterministic to numerical precision.

Preparation and integration:

- 2REL first conformer, 57 residues, 830 protein atoms; regenerate hydrogens at pH 7.4.
- AMBER ff14SB (`amber14/protein.ff14SB.xml`) and TIP3P-FB (`amber14/tip3pfb.xml`). `addSolvent(model='tip3p')` selects three-site water geometry; the force-field XML supplies the TIP3P-FB parameters.
- Dodecahedral periodic box, 1.0 nm initial padding, 0.15 M NaCl plus neutralization; 4,008 waters, 11 Na+, 14 Cl−, 12,879 total atoms.
- Four disulfides: mature Cys16–45, 23–49, 32–44, 38–53; explicitly present as covalent topology.
- PME, 0.9 nm real-space cutoff, Ewald tolerance 0.0005; hydrogen-bond constraints, rigid water, constraint tolerance 1e−6.
- Energy minimization: at most 2,000 iterations, 10 kJ mol−1 nm−1 force tolerance.
- Langevin-middle at 300 K, friction 1 ps−1, 2 fs step; Monte Carlo barostat 1 bar every 25 steps in NPT.
- Independent velocity seeds 20261110, 20261211, 20261312; barostat seeds one greater.
- Each replica: 20 ps NVT backbone restraint k=1000, 30 ps NPT k=250, 50 ps NPT k=0, then 1 ns unrestrained NPT production. k units: kJ mol−1 nm−2. Periodic harmonic distance is used for the restraint.
- Production output interval: 5 ps; 201 NPZ coordinate frames including t=0 and 200 DCD frames. The equilibration trajectory is excluded from production analysis.

MD observables:

- Reconstruct the entire covalently connected protein under the triclinic periodic box using nearest-image bond vectors. Reject non-finite positions and implausible covalent geometry before analysis.
- Cα RMSD relative to the minimized structure, with independent least-squares fits of all residues 1–57 and WAP residues 9–57.
- Per-replica temporal Cα RMSF about its own 200–1000 ps average after fitting WAP Cα atoms. This is not NMR ensemble dispersion.
- All-protein mass-weighted radius of gyration.
- Intramolecular Cα contact occupancy below 8 Å over 200–1000 ps, excluding |i−j| ≤3; mean across replicas gives equal weight to each replica, not independent biological replicates.
- SG–SG distances are a check of an explicitly bonded force-field topology, not an independent measure of disulfide stability or redox chemistry.
- Temperature/density curves are direct output samples without smoothing. No convergence, binding-energy or clinical claim is inferred from 1 ns pilots.

## Files and audit trail

- `md/system.xml`, `integrator-template.xml`, `minimized-state.xml`: exact serialized prepared system/integrator/state.
- `md/topology-atoms.csv`, `topology-bonds.csv`: connectivity and atom parameters.
- `md/replica-N/protein-coordinates.npz`: time, protein coordinates (nm), triclinic box vectors (nm).
- `md/replica-N/protein-trajectory.dcd`, `protein-final.pdb`, start/final state XML and per-run metadata.
- `md/replica-N/thermodynamics.csv`, `dynamics.csv`, `rmsf.csv`, `contact-occupancy.csv`: direct and analysed observables with units.
- `docking/*/model_1.pdb` … `model_100.pdb`: original HDOCK ranks; formatting-enhanced cartoon and selected-candidate PDBs are additional files, not replacements.
- `attempt-history.json`: discarded pre-production NaN test and correction. That failed attempt contributes no production frame or result.
- `docking-summary.json`, `md-summary.json`, `software-provenance.json`: provenance, checksums, methods and actual completed-run counts.
- `validation.json`: independent DCD/NPZ agreement, frame-count, finite-coordinate and figure-content checks. `validate_atomistic.py` requires all three completed replicas, so it cannot accidentally approve a partially complete run.
- Full-solvent DCD trajectories/checkpoints remain in `outputs/dry-lab-atomistic/replica-N/` in the working repository. They are excluded from the lightweight website research archive. Protein trajectories and full serialized prepared/final states are included, sufficient for the published analysis and for rerunning the specified simulation.

## Scientific sources

- HDOCK: Yan et al., Nature Protocols (2020), https://doi.org/10.1038/s41596-020-0312-x ; software https://github.com/huang-laboratory/HDOCKlite
- OpenMM: Eastman et al., PLOS Computational Biology (2017), https://doi.org/10.1371/journal.pcbi.1005659 ; https://docs.openmm.org/latest/userguide/
- ff14SB: Maier et al., JCTC (2015), https://doi.org/10.1021/acs.jctc.5b00255
- TIP3P-FB / ForceBalance: Wang et al., JPCL (2014), https://doi.org/10.1021/jz500737m
- Structures: https://www.rcsb.org/structure/1FLE , https://www.rcsb.org/structure/2REL , https://www.rcsb.org/structure/2Z7F
