"""Build a chemically specified, explicit-solvent human Elafin pilot from 2REL model 1."""
import csv
import hashlib
import json
import platform as platform_info
import random
import shutil
import time
import numpy as np
from runtime import ROOT, OUT, WORK, platform, load_plugins
import openmm as mm
from openmm import app, unit

random.seed(20261009)
np.random.seed(20261009)
target = OUT / "md"
target.mkdir(exist_ok=True)
source = ROOT / "public/assets/dry-lab/structures/2rel.pdb"
shutil.copyfile(source, target / "2rel-original.pdb")
pdb = app.PDBFile(str(source))
modeller = app.Modeller(pdb.topology, pdb.positions)
modeller.delete([a for a in modeller.topology.atoms() if a.element in [app.element.hydrogen]])
residues = list(modeller.topology.residues())
assert len(residues) == 57 and {r.chain.id for r in residues} == {"A"}
ss = sorted(tuple(sorted((int(a.residue.id), int(b.residue.id)))) for a,b in modeller.topology.bonds()
            if a.name == "SG" and b.name == "SG")
assert ss == [(16,45), (23,49), (32,44), (38,53)], ss
ff_files = ["amber14/protein.ff14SB.xml", "amber14/tip3pfb.xml"]
forcefield = app.ForceField(*ff_files)
selected, properties = platform()
print("Platform:", selected.getName(), properties, flush=True)
modeller.addHydrogens(forcefield, pH=7.4, platform=selected)
protein_atoms = modeller.topology.getNumAtoms()
with (target / "protein-prepared.pdb").open("w") as f:
    app.PDBFile.writeFile(modeller.topology, modeller.positions, f, keepIds=True)
modeller.addSolvent(forcefield, model="tip3p", padding=1.0*unit.nanometer,
                    boxShape="dodecahedron", ionicStrength=.15*unit.molar, neutralize=True)
system = forcefield.createSystem(modeller.topology, nonbondedMethod=app.PME,
    nonbondedCutoff=.9*unit.nanometer, constraints=app.HBonds, rigidWater=True,
    ewaldErrorTolerance=.0005)
temperature = 300*unit.kelvin
barostat = mm.MonteCarloBarostat(1*unit.bar, temperature, 25)
barostat.setRandomNumberSeed(20261009)
system.addForce(barostat)
integrator = mm.LangevinMiddleIntegrator(temperature, 1/unit.picosecond, .002*unit.picoseconds)
integrator.setRandomNumberSeed(20261009)
integrator.setConstraintTolerance(1e-6)
simulation = app.Simulation(modeller.topology, system, integrator, selected, properties)
simulation.context.setPositions(modeller.positions)
e0 = simulation.context.getState(getEnergy=True).getPotentialEnergy().value_in_unit(unit.kilojoule_per_mole)
print("Atoms:", system.getNumParticles(), "initial energy:", e0, flush=True)
started = time.perf_counter()
simulation.minimizeEnergy(tolerance=10*unit.kilojoule_per_mole/unit.nanometer, maxIterations=2000)
state = simulation.context.getState(getPositions=True, getEnergy=True)
e1 = state.getPotentialEnergy().value_in_unit(unit.kilojoule_per_mole)
with (target/"solvated-minimized.pdb").open("w") as f:
    app.PDBFile.writeFile(modeller.topology, state.getPositions(), f, keepIds=True)
(target/"system.xml").write_text(mm.XmlSerializer.serialize(system))
(target/"integrator-template.xml").write_text(mm.XmlSerializer.serialize(integrator))
(target/"minimized-state.xml").write_text(mm.XmlSerializer.serialize(state))
atoms = list(modeller.topology.atoms())
nonbonded = next(f for f in system.getForces() if isinstance(f,mm.NonbondedForce))
with (target/"topology-atoms.csv").open("w",newline="") as f:
    w=csv.writer(f);w.writerow(["index","chain","residue_id","residue","atom","element","mass_Da","charge_e","sigma_nm","epsilon_kJ_mol"])
    for atom in atoms:
        charge,sigma,epsilon=nonbonded.getParticleParameters(atom.index)
        w.writerow([atom.index,atom.residue.chain.id,atom.residue.id,atom.residue.name,atom.name,atom.element.symbol,
           system.getParticleMass(atom.index).value_in_unit(unit.dalton),charge.value_in_unit(unit.elementary_charge),
           sigma.value_in_unit(unit.nanometer),epsilon.value_in_unit(unit.kilojoule_per_mole)])
with (target/"topology-bonds.csv").open("w",newline="") as f:
    w=csv.writer(f);w.writerow(["atom_i","atom_j","is_disulfide"])
    for a,b in modeller.topology.bonds():w.writerow([a.index,b.index,a.name=="SG" and b.name=="SG"])
simulation.context.setVelocitiesToTemperature(temperature, 20261009)
simulation.step(200)
start=time.perf_counter()
simulation.step(1000)
seconds=time.perf_counter()-start
report = {"input":{"pdb":"2REL","model":1,"chain":"A","species":"Homo sapiens","residues":57,
    "sha256":hashlib.sha256(source.read_bytes()).hexdigest(),"disulfides_mature_numbering":ss},
    "environment":{"python":platform_info.python_version(),"OpenMM":mm.__version__,
     "platforms":load_plugins(),"selected_platform":selected.getName(),"properties":properties},
    "system":{"force_fields":ff_files,"water":"TIP3P-FB","pH_for_protonation":7.4,
      "water_model_argument":"tip3p uses the three-site TIP3P-FB force-field parameters",
      "ionic_strength_M":.15,"padding_nm":1.0,"box_shape":"dodecahedron",
      "protein_atoms":protein_atoms,"total_atoms":system.getNumParticles(),
      "water_molecules":sum(r.name=="HOH" for r in modeller.topology.residues()),
      "ions":{name:sum(r.name==name for r in modeller.topology.residues()) for name in ["NA","CL"]},
      "constraints":system.getNumConstraints(),"nonbonded":"PME","cutoff_nm":.9,"ewald_tolerance":.0005,
      "temperature_K":300,"pressure_bar":1,"time_step_fs":2,"friction_ps_inverse":1},
    "minimization":{"initial_energy_kJ_mol":e0,"minimized_energy_kJ_mol":e1,
      "max_iterations":2000,"force_tolerance_kJ_mol_nm":10,"wall_seconds_including_benchmark":time.perf_counter()-started},
    "benchmark":{"steps":1000,"simulated_ps":2,"wall_seconds":seconds,"ns_per_day":.002/seconds*86400},
    "status":"Preparation and short performance benchmark; benchmark is not the production trajectory."}
(target/"preparation.json").write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2),flush=True)
