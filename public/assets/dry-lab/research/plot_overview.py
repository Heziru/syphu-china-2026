"""Scientific overview schematic for SYPHU-China (no new scientific results).

Run: python scripts/drylab/plot_overview.py
The script also copies itself beside the figures for download. To reproduce
from that download, place it at scripts/drylab/plot_overview.py in the wiki
repository, then run the command above from the repository root.
Uses the repository's existing Matplotlib dependency.

Caption: The proposed ROS/OxyR–pKatG–PspA support circuit runs separately from
constitutive intracellular Elafin expression. Population-dependent effective
release supplies a spatial transport model; the independently parameterized
Elafin–human elastase binding reference requires an absolute-concentration
calibration before it can be coupled to the spatial calculation.
"""
from pathlib import Path
import shutil
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyArrowPatch, Rectangle

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "public/assets/dry-lab/research"
OUT.mkdir(parents=True, exist_ok=True)
INK, GREEN, SAGE, APRICOT = "#173e35", "#286657", "#8caf9d", "#d78d77"
PALE, MUTE, LINE = "#edf3ed", "#596f66", "#c4d3c8"
plt.rcParams.update({
    "font.family": "DejaVu Sans", "font.size": 13,
    "text.color": INK, "svg.fonttype": "none", "pdf.fonttype": 42,
    "figure.facecolor": "white", "savefig.facecolor": "white",
})
fig, ax = plt.subplots(figsize=(10.7, 7.4))
fig.subplots_adjust(left=.025, right=.975, bottom=.03, top=.97)
ax.set(xlim=(0, 12.5), ylim=(0, 8.6))
ax.axis("off")


def text(x, y, label, size=13, color=INK, **kwargs):
    return ax.text(x, y, label, ha=kwargs.pop("ha", "center"), va="center", fontsize=size,
                   color=color, **kwargs)


def arrow(start, end, color=GREEN, dashed=False, both=False, curve=0):
    ax.add_patch(FancyArrowPatch(
        start, end, arrowstyle="<->" if both else "-|>",
        mutation_scale=14, linewidth=1.5, color=color,
        linestyle=(0, (4, 3)) if dashed else "-",
        connectionstyle=f"arc3,rad={curve}", shrinkA=0, shrinkB=0,
    ))


def header(x, y, letter, title, subtitle):
    text(x, y, letter, 18, GREEN, fontweight="bold", ha="left")
    text(x+.42, y, title, 16, INK, fontweight="bold", ha="left")
    text(x, y-.46, subtitle, 12.5, MUTE, ha="left")
    ax.plot([x, x+5.3], [y+.31, y+.31], color=LINE, lw=1)


# A. Two separate genetic branches; no ROS arrow leads to the Elafin cassette.
header(.18, 7.9, "A", "Parallel genetic design", "Proposed engineered EcN architecture")
text(.75, 6.82, "ROS", 15, fontweight="bold")
text(.75, 6.38, r"(H$_2$O$_2$)", 12.5, MUTE)
text(2.7, 6.82, "OxyR / pKatG", 14)
text(4.78, 6.82, "PspA", 15, fontweight="bold")
text(4.78, 6.39, "support", 12.5, MUTE)
arrow((1.35, 6.82), (1.87, 6.82))
arrow((3.57, 6.82), (4.22, 6.82))
text(.86, 5.35, "Constitutive\npromoter", 12.5, fontweight="bold", linespacing=1.3)
arrow((1.7, 5.35), (2.13, 5.35))
text(3.22, 5.35, "Intracellular\nElafin", 14, linespacing=1.35)
text(2.66, 4.58, "Constitutive expression · separate branch", 12.5, MUTE)

# B. Population states are abstract nodes, not organism artwork.
header(6.72, 7.9, "B", "Ecology & release", "EcN and a resident population")
for cx, label, width in [(7.54, r"EcN  $x$", 1.38),
                         (10.38, r"Resident  $y$", 1.97)]:
    ax.add_patch(Rectangle((cx-width/2, 6.5), width, .63,
                          facecolor=PALE, edgecolor=LINE, linewidth=1))
    text(cx, 6.82, label, 14)
arrow((8.36, 6.82), (9.25, 6.82), both=True)
text(8.8, 6.32, "competition", 12.5, MUTE)
arrow((5.43, 6.82), (6.63, 6.82))
arrow((7.53, 6.35), (8.38, 5.67), color=SAGE)
text(9.15, 5.38, r"Relative source  $j=qx$", 15, GREEN,
     fontweight="bold")
arrow((4.33, 5.35), (7.43, 5.35), color=APRICOT)
text(6.02, 5.85, "background release / leakage / lysis", 12.5, MUTE)
text(9.17, 4.58, r"$j=J/J_{\rm ref}$ · absolute scale uncalibrated", 12.5, MUTE)
arrow((9.15, 4.26), (9.15, 3.91), color=GREEN)

# C. A schematic domain, not a simulated concentration profile or tissue image.
header(6.72, 3.36, "C", "Spatial transport", "Diffusion, loss and boundary exchange")
ax.add_patch(Rectangle((7.75, 1.3), 3.45, .97,
                      facecolor=PALE, edgecolor=LINE, linewidth=1))
ax.plot([7.75, 7.75], [1.21, 2.36], color=GREEN, lw=2)
ax.plot([11.2, 11.2], [1.21, 2.36], color=SAGE, lw=2)
text(7.03, 1.79, r"$J$", 16, GREEN, fontweight="bold")
arrow((7.25, 1.79), (7.68, 1.79))
text(9.47, 1.8, r"Elafin  $C(z,t)$", 15)
arrow((11.27, 1.79), (11.95, 1.79), color=SAGE)
text(11.59, 1.04, "outflow", 12.5, MUTE)
text(9.3, .63, r"$\partial_t C = D\,\partial_{zz}C - k C$", 16)
text(9.48, 2.57, "Extracellular space", 12.5, MUTE)

# D. Binding is a separate reference-buffer calculation; dashed link is not
# a claim of calibrated tissue concentration or efficacy.
header(.18, 3.36, "D", "Binding reference", "Independent, well-mixed buffer model")
text(2.86, 1.94, r"Elafin + HNE  $\rightleftharpoons$  complex", 16,
     fontweight="bold")
text(2.86, 1.25, "Human leukocyte elastase", 12.5, MUTE)
text(2.86, .65, "Published rates · pH 8.0 · 25 °C", 12.5, MUTE)
arrow((6.97, .08), (5.26, .08), color=APRICOT, dashed=True)
text(6.11, .7, "Calibration\nrequired", 12.5, color="#93604c",
     linespacing=1.35)
text(6.11, -.35, "model units → absolute nM", 12.5, MUTE)

for ext in ["png", "svg", "pdf"]:
    fig.savefig(OUT / f"00-model-overview.{ext}", dpi=220,
                bbox_inches="tight", pad_inches=.18)
plt.close(fig)
shutil.copy2(Path(__file__), OUT / "plot_overview.py")
print("Saved 00-model-overview.png, .svg, .pdf and a downloadable script copy")
