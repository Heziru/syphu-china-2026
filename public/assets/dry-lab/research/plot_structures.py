"""Publication-style plots from analyze_structures.py outputs and real 3Dmol renders."""
from pathlib import Path
import json
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.colors import LinearSegmentedColormap
from matplotlib.lines import Line2D

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'public/assets/dry-lab/research'
WORK = ROOT / 'outputs/dry-lab-research'
A = np.load(WORK / 'structure-arrays.npz')
S = json.loads((OUT / 'structure-summary.json').read_text(encoding='utf8'))
R = json.loads((WORK / 'render-provenance.json').read_text(encoding='utf8'))
TEAL, CORAL, INK, GOLD = '#388c87', '#d77662', '#26363b', '#c99b43'
plt.rcParams.update({'font.family':'DejaVu Sans', 'font.size':10, 'axes.labelcolor':INK,
                     'text.color':INK, 'xtick.color':INK, 'ytick.color':INK,
                     'axes.edgecolor':'#aab6b8', 'axes.spines.top':False,
                     'axes.spines.right':False, 'axes.titlesize':11,
                     'axes.titleweight':'semibold', 'axes.labelsize':10,
                     'xtick.labelsize':8, 'ytick.labelsize':8,
                     'svg.fonttype':'none', 'pdf.fonttype':42, 'savefig.facecolor':'white'})
cmap = LinearSegmentedColormap.from_list('elafin', ['#f5f9f8','#aaccc7',TEAL,'#174a4d'])
contact_cmap = LinearSegmentedColormap.from_list('contact', ['#173f43',TEAL,'#bad5cf','#f6f8f7'])


def panel(ax, letter, title):
    ax.set_title(title, loc='left', pad=12)
    ax.text(-.11, 1.055, letter, transform=ax.transAxes, fontsize=17, fontweight='bold', va='bottom')


def image(ax, name, xlim=(100, 1100), ylim=(930, 50)):
    ax.imshow(plt.imread(OUT / name), extent=(0, 1200, 1000, 0))
    ax.set_xlim(*xlim); ax.set_ylim(*ylim); ax.axis('off')


def save(fig, name):
    for extension in ('png', 'svg', 'pdf'):
        fig.savefig(OUT / f'{name}.{extension}', dpi=300, bbox_inches='tight', pad_inches=.18)
    plt.close(fig)


def figure_nmr():
    fig, axes = plt.subplots(2, 2, figsize=(12.8, 9.5), gridspec_kw={'width_ratios':[1.2,1], 'height_ratios':[1, .85]})
    fig.subplots_adjust(left=.085, right=.935, top=.87, bottom=.11, hspace=.46, wspace=.37)
    fig.suptitle('Elafin in solution: ensemble variation and alignment sensitivity', x=.06, ha='left', fontsize=17, weight='bold', y=.97)
    fig.text(.06,.925,'PDB 2REL  |  11 deposited NMR conformers  |  mature Elafin residues 1–57',fontsize=11,color='#64737a')
    ax=axes[0,0]
    image(ax,'2rel-aligned-ensemble.png',xlim=(270,1060),ylim=(850,210));panel(ax,'a','Eleven conformers after WAP-domain alignment')
    ax.legend(handles=[Line2D([],[],color=TEAL,lw=2,label='WAP domain 9–57'),Line2D([],[],color=GOLD,lw=2,label='N-terminus 1–8')],loc='upper left',bbox_to_anchor=(0,-.025),frameon=False,fontsize=8,ncol=2)
    ax.text(.97,-.12,'Cα traces',transform=ax.transAxes,ha='right',fontsize=8,color='#64737a')
    ax=axes[0,1]
    im=ax.imshow(A['pairs'],cmap=cmap,vmin=0,vmax=5,origin='lower',interpolation='nearest')
    ax.set_xticks(range(11),range(1,12));ax.set_yticks(range(11),range(1,12));ax.set_xlabel('NMR conformer');ax.set_ylabel('NMR conformer')
    panel(ax,'b','Pairwise best-fit Cα RMSD (1–57)')
    cb=fig.colorbar(im,ax=ax,fraction=.047,pad=.04);cb.set_label('RMSD (Å)',fontsize=9)
    ax=axes[1,0]
    residues=np.arange(1,58)
    ax.axvspan(.5,8.5,color=GOLD,alpha=.11,zorder=0)
    ax.plot(residues,A['dispersion'],color=TEAL,lw=2,label='Fit residues 1–57')
    ax.plot(residues,A['dispersion_wap'],color=CORAL,lw=1.7,label='Fit WAP 9–57')
    ax.set_xlim(1,57);ax.set_ylim(0,9);ax.set_xlabel('Mature Elafin residue');ax.set_ylabel('Ensemble dispersion (Å)')
    ax.set_xticks([1,9,16,24,32,40,48,57]);ax.grid(axis='y',color='#e6eaea',lw=.7);ax.set_axisbelow(True)
    ax.legend(frameon=False,fontsize=8,loc='upper right');panel(ax,'c','Residue-wise spread around the aligned mean')
    ax.text(.02,.96,'1–8',transform=ax.transAxes,va='top',fontsize=8,color='#947027')
    ax=axes[1,1]
    upper=np.triu_indices(11,1);full=A['pairs'][upper];wap=A['pairs_wap'][upper]
    offsets=(np.arange(55)%11-5)/38
    for i in range(55): ax.plot([offsets[i],1+offsets[i]],[full[i],wap[i]],color='#d5dddb',lw=.6,zorder=0)
    ax.scatter(offsets,full,s=16,color=TEAL,alpha=.8,edgecolors='none')
    ax.scatter(1+offsets,wap,s=16,color=CORAL,alpha=.8,edgecolors='none')
    for i,values in enumerate((full,wap)):
        ax.plot([i-.23,i+.23],[np.median(values)]*2,color=INK,lw=2)
        ax.text(i,4.8,f'median {np.median(values):.2f} Å',ha='center',fontsize=8)
    ax.set_xticks([0,1],['Full length\n1–57','WAP domain\n9–57']);ax.set_xlim(-.5,1.5);ax.set_ylim(0,5.3)
    ax.set_ylabel('Pairwise best-fit Cα RMSD (Å)');ax.grid(axis='y',color='#e6eaea',lw=.7);ax.set_axisbelow(True)
    panel(ax,'d','Sensitivity to the fitted residue set')
    fig.text(.06,.035,'Each paired point is one of 55 conformer pairs, not an independent biological replicate. NMR ensemble dispersion is not MD-RMSF.',fontsize=9,color='#64737a')
    save(fig,'structure-nmr-ensemble')


def interface_inset(ax):
    image(ax,'1fle-interface-detail.png',xlim=(240,970),ylim=(735,260))
    metadata=next(item for item in R['rendering'] if item['mode']=='interface')['annotations']
    labels={('I',24):('ALA24 (P1)',(885,585)),('I',22):('ARG22',(550,325)),('E',193):('GLY193',(885,375)),('E',216):('VAL216',(305,705))}
    for residue in metadata['residues']:
        label,destination=labels[(residue['chain'],residue['resi'])]
        source=residue['screen']
        ax.annotate(f"{residue['chain']} · {label}",xy=(source['x'],source['y']),xytext=destination,
                    fontsize=8.5,color=TEAL if residue['chain']=='E' else CORAL,ha='center',va='center',
                    bbox={'facecolor':'white','edgecolor':'none','pad':2},
                    arrowprops={'arrowstyle':'-','color':'#919c9d','lw':.75})
    for contact in metadata['distances']:
        start,end=contact['start'],contact['end']
        ax.plot([start['x'],end['x']],[start['y'],end['y']],color=INK,ls=(0,(3,2)),lw=1)
        midpoint=((start['x']+end['x'])/2,(start['y']+end['y'])/2)
        destination=(820,465) if contact['I_residue']=='24' else (340,515)
        ax.annotate(f"{contact['distance_A']:.2f} Å",xy=midpoint,xytext=destination,ha='center',va='center',fontsize=10,
                    bbox={'facecolor':'white','edgecolor':'none','pad':2},arrowprops={'arrowstyle':'-','color':'#919c9d','lw':.75})


def contact_matrix(ax,fig,full=False):
    distances=A['distances'];ir=A['I_residues'];er=A['E_residues']
    rows=np.arange(len(ir)) if full else np.where((distances<4).any(axis=1))[0]
    cols=np.arange(len(er)) if full else np.where((distances<4).any(axis=0))[0]
    d=distances[np.ix_(rows,cols)]
    im=ax.imshow(d,cmap=contact_cmap,vmin=2,vmax=6,aspect='auto',interpolation='nearest')
    if not full:
        ax.set_xticks(range(len(cols)),er[cols],rotation=60,ha='right',fontsize=6.5)
        ax.set_yticks(range(len(rows)),ir[rows],fontsize=7)
        for i,j in np.argwhere(d<4):
            ax.text(j,i,f'{d[i,j]:.2f}',ha='center',va='center',fontsize=5,color='white' if d[i,j]<3.6 else INK)
    else:
        ax.set_xticks(np.arange(0,len(er),20),er[::20],fontsize=8)
        ax.set_yticks(np.arange(0,len(ir),5),ir[::5],fontsize=8)
    ax.set_xlabel('Porcine elastase · chain E · author residue');ax.set_ylabel('Human Elafin · chain I · author residue')
    cb=fig.colorbar(im,ax=ax,fraction=.035,pad=.025,extend='both');cb.set_label('Minimum heavy-atom distance (Å)',fontsize=8)
    cb.ax.tick_params(labelsize=7)


def figure_interface():
    fig,axes=plt.subplots(2,2,figsize=(13.5,10.7),gridspec_kw={'height_ratios':[1,.95],'width_ratios':[1.15,1]})
    fig.subplots_adjust(left=.08,right=.94,top=.86,bottom=.125,hspace=.43,wspace=.34)
    fig.suptitle('Elafin at the interface: from deposited coordinates to contacts',x=.055,ha='left',fontsize=17,weight='bold',y=.97)
    fig.text(.055,.925,'PDB 1FLE  |  X-ray diffraction, 1.90 Å  |  human Elafin + porcine pancreatic elastase',fontsize=11,color='#64737a')
    ax=axes[0,0];image(ax,'1fle-cartoon.png',xlim=(250,970),ylim=(895,125));panel(ax,'a','Experimental reference complex')
    ax.legend(handles=[Line2D([],[],color=CORAL,lw=3,label='Human Elafin · chain I'),Line2D([],[],color=TEAL,lw=3,label='Porcine elastase · chain E')],loc='upper left',bbox_to_anchor=(0,-.025),frameon=False,fontsize=8,ncol=2)
    ax.text(.98,-.135,'Cartoon from deposited HELIX / SHEET records',transform=ax.transAxes,ha='right',fontsize=7.5,color='#64737a')
    ax=axes[0,1];interface_inset(ax);panel(ax,'b','Reactive-site contacts: selected residues')
    ax.text(.5,-.015,'Distances: ALA24 O—GLY193 N; ARG22 N—VAL216 O',ha='center',transform=ax.transAxes,fontsize=7.7,color='#64737a')
    ax=axes[1,0];contact_matrix(ax,fig);panel(ax,'c','Interface contact map (<4 Å residue set)')
    ax=axes[1,1];thresholds=np.array(S['complex']['thresholds'])
    for col,color,label in [(1,TEAL,'Residue pairs'),(2,CORAL,'Elafin residues'),(3,GOLD,'Elastase residues')]:
        ax.plot(thresholds[:,0],thresholds[:,col],color=color,marker='o',ms=3.5,lw=1.8,label=label)
    ax.axvline(4,color='#7e898e',ls='--',lw=.85);ax.scatter([4],[40],color=TEAL,s=48,zorder=3)
    ax.annotate('40 pairs at 4 Å',xy=(4,40),xytext=(4.45,47),arrowprops={'arrowstyle':'-','color':INK,'lw':.8},fontsize=9)
    ax.set_xlabel('Contact cutoff (Å; strict <)');ax.set_ylabel('Count');ax.set_xlim(3,6);ax.set_ylim(0,100);ax.set_xticks([3,3.5,4,4.5,5,5.5,6])
    ax.grid(axis='y',color='#e6eaea',lw=.7);ax.set_axisbelow(True);ax.legend(frameon=False,fontsize=8,loc='upper left');panel(ax,'d','Cutoff sensitivity of interface size')
    fig.text(.055,.042,'Elafin 47/57 residues resolved (11–57). Distances exclude waters, HETATM and hydrogen atoms; no symmetry mates.\nGeometric proximity does not assign hydrogen bonds or affinity. This is a porcine enzyme reference, not human NE docking.',fontsize=9,color='#64737a',linespacing=1.6)
    save(fig,'structure-interface')


def figure_fullmap():
    fig,ax=plt.subplots(figsize=(15,5.7));fig.subplots_adjust(left=.075,right=.94,top=.8,bottom=.16)
    fig.suptitle('All cross-chain residue distances in the 1FLE crystal complex',x=.06,ha='left',fontsize=16,weight='bold',y=.95)
    fig.text(.06,.865,'47 human Elafin residues × 240 porcine elastase residues; author numbering and insertion codes retained',fontsize=10,color='#64737a')
    contact_matrix(ax,fig,full=True)
    fig.text(.06,.035,'White cells are ≥6 Å. The complete, uncapped 47 × 240 matrix is available as CSV. Values below 2 Å use the darkest endpoint color.',fontsize=9,color='#64737a')
    save(fig,'structure-full-distance-map')


figure_nmr();figure_interface();figure_fullmap()
captions={
 'structure-nmr-ensemble':{'title':'How variable are deposited Elafin conformers?',
 'caption':'(a) Eleven deposited 2REL Cα traces after generalized Procrustes alignment on mature residues 9–57, the UniProt WAP domain. Gold marks residues 1–8. (b) Pairwise RMSD after separate optimal Kabsch fits over all 57 Cα atoms. (c) Per-residue root-mean-square distance to the aligned ensemble mean, comparing full-length and WAP-domain fits. (d) The same 55 model pairs evaluated over either fitted residue set. Horizontal lines mark medians. These are structural-ensemble statistics, not MD-RMSF, kinetic dynamics, statistical confidence intervals or independent biological replicates.',
 'takeaway':f"Mean pairwise RMSD is {S['nmr']['pairwise_full_A']['mean']:.2f} Å over residues 1–57 and {S['nmr']['pairwise_WAP_9_57_A']['mean']:.2f} Å over WAP residues 9–57. Under WAP fitting, the mean N-terminal dispersion (1–8) is {S['nmr']['mean_dispersion_WAP_fit_N_terminal_1_8_A']:.2f} Å versus {S['nmr']['mean_dispersion_WAP_fit_domain_9_57_A']:.2f} Å in the domain; fitting and residue choice must therefore be stated when comparing structures."},
 'structure-interface':{'title':'Where does Elafin contact its reference elastase?',
 'caption':'(a) Published 1FLE X-ray complex, human Elafin chain I and porcine pancreatic elastase chain E, shown as a cartoon from deposited secondary-structure records. (b) Four selected residues in ball-and-stick representation; dashed lines show atom-to-atom geometric distances (ALA24 O–GLY193 N and ARG22 N–VAL216 O). Other residues are omitted for clarity. Carbon colors follow the chains, oxygen is red and nitrogen blue. (c) The 14 Elafin and 22 elastase residues participating in at least one <4 Å contact; cells show minimum protein heavy-atom distances, with values <4 Å annotated. (d) Contact counts across cutoffs 3.0–6.0 Å. Elafin residues 1–10 have no coordinates. Waters, non-protein records and hydrogens are excluded; crystal symmetry mates are not included. Geometric contacts alone do not establish hydrogen bonds, affinity or efficacy.',
 'takeaway':'At the declared <4 Å cutoff, 40 residue pairs involve 14 Elafin and 22 elastase residues. The count rises from 6 pairs at 3 Å to 90 pairs at 6 Å, showing why cutoff choice must accompany interface claims. The enzyme is porcine pancreatic elastase, not human neutrophil elastase; the structure is a reference for hypotheses and future experiments.'},
 'structure-full-distance-map':{'title':'Complete cross-chain distance matrix',
 'caption':'All 47 × 240 cross-chain residue combinations in deposited 1FLE. Every value is the shortest distance between the two residues’ protein heavy atoms. The color scale saturates outside 2–6 Å; the CSV retains all uncapped numeric values and author insertion codes.'}
}
(OUT/'structure-figure-captions.json').write_text(json.dumps(captions,indent=2,ensure_ascii=False),encoding='utf8')
print('Wrote 3 scientific figure groups: PNG (300 dpi), SVG, PDF; captions and interpretation JSON.')
