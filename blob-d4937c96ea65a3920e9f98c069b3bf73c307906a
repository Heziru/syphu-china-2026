import {
  useMemo,
  useRef,
  useEffect,
  useState,
  type MutableRefObject,
} from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  BufferGeometry,
  BufferAttribute,
  Group,
  Mesh,
  Color,
  MeshStandardMaterial,
  DoubleSide,
  CanvasTexture,
  RepeatWrapping,
  SRGBColorSpace,
} from "three";
import { earthPose } from "./orbitalSceneMotion";
import { PREVIEW_POLYGONS } from "./globePreviewData";
export type GlobeData = {
  source: string;
  metric: string;
  regions: Record<string, Record<string, number | string>>;
  features: {
    name: string;
    iso: string;
    region: string | null;
    polygons: number[][][][];
  }[];
};
type Slice = { offset: number; length: number };
type RegionMesh = {
  name: string;
  focusLongitude: number;
  position: Slice;
  normal: Slice;
  morph1990: Slice;
  morph2019: Slice;
  index: Slice;
};
type Manifest = Omit<GlobeData, "features"> & { geometry: RegionMesh[] };
type Assets = { meta: Manifest; bytes: ArrayBuffer };
function checkedAssets(meta: Manifest, bytes: ArrayBuffer): Assets {
  if (
    !meta ||
    !meta.regions ||
    !Array.isArray(meta.geometry) ||
    !meta.geometry.length
  )
    throw new Error("Invalid Earth manifest");
  let end = 0;
  const checkSlice = (slice: Slice | undefined, unit: number) => {
    if (
      !slice ||
      !Number.isSafeInteger(slice.offset) ||
      !Number.isSafeInteger(slice.length) ||
      slice.offset < 0 ||
      slice.length <= 0 ||
      slice.offset % unit !== 0 ||
      slice.offset + slice.length * unit > bytes.byteLength
    )
      throw new Error("Incomplete Earth geometry");
    end = Math.max(end, slice.offset + slice.length * unit);
  };
  for (const region of meta.geometry) {
    if (
      !region ||
      typeof region.name !== "string" ||
      !Number.isFinite(region.focusLongitude)
    )
      throw new Error("Invalid Earth region");
    checkSlice(region.position, 2);
    checkSlice(region.normal, 2);
    checkSlice(region.morph1990, 2);
    checkSlice(region.morph2019, 2);
    checkSlice(region.index, 4);
    const count = region.position.length / 3;
    if (
      !Number.isInteger(count) ||
      region.normal.length !== count * 3 ||
      region.morph1990.length !== count ||
      region.morph2019.length !== count ||
      region.index.length % 3 !== 0
    )
      throw new Error("Mismatched Earth geometry");
    for (const index of new Uint32Array(
      bytes,
      region.index.offset,
      region.index.length,
    ))
      if (index >= count) throw new Error("Invalid Earth mesh index");
  }
  if (end !== bytes.byteLength)
    throw new Error("Unexpected Earth geometry length");
  return { meta, bytes };
}
let pending: Promise<Assets> | null = null;
function loadAssets() {
  if (!pending) {
    const base = import.meta.env.BASE_URL + "assets/cosmic/";
    const binary = async () => {
      const compressed = typeof DecompressionStream !== "undefined";
      const response = await fetch(
        base + "earth-geometry.bin" + (compressed ? ".gz" : ""),
      );
      if (!response.ok) throw new Error("Earth geometry unavailable");
      const bytes = await response.arrayBuffer();
      const signature = new Uint8Array(bytes, 0, Math.min(2, bytes.byteLength));
      // Vite/CDNs may already decode Content-Encoding; static hosts may send
      // the gzip file verbatim. Decode only when its magic bytes remain.
      if (compressed && signature[0] === 0x1f && signature[1] === 0x8b)
        return new Response(
          new Blob([bytes])
            .stream()
            .pipeThrough(new DecompressionStream("gzip")),
        ).arrayBuffer();
      return bytes;
    };
    pending = Promise.all([
      fetch(base + "earth-manifest.json").then((r) => {
        if (!r.ok) throw new Error("Earth data unavailable");
        return r.json() as Promise<Manifest>;
      }),
      binary(),
    ])
      // Validate before React renders geometry: an HTML fallback or truncated
      // download must leave the preview intact, not trip the scene boundary.
      .then(([meta, bytes]) => checkedAssets(meta, bytes))
      .catch((error) => {
        pending = null;
        throw error;
      });
  }
  return pending;
}
function previewTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 768;
  canvas.height = 384;
  const c = canvas.getContext("2d")!;
  c.fillStyle = "#a4c6c3";
  c.fillRect(0, 0, 768, 384);
  c.fillStyle = "#e5e1c7";
  for (const poly of PREVIEW_POLYGONS)
    for (const shift of [-768, 0, 768]) {
      c.beginPath();
      for (const ring of poly) {
        ring.forEach(([lon, lat], i) => {
          const x = ((lon + 180) / 360) * 768 + shift,
            y = ((90 - lat) / 180) * 384;
          if (i) c.lineTo(x, y);
          else c.moveTo(x, y);
        });
        c.closePath();
      }
      c.fill("evenodd");
    }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.wrapS = RepeatWrapping;
  texture.offset.x = 0.25;
  return texture;
}
const smooth = (a: number, b: number, p: number) => {
  const t = Math.max(0, Math.min(1, (p - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const cream = new Color("#e5e1c7");
export function DataGlobe({
  progress,
  year,
  onSelect,
  selected,
  inspection = 0,
}: {
  progress: MutableRefObject<number>;
  year: number;
  onSelect: (s: string) => void;
  selected: string | null;
  inspection?: number;
}) {
  const [assets, setAssets] = useState<Assets | null>(null);
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    let alive = true;
    gl.domElement.dataset.earthGeometry = "preview";
    loadAssets()
      .then((result) => {
        if (alive) setAssets(result);
      })
      .catch(() => {
        if (alive) gl.domElement.dataset.earthGeometry = "preview-unavailable";
      });
    return () => {
      alive = false;
    };
  }, [gl]);
  const geo = useMemo(() => {
    if (!assets) return [];
    const { meta, bytes } = assets;
    return meta.geometry.map((region) => {
      const g = new BufferGeometry();
      const packed = new Int16Array(
        bytes,
        region.position.offset,
        region.position.length,
      );
      const positions = Float32Array.from(packed, (n) => (n / 32767) * 2.052);
      const target = (slice: Slice) => {
        const heights = new Uint16Array(bytes, slice.offset, slice.length),
          points = new Float32Array(positions.length);
        for (let i = 0; i < heights.length; i++) {
          const factor = 1 + ((heights[i] / 65535) * 0.26) / 2.052;
          for (let j = 0; j < 3; j++)
            points[i * 3 + j] = positions[i * 3 + j] * factor;
        }
        return new BufferAttribute(points, 3);
      };
      g.setAttribute("position", new BufferAttribute(positions, 3));
      g.setAttribute(
        "normal",
        new BufferAttribute(
          new Int16Array(bytes, region.normal.offset, region.normal.length),
          3,
          true,
        ),
      );
      g.morphAttributes.position = [
        target(region.morph1990),
        target(region.morph2019),
      ];
      g.setIndex(
        new BufferAttribute(
          new Uint32Array(bytes, region.index.offset, region.index.length),
          1,
        ),
      );
      const colors = [1990, 2019].map((y) =>
        region.name === "No regional estimate"
          ? new Color("#abb9b4")
          : new Color("#eee0b9").lerp(
              new Color("#cd6551"),
              Math.min(1, Number(meta.regions[region.name]?.[y] ?? 0) / 350),
            ),
      );
      return { ...region, geometry: g, colors };
    });
  }, [assets]);
  useEffect(() => {
    if (geo.length) gl.domElement.dataset.earthGeometry = "ready";
    return () => geo.forEach((r) => r.geometry.dispose());
  }, [geo, gl]);
  const texture = useMemo(previewTexture, []);
  useEffect(() => () => texture.dispose(), [texture]);
  const rig = useRef<Group>(null),
    spin = useRef<Group>(null),
    meshes = useRef<Mesh[]>([]);
  const aspect = useThree((s) => s.viewport.aspect);
  const focusLongitude = geo.find((r) => r.name === selected)?.focusLongitude;
  const holdBlend = useRef(0),
    holdAngle = useRef(0),
    yearBlend = useRef(year === 2019 ? 1 : 0);
  useEffect(() => {
    holdAngle.current = 0;
  }, [selected]);
  useFrame(({ clock }, dt) => {
    if (!rig.current || !spin.current) return;
    const step = Math.min(dt, 0.25),
      p = progress.current,
      pose = earthPose(p, clock.elapsedTime, aspect);
    holdBlend.current +=
      (inspection - holdBlend.current) * (1 - Math.exp(-7 * step));
    if (inspection > 0.5) {
      const angle = holdAngle.current + step * 0.48;
      holdAngle.current = Math.atan2(Math.sin(angle), Math.cos(angle));
    } else holdAngle.current *= Math.exp(-7 * step);
    const zoom = 1 + holdBlend.current * (aspect < 1 ? 0.13 : 0.21);
    rig.current.position.set(pose.x, pose.y, 0);
    rig.current.scale.setScalar(pose.scale * zoom);
    rig.current.visible = pose.visible;
    if (!pose.visible) return;
    const target =
      (focusLongitude ?? -0.4 + smooth(0.11, 0.225, p) * Math.PI * 2) +
      holdAngle.current;
    const delta = Math.atan2(
      Math.sin(target - spin.current.rotation.y),
      Math.cos(target - spin.current.rotation.y),
    );
    spin.current.rotation.y += delta * (1 - Math.exp(-12 * step));
    spin.current.rotation.z = -0.1;
    spin.current.rotation.x = 0.08;
    yearBlend.current +=
      ((year === 2019 ? 1 : 0) - yearBlend.current) * (1 - Math.exp(-9 * step));
    const heat = smooth(0.135, 0.16, p);
    meshes.current.forEach((mesh, i) => {
      if (!mesh || !geo[i]) return;
      if (!mesh.morphTargetInfluences) mesh.updateMorphTargets();
      if (mesh.morphTargetInfluences) {
        mesh.morphTargetInfluences[0] = heat * (1 - yearBlend.current);
        mesh.morphTargetInfluences[1] = heat * yearBlend.current;
      }
      const mat = mesh.material as MeshStandardMaterial;
      mat.color
        .copy(geo[i].colors[0])
        .lerp(geo[i].colors[1], yearBlend.current)
        .lerp(cream, 1 - heat);
      mat.emissive.set(selected === geo[i].name ? "#45695c" : "#000000");
      mat.emissiveIntensity = 0.13;
    });
  });
  return (
    <group ref={rig} name="data-earth">
      <group ref={spin} name="data-earth-spin">
        <mesh name={geo.length ? "earth-ocean" : "earth-preview"}>
          <sphereGeometry args={[2.047, 96, 64]} />
          <meshStandardMaterial
            color={geo.length ? "#a4c6c3" : "#ffffff"}
            map={geo.length ? null : texture}
            roughness={0.83}
          />
        </mesh>
        {geo.map((g, i) => (
          <mesh
            key={g.name}
            name={g.name}
            geometry={g.geometry}
            ref={(n) => {
              if (n) meshes.current[i] = n;
            }}
            onClick={(e) => {
              if (progress.current < 0.14) return;
              e.stopPropagation();
              onSelect(g.name);
            }}
          >
            <meshStandardMaterial
              color={g.colors[year === 2019 ? 1 : 0]}
              roughness={0.77}
              side={DoubleSide}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}
