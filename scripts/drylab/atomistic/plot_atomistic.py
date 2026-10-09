"""Vector scientific plots of real HDOCK predictions and completed OpenMM trajectories."""
import argparse
import csv
import json
from pathlib import Path
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.lines import Line2D
from matplotlib.colors import LinearSegmentedColormap

ROOT = Path(__file__).resolve().parents[3]
OUT = ROOT/'public/assets/dry-lab/atomistic'
TEAL,CORAL,GOLD,INK = '#388c87','#d77662','#b39547','#26363b'
COLORS = [TEAL,CORAL,GOLD]
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':10,'axes.labelcolor':INK,'text.color':INK,
  'xtick.color':INK,'ytick.color':INK,'axes.edgecolor':'#aab6b8','axes.spines.top':False,'axes.spines.right':False,
  'axes.titlesize':11,'axes.titleweight':'semibold','axes.labelsize':10,'xtick.labelsize':8,'ytick.labelsize':8,
  'svg.fonttype':'none','pdf.fonttype':42,'savefig.facecolor':'white'})


def panel(ax,letter,title):
    ax.set_title(title,loc='left',pad=15)
    ax.text(-.1,1.06,letter,transform=ax.transAxes,fontsize=17,weight='bold',va='bottom')


def save(fig,name):
    for ext in ['png','svg','pdf']: fig.savefig(OUT/f'{name}.{ext}',dpi=300,bbox_inches='tight',pad_inches=.18)
    plt.close(fig)


def picture(ax,name):
    ax.imshow(plt.imread(OUT/(name+'.png')),extent=(0,1200,1000,0));ax.axis('off')
    ax.set_xlim(0,1200);ax.set_ylim(1000,0)


def grid(ax):
    ax.grid(axis='y',color='#e6ebea',lw=.7);ax.set_axisbelow(True)


def closeup(ax,mode,metadata):
    picture(ax,mode)
    annotations=next(r for r in metadata if r['mode']==mode)['annotations']
    destinations=[(170,220),(970,250),(900,825)]
    for item,target in zip(annotations,destinations):
        s,e=item['start'],item['end']
        mid=((s['x']+e['x'])/2,(s['y']+e['y'])/2)
        label=f"I · {item['I_resname']}{item['I_residue']} {item['I_atom']}\nE · {item['E_resname']}{item['E_residue']} {item['E_atom']}\n{item['distance_A']:.2f} Å"
        ax.annotate(label,xy=mid,xytext=target,ha='center',va='center',fontsize=8,
          bbox={'facecolor':'white','edgecolor':'none','pad':2},arrowprops={'arrowstyle':'-','color':'#718087','lw':.75})


def docking():
    S=json.loads((OUT/'docking-summary.json').read_text());metadata=json.loads((OUT/'docking-render-metadata.json').read_text())
    rows=list(csv.DictReader((OUT/'docking/1fle-redocking/pose-metrics.csv').open()))
    rank=np.array([int(r['rank']) for r in rows]);lr=np.array([float(r['ligand_backbone_RMSD_A']) for r in rows])
    score=np.array([float(r['HDOCK_score_arbitrary_units']) for r in rows]);fn=np.array([float(r['fraction_native_contacts']) for r in rows])
    fig,axes=plt.subplots(2,2,figsize=(13,10),gridspec_kw={'width_ratios':[1.1,1]})
    fig.subplots_adjust(left=.08,right=.95,top=.85,bottom=.11,hspace=.4,wspace=.29)
    fig.suptitle('Can blind docking recover the reference Elafin interface?',x=.06,y=.973,ha='left',fontsize=17,weight='bold')
    fig.text(.06,.925,'HDOCKlite 1.2  |  1FLE bound-chain redocking  |  4,392 rotations  |  100 ranked poses',color='#64737a',fontsize=11)
    ax=axes[0,0];picture(ax,'redocking-overlay');panel(ax,'a','Rank 1 prediction against the X-ray reference')
    ax.legend(handles=[Line2D([],[],color=TEAL,lw=3,label='Porcine elastase'),Line2D([],[],color=CORAL,lw=3,label='Predicted Elafin'),Line2D([],[],color=GOLD,lw=3,label='Reference Elafin')],frameon=False,fontsize=8,loc='lower center',ncol=3,bbox_to_anchor=(.5,-.08))
    ax=axes[0,1];dots=ax.scatter(lr,score,c=rank,cmap='viridis_r',s=31,edgecolors='white',linewidths=.3)
    ax.scatter(lr[0],score[0],s=88,facecolors='none',edgecolors=CORAL,lw=2)
    ax.annotate(f'Rank 1\n{lr[0]:.2f} Å',xy=(lr[0],score[0]),xytext=(lr.max()*.28,score.min()+10),fontsize=9,arrowprops={'arrowstyle':'-','lw':.8,'color':INK})
    ax.set_xlabel('Receptor-fitted ligand backbone RMSD (Å)');ax.set_ylabel('HDOCK score (arbitrary units)');grid(ax)
    fig.colorbar(dots,ax=ax,fraction=.044,pad=.035).set_label('Rank',fontsize=9);panel(ax,'b','Ranking versus native-pose recovery')
    ax=axes[1,0];closeup(ax,'redocking-interface',metadata);panel(ax,'c','Actual rank 1 interface: selected contacts')
    ax.text(.5,-.08,'Geometric heavy-atom distances; not hydrogen-bond energies.',transform=ax.transAxes,ha='center',fontsize=8,color='#64737a')
    ax=axes[1,1];ax.plot(rank,fn,color=TEAL,lw=1.4);ax.scatter(rank[:10],fn[:10],s=19,color=CORAL,zorder=3)
    ax.set_xlabel('HDOCK rank');ax.set_ylabel('Fraction of native residue contacts');ax.set_ylim(-.04,1.05);grid(ax)
    ax.text(.98,.96,f"Rank 1: {S['cases']['1fle-redocking']['top1']['recovered_native_contacts']}/{S['cases']['1fle-redocking']['native_reference_contact_pairs_under_5A']} contacts",transform=ax.transAxes,ha='right',va='top',fontsize=10)
    panel(ax,'d','Native contact recovery (<5 Å)')
    fig.text(.06,.03,'Native relative orientation was not supplied as a restraint; bound conformations were retained. Retrospective benchmark; no affinity is inferred.',fontsize=9,color='#64737a')
    save(fig,'docking-validation')

    data=S['cases']['human-ne-elafin'];rows=list(csv.DictReader((OUT/'docking/human-ne-elafin/pose-metrics.csv').open()))
    fig,axes=plt.subplots(2,2,figsize=(13,10),gridspec_kw={'width_ratios':[1.05,1]})
    fig.subplots_adjust(left=.09,right=.95,top=.85,bottom=.13,hspace=.48,wspace=.33)
    screen=data['posthoc_geometry_screen'];selected=screen['selected']
    fig.suptitle('Human NE–Elafin: ranking is not mechanistic validation',x=.06,y=.973,ha='left',fontsize=17,weight='bold')
    fig.text(.06,.925,'Receptor: 2Z7F chain E, SLPI removed  |  Ligand: 2REL model 1  |  prediction, not an experimental complex',color='#64737a',fontsize=10.5)
    ax=axes[0,0];picture(ax,'candidate-complex');panel(ax,'a',f"Post-hoc geometry candidate: original rank {selected['rank']}")
    ax.legend(handles=[Line2D([],[],color=TEAL,lw=3,label='Human neutrophil elastase'),Line2D([],[],color=CORAL,lw=3,label='Human Elafin')],frameon=False,fontsize=8,loc='lower center',ncol=2,bbox_to_anchor=(.5,-.07))
    ax=axes[0,1];closeup(ax,'candidate-interface',metadata);panel(ax,'b','Candidate contacts, not experimentally verified')
    ax=axes[1,0]
    contacts=screen['contacts_under_4A'];ires=sorted({x['I_residue'] for x in contacts},key=lambda x:int(''.join(c for c in x if c.isdigit())))
    eres=sorted({x['E_residue'] for x in contacts},key=lambda x:(int(''.join(c for c in x if c.isdigit())),x))
    distance=np.full((len(ires),len(eres)),np.nan)
    for c in contacts:distance[ires.index(c['I_residue']),eres.index(c['E_residue'])]=c['distance_A']
    cmap=LinearSegmentedColormap.from_list('contact',['#173f43',TEAL,'#d6e6e1']);cmap.set_bad('#f4f7f6')
    im=ax.imshow(distance,aspect='auto',cmap=cmap,vmin=2,vmax=4,interpolation='nearest')
    ax.set_xticks(range(len(eres)),eres,rotation=60,ha='right',fontsize=6.5);ax.set_yticks(range(len(ires)),ires,fontsize=7)
    ax.set_xlabel('Human NE · author residue');ax.set_ylabel('Mature Elafin residue');fig.colorbar(im,ax=ax,fraction=.04,pad=.035).set_label('Minimum distance (Å)',fontsize=8)
    panel(ax,'c',f"Rank {selected['rank']} interface residue pairs (<4 Å)")
    ax=axes[1,1]
    distances=np.array([float(r['Elafin_A24_C_to_NE_S195_OG_A']) for r in rows]);scores=np.array([float(r['HDOCK_score_arbitrary_units']) for r in rows]);short=np.array([int(r['interchain_heavy_atom_pairs_under_2A']) for r in rows])
    for mask,marker,color,label in [(short==0,'o',TEAL,'No heavy-atom pair <2 Å'),(short>0,'x','#a1adab','At least one pair <2 Å')]:
        ax.scatter(distances[mask],scores[mask],marker=marker,color=color,s=24,lw=1,label=label)
    ax.axvline(5,color=GOLD,lw=1,ls='--');ax.scatter(distances[0],scores[0],s=90,facecolors='none',edgecolors=CORAL,lw=1.8)
    idx=selected['rank']-1;ax.scatter(distances[idx],scores[idx],s=90,facecolors='none',edgecolors=TEAL,lw=1.8)
    ax.annotate(f'Rank 1: {distances[0]:.1f} Å',xy=(distances[0],scores[0]),xytext=(30,scores[0]+2),fontsize=8,arrowprops={'arrowstyle':'-','color':INK,'lw':.7})
    ax.annotate(f'Rank {selected["rank"]}: {distances[idx]:.2f} Å',xy=(distances[idx],scores[idx]),xytext=(12,scores[idx]-6),fontsize=8,arrowprops={'arrowstyle':'-','color':INK,'lw':.7})
    ax.set_xlabel('Elafin Ala24 C—NE Ser195 OG distance (Å)');ax.set_ylabel('HDOCK score (arbitrary units)');grid(ax);ax.legend(frameon=False,fontsize=7,loc='upper right')
    panel(ax,'d','All 100 poses: score versus reactive-site proximity')
    fig.text(.06,.053,'Rank 1 does not place the reactive bond near catalytic Ser195. The displayed candidate was selected AFTER inspecting geometric plausibility.',fontsize=9,color='#64737a')
    fig.text(.06,.018,'Screen: Ala24 C–Ser195 OG <5 Å and no interchain heavy-atom pair <2 Å. A post-hoc screen is not validation; no Kd or inhibition is predicted.',fontsize=9,color='#64737a')
    save(fig,'docking-human-ne')


def md():
    S=json.loads((OUT/'md-summary.json').read_text())
    fig,axes=plt.subplots(2,3,figsize=(14.5,8.7))
    fig.subplots_adjust(left=.075,right=.97,top=.83,bottom=.12,hspace=.45,wspace=.34)
    fig.suptitle('Human Elafin in explicit water: independent short MD pilots',x=.05,y=.975,ha='left',fontsize=17,weight='bold')
    fig.text(.05,.925,f"2REL conformer 1  |  AMBER ff14SB / TIP3P-FB  |  300 K, 1 bar, 0.15 M NaCl  |  {len(S['replicas'])} completed replicas",color='#64737a',fontsize=10.5)
    fig.text(.05,.885,'Each replica: 100 ps equilibration + 1 ns unrestrained production. Shaded early production is excluded from RMSF and summary means.',color='#64737a',fontsize=9)
    for run,color in zip(S['replicas'],COLORS):
        n=run['replica'];folder=OUT/f'md/replica-{n}';a=np.load(folder/'analysis-arrays.npz');t=a['time_ps']/1000
        therm=np.genfromtxt(folder/'thermodynamics.csv',delimiter=',',names=True,deletechars=' #\"()/')
        for ax,values in [(axes[0,0],a['rmsd_full_A']),(axes[0,1],a['rmsd_wap_A']),(axes[1,0],a['rg_A'])]:
            ax.plot(t,values,color=color,lw=1.25,label=f'Replica {n}')
        axes[0,2].plot(np.arange(1,58),a['rmsf_A'],color=color,lw=1.4)
        axes[1,1].plot(t[1:],therm['Temperature_K'],color=color,lw=.8,alpha=.85)
        axes[1,2].plot(t[1:],therm['Density_gmL'],color=color,lw=.8,alpha=.85)
    settings=[('a','Full-length backbone displacement','Cα RMSD, fit 1–57 (Å)'),('b','WAP-domain backbone displacement','Cα RMSD, fit 9–57 (Å)'),('c','Temporal residue fluctuations','Cα RMSF, WAP fit (Å)'),('d','Protein compactness','Mass-weighted Rg (Å)'),('e','Temperature control','Temperature (K)'),('f','Solvent-density relaxation','Density (g mL⁻¹)')]
    for ax,(letter,title,ylabel) in zip(axes.flat,settings):
        panel(ax,letter,title);ax.set_ylabel(ylabel);grid(ax)
        if letter=='c':
            ax.axvspan(.5,8.5,color=GOLD,alpha=.1);ax.set_xlim(1,57);ax.set_xlabel('Mature Elafin residue');ax.set_xticks([1,9,16,24,32,40,48,57])
        else:
            ax.axvspan(0,.2,color='#c7d6d1',alpha=.2,zorder=0);ax.set_xlim(0,1);ax.set_xlabel('Production time (ns)')
    axes[0,0].legend(frameon=False,fontsize=8,loc='upper left')
    axes[1,1].axhline(300,color=INK,lw=.8,ls='--')
    fig.text(.05,.035,'RMSD uses the minimized initial structure. RMSF uses each replica’s 0.2–1.0 ns mean after WAP alignment; these are temporal MD fluctuations.',fontsize=9,color='#64737a')
    save(fig,'md-dynamics')

    fig,axes=plt.subplots(1,3,figsize=(15,5.4),gridspec_kw={'width_ratios':[1,1,1.2]})
    fig.subplots_adjust(left=.07,right=.96,top=.76,bottom=.2,wspace=.37)
    fig.suptitle('Covalent topology and short-window intramolecular contacts',x=.05,y=.97,ha='left',fontsize=17,weight='bold')
    fig.text(.05,.88,'Four explicit Elafin disulfide bonds  |  contact occupancy from completed trajectories  |  no receptor is present in this MD system',color='#64737a',fontsize=10)
    ax=axes[0];ss_values=[];occupancy=[]
    for run in S['replicas']:
        a=np.load(OUT/f"md/replica-{run['replica']}/analysis-arrays.npz");ss_values.append(a['disulfide_distances_A']);occupancy.append(a['contact_occupancy'])
    values=np.concatenate(ss_values)
    box=ax.boxplot([values[:,i] for i in range(4)],tick_labels=['16–45','23–49','32–44','38–53'],showfliers=False,patch_artist=True,widths=.55)
    for p in box['boxes']:p.set(facecolor='#d4e6df',edgecolor=TEAL)
    for p in box['medians']:p.set(color=INK)
    ax.set_ylabel('SG–SG distance (Å)');ax.set_xlabel('Cysteine pair (mature numbering)');grid(ax);panel(ax,'a','Disulfide geometries')
    for idx,run in enumerate(S['replicas']):
        ax=axes[1]
        ax.scatter([1,2],[run['mean_N_terminal_CA_RMSF_A'],run['mean_WAP_CA_RMSF_A']],color=COLORS[idx],s=35,label=f"Replica {run['replica']}")
        ax.plot([1,2],[run['mean_N_terminal_CA_RMSF_A'],run['mean_WAP_CA_RMSF_A']],color=COLORS[idx],lw=1)
    ax.set_xticks([1,2],['N-terminus\n1–8','WAP domain\n9–57']);ax.set_xlim(.65,2.35);ax.set_ylabel('Mean temporal Cα RMSF (Å)');grid(ax);panel(ax,'b','Regional fluctuation contrast')
    # Every replica masks the same sequence-neighbour band; retain that mask
    # without an avoidable all-NaN-slice warning.
    ax=axes[2];stack=np.array(occupancy);contacts=np.mean(np.nan_to_num(stack,nan=0.),axis=0);contacts[np.isnan(stack[0])]=np.nan
    cmap=LinearSegmentedColormap.from_list('occupancy',['#f6f9f8','#95c6bd','#175c5a']);cmap.set_bad('white')
    im=ax.imshow(contacts,origin='lower',extent=(.5,57.5,.5,57.5),cmap=cmap,vmin=0,vmax=1,interpolation='nearest')
    ax.set_xlabel('Mature Elafin residue');ax.set_ylabel('Mature Elafin residue');ax.set_xticks([1,9,24,40,57]);ax.set_yticks([1,9,24,40,57]);fig.colorbar(im,ax=ax,fraction=.044,pad=.04).set_label('Contact fraction',fontsize=9);panel(ax,'c','Cα contact occupancy (<8 Å)')
    fig.text(.05,.055,'Disulfides are bonded terms in the force field, so intact SG–SG distances are a topology check, not an independent stability assay.',fontsize=9,color='#64737a')
    fig.text(.05,.018,f"Contact map: equal-weight mean of {len(S['replicas'])} completed replicas over 0.2–1.0 ns; sequence neighbours |i−j| ≤ 3 are masked. No convergence claim.",fontsize=9,color='#64737a')
    save(fig,'md-topology-contacts')


if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--only',choices=['docking','md','all'],default='all');args=p.parse_args()
    if args.only in ['docking','all']:docking()
    if args.only in ['md','all']:md()
