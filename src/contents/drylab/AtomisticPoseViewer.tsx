import { useEffect, useRef, useState } from "react";
import { assetUrl } from "../../utils/assetUrl";
import { parsePdb } from "./pdbCoordinates";

const asset = (file: string) => assetUrl("assets/dry-lab/atomistic/" + file);
const choices = [
  { file: "docking/human-ne-elafin/top1-cartoon.pdb", label: "Human NE · original rank 1", image: "human-ne-complex.png", note: "New HDOCK prediction. Human NE is chain E; human Elafin is chain I. The top score does not recover the expected inhibitory-site geometry." },
  { file: "docking/human-ne-elafin/geometry-candidate.pdb", label: "Human NE · original rank 29", image: "candidate-complex.png", note: "Post-hoc geometry-filtered candidate, original HDOCK rank 29. Human NE is chain E; human Elafin is chain I. This is not an experimentally validated pose." },
  { file: "docking/1fle-redocking/top1-cartoon.pdb", label: "1FLE redocking · rank 1", image: "redocking-overlay.png", note: "New rigid-body redocking of bound 1FLE chains. Porcine pancreatic elastase is chain E; human Elafin is chain I, resolved mature residues 11–57." },
];
type Selection = { chain?: string; serial?: number[]; hetflag?: boolean };
type Viewer = {
  addModel: (pdb: string, format: string, options: { noComputeSecondaryStructure: boolean }) => void;
  setStyle: (selection: Selection, style: object) => void;
  addStyle: (selection: Selection, style: object) => void;
  zoomTo: () => Viewer; rotate: (angle: number, axis: string) => Viewer;
  getView: () => number[]; setView: (view: number[]) => void;
  resize: () => void; render: () => void; clear: () => void;
  getCanvas: () => HTMLCanvasElement;
  getRenderer: () => { getContext: () => WebGLRenderingContext | WebGL2RenderingContext | null };
};
type Library = { createViewer: (el: HTMLElement, options: object) => Viewer };
type MolecularWindow = Window & { $3Dmol?: Library };
let libraryPromise: Promise<Library> | undefined;
function library() {
  const w = window as MolecularWindow;
  if (w.$3Dmol) return Promise.resolve(w.$3Dmol);
  if (!libraryPromise) libraryPromise = new Promise<Library>((resolve, reject) => {
    const url = assetUrl("assets/dry-lab/vendor/3Dmol-2.5.5.min.js");
    const existing = [...document.scripts].find(script => script.src.endsWith(url));
    const script = existing || document.createElement("script");
    script.addEventListener("load", () => w.$3Dmol ? resolve(w.$3Dmol) : reject(new Error("Molecular renderer did not initialize.")), { once: true });
    script.addEventListener("error", () => reject(new Error("Local molecular renderer could not load.")), { once: true });
    if (!existing) { script.src = url; script.async = true; document.head.append(script); }
  }).catch((error: unknown) => { libraryPromise = undefined; throw error; });
  return libraryPromise;
}

export default function AtomisticPoseViewer() {
  const stage = useRef<HTMLDivElement>(null);
  const viewer = useRef<Viewer | null>(null);
  const reset = useRef<number[]>([]);
  const interfaceSerials = useRef<Record<string, number[]>>({});
  const [index, setIndex] = useState(0);
  const [sticks, setSticks] = useState(false);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const chosen = choices[index];

  function style(v: Viewer, show: boolean) {
    v.setStyle({}, {});
    for (const [chain, color] of [["E", "#388c87"], ["I", "#d77662"]]) {
      v.setStyle({ chain }, { cartoon: { color, arrows: true, thickness: .32, style: "oval" } });
      if (show) v.addStyle({ chain, serial: interfaceSerials.current[chain] ?? [] }, { stick: { radius: .13, colorscheme: { C: color, N: "#506cb8", O: "#cc4c4c", S: "#d9ac3e" } } });
    }
    v.render();
  }
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const abort = new AbortController(); let disposed = false; let started = false;
    let canvas: HTMLCanvasElement | OffscreenCanvas | undefined;
    const onLost = () => { if (!disposed) { setStatus("error"); setError("WebGL context was lost. The coordinate-derived static view remains available."); } };
    setStatus("loading"); setError(""); setSticks(false);
    async function initialize() {
      started = true;
      try {
        const [mol, response] = await Promise.all([library(), fetch(asset(choices[index].file), { signal: abort.signal })]);
        if (!response.ok) throw new Error(`PDB could not load (HTTP ${response.status}).`);
        const pdb = await response.text(); if (disposed) return;
        const parsed = parsePdb(pdb);
        interfaceSerials.current = {};
        for (const line of pdb.split(/\r?\n/)) {
          if (!line.startsWith("ATOM  ") || !parsed.interfaceResidues.has(`${line[21]}:${line.slice(22, 27).trim()}`)) continue;
          (interfaceSerials.current[line[21]] ??= []).push(Number(line.slice(6, 11)));
        }
        const v = mol.createViewer(el!, { backgroundColor: "white", antialias: true }); viewer.current = v;
        const context = v.getRenderer().getContext();
        if (!context || context.isContextLost()) throw new Error("WebGL is unavailable on this device.");
        canvas = context.canvas; canvas.addEventListener("webglcontextlost", onLost);
        const viewerCanvas = v.getCanvas();
        if (viewerCanvas.id === "undefined") viewerCanvas.removeAttribute("id");
        viewerCanvas.setAttribute("aria-label", "Rotate the computed protein docking pose by dragging; scroll to zoom.");
        v.addModel(pdb, "pdb", { noComputeSecondaryStructure: true });
        v.zoomTo().rotate(-12, "y").rotate(12, "z"); reset.current = v.getView(); style(v, false); setStatus("ready");
      } catch (caught: unknown) {
        if (!disposed) { setError(caught instanceof Error ? caught.message : "Interactive molecular rendering failed."); setStatus("error"); }
      }
    }
    const observer = new ResizeObserver(() => {
      if (!el.clientWidth || !el.clientHeight) return;
      if (!started) void initialize(); else { viewer.current?.resize(); viewer.current?.render(); }
    });
    observer.observe(el);
    return () => { disposed = true; abort.abort(); observer.disconnect(); canvas?.removeEventListener("webglcontextlost", onLost); viewer.current?.clear(); viewer.current = null; el.replaceChildren(); };
  }, [index]);

  return <div className="atomistic-viewer">
    <div className="atomistic-viewer-tools">
      <label>Computed structure <select value={index} onChange={event => setIndex(Number(event.target.value))}>{choices.map((choice, i) => <option key={choice.file} value={i}>{choice.label}</option>)}</select></label>
      <label><input type="checkbox" checked={sticks} disabled={status !== "ready"} onChange={event => { setSticks(event.target.checked); if (viewer.current) style(viewer.current, event.target.checked); }} /> Interface sticks</label>
      <button type="button" disabled={status !== "ready"} onClick={() => { viewer.current?.setView(reset.current); viewer.current?.render(); }}>Reset view</button>
      <a href={asset(chosen.file)} download>Download PDB</a>
    </div>
    <div className="atomistic-viewer-frame" aria-busy={status === "loading"}>
      <div className="atomistic-viewer-stage" ref={stage} style={{ visibility: status === "error" ? "hidden" : undefined }} />
      {status === "loading" && <p className="atomistic-viewer-loading" role="status">Loading actual docking coordinates…</p>}
      {status === "error" && <div className="atomistic-viewer-fallback" role="status"><p>{error}</p><img className="atomistic-static-pose" src={asset(chosen.image)} alt={chosen.label + " static coordinate render"} /></div>}
    </div>
    <p className="atomistic-viewer-note"><span className="atomistic-chain-e">Chain E</span> / <span className="atomistic-chain-i">Chain I</span>. {chosen.note} Drag to rotate; scroll or pinch to zoom. Sticks mark residues with an interchain heavy-atom distance below 4 Å.</p>
  </div>;
}
