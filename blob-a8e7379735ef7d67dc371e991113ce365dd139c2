"""Continuous laboratory shell + coved clean-bench chamber.

Run from this repository with the explicitly authorised D:/blender.exe.
The existing room polygon, window aperture and equipment footprint are retained.
Only project-local models, editable masters and inspection renders are written.
"""
import bpy, bmesh, math, json, sys, importlib.util
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location("review_helpers", Path(__file__).with_name("build_review_assets.py"))
H = importlib.util.module_from_spec(spec)
spec.loader.exec_module(H)
OUT = ROOT / "public/assets/models"
MASTERS = ROOT / "outputs/blender"

def color(hexcode):
    s=[int(hexcode[i:i+2],16)/255 for i in (1,3,5)]
    return tuple(v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in s)

def material(name, hexcode, rough=.7, metal=0):
    return H.mat(name,color(hexcode),rough,metal)

def rounded_path(points, radius=.20):
    """Rounded centerline has no overlaps or duplicated corner slabs."""
    raw=[Vector(p) for p in points]; out=[raw[0]]
    for i in range(1,len(raw)-1):
        a,b,c=raw[i-1:i+2]
        cut=min(radius,(b-a).length*.25,(c-b).length*.25)
        p=b+(a-b).normalized()*cut; q=b+(c-b).normalized()*cut
        last=out[-1]
        for j in range(1,max(2,int((p-last).length/.16))+1):
            count=max(2,int((p-last).length/.16));out.append(last.lerp(p,j/count))
        for j in range(1,13):
            t=j/12;out.append((1-t)**2*p+2*t*(1-t)*b+t*t*q)
    last=out[-1];count=max(2,int((raw[-1]-last).length/.16))
    out += [last.lerp(raw[-1],j/count) for j in range(1,count+1)]
    return out

def height(p):
    # Cutaway occurs along the front wings, away from their real corner joints.
    t=max(0,min(1,(p[1]-.78)/2.45));t=t*t*(3-2*t)
    return 3.1+(0.72-3.1)*t

def sweep(name,path,thickness,bottom,top,mat,lateral=0,bevel=.012):
    verts=[];faces=[]
    for i,p in enumerate(path):
        tangent=(path[min(i+1,len(path)-1)]-path[max(i-1,0)]).normalized()
        inward=Vector((-tangent[1],tangent[0]));c=p+inward*lateral
        for offset,y in [(-thickness/2,bottom(p)),(thickness/2,bottom(p)),(thickness/2,top(p)),(-thickness/2,top(p))]:
            q=c+inward*offset;verts.append((q[0],y,q[1]))
    for i in range(len(path)-1):
        for k in range(4):faces.append((4*i+k,4*i+(k+1)%4,4*(i+1)+(k+1)%4,4*(i+1)+k))
    faces += [(3,2,1,0),tuple(4*(len(path)-1)+k for k in range(4))]
    o=H.mesh(name,verts,faces,mat)
    bm=bmesh.new();bm.from_mesh(o.data);bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces));bm.to_mesh(o.data);bm.free()
    if bevel:
        mod=o.modifiers.new("continuous soft edge","BEVEL");mod.width=bevel;mod.segments=3
        mod=o.modifiers.new("weighted architectural normals","WEIGHTED_NORMAL");mod.keep_sharp=True
    return o

def architecture():
    wall=material("continuous warm plaster","#DCD0BC",.86)
    cap=material("continuous limestone cap","#EAE1CE",.75)
    trim=material("continuous inset skirting","#B8B4A2",.78)
    path=rounded_path([(-2.49,4.45),(-4.85,4.45),(-5.65,.5),(-3.8,-4.6),(3.8,-4.6),(5.65,.5),(4.85,4.45)])
    shell=sweep("one-piece room shell",path,.18,lambda p:0,height,wall,bevel=0)
    # The existing left-window opening is cut from the manifold shell.
    a=Vector((-3.8,-4.6));b=Vector((-5.65,.5));mid=(a+b)/2
    normal=Vector((-(b-a)[1],(b-a)[0])).normalized()
    if normal.dot(-mid)<0:normal=-normal
    yaw=math.atan2(normal[0],normal[1])
    center=(mid[0]+math.cos(yaw)*-.35,1.86,mid[1]-math.sin(yaw)*-.35)
    cutter=H.box("temporary window cutter",center,(2.45,1.28,.8),None,0)
    cutter.rotation_euler.z=-yaw
    boolean=shell.modifiers.new("open window through shell","BOOLEAN");boolean.operation="DIFFERENCE";boolean.solver="EXACT";boolean.object=cutter
    bpy.context.view_layer.objects.active=shell
    bpy.ops.object.modifier_apply(modifier=boolean.name)
    bpy.data.objects.remove(cutter,do_unlink=True)
    bevel=shell.modifiers.new("rounded reveals and corners","BEVEL");bevel.width=.015;bevel.segments=3
    normalmod=shell.modifiers.new("smooth plaster normals","WEIGHTED_NORMAL");normalmod.keep_sharp=True
    sweep("unbroken wall coping",path,.21,lambda p:height(p)-.002,lambda p:height(p)+.045,cap,bevel=.009)
    sweep("unbroken floor trim",path,.031,lambda p:.015,lambda p:.153,trim,lateral=.104,bevel=.006)
    return (0,1.0,-.2),13.5

def hood():
    H.clean_bench()
    # Replace separate chamber liner plates with a manufactured coved tray.
    for o in list(bpy.context.scene.objects):
        if o.name.startswith(("side liner","steel work surface","chamber back liner","worktop rear upstand","sealed worktop corner")):
            bpy.data.objects.remove(o,do_unlink=True)
    steel=bpy.data.materials.get("brushed stainless steel")
    cream=bpy.data.materials.get("ivory powder coat")
    dark=bpy.data.materials.get("graphite controls")
    # Back and both sides share an uninterrupted drawn tray. Boolean union removes
    # internal coplanar faces before the cove bevel is formed.
    parts=[H.box("chamber tray base",(0,.735,-.005),(.805,.027,.615),steel,0),
           H.box("chamber tray back",(0,.940,-.299),(.805,.435,.027),steel,0),
           H.box("chamber tray left",(-.396,.940,-.005),(.027,.435,.615),steel,0),
           H.box("chamber tray right",(.396,.940,-.005),(.027,.435,.615),steel,0)]
    tray=parts[0]
    for other in parts[1:]:
        union=tray.modifiers.new("fused chamber junction","BOOLEAN");union.operation="UNION";union.solver="EXACT";union.object=other
        bpy.context.view_layer.objects.active=tray;bpy.ops.object.modifier_apply(modifier=union.name)
        bpy.data.objects.remove(other,do_unlink=True)
    tray.name="single sealed stainless chamber"
    bevel=tray.modifiers.new("cleanable radiused chamber edges","BEVEL");bevel.width=.012;bevel.segments=5
    norm=tray.modifiers.new("weighted steel normals","WEIGHTED_NORMAL");norm.keep_sharp=True
    H.box("continuous lower enclosure fascia",(0,.637,.012),(.873,.16,.636),cream,.017)
    H.box("front worktop nose",(0,.715,.319),(.835,.05,.07),cream,.009)
    for x in [-.375,.375]:
        H.box("leg to cabinet joint",(x,.588,.0),(.055,.085,.60),cream,.009)
        H.box("enclosed lower side return",(x,.674,.0),(.052,.105,.59),cream,.008)
    H.line("rear diagonal structural brace",[(-.37,.22,-.27),(.37,.55,-.27)],.016,cream,True)
    H.line("rear complementary brace",[(.37,.22,-.27),(-.37,.55,-.27)],.016,cream,True)
    # Visible power/service fitting: the hose has a socket at both ends.
    H.box("service socket",(.377,.842,-.16),(.028,.066,.066),dark,.008)
    H.box("rear service inlet",(.31,.77,-.35),(.08,.10,.03),dark,.008)
    return (0,.76,0),2.15

def export(name, builder):
    H.reset();target,span=builder()
    parts=list(bpy.context.scene.objects)
    validation=[]
    for o in parts:
        if o.type not in {"MESH","CURVE"}:continue
        bpy.ops.object.select_all(action="DESELECT");o.select_set(True);bpy.context.view_layer.objects.active=o
        # Store modifiers in the master until GLB export evaluates them.
        o["semantic_part"]=o.name
        if o.type=="MESH":
            evaluated=o.evaluated_get(bpy.context.evaluated_depsgraph_get())
            bm=bmesh.new();bm.from_mesh(evaluated.to_mesh())
            validation.append({"part":o.name,"nonmanifold_edges":sum(not edge.is_manifold for edge in bm.edges)})
            bm.free();evaluated.to_mesh_clear()
    if name=="laboratory-shell":
        assert all(row["nonmanifold_edges"]==0 for row in validation), validation
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.export_scene.gltf(filepath=str(OUT/(name+".glb")),export_format="GLB",use_selection=True,export_yup=True,export_extras=True,export_apply=True)
    scene=bpy.context.scene;scene.render.engine="CYCLES";scene.cycles.samples=24;scene.cycles.use_denoising=True
    scene.render.resolution_x=1200;scene.render.resolution_y=1000;scene.render.resolution_percentage=100
    scene.world.use_nodes=True;scene.world.node_tree.nodes["Background"].inputs["Color"].default_value=(.78,.8,.76,1)
    scene.world.node_tree.nodes["Background"].inputs["Strength"].default_value=.7
    scene.view_settings.view_transform="AgX"
    floor=material("STUDIO floor","#EEE8D9",.84)
    H.box("STUDIO floor",(0,-.065,0),(span*5,.08,span*5),floor,0)
    for label,p,power,size in [("key",(-span*.6,span,span*.8),span*span*8,span*.9),("fill",(span,span*.7,span*.8),span*span*4,span),("rim",(0,span,-span*.8),span*span*5,span*.6)]:
        bpy.ops.object.light_add(type="AREA",location=H.xyz(p));o=bpy.context.object;o.name="STUDIO "+label;o.data.energy=power;o.data.shape="DISK";o.data.size=size
        o.rotation_euler=(Vector(H.xyz(target))-o.location).to_track_quat("-Z","Y").to_euler()
    bpy.ops.object.camera_add();camera=bpy.context.object;scene.camera=camera;camera.data.type="ORTHO"
    if name=="laboratory-shell":
        views=[("overview",(0,1,-.2),(7,11,17),14),
               ("front-corner",(-4.55,.78,3.6),(-7,4.9,8),4.5),
               ("rear-corner",(-3.65,2,-4.4),(-.1,4.8,.6),3.1)]
    else:
        views=[("front",target,(0,1.25,4),2.0),("three-quarter",target,(1.6,1.65,3.4),2.0),
               ("chamber-junction",(0,.84,.04),(.66,1.0,2.6),.96)]
    rendered=[]
    for label,focus,eye,scale in views:
        camera.location=H.xyz(eye);camera.data.ortho_scale=scale
        camera.rotation_euler=(Vector(H.xyz(focus))-camera.location).to_track_quat("-Z","Y").to_euler()
        scene.render.filepath=str(MASTERS/(name+"-"+label+".png"));bpy.ops.render.render(write_still=True);rendered.append(Path(scene.render.filepath).relative_to(ROOT).as_posix())
    bpy.ops.wm.save_as_mainfile(filepath=str(MASTERS/(name+".blend")))
    (MASTERS/(name+".json")).write_text(json.dumps({"name":name,"parts":[o.name for o in parts],"validation":validation,"views":rendered},indent=2),encoding="utf-8")
    print("LAB_ASSET_COMPLETE",name,flush=True)

if __name__=="__main__":
    names=sys.argv[sys.argv.index("--")+1:] if "--" in sys.argv else ["laboratory-shell","clean-bench"]
    for name in names:export(name,architecture if name=="laboratory-shell" else hood)
