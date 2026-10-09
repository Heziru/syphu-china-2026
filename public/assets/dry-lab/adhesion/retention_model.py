"""Uncalibrated post-release EcN retention in a chip-scale mucosal flow assay.

Units: micrometres, seconds; state = fraction of the initial viable-cell pulse.
No proliferation, chemotaxis, engineered adhesin, secretion or therapeutic endpoint.
Run: python retention_model.py --output-dir public/assets/dry-lab/adhesion
Requires numpy, scipy, matplotlib. No network access or input-data fabrication.
"""
from pathlib import Path
import argparse
import csv
import json
import shutil
import time
import numpy as np
from scipy import sparse
from scipy.sparse.linalg import splu, spsolve, expm_multiply
from scipy.special import ndtr
from scipy.stats import qmc, rankdata
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.colors import LinearSegmentedColormap, LogNorm

BASE = dict(L=1800., H=180., U=90., D=100., kappa=1., koff=.005,
            shedding=.002, loss=0.)
SCENARIOS = [
    ('no-binding', 'No wall binding', dict(kappa=0.)),
    ('reversible', 'Reversible binding', {}),
    ('no-renewal', 'No mucus renewal', dict(shedding=0.)),
    ('stress', 'Stress / no support', dict(loss=.004)),
    ('support', 'Stress / support', dict(loss=.001)),
]
COLORS = ['#7b8790', '#286459', '#b98b4d', '#ba7069', '#536db2']
CMAP = LinearSegmentedColormap.from_list('mucosal', ['#f8f6ed','#c6d6ba','#6b9b85','#184e43'])


def operator(nx=96, ny=24, **changes):
    """Conservative cell-mass generator; bottom wall includes half-cell resistance.

    Upwind streamwise advection is first order; diffusion uses centred FV fluxes.
    Inlet total flux zero after the initial pulse. Outlet diffusive flux zero;
    advective outflow enters an absorbing ledger. Top wall is impermeable.
    """
    p = BASE | changes
    dx, dy = p['L']/nx, p['H']/ny
    n = nx*ny
    size = n + nx + 3
    outlet, shed, dead = n+nx, n+nx+1, n+nx+2
    rows, cols, vals = [], [], []
    def transfer(src, dst, rate):
        src, dst, rate = np.broadcast_arrays(src, dst, rate)
        rows.extend(dst.ravel()); cols.extend(src.ravel()); vals.extend(rate.ravel())
        rows.extend(src.ravel()); cols.extend(src.ravel()); vals.extend(-rate.ravel())
    grid = np.arange(n).reshape(ny, nx)
    y = (np.arange(ny)+.5)*dy
    u = 6*p['U']*(y/p['H'])*(1-y/p['H'])
    transfer(grid[:,:-1], grid[:,1:], p['D']/dx**2 + u[:,None]/dx)
    transfer(grid[:,1:], grid[:,:-1], p['D']/dx**2)
    transfer(grid[:,-1], outlet, u/dx)
    transfer(grid[:-1,:], grid[1:,:], p['D']/dy**2)
    transfer(grid[1:,:], grid[:-1,:], p['D']/dy**2)
    resistance = 1+p['kappa']*dy/(2*p['D'])
    transfer(grid[0,:], n+np.arange(nx), p['kappa']/dy/resistance)
    transfer(n+np.arange(nx), grid[0,:], p['koff']/resistance)
    transfer(n+np.arange(nx), shed, p['shedding'])
    transfer(np.arange(n+nx), dead, p['loss'])
    q = sparse.coo_matrix((vals,(rows,cols)),shape=(size,size)).tocsc()
    # Integrate the initial Gaussian over cells instead of sampling its centre.
    edges = np.linspace(0,p['L'],nx+1)
    column_mass = np.diff(ndtr((edges-.1*p['L'])/(.035*p['L'])))
    column_mass /= column_mass.sum()
    m0 = np.zeros(size)
    m0[:n] = np.tile(column_mass/ny, ny)
    assert np.max(np.abs(np.asarray(q.sum(axis=0)))) < 2e-12
    off = q-sparse.diags(q.diagonal())
    assert off.data.min(initial=0) >= 0
    return q,m0,p,n


def simulate(nx=96,ny=24,dt=.2,end=600,frame_step=5,**p):
    q,m,params,n=operator(nx,ny,**p)
    step=splu(sparse.eye(q.shape[0],format='csc')-dt*q)
    count=int(round(end/dt)); every=int(round(frame_step/dt))
    assert abs(count*dt-end)<1e-10 and abs(every*dt-frame_step)<1e-10
    states=[m.copy()]
    for i in range(count):
        m=step.solve(m)
        if (i+1)%every==0: states.append(m.copy())
    a=np.array(states)
    return np.arange(len(a))*frame_step,a,params,n


def integrals(nx=96,ny=24,**p):
    q,m,params,n=operator(nx,ny,**p)
    live=n+nx
    occupation=spsolve(-q[:live,:live],m[:live])
    fate=np.asarray(q[live:,:live]@occupation).ravel()
    return dict(mean_live_s=float(occupation.sum()),
                wall_live_s=float(occupation[n:].sum()),
                outlet_fraction=float(fate[0]),shed_fraction=float(fate[1]),
                dead_fraction=float(fate[2]),closure=float(abs(fate.sum()-1)))


def ledger(a,n,nx):
    return np.column_stack((a[:,:n].sum(axis=1),a[:,n:n+nx].sum(axis=1),a[:,n+nx:]))


def write_csv(path, rows):
    with path.open('w',newline='',encoding='utf-8') as f:
        writer=csv.DictWriter(f,fieldnames=list(rows[0]));writer.writeheader();writer.writerows(rows)


def plotstyle():
    plt.rcParams.update({'font.family':'DejaVu Sans','font.size':10,'axes.titlesize':11,
        'axes.titleweight':'bold','axes.labelsize':10,'axes.spines.top':False,
        'axes.spines.right':False,'axes.edgecolor':'#92a69e','axes.labelcolor':'#234b42',
        'text.color':'#234b42','xtick.color':'#526d64','ytick.color':'#526d64',
        'figure.facecolor':'#ffffff','axes.facecolor':'#ffffff','savefig.facecolor':'#ffffff',
        'pdf.fonttype':42,'svg.fonttype':'none'})


def savefig(fig,out,name):
    for ext in ['png','svg','pdf']: fig.savefig(out/(name+'.'+ext),dpi=180,bbox_inches='tight')
    plt.close(fig)


def web_previews(out):
    """Small exact display subset; the full-precision CSV is unaffected."""
    from PIL import Image
    payload=json.loads((out/'retention-animation.json').read_text(encoding='utf-8'))
    frame=payload['time_s'].index(10)
    case=payload['scenarios'][1]
    preview={k:payload[k] for k in ['nx','ny','L_um','H_um']}
    preview.update(time_s=10,label=case['label'],density=case['density'][frame],
                   wall=case['wall'][frame],ledger=case['ledger'][frame])
    (out/'retention-preview.json').write_text(json.dumps(preview,separators=(',',':')),encoding='utf-8')
    dimensions={}
    for path in sorted(out.glob('*-retention-*.png')):
        with Image.open(path) as img:
            dimensions[path.stem]=dict(width=img.width,height=img.height)
    (out/'figure-dimensions.json').write_text(json.dumps(dimensions,indent=2),encoding='utf-8')


def physical_scales(p):
    # Waterlike fluid: rho=1000 kg/m3 and mu=0.001 Pa s; convert um to m.
    transit=p['L']/p['U']
    return dict(Re=1000*(p['U']*1e-6)*(p['H']*1e-6)/.001,
        wallShear_Pa=6*.001*p['U']/p['H'],meanTransit_s=transit,
        PeAxial=p['U']*p['L']/p['D'],transverseMixingToTransit=p['H']**2/p['D']/transit,
        DaCapture=p['kappa']*p['H']/p['D'],KoffTransit=p['koff']*transit,
        renewalTransit=p['shedding']*transit)


def main(out):
    started=time.time();out.mkdir(parents=True,exist_ok=True);plotstyle()
    nx,ny=96,24
    data={};curves=[];checks={};animation=[];summaries=[]
    for key,label,changes in SCENARIOS:
        t,a,p,n=simulate(nx,ny,**changes); led=ledger(a,n,nx)
        integ=integrals(nx,ny,**changes)
        data[key]=(t,a,led)
        summaries.append(dict(id=key,label=label,parameters=p,**integ,
            retained_60s=float(led[12,:2].sum()),retained_300s=float(led[60,:2].sum()),
            wall_300s=float(led[60,1]),retained_600s=float(led[-1,:2].sum()),
            mass_error=float(np.max(np.abs(led.sum(axis=1)-1))),minimum_mass=float(a.min())))
        for j,tt in enumerate(t):
            curves.append(dict(scenario=key,t_s=float(tt),free=led[j,0],bound=led[j,1],
                outlet=led[j,2],shed=led[j,3],nonviable=led[j,4]))
        # Dimensionless density c/(initial total / domain volume) is not re-scaled per frame.
        fields=(a[:,:n].reshape(len(t),ny,nx)*n).round(6)
        wall=(a[:,n:n+nx]*nx).round(6)  # b/(initial total / L)
        animation.append(dict(id=key,label=label,parameters=p,
            density=fields.reshape(len(t),-1).tolist(),wall=wall.tolist(),ledger=led.round(9).tolist()))
        print(key,integ,flush=True)
    write_csv(out/'retention-curves.csv',curves)
    payload=dict(schemaVersion=1,nx=nx,ny=ny,L_um=BASE['L'],H_um=BASE['H'],
        time_s=t.tolist(),densityScale=12,wallScale=.2,scenarios=animation,
        method='Conservative finite volumes, backward Euler; fixed colour scales across frames and cases.',
        status='Uncalibrated non-growing chip-scale pulse scenarios; not observed cell tracks.')
    (out/'retention-animation.json').write_text(json.dumps(payload,separators=(',',':')),encoding='utf-8')

    fig,ax=plt.subplots(2,2,figsize=(12,8.3),layout='constrained')
    a=data['reversible'][1]
    im=ax[0,0].imshow(np.maximum(a[3,:n].reshape(ny,nx)*n,1e-4),origin='lower',aspect='auto',extent=[0,1.8,0,180],
        cmap=CMAP,norm=LogNorm(vmin=.001,vmax=12))
    ax[0,0].set(xlabel='Axial position x (mm)',ylabel='Distance from mucus (µm)',title='A   Free-cell pulse at 15 s')
    fig.colorbar(im,ax=ax[0,0],label='c / (M₀ / LH) · logarithmic colour',shrink=.85)
    for key,label,_ in SCENARIOS:
        tt,aa,ll=data[key];color=COLORS[[x[0] for x in SCENARIOS].index(key)]
        ax[0,1].plot(tt,ll[:,:2].sum(axis=1),label=label,color=color)
        ax[1,0].plot(tt,ll[:,1],label=label,color=color)
    ax[0,1].set(xlabel='Time (s)',ylabel='Viable fraction still in domain',title='B   A minority produces a long retention tail',yscale='log',ylim=(1e-4,1),xlim=(0,600))
    ax[0,1].legend(frameon=False,fontsize=8)
    ax[1,0].set(xlabel='Time (s)',ylabel='Wall-bound fraction of initial pulse',title='C   Reversible capture and a long release tail',xlim=(0,600),ylim=(0,None))
    ll=data['support'][2]
    ax[1,1].stackplot(t,ll.T,labels=['Free','Bound','Outlet','Shed','Nonviable'],colors=['#b8d8ca','#376e5e','#d8ddd8','#e4cc9a','#c8897d'])
    ax[1,1].set(xlabel='Time (s)',ylabel='Accounted fraction of initial pulse',title='D   Complete fate ledger · support scenario',ylim=(0,1),xlim=(0,600))
    ax[1,1].legend(frameon=False,fontsize=8,loc='lower right')
    savefig(fig,out,'11-retention-dynamics')

    # Infinite-time cumulative exposure and exit probabilities from a linear solve.
    # This is the absorbing Markov generator's fundamental matrix action, not time truncation.
    maps=[];kappas=np.geomspace(.02,5,22);speeds=np.geomspace(20,300,22);offs=np.geomspace(.0005,.05,22)
    flow=np.zeros((22,22));unbind=np.zeros((22,22))
    for j,kap in enumerate(kappas):
        for i,u in enumerate(speeds):
            v=integrals(kappa=kap,U=u);flow[j,i]=v['wall_live_s'];maps.append(dict(map='flow',kappa_um_s=kap,variable=u,wall_live_s=v['wall_live_s'],outlet_fraction=v['outlet_fraction']))
        for i,off in enumerate(offs):
            v=integrals(kappa=kap,koff=off);unbind[j,i]=v['wall_live_s'];maps.append(dict(map='off-rate',kappa_um_s=kap,variable=off,wall_live_s=v['wall_live_s'],outlet_fraction=v['outlet_fraction']))
    write_csv(out/'retention-parameter-planes.csv',maps)
    fig,axs=plt.subplots(1,2,figsize=(12,4.5),layout='constrained')
    vmax=max(flow.max(),unbind.max())
    for axis,x,z,title,xlabel in zip(axs,[speeds,offs],[flow,unbind],['A   Transport versus encounter','B   Capture versus release'],['Mean speed U (µm s⁻¹)','Dissociation rate k_off (s⁻¹)']):
        im=axis.pcolormesh(x,kappas,z,shading='nearest',cmap=CMAP,vmin=0,vmax=vmax)
        axis.set(xscale='log',yscale='log',xlabel=xlabel,ylabel='Capture velocity κ (µm s⁻¹)',title=title)
        axis.plot(BASE['U'] if axis is axs[0] else BASE['koff'],BASE['kappa'],'+',ms=12,mew=2,color='#bd6c57')
    fig.colorbar(im,ax=axs,label='Cumulative viable wall residence (s per initial cell)',shrink=.85)
    savefig(fig,out,'12-retention-landscapes')
    print('parameter planes finished',flush=True)

    # Deliberately wide independent *scenario* ranges, log-uniform except support.
    names=['U','D','kappa','koff','shedding','loss'];ranges=np.array([[20,300],[10,330],[.02,5],[.0005,.05],[.0002,.01],[.0002,.01]])
    sample=qmc.LatinHypercube(d=6,seed=20261009).random(256)
    pars=np.exp(np.log(ranges[:,0])+sample*np.log(ranges[:,1]/ranges[:,0]));responses=[];ensemble=[]
    for i,row in enumerate(pars):
        v=integrals(**dict(zip(names,row)));responses.append(v['wall_live_s']);ensemble.append(dict(sample=i,**dict(zip(names,row)),**v))
    write_csv(out/'retention-ensemble.csv',ensemble)
    ranks=np.column_stack([rankdata(pars[:,j]) for j in range(6)]);target=rankdata(responses)
    def prcc(ix):
        result=[]
        for k in range(6):
            z=np.column_stack((np.ones(len(ix)),ranks[ix][:,np.arange(6)!=k]))
            xx=ranks[ix,k]-z@np.linalg.lstsq(z,ranks[ix,k],rcond=None)[0]
            yy=target[ix]-z@np.linalg.lstsq(z,target[ix],rcond=None)[0]
            result.append(np.corrcoef(xx,yy)[0,1])
        return result
    estimates=prcc(np.arange(256));rng=np.random.default_rng(337)
    boots=np.array([prcc(rng.integers(0,256,256)) for _ in range(256)])
    ci=np.quantile(boots,[.025,.975],axis=0);prccrows=[dict(parameter=k,prcc=estimates[i],low=ci[0,i],high=ci[1,i],min=ranges[i,0],max=ranges[i,1]) for i,k in enumerate(names)]
    write_csv(out/'retention-sensitivity.csv',prccrows)
    fig,axs=plt.subplots(1,2,figsize=(12,4.5),layout='constrained')
    axs[0].barh(names,estimates,color=['#769b89' if x>0 else '#cf9e8f' for x in estimates])
    axs[0].errorbar(estimates,names,xerr=[np.array(estimates)-ci[0],ci[1]-np.array(estimates)],fmt='none',ecolor='#234b42',capsize=3)
    axs[0].axvline(0,color='#a8b4ad',lw=.8);axs[0].set(xlim=(-1,1),xlabel='Partial rank correlation (256 scenarios)',title='A   Which uncertain rates change wall residence?')
    sc=axs[1].scatter(pars[:,2],responses,c=np.log10(pars[:,1]),cmap=CMAP,s=20,alpha=.8)
    axs[1].set(xscale='log',yscale='log',xlabel='Capture velocity κ (µm s⁻¹)',ylabel='Cumulative viable wall residence (s)',title='B   Capture alone does not determine retention')
    fig.colorbar(sc,ax=axs[1],label='log₁₀ D (µm² s⁻¹)',shrink=.85)
    savefig(fig,out,'13-retention-sensitivity')

    # Spatial refinement for biologically interpretable integral outputs.
    space=[]
    for nn,mm in [(24,6),(48,12),(96,24),(192,48),(384,96)]:
        v=integrals(nn,mm);space.append(dict(nx=nn,ny=mm,**v))
    for row in space:
        row['wall_relative_to_finest']=abs(row['wall_live_s']/space[-1]['wall_live_s']-1)
        row['mean_relative_to_finest']=abs(row['mean_live_s']/space[-1]['mean_live_s']-1)
    write_csv(out/'retention-space-convergence.csv',space)
    audit=[]
    # Spread across the LHS and inspect a deliberately difficult transport corner.
    audit_parameters=[dict(zip(names,pars[i])) for i in np.linspace(0,255,16,dtype=int)]
    audit_parameters += [dict(D=10,U=300,kappa=5),dict(D=10,U=20,kappa=5),dict(D=330,U=300,kappa=.02)]
    for i,p_audit in enumerate(audit_parameters):
        coarse=integrals(96,24,**p_audit);fine=integrals(192,48,**p_audit)
        audit.append(dict(case=i,**(BASE|p_audit),coarse_wall_s=coarse['wall_live_s'],fine_wall_s=fine['wall_live_s'],
            wall_relative_error=abs(coarse['wall_live_s']/fine['wall_live_s']-1)))
    write_csv(out/'retention-grid-audit.csv',audit)
    # Exact action of the *same* semidiscrete generator provides temporal reference.
    q,m,p,nn=operator(48,12)
    reference=expm_multiply(q*40,m)
    temporal=[]
    for dt in [.8,.4,.2,.1,.05]:
        _,ss,_,_=simulate(48,12,dt=dt,end=40,frame_step=40)
        err=float(np.sum(abs(ss[-1]-reference)))
        temporal.append(dict(dt_s=dt,l1_mass_error=err,min_state=float(ss[-1].min())))
    for i,row in enumerate(temporal):
        row['observed_order']=np.log2(temporal[i-1]['l1_mass_error']/row['l1_mass_error']) if i else ''
    write_csv(out/'retention-time-convergence.csv',temporal)
    # With transport/attachment disabled, a prebound cohort has a closed-form fate.
    q,m,p,nn=operator(24,6,U=0,kappa=0,koff=.005,shedding=.002,loss=.004)
    m[:]=0;m[nn:nn+24]=1/24
    exact=expm_multiply(q*100,m)
    bound_analytic=np.exp(-(.005+.002+.004)*100)
    bound_error=float(abs(exact[nn:nn+24].sum()-bound_analytic))
    # Uniform death must multiply all surviving states by exp(-loss*t).
    t0,a0,_,nn=simulate(48,12,dt=.1,end=40,frame_step=40)
    qa,ma,_,_=operator(48,12,loss=.004)
    qa0,ma0,_,_=operator(48,12)
    ea=expm_multiply(qa*40,ma);eb=expm_multiply(qa0*40,ma0)
    death_identity=float(np.max(abs(ea[:nn+48]-eb[:nn+48]*np.exp(-.004*40))))
    checks=dict(massClosureMax=max(s['mass_error'] for s in summaries),
        infiniteHorizonClosureMax=max(x['closure'] for x in ensemble),
        minimumState=min(s['minimum_mass'] for s in summaries),
        preboundAnalyticError=bound_error,uniformLossIdentityError=death_identity,
        noBindingWallMax=float(data['no-binding'][2][:,1].max()),
        spatialBaseWallRelativeError=space[2]['wall_relative_to_finest'],
        parameterAuditMaxWallRelativeError=max(x['wall_relative_error'] for x in audit),
        timeBaseError=temporal[2]['l1_mass_error'],
        timeFinestOrder=temporal[-1]['observed_order'])
    assert checks['massClosureMax']<1e-10 and checks['infiniteHorizonClosureMax']<1e-10
    assert checks['minimumState']>=-1e-14 and bound_error<1e-11 and death_identity<1e-11
    assert checks['noBindingWallMax']==0 and .85<checks['timeFinestOrder']<1.15
    fig,axs=plt.subplots(2,2,figsize=(12,8),layout='constrained')
    for key,label,_ in SCENARIOS:
        tt,aa,ll=data[key];axs[0,0].plot(tt,np.abs(ll.sum(axis=1)-1)+1e-16,label=label)
    axs[0,0].set(yscale='log',xlabel='Time (s)',ylabel='|sum of fate fractions − 1|',title='A   Conservation without renormalising states')
    axs[0,0].legend(fontsize=7,frameon=False)
    axs[0,1].loglog([x['dt_s'] for x in temporal],[x['l1_mass_error'] for x in temporal],'o-',color=COLORS[1])
    axs[0,1].set(xlabel='Backward-Euler time step (s)',ylabel='L¹ mass error at 40 s',title='B   Time convergence to matrix-exponential solution')
    axs[1,0].plot([x['nx'] for x in space],[x['wall_live_s'] for x in space],'o-',color=COLORS[1])
    axs[1,0].set(xlabel='Axial grid cells (ny = nx / 4)',ylabel='Cumulative viable wall residence (s)',title='C   Grid refinement of the retention readout')
    tt=np.linspace(0,300,100)
    axs[1,1].plot(tt,np.exp(-.011*tt),color=COLORS[1],label='Closed-form prebound cohort')
    times=np.linspace(0,300,13);xa=expm_multiply(q,m,start=0,stop=300,num=13)
    axs[1,1].plot(times,xa[:,144:168].sum(axis=1),'o',mfc='none',color=COLORS[3],label='Finite-volume generator')
    axs[1,1].set(xlabel='Time (s)',ylabel='Wall-bound fraction',title='D   Independent desorption / loss benchmark')
    axs[1,1].legend(frameon=False,fontsize=8)
    savefig(fig,out,'14-retention-verification')
    summary=dict(schemaVersion=1,generatedDate='2026-10-09',status='All adhesion, death and renewal rates are uncalibrated scenarios.',
        referenceParameters=BASE,grid=dict(nx=nx,ny=ny,dt_s=.2,end_s=600),
        physicalScales=physical_scales(BASE),
        scenarios=summaries,sensitivity=prccrows,verification=checks,spaceConvergence=space,
        timeConvergence=temporal,ensembleSize=256,planeRuns=968,parameterGrid=dict(nx=96,ny=24),
        analysisSeconds=time.time()-started)
    (out/'retention-summary.json').write_text(json.dumps(summary,indent=2),encoding='utf-8')
    web_previews(out)
    shutil.copy2(__file__,out/'retention_model.py')
    print(json.dumps(checks,indent=2),flush=True)
    print('COMPLETE',round(time.time()-started,1),'seconds',flush=True)


if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output-dir',type=Path,default=Path('public/assets/dry-lab/adhesion'))
    args=parser.parse_args();main(args.output_dir)
