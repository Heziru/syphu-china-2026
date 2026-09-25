import { useLayoutEffect, useRef, type ReactNode } from "react";
import { Group, Mesh, Vector3, type BufferGeometry } from "three";
import { spherePoint } from "./journeyMotion";
import { TessellateModifier } from "three/addons/modifiers/TessellateModifier.js";

/** Bend authored local geometry onto the ground. Flat slabs cannot contact a sphere. */
export function SphereMounted({ children }: { children: ReactNode }) {
  const host = useRef<Group>(null);
  useLayoutEffect(() => {
    const root = host.current;
    if (!root) return;
    root.updateWorldMatrix(true, true);
    const inverse = root.matrixWorld.clone().invert();
    const saved: {
      mesh: Mesh;
      original: BufferGeometry;
      warped: BufferGeometry;
    }[] = [];
    root.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      const original = object.geometry;
      const matrix = inverse.clone().multiply(object.matrixWorld),
        back = matrix.clone().invert();
      // Long faces need interior vertices: bending only corners leaves straight chords.
      const planar = original.clone().applyMatrix4(matrix);
      const warped = new TessellateModifier(0.18, 7).modify(planar);
      planar.dispose();
      const positions = warped.getAttribute("position"),
        v = new Vector3();
      for (let i = 0; i < positions.count; i++) {
        v.fromBufferAttribute(positions, i);
        v.set(...spherePoint(v.x, v.y, v.z)).applyMatrix4(back);
        positions.setXYZ(i, v.x, v.y, v.z);
      }
      warped.computeVertexNormals();
      warped.computeBoundingSphere();
      warped.computeBoundingBox();
      object.geometry = warped;
      object.castShadow = true;
      object.receiveShadow = true;
      saved.push({ mesh: object, original, warped });
    });
    return () =>
      saved.forEach(({ mesh, original, warped }) => {
        mesh.geometry = original;
        warped.dispose();
      });
  }, []);
  return <group ref={host}>{children}</group>;
}
