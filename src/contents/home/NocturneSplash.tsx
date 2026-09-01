import { NocturneOpeningCanvas } from "./opening/NocturneOpeningCanvas";
import "./nocturneFull.css";

/** 10s 开屏：星尘 → 银河带 → 人体小宇宙，蓝紫白固定色 */
export function NocturneSplash() {
  return (
    <div className="nocturne-gate">
      <NocturneOpeningCanvas />
    </div>
  );
}
