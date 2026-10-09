"""Exploratory two-guild ecology model. No fitted or patient parameters.
Run: python ecology_scenarios.py
Outputs: ecology-scenarios.json beside this script. Standard library only.
All time, abundance and secretion axes are dimensionless; no clinical dosing.
"""
import json
import math
from pathlib import Path

P = dict(rE=1.0, rR=0.8, aRE=0.25, washE=0.1, washR=0.1,
         bileStress=0.35, protection=2.0, supportRate=0.8,
         qElafin=0.3, elafinLoss=0.5, signalUntil=8.0)
PRESETS = [("permissive", "Lower competition", 0.45),
           ("moderate", "Intermediate competition", 0.80),
           ("restrictive", "Higher competition", 1.10)]
INITIAL = [0.08, 0.80, 0.0, 0.0]
REFERENCES = [
    {"title": "Stein et al. (2013), Ecological Modeling from Time-Series Inference",
     "url": "https://doi.org/10.1371/journal.pcbi.1003388",
     "use": "Model-form precedent for population interactions and external forcing; no numeric parameters borrowed."},
    {"title": "Momeni et al. (2017), Lotka-Volterra pairwise modeling fails to capture diverse pairwise microbial interactions",
     "url": "https://doi.org/10.7554/eLife.25051",
     "use": "Limitations of pairwise ecological models; no numeric parameters borrowed."},
]

def rhs(y, p, competition, support_enabled, signal):
    ecn, resident, support, elafin = y
    stress_loss = p["bileStress"] / (1 + p["protection"] * support)
    return [
        ecn * (p["rE"] * (1 - ecn - competition * resident) - p["washE"] - stress_loss),
        resident * (p["rR"] * (1 - resident - p["aRE"] * ecn) - p["washR"]),
        p["supportRate"] * ((signal if support_enabled else 0.0) - support),
        p["qElafin"] * ecn - p["elafinLoss"] * elafin,
    ]

def simulate(competition, support_enabled=True, p=None, dt=0.02, initial=None):
    p = dict(P if p is None else p)
    y = list(INITIAL if initial is None else initial)
    rows = []
    count = round(24.0 / dt)
    sample_every = round(0.2 / dt)
    for i in range(count + 1):
        time = i * dt
        signal = 1.0 if time < p["signalUntil"] - 1e-9 else 0.0
        if i % sample_every == 0:
            rows.append(dict(time=round(time, 5), engineered=y[0], resident=y[1],
                             support=y[2], elafin=y[3], signal=signal))
        if i == count:
            break
        # Pulse boundaries align with the fixed grid. A single signal per step
        # avoids evaluating the pre-switch interval using the post-switch input.
        k1 = rhs(y, p, competition, support_enabled, signal)
        k2 = rhs([v + dt * k / 2 for v, k in zip(y, k1)], p, competition, support_enabled, signal)
        k3 = rhs([v + dt * k / 2 for v, k in zip(y, k2)], p, competition, support_enabled, signal)
        k4 = rhs([v + dt * k for v, k in zip(y, k3)], p, competition, support_enabled, signal)
        y = [v + dt * (a + 2*b + 2*c + d) / 6 for v, a, b, c, d in zip(y, k1, k2, k3, k4)]
        assert all(math.isfinite(v) and v >= -1e-12 for v in y)
        y = [max(0.0, v) for v in y]
    return rows

def summary(rows):
    def auc(key):
        return sum((b["time"] - a["time"]) * (a[key] + b[key]) / 2 for a, b in zip(rows, rows[1:]))
    return {"engineeredAtSignalOff": rows[40]["engineered"],
            "engineeredFinal": rows[-1]["engineered"],
            "residentFinal": rows[-1]["resident"],
            "elafinAuc": auc("elafin"),
            "engineeredAuc": auc("engineered")}

def checks():
    coarse = simulate(.8)
    fine = simulate(.8, dt=.01)
    error = max(abs(a[k]-b[k]) for a, b in zip(coarse, fine)
                for k in ("engineered", "resident", "support", "elafin"))
    assert error < 1e-7, error
    absent = simulate(.8, initial=[0, .8, 0, 0])
    assert all(row["engineered"] == 0 and row["elafin"] == 0 for row in absent)
    zero_protection = dict(P, protection=0)
    a = simulate(.8, True, zero_protection)
    b = simulate(.8, False, zero_protection)
    assert max(abs(x["engineered"]-y["engineered"]) for x,y in zip(a,b)) < 1e-12
    const = dict(P, qElafin=0)
    assert all(row["elafin"] == 0 for row in simulate(.8, p=const))
    assert all(row["support"] == 0 for row in simulate(.8, False))
    return {"nonnegativeFinite": True, "halvedStepMaximumError": error,
            "noCellsNoProduct": True, "zeroProtectionControl": True,
            "zeroSecretionControl": True, "supportOffControl": True}

def main():
    presets = []
    for key, title, competition in PRESETS:
        enabled, disabled = simulate(competition), simulate(competition, False)
        presets.append({"id": key, "title": title, "competition": competition,
                        "withSupport": enabled, "withoutSupport": disabled,
                        "summary": {"withSupport": summary(enabled), "withoutSupport": summary(disabled)}})
    baseline = summary(simulate(.8))["elafinAuc"]
    sensitivity = []
    for name in ("bileStress", "protection", "washE", "qElafin", "elafinLoss"):
        lo, hi = dict(P), dict(P)
        lo[name] *= .75
        hi[name] *= 1.25
        sensitivity.append({"parameter": name, "minus25Percent": summary(simulate(.8, p=lo))["elafinAuc"],
                            "plus25Percent": summary(simulate(.8, p=hi))["elafinAuc"], "baseline": baseline})
    data = {
        "title": "Ecological competition: a scenario sandbox",
        "status": "Exploratory, uncalibrated, not a microbiome interaction inference",
        "created": "2026-10-08",
        "question": "Could resident competition alter the persistence of an introduced EcN population even if a proposed protective response works?",
        "units": {"time": "dimensionless model time", "engineered": "normalized population", "resident": "normalized population",
                  "support": "normalized proposed response", "elafin": "relative secreted-product state"},
        "equations": [
            "dx/dt = x [rE (1 - x - alpha*y) - washE - bileStress/(1 + protection*p)]",
            "dy/dt = y [rR (1 - y - aRE*x) - washR]",
            "dp/dt = supportRate * (signal - p)",
            "dL/dt = qElafin*x - elafinLoss*L",
        ],
        "architecture": "The assumed ROS signal drives proposed PspA-related support only. Elafin production per cell stays constitutive and is not gated by ROS.",
        "parameters": P,
        "parameterProvenance": "Every numerical value, initial state, forcing schedule and competition coefficient is an illustrative assumption. None is fitted to EcN, co-culture, patient or sequencing data.",
        "initial": dict(zip(("engineered", "resident", "support", "elafin"), INITIAL)),
        "presets": presets, "sensitivity": sensitivity, "checks": checks(), "references": REFERENCES,
        "limits": [
            "The resident guild aggregates an ecosystem; it is not a named taxon or measured composition.",
            "The bile-stress protection function is an explicit untested hypothesis, not measured PspA biology.",
            "All competition terms are negative by design; there are no measured cross-feeding, metabolite, immune or spatial interactions.",
            "A low trajectory is not proof of clearance, biosafety or successful treatment.",
            "The model does not map model time to hours, populations to CFU, or product to nM.",
            "No patient prediction, clinical dose, efficacy or taxon-level microbiome restoration is estimated.",
        ],
        "nextMeasurements": [
            "Measure engineered EcN and resident absolute abundance across co-culture time courses.",
            "Compare matched PspA-on and PspA-off growth/loss under the same ROS and bile-acid conditions.",
            "Measure per-cell Elafin secretion, product decay and circuit burden independently.",
            "Fit on training conditions and assess predictions on held-out perturbations."
        ]
    }
    out = Path(__file__).with_name("ecology-scenarios.json")
    out.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"output": str(out), "checks": data["checks"],
                      "presets": [{k: v for k,v in s.items() if k in ("id","summary")} for s in presets]}, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()

