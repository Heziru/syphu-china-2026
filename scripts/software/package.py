"""Package the Mototype core and UI integration sources; do not run simulations."""
from pathlib import Path
import hashlib
import json
import subprocess
import zipfile
ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "public/assets/software/mototype"
def main():
    OUT.mkdir(parents=True, exist_ok=True)
    subprocess.run(["node", "--experimental-strip-types", "--input-type=module", "-e",
        "import{example}from'./src/contents/software/engine/runtime.ts';"
        "import{toCSV}from'./src/contents/software/engine/mototype.ts';"
        "import{writeFileSync}from'node:fs';"
        "for(const key of ['decay','mismatch','limit']){const d=example(key);writeFileSync('public/assets/software/mototype/'+d.name,toCSV(d));}"],
        cwd=ROOT, check=True)
    files={}
    for name in ["mototype.ts","kinetics.ts","runtime.ts"]:
        rel="src/contents/software/engine/"+name
        files[rel]=(ROOT/rel).read_bytes()
    for name in ["MototypeWorkbench.tsx","SoftwareDemos.tsx","software.css"]:
        rel="src/contents/software/"+name
        files[rel]=(ROOT/rel).read_bytes()
    for name in ["mototype.mjs","observed-check.mjs","kinetics-check.mjs","replay-check.mjs"]:
        rel="scripts/software/"+name
        files[rel]=(ROOT/rel).read_bytes()
    files["README.txt"]=(ROOT/"scripts/software/README.txt").read_bytes()
    files["LICENSE"]=(ROOT/"LICENSE").read_bytes()
    files["package.json"]=b'{"name":"mototype-core","private":true,"type":"module","engines":{"node":">=22.14.0"}}\n'
    for path in sorted(OUT.glob("*.csv")):
        files["examples/"+path.name]=path.read_bytes()
    manifest={"schema":"mototype-source-manifest/1","engine":"mototype-kinetics/0.2.0","scope":"Numerical core, CLI, fixtures, checks and Wiki UI sources. Synthetic data only.",
        "files":[{"path":name,"bytes":len(data),"sha256":hashlib.sha256(data).hexdigest()} for name,data in sorted(files.items())]}
    files["manifest.json"]=(json.dumps(manifest,indent=2)+"\n").encode()
    (OUT/"README.txt").write_bytes(files["README.txt"])
    (OUT/"manifest.json").write_bytes(files["manifest.json"])
    with zipfile.ZipFile(OUT/"mototype-source.zip","w",zipfile.ZIP_DEFLATED) as z:
        for name,data in sorted(files.items()):z.writestr(name,data)
    with zipfile.ZipFile(OUT/"mototype-source.zip") as z:
        assert z.testzip() is None
        for f in manifest["files"]:
            data=z.read(f["path"])
            assert len(data)==f["bytes"] and hashlib.sha256(data).hexdigest()==f["sha256"]
    print(json.dumps({"archive":"public/assets/software/mototype/mototype-source.zip","members":len(files),"integrity":"verified"}))
if __name__=="__main__":main()
