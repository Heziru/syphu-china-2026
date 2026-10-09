import { useEffect, useRef, useState } from "react";
import { assetUrl } from "../../utils/assetUrl";
import { parsePdb } from "./pdbCoordinates";
import "./researchStructureViewer.css";

type Selection = { chain?: string; hetflag?: boolean; serial?: number[] };
type Style = {
  cartoon?: {
    arrows: boolean;
    thickness: number;
    style: string;
    color: string;
  };
  stick?: { radius: number; colorscheme: Record<string, string> };
};
type Viewer = {
  addModel: (
    source: string,
    format: string,
    options: { noComputeSecondaryStructure: boolean },
  ) => unknown;
  setStyle: (selection: Selection, style: Style) => void;
  addStyle: (selection: Selection, style: Style) => void;
  zoomTo: (selection?: Selection) => Viewer;
  rotate: (angle: number, axis: string) => Viewer;
  zoom: (factor: number) => Viewer;
  getView: () => number[];
  setView: (view: number[]) => void;
  render: () => void;
  resize: () => void;
  clear: () => void;
  getCanvas: () => HTMLCanvasElement;
  getRenderer: () => {
    getContext: () => WebGLRenderingContext | WebGL2RenderingContext | null;
  };
};
type MolLibrary = {
  createViewer: (
    element: HTMLElement,
    options: { backgroundColor: string; antialias: boolean },
  ) => Viewer;
};
type MolWindow = Window & { $3Dmol?: MolLibrary };
type StructureId = "1fle" | "2rel";
type Status = "loading" | "ready" | "error";
const coral = "#d77662";
const teal = "#388c87";
let libraryPromise: Promise<MolLibrary> | undefined;

function loadLibrary() {
  const molWindow = window as MolWindow;
  if (molWindow.$3Dmol) return Promise.resolve(molWindow.$3Dmol);
  if (!libraryPromise) {
    libraryPromise = new Promise<MolLibrary>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = assetUrl("assets/dry-lab/vendor/3Dmol-2.5.5.min.js");
      script.async = true;
      script.onload = () => {
        if (molWindow.$3Dmol) resolve(molWindow.$3Dmol);
        else
          reject(new Error("The local molecular renderer did not initialize."));
      };
      script.onerror = () => {
        script.remove();
        reject(new Error("The local molecular renderer could not be loaded."));
      };
      document.head.append(script);
    }).catch((error: unknown) => {
      libraryPromise = undefined;
      throw error;
    });
  }
  return libraryPromise;
}

function styleStructure(
  viewer: Viewer,
  structure: StructureId,
  contacts: number[],
  showContacts: boolean,
) {
  viewer.setStyle({}, {});
  const cartoon = (color: string) => ({
    arrows: true,
    thickness: 0.32,
    style: "oval",
    color,
  });
  if (structure === "1fle") {
    viewer.setStyle({ chain: "E", hetflag: false }, { cartoon: cartoon(teal) });
    viewer.setStyle(
      { chain: "I", hetflag: false },
      { cartoon: cartoon(coral) },
    );
    if (showContacts) {
      for (const [chain, carbon] of [
        ["E", teal],
        ["I", coral],
      ]) {
        viewer.addStyle(
          { chain, serial: contacts },
          {
            stick: {
              radius: 0.14,
              colorscheme: {
                C: carbon,
                O: "#cc4c4c",
                N: "#506cb8",
                S: "#d9ac3e",
              },
            },
          },
        );
      }
    }
  } else {
    viewer.setStyle(
      { chain: "A", hetflag: false },
      { cartoon: cartoon(coral) },
    );
  }
  viewer.render();
}

export default function ResearchStructureViewer() {
  const stageRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const resetViewRef = useRef<number[]>([]);
  const contactsRef = useRef<number[]>([]);
  const [structure, setStructure] = useState<StructureId>("1fle");
  const [showContacts, setShowContacts] = useState(false);
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const abort = new AbortController();
    let canceled = false;
    let started = false;
    let contextLost: (() => void) | undefined;
    let canvas: HTMLCanvasElement | undefined;
    let contextCanvas: HTMLCanvasElement | OffscreenCanvas | undefined;
    setStatus("loading");
    setError("");
    contactsRef.current = [];
    resetViewRef.current = [];

    async function initialize() {
      started = true;
      try {
        const [library, response] = await Promise.all([
          loadLibrary(),
          fetch(assetUrl(`assets/dry-lab/structures/${structure}.pdb`), {
            signal: abort.signal,
          }),
        ]);
        if (!response.ok)
          throw new Error(
            `PDB coordinates could not be loaded (HTTP ${response.status}).`,
          );
        const source = await response.text();
        if (canceled) return;
        const firstModel = source.indexOf("ENDMDL");
        const coordinates =
          firstModel < 0 ? source : source.slice(0, firstModel + 6);
        const parsed = parsePdb(coordinates);
        contactsRef.current = coordinates
          .split(/\r?\n/)
          .filter(
            (line) =>
              line.startsWith("ATOM  ") &&
              [" ", "A"].includes(line[16]) &&
              parsed.interfaceResidues.has(
                `${line[21]}:${line.slice(22, 27).trim()}`,
              ) &&
              !["H", "D"].includes(line.slice(76, 78).trim()),
          )
          .map((line) => Number(line.slice(6, 11)));
        const viewer = library.createViewer(stage!, {
          backgroundColor: "white",
          antialias: true,
        });
        viewerRef.current = viewer;
        canvas = viewer.getCanvas();
        if (canvas.id === "undefined") canvas.removeAttribute("id");
        const context = viewer.getRenderer().getContext();
        if (!context || context.isContextLost()) {
          throw new Error("This browser cannot create a WebGL context.");
        }
        contextCanvas = context.canvas;
        canvas.setAttribute(
          "aria-label",
          structure === "1fle"
            ? "Rotatable experimental Elafin and porcine elastase complex"
            : "Rotatable first NMR conformer of human Elafin",
        );
        contextLost = () => {
          if (!canceled) {
            setError(
              "The browser lost its 3D rendering context. A coordinate-derived static view is shown below.",
            );
            setStatus("error");
          }
        };
        contextCanvas.addEventListener("webglcontextlost", contextLost);
        viewer.addModel(coordinates, "pdb", {
          noComputeSecondaryStructure: true,
        });
        viewer
          .zoomTo({ hetflag: false })
          .rotate(-15, "y")
          .rotate(15, "z")
          .zoom(1.18);
        resetViewRef.current = viewer.getView();
        styleStructure(viewer, structure, contactsRef.current, false);
        setStatus("ready");
      } catch (caught: unknown) {
        if (!canceled) {
          setError(
            caught instanceof Error
              ? caught.message
              : "Interactive 3D rendering is unavailable.",
          );
          setStatus("error");
        }
      }
    }

    const observer = new ResizeObserver(() => {
      if (!stage.clientWidth || !stage.clientHeight) return;
      if (!started) void initialize();
      else if (viewerRef.current) {
        viewerRef.current.resize();
        viewerRef.current.render();
      }
    });
    observer.observe(stage);
    return () => {
      canceled = true;
      abort.abort();
      observer.disconnect();
      if (contextCanvas && contextLost)
        contextCanvas.removeEventListener("webglcontextlost", contextLost);
      viewerRef.current?.clear();
      viewerRef.current = null;
      stage.replaceChildren();
    };
  }, [structure]);

  useEffect(() => {
    if (status === "ready" && viewerRef.current) {
      styleStructure(
        viewerRef.current,
        structure,
        contactsRef.current,
        showContacts,
      );
    }
  }, [showContacts, status, structure]);

  return (
    <div className="researchStructureViewer">
      <div className="researchStructureViewer__controls">
        <label>
          Structure
          <select
            value={structure}
            onChange={(event) => {
              setShowContacts(false);
              setStructure(event.target.value as StructureId);
            }}
          >
            <option value="1fle">1FLE · Elafin–elastase complex</option>
            <option value="2rel">2REL · Elafin, NMR model 1</option>
          </select>
        </label>
        {structure === "1fle" && (
          <label className="researchStructureViewer__checkbox">
            <input
              type="checkbox"
              checked={showContacts}
              disabled={status !== "ready"}
              onChange={(event) => setShowContacts(event.target.checked)}
            />
            Interface sticks (&lt; 4 Å)
          </label>
        )}
        <button
          type="button"
          disabled={status !== "ready"}
          onClick={() => {
            viewerRef.current?.setView(resetViewRef.current);
            viewerRef.current?.render();
          }}
        >
          Reset view
        </button>
        <a
          href={assetUrl(`assets/dry-lab/structures/${structure}.pdb`)}
          download
        >
          Download PDB
        </a>
      </div>
      <div
        className="researchStructureViewer__frame"
        aria-busy={status === "loading"}
      >
        <div
          ref={stageRef}
          className="researchStructureViewer__stage"
          style={{ visibility: status === "error" ? "hidden" : "visible" }}
        />
        {status === "loading" && (
          <p className="researchStructureViewer__status" role="status">
            Loading deposited coordinates…
          </p>
        )}
        {status === "error" && (
          <div className="researchStructureViewer__fallback">
            <img
              src={assetUrl(`assets/dry-lab/research/${structure}-cartoon.png`)}
              alt={
                structure === "1fle"
                  ? "Coordinate-derived ribbon view of human Elafin with porcine pancreatic elastase"
                  : "Coordinate-derived ribbon view of human Elafin, NMR conformer 1"
              }
            />
            <p role="status">
              {error} Static view; the original PDB remains available to
              download.
            </p>
          </div>
        )}
      </div>
      <div className="researchStructureViewer__caption">
        {structure === "1fle" ? (
          <>
            <p>
              <span className="researchStructureViewer__key researchStructureViewer__key--coral" />
              Human Elafin · chain I
              <span className="researchStructureViewer__key researchStructureViewer__key--teal" />
              Porcine pancreatic elastase · chain E
            </p>
            <p>
              1FLE · Experimental complex · 1.90 Å. Interface sticks show
              heavy-atom contacts within 4 Å.
            </p>
          </>
        ) : (
          <p>
            <span className="researchStructureViewer__key researchStructureViewer__key--coral" />
            Human Elafin · 2REL · NMR conformer 1 of 11 · 57 residues.
          </p>
        )}
        <p className="researchStructureViewer__hint">
          Drag to rotate · scroll or pinch to zoom.
        </p>
      </div>
    </div>
  );
}
