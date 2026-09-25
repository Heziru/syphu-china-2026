import { useMemo, useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import { Group, Mesh, type Material, type BufferGeometry } from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

const cache = new WeakMap<Group, Group>();
/** Batch static Blender parts by material; the editable master retains every named part. */
function prepare(source: Group) {
  const existing = cache.get(source);
  if (existing) return existing;
  source.updateMatrixWorld(true);
  const buckets = new Map<Material, BufferGeometry[]>();
  source.traverse((o) => {
    if (!(o instanceof Mesh) || Array.isArray(o.material)) return;
    const geometry = o.geometry.clone().applyMatrix4(o.matrixWorld);
    for (const attr of Object.keys(geometry.attributes)) {
      if (attr !== "position" && attr !== "normal")
        geometry.deleteAttribute(attr);
    }
    if (!geometry.getAttribute("normal")) geometry.computeVertexNormals();
    const list = buckets.get(o.material) ?? [];
    list.push(geometry);
    buckets.set(o.material, list);
  });
  const group = new Group();
  for (const [material, geometries] of buckets) {
    const geometry = mergeGeometries(geometries, false);
    if (geometry) {
      const mesh = new Mesh(geometry, material);
      mesh.name = material.name;
      mesh.castShadow = mesh.receiveShadow = true;
      group.add(mesh);
    }
    geometries.forEach((g) => g.dispose());
  }
  cache.set(source, group);
  return group;
}
export function BlenderAsset({
  name,
  activity = 1,
}: {
  name: string;
  activity?: number;
}) {
  const { scene } = useGLTF(
    import.meta.env.BASE_URL + "assets/models/" + name + ".glb",
  );
  const model = useMemo(() => {
    const copy = prepare(scene).clone(true);
    copy.traverse((o) => {
      if (o instanceof Mesh && !Array.isArray(o.material))
        o.material = o.material.clone();
    });
    return copy;
  }, [scene]);
  useEffect(() => {
    model.traverse((o) => {
      if (
        o instanceof Mesh &&
        /pspa/i.test(o.name) &&
        !Array.isArray(o.material)
      ) {
        o.material.transparent = true;
        o.material.opacity = activity;
        o.material.depthWrite = activity > 0.98;
      }
    });
  }, [model, activity]);
  useEffect(
    () => () =>
      model.traverse((o) => {
        if (o instanceof Mesh && !Array.isArray(o.material))
          o.material.dispose();
      }),
    [model],
  );
  return <primitive object={model} />;
}
