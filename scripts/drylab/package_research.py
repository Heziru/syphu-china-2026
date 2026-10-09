"""Package calculations, archived inputs and module-level instructions.

Run after all three atomistic replicas and their analyses have finished.
The archive preserves repository paths; environments and solver binaries stay out.
"""
from datetime import datetime, timezone
from pathlib import Path
import hashlib
import json
import shutil
import zipfile
import numpy
import scipy
import matplotlib
import PIL
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
ASSETS = ROOT / "public/assets/dry-lab"
OUT = ASSETS / "research"
SOURCES = [
    "analyze_structures.py", "render_structures.mjs", "plot_structures.py",
    "binding_kinetics.py", "research_models.py", "plot_overview.py",
    "research-report.md", "package_research.py", "package_structures.py",
]
MODULES = ["research", "adhesion", "atomistic", "illustrations", "literature-2026"]
EXTENSIONS = {
    ".csv", ".json", ".png", ".svg", ".pdf", ".py", ".mjs", ".sh", ".ps1",
    ".md", ".txt", ".pdb", ".xml", ".npz", ".dcd", ".out", ".log",
}
EXCLUDED = {"__pycache__", ".venv", "venv", "node_modules"}

README = """SYPHU-China / dry-lab reproducibility package

Extract into a new directory and run commands from that package root. Paths match
the wiki repository. The bundle is an analysis/data package, not the React site.
No private Elafin-IBD working directory, virtual environment, executable HDOCK
distribution or full-solvent trajectory is included.

1. INSTALL THE ANALYSIS ENVIRONMENT
   Python 3.12.7 was used for the recorded runs.
     python -m venv .venv
   Activate that environment using your platform's normal command, then:
     python -m pip install -r requirements-research.txt
   For browser-rendered molecular figures only:
     npm install
     npx playwright install chromium
   Alternatively the renderer can use an existing Edge/Chrome installation
   (set BROWSER_CHANNEL=msedge or chrome). No CDN is required by the renderer.

2. REGENERATE ANALYSES AND FIGURES FROM THE ARCHIVED INPUTS
     python scripts/drylab/analyze_structures.py
     node scripts/drylab/render_structures.mjs
     python scripts/drylab/plot_structures.py
     python scripts/drylab/binding_kinetics.py
     python scripts/drylab/research_models.py
     python scripts/drylab/plot_overview.py
     python scripts/drylab/adhesion/retention_model.py --output-dir public/assets/dry-lab/adhesion
     python scripts/drylab/adhesion/particle_transport.py --output-dir public/assets/dry-lab/adhesion
     python scripts/drylab/atomistic/analyze_docking.py
     node scripts/drylab/atomistic/render_docking.mjs
     node scripts/drylab/atomistic/render_docking_closeup.mjs
     python scripts/drylab/atomistic/analyze_md.py
     python scripts/drylab/atomistic/plot_atomistic.py
     python scripts/drylab/atomistic/validate_atomistic.py
     python scripts/drylab/draw_pathway.py

   These commands use the provided coordinate/pose/trajectory inputs.
   Reanalysis does not need HDOCK or OpenMM. Browser rendering needs Playwright.
   Scripts overwrite generated files in the extracted package. Intermediate
   arrays are written under outputs/. The original team workspace is not used.
   Module methods and run metadata describe seeds, units and numerical checks.
   The particle replay uses 600 fixed IDs from 4000 simulated trajectories.
   Counts include the complete cohort; exited/shed positions are not drawn.
   The colon outline is a schematic display mapping of strip coordinates,
   not an organ CFD mesh. See adhesion/particle-README.md for the mapping,
   time-step checks and the distinction from the finite-volume retention module.
   The docking close-up is a browser rendering of the archived candidate PDB;
   it does not run a new docking calculation or infer bond types from distances.
   Plot appearance can vary slightly with font/browser/graphics versions.

3. OPTIONAL: RERUN THE ATOMISTIC PILOT, RATHER THAN REANALYSE SAVED TRAJECTORIES
   Read public/assets/dry-lab/atomistic/README.md first.
   Install that module's pinned requirements, including OpenMM 8.6.1. The runtime
   requires a working accelerated CPU or OpenCL platform; Reference is rejected.
     python -m pip install -r public/assets/dry-lab/atomistic/requirements-md.txt
   On a separate extracted working copy, move the existing md/replica-* folders
   outside public/assets/dry-lab/atomistic/md before starting new simulations.
   The runner only reuses completed runs with a matching preparation fingerprint;
   the archived pilots predate that guard, so they must be moved aside. Retain
   the original downloaded package as the record of the submitted calculation.
     python scripts/drylab/atomistic/prepare_md.py
     python scripts/drylab/atomistic/run_md.py
     python scripts/drylab/atomistic/analyze_md.py
     python scripts/drylab/atomistic/plot_atomistic.py --only md

   prepare_md.py rebuilds the solvated starting system. To reuse the archived
   prepared system instead, omit that step. This pilot uses stochastic dynamics;
   identical seeds do not promise bitwise identical trajectories on other GPUs,
   platforms or software versions. Protein-only DCD/NPZ frames and serialized
   systems/states are supplied. Full-solvent DCDs are excluded from this download.

4. OPTIONAL: RERUN DOCKING WITH A SEPARATELY LICENSED SOLVER
   HDOCKlite is not redistributed. Follow the atomistic README to obtain the
   official solver and install it in outputs/dry-lab-atomistic/hdocklite/ under
   its own license. run_docking.sh requires Linux/WSL and the solver's runtime.
   Preparation currently imports the OpenMM runtime module, so the optional
   atomistic Python requirements are needed for this preparation command too.
     python scripts/drylab/atomistic/prepare_docking.py
     bash scripts/drylab/atomistic/run_docking.sh
     python scripts/drylab/atomistic/analyze_docking.py
     node scripts/drylab/atomistic/render_docking.mjs
     node scripts/drylab/atomistic/render_docking_closeup.mjs
     python scripts/drylab/atomistic/plot_atomistic.py --only docking

   run_docking.sh reuses a nonempty docking.out. In a separate working copy,
   move archived docking result files aside first if a fresh solve is wanted.
   Preserved input PDBs, complete 100-pose output sets and pose metrics allow
   the supplied analysis to run without installing the separately licensed solver.

5. RECORDS, ILLUSTRATIONS AND CHECKSUMS
   literature-2026 contains source/accession and wiki-presentation review records;
   it is not a downloaded cohort dataset or a claim that every listed study was
   analysed. Archived GTEx and UniProt records are included with their source IDs.
   illustrations/project-pathway.svg is regenerated by draw_pathway.py. The
   bitmap model-overview.png and its generation prompt are design assets, not
   simulated measurements; image generation is not a deterministic build step.
   research-bundle-manifest.json lists the size and SHA-256 of every ZIP member
   except the manifest itself. The packaging script verifies those bytes before
   publishing the archive. It is a repository utility, not an analysis entrypoint.

   LICENSE covers the team's repository content. Third-party files retain their
   own terms; see THIRD-PARTY-NOTICES.txt and the local vendor license files.

   Numerical verification checks an implementation; it is not experimental
   validation. Reference structures, prediction outputs, assumed scenarios and
   the short atomistic pilot retain their separate status in module metadata.
   The Peking 2025 wiki is credited for article organization, not models or data.
   Code and draft presentation were prepared with AI assistance and need team
   review before submission.
"""

NOTICES = """Third-party material in the SYPHU-China research archive

Team repository license: LICENSE (CC BY 4.0).
3Dmol.js 2.5.5: local vendor/3Dmol-LICENSE.txt and the accompanying license file.
KaTeX: research/KaTeX-LICENSE.txt. No KaTeX executable is needed by the analyses.
PDB, UniProt and GTEx: archived records retain accession identifiers, citations
and source links. Team licensing does not replace the original database terms.
OpenMM, NumPy, SciPy, Matplotlib, Pillow and Playwright: separate dependencies;
install them from their official distributions under their respective licenses.
Force-field data are resolved by the installed OpenMM distribution; serialized
systems record the calculation. See atomistic/README.md for methods/citations.
HDOCKlite: separately licensed academic solver, not included or relicensed here.
Only this project's inputs, output coordinates and analysis scripts are bundled.
"""


def digest(path):
    with path.open("rb") as stream:
        return hashlib.file_digest(stream, "sha256").hexdigest()


def main():
    # Do not publish partially written pilot trajectories.
    for replica in range(1, 4):
        folder = ASSETS / "atomistic/md" / f"replica-{replica}"
        run = json.loads((folder / "run.json").read_text(encoding="utf8"))
        assert run.get("complete"), f"Incomplete replica {replica}"
        for name in ["protein-coordinates.npz", "protein-trajectory.dcd", "analysis-arrays.npz"]:
            assert (folder / name).is_file(), f"Missing replica output: {folder / name}"
    assert (ASSETS / "atomistic/README.md").is_file(), "Wait for the atomistic methods README"
    assert (ASSETS / "atomistic/requirements-md.txt").is_file(), "Missing optional MD dependencies"
    md_summary = json.loads((ASSETS / "atomistic/md-summary.json").read_text(encoding="utf8"))
    assert md_summary["number_of_completed_replicas"] == 3, "Wait for the final three-replica analysis"
    particle = json.loads((ASSETS / "adhesion/particle-preview.json").read_text(encoding="utf8"))
    assert particle["geometry"]["kind"] == "schematic-colon-arclength-mapping", "Wait for the final colon display"
    assert particle["geometry"]["y_axis"] == "down", "Particle display orientation must be explicit"
    for relative in ["adhesion/particle-replay.json", "adhesion/particle-transport.png",
                     "adhesion/particle-README.md", "atomistic/docking-interface-closeup.png",
                     "atomistic/render_docking_closeup.mjs", "atomistic/closeup-contacts.csv"]:
        assert (ASSETS / relative).is_file(), f"Missing new module output: {relative}"

    dimensions = {}
    for path in sorted(OUT.glob("*.png")):
        with Image.open(path) as img:
            dimensions[path.stem] = list(img.size)
    (OUT / "figure-dimensions.json").write_text(json.dumps(dimensions, indent=2), encoding="utf8")
    for name in SOURCES:
        shutil.copy2(ROOT / "scripts/drylab" / name, OUT / name)
    shutil.copy2(ROOT / "node_modules/katex/LICENSE", OUT / "KaTeX-LICENSE.txt")
    requirements = "\n".join([
        f"numpy=={numpy.__version__}", f"scipy=={scipy.__version__}",
        f"matplotlib=={matplotlib.__version__}", f"Pillow=={PIL.__version__}",
    ]) + "\n"
    for name, content in {"requirements-research.txt": requirements,
                          "REPRODUCIBILITY.txt": README,
                          "THIRD-PARTY-NOTICES.txt": NOTICES}.items():
        (OUT / name).write_text(content, encoding="utf8")

    paths = [ROOT / "scripts/drylab" / name for name in SOURCES]
    paths += [ROOT / "scripts/browser-review.mjs", ROOT / "scripts/drylab/draw_pathway.py", ROOT / "LICENSE"]
    for module in ["adhesion", "atomistic", "literature"]:
        paths += [p for p in (ROOT / "scripts/drylab" / module).rglob("*")
                  if p.is_file() and p.suffix in {".py", ".mjs", ".sh", ".md", ".txt"}
                  and not EXCLUDED.intersection(p.parts)]
    for module in MODULES:
        paths += [p for p in (ASSETS / module).rglob("*") if p.is_file()
                  and p.suffix.lower() in EXTENSIONS and not EXCLUDED.intersection(p.parts)
                  and p.name != "research-bundle-manifest.json"]
    paths += list((ASSETS / "structures").glob("*.pdb"))
    paths += [p for p in (ASSETS / "vendor").iterdir() if p.is_file()]
    paths += [ASSETS / name for name in [
        "uniprot-P19957.json", "tissue-context.json", "tissue-context-gtex-v8-full.json",
        "fetch-tissue-context.ps1", "evidence-audit.json", "model-audit.json", "structure-audit.json",
    ]]
    paths = sorted(set(paths))
    for path in paths:
        assert path.is_file(), f"Missing input: {path}"
        assert path.stat().st_size < 64 * 1024**2, f"Review unexpectedly large asset: {path}"
        assert "solvated-trajectory" not in path.name, "Do not distribute full-solvent trajectories"

    pv = json.loads((ROOT / "node_modules/playwright/package.json").read_text(encoding="utf8"))["version"]
    generated = {
        "README.txt": README, "requirements-research.txt": requirements,
        "THIRD-PARTY-NOTICES.txt": NOTICES,
        "package.json": json.dumps({"private": True, "type": "module", "dependencies": {"playwright": pv}}, indent=2),
    }
    files = [{"file": p.relative_to(ROOT).as_posix(), "bytes": p.stat().st_size, "sha256": digest(p)} for p in paths]
    files += [{"file": name, "bytes": len(content.encode("utf8")),
               "sha256": hashlib.sha256(content.encode("utf8")).hexdigest()} for name, content in generated.items()]
    files.sort(key=lambda entry: entry["file"])
    manifest = {
        "date": datetime.now(timezone.utc).date().isoformat(),
        "scope": "Archived inputs, research analyses, retention, particle trajectories, atomistic pilot, molecular close-ups, illustrations and source records",
        "status": "Computational work and conceptual diagrams; module metadata defines each evidence boundary",
        "integrity": "Every archive member except this manifest is listed with uncompressed size and SHA-256.",
        "excluded": ["virtual environments", "HDOCK executables/runtime", "full-solvent trajectories", "private source directories"],
        "files": files,
    }
    manifest_text = json.dumps(manifest, indent=2, ensure_ascii=False)
    target = OUT / "syphu-drylab-research.zip"
    temporary = target.with_suffix(".zip.tmp")
    with zipfile.ZipFile(temporary, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as archive:
        for path in paths:
            archive.write(path, path.relative_to(ROOT).as_posix())
        for name, content in generated.items():
            archive.writestr(name, content.encode("utf8"))
        archive.writestr("research-bundle-manifest.json", manifest_text.encode("utf8"))
    with zipfile.ZipFile(temporary) as archive:
        expected = {entry["file"] for entry in files} | {"research-bundle-manifest.json"}
        assert set(archive.namelist()) == expected and len(archive.namelist()) == len(expected)
        assert archive.testzip() is None, "ZIP CRC verification failed"
        for entry in files:
            content = archive.read(entry["file"])
            assert len(content) == entry["bytes"] and hashlib.sha256(content).hexdigest() == entry["sha256"], entry["file"]
    temporary.replace(target)
    (OUT / "research-bundle-manifest.json").write_text(manifest_text, encoding="utf8")
    print(json.dumps({"files": len(files), "zip_bytes": target.stat().st_size,
                      "sha256": digest(target), "manifest_verified": True}, indent=2))


if __name__ == "__main__":
    main()
