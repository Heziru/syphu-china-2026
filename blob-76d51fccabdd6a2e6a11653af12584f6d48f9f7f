"""Editable Blender masters and web GLBs. Coordinates authored X / height / front.
Run: D:/blender.exe --background --factory-startup --python scripts/blender/build_review_assets.py
All generated files stay in this repository. No user Blender preferences are changed.
"""
import bpy, math, json, sys
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "public/assets/models"
MASTERS = ROOT / "outputs/blender"
OUT.mkdir(parents=True, exist_ok=True)
MASTERS.mkdir(parents=True, exist_ok=True)
PI = math.pi
def xyz(p): return (p[0], -p[2], p[1])
def mat(name, color, rough=.48, metal=0):
    m=bpy.data.materials.new(name); m.diffuse_color=(*color,1); m.use_nodes=True
    p=m.node_tree.nodes.get("Principled BSDF")
    p.inputs["Base Color"].default_value=(*color,1)
    p.inputs["Roughness"].default_value=rough
    p.inputs["Metallic"].default_value=metal
    return m
def reset():
    bpy.ops.object.select_all(action="SELECT"); bpy.ops.object.delete(use_global=False)
    for block in list(bpy.data.materials): bpy.data.materials.remove(block)
def finish(o,name,m,bevel=0,smooth=False):
    o.name=name
    if m:o.data.materials.append(m)
    if bevel:
        b=o.modifiers.new("soft manufactured edges","BEVEL");b.width=bevel;b.segments=2
    if smooth:
        for f in o.data.polygons:f.use_smooth=True
    return o
def box(name,p,size,m,bevel=.015):
    bpy.ops.mesh.primitive_cube_add(size=1,location=xyz(p))
    o=bpy.context.object;o.scale=(size[0],size[2],size[1])
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    return finish(o,name,m,min(bevel,min(size)*.2))
def uv(name,p,scale,m):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32,ring_count=20,location=xyz(p))
    o=bpy.context.object;o.scale=(scale[0],scale[2],scale[1])
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    return finish(o,name,m,smooth=True)
def cyl(name,p,r,h,m,verts=24):
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts,radius=r,depth=h,location=xyz(p))
    return finish(bpy.context.object,name,m,.008,True)
def mesh(name,verts,faces,m,smooth=False):
    data=bpy.data.meshes.new(name); data.from_pydata([xyz(v) for v in verts],[],faces);data.update()
    o=bpy.data.objects.new(name,data);bpy.context.collection.objects.link(o)
    return finish(o,name,m,smooth=smooth)
def line(name,points,r,m,sharp=False):
    c=bpy.data.curves.new(name,"CURVE");c.dimensions="3D";c.resolution_u=2 if len(points)>20 else 8;c.bevel_depth=r;c.bevel_resolution=2;c.use_fill_caps=True
    s=c.splines.new("BEZIER");s.bezier_points.add(len(points)-1)
    for p,v in zip(s.bezier_points,points):
        p.co=xyz(v);p.handle_left_type="VECTOR" if sharp else "AUTO";p.handle_right_type="VECTOR" if sharp else "AUTO"
    o=bpy.data.objects.new(name,c);bpy.context.collection.objects.link(o);o.data.materials.append(m)
    return o
def ring(name,p,rx,ry,m,r=.018):
    pts=[(p[0]+rx*math.cos(i*2*PI/48),p[1]+ry*math.sin(i*2*PI/48),p[2]) for i in range(49)]
    return line(name,pts,r,m)
def arc(name,x,y,z,r,m):
    return line(name,[(x+r*math.cos(i*PI/32),y+r*math.sin(i*PI/32),z) for i in range(33)],.035,m)
def palette():
    return [mat("oxblood masonry",(.38,.075,.084)),mat("cream limestone",(.83,.68,.45)),mat("edge limestone",(.94,.83,.62)),mat("blue green glazing",(.19,.36,.39),.25),mat("mullion bronze",(.34,.30,.23),.4,.3)]
def window(x,y,z,w,h,stone,glass,frame,name="window"):
    box(name+" reveal",(x,y,z),(w+.09,h+.10,.065),stone,.008)
    box(name+" glazing",(x,y,z+.04),(w,h,.035),glass,.005)
    for xx in [-w/6,w/6]:box(name+" vertical mullion",(x+xx,y,z+.065),(.017,h,.022),frame,.002)
    box(name+" transom",(x,y+.06,z+.065),(w,.018,.024),frame,.002)
    box(name+" projecting sill",(x,y-h/2-.035,z+.075),(w+.12,.045,.14),stone,.008)
def stairs(width,threshold,zback,n,m):
    # A single datum: the highest tread meets the door sill, and all treads overlap.
    for i in range(n):
        h=threshold*(n-i)/n;depth=.24*(i+1)+.18
        box("entrance tread %02d"%i,(0,h/2,zback+depth/2),(width+.05*i,h,depth),m,.008)
    for x in [-width/2-.12,width/2+.12]:
        line("stone stair cheek",[(x,threshold+.13,zback),(x,.12,zback+.24*n+.18)],.075,m)
def library():
    red,stone,trim,glass,frame=palette()
    base=mat("foundation",(.50,.48,.44))
    for x in [-3.45,3.45]:
        box("library wing",(x,1.52,-.12),(4.3,3.04,1.25),red)
        box("raised plinth",(x,.20,-.1),(4.35,.40,1.3),base)
        for y in [.43,1.65,3.04]:
            box("continuous cornice",(x,y,-.05),(4.45,.09,1.4),trim)
        for i in range(10):
            for y in [.88,1.35,2.02,2.65]:
                window(x-1.9+i*.42,y,.54,.24,.34,stone,glass,frame)
        box("colonnade entablature",(x,1.80,1.04),(4.3,.15,.8),trim)
        for xx in [x-1.8,x-.9,x,x+.9,x+1.8]:
            cyl("wing column shaft",(xx,.90,1.30),.054,1.64,trim)
            box("column foot",(xx,.12,1.30),(.20,.16,.20),stone)
            box("column capital",(xx,1.70,1.30),(.18,.10,.18),trim)
        for i in range(31):
            box("balustrade spindle",(x-2.0+i*.134,2.04,1.34),(.025,.34,.03),trim,.002)
        box("balustrade cap",(x,2.22,1.34),(4.3,.055,.09),trim)
    box("central tower",(0,1.78,-.17),(2.75,3.56,1.4),red)
    for y in [3.42,3.57]:box("tower cornice",(0,y,-.17),(2.94,.10,1.53),trim)
    for x in [-1.08,-.68,-.27,.27,.68,1.08]:
        box("tower pilaster",(x,3.05,.57),(.095,.66,.10),trim)
        if abs(x)<1:window(x,3.04,.58,.18,.53,stone,glass,frame)
    threshold=.53
    box("entrance landing",(0,.265,.92),(2.95,.53,1.08),stone)
    for x,r in [(-.91,.31),(0,.55),(.91,.31)]:
        top=1.84 if x==0 else 1.52
        box("arched portal glazing",(x,(top+threshold)/2,.70),(2*r,top-threshold,.07),glass)
        verts=[(x,top,.744)]+[(x+r*math.cos(i*PI/32),top+r*math.sin(i*PI/32),.744) for i in range(33)]
        mesh("arch infill",verts,[(0,i,i+1) for i in range(1,33)],glass)
        arc("arched limestone surround",x,top,.79,r+.025,trim)
        for y in [.72,.96,1.20,1.44,1.68,1.92]:
            if y<top:box("portal transom",(x,y,.78),(2*r,.018,.024),frame,.002)
        for dx in [-r*.65,0,r*.65]:
            box("portal mullion",(x+dx,(top+threshold)/2,.78),(.018,top-threshold,.025),frame,.002)
    for x in [-1.43,-.61,.61,1.43]:
        cyl("entrance fluted column",(x,1.57,1.18),.079,2.02,trim,32)
        for i in range(12):
            a=i*PI/6
            cyl("column fluting",(x+.078*math.cos(a),1.57,1.18+.078*math.sin(a)),.006,1.86,stone,8)
        box("entrance column capital",(x,2.61,1.18),(.22,.13,.23),trim)
        box("entrance column base",(x,.59,1.18),(.22,.14,.23),trim)
    # Solid triangular pediment, with inset front panel and three continuous edge mouldings.
    verts=[(-1.67,2.68,1.08),(1.67,2.68,1.08),(0,3.45,1.08),(-1.67,2.68,1.38),(1.67,2.68,1.38),(0,3.45,1.38)]
    mesh("pediment",verts,[(0,2,1),(3,4,5),(0,1,4,3),(1,2,5,4),(2,0,3,5)],stone)
    line("pediment moulding",[(-1.67,2.68,1.4),(0,3.45,1.4),(1.67,2.68,1.4),(-1.67,2.68,1.4)],.037,trim,True)
    stairs(2.9,threshold,1.22,10,stone)
    cyl("cupola drum",(0,3.91,-.17),.60,.65,red,48)
    for i in range(12):
        a=2*PI*i/12
        o=box("cupola pilaster",(.605*math.sin(a),3.93,-.17+.605*math.cos(a)),(.045,.55,.07),trim,.004)
        o.rotation_euler.z=-a
        o=box("cupola window",(.60*math.sin(a+.13),3.93,-.17+.60*math.cos(a+.13)),(.10,.37,.022),glass,.008)
        o.rotation_euler.z=-(a+.13)
    for y in [3.59,4.24]:cyl("cupola cornice",(0,y,-.17),.66,.07,trim,64)
    # Tall ellipsoidal dome with a real closed underside.
    verts=[];faces=[]
    for j in range(21):
        t=j*PI/40
        for i in range(64):
            a=i*2*PI/64;verts.append((.65*math.cos(t)*math.cos(a),4.27+.84*math.sin(t),-.17+.65*math.cos(t)*math.sin(a)))
    for j in range(20):
        for i in range(64):a=j*64+i;b=j*64+(i+1)%64;faces.append((a,b,b+64,a+64))
    faces.append(tuple(reversed(range(64))))
    mesh("golden dome",verts,faces,stone,True)
    cyl("lantern collar",(0,5.15,-.17),.074,.18,trim)
    bpy.ops.mesh.primitive_cone_add(vertices=24,radius1=.045,radius2=.002,depth=.44,location=xyz((0,5.46,-.17)))
    finish(bpy.context.object,"spire",stone,smooth=True)
    return (0,2.55,.3),12.4
def research():
    red,stone,trim,glass,frame=palette()
    box("research block",(0,1.64,-.20),(8.6,3.28,1.9),red)
    for y in [.20,1.18,2.24,3.28]:
        box("limestone belt",(0,y,-.15),(8.7,.12,2.02),trim)
    for i in range(19):
        x=-3.8+i*.42
        for y in [.71,1.73,2.80]:
            if abs(x)<.6 and y<1:continue
            window(x,y,.79,.24,.55,stone,glass,frame)
    for x in [-4,-1.40,1.40,4]:
        box("projecting tower",(x,1.9,.05),(.72,3.8,2.05),red)
        box("tower crown",(x,3.72,.05),(.90,.39,2.18),trim)
        for dx in [-.28,.28]:box("tower corner strip",(x+dx,1.88,1.09),(.045,3.36,.04),stone,.003)
        ring("crown medallion",(x,3.74,1.16),.115,.115,stone,.025)
    box("roof slab",(0,3.36,-.2),(8.65,.10,1.98),stone)
    box("entrance glazing",(0,.84,1.10),(1.06,1.04,.065),glass)
    for x in [-.54,0,.54]:box("entrance frame",(x,.84,1.16),(.035,1.06,.04),frame,.004)
    for x in [-.08,.08]:box("door handle",(x,.72,1.20),(.018,.17,.025),trim,.004)
    box("canopy",(0,1.43,1.28),(1.42,.09,.68),trim)
    stairs(1.65,.32,1.13,5,stone)
    return (0,1.85,.25),10.2

def sample_path(points,steps=12):
    pts=[Vector(p) for p in points];out=[]
    for i in range(len(pts)-1):
        a=pts[max(0,i-1)];b=pts[i];c=pts[i+1];d=pts[min(len(pts)-1,i+2)]
        for j in range(steps):
            t=j/steps
            out.append(.5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t))
    out.append(pts[-1]);return out
def tube(name,points,r,m,bulge=0):
    pts=sample_path(points);verts=[];faces=[];n=20
    for j,p in enumerate(pts):
        t=(pts[min(j+1,len(pts)-1)]-pts[max(0,j-1)]).normalized()
        u=t.cross(Vector((0,0,1))).normalized();v=t.cross(u).normalized()
        rr=r*(1+bulge*math.cos(j*.85))
        for i in range(n):verts.append(tuple(p+rr*(math.cos(i*2*PI/n)*u+math.sin(i*2*PI/n)*v)))
    for j in range(len(pts)-1):
        for i in range(n):a=j*n+i;b=j*n+(i+1)%n;faces.append((a,b,b+n,a+n))
    faces+=[tuple(reversed(range(n))),tuple((len(pts)-1)*n+i for i in range(n))]
    return mesh(name,verts,faces,m,True)
def digestive():
    stomach=mat("gastric muscular wall",(.72,.30,.25),.43)
    bowel=mat("small bowel",(.88,.51,.38),.45)
    colon=mat("colon muscular wall",(.67,.30,.28),.48)
    band=mat("taenia coli",(.81,.44,.36),.5)

    # Continuous J-shaped stomach surface; broad fundus and body, narrower antrum/pylorus.
    centers=sample_path([(.18,3.4,0),(.18,2.85,0),(.34,2.65,0),(.83,2.57,0),(1.17,2.15,0),(1.19,1.52,0),(.78,1.11,0),(.18,1.13,0),(-.23,1.20,0)],12)
    radii=[.17,.17,.19,.48,.56,.51,.36,.22,.15];verts=[];faces=[];n=40
    for j,p in enumerate(centers):
        f=j/(len(centers)-1)*(len(radii)-1);k=min(int(f),len(radii)-2);rr=radii[k]+(radii[k+1]-radii[k])*(f-k)
        tangent=(centers[min(j+1,len(centers)-1)]-centers[max(0,j-1)]).normalized()
        u=tangent.cross(Vector((0,0,1))).normalized();v=tangent.cross(u).normalized()
        for i in range(n):verts.append(tuple(p+rr*(math.cos(2*PI*i/n)*u+.78*math.sin(2*PI*i/n)*v)))
    for j in range(len(centers)-1):
        for i in range(n):a=j*n+i;b=j*n+(i+1)%n;faces.append((a,b,b+n,a+n))
    mesh("stomach fundus body antrum",verts,faces,stomach,True)
    uv("pyloric junction",(-.23,1.20,0),(.18,.15,.15),stomach)
    tube("duodenum",[(-.23,1.20,0),(-.73,1.08,0),(-.83,.54,-.10),(-.43,.35,-.12),(.05,.42,-.10)],.145,bowel)
    path=[(.05,.42,-.10),(.81,.33,0),(1.13,.05,.04),(.70,-.10,.04),(-.83,-.12,0),(-1.11,-.32,0),(-.70,-.49,.04),(.87,-.50,.10),(1.10,-.72,.10),(.63,-.89,.08),(-.83,-.89,.04),(-1.10,-1.10,.04),(-.64,-1.28,.12),(.77,-1.29,.14),(.96,-1.52,.12),(.53,-1.72,.08),(-.50,-1.73,.10),(-.85,-1.94,.12),(-.48,-2.12,.08),(.43,-2.13,.10),(.65,-2.34,.06),(.08,-2.46,0),(-.71,-2.25,-.07),(-1.66,-1.65,0)]
    path=[(x+.07*math.sin(i*1.8),y+.045*math.sin(i*1.4),z+.10*math.sin(i*.8)) if 2<i<len(path)-3 else (x,y,z) for i,(x,y,z) in enumerate(path)]
    tube("jejunum and ileum",path,.14,bowel)
    cp=[(-1.67,-1.78,0),(-1.77,-1.32,0),(-1.84,-.55,0),(-1.83,.44,0),(-1.60,.76,0),(-.90,.70,.23),(0,.56,.30),(.95,.64,.24),(1.72,.75,0),(1.89,.38,0),(1.89,-.54,0),(1.79,-1.54,0),(1.49,-2.16,0),(1.08,-2.62,.12),(.47,-2.67,.14),(.16,-2.93,0),(.18,-3.3,-.02)]
    tube("cecum ascending transverse descending sigmoid rectum",cp,.24,colon,.075)
    line("anterior taenia coli",[(x,y,z+.235) for x,y,z in cp],.022,band)
    uv("rounded cecal pouch",(-1.67,-1.78,0),(.24,.29,.24),colon)
    tube("vermiform appendix",[(-1.73,-1.97,0),(-1.83,-2.15,.03),(-1.65,-2.35,.05)],.06,colon)
    return (0,0,0),9.6
def colon_section():
    outer=mat("longitudinal muscle",(.68,.29,.27));circ=mat("circular muscle",(.83,.41,.34))
    sub=mat("submucosa",(.91,.65,.47));muc=mat("colonic mucosa",(.88,.49,.44))
    mucus=mat("mucus surface",(.63,.77,.70));crypt=mat("crypt lining",(.74,.32,.32))
    # Longitudinally opened colon; concentric walls expose real thickness, no villi.
    for name,rad,thick,m in [("outer muscle",1.05,.10,outer),("circular muscle",.95,.10,circ),("submucosa",.85,.12,sub),("mucosa",.73,.09,muc)]:
        verts=[];faces=[];n=64
        for x in [-2.4,2.4]:
            for r in [rad,rad-thick]:
                for j in range(n+1):
                    a=PI+.08+j*(PI-.16)/n;verts.append((x,r*math.cos(a),r*math.sin(a)))
        stride=n+1
        for j in range(n):
            faces.extend([(j,j+1,2*stride+j+1,2*stride+j),(stride+j,3*stride+j,3*stride+j+1,stride+j+1),(j,stride+j,stride+j+1,j+1),(2*stride+j,2*stride+j+1,3*stride+j+1,3*stride+j)])
        faces.extend([(0,2*stride,3*stride,stride),(n,stride+n,3*stride+n,2*stride+n)])
        mesh(name,verts,faces,m,True)
    # Recessed crypt mouths cut into an epithelial inset, visibly tubular rather than finger-like.
    box("crypt substrate",(0,-.715,.22),(4.55,.06,1.07),sub,.02)
    for ix in range(15):
        for iz in range(3):
            x=-2.12+ix*.30;z=-.08+iz*.30
            verts=[];faces=[];n=24
            for row in range(4):
                for j in range(n):
                    a=j*2*PI/n;c=math.cos(a);si=math.sin(a)
                    r=.15/max(abs(c),abs(si)) if row in (0,3) else (.068 if row==1 else .042)
                    verts.append((x+r*c,-.53 if row<2 else -.68,z+r*si))
            for row in range(2):
                for j in range(n):
                    a=row*n+j;b=row*n+(j+1)%n
                    faces.append((a,b,b+n,a+n))
            faces.append(tuple(2*n+j for j in reversed(range(n))))
            for j in range(n):
                k=(j+1)%n
                faces.append((j,3*n+j,3*n+k,k))
                faces.append((2*n+j,2*n+k,3*n+k,3*n+j))
            mesh("recessed epithelial crypt",verts,faces,muc,True)
    for i in range(7):
        uv("goblet cell",( -1.85+i*.6,-.57,.63),(.085,.11,.075),mucus)
    return (0,-.13,0),5.9
def bacterium():
    outer=mat("outer membrane",(.13,.43,.42),.38);pg=mat("peptidoglycan",(.84,.72,.46))
    inner=mat("inner membrane",(.41,.66,.51),.45);cyto=mat("cytoplasm",(.75,.83,.64))
    dna=mat("nucleoid DNA",(.18,.36,.40));plasmid=mat("engineered plasmid",(.40,.49,.72))
    ribo=mat("ribosomes",(.42,.63,.60));elafin=mat("Elafin schematic",(.89,.61,.20))
    psp=mat("PspA schematic",(.47,.40,.65))
    for name,r,m in [("outer membrane",.72,outer),("peptidoglycan layer",.655,pg),("inner membrane",.602,inner)]:
        verts=[];faces=[];nx=64;na=48
        for j in range(nx+1):
            x=-1.7+3.4*j/nx
            rr=r*math.sqrt(max(.00002,1-(max(0,abs(x)-.98)/.72)**2))
            for k in range(na+1):
                a=2.92+(2*PI-2.70)*k/na;verts.append((x,rr*math.cos(a),rr*math.sin(a)))
        for j in range(nx):
            for k in range(na):a=j*(na+1)+k;faces.append((a,a+1,a+na+2,a+na+1))
        o=mesh(name,verts,faces,m,True)
        so=o.modifiers.new("membrane thickness","SOLIDIFY");so.thickness=.018
    uv("cytoplasmic volume",(0,0,-.16),(1.61,.51,.35),cyto)
    pts=[(1.08*math.sin(i*2*PI/180),.23*math.cos(i*2*PI/180)+.08*math.sin(i*10*PI/180),.29+.03*math.sin(i*6*PI/180)) for i in range(181)]
    line("folded bacterial chromosome",pts,.027,dna)
    ring("plasmid loop",(.84,.05,.30),.30,.22,plasmid,.025)
    for i in range(30):
        x=-1.24+2.48*((i*17)%31)/31;y=.35*math.sin(i*2.4)
        uv("ribosome",(x,y,.15),(.039,.030,.033),ribo)
    for i in range(9):
        x=-.92+i*.23;uv("constitutive Elafin product",(x,-.33,.26),(.045,.034,.037),elafin)
    for x in [-.8,-.4,0,.4,.8]:
        line("PspA inner membrane association",[(x-.045,.53,.11),(x,.55,.15),(x+.045,.53,.11)],.027,psp)
    return (0,0,0),4.6
def clean_bench():
    shell=mat("ivory powder coat",(.89,.91,.87));steel=mat("brushed stainless steel",(.43,.52,.53),.34,.52)
    dark=mat("graphite controls",(.055,.10,.12));sage=mat("sage trim",(.27,.44,.42))
    glass=mat("sash glazing",(.66,.82,.82),.20);p=glass.node_tree.nodes.get("Principled BSDF");p.inputs["Alpha"].default_value=.18
    glass.diffuse_color=(.66,.82,.82,.18);glass.surface_render_method="DITHERED"
    light=mat("work light",(.95,.97,.84));light.node_tree.nodes.get("Principled BSDF").inputs["Emission Color"].default_value=(.8,.85,.65,1)
    light.node_tree.nodes.get("Principled BSDF").inputs["Emission Strength"].default_value=.7
    for x in [-.37,.37]:
        for z in [-.27,.27]:
            box("support leg",(x,.32,z),(.041,.53,.041),shell,.006)
            o=cyl("rubber caster",(x,.055,z),.038,.032,dark);o.rotation_euler.y=PI/2
            box("caster fork",(x,.094,z),(.05,.044,.026),steel,.005)
        box("lower side brace",(x,.19,0),(.037,.035,.58),shell,.005)
    for z in [-.27,.27]:box("stand cross member",(0,.57,z),(.80,.046,.045),shell,.005)
    box("rear cabinet wall",(0,1.02,-.32),(.88,.88,.048),shell,.009)
    for x in [-.42,.42]:
        box("closed side casing",(x,1.02,0),(.044,.88,.65),shell,.008)
        box("side liner",(x*.94,.925,-.02),(.013,.40,.57),steel,.002)
    box("upper filter housing",(0,1.33,-.01),(.88,.28,.64),shell,.012)
    box("filter grille recess",(0,1.173,-.02),(.75,.014,.49),dark,.003)
    for i in range(27):box("HEPA diffuser slat",(-.35+i*.027,1.16,-.02),(.011,.012,.46),shell,.002)
    box("worktop continuous seal",(0,.709,0),(.79,.035,.59),sage,.004)
    box("steel work surface",(0,.735,0),(.78,.018,.59),steel,.003)
    box("worktop rear upstand",(0,.765,-.284),(.79,.058,.012),steel,.003)
    box("chamber back liner",(0,.946,-.291),(.79,.37,.016),steel,.003)
    for x in [-.389,.389]:box("sealed worktop corner",(x,.769,0),(.019,.058,.58),steel,.004)
    box("sash",(0,1.048,.328),(.755,.244,.007),glass,.001)
    for x in [-.387,.387]:
        box("sash runner",(x,.946,.337),(.026,.45,.037),sage,.004)
    box("sash handle",(0,.923,.348),(.755,.019,.037),steel,.004)
    box("control band",(0,1.265,.321),(.82,.10,.028),sage,.005)
    box("display glass",(-.19,1.266,.343),(.19,.056,.008),dark,.004)
    for i in range(4):
        o=cyl("control key",(.12+i*.06,1.265,.345),.014,.012,shell,20);o.rotation_euler.x=PI/2
    box("task light",(0,1.16,.17),(.57,.015,.038),light,.003)
    for x in [-.40,.40]:
        for y in [.78,1.22,1.40]:
            o=cyl("panel screw",(x,y,.333),.007,.004,steel,12);o.rotation_euler.x=PI/2
    for i in range(30):
        box("front return grille",(-.35+i*.024,.745,.256),(.011,.004,.045),dark,.001)
    return (0,.77,0),2.25

def export_review(name,build):
    reset();target,span=build()
    # Convert evaluated geometry and consolidate material batches for the browser.
    for o in list(bpy.context.scene.objects):
        if o.type in {"MESH","CURVE"}:
            bpy.ops.object.select_all(action="DESELECT");o.select_set(True);bpy.context.view_layer.objects.active=o
            bpy.ops.object.convert(target="MESH")
    objects=list(bpy.context.scene.objects)
    for o in objects:o["semantic_part"]=o.name
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.export_scene.gltf(filepath=str(OUT/(name+".glb")),export_format="GLB",use_selection=True,export_yup=True,export_extras=True)
    # Keep the editable semantic parts in the .blend; studio objects are excluded from GLB.
    scene=bpy.context.scene;scene.render.engine="CYCLES";scene.cycles.samples=24;scene.cycles.use_denoising=True
    scene.render.resolution_x=1200;scene.render.resolution_y=1000;scene.render.resolution_percentage=100
    scene.world.use_nodes=True
    scene.world.node_tree.nodes["Background"].inputs["Color"].default_value=(.72,.75,.71,1)
    scene.world.node_tree.nodes["Background"].inputs["Strength"].default_value=.45
    scene.view_settings.view_transform="AgX"
    studio=mat("studio floor",(.86,.86,.82),.85)
    floor_y=-.10 if name in ["library","research-building","clean-bench"] else -span*.45
    box("STUDIO floor",(0,floor_y,0),(span*8,.04,span*8),studio,0)
    for label,pos,power,size in [("key",(-span*.5,span,span),span*span*8,span*.7),("fill",(span,span*.4,span*.7),span*span*4,span),("rim",(0,span*.7,-span*.5),span*span*6,span*.5)]:
        bpy.ops.object.light_add(type="AREA",location=xyz(pos));o=bpy.context.object;o.name="STUDIO "+label;o.data.energy=power;o.data.shape="DISK";o.data.size=size
        o.rotation_euler=(Vector(xyz(target))-o.location).to_track_quat("-Z","Y").to_euler()
    bpy.ops.object.camera_add();camera=bpy.context.object;scene.camera=camera;camera.data.type="ORTHO";camera.data.ortho_scale=span
    manifest={"name":name,"parts":[o.name for o in objects],"meshes":len(objects),"triangles":sum(sum(len(p.vertices)-2 for p in o.data.polygons) for o in objects),"views":[]}
    for view,dx,dy in [("front",0,.14),("three-quarter",.30,.22)]:
        camera.location=xyz((target[0]+span*dx,target[1]+span*dy,target[2]+span*1.7))
        camera.rotation_euler=(Vector(xyz(target))-camera.location).to_track_quat("-Z","Y").to_euler()
        scene.render.filepath=str(MASTERS/(name+"-"+view+".png"));bpy.ops.render.render(write_still=True)
        manifest["views"].append(scene.render.filepath)
    bpy.ops.wm.save_as_mainfile(filepath=str(MASTERS/(name+".blend")))
    (MASTERS/(name+".json")).write_text(json.dumps(manifest,indent=2),encoding="utf-8")
    print("ASSET_COMPLETE",name,manifest["triangles"],flush=True)

builders={"library":library,"research-building":research,"digestive-system":digestive,"colon-section":colon_section,"engineered-ecn":bacterium,"clean-bench":clean_bench}
selected=sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else list(builders)
for name in selected:export_review(name,builders[name])
