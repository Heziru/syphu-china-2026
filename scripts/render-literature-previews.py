"""Render authentic paper first pages; never synthesize missing page previews.

Reads only outputs/literature/*.pdf named in PAPERS. Writes web thumbnails and
an auditable source manifest in the repository. Source PDFs remain unchanged.
Run with bundled Python (Pillow, pypdf) and Poppler pdftoppm on PATH.
"""
from pathlib import Path
import hashlib
import json
import shutil
import subprocess

from PIL import Image
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
PAPERS = {
    "rubens-2016": {"doi": "10.1038/ncomms11658", "source": "Existing project PDF: outputs/literature/rubens-2016.pdf", "check": "Synthetic mixed-signal computation"},
    "wang-2021": {"doi": "10.1038/s42003-021-02612-1", "source": "Existing project PDF: outputs/literature/wang-2021.pdf", "check": "Active maintenance of proton motive force"},
    "teng-2022": {"doi": "10.3389/fmicb.2022.819336", "source": "Existing project PDF: outputs/literature/teng-2022.pdf", "check": "Nissle"},
    "inda-2023": {"doi": "10.1038/s41586-023-06369-x", "source": "https://par.nsf.gov/servlets/purl/10438292", "check": "capsule for detecting labile", "version": "NSF public-access archived article PDF."},
    "andersen-1998": {"doi": "10.1128/AEM.64.6.2240-2246.1998", "source": "https://europepmc.org/articles/PMC106306?pdf=render", "check": "New Unstable Variants"},
    "hoffmann-2024": {"doi": "10.1038/s41467-024-44988-8", "source": "https://www.nature.com/articles/s41467-024-44988-8.pdf", "check": "Engineering stringent genetic"},
}


def main():
    poppler = shutil.which("pdftoppm")
    if not poppler:
        raise RuntimeError("pdftoppm must be available on PATH.")
    source_dir = ROOT / "outputs/literature"
    png_dir = source_dir / "previews"
    target_dir = ROOT / "public/assets/laboratory/literature"
    png_dir.mkdir(parents=True, exist_ok=True)
    target_dir.mkdir(parents=True, exist_ok=True)
    records = []
    for key, details in PAPERS.items():
        source = source_dir / f"{key}.pdf"
        first_page = PdfReader(source).pages[0]
        text = " ".join((first_page.extract_text() or "").split()).lower()
        if details["check"].lower() not in text:
            raise ValueError(f"First-page title verification failed: {key}")
        prefix = png_dir / key
        subprocess.run([poppler, "-f", "1", "-l", "1", "-singlefile", "-scale-to", "1600", "-png", str(source), str(prefix)], check=True, capture_output=True)
        with Image.open(prefix.with_suffix(".png")) as page:
            full = page.convert("RGB").resize((1200, round(page.height * 1200 / page.width)), Image.Resampling.LANCZOS)
            full.save(target_dir / f"{key}.webp", "WEBP", quality=87, method=6)
            small = full.resize((600, round(full.height / 2)), Image.Resampling.LANCZOS)
            small.save(target_dir / f"{key}-small.webp", "WEBP", quality=83, method=6)
            size = list(full.size)
        records.append({"id": key, **details, "page": 1, "pdf_sha256": hashlib.sha256(source.read_bytes()).hexdigest(), "preview": f"{key}.webp", "small_preview": f"{key}-small.webp", "size": size})
        print(f"Rendered {key}: first page, {size}")
    manifest = {"description": "True first-page renders. Missing previews are not generated.", "papers": records, "without_preview": ["begley-2005", "simmonds-1992"]}
    (target_dir / "preview-sources.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
