import {
  Component,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentRef,
  type ReactNode,
} from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { assetUrl } from "../../utils/assetUrl";
import {
  parsePdb,
  residueKey,
  type Atom,
  type PdbData,
} from "./pdbCoordinates";
import "./molecularViewer.css";

const STRUCTURES = {
  complex: {
    id: "1FLE",
    file: "1fle.pdb",
    label: "Elafin–elastase reference",
    title: "One small inhibitor. A protein interface.",
    subtitle:
      "Human Elafin bound to porcine pancreatic elastase · X-ray, 1.90 Å",
    description:
      "A published experimental complex used to inspect the binding geometry. The enzyme is porcine pancreatic elastase, not human neutrophil elastase. Elafin has coordinates for 47 of its 57 residues; residues 1–10 are unmodeled in the authors’ mature-peptide numbering. This is a structural reference, not a docking result from our team.",
    chains: [
      { id: "I", name: "Human Elafin", color: "#d89269" },
      { id: "E", name: "Porcine pancreatic elastase", color: "#5b9d92" },
    ],
  },
  elafin: {
    id: "2REL",
    file: "2rel.pdb",
    label: "Elafin in solution",
    title: "Meet Elafin in three dimensions.",
    subtitle: "Human recombinant Elafin · solution NMR · conformer 1 of 11",
    description:
      "The first deposited NMR conformer shows the Elafin fold. The ensemble is a collection of solution structures, not a molecular-dynamics trajectory. No binding partner or docking pose is shown.",
    chains: [{ id: "A", name: "Human Elafin", color: "#d89269" }],
  },
} as const;

class StructureBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function ProteinTrace({
  data,
  visible,
  highlight,
}: {
  data: PdbData;
  visible: string[];
  highlight: boolean;
}) {
  const geometry = useMemo(() => {
    const toPoint = (atom: Atom) =>
      new THREE.Vector3(
        ...(atom.position.map(
          (value, i) => (value - data.center[i]) / data.radius,
        ) as [number, number, number]),
      );
    return data.traces
      .filter((trace) => trace.points.length > 1)
      .map((trace) => ({
        chain: trace.chain,
        tube: new THREE.TubeGeometry(
          new THREE.CatmullRomCurve3(trace.points.map(toPoint)),
          trace.points.length * 5,
          0.012,
          7,
          false,
        ),
        markers: trace.points
          .filter((atom) => data.interfaceResidues.has(residueKey(atom)))
          .map((atom) => ({ key: residueKey(atom), position: toPoint(atom) })),
      }));
  }, [data]);
  useEffect(
    () => () => geometry.forEach(({ tube }) => tube.dispose()),
    [geometry],
  );
  return (
    <group>
      {geometry.map(
        ({ chain, tube, markers }, index) =>
          visible.includes(chain) && (
            <group key={`${chain}-${index}`}>
              <mesh geometry={tube}>
                <meshStandardMaterial
                  color={chain === "E" ? "#5b9d92" : "#d89269"}
                  roughness={0.45}
                  metalness={0.05}
                />
              </mesh>
              {highlight &&
                markers.map(({ key, position }) => (
                  <mesh key={key} position={position}>
                    <sphereGeometry args={[0.023, 12, 8]} />
                    <meshStandardMaterial color="#e6bc66" roughness={0.5} />
                  </mesh>
                ))}
            </group>
          ),
      )}
    </group>
  );
}

export default function MolecularViewer() {
  const [canRender3d] = useState(() => {
    try {
      const context = document.createElement("canvas").getContext("webgl2");
      context?.getExtension("WEBGL_lose_context")?.loseContext();
      return Boolean(context);
    } catch {
      return false;
    }
  });
  const [selected, setSelected] = useState<keyof typeof STRUCTURES>("complex");
  const structure = STRUCTURES[selected];
  const [result, setResult] = useState<{
    id: string;
    data?: PdbData;
    error?: string;
  }>({ id: "" });
  const [visible, setVisible] = useState(["E", "I"]);
  const [highlight, setHighlight] = useState(true);
  const [retry, setRetry] = useState(0);
  const [rotation, setRotation] = useState(0);
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const fileUrl = assetUrl(`assets/dry-lab/structures/${structure.file}`);
  const data = result.id === structure.id ? result.data : undefined;
  const error = result.id === structure.id ? result.error : undefined;
  useEffect(() => {
    const controller = new AbortController();
    fetch(fileUrl, { signal: controller.signal })
      .then((response) => {
        if (!response.ok)
          throw new Error(`PDB request failed (${response.status}).`);
        return response.text();
      })
      .then((source) => setResult({ id: structure.id, data: parsePdb(source) }))
      .catch((caught: unknown) => {
        if (!controller.signal.aborted)
          setResult({
            id: structure.id,
            error:
              caught instanceof Error
                ? caught.message
                : "Unable to load coordinates.",
          });
      });
    return () => controller.abort();
  }, [fileUrl, structure.id, retry]);
  function changeStructure(value: keyof typeof STRUCTURES) {
    setSelected(value);
    setVisible(STRUCTURES[value].chains.map((chain) => chain.id));
    setRotation(0);
  }
  function zoom(factor: number) {
    if (!controls.current) return;
    const camera = controls.current.object;
    const target = controls.current.target;
    const offset = camera.position.clone().sub(target);
    offset.setLength(THREE.MathUtils.clamp(offset.length() * factor, 1.6, 7));
    camera.position.copy(target).add(offset);
    controls.current.update();
  }
  const fallback = (
    <div className="molecularViewer__empty molecularViewer__fallback">
      {selected === "complex" && (
        <img
          src={assetUrl("assets/dry-lab/structures/1fle-backbone-preview.png")}
          alt="Static C-alpha trace of deposited 1FLE coordinates: human Elafin in peach, porcine pancreatic elastase in teal, interface residues in gold."
        />
      )}
      <p>
        The 3D renderer is unavailable on this device.{" "}
        {selected === "complex"
          ? "This static preview uses the same deposited 1FLE coordinates."
          : "2REL coordinates remain available as an original PDB file."}
      </p>
      <a href={fileUrl} download={structure.file}>
        Download original {structure.id}.pdb
      </a>
    </div>
  );
  return (
    <section
      className="molecularViewer"
      aria-label="Interactive protein structure viewer"
    >
      <div className="molecularViewer__heading">
        <span className="molecularViewer__eyebrow">STRUCTURE EXPLORER</span>
        <h3>{structure.title}</h3>
        <p>{structure.subtitle}</p>
      </div>
      <div
        className="molecularViewer__tabs"
        role="group"
        aria-label="Choose a reference structure"
      >
        {Object.entries(STRUCTURES).map(([key, value]) => (
          <button
            key={key}
            type="button"
            aria-pressed={key === selected}
            onClick={() => changeStructure(key as keyof typeof STRUCTURES)}
          >
            {value.id}
            <span>{value.label}</span>
          </button>
        ))}
      </div>
      <div className="molecularViewer__stage">
        {error ? (
          <div className="molecularViewer__empty" role="alert">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => setRetry((value) => value + 1)}
            >
              Retry loading
            </button>
          </div>
        ) : !data ? (
          <div className="molecularViewer__empty" role="status">
            Loading deposited atomic coordinates…
          </div>
        ) : !canRender3d ? (
          fallback
        ) : (
          <StructureBoundary key={structure.id} fallback={fallback}>
            <Canvas
              key={structure.id}
              frameloop="demand"
              dpr={[1, 1.75]}
              camera={{ position: [0, 0, 2.65], fov: 42 }}
              fallback={fallback}
              aria-label={`Interactive ${structure.id} C-alpha backbone trace`}
            >
              <color attach="background" args={["#f0f4ed"]} />
              <ambientLight intensity={1.6} />
              <directionalLight position={[4, 5, 5]} intensity={2.2} />
              <directionalLight position={[-3, -2, 2]} intensity={0.8} />
              <group rotation={[0, rotation, 0]}>
                <ProteinTrace
                  data={data}
                  visible={visible}
                  highlight={highlight && selected === "complex"}
                />
              </group>
              <OrbitControls
                ref={controls}
                makeDefault
                enablePan={false}
                minDistance={1.6}
                maxDistance={7}
                enableDamping
              />
            </Canvas>
          </StructureBoundary>
        )}
        {data && canRender3d && !visible.length && (
          <div className="molecularViewer__empty" role="status">
            All chains are hidden. Select a chain below to show the structure.
          </div>
        )}
        <span className="molecularViewer__representation">
          Cα backbone trace · not a molecular surface
        </span>
        <div
          className="molecularViewer__viewControls"
          role="group"
          aria-label="Adjust protein view"
        >
          <button
            type="button"
            disabled={!data || !canRender3d}
            aria-label="Rotate protein left"
            onClick={() => setRotation((value) => value - Math.PI / 6)}
          >
            ↶
          </button>
          <button
            type="button"
            disabled={!data || !canRender3d}
            aria-label="Rotate protein right"
            onClick={() => setRotation((value) => value + Math.PI / 6)}
          >
            ↷
          </button>
          <button
            type="button"
            disabled={!data || !canRender3d}
            aria-label="Zoom in on protein"
            onClick={() => zoom(0.82)}
          >
            +
          </button>
          <button
            type="button"
            disabled={!data || !canRender3d}
            aria-label="Zoom out from protein"
            onClick={() => zoom(1.22)}
          >
            −
          </button>
          <button
            type="button"
            disabled={!data || !canRender3d}
            onClick={() => {
              controls.current?.reset();
              setRotation(0);
            }}
          >
            Reset
          </button>
        </div>
      </div>
      <div className="molecularViewer__options">
        {structure.chains.map((chain) => (
          <label key={chain.id}>
            <input
              type="checkbox"
              disabled={!canRender3d}
              checked={visible.includes(chain.id)}
              onChange={() =>
                setVisible((current) =>
                  current.includes(chain.id)
                    ? current.filter((id) => id !== chain.id)
                    : [...current, chain.id],
                )
              }
            />
            <i style={{ background: chain.color }} aria-hidden="true" />
            {chain.name}
            <small>chain {chain.id}</small>
          </label>
        ))}
        {selected === "complex" && (
          <label>
            <input
              type="checkbox"
              disabled={!canRender3d}
              checked={highlight}
              onChange={(event) => setHighlight(event.target.checked)}
            />
            <i className="molecularViewer__interfaceKey" aria-hidden="true" />
            Interface residues
          </label>
        )}
      </div>
      {canRender3d && (
        <p className="molecularViewer__instructions">
          Drag to rotate · pinch or scroll to zoom · buttons also work with a
          keyboard.
        </p>
      )}
      <p className="molecularViewer__context">{structure.description}</p>
      {data && selected === "complex" && (
        <details className="molecularViewer__contacts">
          <summary>
            {data.contacts.length} residue pairs within 4 Å — inspect the
            interface
          </summary>
          <p>
            Calculated from deposited protein heavy atoms, excluding waters and
            other non-protein records. Gold markers identify the corresponding
            Cα positions. These are geometric contacts, not hydrogen-bond
            assignments or predicted affinities.
          </p>
          <div className="molecularViewer__contactList">
            {data.contacts.slice(0, 8).map(({ left, right, distance }) => (
              <span key={`${residueKey(left)}-${residueKey(right)}`}>
                {left.chain}:{left.residueName} {left.residue} ↔ {right.chain}:
                {right.residueName} {right.residue}
                <b>{distance.toFixed(2)} Å</b>
              </span>
            ))}
          </div>
          <small>
            Eight closest residue pairs shown; author residue numbering
            retained.
          </small>
        </details>
      )}
      <div className="molecularViewer__sources">
        <a href={fileUrl} download={structure.file}>
          Download original {structure.id}.pdb ↗
        </a>
        <a
          href={`https://www.rcsb.org/structure/${structure.id}`}
          target="_blank"
          rel="noreferrer"
        >
          RCSB entry &amp; publication ↗
        </a>
      </div>
    </section>
  );
}
