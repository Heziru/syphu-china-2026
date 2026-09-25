import { smooth } from "./storyTimeline";

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
const arms = Array.from({ length: 14 }, (_, arm) => {
  return Array.from({ length: 150 }, (_, i) => {
    const t = i / 149,
      r = 18 + t * 570;
    const angle = (arm / 14) * Math.PI * 2 + t * 3.4;
    return `${i ? "L" : "M"}${500 + Math.cos(angle) * r},${330 + Math.sin(angle) * r * 0.53}`;
  }).join(" ");
});
export function OpeningSequence({ progress: p }: { progress: number }) {
  const strength = smooth(0.005, 0.021, p) * (1 - smooth(0.056, 0.081, p));
  const reveal = smooth(0.019, 0.035, p),
    erase = smooth(0.05, 0.069, p);
  if (p > 0.084) return null;
  return (
    <div
      className="opening-sequence"
      style={{ opacity: strength }}
      aria-hidden={strength < 0.1}
    >
      <div className="opening-haze" />
      <svg
        className="opening-spiral"
        viewBox="0 0 1000 660"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        style={{
          transform: `rotate(${p * 900 - 16}deg) scale(${0.7 + strength * 0.45})`,
          opacity: 0.6 * (1 - erase),
        }}
      >
        {arms.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="none"
            stroke={i % 3 === 0 ? "#dbb785" : "#6b999a"}
            strokeWidth={i % 3 === 0 ? 0.8 : 1.3}
            strokeDasharray={`${4 + strength * 95} ${12 + i * 3}`}
            strokeDashoffset={-p * (2000 + i * 70)}
          />
        ))}
      </svg>
      <div
        className="opening-title"
        style={{ clipPath: wipe(reveal), opacity: 1 - smooth(0.9, 1, erase) }}
      >
        <div style={{ clipPath: wipe(erase, true) }}>
          <span>LBP–</span>
          <strong>MOTOTYPE</strong>
        </div>
      </div>
    </div>
  );
}
