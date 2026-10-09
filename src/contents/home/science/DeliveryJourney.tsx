import { useId } from "react";
import "./deliveryJourney.css";
import { assetUrl } from "../../../utils/assetUrl";
import { SectionDecor } from "../../../components/SectionDecor";

const stops = [
  {
    name: "Esophagus",
    phrase: "The journey\nbegins.",
    copy: "An oral formulation begins a journey through a changing environment.",
    note: "A muscular passage connects the mouth and stomach.",
    from: 0,
    to: 0.22,
    route: [
      [540, 100],
      [547, 190],
      [567, 275],
      [618, 330],
    ],
  },
  {
    name: "Stomach",
    phrase: "Before the\nintestine.",
    copy: "Acidity and transit challenge a living formulation before it reaches the intestine.",
    note: "The stomach outlet leads to the duodenum, partly hidden behind the transverse colon in this front view.",
    from: 0.22,
    to: 0.44,
    route: [
      [618, 330],
      [731, 335],
      [791, 422],
      [768, 533],
      [657, 586],
      [553, 570],
      [477, 550],
      [412, 583],
      [425, 645],
    ],
  },
  {
    name: "Small intestine",
    phrase: "Conditions\nkeep changing.",
    copy: "Bile acids, nutrients and transit all matter. A living system must function within these conditions.",
    note: "The duodenum is partly hidden. Overlapping small-intestinal loops are simplified; this is an illustrative passage rather than a precise transit model.",
    from: 0.44,
    to: 0.74,
    route: [
      [425, 645],
      [470, 725],
      [567, 782],
      [694, 808],
      [736, 844],
      [662, 869],
      [536, 850],
      [409, 811],
      [326, 860],
      [382, 902],
      [516, 915],
      [655, 923],
      [675, 978],
      [552, 1004],
      [469, 964],
      [414, 1002],
      [424, 1085],
      [354, 1061],
      [291, 1050],
      [220, 1095],
    ],
  },
  {
    name: "Colon",
    phrase: "Closer to the\nlocal setting.",
    copy: "At the intestinal wall, local signals and bacterial survival become central to our design.",
    note: "The ascending colon is on the viewer’s left. Capsule position is illustrative and does not demonstrate targeted delivery or a validated release profile.",
    from: 0.74,
    to: 1,
    route: [
      [220, 1095],
      [192, 986],
      [196, 841],
      [214, 711],
      [248, 642],
      [340, 685],
      [456, 735],
      [577, 739],
      [694, 699],
      [808, 635],
      [854, 660],
      [872, 796],
      [875, 949],
    ],
  },
];
const clamp = (value: number) => Math.min(1, Math.max(0, value));
const smooth = (from: number, to: number, value: number) => {
  const t = clamp((value - from) / (to - from));
  return t * t * (3 - 2 * t);
};

// Image coordinates, calibrated against the uncropped 1024 × 1536 artwork.
// The capsule is a reading guide; neither scale nor transit duration is literal.
function pointAlong(points: number[][], progress: number) {
  const position = clamp(progress) * (points.length - 1);
  const index = Math.min(Math.floor(position), points.length - 2);
  const t = position - index;
  const a = points[Math.max(0, index - 1)];
  const b = points[index];
  const c = points[index + 1];
  const d = points[Math.min(points.length - 1, index + 2)];
  return [0, 1].map(
    (axis) =>
      0.5 *
      (2 * b[axis] +
        (-a[axis] + c[axis]) * t +
        (2 * a[axis] - 5 * b[axis] + 4 * c[axis] - d[axis]) * t * t +
        (-a[axis] + 3 * b[axis] - 3 * c[axis] + d[axis]) * t * t * t),
  );
}

export function DeliveryJourney({
  progress,
  reduced = false,
  narrative = true,
  onProgress,
}: {
  progress: number;
  reduced?: boolean;
  narrative?: boolean;
  onContinue?: () => void;
  onProgress?: (progress: number) => void;
  readProgress?: () => number;
}) {
  const id = useId();
  const overview = reduced || !narrative;
  const value = clamp(progress);
  const active = stops.reduce(
    (index, stop, i) => (value >= stop.from ? i : index),
    0,
  );
  const stop = stops[active];
  const stopProgress = clamp((value - stop.from) / (stop.to - stop.from));
  // Hold on arrival and before departure, so each location is readable.
  const travel = smooth(0.12, 0.79, stopProgress);
  const [x, y] = pointAlong(stop.route, travel);
  const before = pointAlong(stop.route, Math.max(0, travel - 0.002));
  const after = pointAlong(stop.route, Math.min(1, travel + 0.002));
  const angle =
    (Math.atan2(after[1] - before[1], after[0] - before[0]) * 180) / Math.PI;
  const behindColon = active === 2 && y > 666 && y < 778;

  return (
    <section
      className={`delivery-journey${overview ? " delivery-journey--overview" : ""}`}
      aria-labelledby={`${id}-title`}
      data-region={overview ? "complete-route" : stop.name}
      style={{ opacity: overview ? 1 : 1 - smooth(0.96, 1, value) }}
    >
      <SectionDecor variant="local" subdued />
      <div className="delivery-journey__story">
        <span className="delivery-journey__eyebrow">
          A journey through the gut
        </span>
        <h2 id={`${id}-title`}>
          {overview ? "One continuous route." : stop.phrase}
        </h2>
        {overview ? (
          <ol className="delivery-journey__reading">
            {stops.map((entry) => (
              <li key={entry.name}>
                <h3>{entry.name}</h3>
                <p>{entry.copy}</p>
              </li>
            ))}
          </ol>
        ) : (
          <div
            className="delivery-journey__caption"
            aria-live="polite"
            aria-atomic="true"
          >
            <p>{stop.copy}</p>
          </div>
        )}
      </div>
      <div className="delivery-journey__art">
        <picture>
          <source
            srcSet={assetUrl(
              "assets/story/within/within-digestive-system.webp",
            )}
            type="image/webp"
          />
          <img
            src={assetUrl("assets/story/within/within-digestive-system.png")}
            width={1024}
            height={1536}
            alt="Illustrated digestive system showing the oesophagus, stomach, small intestine, and colon"
            aria-describedby={`${id}-anatomical-note`}
            decoding="async"
          />
        </picture>
        {!overview && (
          <svg
            className="delivery-journey__motion"
            viewBox="0 0 1024 1536"
            aria-hidden="true"
          >
            <image
              data-capsule="true"
              href={assetUrl("assets/story/within/product-capsule.png")}
              x={-95}
              y={-41}
              width={190}
              height={82}
              transform={`translate(${x} ${y}) rotate(${angle})`}
              opacity={behindColon ? 0.22 : 1}
            />
          </svg>
        )}
      </div>
      {!overview && (
        <div className="delivery-journey__footer">
          <nav className="delivery-journey__stops" aria-label="Digestive route">
            {stops.map((entry, i) => <button type="button" key={entry.name}
              aria-label={entry.name}
              aria-current={i === active ? "step" : undefined}
              disabled={!onProgress}
              onClick={() => onProgress?.(entry.from + (entry.to - entry.from) * 0.5)}
              >{entry.name === "Small intestine" ? "Intestine" : entry.name}</button>)}
          </nav>
        </div>
      )}
      <span id={`${id}-anatomical-note`} className="delivery-journey__art-note">
        {overview ? stops.map((entry) => entry.note).join(" ") : stop.note}
      </span>
      <p className="delivery-journey__schematic">
        {overview
          ? "Simplified anatomy"
          : "Capsule enlarged · schematic passage"}
      </p>
    </section>
  );
}
