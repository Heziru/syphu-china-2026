"""Local OpenMM runtime, including a reversible ASCII alias for Windows DLL loading."""
from pathlib import Path
import ctypes
import os
import subprocess
import openmm as mm

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT / "public/assets/dry-lab/atomistic"
WORK = ROOT / "outputs/dry-lab-atomistic"
OUT.mkdir(parents=True, exist_ok=True)
WORK.mkdir(parents=True, exist_ok=True)

def load_plugins():
    names = [mm.Platform.getPlatform(i).getName() for i in range(mm.Platform.getNumPlatforms())]
    if os.name == "nt" and "CPU" not in names:
        # OpenMM's native Windows plugin scanner does not handle this repo's Unicode path.
        # All files stay in the repo; the temporary drive alias is removed immediately.
        library = Path(mm.__file__).resolve().parent.parent / "OpenMM.libs/lib/plugins"
        if library.is_dir():
            mask = ctypes.windll.kernel32.GetLogicalDrives()
            drive = next(f"{chr(n+65)}:" for n in range(25, 3, -1) if not mask & (1 << n))
            subprocess.run(["subst", drive, str(library)], check=True, capture_output=True)
            try:
                mm.Platform.loadPluginsFromDirectory(drive + "/")
            finally:
                subprocess.run(["subst", drive, "/D"], check=True, capture_output=True)
    return [mm.Platform.getPlatform(i).getName() for i in range(mm.Platform.getNumPlatforms())]

def platform():
    names = load_plugins()
    if "OpenCL" in names:
        return mm.Platform.getPlatformByName("OpenCL"), {"Precision": "mixed"}
    if "CPU" in names:
        return mm.Platform.getPlatformByName("CPU"), {"Threads": "8"}
    raise RuntimeError("An accelerated CPU/OpenCL platform is required; Reference is too slow for this pilot.")
