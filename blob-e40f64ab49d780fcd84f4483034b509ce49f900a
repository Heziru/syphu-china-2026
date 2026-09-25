import { LAB_COLORS as C } from "./labPalette";
import { SoftBox } from "./SoftBox";

export function Plant({ scale = 1 }: { scale?: number }) {
  return (
    <group scale={scale}>
      <mesh position={[0, 0.09, 0]} castShadow>
        <cylinderGeometry args={[0.11, 0.085, 0.18, 16]} />
        <meshStandardMaterial color={C.paper} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.184, 0]}>
        <cylinderGeometry args={[0.099, 0.099, 0.008, 16]} />
        <meshStandardMaterial color="#554B35" />
      </mesh>
      {Array.from({ length: 9 }, (_, i) => {
        const a = i * 2.399,
          r = 0.055 + (i % 3) * 0.013,
          h = 0.24 + (i % 4) * 0.043;
        return (
          <group key={i} rotation={[0, a, 0]}>
            <mesh
              position={[r / 2, h - 0.045, 0]}
              rotation={[0, 0, -0.28]}
              castShadow
            >
              <cylinderGeometry args={[0.004, 0.005, h - 0.14, 5]} />
              <meshStandardMaterial color="#667143" />
            </mesh>
            <mesh
              position={[r, h, 0]}
              rotation={[0, 0, -0.65]}
              scale={[0.06, 0.135, 0.019]}
              castShadow
            >
              <sphereGeometry args={[1, 9, 7]} />
              <meshStandardMaterial
                color={i % 2 ? "#727F4B" : "#526845"}
                roughness={0.82}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
export function SpecimenBottles({
  count = 4,
  scale = 1,
}: {
  count?: number;
  scale?: number;
}) {
  return (
    <group scale={scale}>
      {Array.from({ length: count }, (_, i) => (
        <group key={i} position={[i * 0.12, 0, 0]}>
          <mesh position={[0, 0.066, 0]} castShadow>
            <cylinderGeometry args={[0.035, 0.038, 0.13, 10]} />
            <meshStandardMaterial
              color={i % 3 === 0 ? "#BBA176" : "#DDE4DA"}
              roughness={0.25}
              transparent
              opacity={0.8}
            />
          </mesh>
          <mesh position={[0, 0.146, 0]}>
            <cylinderGeometry args={[0.021, 0.024, 0.035, 10]} />
            <meshStandardMaterial color={C.teal} roughness={0.65} />
          </mesh>
          <SoftBox
            position={[0, 0.065, 0.036]}
            size={[0.042, 0.046, 0.002]}
            radius={0.001}
            color={C.paper}
            cast={false}
          />
        </group>
      ))}
    </group>
  );
}
export function TubeRack() {
  return (
    <group>
      <SoftBox
        position={[0, 0.016, 0]}
        size={[0.4, 0.028, 0.19]}
        color={C.paper}
        radius={0.006}
      />
      <SoftBox
        position={[0, 0.11, 0]}
        size={[0.4, 0.018, 0.19]}
        color={C.paper}
        radius={0.005}
      />
      {[-0.16, 0.16].map((x) => (
        <SoftBox
          key={x}
          position={[x, 0.065, 0]}
          size={[0.015, 0.1, 0.18]}
          color={C.paper}
          radius={0.003}
        />
      ))}
      {[-0.13, 0, 0.13].flatMap((x, i) =>
        [-0.045, 0.045].map((z, j) => (
          <group key={i + "-" + j} position={[x, 0, z]}>
            <mesh position={[0, 0.11, 0]} castShadow>
              <cylinderGeometry args={[0.018, 0.012, 0.19, 10]} />
              <meshStandardMaterial
                color="#C3D7CE"
                transparent
                opacity={0.68}
                roughness={0.16}
              />
            </mesh>
            <mesh position={[0, 0.211, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.025, 10]} />
              <meshStandardMaterial color={C.teal} />
            </mesh>
          </group>
        )),
      )}
    </group>
  );
}
export function PetriDishes() {
  return (
    <group>
      {[
        [-0.07, 0],
        [0.065, 0.025],
        [0.01, -0.075],
      ].map(([x, z], i) => (
        <group key={i} position={[x, 0.014, z]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.056, 0.056, 0.018, 20]} />
            <meshStandardMaterial color="#CEAC7C" roughness={0.48} />
          </mesh>
          <mesh position={[0, 0.012, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.009, 20]} />
            <meshPhysicalMaterial
              color="#E3EADF"
              transparent
              opacity={0.4}
              roughness={0.15}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}
export function LabStool() {
  return (
    <group>
      <mesh position={[0, 0.56, 0]} castShadow>
        <cylinderGeometry args={[0.245, 0.235, 0.08, 24]} />
        <meshStandardMaterial color={C.teal} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.025, 0.03, 0.48, 12]} />
        <meshStandardMaterial
          color={C.metal}
          metalness={0.65}
          roughness={0.35}
        />
      </mesh>
      <mesh position={[0, 0.27, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.17, 0.012, 6, 24]} />
        <meshStandardMaterial color={C.metal} metalness={0.6} />
      </mesh>
      {Array.from({ length: 5 }, (_, i) => (
        <group key={i} rotation={[0, (i * Math.PI * 2) / 5, 0]}>
          <SoftBox
            position={[0, 0.064, 0.135]}
            size={[0.035, 0.03, 0.29]}
            color={C.structure}
            radius={0.01}
          />
          <mesh
            position={[0, 0.033, 0.27]}
            rotation={[0, 0, Math.PI / 2]}
            castShadow
          >
            <cylinderGeometry args={[0.032, 0.032, 0.032, 10]} />
            <meshStandardMaterial color={C.dark} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
