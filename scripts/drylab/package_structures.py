"""Package precisely the structural-analysis sources; preserve repo-shaped paths."""
from pathlib import Path
import json
import hashlib
import zipfile
import numpy, scipy, matplotlib
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'public/assets/dry-lab/research'
paths=[ROOT/'scripts/drylab'/name for name in ['analyze_structures.py','render_structures.mjs','plot_structures.py','package_structures.py']]
paths += [ROOT/'scripts/browser-review.mjs']
paths += list((ROOT/'public/assets/dry-lab/structures').glob('*.pdb'))
paths += list((ROOT/'public/assets/dry-lab/vendor').glob('*'))
paths += [OUT/'structure-methods.txt',OUT/'structure-summary.json',OUT/'structure-figure-captions.json']
paths += [ROOT/'outputs/dry-lab-research/uniprot-P19957-features.json',ROOT/'outputs/dry-lab-research/render-provenance.json']
requirements='\n'.join([f'numpy=={numpy.__version__}',f'scipy=={scipy.__version__}',f'matplotlib=={matplotlib.__version__}'])+'\n'
playwright_version=json.loads((ROOT/'node_modules/playwright/package.json').read_text(encoding='utf8'))['version']
files=[]
for file in paths:
    files.append({'file':file.relative_to(ROOT).as_posix(),'sha256':hashlib.sha256(file.read_bytes()).hexdigest(),'bytes':file.stat().st_size})
manifest={'scope':'Structural reanalysis only; independent of hypothetical ecology/transport models','method':'structure-methods.txt','summary':'structure-summary.json','figures':['structure-nmr-ensemble','structure-interface','structure-full-distance-map'],'figureFormats':['png','svg','pdf'],'files':files}
(OUT/'structure-manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf8')
with zipfile.ZipFile(OUT/'structure-reproducibility.zip','w',zipfile.ZIP_DEFLATED) as archive:
    for file in paths: archive.write(file,file.relative_to(ROOT).as_posix())
    archive.writestr('requirements-structures.txt',requirements)
    archive.writestr('package.json',json.dumps({'private':True,'type':'module','dependencies':{'playwright':playwright_version}},indent=2))
    archive.write(OUT/'structure-manifest.json','structure-manifest.json')
print(f'Packaged {len(paths)} source/provenance files, {(OUT/"structure-reproducibility.zip").stat().st_size} bytes.')
