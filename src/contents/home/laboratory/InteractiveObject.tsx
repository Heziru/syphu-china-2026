import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import type { ThreeEvent } from "@react-three/fiber";
import type { Group } from "three";
import type { LabObjectDef } from "../types/laboratory";
import { useLaboratoryStore } from "../store/laboratoryStore";
import { PlaceholderObject } from "./PlaceholderObject";
import type { FurnitureSpec } from "./roomPlacement";

type Props = {
  def: LabObjectDef;
  placement?: FurnitureSpec;
  children?: ReactNode;
  reduced: boolean;
  onNavigate: (path: string) => void;
};

export function InteractiveObject({
  def,
  placement,
  children,
  reduced,
}: Props) {
  const group = useRef<Group>(null);
  const pointer = useRef({ x: 0, y: 0, moved: false });
  const hoveredId = useLaboratoryStore((s) => s.hoveredId);
  const setHovered = useLaboratoryStore((s) => s.setHovered);
  const setSelected = useLaboratoryStore((s) => s.setSelected);
  const locked = useLaboratoryStore((s) => s.locked);
  const phase = useLaboratoryStore((s) => s.phase);
  const hovered = hoveredId === def.id;
  const inspect = useLaboratoryStore((s) => s.inspect);

  const busy = locked || phase === "focusing" || phase === "transitioning";

  const onPointerOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    if (busy) return;
    setHovered(def.id);
    if (!group.current || reduced || placement) return;
    gsap.to(group.current.scale, {
      x: def.hoverAnim === "scale" ? 1.06 : 1.02,
      y: def.hoverAnim === "scale" ? 1.06 : 1.02,
      z: def.hoverAnim === "scale" ? 1.06 : 1.02,
      duration: 0.15,
      overwrite: true,
    });
  };

  const onPointerOut = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    if (hoveredId === def.id) setHovered(null);
    if (!group.current) return;
    gsap.to(group.current.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 0.16,
      overwrite: true,
    });
  };

  const onPointerDown = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    pointer.current = {
      x: event.nativeEvent.clientX,
      y: event.nativeEvent.clientY,
      moved: false,
    };
  };

  const onPointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (!event.buttons) return;
    const dx = event.nativeEvent.clientX - pointer.current.x;
    const dy = event.nativeEvent.clientY - pointer.current.y;
    if (dx * dx + dy * dy > 36) pointer.current.moved = true;
  };

  const onClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (busy || pointer.current.moved) return;
    setSelected(def.id);
    if (group.current && !reduced && !placement) {
      gsap.fromTo(
        group.current.scale,
        { x: 1.04, y: 1.04, z: 1.04 },
        { x: 1, y: 1, z: 1, duration: 0.18, overwrite: true },
      );
    }
    inspect(placement?.id ?? def.id);
  };

  return (
    <group
      ref={group}
      name={placement?.id ?? def.id}
      position={placement?.position ?? def.position}
      rotation={placement ? [0, placement.rotationY, 0] : def.rotation}
      scale={def.scale}
    >
      {children ?? <PlaceholderObject id={def.id} />}
      <mesh
        position={def.hitOffset}
        onPointerOver={onPointerOver}
        onPointerOut={onPointerOut}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onClick={onClick}
      >
        <boxGeometry args={def.hitSize} />
        <meshBasicMaterial
          transparent
          opacity={hovered ? 0.08 : 0}
          color="#D88B72"
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
