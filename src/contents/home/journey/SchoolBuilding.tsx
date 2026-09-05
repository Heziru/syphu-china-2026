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
      <boxGeometry
        args={[
          ...scale,
          Math.max(1, Math.ceil(scale[0] / 0.24)),
          1,
          Math.max(1, Math.ceil(scale[2] / 0.24)),
        ]}
      />
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
      <WindowGrid x={0} count={8} y={0.65} />
      <Block
        position={[0, 1.64, 0.75]}
        scale={[3.85, 0.14, 0.78]}
        color={STONE_LIGHT}
      />
      {[-1.6, -0.8, 0, 0.8, 1.6].map((px) => (
        <group key={px} position={[px, 0, 1.02]}>
          <mesh position={[0, 0.79, 0]}>
            <cylinderGeometry args={[0.055, 0.07, 1.5, 12]} />
            <meshStandardMaterial color={STONE_LIGHT} />
          </mesh>
          <Block
            position={[0, 0.07, 0]}
            scale={[0.19, 0.12, 0.19]}
            color={STONE}
          />
          <Block
            position={[0, 1.55, 0]}
            scale={[0.17, 0.11, 0.17]}
            color={STONE_LIGHT}
          />
        </group>
      ))}
      {Array.from({ length: 27 }, (_, i) => (
        <Block
          key={i}
          position={[-1.82 + i * 0.14, 1.86, 1.02]}
          scale={[0.025, 0.3, 0.025]}
          color={STONE_LIGHT}
        />
      ))}
      <Block
        position={[0, 2.02, 1.02]}
        scale={[3.86, 0.045, 0.06]}
        color={STONE_LIGHT}
      />
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
        {[-0.86, 0, 0.86].map((x, i) => (
          <group key={x} position={[x, 0.38, 0.54]}>
            <Block
              position={[0, 0.54, 0]}
              scale={[i === 1 ? 0.82 : 0.53, 1.08, 0.06]}
              color={GLASS}
            />
            <mesh position={[0, 1.08, 0]}>
              <circleGeometry args={[i === 1 ? 0.41 : 0.265, 24, 0, Math.PI]} />
              <meshStandardMaterial color={GLASS} />
            </mesh>
            <mesh position={[0, 1.08, 0.04]}>
              <torusGeometry
                args={[i === 1 ? 0.44 : 0.29, 0.045, 8, 24, Math.PI]}
              />
              <meshStandardMaterial color={STONE_LIGHT} />
            </mesh>
            {[0.2, 0.4, 0.6, 0.8, 1].map((y) => (
              <Block
                key={y}
                position={[0, y, 0.05]}
                scale={[i === 1 ? 0.8 : 0.51, 0.025, 0.025]}
                color={STONE}
              />
            ))}
          </group>
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
            position={[0, 0.04 + i * 0.06, 1.5 - i * 0.1]}
            scale={[2.9 - i * 0.045, 0.08, 0.4]}
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
          <mesh position={[0, 0.26, 0]} scale={[1, 1.05, 0.85]} castShadow>
            <sphereGeometry
              args={[0.67, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2]}
            />
            <meshStandardMaterial color={STONE_LIGHT} roughness={0.58} />
          </mesh>
          <mesh position={[0, 1.27, 0]} castShadow>
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
