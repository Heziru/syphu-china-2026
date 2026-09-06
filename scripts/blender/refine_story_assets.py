"""Refined narrative anatomy. Run with the user's existing Blender executable."""
import math, bpy, sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
from build_review_assets import *

def digestive_refined():
    target,span=digestive()
    # Replace the regular serpentine coil by a continuous, layered anatomical course.
    for o in list(bpy.context.scene.objects):
        if o.name.startswith('jejunum and ileum'):bpy.data.objects.remove(o,do_unlink=True)
    bowel=bpy.data.materials['small bowel']
    path=[(.05,.42,-.1),(.58,.35,.02),(1.12,.12,.08),(.96,-.23,.15),(.35,-.16,.20),
          (-.26,.13,.04),(-.92,.05,.08),(-1.12,-.37,.17),(-.62,-.52,.26),
          (.10,-.48,.08),(.64,-.69,-.05),(1.11,-.62,.13),(1.24,-1.01,.18),
          (.74,-1.23,.19),(.20,-.97,.27),(-.36,-.86,.16),(-.95,-1.06,.07),
          (-1.04,-1.49,.18),(-.48,-1.66,.24),(.03,-1.40,.11),(.59,-1.53,.08),
          (.99,-1.84,.03),(.63,-2.08,.18),(.08,-1.94,.26),(-.43,-2.21,.14),
          (-.96,-2.10,.04),(-1.36,-1.87,.03),(-1.66,-1.65,0)]
    tube('continuous jejunum and ileum',path,.145,bowel)
    vessels=mat('mesenteric vessel accent',(.67,.30,.29),.62)
    # Sparse vessels sit on bowel contours rather than floating decorative lines.
    for a,b in [(3,6),(9,12),(16,20)]:
        line('subtle serosal vessel',[(x,y,z+.146) for x,y,z in path[a:b]],.008,vessels)
    return target,span

from refine_colon import colon_refined

def bacterium_refined():
    target,span=bacterium()
    outer=bpy.data.materials['outer membrane']
    # Fine surface dimples and membrane-associated structures, deterministic placement.
    for i in range(64):
        x=-1.2+2.4*((i*37)%67)/67;a=3.3+(i%9)*.30
        r=.731*math.sqrt(max(.01,1-(max(0,abs(x)-.98)/.72)**2))
        uv('outer envelope surface detail',(x,r*math.cos(a),r*math.sin(a)),(.013,.015,.015),outer)
    dna=bpy.data.materials['nucleoid DNA']
    for o in list(bpy.context.scene.objects):
        if o.name.startswith('folded bacterial chromosome'):bpy.data.objects.remove(o,do_unlink=True)
    pts=[]
    for i in range(321):
        a=i*2*PI/320
        pts.append((.95*math.cos(a),.26*math.sin(a)+.05*math.sin(9*a),.19+.08*math.cos(7*a)))
    line('folded bacterial chromosome',pts,.020,dna)
    return target,span

selected=sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else []
for name,fn in [('digestive-system',digestive_refined),('colon-section',colon_refined),('engineered-ecn',bacterium_refined)]:
    if not selected or name in selected: export_review(name,fn)
