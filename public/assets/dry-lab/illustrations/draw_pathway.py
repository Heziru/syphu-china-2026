"""Render the VER16.9 conceptual pathway as an editable, standalone SVG.

This is a diagram of the team's proposed design, not a measured response.
No sequence, promoter tuning or new genetic design is introduced.
"""
from pathlib import Path
from html import escape

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "public/assets/dry-lab/illustrations"
OUT.mkdir(parents=True, exist_ok=True)
parts = ['''<svg xmlns="http://www.w3.org/2000/svg" width="1500" height="1030" viewBox="0 0 1500 1030" role="img" aria-labelledby="title desc">
<title id="title">Two independent branches in the Elafin–EcN design</title>
<desc id="desc">ROS-responsive OxyR and pKatG control PspA support. Constitutive intracellular Elafin expression is separate. Extracellular release and support effects are hypotheses requiring measurement. Extracellular Elafin–elastase binding is an independent published reference.</desc>
<defs>
<marker id="arrow" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9" fill="#385a60"/></marker>
<marker id="coral" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto"><path d="M0,0 L9,4.5 L0,9" fill="#b96354"/></marker>
</defs>
<rect width="1500" height="1030" fill="white"/>
<g font-family="Arial, sans-serif" fill="#253f48">
<text x="55" y="60" font-size="34" font-weight="700">Two branches. Different biological roles.</text>
<text x="55" y="96" font-size="20" fill="#5c7076">Project design · VER16.9 · conceptual pathway</text>
<rect x="235" y="180" width="1010" height="622" rx="265" fill="#eef4ea" stroke="#598779" stroke-width="15"/>
<rect x="259" y="204" width="962" height="574" rx="239" fill="#f8faf4" stroke="#bad0b5" stroke-width="6"/>
<text x="738" y="753" text-anchor="middle" font-size="22" font-weight="700" fill="#678274">EcN cytoplasm</text>
<text x="960" y="151" font-size="19" fill="#598779">Cell envelope</text>
<path d="M1070 157 L1096 198" fill="none" stroke="#598779" stroke-width="2"/>
''']
def text(x, y, value, size=22, color="#253f48", weight="400", anchor="start"):
    parts.append(f'<text x="{x}" y="{y}" font-size="{size}" fill="{color}" font-weight="{weight}" text-anchor="{anchor}">{escape(value)}</text>')
def arrow(path, dashed=False, color="#385a60"):
    dash = ' stroke-dasharray="9 7"' if dashed else ''
    marker = "coral" if color=="#b96354" else "arrow"
    parts.append(f'<path d="{path}" fill="none" stroke="{color}" stroke-width="3"{dash} marker-end="url(#{marker})"/>')
def box(x,y,w,h,label,fill="#deebeb",stroke="#80a3a5"):
    parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="12" fill="{fill}" stroke="{stroke}" stroke-width="2"/>')
    text(x+w/2,y+h/2+8,label,24,weight="600",anchor="middle")
def gene(x,y,w,label,color):
    parts.append(f'<path d="M{x} {y} H{x+w-18} L{x+w} {y+20} L{x+w-18} {y+40} H{x} Z" fill="{color}" stroke="#52716a" stroke-width="2"/>')
    text(x+(w-10)/2,y+28,label,23,anchor="middle")
def protein(x,y,color="#d87f6e",scale=1):
    parts.append(f'<g transform="translate({x} {y}) scale({scale})" fill="{color}" stroke="#a9544a" stroke-width="1.5"><circle cx="0" cy="0" r="13"/><circle cx="13" cy="-10" r="12"/><circle cx="20" cy="10" r="14"/><circle cx="1" cy="20" r="12"/><circle cx="-12" cy="11" r="10"/></g>')

text(78,263,"ROS",30,weight="700")
text(69,293,"stress input",19,color="#657a7c")
for x,y,r in [(92,346,15),(133,326,10),(150,369,12),(63,382,9)]:
    parts.append(f'<circle cx="{x}" cy="{y}" r="{r}" fill="#eab27e" stroke="#c6844f" stroke-width="2"/>')
arrow("M162 349 H333")
text(361,251,"STRESS-RESPONSIVE SUPPORT",18,color="#5b8177",weight="700")
box(353,315,138,66,"OxyR")
arrow("M501 348 H572")
# Promoter with bent transcription arrow and a cassette on DNA.
parts.append('<path d="M560 406 H974" stroke="#536e71" stroke-width="3"/><path d="M597 401 V332 H660" fill="none" stroke="#385a60" stroke-width="3" marker-end="url(#arrow)"/>')
text(590,439,"pKatG",22,weight="600")
gene(681,384,128,"pspA","#c6dfc3")
gene(832,384,139,"mCherry","#edbdaf")
text(832,439,"reporter",18,color="#687e80")
arrow("M741 374 V315 Q741 286 799 286 H875")
box(889,259,135,62,"PspA","#cce1c6","#88a084")
arrow("M1023 290 Q1083 282 1121 353",True)
text(1055,388,"Membrane support",18,color="#657a70",anchor="middle")
text(1066,416,"hypothesis",18,color="#657a70",anchor="middle")
parts.append('<path d="M357 487 H1110" stroke="#cfdad1" stroke-width="2"/>')
text(360,531,"CONSTITUTIVE PRODUCTION",18,color="#987064",weight="700")
parts.append('<path d="M356 626 H808" stroke="#536e71" stroke-width="3"/><path d="M378 623 V577 H443" fill="none" stroke="#385a60" stroke-width="3" marker-end="url(#arrow)"/>')
gene(454,605,150,"Elafin","#edbdaf")
text(356,663,"Independent of pKatG",19,color="#657a7c")
arrow("M612 624 H728",color="#b96354")
protein(773,621)
protein(817,572,scale=.7)
protein(824,668,scale=.7)
text(847,613,"Intracellular",21,color="#9d5b4f")
text(847,642,"Elafin",24,color="#9d5b4f",weight="700")
arrow("M1000 625 H1300 V759",True,color="#b96354")
text(1360,557,"Release",23,color="#9d5b4f",weight="700",anchor="middle")
text(1360,588,"to be measured",19,color="#9d5b4f",anchor="middle")
# Separate extracellular reference, not a validated end-to-end therapeutic pathway.
text(65,847,"EXTRACELLULAR REFERENCE",18,color="#6c8395",weight="700")
parts.append('<path d="M69 907 C43 875 70 852 101 867 C128 842 154 868 143 890 C178 902 162 939 131 935 C93 962 57 944 69 907" fill="#8cb5d3" stroke="#466e93" stroke-width="3"/>')
text(201,911,"Elastase  +  Elafin",26,weight="600")
arrow("M465 901 H639")
arrow("M639 920 H465")
box(672,874,285,62,"Reversible binding","#e8eef5","#94b0c3")
arrow("M974 905 H1085")
text(1111,895,"Enzyme inhibition",24,weight="600")
text(1111,925,"purified-protein evidence",18,color="#657a7c")
text(70,987,"Solid: design / reference relation",18,color="#566d74")
parts.append('<path d="M423 981 H501" stroke="#385a60" stroke-width="3" stroke-dasharray="9 7"/>')
text(519,987,"Dashed: project hypothesis requiring measurement",18,color="#566d74")
parts.append('</g></svg>')
(OUT/"project-pathway.svg").write_text("".join(parts),encoding="utf8")
print(OUT/"project-pathway.svg")
