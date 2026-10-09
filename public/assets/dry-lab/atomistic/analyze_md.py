"""Analyse only completed explicit-water 2REL trajectories, with periodic reconstruction."""
import csv
import json
import sys
from pathlib import Path
import numpy as np
from scipy.spatial.distance import cdist

ROOT = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(ROOT / 'scripts/drylab'))
from analyze_structures import kabsch, read_models, rmsd

OUT = ROOT / 'public/assets/dry-lab/atomistic'
MD = OUT / 'md'
WORK = ROOT / 'outputs/dry-lab-atomistic'


def csv_file(path, fields, rows):
    with path.open('w', newline='', encoding='utf8') as f:
        w = csv.writer(f); w.writerow(fields); w.writerows(rows)


def whole(xyz, box, bonds):
    """Reconstruct a covalently connected protein by nearest-image bond vectors."""
    adjacency = [[] for _ in xyz]
    for i, j in bonds:
        adjacency[i].append(j); adjacency[j].append(i)
    inverse = np.linalg.inv(box)
    result = xyz.copy(); seen = {0}; stack = [0]
    while stack:
        i = stack.pop()
        for j in adjacency[i]:
            if j in seen: continue
            delta = (xyz[j] - xyz[i]) @ inverse
            result[j] = result[i] + (delta - np.round(delta)) @ box
            seen.add(j); stack.append(j)
    assert len(seen) == len(xyz), 'Protein is not one connected molecule.'
    return result


def main():
    WORK.mkdir(parents=True, exist_ok=True)
    preparation = json.loads((MD / 'preparation.json').read_text())
    topology = list(csv.DictReader((MD / 'topology-atoms.csv').open()))[:830]
    bonds = [(int(r['atom_i']), int(r['atom_j'])) for r in csv.DictReader((MD / 'topology-bonds.csv').open())
             if max(int(r['atom_i']), int(r['atom_j'])) < 830]
    ca = np.array([i for i, a in enumerate(topology) if a['atom'] == 'CA'])
    assert len(ca) == 57
    residue_ids = np.array([int(topology[i]['residue_id']) for i in ca])
    wap = residue_ids >= 9
    masses = np.array([float(a['mass_Da']) for a in topology])
    ss_pairs = preparation['input']['disulfides_mature_numbering']
    sg = {int(a['residue_id']): i for i, a in enumerate(topology) if a['atom'] == 'SG'}
    reference_atoms = read_models(MD / 'solvated-minimized.pdb')[0]
    reference = np.array([a['xyz'] for a in reference_atoms if a['chain'] == 'A'])
    assert len(reference) == 830
    all_summaries, all_arrays = [], {}
    for folder in sorted(MD.glob('replica-*')):
        if not (folder / 'run.json').exists(): continue
        metadata = json.loads((folder / 'run.json').read_text())
        assert metadata['complete']
        replica = metadata['replica']
        trajectory = np.load(folder / 'protein-coordinates.npz')
        times = trajectory['time_ps']
        coordinates = np.array([whole(x, b, bonds) for x, b in zip(trajectory['positions_nm'], trajectory['box_vectors_nm'])]) * 10
        assert np.isfinite(coordinates).all()
        bond_lengths = np.array([np.linalg.norm(coordinates[:, i] - coordinates[:, j], axis=1) for i, j in bonds])
        assert bond_lengths.max() < 2.6, 'Broken covalent geometry / incorrect periodic reconstruction.'
        aligned_full = np.array([kabsch(x[ca], reference[ca])[0] for x in coordinates])
        aligned_wap = []
        allatom_aligned = []
        for x in coordinates:
            aligned, rotation, cm, ct = kabsch(x[ca], reference[ca], wap)
            aligned_wap.append(aligned)
            allatom_aligned.append((x - cm) @ rotation + ct)
        aligned_wap = np.array(aligned_wap)
        allatom_aligned = np.array(allatom_aligned)
        rmsd_full = np.sqrt(np.mean(np.sum((aligned_full - reference[ca]) ** 2, axis=2), axis=1))
        rmsd_wap = np.sqrt(np.mean(np.sum((aligned_wap[:, wap] - reference[ca][wap]) ** 2, axis=2), axis=1))
        centers = np.average(coordinates, axis=1, weights=masses)
        rg = np.sqrt(np.average(np.sum((coordinates - centers[:, None]) ** 2, axis=2), axis=1, weights=masses))
        window = times >= 200
        assert window.sum() >= 2
        fluct = aligned_wap[window] - aligned_wap[window].mean(0)
        rmsf = np.sqrt(np.mean(np.sum(fluct ** 2, axis=2), axis=0))
        ss = np.array([np.linalg.norm(coordinates[:, sg[i]] - coordinates[:, sg[j]], axis=1) for i, j in ss_pairs]).T
        distances = np.array([cdist(x[ca], x[ca]) for x in coordinates[window]])
        occupancy = np.mean(distances < 8, axis=0)
        exclude = np.abs(np.arange(57)[:, None] - np.arange(57)[None]) <= 3
        occupancy[exclude] = np.nan
        thermo = np.genfromtxt(folder / 'thermodynamics.csv', delimiter=',', names=True, deletechars=' #\"()/')
        csv_file(folder / 'dynamics.csv', ['time_ps', 'CA_RMSD_fit_all_A', 'CA_RMSD_fit_WAP_A', 'mass_weighted_Rg_A'] + [f'SS_{i}_{j}_A' for i,j in ss_pairs],
                 zip(times, rmsd_full, rmsd_wap, rg, *ss.T))
        csv_file(folder / 'rmsf.csv', ['mature_residue', 'residue_name', 'CA_RMSF_after_WAP_fit_A', 'analysis_start_ps', 'analysis_end_ps'],
                 [(int(r), topology[ca[i]]['residue'], float(rmsf[i]), 200, float(times[-1])) for i,r in enumerate(residue_ids)])
        csv_file(folder / 'contact-occupancy.csv', ['residue_i', 'residue_j', 'CA_contact_fraction_under_8A'],
                 [(i+1, j+1, float(occupancy[i,j])) for i in range(57) for j in range(i+4,57)])
        lines = [a['line'] for a in reference_atoms if a['chain'] == 'A']
        for index, name in [(0, 'production-start-aligned.pdb'), (-1, 'production-end-aligned.pdb')]:
            output = ['REMARK   Coordinates from actual OpenMM production; WAP CA fitted to minimized reference.']
            output.extend(line[:30] + ''.join(f'{v:8.3f}' for v in xyz) + line[54:] for line,xyz in zip(lines,allatom_aligned[index]))
            (folder / name).write_text('\n'.join(output) + '\nEND\n')
        np.savez_compressed(folder / 'analysis-arrays.npz', time_ps=times, rmsd_full_A=rmsd_full, rmsd_wap_A=rmsd_wap,
                            rg_A=rg, rmsf_A=rmsf, disulfide_distances_A=ss, contact_occupancy=occupancy, ca_wap_aligned_A=aligned_wap)
        summary = {**metadata, 'analysis_window_ps': [200, float(times[-1])], 'analysis_frames': int(window.sum()),
                   'rmsd_reference': 'Energy-minimized 2REL conformer 1; C-alpha least-squares proper rotation',
                   'mean_full_CA_RMSD_A': float(rmsd_full[window].mean()), 'mean_WAP_CA_RMSD_A': float(rmsd_wap[window].mean()),
                   'mean_Rg_A': float(rg[window].mean()), 'mean_N_terminal_CA_RMSF_A': float(rmsf[:8].mean()),
                   'mean_WAP_CA_RMSF_A': float(rmsf[8:].mean()), 'SS_distance_range_A': [float(ss.min()), float(ss.max())],
                   'maximum_covalent_bond_A': float(bond_lengths.max()),
                   'mean_temperature_K': float(thermo['Temperature_K'][times[1:] >= 200].mean()),
                   'mean_density_g_mL': float(thermo['Density_gmL'][times[1:] >= 200].mean())}
        all_summaries.append(summary)
        all_arrays[f'replica_{replica}_contact'] = occupancy
    assert all_summaries, 'No completed trajectories; partial simulations are not published.'
    np.savez_compressed(WORK / 'md-contacts.npz', **all_arrays)
    report = {'preparation': preparation, 'replicas': all_summaries, 'number_of_completed_replicas': len(all_summaries),
              'total_production_ns': sum(s['production_ps'] for s in all_summaries) / 1000,
              'RMSF_method': 'Per-replica temporal C-alpha RMSF about its own 200–1000 ps mean after WAP residues 9–57 fit. This is real MD, not NMR ensemble spread.',
              'contact_method': 'Per-replica temporal CA distance below 8 A, excluding sequence separation <=3; 200–1000 ps; not inter-protein binding contacts.',
              'scope': f'Isolated human Elafin, 2REL model 1. {len(all_summaries)} completed independent-velocity replicas share one minimized protein/solvent starting configuration. Short pilots do not establish convergence, binding affinity, or clinical efficacy.'}
    (OUT / 'md-summary.json').write_text(json.dumps(report, indent=2))
    print(json.dumps(all_summaries, indent=2))


if __name__ == '__main__':
    # A rigidly transformed structure must fit exactly without reflection.
    x = np.array([[0.,0,0], [1,0,0], [0,2,0], [0,0,3]])
    rot = np.array([[0,-1,0], [1,0,0], [0,0,1]])
    assert rmsd(kabsch(x @ rot + 5, x)[0], x) < 1e-10
    main()
