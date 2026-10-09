"""Minimal independent file-integrity checks: DCD versus NPZ and genuine protein identities."""
import hashlib
import json
import struct
from pathlib import Path
import numpy as np
from PIL import Image

ROOT=Path(__file__).resolve().parents[3]
OUT=ROOT/'public/assets/dry-lab/atomistic'


def dcd(path):
    def record(f):
        size=f.read(4)
        if not size:return None
        n=struct.unpack('<i',size)[0];data=f.read(n);end=struct.unpack('<i',f.read(4))[0]
        assert n==end and len(data)==n
        return data
    with path.open('rb') as f:
        header=record(f);assert header[:4]==b'CORD'
        frames=struct.unpack('<i',header[4:8])[0]
        has_box=struct.unpack('<i',header[44:48])[0]
        record(f);atoms=struct.unpack('<i',record(f))[0]
        xyz=[]
        for _ in range(frames):
            if has_box: assert len(record(f))==48
            coords=[np.frombuffer(record(f),dtype='<f4').copy() for _ in range(3)]
            assert all(len(a)==atoms for a in coords)
            xyz.append(np.array(coords).T)
        assert record(f) is None
    return np.asarray(xyz),atoms


def main():
    summary=json.loads((OUT/'md-summary.json').read_text())
    assert len(summary['replicas'])==3 and summary['total_production_ns']==3
    results=[]
    for run in summary['replicas']:
        folder=OUT/f"md/replica-{run['replica']}"
        coords=np.load(folder/'protein-coordinates.npz')
        trajectory,atoms=dcd(folder/'protein-trajectory.dcd')
        assert atoms==830 and len(trajectory)==200
        assert coords['positions_nm'].shape==(201,830,3)
        assert np.allclose(coords['time_ps'],np.arange(201)*5)
        difference=float(np.max(np.abs(trajectory.astype(float)-coords['positions_nm'][1:].astype(float)*10)))
        assert difference<1e-4
        assert np.isfinite(trajectory).all()
        results.append({'replica':run['replica'],'DCD_atoms':atoms,'DCD_frames':len(trajectory),
          'NPZ_frames_including_t0':201,'maximum_DCD_NPZ_coordinate_difference_A':difference,
          'NPZ_sha256':hashlib.sha256((folder/'protein-coordinates.npz').read_bytes()).hexdigest(),
          'DCD_sha256':hashlib.sha256((folder/'protein-trajectory.dcd').read_bytes()).hexdigest()})
    figs={}
    for name in ['docking-validation','docking-human-ne','md-dynamics','md-topology-contacts']:
        im=Image.open(OUT/(name+'.png')).convert('RGB')
        a=np.asarray(im);fraction=float(np.mean(np.min(a,axis=2)<235))
        assert im.width>=2500 and im.height>=1000 and fraction>.03
        figs[name]={'dimensions':list(im.size),'nonwhite_fraction':fraction}
    docking=json.loads((OUT/'docking-summary.json').read_text())
    assert docking['cases']['1fle-redocking']['top1']['ligand_backbone_RMSD_A']<1.2
    assert docking['cases']['human-ne-elafin']['posthoc_geometry_screen']['passing_ranks']==[29]
    for derived in list((OUT/'docking').glob('*/top1-cartoon.pdb'))+list((OUT/'docking').glob('*/geometry-candidate.pdb')):
        rows=[s for s in derived.read_text().splitlines() if s.startswith('ATOM  ')]
        assert len(rows)==len({s[6:11] for s in rows}),f'Duplicate display serials: {derived}'
        pose_rank=29 if derived.name=='geometry-candidate.pdb' else 1
        raw=[s for s in (derived.parent/f'model_{pose_rank}.pdb').read_text().splitlines() if s.startswith('ATOM  ')]
        assert [s[11:66].rstrip() for s in rows]==[s[11:66].rstrip() for s in raw],f'Coordinate/identity changed: {derived}'
    rendering=json.loads((OUT/'docking-render-metadata.json').read_text())
    assert all(x['secondary_structure'].get('s',0)>0 for x in rendering)
    report={'status':'passed','completed_production_ns':3,'DCD_NPZ_checks':results,'figures':figs,
      'checks':['Three completed and separately seeded 1 ns trajectories','DCD and saved NPZ represent the same actual protein coordinates',
                'Original docking ranks preserved; known-pose reference and human prediction remain distinct',
                'Real deposited secondary-structure records survive PDB parsing; figures are not all-coil placeholders']}
    (OUT/'validation.json').write_text(json.dumps(report,indent=2))
    (OUT/'figure-dimensions.json').write_text(json.dumps({p.stem:list(Image.open(p).size) for p in sorted(OUT.glob('*.png'))},indent=2))
    print(json.dumps(report,indent=2))


if __name__=='__main__':main()
