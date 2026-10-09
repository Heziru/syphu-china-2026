"""Seeded post-release transport in a strip, displayed as a curved assay channel.

This is NOT curved-organ CFD: the SDE is solved in arclength/transverse strip
coordinates. Both walls bind reversibly; unlike retention_model.py the downstream
end absorbs diffusion as well as advection. Parameters are uncalibrated scenarios.
Run: python particle_transport.py --output-dir public/assets/dry-lab/adhesion
Requires existing numpy, scipy, matplotlib and Pillow; no network or MD rerun.
"""
from pathlib import Path
import argparse
import csv
import hashlib
import json
import shutil
import time
from functools import lru_cache
import numpy as np
from scipy.interpolate import CubicSpline
from scipy.stats import t as student_t
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Polygon
from matplotlib.lines import Line2D
from matplotlib.path import Path as PolygonPath
from PIL import Image

BASE = dict(L_um=1800., H_um=180., U_um_s=90., D_um2_s=100.,
            kappa_um_s=1., koff_s=.005, ks_s=.002)
SEED = 202610093
NAMES = ['Free', 'Attached', 'Exited', 'Shed']
COLORS = ['#3478a8', '#c34b4f', '#8563ae', '#89928c']
KEYS = ['free', 'attached', 'exited', 'shed']
SOURCE_URL = 'https://doi.org/10.1088/1478-3975/4/1/003'


@lru_cache(maxsize=1)
def colon_curve():
    """Chosen schematic silhouette, not a segmented medical image or physical organ."""
    controls=np.array([[230,780],[185,640],[160,435],[175,245],[240,160],
        [395,143],[570,160],[740,158],[807,260],[810,450],[790,650],
        [751,791],[686,842],[615,876],[579,919],[592,963],[625,1010],
        [650,1055],[650,1105],[637,1170],[620,1210]],float)
    chord=np.r_[0,np.cumsum(np.linalg.norm(np.diff(controls,axis=0),axis=1))]
    spline=CubicSpline(chord,controls,axis=0)
    dense=np.linspace(0,chord[-1],6001)
    xy=spline(dense)
    arc=np.r_[0,np.cumsum(np.linalg.norm(np.diff(xy,axis=0),axis=1))]
    return spline,dense,arc/arc[-1]


def local_geometry(fraction):
    spline,dense,arc=colon_curve()
    f=np.atleast_1d(fraction)
    t=np.interp(f,arc,dense)
    center=spline(t); tangent=spline(t,1); second=spline(t,2)
    speed=np.linalg.norm(tangent,axis=1)
    curvature=np.abs(tangent[:,0]*second[:,1]-tangent[:,1]*second[:,0])/speed**3
    tangent/=speed[:,None]
    normal=np.column_stack((-tangent[:,1],tangent[:,0]))
    width=np.interp(f,[0,.68,.76,.82,.92,1],[65,66,42,27,30,33])
    width*=1+.105*np.cos(2*np.pi*18*f)*np.clip((.87-f)/.12,0,1)
    # Keep the offset walls inside the local radius of curvature; no folded S-bend.
    width=np.minimum(width,.7/np.maximum(curvature,1e-8))
    return center,tangent,normal,width


def embed(s, y, p=BASE):
    """Map solved strip coordinates onto an arclength-indexed schematic colon."""
    center,_,normal,width=local_geometry(np.asarray(s)/p['L_um'])
    return center+normal*((2*np.asarray(y)/p['H_um']-1)*width)[:,None]


def geometry(p=BASE):
    s = np.linspace(0, p['L_um'], 1001)
    inner = embed(s, np.zeros_like(s), p).round(4).tolist()
    outer = embed(s, np.full_like(s, p['H_um']), p).round(4).tolist()
    haustra=[]
    for f in np.linspace(.025,.72,16):
        c,t,n,w=local_geometry([f])
        for sign in [-1,1]:
            normal_steps=np.array([1,.86,.7])*sign*w[0]
            points=c+n*normal_steps[:,None]+t*np.array([0,4,0])[:,None]
            haustra.append(points.round(3).tolist())
    return dict(kind='schematic-colon-arclength-mapping',units='schematic',y_axis='down',
        L_um=p['L_um'], H_um=p['H_um'], bounds=[45,930,55,1290],
        walls=[dict(id='inner', points=inner), dict(id='outer', points=outer)],
        inlet=[inner[0], outer[0]], outlet=[inner[-1], outer[-1]],
        centerline=embed(s, np.full_like(s, p['H_um']/2), p).round(4).tolist(),
        haustra=haustra,
        labels=[dict(text='Ascending',x=55,y=410),dict(text='Transverse',x=475,y=70),
                dict(text='Descending',x=920,y=415),dict(text='Sigmoid',x=470,y=985),
                dict(text='Rectal outlet',x=620,y=1270)],
        note='Strip-coordinate dynamics mapped onto a schematic colon; two reactive walls; not organ CFD or patient anatomy.')


def simulate(n=4000, dt=.01, end=180., seed=SEED, frame_step=1., display=600,
             initially_attached=False, **changes):
    p = BASE | changes
    steps, every = round(end/dt), round(frame_step/dt)
    assert dt > 0 and n > 0 and abs(steps*dt-end) < 1e-8
    assert every > 0 and abs(every*dt-frame_step) < 1e-8
    rng = np.random.default_rng(seed)
    # Rejection samples a truncated Gaussian, rather than placing clipped mass at the inlet.
    s = rng.normal(.1*p['L_um'], .035*p['L_um'], n)
    while np.any((s < 0) | (s > p['L_um'])):
        bad = (s < 0) | (s > p['L_um'])
        s[bad] = rng.normal(.1*p['L_um'], .035*p['L_um'], bad.sum())
    y = rng.uniform(0, p['H_um'], n)
    state = np.zeros(n, dtype=np.int8)
    if initially_attached:
        state[:] = 1
        y[:] = 0
    selected = np.linspace(0, n-1, min(display, n), dtype=int)
    scale = np.sqrt(2*p['D_um2_s']*dt)
    # Crossed-endpoint Euler rule, not Brownian-bridge encounter detection.
    # Its Robin limit is kappa = P*sqrt(D/pi), p_ads = P*sqrt(dt).
    p_ads = p['kappa_um_s']*np.sqrt(np.pi*dt/p['D_um2_s'])
    assert 0 <= p_ads <= 1, 'Reduce dt: the Robin crossing probability must be <= 1.'
    q = p['koff_s']+p['ks_s']
    p_leave = -np.expm1(-q*dt)
    p_detach = p['koff_s']/q if q else 0
    frames, ledgers, times = [], [], []
    attach_events = np.zeros(n, dtype=int)
    detach_events = np.zeros(n, dtype=int)
    wall_time = np.zeros(n)
    max_closure, invalid_positions = 0, 0

    def record(t):
        counts = np.bincount(state, minlength=4)
        times.append(float(t)); ledgers.append(counts)
        if display:
            xy = embed(s[selected], y[selected], p)
            ds = np.bincount(state[selected], minlength=4)
            frames.append(dict(particles=np.column_stack((xy.round(3),state[selected])).tolist(),
                ledger=dict(zip(KEYS, map(int, counts))) | dict(total=n),
                display_ledger=dict(zip(KEYS, map(int, ds))) | dict(total=len(selected))))

    record(0)
    for step in range(1, steps+1):
        free = np.flatnonzero(state == 0)
        bound = np.flatnonzero(state == 1)
        wall_time[bound] += dt
        if free.size:
            yy = y[free]/p['H_um']
            s[free] += 6*p['U_um_s']*yy*(1-yy)*dt+scale*rng.standard_normal(free.size)
            trial_y = y[free]+scale*rng.standard_normal(free.size)
            # Zero post-pulse inlet flux; time-discrete absorbing outlet endpoint.
            s[free] = np.abs(s[free])
            outside = s[free] >= p['L_um']
            escaped = free[outside]
            s[escaped] = p['L_um']; state[escaped] = 2
            # Mirror reflection, including the (very unlikely) multiple-wall crossing.
            folded = np.mod(trial_y, 2*p['H_um'])
            y[free] = np.minimum(folded, 2*p['H_um']-folded)
            crossed = (~outside) & ((trial_y < 0) | (trial_y > p['H_um']))
            hits = free[crossed]
            if hits.size and p_ads:
                adsorb = rng.random(hits.size) < p_ads
                new_bound = hits[adsorb]
                state[new_bound] = 1
                y[new_bound] = np.where(trial_y[crossed][adsorb] < 0, 0., p['H_um'])
                attach_events[new_bound] += 1
        # Only cells bound at step start react here. Competing exponential hazards;
        # newly detached particles resume reflected diffusion on the next step.
        if bound.size and q:
            leaving = bound[rng.random(bound.size) < p_leave]
            is_detach = rng.random(leaving.size) < p_detach
            detached, shed = leaving[is_detach], leaving[~is_detach]
            state[detached] = 0; detach_events[detached] += 1
            state[shed] = 3
        if step % every == 0:
            record(step*dt)
            counts = ledgers[-1]
            max_closure = max(max_closure, abs(int(counts.sum())-n))
            invalid_positions += int(np.count_nonzero((s < 0) | (s > p['L_um']) |
                                                       (y < 0) | (y > p['H_um'])))
    return dict(time=np.array(times), counts=np.array(ledgers), frames=frames,
        selected=selected, s=s, y=y, state=state, attach_events=attach_events,
        detach_events=detach_events, wall_time=wall_time,
        diagnostics=dict(max_count_closure_error=max_closure, invalid_positions=invalid_positions,
            finite_coordinates=bool(np.isfinite(s).all() and np.isfinite(y).all()),
            adsorption_crossing_probability=float(p_ads)), parameters=p)


def write_csv(path, rows):
    with path.open('w', newline='', encoding='utf-8') as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0])); w.writeheader(); w.writerows(rows)


def check_display_geometry(replay):
    walls=[np.array(w['points']) for w in replay['geometry']['walls']]
    polygon=np.vstack((walls[0],walls[1][::-1]))
    free=np.array([p[:2] for f in replay['frames'] for p in f['particles'] if p[2]==0])
    # Stored polylines and rounded display positions have a finite geometric tolerance.
    outside=int(np.count_nonzero(~PolygonPath(polygon).contains_points(free,radius=.1)))
    delta=np.roll(polygon,-1,axis=0)-polygon
    intersections=0
    for i in range(len(polygon)):
        others=np.arange(i+2,len(polygon))
        if i==0: others=others[others!=len(polygon)-1]
        q=polygon[others]-polygon[i]
        den=delta[i,0]*delta[others,1]-delta[i,1]*delta[others,0]
        good=np.abs(den)>1e-12;others=others[good];q=q[good];den=den[good]
        t=(q[:,0]*delta[others,1]-q[:,1]*delta[others,0])/den
        u=(q[:,0]*delta[i,1]-q[:,1]*delta[i,0])/den
        intersections+=int(np.count_nonzero((t>1e-8)&(t<1-1e-8)&(u>1e-8)&(u<1-1e-8)))
    assert outside==intersections==0
    return dict(free_display_positions_checked=len(free),outside_polygon=outside,
        boundary_self_intersections=intersections,polyline_tolerance_schematic_units=.1)


def style():
    plt.rcParams.update({'font.family':'DejaVu Sans','font.size':10,'axes.titlesize':12,
        'axes.titleweight':'bold','axes.labelsize':10,'axes.spines.top':False,
        'axes.spines.right':False,'axes.edgecolor':'#aab5af','axes.labelcolor':'#264b43',
        'text.color':'#264b43','xtick.color':'#62746d','ytick.color':'#62746d',
        'figure.facecolor':'white','axes.facecolor':'white','savefig.facecolor':'white',
        'pdf.fonttype':42,'svg.fonttype':'none'})


def savefig(fig, out, name):
    for ext in ['png','svg','pdf']:
        fig.savefig(out/f'{name}.{ext}', dpi=190, bbox_inches='tight')
    plt.close(fig)


def snapshots(main, out):
    g = geometry(); walls = [np.array(w['points']) for w in g['walls']]
    fig, axes = plt.subplots(1, 3, figsize=(13.6, 7.4))
    for ax, seconds, letter in zip(axes, [5,20,60], 'ABC'):
        f = main['frames'][int(seconds)]
        a = np.array(f['particles'])
        polygon = np.vstack((walls[0],walls[1][::-1]))
        ax.add_patch(Polygon(polygon, closed=True, facecolor='#f5f6ed', edgecolor='none'))
        for wall in walls: ax.plot(*wall.T, color='#88a58e', lw=9, solid_capstyle='round', zorder=1)
        for line in g['haustra']:
            line=np.array(line);ax.plot(*line.T,color='#a1b9a6',lw=1.1,zorder=2)
        for st in [0,1]:
            points = a[a[:,2] == st]
            ax.scatter(points[:,0],points[:,1],s=9 if st==0 else 16,c=COLORS[st],
                       edgecolors='white',linewidths=.25,alpha=.9,zorder=3)
        inlet, outlet = np.array(g['inlet']), np.array(g['outlet'])
        ax.plot(*inlet.T,color='#b9c8c1',lw=1,ls='--'); ax.plot(*outlet.T,color=COLORS[2],lw=2)
        ax.annotate('Inlet',xy=(230,780),xytext=(230,905),
                    ha='center',fontsize=10,arrowprops=dict(arrowstyle='->',color='#71877c'))
        ax.annotate('Outlet',xy=(620,1210),xytext=(795,1210),
                    ha='center',fontsize=10,color=COLORS[2],arrowprops=dict(arrowstyle='->',color=COLORS[2]))
        ax.annotate('',xy=(515,155),xytext=(420,150),
                    arrowprops=dict(arrowstyle='->',color='#617b70',lw=1.7))
        ax.set(xlim=(45,930),ylim=(1290,55),aspect='equal')
        ax.axis('off')
        ax.set_title(f'{letter}   {seconds} s',loc='left',pad=12)
        led=f['ledger']
        for j,(key,color) in enumerate(zip(KEYS,COLORS)):
            ax.text(345,385+j*93,key.capitalize(),ha='left',color=color,fontsize=11)
            ax.text(660,385+j*93,f'{led[key]:,}',ha='right',color=color,fontsize=11,fontweight='bold')
    handles=[Line2D([0],[0],marker='o',ls='',color=c,label=n,markersize=6) for n,c in zip(NAMES,COLORS)]
    fig.legend(handles=handles,loc='upper center',ncol=4,frameon=False,bbox_to_anchor=(.5,1.015))
    fig.text(.5,.025,'600 fixed particle IDs shown from N = 4,000; counts include the entire cohort.\n'
        'Strip-coordinate transport mapped onto a schematic colon · two reactive walls · not organ CFD.',
        ha='center',fontsize=10,color='#67776e')
    fig.subplots_adjust(top=.89,bottom=.13,wspace=.15)
    savefig(fig,out,'particle-transport')


def validation(main, no_binding, out):
    raw=[]; averaged=[]
    for dt in [.04,.02,.01]:
        samples=[]
        for repeat in range(6):
            seed=202620000+int(round(dt*1000))*100+repeat
            run=simulate(n=6000,dt=dt,end=60,seed=seed,display=0,frame_step=20)
            assert run['diagnostics']['max_count_closure_error']==0 and run['diagnostics']['invalid_positions']==0
            fractions=run['counts'][-1]/6000
            samples.append(fractions)
            raw.append(dict(dt_s=dt,seed=seed,n=6000,t_s=60,
                            **dict(zip(KEYS,map(float,fractions)))))
        a=np.array(samples); mean=a.mean(axis=0); se=a.std(axis=0,ddof=1)/np.sqrt(len(a))
        ci=student_t.ppf(.975,len(a)-1)*se
        averaged.append(dict(dt_s=dt,repeats=6,particles_per_repeat=6000,
            mean=dict(zip(KEYS,mean.tolist())),standard_error=dict(zip(KEYS,se.tolist())),
            ci95_halfwidth=dict(zip(KEYS,ci.tolist()))))
        print('step-size ensemble',averaged[-1],flush=True)
    write_csv(out/'particle-step-ensemble.csv',raw)
    differences=[]
    for coarse in averaged[:-1]:
        fine=averaged[-1]
        differences.append(dict(coarse_dt_s=coarse['dt_s'],fine_dt_s=.01,
            absolute_fraction_difference={k:abs(coarse['mean'][k]-fine['mean'][k]) for k in KEYS},
            pooled_standard_error={k:float(np.hypot(coarse['standard_error'][k],fine['standard_error'][k])) for k in KEYS},
            ci95_intervals_overlap={k:abs(coarse['mean'][k]-fine['mean'][k]) <=
                coarse['ci95_halfwidth'][k]+fine['ci95_halfwidth'][k] for k in KEYS}))
    # Exactly one competing-hazard step: detachment and shedding fractions have known probabilities.
    hazard=simulate(n=200000,dt=60,end=60,seed=20264001,display=0,frame_step=60,
                    initially_attached=True,kappa_um_s=0,U_um_s=0)
    q=BASE['koff_s']+BASE['ks_s']; stay=np.exp(-q*60)
    expected=np.array([(1-stay)*BASE['koff_s']/q,stay,0,(1-stay)*BASE['ks_s']/q])
    observed=hazard['counts'][-1]/200000
    error=np.abs(observed-expected)
    se=np.sqrt(expected*(1-expected)/200000)
    checks=dict(main=main['diagnostics'],
        no_binding=dict(kappa_um_s=0,max_attached=int(no_binding['counts'][:,1].max()),
                        max_shed=int(no_binding['counts'][:,3].max()),
                        total_attachment_events=int(no_binding['attach_events'].sum())),
        competing_hazards=dict(n=200000,t_s=60,expected=dict(zip(KEYS,expected.tolist())),
            observed=dict(zip(KEYS,observed.tolist())),max_absolute_fraction_error=float(error.max()),
            within_four_binomial_standard_errors=bool(np.all(error <= 4*se+1e-12))),
        step_ensembles=averaged,step_comparisons=differences,
        interpretation='Three resolutions with six independent seeds each. Error bars are 95% t intervals across seeds, '
            'not experimental uncertainty. Agreement within sampling error is a resolution check, not a measured order or proof of exact convergence.')
    assert checks['no_binding']['max_attached']==checks['no_binding']['max_shed']==0
    assert checks['competing_hazards']['within_four_binomial_standard_errors']
    fig,ax=plt.subplots(1,3,figsize=(14.5,4.25))
    for st,c in enumerate(COLORS): ax[0].plot(main['time'],main['counts'][:,st]/4000,c=c,label=NAMES[st])
    ax[0].set(title='A  Cohort fate',xlabel='Time (s)',ylabel='Fraction of initial cohort',ylim=(-.02,1.02))
    ax[0].legend(frameon=False,ncol=2,fontsize=8)
    ax[1].plot(main['time'],main['counts'][:,1]/4000,c=COLORS[1],label='Reversible walls')
    ax[1].plot(no_binding['time'],no_binding['counts'][:,1]/4000,c='#555d59',ls='--',label='κ = 0 control')
    ax[1].set(title='B  Binding control',xlabel='Time (s)',ylabel='Attached fraction',ylim=(-.01,.25))
    ax[1].legend(frameon=False,fontsize=8)
    for st,k in enumerate(KEYS):
        ax[2].errorbar([v['dt_s'] for v in averaged],[v['mean'][k] for v in averaged],
            yerr=[v['ci95_halfwidth'][k] for v in averaged],fmt='o-',capsize=3,c=COLORS[st],label=NAMES[st])
    ax[2].set(title='C  Resolution / Monte Carlo check',xlabel='Time step (s)',ylabel='Fraction at 60 s',xticks=[.01,.02,.04])
    ax[2].legend(frameon=False,fontsize=8)
    fig.text(.5,.015,'Exact integer ledger closure at every recorded time. Six seeds × 6,000 particles per time step; bars: 95% t intervals.',ha='center',fontsize=9)
    fig.tight_layout(rect=(0,.06,1,1));savefig(fig,out,'particle-validation')
    return checks


def main(out):
    started=time.time();out.mkdir(parents=True,exist_ok=True);style()
    run=simulate();print('main trajectory complete',time.time()-started,flush=True)
    no_binding=simulate(kappa_um_s=0,display=0,seed=SEED)
    replay=dict(schemaVersion=1,units=dict(length='µm',time='s'),
        states=[dict(id=i,name=n,color=c) for i,(n,c) in enumerate(zip(NAMES,COLORS))],
        geometry=geometry(),parameters=BASE,seed=SEED,dt_s=.01,
        simulated_particle_count=4000,displayed_particle_count=600,
        particle_ids=run['selected'].tolist(),time_s=run['time'].tolist(),frames=run['frames'],
        terminal_display='Hide state >= 2 in the channel. Their final coordinates are frozen bookkeeping locations, not post-exit tracks.',
        status='Uncalibrated post-release cell-transport scenario; not measured trajectories, patient anatomy, or organ CFD.')
    (out/'particle-replay.json').write_text(json.dumps(replay,separators=(',',':')),encoding='utf-8')
    preview={k:v for k,v in replay.items() if k not in ['time_s','frames']}
    preview.update(time_s=20,frame=run['frames'][20])
    (out/'particle-preview.json').write_text(json.dumps(preview,separators=(',',':')),encoding='utf-8')
    curves=[]
    for name,data in [('reversible',run),('no-binding',no_binding)]:
        for t,count in zip(data['time'],data['counts']):
            curves.append(dict(scenario=name,time_s=float(t),**dict(zip(KEYS,map(int,count))),total=int(count.sum())))
    write_csv(out/'particle-counts.csv',curves)
    write_csv(out/'particle-final-cohort.csv',[dict(particle_id=i,s_um=float(run['s'][i]),y_um=float(run['y'][i]),
        state=NAMES[run['state'][i]],attachment_events=int(run['attach_events'][i]),
        detachment_events=int(run['detach_events'][i]),time_attached_s=float(run['wall_time'][i])) for i in range(4000)])
    snapshots(run,out)
    checks=validation(run,no_binding,out)
    checks['display_geometry']=check_display_geometry(replay)
    dimensions={}
    for name in ['particle-transport','particle-validation']:
        with Image.open(out/f'{name}.png') as im: dimensions[name]=dict(width=im.width,height=im.height)
    summary=dict(schemaVersion=1,status='Uncalibrated illustrative transport scenario',parameters=BASE,
        units=dict(length='µm',time='s'),seed=SEED,particles=4000,display_particles=600,dt_s=.01,end_s=180,
        geometry_note=geometry()['note'],
        final_counts=dict(zip(KEYS,map(int,run['counts'][-1]))),
        ever_attached_fraction=float(np.mean(run['attach_events']>0)),
        attachment_events=int(run['attach_events'].sum()),detachment_events=int(run['detach_events'].sum()),
        mean_wall_time_within_180s=float(run['wall_time'].mean()),
        dimensions=dimensions,validation=checks,
        limitations=['Strip dynamics embedded into a schematic colon silhouette; curvature does not alter flow or diffusion.',
            'Both walls are reactive; the absorbing outlet uses endpoint detection, not exact Brownian first-passage. Earlier field model has one reactive wall and an advective outlet.',
            'No growth, mucus penetration, chemotaxis, finite receptor occupancy or strain-specific binding mechanism.',
            'Effective dispersion and all reaction rates are scenario assumptions, not fitted construct measurements.',
            'No PspA-induced adhesion or Elafin secretion is assumed. Retention is not therapeutic efficacy.',
            'Displayed dots are a fixed 600-ID subset; counters include all 4000 particles.',
            'Short finite time-step simulations and Monte Carlo intervals do not establish biological validation.'],
        references=[dict(title='Erban & Chapman (2007), Reactive boundary conditions for stochastic simulations of reaction-diffusion processes',url=SOURCE_URL),
                    dict(title='Singer et al. (2008), Partially Reflected Diffusion',url='https://doi.org/10.1137/060663258')],
        script_sha256=hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),elapsed_s=time.time()-started)
    (out/'particle-summary.json').write_text(json.dumps(summary,indent=2),encoding='utf-8')
    readme=f'''# Particle transport replay\n\nFixed-seed numerical trajectories, not random visual decoration or observed EcN tracks.\n\n## Geometry and status\n\nThe solver uses a flat computational strip: axial coordinate s in [0,1800] µm and transverse y in [0,180] µm. For display only, a cubic spline passes through chosen ascending, transverse, descending, sigmoid and rectal control points. Its sampled arclength fraction is indexed by s/L; y/H maps across the local normal between lightly scalloped walls. The displayed X,Y use arbitrary schematic units, not micrometres or organ dimensions. This creates a recognisable colon outline without solving a curved-domain velocity field, metric diffusion, pressure, peristalsis or patient anatomy. Display-space area density is not physical concentration. It is a chip-scale illustration of a post-release colonic-mucosal retention question, not organ CFD.\n\nBoth displayed walls are reactive. The previous finite-volume module uses one reactive wall and a different downstream diffusion boundary, so its numerical values are not interchangeable with this replay.\n\n## Model\n\nFree particles follow dS = 6 U (y/H)(1−y/H) dt + sqrt(2D) dW_s and dY = sqrt(2D) dW_y. Independent Gaussian increments are sampled at dt=0.01 s. The inlet reflects; a sampled endpoint S>=L exits irreversibly. This is a time-discrete absorbing-endpoint approximation, not exact Brownian first-passage detection. Both transverse walls mirror-reflect unless a crossing is adsorbed.\n\nFor the **crossed-endpoint Euler scheme**, adsorption probability per crossing is p=κ sqrt(π dt/D). This is not a rate-times-dt rule and does not detect Brownian-bridge encounters. Its small-step Robin limit is κ=P sqrt(D/π) when p=P sqrt(dt). A local derivation: an initially uniform near-wall density c has c sqrt(D dt/π) crossing endpoints per unit wall length during a step; multiplying by p gives κ c dt. See Erban & Chapman (2007), section 2.2 equation (10), {SOURCE_URL}, with the primary full text at https://people.maths.ox.ac.uk/erban/papers/PhysicalBiology.pdf (page 4); their equation (9) uses a different bridge-corrected rule and a factor of two. See also Singer et al. (2008), https://doi.org/10.1137/060663258. These establish the method, not our biological parameter values.\n\nAttached particles remain at their attachment coordinate. In a step they leave with probability 1−exp[−(koff+ks)dt]; conditional on leaving, koff/(koff+ks) detach and ks/(koff+ks) enter the absorbing shed ledger. A detached particle starts at the same wall and resumes reflected diffusion on the next step. Newly attached particles first undergo hazards in the following step. This splitting and the discrete boundary rule require a time-step check.\n\nκ=1 µm/s, koff=.005/s, ks=.002/s, U=90 µm/s and effective D=100 µm²/s are the existing uncalibrated assay scenarios. The 180 µm transverse scale was motivated by the earlier chip literature audit; length and the schematic colon embedding are chosen. D is coarse-grained cell dispersion, not molecular Brownian diffusivity. The initial pulse is a truncated axial Gaussian centred at .1L, SD=.035L, uniform across y; no subsequent injection.\n\nNo specific engineered adhesin, wall-site saturation, growth, mucus penetration, PspA-mediated attachment or validated Elafin secretion is introduced. Attached and shed denote model states, not measured phenotypes.\n\n## Replay and bookkeeping\n\nN=4000, seed={SEED}, 0–180 s, one recorded frame per second; 600 fixed, uniformly indexed IDs are displayed. The full counts always satisfy Free+Attached+Exited+Shed=N. Terminal positions are frozen bookkeeping coordinates. Hide states 2/3 in the channel and show them only in the cumulative counters; do not scatter invented exited/shed locations. Counters describe all 4000 particles, not just the 600 drawn. Dot size is for visibility and not bacterial scale. Display coordinates are rounded to .001 schematic units for JSON; final cohort CSV retains full precision.\n\nJSON has geometry wall polylines, fixed particle_ids, time_s, and frames with particles [[X,Y,state],...] plus ledger and display_ledger. State 0=Free (blue), 1=Attached (red), 2=Exited (purple), 3=Shed (grey). particle-preview.json contains the actual 20 s frame.\n\n## Verification\n\nThe script checks integer ledger closure and bounded finite positions, zero-κ absence of attachment/shedding, and competing exponential hazards against exact multinomial probabilities. dt=.04/.02/.01 s are each run with six independent seeds and 6000 particles per seed to 60 s. Reported 95% t intervals quantify variability between numerical seeds; they are not experimental or biological confidence intervals. Resolution differences and pooled standard errors are included rather than claiming convergence from three noisy trajectories or assigning a deterministic order.\n\nReproduce with `python particle-transport.py --output-dir .` using NumPy, SciPy, Matplotlib and Pillow. This download is the same script as `scripts/drylab/adhesion/particle_transport.py`. All generated filenames begin particle-.\n'''
    (out/'particle-README.md').write_text(readme,encoding='utf-8')
    dest=out/'particle-transport.py'
    if Path(__file__).resolve()!=dest.resolve(): shutil.copy2(__file__,dest)
    print(json.dumps(dict(final=summary['final_counts'],ever_attached=summary['ever_attached_fraction'],
        checks=checks['step_comparisons'],elapsed_s=summary['elapsed_s'],dimensions=dimensions),indent=2),flush=True)


if __name__=='__main__':
    parser=argparse.ArgumentParser()
    parser.add_argument('--output-dir',type=Path,default=Path('public/assets/dry-lab/adhesion'))
    main(parser.parse_args().output_dir)
