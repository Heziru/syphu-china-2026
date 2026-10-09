"""Reproducible, UNCALIBRATED mathematical research scenarios for SYPHU-China.

Run from any directory: python scripts/drylab/research_models.py
Requires existing numpy, scipy, matplotlib. No clinical or fitted parameters.
Outputs are written only into this repository. Seed and ranges are recorded.
The ROS input drives a proposed PspA-related support state, NEVER Elafin q.
Elafin is expressed intracellularly. q is an assumed effective extracellular
release coefficient, not a validated secretion system or production measurement.
"""
from pathlib import Path
import argparse
import csv
import hashlib
import json
import platform
import shutil
import time

import numpy as np
import scipy
from scipy.integrate import solve_ivp
from scipy.linalg import eigh_tridiagonal, solve_banded
from scipy.stats import qmc, rankdata
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.colors import LinearSegmentedColormap, ListedColormap

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "public/assets/dry-lab/research"
RAW = ROOT / "outputs/dry-lab-research"
SEED = 20261008
P = dict(rE=1., rR=.8, beta=.25, washE=.1, washR=.1, stress=.35,
         gamma=2., supportRate=.8, q=.3, loss=.5, alpha=.8)
INITIAL = np.array([.08, .8, 0., 0.])
RANGES = dict(alpha=(.35, 1.25), beta=(.1, .6), stress=(.2, .5),
              gamma=(0., 4.), washE=(.05, .2), q=(.15, .6),
              loss=(.25, 1.), supportRate=(.4, 1.6))
GREEN, SAGE, PEACH, GOLD, INK = "#245949", "#8caf9d", "#d78d77", "#c5a04c", "#173e35"
CMAP = LinearSegmentedColormap.from_list("sage", ["#fcfaf3", "#c3d8c6", "#629483", "#164c43"])
plt.rcParams.update({"font.family": "DejaVu Sans", "font.size": 10, "axes.labelcolor": INK,
                     "text.color": INK, "axes.edgecolor": "#b0c4b8", "axes.spines.top": False,
                     "axes.spines.right": False, "axes.titleweight": "bold", "figure.facecolor": "white",
                     "savefig.facecolor": "white", "svg.fonttype": "none", "pdf.fonttype": 42})


def write_json(path, obj):
    path.write_text(json.dumps(obj, indent=2, ensure_ascii=False, allow_nan=False), encoding="utf-8")


def write_csv(name, headers, rows):
    with (OUT / name).open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(headers)
        w.writerows(rows)


def savefig(fig, stem):
    fig.savefig(OUT / f"{stem}.png", dpi=190, bbox_inches="tight")
    fig.savefig(OUT / f"{stem}.svg", bbox_inches="tight")
    fig.savefig(OUT / f"{stem}.pdf", bbox_inches="tight")
    plt.close(fig)


def label(ax, letter, title):
    ax.set_title(f"{letter}   {title}", loc="left", fontsize=11, pad=13)
    ax.grid(alpha=.13)


def eco_rhs(z, p, signal):
    x, y, s, L = np.moveaxis(z, -1, 0)
    return np.stack((x*(p["rE"]*(1-x-p["alpha"]*y)-p["washE"]-p["stress"]/(1+p["gamma"]*s)),
                     y*(p["rR"]*(1-y-p["beta"]*x)-p["washR"]),
                     p["supportRate"]*(signal-s), p["q"]*x-p["loss"]*L), axis=-1)


def eco_sim(p=None, dt=.02, end=24., control=False, initial=None, permanent=False):
    """Vectorized RK4. Exact step alignment at tau=8 prevents pulse ambiguity."""
    p = P if p is None else p
    n = round(end/dt)
    size = np.broadcast_arrays(*[np.asarray(v) for v in p.values()])[0].shape
    z = np.broadcast_to(INITIAL if initial is None else initial, size+(4,)).copy()
    history = np.empty((n+1,)+z.shape)
    history[0] = z
    t = np.arange(n+1)*dt
    for i in range(n):
        signal = 0. if control else float(permanent or t[i] < 8-1e-10)
        k1 = eco_rhs(z, p, signal)
        k2 = eco_rhs(z+dt*k1/2, p, signal)
        k3 = eco_rhs(z+dt*k2/2, p, signal)
        k4 = eco_rhs(z+dt*k3, p, signal)
        z = z+dt*(k1+2*k2+2*k3+k4)/6
        history[i+1] = z
    assert np.isfinite(history).all() and history.min() >= -1e-12
    return t, history


def equilibrium(p, support=1.):
    a = 1-(p["washE"]+p["stress"]/(1+p["gamma"]*support))/p["rE"]
    b = 1-p["washR"]/p["rR"]
    invasion = p["rE"]*(a-p["alpha"]*b)
    resident_invasion = p["rR"]*(b-p["beta"]*a)
    det = 1-p["alpha"]*p["beta"]
    xy = np.array([(a-p["alpha"]*b)/det, (b-p["beta"]*a)/det])
    return a, b, invasion, resident_invasion, xy


def analytic_profile(x, Da, Bi, j=1.):
    if Da == 0:
        if Bi <= 0:
            raise ValueError("No finite steady state if Da=Bi=0 and j>0")
        return j*(1-x+1/Bi)
    s = np.sqrt(Da)
    return j*(np.cosh(s*(1-x))+(Bi/s)*np.sinh(s*(1-x)))/(s*np.sinh(s)+Bi*np.cosh(s))


def transport_operator(n, Da=1., Bi=1., delta=1.):
    """Cell-centered finite volume; Robin boundary includes the half-cell resistance."""
    dx = 1/n
    g = Bi/(1+Bi*dx/2)
    diag = np.full(n, -2/dx**2-Da)
    diag[0] = -1/dx**2-Da
    diag[-1] = -1/dx**2-Da-g/dx
    off = np.full(n-1, 1/dx**2)
    return delta*diag, delta*off, g


def tri_matvec(diag, off, c):
    y = diag*c
    y[:-1] += off*c[1:]
    y[1:] += off*c[:-1]
    return y


def transport(n, dt, j, Da=1., Bi=1., delta=1., initial=None):
    """Crank-Nicolson with endpoint trapezoidal source and conservative fluxes."""
    diag, off, g = transport_operator(n, Da, Bi, delta)
    ab = np.zeros((3, n))
    ab[0, 1:] = -dt*off/2
    ab[1] = 1-dt*diag/2
    ab[2, :-1] = -dt*off/2
    c = np.zeros(n) if initial is None else np.array(initial, dtype=float, copy=True)
    rows = [c.copy()]
    residual = []
    for old_j, new_j in zip(j, j[1:]):
        rhs = c+dt*tri_matvec(diag, off, c)/2
        rhs[0] += dt*delta*n*(old_j+new_j)/2
        nxt = solve_banded((1, 1), ab, rhs, check_finite=False)
        # Independent per-step conservation check in boundary-flux form.
        actual = (nxt.sum()-c.sum())/n
        predicted = dt*delta*((old_j+new_j)/2 - g*(nxt[-1]+c[-1])/2 - Da*(nxt.sum()+c.sum())/(2*n))
        residual.append(actual-predicted)
        c = nxt
        rows.append(c.copy())
    history = np.asarray(rows)
    assert np.isfinite(history).all() and history.min() >= -1e-10
    return history, g*history[:, -1], float(np.max(np.abs(residual)))


def sensitivity(samples, outputs, boot=256):
    """Rank partial correlation with percentile bootstrap over assumed scenarios.
    These are not variance-based Sobol indices or experimental confidence bounds.
    """
    def prcc(x, y):
        rx, ry = rankdata(x, axis=0), rankdata(y, axis=0)
        res = np.zeros((x.shape[1], y.shape[1]))
        for k in range(x.shape[1]):
            others = np.column_stack((np.ones(len(x)), np.delete(rx, k, axis=1)))
            ex = rx[:, k]-others@np.linalg.lstsq(others, rx[:, k], rcond=None)[0]
            ey = ry-others@np.linalg.lstsq(others, ry, rcond=None)[0]
            res[k] = (ex[:, None]*ey).sum(0)/np.sqrt((ex**2).sum()*(ey**2).sum(0))
        return res
    actual = prcc(samples, outputs)
    rng = np.random.default_rng(SEED+1)
    dist = []
    for _ in range(boot):
        ids = rng.integers(0, len(samples), len(samples))
        dist.append(prcc(samples[ids], outputs[ids]))
    return actual, np.quantile(dist, [.025, .975], axis=0)


def ecological_analysis(results):
    t, base = eco_sim()
    _, control = eco_sim(control=True)
    a, b, lam, lam_r, eq = equilibrium(P)
    G = P["rE"]*(1-P["alpha"]*b)-P["washE"]
    pcrit = (P["stress"]/G-1)/P["gamma"]
    p8 = 1-np.exp(-8*P["supportRate"])
    crossing = 8+np.log(p8/pcrit)/P["supportRate"]
    # Validate 100 independent constant-support equilibria with another integrator.
    design = qmc.LatinHypercube(3, seed=SEED+2).random(100)
    validation = []
    critical_extension = []
    for aa, gg, ss in design:
        pp = dict(P, alpha=.2+1.1*aa, gamma=4*gg)
        support = .05+.95*ss
        aa0, bb, le, lr, xy = equilibrium(pp, support)
        target = xy if le > 0 else np.array([0., bb])
        def f(_t, z):
            x, y = z
            return [pp["rE"]*x*(aa0-x-pp["alpha"]*y), pp["rR"]*y*(bb-y-pp["beta"]*x)]
        sol = solve_ivp(f, (0, 1600), [.08, .8], method="DOP853", rtol=2e-10, atol=2e-12)
        error = float(np.max(np.abs(sol.y[:, -1]-target)))
        validation.append([pp["alpha"], pp["gamma"], support, le, *target, *sol.y[:, -1], error])
        if abs(le) < .01:
            extended = solve_ivp(f, (1600, 24000), sol.y[:, -1], method="DOP853", rtol=2e-10, atol=2e-12)
            extended_error = float(np.max(np.abs(extended.y[:, -1]-target)))
            critical_extension.append([pp["alpha"], pp["gamma"], support, le, error, extended_error])
    write_csv("equilibrium-validation.csv", ["alpha", "gamma", "support", "invasion_eigenvalue", "analytic_x", "analytic_y", "integrated_x", "integrated_y", "max_absolute_error"], validation)
    write_csv("critical-slowing-validation.csv", ["alpha", "gamma", "support", "invasion_eigenvalue", "error_at_tau1600", "error_at_tau24000"], critical_extension)
    # Near the transcritical boundary convergence is slow: record rather than hide it.
    near = [row for row in validation if abs(row[3]) < .01]
    away = [row for row in validation if abs(row[3]) >= .01]
    assert max(row[-1] for row in away) < 2e-7
    assert max(row[-1] for row in critical_extension) < 2e-7
    ode_steps = []
    fine_t, fine = eco_sim(dt=.0025)
    for dt in (.08, .04, .02, .01):
        ti, zz = eco_sim(dt=dt)
        ref = fine[::round(dt/.0025)]
        ode_steps.append([dt, float(np.max(np.abs(zz-ref)))])
    write_csv("ode-convergence.csv", ["dt", "maximum_state_error_vs_dt_0p0025"], ode_steps)
    _, absent = eco_sim(initial=[0, .8, 0, 0])
    _, no_q = eco_sim(p=dict(P, q=0))
    _, gp = eco_sim(p=dict(P, gamma=0))
    _, gc = eco_sim(p=dict(P, gamma=0), control=True)
    assert np.max(np.abs(absent[:, [0, 3]])) == 0
    assert np.max(np.abs(no_q[:, 3])) == 0
    assert np.max(np.abs(gp[:, [0, 1, 3]]-gc[:, [0, 1, 3]])) == 0
    assert ode_steps[-1][1] < ode_steps[0][1]/1000
    # Positive quadrant is invariant analytically; sampled trajectories also checked.
    alpha = np.linspace(.15, 1.4, 161)
    gamma = np.linspace(0, 6, 161)
    A, Gm = np.meshgrid(alpha, gamma)
    am = 1-(P["washE"]+P["stress"]/(1+Gm))/P["rE"]
    inv = P["rE"]*(am-A*b)
    xeq = np.maximum(0, (am-A*b)/(1-A*P["beta"]))
    write_csv("invasion-plane.csv", ["alpha", "gamma", "invasion_eigenvalue", "stable_engineered_equilibrium"], zip(A.ravel(), Gm.ravel(), inv.ravel(), xeq.ravel()))
    ap, bp = np.meshgrid(np.linspace(0, 2, 181), np.linspace(0, 3, 181))
    le, lr = a-ap*b, b-bp*a
    regimes = np.where(le > 0, np.where(lr > 0, 0, 1), np.where(lr > 0, 2, 3))
    write_csv("competition-regimes.csv", ["alpha", "beta", "regime_0_coexist_1_EcN_2_resident_3_priority"], zip(ap.ravel(), bp.ravel(), regimes.ravel()))
    fig, ax = plt.subplots(2, 2, figsize=(13, 9), constrained_layout=True)
    h = ax[0,0].pcolormesh(A, Gm, inv, shading="auto", cmap="BrBG", vmin=-.75, vmax=.75, rasterized=True)
    ax[0,0].contour(A, Gm, inv, levels=[0], colors=INK, linewidths=1.8)
    ax[0,0].scatter([P["alpha"]], [P["gamma"]], c=PEACH, edgecolors=INK, zorder=5)
    ax[0,0].set(xlabel="Resident effect on EcN, α", ylabel="Assumed support strength, γ")
    label(ax[0,0], "A", "A threshold, not a universal survival benefit")
    fig.colorbar(h, ax=ax[0,0], label="Rare-EcN growth rate λinv; p = 1")
    h = ax[0,1].pcolormesh(A, Gm, xeq, cmap=CMAP, shading="auto", vmin=0, vmax=.85, rasterized=True)
    ax[0,1].contour(A, Gm, inv, [0], colors=INK, linewidths=1)
    ax[0,1].set(xlabel="Resident effect on EcN, α", ylabel="Assumed support strength, γ")
    label(ax[0,1], "B", "Analytic long-time population")
    fig.colorbar(h, ax=ax[0,1], label="Normalized EcN equilibrium x*; p = 1")
    cmap = ListedColormap(["#b8d2bd", "#447a68", "#edc3af", "#cfb67b"])
    h = ax[1,0].pcolormesh(ap, bp, regimes, shading="auto", cmap=cmap, vmin=-.5, vmax=3.5, rasterized=True)
    ax[1,0].axvline(a/b, color=INK, lw=1)
    ax[1,0].axhline(b/a, color=INK, lw=1)
    for xx, yy, txt in [(.35,.5,"Coexistence"),(.4,2.3,"EcN only"),(1.4,.5,"Resident only"),(1.45,2.35,"Priority effect")]:
        ax[1,0].text(xx, yy, txt, ha="center", fontsize=9, bbox=dict(facecolor="white", alpha=.75, edgecolor="none", pad=3))
    ax[1,0].set(xlabel="Resident effect on EcN, α", ylabel="EcN effect on residents, β")
    label(ax[1,0], "C", "Four regimes from reciprocal competition")
    ax[1,1].plot(t, base[:,0], color=GREEN, label="EcN / proposed support")
    ax[1,1].plot(t, control[:,0], color=GREEN, ls="--", label="EcN / support off")
    ax[1,1].plot(t, base[:,2], color=GOLD, label="Support p")
    ax[1,1].axhline(pcrit, color=PEACH, ls=":", label="Rare-invasion threshold pc")
    ax[1,1].axvline(8, color=INK, lw=.8, ls="--")
    ax[1,1].axvline(crossing, color=PEACH, lw=.8, ls=":")
    ax[1,1].set(xlabel="Dimensionless model time τ", ylabel="Normalized states", ylim=(0,1.03), xlim=(0,24))
    ax[1,1].legend(fontsize=8, loc="upper right")
    label(ax[1,1], "D", "A pulse cannot be read as a steady state")
    fig.suptitle("Ecological mechanisms under explicit assumptions", fontsize=16, fontweight="bold")
    savefig(fig, "01-ecological-landscape")
    # LHS ensemble and global rank sensitivity, all parameter ranges explicitly assumed.
    sample = qmc.scale(qmc.LatinHypercube(len(RANGES), seed=SEED).random(512),
                       [v[0] for v in RANGES.values()], [v[1] for v in RANGES.values()])
    pp = dict(P, **dict(zip(RANGES, sample.T)))
    _, ens = eco_sim(p=pp)
    _, ens_control = eco_sim(p=pp, control=True)
    measures = np.column_stack((np.trapezoid(ens[:,:,0], t, axis=0), np.trapezoid(ens[:,:,3], t, axis=0), ens[-1,:,0]))
    control_measures = np.column_stack((np.trapezoid(ens_control[:,:,0], t, axis=0), np.trapezoid(ens_control[:,:,3], t, axis=0), ens_control[-1,:,0]))
    output_names = ["EcN_AUC_0_24", "relative_Elafin_AUC_0_24", "EcN_at_24"]
    write_csv("parameter-ensemble.csv", [*RANGES, *output_names, *[f"control_{x}" for x in output_names]], np.column_stack((sample, measures, control_measures)))
    corr, bounds = sensitivity(sample, measures)
    write_csv("global-rank-sensitivity.csv", ["parameter", "output", "PRCC", "bootstrap_2p5", "bootstrap_97p5"],
              [[name, out, corr[i,j], bounds[0,i,j], bounds[1,i,j]] for i,name in enumerate(RANGES) for j,out in enumerate(output_names)])
    quant = np.quantile(ens, [.05,.5,.95], axis=1)
    qc = np.quantile(ens_control, [.05,.5,.95], axis=1)
    fig, ax = plt.subplots(2,2, figsize=(13,9), constrained_layout=True)
    for k, (state,title) in enumerate([(0,"Population uncertainty is wide"),(3,"Assumed release follows population")]):
        aa = ax[0,k]
        aa.fill_between(t, quant[0,:,state],quant[2,:,state],color=SAGE,alpha=.3,label="5–95% scenario envelope")
        aa.plot(t,quant[1,:,state],color=GREEN,label="Scenario median / support")
        aa.plot(t,qc[1,:,state],color=PEACH,ls="--",label="Matched median / support off")
        aa.axvline(8,color=INK,ls=":",lw=.8)
        aa.set(xlabel="Dimensionless model time τ",ylabel="Normalized EcN" if state==0 else "Relative Elafin L",xlim=(0,24),ylim=(0, .55 if state==0 else .6))
        aa.legend(fontsize=8)
        label(aa, chr(65+k), title)
    order=np.argsort(corr[:,1])
    yy=np.arange(len(order))
    for j,color,shift in [(1,GREEN,-.1),(2,PEACH,.1)]:
        ax[1,0].errorbar(corr[order,j], yy+shift, xerr=[corr[order,j]-bounds[0,order,j],bounds[1,order,j]-corr[order,j]], fmt="o",color=color,ms=4,capsize=2,label=output_names[j])
    ax[1,0].set_yticks(yy,list(np.array(list(RANGES))[order]))
    ax[1,0].axvline(0,color=INK,lw=.8)
    ax[1,0].set(xlabel="Partial rank correlation (PRCC)",xlim=(-1.05,1.05))
    ax[1,0].legend(fontsize=8,loc="lower right")
    label(ax[1,0], "C", "Global monotonic associations, not causal effects")
    h=ax[1,1].scatter(sample[:,0], measures[:,2],c=sample[:,3],s=18,cmap=CMAP,alpha=.85,edgecolors="none",rasterized=True)
    ax[1,1].set(xlabel="Resident effect on EcN, α",ylabel="Normalized EcN at τ = 24",yscale="log")
    fig.colorbar(h,ax=ax[1,1],label="Assumed support strength γ")
    label(ax[1,1], "D", "Parameter interactions resist one-number claims")
    fig.suptitle("512 assumed parameter sets • independent uniform ranges • fixed seed",fontsize=15,fontweight="bold")
    savefig(fig,"02-uncertainty-sensitivity")
    results["ecology"]={"parameters":P,"initial":INITIAL.tolist(),"allNumericalParameters":"assumed, not calibrated",
        "steadySupport":1,"residentOnlyPopulation":b,"constantSupportInvasionRate":float(lam),
        "constantSupportEquilibrium":eq.tolist(),"supportThreshold":pcrit,
        "instantaneousRareInvasionThresholdCrossingAfterSignalOff":crossing,
        "thresholdInterpretation":"Criterion is for a rare invader at the resident-only equilibrium; not a finite-population collapse or clearance time.",
        "constantSupportValidation":{"count":100,"integrationHorizon":1600,"maxErrorAwayFromBoundary":max(row[-1] for row in away),"nearBoundaryCount":len(near),"maxErrorAll":max(row[-1] for row in validation),"criticalExtensionHorizon":24000,"maxErrorAfterCriticalExtension":max(row[-1] for row in critical_extension)},
        "convergence":ode_steps,"invariantControlsPassed":True,"ensemble":{"n":512,"seed":SEED,"distribution":"independent uniform, Latin hypercube","ranges":RANGES,"bootstrapReplicates":256,"outputNames":output_names,"outputQuantiles":np.quantile(measures,[.05,.5,.95],axis=0).tolist(),"PRCC":corr.tolist(),"PRCCBootstrap95":bounds.tolist()},
        "baseline":{"withSupport":{"x24":float(base[-1,0]),"L_AUC":float(np.trapezoid(base[:,3],t))},"withoutSupport":{"x24":float(control[-1,0]),"L_AUC":float(np.trapezoid(control[:,3],t))}}}
    write_csv("baseline-ecology.csv",["tau","EcN","residents","support","relative_Elafin","control_EcN","control_residents","control_support","control_Elafin"],np.column_stack((t,base,control)))
    return t,base,control


def spatial_analysis(results, t, base, control):
    j=P["q"]*base[:,0]
    jc=P["q"]*control[:,0]
    n,dt,Da,Bi,delta=120,.02,1.,1.,1.
    xi=(np.arange(n)+.5)/n
    c,flux,mass_error=transport(n,dt,j,Da,Bi,delta)
    cc,fluxc,mass_error_c=transport(n,dt,jc,Da,Bi,delta)
    source_total=float(np.trapezoid(j,t))
    out_total=float(np.trapezoid(flux,t))
    loss_total=float(Da*np.trapezoid(c.mean(axis=1),t))
    stored=float(c[-1].mean()/delta)
    balance=source_total-out_total-loss_total-stored
    assert abs(balance)<1e-10
    write_csv("coupled-spatial-timeseries.csv",["tau","source_flux_qx","outflow_flux","stored_spatial_mass","control_source_flux","control_outflow_flux","control_stored_spatial_mass"],np.column_stack((t,j,flux,c.mean(axis=1),jc,fluxc,cc.mean(axis=1))))
    np.savez_compressed(RAW/"spatial-full-array.npz",tau=t,xi=xi,concentration=c,control_concentration=cc,source=j,outflow=flux)
    write_csv("spatial-profiles.csv",["tau","xi","relative_concentration","control_relative_concentration"],[[t[k],xi[i],c[k,i],cc[k,i]] for k in range(0,len(t),10) for i in range(n)])
    fig,ax=plt.subplots(2,2,figsize=(13,9),constrained_layout=True)
    h=ax[0,0].pcolormesh(t,xi,c.T,shading="auto",cmap=CMAP,rasterized=True)
    ax[0,0].axvline(8,color=PEACH,ls="--",lw=1)
    ax[0,0].set(xlabel="Dimensionless model time τ",ylabel="Normalized distance ξ")
    label(ax[0,0],"A","Population-dependent release creates a moving profile")
    fig.colorbar(h,ax=ax[0,0],label="Relative concentration c")
    colors=["#abcbbb",GREEN,GOLD,PEACH,"#667b9a"]
    for tt,col in zip([1,4,8,12,24],colors):
        ax[0,1].plot(xi,c[round(tt/dt)],color=col,lw=2,label=f"τ = {tt}")
    ax[0,1].set(xlabel="Normalized distance ξ",ylabel="Relative concentration c",xlim=(0,1),ylim=(0,c.max()*1.07))
    ax[0,1].legend(fontsize=8)
    label(ax[0,1],"B","Separate source abundance from transport")
    ax[1,0].plot(t,j,color=GREEN,label="Source j = q·EcN")
    ax[1,0].plot(t,flux,color=PEACH,label="Robin-boundary outflow")
    ax[1,0].plot(t,fluxc,color=PEACH,ls="--",label="Outflow / support off")
    ax[1,0].axvline(8,color=INK,ls=":",lw=.8)
    ax[1,0].set(xlabel="Dimensionless model time τ",ylabel="Relative flux",xlim=(0,24),ylim=(0,j.max()*1.13))
    ax[1,0].legend(fontsize=8)
    label(ax[1,0],"C","The boundary flux is a transport readout")
    vals=[out_total,loss_total,stored]
    ax[1,1].bar(["Outflow","In-domain loss","Remaining mass / δ"],vals,color=[GREEN,PEACH,SAGE],width=.6)
    for i,v in enumerate(vals): ax[1,1].text(i,v+.012,f"{v:.4f}",ha="center",fontsize=10)
    ax[1,1].axhline(source_total,color=INK,ls="--",label=f"Integrated source = {source_total:.4f}")
    ax[1,1].set(ylabel="Integrated relative amount",ylim=(0,source_total*1.15))
    ax[1,1].tick_params(axis="x",labelsize=9)
    ax[1,1].legend(fontsize=8)
    label(ax[1,1],"D","Conservation closes the numerical bookkeeping")
    fig.suptitle("One-dimensional Elafin transport • Da = Bi = δ = 1 (assumed)",fontsize=15,fontweight="bold")
    savefig(fig,"03-spatial-transport")
    # Closed-form parameter surface; no inferred physical tissue dimensions.
    da=np.geomspace(.03,30,101)
    bi=np.geomspace(.03,30,101)
    DA,BI=np.meshgrid(da,bi)
    s=np.sqrt(DA)
    trans=BI/(s*np.sinh(s)+BI*np.cosh(s))
    wall=1/(s*np.sinh(s)+BI*np.cosh(s))
    write_csv("transport-parameter-surface.csv",["Da","Bi","unit_source_boundary_concentration","steady_outflow_fraction"],zip(DA.ravel(),BI.ravel(),wall.ravel(),trans.ravel()))
    fig=plt.figure(figsize=(13,9),constrained_layout=True)
    ax1=fig.add_subplot(221)
    xx=np.linspace(0,1,200)
    for d,col in zip([.1,1,5,15],[SAGE,GREEN,GOLD,PEACH]):ax1.plot(xx,analytic_profile(xx,d,1),color=col,lw=2,label=f"Da = {d}")
    ax1.set(xlabel="Normalized distance ξ",ylabel="Steady relative c / unit source",xlim=(0,1),ylim=(0,2.05))
    ax1.legend(fontsize=8)
    label(ax1,"A","Clearance shapes the steady profile; Bi = 1")
    ax2=fig.add_subplot(222,projection="3d")
    ax2.plot_surface(np.log10(DA),np.log10(BI),trans,cmap=CMAP,linewidth=0,antialiased=True,rasterized=True,rcount=60,ccount=60)
    ax2.set(xlabel="log₁₀ Da",ylabel="log₁₀ Bi",zlabel="Outflow / source",zlim=(0,1))
    ax2.view_init(26,-132)
    ax2.set_title("B   Analytic transport fraction, not efficacy",loc="left",fontweight="bold",fontsize=11,pad=13)
    ax3=fig.add_subplot(223)
    h=ax3.pcolormesh(DA,BI,trans,cmap=CMAP,vmin=0,vmax=1,shading="auto",rasterized=True)
    cs=ax3.contour(DA,BI,trans,levels=[.1,.3,.5,.8],colors=INK,linewidths=.8)
    ax3.clabel(cs,fmt="%.1f",fontsize=8)
    ax3.set(xscale="log",yscale="log",xlabel="Da = clearance / diffusion",ylabel="Bi = boundary exchange / diffusion")
    label(ax3,"C","Dimensionless groups identify transport regimes")
    fig.colorbar(h,ax=ax3,label="Steady outflow fraction")
    ax4=fig.add_subplot(224)
    tt=np.arange(0,6.001,.01)
    for d,col in zip([.2,1,5],[SAGE,GREEN,PEACH]):
        ch,fl,_=transport(80,.01,np.ones(len(tt)),Da=1,Bi=1,delta=d)
        ax4.plot(tt,fl,color=col,label=f"δ = {d}")
    ax4.axhline(float(1/(np.sinh(1)+np.cosh(1))),color=INK,ls=":",label="Shared steady outflow")
    ax4.set(xlabel="Dimensionless ecological time τ",ylabel="Outflow / constant unit source",xlim=(0,6),ylim=(0,.42))
    ax4.legend(fontsize=8)
    label(ax4,"D","Time-scale ratio changes the transient, not steady state")
    fig.suptitle("A closed-form benchmark across 10,201 transport conditions",fontsize=15,fontweight="bold")
    savefig(fig,"04-transport-landscape")
    # Spatial convergence against analytic continuum solution at FV cell centers.
    grids=[]
    for nn in (15,30,60,120,240,480):
        diag,off,g=transport_operator(nn)
        ab=np.zeros((3,nn));ab[0,1:]=off;ab[1]=diag;ab[2,:-1]=off
        rhs=np.zeros(nn);rhs[0]=-nn
        steady=solve_banded((1,1),ab,rhs)
        exact=analytic_profile((np.arange(nn)+.5)/nn,1,1)
        err=float(np.max(np.abs(steady-exact)))
        ferr=abs(g*steady[-1]-np.exp(-1))
        grids.append([nn,1/nn,err,ferr])
    orders=[np.log(grids[i-1][2]/grids[i][2])/np.log(2) for i in range(1,len(grids))]
    assert min(orders)>1.9
    # Benchmark the parameter plane beyond the convenient Da=Bi=1 case.
    landscape_checks=[]
    for dd in np.geomspace(.03,30,7):
        for bb in np.geomspace(.03,30,7):
            nn=240
            dg,of,gg=transport_operator(nn,dd,bb)
            ab=np.zeros((3,nn));ab[0,1:]=of;ab[1]=dg;ab[2,:-1]=of
            right=np.zeros(nn);right[0]=-nn
            num=solve_banded((1,1),ab,right)
            ana=analytic_profile((np.arange(nn)+.5)/nn,dd,bb)
            wall_flux=bb*float(analytic_profile(np.array([1.]),dd,bb)[0])
            profile_error=float(np.max(abs(num-ana))/np.max(ana))
            flux_error=float(abs(gg*num[-1]-wall_flux)/wall_flux)
            landscape_checks.append([dd,bb,profile_error,flux_error])
    assert max(row[2] for row in landscape_checks)<.001
    assert max(row[3] for row in landscape_checks)<.001
    write_csv("transport-landscape-validation.csv",["Da","Bi","relative_max_profile_error_N240","relative_outflow_error_N240"],landscape_checks)
    # A discontinuous source excites unresolved high-frequency CN modes. Keep
    # its measured errors, but do NOT mistake transient orders for formal order.
    nn=80
    diag,off,g=transport_operator(nn)
    eig,Q=eigh_tridiagonal(diag,off)
    source=np.zeros(nn);source[0]=nn
    end=2.
    exact=Q@((np.expm1(eig*end)/eig)*(Q.T@source))
    startup=[]
    for step in (.08,.04,.02,.01,.005):
        test,_,_=transport(nn,step,np.ones(round(end/step)+1))
        startup.append([step,float(np.max(np.abs(test[-1]-exact)))])
    write_csv("discontinuous-startup-errors.csv",["dt","maximum_error_vs_exact_semidiscrete_at_tau_2"],startup)
    # Smooth positive lowest eigenmode gives a known exact semidiscrete solution.
    # RMS over matched physical sample times avoids a favorable endpoint choice.
    mode=Q[:,-1].copy()
    if mode.sum()<0: mode=-mode
    mode=.5*mode/mode.max()
    temporal=[]
    for step in (.08,.04,.02,.01,.005):
        times=np.arange(round(end/step)+1)*step
        test,_,_=transport(nn,step,np.zeros(len(times)),initial=mode)
        exact_mode=np.exp(eig[-1]*times[:,None])*mode[None,:]
        sampled=(test-exact_mode)[::round(.08/step)]
        temporal.append([step,float(np.sqrt(np.mean(sampled**2)))])
    torders=[np.log(temporal[i-1][1]/temporal[i][1])/np.log(2) for i in range(1,len(temporal))]
    assert min(torders)>1.95 and max(torders)<2.05
    # Practical coupled-simulation convergence: recompute ecology + transport.
    csteps=[]
    tref,eref=eco_sim(dt=.0025)
    cref,fref,_=transport(n,.0025,P["q"]*eref[:,0])
    aref=np.trapezoid(fref,tref)
    for step in (.04,.02,.01,.005):
        tt,ee=eco_sim(dt=step)
        ch,fl,_=transport(n,step,P["q"]*ee[:,0])
        csteps.append([step,float(np.max(np.abs(ch[-1]-cref[-1]))),float(abs(np.trapezoid(fl,tt)-aref)),float(abs(np.trapezoid(fl,tt)-aref)/aref)])
    assert csteps[-1][-1]<1e-5
    write_csv("space-convergence.csv",["cells","dx","maximum_concentration_error","boundary_flux_error"],grids)
    write_csv("time-convergence.csv",["dt","RMS_error_smooth_eigenmode_vs_exact_at_matched_times"],temporal)
    write_csv("coupled-time-convergence.csv",["dt","final_profile_max_error_vs_dt0p0025","outflow_AUC_absolute_error","outflow_AUC_relative_error"],csteps)
    # Continuous limiting cases tested directly, not forced by clipping.
    grid=np.linspace(0,1,200)
    zero_loss=analytic_profile(grid,0,1)
    small_loss=analytic_profile(grid,1e-9,1)
    assert np.max(np.abs(zero_loss-small_loss))<1e-7
    zero,zero_flux,_=transport(40,.02,np.zeros(51))
    assert np.max(abs(zero))==0 and np.max(abs(zero_flux))==0
    closed,closed_flux,_=transport(40,.02,np.ones(51),Bi=0)
    assert np.max(abs(closed_flux))==0
    accumulating,_,_=transport(40,.02,np.ones(51),Da=0,Bi=0)
    accumulation_error=float(np.max(abs(accumulating.mean(axis=1)-np.arange(51)*.02)))
    assert accumulation_error<1e-10
    # Linear-source scaling is exact up to solver roundoff.
    twice,_,_=transport(n,dt,2*j)
    scale_error=float(np.max(np.abs(twice-2*c)))
    assert scale_error<1e-11
    fig,ax=plt.subplots(2,2,figsize=(12.5,8.5),constrained_layout=True)
    gr=np.array(grids);tm=np.array(temporal);od=np.array(results["ecology"]["convergence"])
    ax[0,0].loglog(gr[:,1],gr[:,2],"o-",color=GREEN,label="FV cell-center concentration error")
    ax[0,0].loglog(gr[:,1],gr[:,1]**2*gr[0,2]/gr[0,1]**2,":",color=PEACH,label="O(Δξ²) reference")
    ax[0,0].set(xlabel="Cell width Δξ",ylabel="Maximum absolute error")
    ax[0,0].legend(fontsize=8)
    label(ax[0,0],"A","Second-order spatial convergence")
    ax[0,1].loglog(tm[:,0],tm[:,1],"o-",color=GREEN,label="CN eigenmode vs exact exponential")
    ax[0,1].loglog(tm[:,0],tm[:,0]**2*tm[-1,1]/tm[-1,0]**2,":",color=PEACH,label="O(Δτ²) reference")
    ax[0,1].set(xlabel="Time step Δτ",ylabel="RMS error at matched times, τ ∈ [0, 2]")
    ax[0,1].legend(fontsize=8)
    label(ax[0,1],"B","Second-order time convergence for a smooth mode")
    ax[1,0].loglog(od[:,0],od[:,1],"o-",color=GREEN,label="Ecological RK4 vs Δτ = 0.0025")
    ax[1,0].loglog(od[:,0],od[:,0]**4*od[-1,1]/od[-1,0]**4,":",color=PEACH,label="O(Δτ⁴) reference")
    ax[1,0].set(xlabel="Time step Δτ",ylabel="Maximum error over all four states")
    ax[1,0].legend(fontsize=8)
    label(ax[1,0],"C","Pulse-aligned fourth-order integration")
    ax[1,1].axis("off")
    ax[1,1].set_title("D   Verification checks (not biological validation)",loc="left",fontsize=11,pad=13)
    lines=[f"100 equilibrium comparisons; away-boundary max error",
           f"{results['ecology']['constantSupportValidation']['maxErrorAwayFromBoundary']:.2e}",
           f"Max step-wise FV conservation residual  {mass_error:.2e}",
           f"Cumulative balance residual  {abs(balance):.2e}",
           f"Linear source scaling residual  {scale_error:.2e}",
           "Zero source → zero product; Bi = 0 → zero outflow",
           "No EcN → no population-dependent Elafin source",
           "γ = 0 → support/control populations identical",
           "Da → 0 agrees with the linear steady profile"]
    ax[1,1].text(0,.97,"\n\n".join(lines),va="top",fontsize=9.5,linespacing=1.15)
    fig.suptitle("Convergence and independent limiting-case checks",fontsize=16,fontweight="bold")
    savefig(fig,"05-numerical-verification")
    results["transport"]={"parameters":{"Da":Da,"Bi":Bi,"delta":delta,"cells":n,"dt":dt},
        "source":"j(tau)=q*x(tau); q is a constant assumed effective extracellular release coefficient, not validated secretion", "allNumericalParameters":"assumed dimensionless scenarios",
        "steadyUnitSource":{"wallConcentration":float(np.exp(-1)),"outflowFraction":float(np.exp(-1)),"mass":float(1-np.exp(-1))},
        "massBalance":{"integratedSource":source_total,"integratedOutflow":out_total,"integratedDomainLoss":loss_total,"remainingMassOverDelta":stored,"absoluteResidual":abs(balance),"maxStepResidual":mass_error},
        "spaceConvergence":grids,"spaceObservedOrders":orders,"timeConvergence":temporal,"timeObservedOrders":torders,
        "timeVerification":"Smooth positive lowest eigenmode, RMS over matched times, compared with exact semidiscrete exponential; not an empirical biological validation",
        "discontinuousStartupErrors":startup,"coupledTimeConvergence":csteps,
        "landscapeValidation":{"count":49,"cells":240,"maxRelativeProfileError":max(row[2] for row in landscape_checks),"maxRelativeOutflowError":max(row[3] for row in landscape_checks)},
        "closedNoLossAccumulationError":accumulation_error,
        "linearSourceScaleResidual":scale_error,"limitChecksPassed":True,
        "coupledOutput":{"withSupportOutflowAUC":out_total,"withoutSupportOutflowAUC":float(np.trapezoid(fluxc,t))},
        "landscapeGrid":[101,101],"landscapeRanges":{"Da":[.03,30],"Bi":[.03,30]}}
    write_json(OUT/"spatial-preview.json",{"status":"uncalibrated scenario, not an efficacy prediction","tau":t[::10].tolist(),"xi":xi[::2].tolist(),"concentration":c[::10,::2].tolist(),"controlConcentration":cc[::10,::2].tolist(),"source":j[::10].tolist(),"outflow":flux[::10].tolist(),"controlOutflow":fluxc[::10].tolist(),"parameters":results["transport"]["parameters"]})


def release_structure(results,t,base,control):
    """Hypothetical stress-related release, NOT a ROS-dependent expression gate.

    The EcN trajectory and all transport coefficients are held fixed. Only the
    source law changes. eta and epsilon have no measured biological provenance.
    This exposes structural uncertainty hidden by a constant release assumption.
    """
    n,dt=120,.02
    source=P["q"]*base[:,0]
    _,reference_flux,_=transport(n,dt,source)
    _,control_flux,_=transport(n,dt,P["q"]*control[:,0])
    control_auc=float(np.trapezoid(control_flux,t))
    eta=np.linspace(0,64,65)
    eps=np.linspace(0,1,51)
    # Linearity: source = epsilon*constant + (1-epsilon)*damage-linked source.
    # Solve each eta once, then form exact linear mixtures for every epsilon.
    eta_flux=[]
    for strength in eta:
        altered=source/(1+strength*base[:,2])
        _,flux,_=transport(n,dt,altered)
        eta_flux.append(flux)
    eta_flux=np.array(eta_flux)
    auc=np.trapezoid(eta_flux,t,axis=1)
    constant_auc=np.trapezoid(reference_flux,t)
    ratio=(eps[:,None]*constant_auc+(1-eps[:,None])*auc[None,:])/control_auc
    write_csv("release-structural-sensitivity.csv",["eta","epsilon","outflow_AUC_ratio_vs_support_off"],
              [[strength,e,ratio[i,j]] for i,e in enumerate(eps) for j,strength in enumerate(eta)])
    epsilon=.05
    presets=[0,2,8,32]
    curves=[epsilon*reference_flux+(1-epsilon)*eta_flux[k] for k in presets]
    ratios=[float(np.trapezoid(flux,t)/control_auc) for flux in curves]
    write_csv("release-law-scenarios.csv",["tau","outflow_control",*[f"outflow_eta{k}_epsilon0p05" for k in presets]],np.column_stack((t,control_flux,*curves)))
    # Direct solve confirms mixture shortcut without reusing its implementation.
    trial_source=source*(epsilon+(1-epsilon)/(1+32*base[:,2]))
    _,direct,_=transport(n,dt,trial_source)
    linear_error=float(np.max(np.abs(direct-curves[-1])))
    assert linear_error<1e-12
    fig,ax=plt.subplots(2,2,figsize=(13,9),constrained_layout=True)
    pp=np.linspace(0,1,200)
    colors=[GREEN,SAGE,GOLD,PEACH]
    for k,col in zip(presets,colors):
        ax[0,0].plot(pp,epsilon+(1-epsilon)/(1+k*pp),color=col,label=f"η = {k}")
    ax[0,0].set(xlabel="Normalized support p",ylabel="Effective release / q₀",ylim=(0,1.05),xlim=(0,1))
    ax[0,0].legend(fontsize=8)
    label(ax[0,0],"A","Alternative source laws; ε = 0.05")
    for k,curve,col in zip(presets,curves,colors):ax[0,1].plot(t,curve,color=col,label=f"η = {k}")
    ax[0,1].plot(t,control_flux,color=INK,ls="--",label="Matched support-off control")
    ax[0,1].axvline(8,color=INK,ls=":",lw=.8)
    ax[0,1].set(xlabel="Dimensionless model time τ",ylabel="Relative boundary outflow",xlim=(0,24),ylim=(0,max(reference_flux)*1.15))
    ax[0,1].legend(fontsize=8)
    label(ax[0,1],"B","Same EcN history; different extracellular availability")
    h=ax[1,0].pcolormesh(eta,eps,ratio,shading="auto",cmap="BrBG",vmin=0,vmax=3,rasterized=True)
    cs=ax[1,0].contour(eta,eps,ratio,[1],colors=INK,linewidths=1.5)
    ax[1,0].clabel(cs,fmt={1:"same as control"},fontsize=8)
    ax[1,0].set(xlabel="Hypothesized release suppression strength η",ylabel="Support-independent release fraction ε")
    label(ax[1,0],"C","The direction of the comparison can change")
    fig.colorbar(h,ax=ax[1,0],label="Outflow AUC / support-off AUC, τ = 0–24")
    ax[1,1].bar([str(k) for k in presets],ratios,color=colors,width=.6)
    ax[1,1].axhline(1,color=INK,ls="--",label="Support-off comparison = 1")
    for i,v in enumerate(ratios):ax[1,1].text(i,v+.06,f"{v:.2f}",ha="center")
    ax[1,1].set(xlabel="Hypothesized release suppression strength η",ylabel="Outflow AUC / support-off AUC",ylim=(0,3.1))
    ax[1,1].legend(fontsize=8)
    label(ax[1,1],"D","A release measurement could change the interpretation")
    fig.suptitle("Structural uncertainty • intracellular expression does not establish secretion",fontsize=15,fontweight="bold")
    savefig(fig,"07-release-law-sensitivity")
    results["releaseStructure"]={"sourceLaw":"j=q0*x*[epsilon+(1-epsilon)/(1+eta*p)]",
        "interpretation":"An explicitly hypothetical loss of damage-associated release under support; no direct ROS-to-expression gate is added.",
        "assumptions":"epsilon and eta are unmeasured; this is a structural counterexample, not a supported release mechanism",
        "epsilonExample":epsilon,"etaExamples":presets,"outflowAUCRatios":ratios,
        "etaRange":[0,64],"epsilonRange":[0,1],"surfaceSize":[65,51],"linearMixtureCheckError":linear_error,
        "conclusion":"More retained EcN does not determine more extracellular Elafin without a release law; the constant-q benefit is conditional."}


def main():
    global OUT,RAW
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output-dir",type=Path,help="Optional output directory for a downloaded standalone copy")
    args=parser.parse_args()
    if args.output_dir:
        OUT=args.output_dir.resolve()
        RAW=OUT/"raw"
    started=time.perf_counter()
    OUT.mkdir(parents=True,exist_ok=True)
    RAW.mkdir(parents=True,exist_ok=True)
    results={"title":"From ecological persistence to spatial Elafin transport", "status":"Exploratory mathematical research; all numerical parameters uncalibrated",
             "architecture":"External ROS input → proposed PspA-related support. Elafin intracellular expression is constitutive. A constant q approximates effective extracellular release; it is not a verified secretion process or direct ROS gate.",
             "seed":SEED,"reproduce":"python scripts/drylab/research_models.py",
             "environment":{"python":platform.python_version(),"numpy":np.__version__,"scipy":scipy.__version__,"matplotlib":matplotlib.__version__},
             "references":[{"url":"https://doi.org/10.1371/journal.pcbi.1003388","use":"General ecological model form; no numeric parameters borrowed"},{"url":"https://doi.org/10.7554/eLife.25051","use":"Limitations of pairwise interaction models"},{"url":"https://2025.igem.wiki/peking/model/","use":"Presentation structure only; no scientific equations, data or parameter claims copied"}]}
    t,base,control=ecological_analysis(results)
    spatial_analysis(results,t,base,control)
    release_structure(results,t,base,control)
    results["elapsedSeconds"]=time.perf_counter()-started
    write_json(OUT/"research-summary.json",results)
    write_json(RAW/"research-summary.json",results)
    shutil.copyfile(__file__,OUT/"research_models.py")
    report=Path(__file__).with_name("research-report.md")
    if report.exists():
        if report.resolve() != (OUT/report.name).resolve():
            shutil.copyfile(report,OUT/report.name)
        shutil.copyfile(report,RAW/report.name)
    for p in OUT.glob("*.csv"):
        shutil.copyfile(p,RAW/p.name)
    manifest=[]
    for p in sorted(OUT.iterdir()):
        if p.is_file() and p.name!="manifest.json":
            manifest.append({"file":p.name,"bytes":p.stat().st_size,"sha256":hashlib.sha256(p.read_bytes()).hexdigest()})
    write_json(OUT/"manifest.json",manifest)
    print(json.dumps({"output":str(OUT),"elapsedSeconds":results["elapsedSeconds"],"ecologyValidation":results["ecology"]["constantSupportValidation"],"spatialOrders":results["transport"]["spaceObservedOrders"],"timeOrders":results["transport"]["timeObservedOrders"],"massBalance":results["transport"]["massBalance"]},indent=2))


if __name__=="__main__":
    main()
