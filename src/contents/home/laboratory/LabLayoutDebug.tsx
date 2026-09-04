import { Line } from "@react-three/drei";
import { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { CIRCULATION, ROOM_POLYGON, footprintCorners } from "./layoutMath";
import { WORLD_FURNITURE, validateLayout } from "./roomPlacement";

export function LayoutAudit() {
  const { gl, scene } = useThree();
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const report = validateLayout();
    const fits: unknown[] = [];
    scene.traverse((object) => {
      if (object.userData.assetFit) fits.push(object.userData.assetFit);
    });
    gl.domElement.dataset.layoutReport = JSON.stringify({
      ...report,
      modelFits: fits,
    });
    if (!report.valid) console.error("[laboratory] Invalid layout", report);
    let raf = 0,
      frame = 0,
      start = 0;
    const sample = (time: number) => {
      frame++;
      if (frame === 12) start = time;
      if (frame === 72) {
        gl.domElement.dataset.renderStats = JSON.stringify({
          fps: Math.round(60000 / (time - start)),
          drawCalls: gl.info.render.calls,
          triangles: gl.info.render.triangles,
          geometries: gl.info.memory.geometries,
          textures: gl.info.memory.textures,
        });
      } else raf = requestAnimationFrame(sample);
    };
    raf = requestAnimationFrame(sample);
    return () => {
      cancelAnimationFrame(raf);
      delete gl.domElement.dataset.layoutReport;
      delete gl.domElement.dataset.renderStats;
    };
  }, [gl, scene]);
  return null;
}
export function LabLayoutDebug() {
  return (
    <group>
      <Line
        points={[...ROOM_POLYGON, ROOM_POLYGON[0]].map(([x, z]) => [
          x,
          0.012,
          z,
        ])}
        color="#B97852"
        lineWidth={1}
      />
      {[...WORLD_FURNITURE, ...CIRCULATION].map((b) => {
        const p = footprintCorners(b),
          isLane = CIRCULATION.some((c) => c.id === b.id);
        return (
          <Line
            key={b.id}
            points={[...p, p[0]].map(([x, z]) => [x, isLane ? 0.025 : 0.03, z])}
            color={isLane ? "#577963" : "#AD7554"}
            lineWidth={1}
          />
        );
      })}
    </group>
  );
}
