"""Open colonic wall with crypt lumens built into, rather than over, its inner surface."""
from build_review_assets import *

def colon_refined():
    outer=mat('longitudinal muscle',(.66,.30,.29),.55)
    circ=mat('circular muscle',(.79,.42,.37),.55)
    sub=mat('submucosa',(.92,.68,.52),.58)
    muc=mat('colonic mucosa',(.87,.53,.47),.52)
    mucus=mat('mucus surface',(.70,.82,.74),.3)
    goblet=mat('goblet cells',(.92,.81,.65),.5)
    recess=mat('crypt base',(.66,.36,.34),.72)

    def surface(x,a,r):
        fold=.035*math.sin(x*7.3)*math.sin(a)**2
        return (x,-(r+fold)*math.sin(a),(r+fold)*math.cos(a))

    for name,rad,thick,m in [('outer muscle',1.07,.10,outer),('circular muscle',.97,.10,circ),('submucosa',.87,.14,sub),('mucosa',.73,.10,muc)]:
        verts=[];faces=[];n=64;length=48
        for j in range(length+1):
            for r in [rad,rad-thick]:
                for k in range(n+1):verts.append(surface(-2.4+4.8*j/length,PI*.08+PI*.84*k/n,r))
        stride=2*(n+1)
        for j in range(length):
            for k in range(n):
                v=j*stride+k
                faces.append((v,v+stride,v+stride+1,v+1))
                # The inner mucosal surface is tiled with open crypt cups below.
                if name!='mucosa':faces.append((v+n+1,v+n+2,v+stride+n+2,v+stride+n+1))
            for k in [0,n]:
                v=j*stride+k;faces.append((v,v+n+1,v+stride+n+1,v+stride))
        for off in [0,length*stride]:
            for k in range(n):faces.append((off+k,off+k+1,off+k+n+2,off+k+n+1))
        mesh(name,verts,faces,m,True)

    nx=16;na=6;da=PI*.84/na
    for i in range(nx):
        for j in range(na):
            xc=-2.4+(i+.5)*4.8/nx;ac=PI*.08+(j+.5)*da
            verts=[];faces=[];n=24
            for row in range(4):
                for k in range(n):
                    a=k*2*PI/n;c=math.cos(a);s=math.sin(a)
                    if row==0:
                        q=max(abs(c),abs(s));dx=.15*c/q;angle=ac+da*.5*s/q;r=.63
                    else:
                        radius=[0,.071,.046,.019][row]
                        dx=radius*c;angle=ac+radius/.63*s;r=[0,.63,.675,.704][row]
                    verts.append(surface(xc+dx,angle,r))
            for row in range(3):
                for k in range(n):
                    a=row*n+k;b=row*n+(k+1)%n;faces.append((a,b,b+n,a+n))
            mesh('crypt epithelial lining',verts,faces,muc,True)
            mesh('recessed crypt base',verts,[tuple(3*n+k for k in range(n))],recess,True)
            for k in range(8):
                a=k*2*PI/8
                p=surface(xc+.091*math.cos(a),ac+.091/.63*math.sin(a),.622)
                uv('goblet cell' if (i+j+k)%13==0 else 'colonocyte rim',p,(.028,.019,.026),goblet if (i+j+k)%13==0 else muc,segments=12,rings=8)
    for j in [.30,PI/2,PI-.30]:
        line('mucus film contour',[surface(-2.30+i*.10,j,.616) for i in range(47)],.009,mucus)
    return (0,-.27,0),5.9
