"""Elafin–human leukocyte elastase: reference-buffer mass-action calculation.

Run from the repository root: python scripts/drylab/binding_kinetics.py
Requires NumPy, SciPy and Matplotlib. No fitting, docking or MD is performed.
Ying & Simon (1993), DOI 10.1021/bi00058a021, measured rate constants at
pH 8.0, 25 C. Total protein concentrations below are chosen scenarios.
"""
from pathlib import Path
import csv
import json
import platform
import numpy as np
import scipy
from scipy.integrate import solve_ivp
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'public/assets/dry-lab/research'
OUT.mkdir(parents=True, exist_ok=True)
KON = 3.6e6 * 1e-9 * 60  # M^-1 s^-1 -> nM^-1 min^-1
KOFF = 6.0e-4 * 60       # s^-1 -> min^-1
KD = KOFF / KON
TEAL, CORAL, GOLD, BLUE = '#287b79', '#cb7060', '#c69b4e', '#607b9b'
plt.rcParams.update({'font.family': 'DejaVu Sans', 'font.size': 10,
    'axes.spines.top': False, 'axes.spines.right': False,
    'axes.labelcolor': '#263f40', 'text.color': '#263f40',
    'axes.edgecolor': '#9caaa8', 'xtick.color': '#536967',
    'ytick.color': '#536967', 'svg.fonttype': 'none',
    'pdf.fonttype': 42, 'savefig.facecolor': 'white'})


def equilibrium(e_total, i_total):
    """Stable root of C^2-(E_T+I_T+K_D)C+E_T I_T=0."""
    total = e_total + i_total + KD
    return 2 * e_total * i_total / (total + np.sqrt(total**2-4*e_total*i_total))


def trajectory(e_total, i_total, time):
    return solve_ivp(lambda t, c: [KON*(e_total-c[0])*(i_total-c[0])-KOFF*c[0]],
        (0, float(time[-1])), [0.0], t_eval=time, method='DOP853',
        rtol=1e-10, atol=1e-12).y[0]


def csv_out(name, header, rows):
    with (OUT/name).open('w', newline='', encoding='utf-8') as f:
        w=csv.writer(f); w.writerow(header); w.writerows(rows)


time=np.linspace(0,120,601)
e_total=1.0
scenarios=[.25, 1., 4.]
paths=[trajectory(e_total,i,time) for i in scenarios]
grid_i=np.geomspace(.01,100,250)
grid_e=np.array([.1,1.,10.])
ratio=np.geomspace(.02,20,140)
enzyme_scale=np.geomspace(.1,100,140)
R,ES=np.meshgrid(ratio,enzyme_scale)
E=ES*KD
bound=equilibrium(E,E*R)/E
fig,axs=plt.subplots(2,2,figsize=(12.4,8.2),layout='constrained')

ax=axs[0,0]
for i,c,color in zip(scenarios,paths,[GOLD,TEAL,CORAL]):
    ax.plot(time,100*c/e_total,lw=2.2,color=color,label=f'$I_T$ = {i:g} nM')
    ax.axhline(100*equilibrium(e_total,i)/e_total,lw=.8,ls=':',color=color,alpha=.7)
ax.set(xlabel='Time (min)',ylabel='Enzyme bound (%)',ylim=(0,103),xlim=(0,120),title='Association at fixed total enzyme, $E_T$ = 1 nM')
ax.legend(frameon=False,loc='lower right'); ax.grid(axis='y',alpha=.15)

ax=axs[0,1]
for e,color in zip(grid_e,[BLUE,TEAL,CORAL]):
    ax.semilogx(grid_i,100*equilibrium(e,grid_i)/e,color=color,lw=2.2,label=f'$E_T$ = {e:g} nM')
ax.semilogx(grid_i,100*grid_i/(KD+grid_i),color='#89918e',ls='--',lw=1.6,label='Inhibitor-excess approximation')
ax.set(xlabel='Total Elafin, $I_T$ (nM)',ylabel='Equilibrium enzyme bound (%)',ylim=(0,103),title='Mass balance shifts the binding isotherm')
ax.legend(frameon=False,fontsize=9,loc='lower right'); ax.grid(axis='y',alpha=.15)

ax=axs[1,0]
im=ax.pcolormesh(R,ES,100*bound,cmap='YlGnBu',shading='auto',vmin=0,vmax=100,rasterized=True)
cs=ax.contour(R,ES,100*bound,levels=[25,50,75,90],colors='#26474b',linewidths=.7)
ax.clabel(cs,fmt='%d%%',fontsize=8)
ax.axvline(1,color='white',lw=1,ls='--')
ax.set(xscale='log',yscale='log',xlabel='Total inhibitor / total enzyme, $I_T/E_T$',ylabel='Total enzyme / dissociation constant, $E_T/K_D$',title='Tight binding is both affinity- and capacity-limited')
fig.colorbar(im,ax=ax,label='Equilibrium enzyme bound (%)',shrink=.85)

ax=axs[1,1]
dissociation_time=np.linspace(0,120,301)
ax.plot(dissociation_time,100*np.exp(-KOFF*dissociation_time),color=TEAL,lw=2.2)
half=np.log(2)/KOFF
ax.scatter([half],[50],color=CORAL,s=35,zorder=4)
ax.annotate(f'Half-time = {half:.2f} min',xy=(half,50),xytext=(42,64),
    arrowprops={'arrowstyle':'-', 'color':CORAL},color='#674e49',fontsize=10)
ax.set(xlabel='Time under continuous inhibitor removal (min)',ylabel='Complex remaining (%)',title='Dissociation limit when rebinding is suppressed',xlim=(0,120),ylim=(0,103))
ax.grid(axis='y',alpha=.15)
for lab,ax in zip('ABCD',axs.flat):
    ax.text(-.12,1.06,lab,transform=ax.transAxes,fontweight='bold',fontsize=16,color='#234743')
for ext in ['svg','png','pdf']:
    fig.savefig(OUT/f'06-binding-kinetics.{ext}',dpi=210,bbox_inches='tight')
plt.close(fig)

csv_out('binding-trajectories.csv',['time_min']+[f'complex_nM_I_total_{i:g}' for i in scenarios],zip(time,*paths))
csv_out('binding-isotherms.csv',['I_total_nM']+[f'bound_fraction_E_total_{e:g}' for e in grid_e],
    zip(grid_i,*[equilibrium(e,grid_i)/e for e in grid_e]))
csv_out('binding-parameter-surface.csv',['I_total_over_E_total','E_total_over_KD','bound_fraction'],zip(R.ravel(),ES.ravel(),bound.ravel()))
csv_out('binding-dissociation.csv',['time_min','complex_fraction'],zip(dissociation_time,np.exp(-KOFF*dissociation_time)))

# Independent numerical checks, including extreme total-concentration ratios.
equil_residual=[]
long_errors=[]
closed_form_errors=[]
closed_form_times=np.linspace(0,120,601)
physical=True
for e in [.01,.1,1,10,100]:
    for i in [.001,.01,.1,1,10,100]:
        c=equilibrium(e,i)
        equil_residual.append(abs(KON*(e-c)*(i-c)-KOFF*c))
        final=trajectory(e,i,np.array([0.,1000.]))[-1]
        long_errors.append(abs(final-c))
        # Independent Riccati solution: two roots of the mass-action quadratic.
        large_root=e+i+KD-c
        decay=np.exp(-KON*(large_root-c)*closed_form_times)
        exact=c*(1-decay)/(1-(c/large_root)*decay)
        solved=trajectory(e,i,closed_form_times)
        closed_form_errors.append(float(np.max(np.abs(solved-exact))))
        physical=physical and bool(np.all(solved>=-1e-9)) and bool(np.all(solved<=min(e,i)+1e-6))
        physical=physical and 0 <= c <= min(e,i)+1e-12
numerical=[trajectory(e_total,i,np.array([0.,120.]))[-1] for i in scenarios]
summary={
    'analysis':'Mass-action reanalysis with literature rate constants, not team assay data',
    'source':{'authors':'Ying QL; Simon SR','year':1993,'doi':'10.1021/bi00058a021','url':'https://pubmed.ncbi.nlm.nih.gov/8439544/',
        'conditions':'pH 8.0; 25 degrees C; human leukocyte elastase; reference buffer'},
    'parameters':{'kon_M_inv_s_inv':3.6e6,'koff_s_inv':6.0e-4,'kon_nM_inv_min_inv':KON,'koff_min_inv':KOFF,
        'KD_nM_derived':KD,'dissociation_half_time_min_derived':half},
    'concentration_status':'Total enzyme/inhibitor concentrations are chosen scenarios, not measured local gut values.',
    'baseline_E_total_nM':e_total,
    'scenarios':[{'I_total_nM':i,'equilibrium_bound_fraction':float(equilibrium(e_total,i)/e_total),
        'bound_fraction_at_120_min':float(c/e_total)} for i,c in zip(scenarios,numerical)],
    'exact_half_binding':{'formula':'I_T,50 = E_T/2 + K_D','I_T50_at_E_T1_nM':.5+KD,
        'interpretation':'Half the enzyme is bound; not an IC50 prediction in the presence of competing substrate.'},
    'checks':{'max_equilibrium_flux_residual_nM_per_min':float(max(equil_residual)),
        'max_numerical_vs_equilibrium_error_nM':float(max(long_errors)),
        'all_equilibria_and_trajectories_within_mass_bounds':bool(physical),'parameter_pairs_tested':30,
        'max_trajectory_vs_closed_form_error_nM':max(closed_form_errors),'timepoints_per_closed_form_check':601},
    'limitations':['Binding fraction is not a tissue efficacy endpoint or substrate-dependent activity assay.',
        'A closed well-mixed reference buffer omits substrate competition, production, proteolysis and clearance.',
        'The koff describes dissociation of bound complex, not loss of free Elafin.',
        'Kinetic constants for human leukocyte elastase cannot be validated by the porcine enzyme in PDB 1FLE.'],
    'environment':{'python':platform.python_version(),'numpy':np.__version__,'scipy':scipy.__version__,'matplotlib':matplotlib.__version__}
}
(OUT/'binding-summary.json').write_text(json.dumps(summary,indent=2),encoding='utf-8')
assert physical and max(equil_residual)<1e-9 and max(long_errors)<1e-6 and max(closed_form_errors)<1e-6
print(json.dumps(summary['checks'],indent=2))
