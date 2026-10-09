"""Receptor-aligned validation of actual HDOCK output; never use its translated-input RMSD."""
import csv
import hashlib
import json
import sys
from pathlib import Path
import numpy as np
from scipy.spatial.distance import cdist

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / 'scripts/drylab'))
from analyze_structures import read_models, kabsch, rmsd

OUT = ROOT / 'public/assets/dry-lab/atomistic'
WORK = ROOT / 'outputs/dry-lab-atomistic'
BACKBONE = {'N', 'CA', 'C', 'O'}


def key(a): return (a['chain'], a['residue'], a['atom'])


def contacts(atoms, cutoff=5):
    e = [a for a in atoms if a['chain'] == 'E' and a['element'] not in {'H', 'D'}]
    i = [a for a in atoms if a['chain'] == 'I' and a['element'] not in {'H', 'D'}]
    d = cdist([a['xyz'] for a in i], [a['xyz'] for a in e])
    result = {}
    for row, col in np.argwhere(d < cutoff):
        pair = (i[row]['residue'], e[col]['residue'])
        if pair not in result or d[row,col] < result[pair]['distance_A']:
            result[pair] = {'I_residue': pair[0], 'E_residue': pair[1], 'I_resname': i[row]['resname'],
                            'E_resname': e[col]['resname'], 'I_atom': i[row]['atom'], 'E_atom': e[col]['atom'],
                            'I_xyz': i[row]['xyz'], 'E_xyz': e[col]['xyz'], 'distance_A': float(d[row,col])}
    return result


def write_csv(path, rows):
    with path.open('w', newline='', encoding='utf8') as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0])); w.writeheader(); w.writerows(rows)


def add_secondary_records(atoms, source_e, source_i, target):
    """Rigid docking preserves monomer conformations: transfer deposited secondary-structure records."""
    lines = ['REMARK   NEW HDOCK rigid-body prediction; not an experimentally measured complex.']
    for source, old_chain, new_chain in [(source_e,'E','E'), (source_i,'I' if source_i.name.lower() == '1fle.pdb' else 'A','I')]:
        for line in source.read_text().splitlines():
            if line.startswith('HELIX ') and line[19] == old_chain:
                line = line[:19]+new_chain+line[20:31]+new_chain+line[32:]; lines.append(line)
            elif line.startswith('SHEET ') and line[21] == old_chain:
                line = line[:21]+new_chain+line[22:32]+new_chain+line[33:]; lines.append(line)
    # HDOCK preserves each monomer's serials, so they can collide across chains.
    # Renumber only this display derivative; raw ranks and all coordinates stay intact.
    lines.extend(a['line'][:6]+f'{serial:5d}'+a['line'][11:] for serial,a in enumerate(atoms,1))
    # Fixed-width END matters: 3Dmol 2.5.5 clears deposited SS metadata for an
    # unpadded literal END record, before assigning the metadata to its atoms.
    target.write_text('\n'.join(line.ljust(80) for line in lines+['END'])+'\n')


def main():
    cases = {}
    fle = ROOT/'public/assets/dry-lab/structures/1fle.pdb'
    rel = ROOT/'public/assets/dry-lab/structures/2rel.pdb'
    ne = OUT/'inputs/2z7f-original.pdb'
    native = read_models(fle)[0]
    nat_lookup = {key(a):a for a in native}
    native_contacts = contacts(native,5)
    inter = contacts(native,10)
    interface = {('I', i) for i,e in inter} | {('E', e) for i,e in inter}
    for name in ['1fle-redocking', 'human-ne-elafin']:
        folder = OUT/'docking'/name
        files = [folder/f'model_{i}.pdb' for i in range(1,101)]
        assert all(p.exists() and p.read_text().rstrip().endswith('ENDMDL') for p in files), f'Unfinished HDOCK output: {name}'
        rows = []
        for rank,p in enumerate(files,1):
            atoms = read_models(p)[0]
            lookup = {key(a):a for a in atoms}
            score = float(next(line.split(':')[1] for line in p.read_text().splitlines() if line.startswith('REMARK Score:')))
            contact = contacts(atoms,5)
            xyz_i = np.array([a['xyz'] for a in atoms if a['chain']=='I'])
            xyz_e = np.array([a['xyz'] for a in atoms if a['chain']=='E'])
            row = {'rank': rank, 'HDOCK_score_arbitrary_units': score, 'residue_pairs_under_5A': len(contact),
                   'interchain_heavy_atom_pairs_under_2A': int((cdist(xyz_i,xyz_e)<2).sum())}
            if name == '1fle-redocking':
                ekeys = [key(a) for a in native if a['chain']=='E' and a['atom'] in BACKBONE]
                ikeys = [key(a) for a in native if a['chain']=='I' and a['atom'] in BACKBONE]
                assert all(k in lookup for k in ekeys+ikeys)
                _,r,cm,ct = kabsch(np.array([lookup[k]['xyz'] for k in ekeys]),np.array([nat_lookup[k]['xyz'] for k in ekeys]))
                ligand = (np.array([lookup[k]['xyz'] for k in ikeys])-cm)@r+ct
                l_rmsd = rmsd(ligand, np.array([nat_lookup[k]['xyz'] for k in ikeys]))
                interkeys = [key(a) for a in native if (a['chain'],a['residue']) in interface and a['atom'] in BACKBONE]
                inter_target = np.array([nat_lookup[k]['xyz'] for k in interkeys])
                inter_moving = np.array([lookup[k]['xyz'] for k in interkeys])
                i_rmsd = rmsd(kabsch(inter_moving, inter_target)[0],inter_target)
                fnat = len(set(contact)&set(native_contacts))/len(native_contacts)
                row.update(ligand_backbone_RMSD_A=l_rmsd, interface_backbone_RMSD_A=i_rmsd,
                           fraction_native_contacts=fnat, recovered_native_contacts=len(set(contact)&set(native_contacts)))
            else:
                row['Elafin_A24_C_to_NE_S195_OG_A'] = float(np.linalg.norm(np.array(lookup[('I','24','C')]['xyz']) - np.array(lookup[('E','195','OG')]['xyz'])))
            rows.append(row)
        write_csv(folder/'pose-metrics.csv',rows)
        top = read_models(files[0])[0]
        add_secondary_records(top, fle if name=='1fle-redocking' else ne, fle if name=='1fle-redocking' else rel, folder/'top1-cartoon.pdb')
        top_contacts = sorted(contacts(top,4).values(),key=lambda x:x['distance_A'])
        write_csv(folder/'top1-contacts-under-4A.csv',top_contacts)
        cases[name] = {'input':json.loads((folder/'input-provenance.json').read_text()), 'poses_analysed':100,
                       'top1':rows[0], 'score_range':[min(r['HDOCK_score_arbitrary_units'] for r in rows),max(r['HDOCK_score_arbitrary_units'] for r in rows)],
                       'top1_contacts_under_4A':top_contacts,
                       'native_reference_contact_pairs_under_5A':len(native_contacts) if name=='1fle-redocking' else None}
        if name=='1fle-redocking':
            cases[name].update(best_ligand_RMSD_pose=min(rows,key=lambda x:x['ligand_backbone_RMSD_A']),
                               best_interface_RMSD_pose=min(rows,key=lambda x:x['interface_backbone_RMSD_A']),
                               poses_with_ligand_RMSD_below_5A=sum(r['ligand_backbone_RMSD_A']<5 for r in rows))
        else:
            # Post-hoc plausibility screen, explicitly NOT independent pose validation.
            candidates=[r for r in rows if r['Elafin_A24_C_to_NE_S195_OG_A']<5 and r['interchain_heavy_atom_pairs_under_2A']==0]
            sensitivity=[{'distance_cutoff_A':cutoff,'zero_short_contact_pose_ranks':[r['rank'] for r in rows
                         if r['Elafin_A24_C_to_NE_S195_OG_A']<cutoff and r['interchain_heavy_atom_pairs_under_2A']==0]}
                         for cutoff in [3,3.5,4,4.5,5,5.5,6]]
            selected=min(candidates,key=lambda x:x['rank']) if candidates else None
            cases[name]['posthoc_geometry_screen']={'selection':'Ala24 C to catalytic Ser195 OG <5 A AND zero interchain heavy-atom pairs <2 A; retain the original HDOCK rank.',
              'caveat':'Mechanism-informed, post-hoc geometric triage; <2 A pairs are a clash flag, not an automatic rejection of all molecular interactions. This is not pose validation.',
              'sensitivity':sensitivity,'passing_ranks':[r['rank'] for r in candidates],'selected':selected}
            if selected:
                selected_atoms=read_models(folder/f"model_{selected['rank']}.pdb")[0]
                add_secondary_records(selected_atoms,ne,rel,folder/'geometry-candidate.pdb')
                selected_contacts=sorted(contacts(selected_atoms,4).values(),key=lambda x:x['distance_A'])
                write_csv(folder/'candidate-contacts-under-4A.csv',selected_contacts)
                cases[name]['posthoc_geometry_screen']['contacts_under_4A']=selected_contacts
    report = {'software':'HDOCKlite 1.2', 'official_source':'https://github.com/huang-laboratory/HDOCKlite',
              'bibliography':['https://doi.org/10.1038/s41596-020-0312-x','https://doi.org/10.1093/nar/gkx407'],
              'parameters':{'grid_spacing_A':1.2,'rotation_step_degrees':15,'rotations':4392,'docking_mode':'ab initio global rigid-body','contact_restraints':None,'createpl_clustering_RMSD_A':5.0,'reported_poses':100,'rank_definition':'Original rank among createpl clustered representatives; not raw search-row index.'},
              'metrics':{'L_RMSD':'All ligand N, CA, C, O atoms after least-squares fitting receptor N, CA, C, O to native 1FLE.',
                         'i_RMSD':'Best-fit N, CA, C, O RMSD over native interface residues whose interchain heavy atoms are less than 10 A apart.',
                         'Fnat':'Fraction of native interchain residue contacts recovered, using strictly <5 A heavy-atom distance in native and pose.',
                         'HDOCK_reported_RMSD':'Not used: HDOCK computes this against the deliberately translated independent ligand input, not the native complex.'},
              'caveats':['HDOCK score is a ranking potential in arbitrary units, not a binding free energy, Kd, or inhibition measurement.',
                         'Bound redocking is an easier retrospective benchmark; no independent unbound-complex or prospective experimental validation is claimed.',
                         'Human NE receptor comes from 2Z7F with SLPI removed; its conformation may be biased toward SLPI.',
                         'Only 2REL conformer 1 is cross-docked; induced fit, NMR ensemble variation, protonation, glycans and solvent are not sampled.'],
              'cases':cases}
    (OUT/'docking-summary.json').write_text(json.dumps(report,indent=2))
    print(json.dumps({name:data['top1'] for name,data in cases.items()},indent=2))


if __name__=='__main__': main()
