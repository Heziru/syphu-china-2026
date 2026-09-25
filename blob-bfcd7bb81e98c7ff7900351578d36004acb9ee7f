import { useLayoutEffect, useRef, type ReactNode } from "react";
import {
  BufferAttribute,
  Group,
  Matrix4,
  Mesh,
  type Material,
  type BufferGeometry,
  MeshStandardMaterial,
} from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

function materialKey(material: Material) {
  const m = material as MeshStandardMaterial;
  return [
    m.type,
    m.color?.getHex(),
    m.emissive?.getHex(),
    m.emissiveIntensity,
    m.roughness,
    m.metalness,
    m.opacity,
    m.transparent,
    m.side,
    m.depthWrite,
    m.map?.uuid,
    m.normalMap?.uuid,
    m.envMap?.uuid,
    m.envMapIntensity,
    material.type === "MeshPhysicalMaterial" ? material.uuid : "",
  ].join(":");
}
/** Reversible render-only batching. Authored nodes remain available for later edits. */
export function StaticBatch({ children }: { children: ReactNode }) {
  const host = useRef<Group>(null);
  useLayoutEffect(() => {
    const root = host.current;
    if (!root) return;
    root.updateWorldMatrix(true, true);
    const inverse = root.matrixWorld.clone().invert(),
      buckets = new Map<
        string,
        {
          material: Material;
          geometries: BufferGeometry[];
          cast: boolean;
          receive: boolean;
        }
      >();
    const hidden: Mesh[] = [];
    root.traverse((object) => {
      if (
        !(object instanceof Mesh) ||
        !object.visible ||
        object.children.length > 0 ||
        Array.isArray(object.material) ||
        object.material.transparent
      )
        return;
      // Interaction hitboxes are outside StaticBatch; transparent surfaces retain depth sorting.
      const matrix = new Matrix4().multiplyMatrices(
        inverse,
        object.matrixWorld,
      );
      let geo = object.geometry.clone();
      if (geo.index) {
        const indexed = geo;
        geo = indexed.toNonIndexed();
        indexed.dispose();
      }
      geo.applyMatrix4(matrix);
      if (!geo.getAttribute("normal")) geo.computeVertexNormals();
      if (!geo.getAttribute("uv"))
        geo.setAttribute(
          "uv",
          new BufferAttribute(
            new Float32Array(geo.getAttribute("position").count * 2),
            2,
          ),
        );
      for (const key of Object.keys(geo.attributes))
        if (!["position", "normal", "uv"].includes(key))
          geo.deleteAttribute(key);
      const key =
        materialKey(object.material) +
        ":" +
        object.castShadow +
        ":" +
        object.receiveShadow;
      const bucket = buckets.get(key) ?? {
        material: object.material,
        geometries: [] as BufferGeometry[],
        cast: object.castShadow,
        receive: object.receiveShadow,
      };
      bucket.geometries.push(geo);
      buckets.set(key, bucket);
      hidden.push(object);
    });
    const batch = new Group();
    batch.name = "static-render-batch";
    for (const bucket of buckets.values()) {
      const geo = mergeGeometries(bucket.geometries, false);
      bucket.geometries.forEach((g) => g.dispose());
      if (!geo) continue;
      const mesh = new Mesh(geo, bucket.material);
      mesh.castShadow = bucket.cast;
      mesh.receiveShadow = bucket.receive;
      batch.add(mesh);
    }
    // Preserve visibility when a merge unexpectedly fails.
    if (batch.children.length === buckets.size) {
      hidden.forEach((object) => {
        object.visible = false;
      });
      root.add(batch);
    }
    return () => {
      hidden.forEach((object) => {
        object.visible = true;
      });
      root.remove(batch);
      batch.traverse((object) => {
        if (object instanceof Mesh) object.geometry.dispose();
      });
    };
  }, [children]);
  return <group ref={host}>{children}</group>;
}
