"""Reanalyse deposited Elafin coordinates; no simulated trajectory or affinity score.

Run from any directory with Python + NumPy/SciPy/Matplotlib:
  python scripts/drylab/analyze_structures.py
Then render_structures.mjs, then plot_structures.py.
"""
from pathlib import Path
import csv
import hashlib
import json
import platform
import numpy as np
import scipy
from scipy.spatial.distance import cdist
from scipy.spatial.transform import Rotation

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'public/assets/dry-lab/research'
WORK = ROOT / 'outputs/dry-lab-research'
PDB = ROOT / 'public/assets/dry-lab/structures'
OUT.mkdir(parents=True, exist_ok=True)
WORK.mkdir(parents=True, exist_ok=True)


def read_models(path):
    """Keep protein ATOMs; choose blank/A altloc, retain author insertion codes."""
    models, atoms, seen = [], [], set()
    for line in path.read_text().splitlines():
        if line.startswith('MODEL'):
            atoms, seen = [], set()
        elif line.startswith('ENDMDL'):
            models.append(atoms)
            atoms, seen = [], set()
        elif line.startswith('ATOM  ') and line[16] in (' ', 'A'):
            key = (line[21], line[22:27].strip(), line[12:16].strip())
            if key in seen:
                continue
            seen.add(key)
            element = line[76:78].strip() or line[12:16].strip()[0]
            atoms.append(dict(chain=key[0], residue=key[1], atom=key[2],
                              resname=line[17:20].strip(), element=element,
                              xyz=[float(line[x:x+8]) for x in (30, 38, 46)], line=line))
    if atoms:
        models.append(atoms)
    return models


def kabsch(moving, target, mask=None):
    """Row-vector proper rotation; translation/rotation only, no reflection/scale."""
    if mask is None:
        mask = np.ones(len(moving), dtype=bool)
    cm, ct = moving[mask].mean(axis=0), target[mask].mean(axis=0)
    u, _, vh = np.linalg.svd((moving[mask] - cm).T @ (target[mask] - ct))
    rotation = u @ np.diag([1, 1, np.linalg.det(u @ vh)]) @ vh
    return (moving - cm) @ rotation + ct, rotation, cm, ct


def rmsd(a, b):
    return float(np.sqrt(np.mean(np.sum((a - b)**2, axis=-1))))


def generalized_alignment(coordinates, mask):
    """Generalized Procrustes, anchored to model 1 orientation, 1e-10 A tolerance."""
    mean = coordinates[0].copy()
    for iteration in range(1000):
        aligned = np.array([kabsch(model, mean, mask)[0] for model in coordinates])
        next_mean = aligned.mean(axis=0)
        delta = rmsd(next_mean[mask], mean[mask])
        mean = next_mean
        if delta < 1e-10:
            return aligned, mean, iteration + 1, delta
    raise RuntimeError('Generalized alignment failed to converge.')


def write_csv(name, rows, header):
    with (OUT / name).open('w', newline='', encoding='utf-8') as handle:
        writer = csv.writer(handle)
        writer.writerow(header)
        writer.writerows(rows)


def transformed_pdb(atoms, rotation, source_center, target_center):
    result = []
    for atom in atoms:
        xyz = (np.array(atom['xyz']) - source_center) @ rotation + target_center
        result.append(atom['line'][:30] + ''.join(f'{x:8.3f}' for x in xyz) + atom['line'][54:])
    return '\n'.join(result) + '\n'


def main():
    models = read_models(PDB / '2rel.pdb')
    assert len(models) == 11
    ca_atoms = [[a for a in m if a['atom'] == 'CA' and a['chain'] == 'A'] for m in models]
    assert all([a['residue'] for a in m] == [str(i) for i in range(1, 58)] for m in ca_atoms)
    coordinates = np.array([[a['xyz'] for a in m] for m in ca_atoms])
    residue_ids = np.arange(1, 58)
    wap_mask = residue_ids >= 9
    all_mask = np.ones(57, dtype=bool)
    aligned, mean, iterations, convergence = generalized_alignment(coordinates, all_mask)
    aligned_wap, mean_wap, wap_iterations, wap_convergence = generalized_alignment(coordinates, wap_mask)
    dispersion = np.sqrt(np.mean(np.sum((aligned - mean)**2, axis=2), axis=0))
    dispersion_wap = np.sqrt(np.mean(np.sum((aligned_wap - mean_wap)**2, axis=2), axis=0))
    pairs = np.zeros((11, 11))
    pairs_wap = np.zeros((11, 11))
    pair_rows = []
    for i in range(11):
        for j in range(i + 1, 11):
            pairs[i, j] = pairs[j, i] = rmsd(kabsch(coordinates[i], coordinates[j])[0], coordinates[j])
            fit = kabsch(coordinates[i], coordinates[j], wap_mask)[0]
            pairs_wap[i, j] = pairs_wap[j, i] = rmsd(fit[wap_mask], coordinates[j, wap_mask])
            pair_rows.append([i + 1, j + 1, pairs[i, j], pairs_wap[i, j]])
    write_csv('2rel-pairwise-rmsd.csv', pair_rows, ['model_a', 'model_b', 'full_length_1_57_CA_RMSD_A', 'WAP_9_57_CA_RMSD_A'])
    write_csv('2rel-rmsd-matrix.csv', [[i+1, *row] for i, row in enumerate(pairs)], ['model', *[f'model_{i}' for i in range(1, 12)]])
    write_csv('2rel-ensemble-dispersion.csv', [[i, ca_atoms[0][i-1]['resname'], dispersion[i-1], dispersion_wap[i-1]] for i in residue_ids],
              ['mature_residue', 'resname', 'dispersion_after_fit_1_57_A', 'dispersion_after_fit_9_57_A'])
    # Retain all atom coordinates in each conformer, transformed with its C-alpha fit.
    # Original coordinate sources stay untouched.
    header = '\n'.join(line for line in (PDB / '2rel.pdb').read_text().splitlines() if line.startswith(('HELIX', 'SHEET', 'SSBOND')))
    aligned_blocks = [header]
    for i, atoms in enumerate(models):
        _, rot, cm, ct = kabsch(coordinates[i], mean_wap, wap_mask)
        aligned_blocks.extend([f'MODEL     {i+1:4d}', transformed_pdb(atoms, rot, cm, ct).rstrip(), 'ENDMDL'])
    (WORK / '2rel-wap-aligned.pdb').write_text('\n'.join(aligned_blocks) + '\nEND\n')

    complex_atoms = read_models(PDB / '1fle.pdb')[0]
    heavy = [a for a in complex_atoms if a['element'] not in ('H', 'D')]
    residues = {chain: list(dict.fromkeys(a['residue'] for a in heavy if a['chain'] == chain)) for chain in ('I', 'E')}
    grouped = {(chain, res): [a for a in heavy if a['chain'] == chain and a['residue'] == res] for chain in ('I', 'E') for res in residues[chain]}
    distances = np.zeros((47, 240))
    closest_atoms = {}
    contacts = []
    for i, ir in enumerate(residues['I']):
        ia = grouped['I', ir]
        for j, er in enumerate(residues['E']):
            ea = grouped['E', er]
            d = cdist([a['xyz'] for a in ia], [a['xyz'] for a in ea])
            ai, aj = np.unravel_index(np.argmin(d), d.shape)
            distances[i, j] = d[ai, aj]
            left, right = ia[ai], ea[aj]
            closest_atoms[i, j] = (left, right)
            if d[ai, aj] < 6:
                contacts.append(dict(I_residue=ir, I_resname=left['resname'], I_atom=left['atom'], E_residue=er, E_resname=right['resname'], E_atom=right['atom'], distance_A=float(d[ai, aj]), I_xyz=left['xyz'], E_xyz=right['xyz']))
    contacts.sort(key=lambda x: x['distance_A'])
    contacts4 = [c for c in contacts if c['distance_A'] < 4]
    threshold_rows = [[float(t), int((distances < t).sum()), int((distances < t).any(axis=1).sum()), int((distances < t).any(axis=0).sum())] for t in np.arange(3, 6.001, .25)]
    write_csv('1fle-minimum-heavy-atom-distance-matrix.csv', [[res, *row] for res, row in zip(residues['I'], distances)], ['Elafin_I_author_residue', *[f'elastase_E_{r}' for r in residues['E']]])
    write_csv('1fle-residue-contacts-under-6A.csv', [[c[k] for k in ['I_residue','I_resname','I_atom','E_residue','E_resname','E_atom','distance_A']] for c in contacts], ['Elafin_residue','Elafin_resname','Elafin_atom','Elastase_residue','Elastase_resname','Elastase_atom','minimum_distance_A'])
    write_csv('1fle-contact-threshold-sensitivity.csv', threshold_rows, ['threshold_A_strict_less_than','residue_pairs','Elafin_interface_residues','elastase_interface_residues'])

    # Tests catch row/column, rigid transform, reflection and contact-count mistakes.
    test_rotation = Rotation.from_euler('xyz', [31, 64, -22], degrees=True).as_matrix()
    rigid = coordinates[0] @ test_rotation + [6, -11, 4]
    recovered, r, _, _ = kabsch(rigid, coordinates[0])
    rigid_error = rmsd(recovered, coordinates[0])
    assert rigid_error < 1e-10 and abs(np.linalg.det(r) - 1) < 1e-10
    assert np.allclose(pairs, pairs.T) and np.allclose(np.diag(pairs), 0)
    assert np.isfinite(dispersion).all() and np.all(dispersion >= 0)
    assert len(contacts4) == 40, 'Must reproduce the independent TypeScript parser audit.'
    assert np.all(np.diff(np.array(threshold_rows)[:, 1], axis=0) >= 0)
    assert residues['I'] == [str(i) for i in range(11, 58)]
    assert len(residues['E']) == 240
    # Independent full atom-vector distance calculation verifies all 40 pair identities.
    ih = [a for a in heavy if a['chain'] == 'I']
    eh = [a for a in heavy if a['chain'] == 'E']
    near = np.argwhere(cdist([a['xyz'] for a in ih], [a['xyz'] for a in eh]) < 4)
    independent_pairs = {(ih[i]['residue'], eh[j]['residue']) for i, j in near}
    assert independent_pairs == {(c['I_residue'], c['E_residue']) for c in contacts4}
    upper = pairs[np.triu_indices(11, 1)]
    upper_wap = pairs_wap[np.triu_indices(11, 1)]
    summary = dict(
        analysis='Reanalysis of deposited Elafin structures; no MD trajectory or new docking',
        date='2026-10-08', software=dict(python=platform.python_version(), numpy=np.__version__, scipy=scipy.__version__),
        inputs=[dict(pdb=id, sha256=hashlib.sha256((PDB / f'{id.lower()}.pdb').read_bytes()).hexdigest(), source=f'https://www.rcsb.org/structure/{id}') for id in ['2REL','1FLE']],
        nmr=dict(pdb='2REL', chain='A', conformers=11, residues=57, unique_pairs=55,
                 pairwise_full_A=dict(mean=float(upper.mean()), median=float(np.median(upper)), min=float(upper.min()), max=float(upper.max())),
                 pairwise_WAP_9_57_A=dict(mean=float(upper_wap.mean()), median=float(np.median(upper_wap)), min=float(upper_wap.min()), max=float(upper_wap.max())),
                 mean_dispersion_full_fit_A=float(dispersion.mean()), max_dispersion_full_fit=dict(residue=int(np.argmax(dispersion)+1), value_A=float(dispersion.max())),
                 mean_dispersion_WAP_fit_N_terminal_1_8_A=float(dispersion_wap[:8].mean()), mean_dispersion_WAP_fit_domain_9_57_A=float(dispersion_wap[8:].mean()),
                 alignment=dict(method='Proper-rotation Kabsch / iterative generalized Procrustes consensus', full_fit_residues='1–57', domain_fit_residues='9–57', domain_basis='UniProt P19957 WAP 69–117 in precursor numbering; mature peptide begins at precursor 61', full_iterations=iterations, WAP_iterations=wap_iterations, tolerance_A=1e-10, full_final_delta_A=convergence, WAP_final_delta_A=wap_convergence),
                 interpretation='Dispersion describes spread among 11 deposited NMR conformers after structural superposition, not time-dependent flexibility, MD-RMSF, a sampling confidence interval or a stability/affinity measurement.'),
        complex=dict(pdb='1FLE', resolution_A=1.9, I='Human Elafin; 47/57 residues resolved, author 11–57', E='Porcine pancreatic elastase; 240 resolved residues, author numbering retained', threshold_A=4, comparison='strict <', residue_pairs=len(contacts4), Elafin_interface_residues=len(set(c['I_residue'] for c in contacts4)), elastase_interface_residues=len(set(c['E_residue'] for c in contacts4)), heavy_atom_pairs_under_4A=len(near),
                     closest_contact={k:v for k,v in contacts[0].items() if not k.endswith('xyz')},
                     contacts_under_4A=contacts4, thresholds=threshold_rows,
                     interpretation='Distances describe the deposited crystal complex (no crystal symmetry mates), excluding waters/HETATM/hydrogens. A distance cutoff defines a geometric contact; it does not classify hydrogen bonds or estimate affinity. This is a porcine enzyme structural reference, not human NE and not team docking.'),
        checks=dict(rigid_transform_recovery_RMSD_A=rigid_error, pairwise_matrix_symmetric=True, pairwise_diagonal_zero=True, contacts_verified_by_independent_atom_matrix=True, contacts_match_TypeScript_40=True, threshold_counts_monotonic=True))
    (OUT / 'structure-summary.json').write_text(json.dumps(summary, indent=2, ensure_ascii=False), encoding='utf-8')
    (WORK / 'summary.json').write_text(json.dumps(summary, indent=2, ensure_ascii=False), encoding='utf-8')
    np.savez(WORK / 'structure-arrays.npz', coordinates=coordinates, aligned=aligned, aligned_wap=aligned_wap, dispersion=dispersion, dispersion_wap=dispersion_wap, pairs=pairs, pairs_wap=pairs_wap, distances=distances, I_residues=residues['I'], E_residues=residues['E'])
    print(json.dumps({'nmr_full_pairwise_mean_A': upper.mean(), 'nmr_WAP_pairwise_mean_A':upper_wap.mean(), 'contacts_4A':len(contacts4), 'closest':contacts[0], 'rigid_transform_test_A':rigid_error}, indent=2))


if __name__ == '__main__':
    main()
