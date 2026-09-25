import { LAB_COLORS } from "./labPalette";
import { SoftBox } from "./SoftBox";

/**
 * 显微镜：结构清晰的程序化占位，不是正式 GLB，也不是精细工业模型。
 * 优先远处可读轮廓：底座、弯臂、倾斜双目、物镜转盘、载物台、左右旋钮、底灯。
 */
export function MicroscopePlaceholder() {
  const benchY = 0.89;
  return (
    <group position={[0.02, benchY, 0.04]}>
      <SoftBox
        position={[0, 0.04, 0.02]}
        size={[0.52, 0.08, 0.38]}
        radius={0.03}
        color={LAB_COLORS.shell}
        roughness={0.44}
        metalness={0.05}
      />
      <SoftBox
        position={[0, 0.07, -0.12]}
        size={[0.26, 0.12, 0.18]}
        radius={0.04}
        color={LAB_COLORS.shell}
        roughness={0.44}
      />
      <mesh position={[0, 0.11, 0.02]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 0.06, 14]} />
        <meshStandardMaterial
          color="#F3E7B0"
          emissive="#E4D48A"
          emissiveIntensity={0.42}
          roughness={0.38}
        />
      </mesh>

      <SoftBox
        position={[0, 0.26, 0.08]}
        size={[0.34, 0.03, 0.3]}
        radius={0.01}
        color={LAB_COLORS.structure}
        roughness={0.46}
        metalness={0.2}
      />
      <SoftBox
        position={[0, 0.282, 0.05]}
        size={[0.18, 0.008, 0.055]}
        radius={0.003}
        color={LAB_COLORS.glass}
        roughness={0.18}
      />
      <SoftBox
        position={[-0.08, 0.288, 0.03]}
        size={[0.07, 0.012, 0.014]}
        radius={0.003}
        color={LAB_COLORS.metal}
        roughness={0.28}
        metalness={0.48}
      />
      <SoftBox
        position={[0.08, 0.288, 0.03]}
        size={[0.07, 0.012, 0.014]}
        radius={0.003}
        color={LAB_COLORS.metal}
        roughness={0.28}
        metalness={0.48}
      />

      <SoftBox
        position={[0, 0.22, -0.14]}
        size={[0.14, 0.28, 0.12]}
        radius={0.035}
        color={LAB_COLORS.shell}
        roughness={0.42}
      />
      <mesh position={[0, 0.42, -0.15]} rotation={[0.22, 0, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.058, 0.26, 12]} />
        <meshStandardMaterial color={LAB_COLORS.structure} roughness={0.38} metalness={0.24} />
      </mesh>
      <mesh position={[0, 0.6, -0.06]} rotation={[0.92, 0, 0]} castShadow>
        <cylinderGeometry args={[0.046, 0.052, 0.24, 12]} />
        <meshStandardMaterial color={LAB_COLORS.structure} roughness={0.38} metalness={0.24} />
      </mesh>

      <mesh position={[0, 0.46, 0.08]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.05, 16]} />
        <meshStandardMaterial color={LAB_COLORS.structure} roughness={0.36} metalness={0.22} />
      </mesh>
      {[
        { a: -0.5, len: 0.11 },
        { a: 0, len: 0.15 },
        { a: 0.5, len: 0.09 },
      ].map((lens) => (
        <mesh
          key={lens.a}
          position={[
            Math.sin(lens.a) * 0.06,
            0.46 - lens.len * 0.32,
            0.11 + Math.cos(lens.a) * 0.015,
          ]}
          rotation={[0.2, 0, lens.a]}
          castShadow
        >
          <cylinderGeometry args={[0.02, 0.026, lens.len, 10]} />
          <meshStandardMaterial color={LAB_COLORS.metal} roughness={0.26} metalness={0.46} />
        </mesh>
      ))}

      <SoftBox
        position={[0, 0.74, 0.07]}
        size={[0.24, 0.1, 0.18]}
        radius={0.035}
        color={LAB_COLORS.shell}
        roughness={0.4}
      />
      <mesh position={[-0.05, 0.84, 0.15]} rotation={[-0.58, 0, 0.2]} castShadow>
        <cylinderGeometry args={[0.024, 0.028, 0.13, 12]} />
        <meshStandardMaterial color={LAB_COLORS.structure} roughness={0.34} metalness={0.22} />
      </mesh>
      <mesh position={[0.05, 0.84, 0.15]} rotation={[-0.58, 0, -0.2]} castShadow>
        <cylinderGeometry args={[0.024, 0.028, 0.13, 12]} />
        <meshStandardMaterial color={LAB_COLORS.structure} roughness={0.34} metalness={0.22} />
      </mesh>
      <mesh position={[-0.062, 0.91, 0.2]}>
        <sphereGeometry args={[0.026, 12, 12]} />
        <meshStandardMaterial color={LAB_COLORS.dark} roughness={0.32} metalness={0.16} />
      </mesh>
      <mesh position={[0.062, 0.91, 0.2]}>
        <sphereGeometry args={[0.026, 12, 12]} />
        <meshStandardMaterial color={LAB_COLORS.dark} roughness={0.32} metalness={0.16} />
      </mesh>

      <mesh position={[-0.13, 0.38, -0.02]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.038, 0.038, 0.045, 14]} />
        <meshStandardMaterial color={LAB_COLORS.metal} roughness={0.26} metalness={0.52} />
      </mesh>
      <mesh position={[-0.155, 0.38, -0.02]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.024, 0.024, 0.03, 14]} />
        <meshStandardMaterial color={LAB_COLORS.metal} roughness={0.22} metalness={0.56} />
      </mesh>
      <mesh position={[0.13, 0.38, -0.02]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.038, 0.038, 0.045, 14]} />
        <meshStandardMaterial color={LAB_COLORS.metal} roughness={0.26} metalness={0.52} />
      </mesh>
      <mesh position={[0.155, 0.38, -0.02]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.024, 0.024, 0.03, 14]} />
        <meshStandardMaterial color={LAB_COLORS.metal} roughness={0.22} metalness={0.56} />
      </mesh>
    </group>
  );
}
