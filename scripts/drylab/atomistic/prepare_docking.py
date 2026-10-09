"""Prepare independent rigid-body HDOCK inputs; retain a separate native reference."""
from pathlib import Path
import hashlib
import json
import numpy as np
from scipy.spatial.transform import Rotation
ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / 'public/assets/dry-lab/atomistic'

def protein_records(path,chain):
    seen=set();result=[]
    for line in path.read_text().splitlines():
        if line.startswith("ENDMDL"):break
        if not line.startswith("ATOM  ") or line[21]!=chain or line[16] not in [" ","A"]:continue
        if line[76:78].strip() in ["H","D"]:continue
        key=(line[22:27],line[12:16])
        if key in seen:continue
        seen.add(key);result.append(line)
    return result

def save(lines,path,move=False,new_chain=None):
    xyz=np.array([[float(line[p:p+8]) for p in [30,38,46]] for line in lines])
    if move:xyz=(xyz-xyz.mean(0)) @ Rotation.from_euler("xyz",[37,-63,101],degrees=True).as_matrix()+np.array([80,-40,65])
    out=[]
    for line,pos in zip(lines,xyz):
        if new_chain:line=line[:21]+new_chain+line[22:]
        out.append(line[:30]+"".join(f"{p:8.3f}" for p in pos)+line[54:])
    path.write_text("\n".join(out)+"\nTER\nEND\n")

fle=ROOT/"public/assets/dry-lab/structures/1fle.pdb"
rel=ROOT/"public/assets/dry-lab/structures/2rel.pdb"
# The receptor is human NE; the SLPI ligand in 2Z7F is deliberately excluded.
ne=ROOT/"public/assets/dry-lab/atomistic/inputs/2z7f-original.pdb"
for kind,receptor,ligand in [
    ("1fle-redocking",protein_records(fle,"E"),protein_records(fle,"I")),
    ("human-ne-elafin",protein_records(ne,"E"),protein_records(rel,"A"))]:
    dst=OUT/"docking"/kind;dst.mkdir(parents=True,exist_ok=True)
    save(receptor,dst/"receptor.pdb")
    save(ligand,dst/"ligand-independent.pdb",move=True,new_chain="I")
    if kind=="1fle-redocking":save(receptor+ligand,dst/"native-reference.pdb")
    meta={"experiment":kind,"receptor_residues":len({r[22:27] for r in receptor}),
        "ligand_residues":len({r[22:27] for r in ligand}),
        "receptor_source":"1FLE chain E, porcine pancreatic elastase" if kind=="1fle-redocking" else "2Z7F chain E, human neutrophil elastase; SLPI chain I removed",
        "ligand_source":"1FLE chain I, human Elafin resolved residues 11–57" if kind=="1fle-redocking" else "2REL first NMR model, chain A, mature human Elafin residues 1–57, renamed I",
        "ligand_rigid_transform":{"euler_xyz_deg":[37,-63,101],"translation_A":[80,-40,65],"center_before_transform":True},
        "method":"HDOCKlite 1.2 rigid-body global docking; 1.2 A grid, 15 degree rotation; no residue restraints",
        "status":"Bound-structure redocking benchmark, not a new experimental complex." if kind=="1fle-redocking" else "Exploratory cross-docking prediction; no experimentally established Elafin–human-NE pose used for scoring or validation."}
    for name in ["receptor.pdb","ligand-independent.pdb"]:meta[name+"_sha256"]=hashlib.sha256((dst/name).read_bytes()).hexdigest()
    (dst/"input-provenance.json").write_text(json.dumps(meta,indent=2))
    print(kind,len(receptor),len(ligand),flush=True)
