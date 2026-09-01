import { NocturneOpeningCanvas } from "./opening/NocturneOpeningCanvas";
import "./nocturneFull.css";

/** 10s 设计稿开屏：银河带 → 人体 → 肠道红光（人体即小宇宙） */
export function NocturneSplash() {
  return (
    <div className="nocturne-gate">
      <NocturneOpeningCanvas />
    </div>
  );
}
