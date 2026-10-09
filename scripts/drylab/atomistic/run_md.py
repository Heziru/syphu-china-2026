"""Three independent-velocity, 1 ns explicit-water Elafin MD pilots (not a convergence claim)."""
import argparse
import csv
import json
import hashlib
import time
import numpy as np
from runtime import OUT, WORK, platform
import openmm as mm
from openmm import app, unit

parser=argparse.ArgumentParser()
parser.add_argument("--replicas",type=int,default=3)
parser.add_argument("--production-ps",type=float,default=1000)
args=parser.parse_args()
assert args.replicas > 0 and args.production_ps > 0 and args.production_ps % 5 == 0, 'Use positive replicas and a production duration divisible by the 5 ps output interval.'
target=OUT/"md"
preparation_sha256=hashlib.sha256(b''.join((target/name).read_bytes() for name in ['system.xml','minimized-state.xml','solvated-minimized.pdb','protein-prepared.pdb'])).hexdigest()
inputs=app.PDBFile(str(target/"solvated-minimized.pdb"))
protein_indices=[a.index for a in inputs.topology.atoms() if a.residue.chain.id=="A"]
protein_topology=app.PDBFile(str(target/"protein-prepared.pdb")).topology
assert len(protein_indices)==830
selected,properties=platform()
all_runs=[]
for replica in range(1,args.replicas+1):
    seed=20261009+replica*101
    run=target/f"replica-{replica}"
    raw=WORK/f"replica-{replica}"
    run.mkdir(exist_ok=True);raw.mkdir(exist_ok=True)
    complete=run/"run.json"
    if complete.exists():
        old=json.loads(complete.read_text())
        if old["production_ps"]==args.production_ps and old.get("complete") and old.get('preparation_sha256')==preparation_sha256:
            all_runs.append(old);print("Reusing completed replica",replica,flush=True);continue
        raise RuntimeError("Existing run metadata differs; choose a new directory.")
    system=mm.XmlSerializer.deserialize((target/"system.xml").read_text())
    barostat=next(f for f in system.getForces() if isinstance(f,mm.MonteCarloBarostat))
    barostat.setRandomNumberSeed(seed+1)
    barostat.setFrequency(0)
    restraint=mm.CustomExternalForce("0.5*k*periodicdistance(x,y,z,x0,y0,z0)^2")
    restraint.addGlobalParameter("k",1000)
    for name in ["x0","y0","z0"]:restraint.addPerParticleParameter(name)
    reference=inputs.positions.value_in_unit(unit.nanometer)
    for a in inputs.topology.atoms():
        if a.residue.chain.id=="A" and a.name in ["N","CA","C","O"]:
            restraint.addParticle(a.index,reference[a.index])
    system.addForce(restraint)
    integrator=mm.LangevinMiddleIntegrator(300*unit.kelvin,1/unit.picosecond,.002*unit.picoseconds)
    integrator.setRandomNumberSeed(seed)
    integrator.setConstraintTolerance(1e-6)
    simulation=app.Simulation(inputs.topology,system,integrator,selected,properties)
    state=mm.XmlSerializer.deserialize((target/"minimized-state.xml").read_text())
    simulation.context.setState(state)
    simulation.context.setVelocitiesToTemperature(300*unit.kelvin,seed)
    started=time.perf_counter()
    equilibration=[]
    # Independent velocities; identical deposited conformer and minimized solvent start.
    for duration,k,frequency,label in [(20,1000,0,"NVT restrained"),(30,250,25,"NPT restrained"),(50,0,25,"NPT unrestrained")]:
        simulation.context.setParameter("k",k)
        if frequency!=barostat.getFrequency():
            barostat.setFrequency(frequency)
            simulation.context.reinitialize(preserveState=True)
        simulation.step(round(duration/.002))
        st=simulation.context.getState(getEnergy=True)
        equilibration.append({"label":label,"duration_ps":duration,"backbone_k_kJ_mol_nm2":k,
          "potential_energy_kJ_mol":st.getPotentialEnergy().value_in_unit(unit.kilojoule_per_mole)})
        print(f"Replica {replica}: {label} {duration} ps; wall {time.perf_counter()-started:.1f}s",flush=True)
    eq_state=simulation.context.getState(getPositions=True,getVelocities=True,getParameters=True,getEnergy=True)
    (run/"production-start-state.xml").write_text(mm.XmlSerializer.serialize(eq_state))
    (run/"production-system.xml").write_text(mm.XmlSerializer.serialize(system))
    (run/"integrator.xml").write_text(mm.XmlSerializer.serialize(integrator))
    simulation.context.setTime(0*unit.picoseconds)
    simulation.currentStep=0
    simulation.reporters.append(app.DCDReporter(str(raw/"solvated-trajectory.dcd"),2500,enforcePeriodicBox=False))
    simulation.reporters.append(app.DCDReporter(str(run/"protein-trajectory.dcd"),2500,enforcePeriodicBox=False,atomSubset=protein_indices))
    simulation.reporters.append(app.StateDataReporter(str(run/"thermodynamics.csv"),2500,
      step=True,time=True,potentialEnergy=True,kineticEnergy=True,temperature=True,volume=True,density=True,separator=","))
    positions=[eq_state.getPositions(asNumpy=True).value_in_unit(unit.nanometer)[protein_indices].astype(np.float32)]
    boxes=[eq_state.getPeriodicBoxVectors(asNumpy=True).value_in_unit(unit.nanometer)]
    production_started=time.perf_counter()
    for frame in range(1,round(args.production_ps/5)+1):
        simulation.step(2500)
        st=simulation.context.getState(getPositions=True)
        positions.append(st.getPositions(asNumpy=True).value_in_unit(unit.nanometer)[protein_indices].astype(np.float32))
        boxes.append(st.getPeriodicBoxVectors(asNumpy=True).value_in_unit(unit.nanometer))
        if frame%20==0:print(f"Replica {replica}: production {frame*5}/{args.production_ps:g} ps; wall {time.perf_counter()-production_started:.1f}s",flush=True)
    final=simulation.context.getState(getPositions=True,getVelocities=True,getParameters=True,getEnergy=True)
    with (run/"protein-final.pdb").open("w") as f:app.PDBFile.writeFile(protein_topology,positions[-1]*unit.nanometer,f,keepIds=True)
    with (raw/"solvated-final.pdb").open("w") as f:app.PDBFile.writeFile(inputs.topology,final.getPositions(),f,keepIds=True)
    (run/"final-state.xml").write_text(mm.XmlSerializer.serialize(final))
    simulation.saveCheckpoint(str(raw/"final.checkpoint"))
    np.savez_compressed(run/"protein-coordinates.npz",positions_nm=np.asarray(positions),time_ps=np.arange(len(positions))*5.,box_vectors_nm=np.asarray(boxes))
    info={"replica":replica,"seed":seed,"barostat_seed":seed+1,"production_ps":args.production_ps,
      "preparation_sha256":preparation_sha256,
      "equilibration_ps":100,"equilibration":equilibration,"production_frames_in_npz":len(positions),
      "production_frames_in_dcd":len(positions)-1,"frame_interval_ps":5,
      "production_wall_seconds":time.perf_counter()-production_started,"total_wall_seconds":time.perf_counter()-started,
      "platform":selected.getName(),"protein_atoms":len(protein_indices),"complete":True,
      "interpretation":"Independent velocity seeds from one minimized NMR conformer; short numerical pilots, not independent structural starting conformers or converged stability/affinity evidence."}
    complete.write_text(json.dumps(info,indent=2))
    all_runs.append(info)
    print(json.dumps(info),flush=True)
    del simulation,integrator,system
(target/"runs.json").write_text(json.dumps(all_runs,indent=2))
