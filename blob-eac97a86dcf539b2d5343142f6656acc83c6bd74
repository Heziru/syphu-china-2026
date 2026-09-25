import { useMemo } from "react";
import { Shape } from "three";

type Props = {
  scale?: number;
};

const RED = "#8f2f36";
const RED_DARK = "#68252d";
const STONE = "#e6cfaa";
const STONE_LIGHT = "#f2dfbd";
const GLASS = "#5b8990";

function Block({
  position,
  scale,
  color,
  roughness = 0.72,
}: {
  position: [number, number, number];
  scale: [number, number, number];
  color: string;
  roughness?: number;
}) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <boxGeometry args={scale} />
      <meshStandardMaterial color={color} roughness={roughness} />
    </mesh>
  );
}

function WindowGrid({
  x,
  count,
  y = 1.38,
}: {
  x: number;
  count: number;
  y?: number;
}) {
  return (
    <group>
      {Array.from({ length: count }, (_, index) => {
        const px = x + (index - (count - 1) / 2) * 0.37;
        return [0, 0.48, 0.96].map((dy) => (
          <group key={`${index}-${dy}`} position={[px, y + dy, 0.366]}>
            <Block
              position={[0, 0, 0]}
              scale={[0.19, 0.25, 0.045]}
              color={GLASS}
              roughness={0.35}
            />
            <Block
              position={[0, 0, 0.029]}
              scale={[0.026, 0.25, 0.018]}
              color={STONE_LIGHT}
            />
          </group>
        ));
      })}
    </group>
  );
}

function Wing({ side }: { side: -1 | 1 }) {
  const x = side * 3.25;
  return (
    <group position={[x, 0, 0]} name={side < 0 ? "west-wing" : "east-wing"}>
      <Block position={[0, 1.38, 0]} scale={[3.8, 2.75, 0.68]} color={RED} />
      <Block
        position={[0, 0.15, 0.025]}
        scale={[3.95, 0.3, 0.74]}
        color={STONE}
      />
      <Block
        position={[0, 1.17, 0.37]}
        scale={[3.95, 0.14, 0.09]}
        color={STONE_LIGHT}
      />
      <Block
        position={[0, 2.13, 0.37]}
        scale={[3.95, 0.12, 0.09]}
        color={STONE_LIGHT}
      />
      <Block
        position={[0, 2.78, 0.02]}
        scale={[4.02, 0.16, 0.78]}
        color={STONE_LIGHT}
      />
      <WindowGrid x={0} count={8} />
    </group>
  );
}

function Columns() {
  return (
    <group name="entrance-colonnade">
      {[-1.38, -0.96, 0.96, 1.38].map((x) => (
        <group key={x} position={[x, 0, 0.65]}>
          <mesh position={[0, 1.03, 0]} castShadow>
            <cylinderGeometry args={[0.085, 0.105, 1.9, 16]} />
            <meshStandardMaterial color={STONE_LIGHT} roughness={0.62} />
          </mesh>
          <Block
            position={[0, 0.08, 0]}
            scale={[0.26, 0.16, 0.26]}
            color={STONE}
          />
          <Block
            position={[0, 2, 0]}
            scale={[0.24, 0.14, 0.24]}
            color={STONE}
          />
        </group>
      ))}
    </group>
  );
}

export function SchoolBuilding({ scale = 1 }: Props) {
  const pediment = useMemo(() => {
    const shape = new Shape();
    shape.moveTo(-1.45, 0);
    shape.lineTo(0, 0.72);
    shape.lineTo(1.45, 0);
    shape.closePath();
    return shape;
  }, []);

  return (
    <group scale={scale} name="spu-main-building">
      <Wing side={-1} />
      <Wing side={1} />

      <group name="central-building">
        <Block
          position={[0, 1.55, 0.02]}
          scale={[2.75, 3.1, 0.82]}
          color={RED_DARK}
        />
        <Block
          position={[0, 0.18, 0.48]}
          scale={[2.9, 0.36, 1.05]}
          color={STONE}
        />
        <Block
          position={[0, 2.86, 0.04]}
          scale={[2.95, 0.18, 0.9]}
          color={STONE_LIGHT}
        />
        <Block
          position={[0, 1.35, 0.46]}
          scale={[0.78, 1.72, 0.08]}
          color={GLASS}
          roughness={0.32}
        />
        {[-0.26, 0, 0.26].map((x) => (
          <Block
            key={x}
            position={[x, 1.35, 0.515]}
            scale={[0.045, 1.72, 0.04]}
            color={STONE_LIGHT}
          />
        ))}
        <Columns />
        <mesh position={[0, 2.31, 0.69]} castShadow>
          <extrudeGeometry
            args={[
              pediment,
              {
                depth: 0.12,
                bevelEnabled: true,
                bevelSize: 0.035,
                bevelThickness: 0.035,
              },
            ]}
          />
          <meshStandardMaterial color={STONE_LIGHT} roughness={0.66} />
        </mesh>
        {Array.from({ length: 7 }, (_, i) => (
          <Block
            key={i}
            position={[0, 0.05 + i * 0.075, 1.04 + i * 0.12]}
            scale={[2.65 - i * 0.12, 0.075, 0.32]}
            color={STONE}
          />
        ))}

        <group position={[0, 3.35, 0]} name="cupola">
          <Block
            position={[0, 0, 0]}
            scale={[1.12, 0.52, 0.68]}
            color={RED_DARK}
          />
          {[-0.38, -0.13, 0.13, 0.38].map((x) => (
            <Block
              key={x}
              position={[x, 0.02, 0.365]}
              scale={[0.13, 0.31, 0.045]}
              color={GLASS}
              roughness={0.3}
            />
          ))}
          <mesh position={[0, 0.52, 0]} scale={[1, 0.58, 0.72]} castShadow>
            <sphereGeometry
              args={[0.67, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2]}
            />
            <meshStandardMaterial color={STONE_LIGHT} roughness={0.58} />
          </mesh>
          <mesh position={[0, 1.2, 0]} castShadow>
            <coneGeometry args={[0.055, 0.72, 12]} />
            <meshStandardMaterial
              color={STONE}
              roughness={0.46}
              metalness={0.12}
            />
          </mesh>
        </group>
      </group>
    </group>
  );
}
