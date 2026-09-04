import { useLayoutEffect, useRef, type ReactNode } from "react";
import { Box3, Group, Vector3 } from "three";
import type { Size } from "./layoutMath";

/** Fit an authored model once, preserving proportions and normalizing its contact plane. */
export function ModelAsset({
  children,
  size,
  id,
  yaw = 0,
}: {
  children: ReactNode;
  size: Size;
  id: string;
  yaw?: number;
}) {
  const host = useRef<Group>(null);
  const [w, h, d] = size;
  useLayoutEffect(() => {
    if (!host.current) return;
    const object = host.current;
    // Clone hierarchy only: measuring must not include any parent/world transform.
    const probe = object.clone(true);
    probe.position.set(0, 0, 0);
    probe.rotation.set(0, yaw, 0);
    probe.scale.setScalar(1);
    probe.updateMatrixWorld(true);
    const box = new Box3().setFromObject(probe, true),
      extent = box.getSize(new Vector3()),
      center = box.getCenter(new Vector3());
    const scale = Math.min(w / extent.x, h / extent.y, d / extent.z);
    if (!Number.isFinite(scale) || scale <= 0)
      throw new Error("Invalid model bounds: " + id);
    object.rotation.set(0, yaw, 0);
    object.scale.setScalar(scale);
    object.position.set(
      -center.x * scale,
      -box.min.y * scale,
      -center.z * scale,
    );
    object.userData.assetFit = {
      id,
      reserved: [w, h, d],
      actual: extent.multiplyScalar(scale).toArray(),
      contactY: 0,
    };
    return () => {
      object.position.set(0, 0, 0);
      object.scale.setScalar(1);
      object.rotation.set(0, 0, 0);
    };
  }, [w, h, d, id, yaw]);
  return (
    <group ref={host} name={"asset:" + id}>
      {children}
    </group>
  );
}
