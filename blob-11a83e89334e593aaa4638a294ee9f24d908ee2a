import { smooth } from "./storyTimeline";
import "./openingSequence.css";

// Reproducible paper-edge masks depend only on scroll position, including reverse scroll.
function wipe(progress: number, remaining = false) {
  const edge = progress * 122 - 11;
  const teeth = Array.from(
    { length: 27 },
    (_, i) =>
      `${edge + Math.sin(i * 2.7) * 4 + Math.sin(i * 5.2) * 2}% ${(i / 26) * 100}%`,
  ).join(",");
  return remaining
    ? `polygon(100% 0%,${teeth},100% 100%)`
    : `polygon(0% 0%,${teeth},0% 100%)`;
}
export function OpeningSequence({ progress: p }: { progress: number }) {
  const strength = 1 - smooth(0.064, 0.084, p);
  const reveal = smooth(0.013, 0.033, p),
    erase = smooth(0.048, 0.066, p);
  if (p > 0.084) return null;
  return (
    <div
      className="opening-sequence paper-opening"
      style={{ opacity: strength }}
      aria-hidden={strength < 0.1}
    >
      <p
        className="paper-opening__signature"
        style={{ opacity: 1 - smooth(0.008, 0.02, p) }}
      >
        SYPHU–CHINA <span>2026</span>
      </p>
      <div
        className="opening-title paper-opening__title"
        style={{ clipPath: wipe(reveal), opacity: 1 - smooth(0.9, 1, erase) }}
      >
        <div style={{ clipPath: wipe(erase, true) }}>
          <span>LBP–</span>
          <strong>MOTOTYPE</strong>
          <p>Small life. A larger possibility.</p>
        </div>
      </div>
    </div>
  );
}
