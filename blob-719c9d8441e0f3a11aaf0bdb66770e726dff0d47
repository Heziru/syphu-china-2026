"""Create local portrait derivatives from explicitly verified public sources."""
from concurrent.futures import ThreadPoolExecutor
from io import BytesIO
from pathlib import Path
from urllib.request import Request, urlopen
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SOURCES = {
    "advisor-lirong": "https://static.igem.wiki/teams/5630/team/lirong-zhang-new.webp",
    "advisor-yixin": "https://static.igem.wiki/teams/5630/team/yixin-liu.webp",
    "advisor-haibo": "https://static.igem.wiki/teams/5630/team/haibo-li.webp",
    "pi-xianpu-ni": "https://static.igem.wiki/teams/5630/team/xianpuni.webp",
}

def prepare(item):
    name, url = item
    request = Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urlopen(request, timeout=45) as response:
        image = ImageOps.exif_transpose(Image.open(BytesIO(response.read()))).convert("RGB")
    original_size = image.size
    output = ROOT / "public/assets/team"
    output.mkdir(parents=True, exist_ok=True)
    image.thumbnail((1100, 1400), Image.Resampling.LANCZOS)
    image.save(output / f"{name}.webp", quality=88, method=6)
    image.thumbnail((420, 560), Image.Resampling.LANCZOS)
    image.save(output / f"{name}-small.webp", quality=82, method=6)
    return f"{name}: {original_size} -> local WebP pair"

if __name__ == "__main__":
    with ThreadPoolExecutor(max_workers=4) as pool:
        for result in pool.map(prepare, SOURCES.items()):
            print(result)
