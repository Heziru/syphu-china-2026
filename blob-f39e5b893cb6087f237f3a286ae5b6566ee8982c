import { SoftBox } from "./SoftBox";
import { GlassVessel } from "./LabEquipment";
import { SpecimenBottles, TubeRack } from "./RoomAccents";

function Block({
  p,
  s,
  color = "#E4E4D5",
}: {
  p: [number, number, number];
  s: [number, number, number];
  color?: string;
}) {
  return (
    <mesh position={p} castShadow receiveShadow>
      <boxGeometry args={s} />
      <meshStandardMaterial color={color} roughness={0.75} />
    </mesh>
  );
}
function Kit({ color = "#789A94" }: { color?: string }) {
  return (
    <group>
      <SoftBox
        position={[0, 0.055, 0]}
        size={[0.23, 0.11, 0.16]}
        color="#E4E1D2"
        radius={0.007}
      />
      <Block p={[0, 0.086, 0.081]} s={[0.23, 0.033, 0.003]} color={color} />
      <Block
        p={[-0.04, 0.042, 0.083]}
        s={[0.095, 0.025, 0.002]}
        color="#FAF7EF"
      />
      {[0, 1, 2, 3].map((i) => (
        <Block
          key={i}
          p={[0.037 + i * 0.009, 0.035, 0.083]}
          s={[0.003, 0.026, 0.002]}
          color="#566D64"
        />
      ))}
    </group>
  );
}
function TipBox({ open = false }: { open?: boolean }) {
  return (
    <group>
      <SoftBox
        position={[0, 0.04, 0]}
        size={[0.22, 0.08, 0.15]}
        color="#76988E"
        radius={0.008}
      />
      <Block p={[0, 0.083, 0]} s={[0.205, 0.012, 0.136]} color="#E9E5C9" />
      {Array.from({ length: 24 }, (_, i) => (
        <mesh
          key={i}
          position={[
            -0.077 + (i % 6) * 0.031,
            0.092,
            -0.048 + Math.floor(i / 6) * 0.031,
          ]}
        >
          <cylinderGeometry args={[0.006, 0.004, 0.02, 6]} />
          <meshStandardMaterial color="#CCC9B0" />
        </mesh>
      ))}
      <group position={[0, 0.095, -0.075]} rotation={[open ? -1.2 : 0, 0, 0]}>
        <mesh position={[0, 0, 0.075]}>
          <boxGeometry args={[0.23, 0.018, 0.16]} />
          <meshStandardMaterial
            color="#CADBD5"
            transparent
            opacity={0.45}
            depthWrite={false}
          />
        </mesh>
      </group>
    </group>
  );
}
export function Supplies({
  variant = "pipetting",
}: {
  variant?: "pipetting" | "kits" | "bottles";
}) {
  if (variant === "kits")
    return (
      <group>
        {[0, 1, 2].map((i) => (
          <group
            key={i}
            position={[-0.14, i * 0.112, 0]}
            rotation={[0, i === 1 ? 0.06 : 0, 0]}
          >
            <Kit color={i % 2 ? "#BDA57C" : "#789A94"} />
          </group>
        ))}
        <group position={[0.16, 0, 0]}>
          <TipBox />
        </group>
      </group>
    );
  if (variant === "bottles")
    return (
      <group>
        <SpecimenBottles count={4} />
        <group position={[0.11, 0, 0.17]}>
          <SpecimenBottles count={3} scale={0.8} />
        </group>
      </group>
    );
  return (
    <group>
      <group position={[-0.14, 0, 0]}>
        <TipBox open />
      </group>
      <group position={[0.13, 0, 0]}>
        <TipBox />
      </group>
      <group position={[0, 0, -0.21]}>
        <Block p={[0, 0.01, 0]} s={[0.34, 0.02, 0.11]} />
        <Block p={[0, 0.2, -0.035]} s={[0.023, 0.38, 0.023]} color="#74948B" />
        <Block p={[0, 0.38, 0]} s={[0.31, 0.025, 0.1]} />
        {[-0.1, 0, 0.1].map((x) => (
          <group key={x} position={[x, 0, 0]}>
            <mesh position={[0, 0.29, 0]}>
              <cylinderGeometry args={[0.016, 0.014, 0.22, 10]} />
              <meshStandardMaterial color="#F2F1E7" />
            </mesh>
            <mesh position={[0, 0.16, 0]}>
              <coneGeometry args={[0.01, 0.09, 8]} />
              <meshStandardMaterial color="#ABBAB1" />
            </mesh>
            <Block p={[0, 0.41, 0]} s={[0.028, 0.028, 0.028]} color="#54847C" />
          </group>
        ))}
      </group>
    </group>
  );
}
export function SupplyCart() {
  return (
    <group name="three-tier-supply-cart">
      {[0.17, 0.53, 0.89].map((y, i) => (
        <group key={y}>
          <SoftBox
            position={[0, y, 0]}
            size={[0.8, 0.035, 0.5]}
            color="#93A69B"
            radius={0.012}
          />
          <Block
            p={[0, y + 0.04, -0.24]}
            s={[0.78, 0.065, 0.015]}
            color="#A8B4A7"
          />
          {i === 0 ? (
            <group position={[0, y + 0.018, 0]}>
              <Supplies variant="kits" />
            </group>
          ) : i === 1 ? (
            <group position={[-0.29, y + 0.018, -0.07]}>
              <Supplies variant="bottles" />
            </group>
          ) : (
            <group position={[0, y + 0.018, 0]}>
              <group position={[-0.17, 0, 0]} scale={0.7}>
                <TubeRack />
              </group>
              <group position={[0.22, 0, 0]}>
                <GlassVessel />
              </group>
            </group>
          )}
        </group>
      ))}
      {[-0.365, 0.365].flatMap((x) =>
        [-0.21, 0.21].map((z) => (
          <group key={x + ":" + z}>
            <Block p={[x, 0.51, z]} s={[0.025, 0.91, 0.025]} color="#667F75" />
            {[0.17, 0.53, 0.89].map((y) => (
              <mesh key={y} position={[x, y, z]}>
                <cylinderGeometry args={[0.023, 0.023, 0.05, 10]} />
                <meshStandardMaterial color="#789087" roughness={0.52} />
              </mesh>
            ))}
            <mesh
              position={[x, 0.055, z]}
              rotation={[0, 0, Math.PI / 2]}
              castShadow
            >
              <cylinderGeometry args={[0.052, 0.052, 0.035, 12]} />
              <meshStandardMaterial color="#424D48" />
            </mesh>
            <mesh position={[x, 0.055, z + (z > 0 ? 0.022 : -0.022)]}>
              <cylinderGeometry args={[0.02, 0.02, 0.042, 10]} />
              <meshStandardMaterial color="#738078" metalness={0.35} />
            </mesh>
          </group>
        )),
      )}
    </group>
  );
}
