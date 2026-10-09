import { assetUrl } from "../utils/assetUrl";
import "./sectionDecor.css";

type DecorVariant = "care" | "cell" | "local" | "research" | "world" | "life" | "product" | "lab";

const leaves = "assets/story/hero/botanical-leaf-cluster.png";
const book = "assets/story/decor/research-book.png";
const dish = "assets/story/decor/culture-dish.png";
const cells = "assets/story/decor/cell-trio.png";
const rod = "assets/story/modular/18_microbe-rod.png";
const nodes = "assets/story/decor/science-nodes.png";

// Slots are composed around reserved text/figure areas, never randomly scattered.
const accents: Record<DecorVariant, readonly string[]> = {
  care: [book, dish, leaves],
  cell: [cells, rod, dish],
  local: [cells, rod, leaves],
  research: [book, leaves, leaves, nodes],
  world: [leaves, cells],
  life: [leaves, dish, cells],
  product: [book, rod, leaves],
  lab: [dish, book, leaves, nodes],
};

/** Decorative only. The parent owns its background, positioning and foreground. */
export function SectionDecor({
  variant,
  className = "",
  subdued = false,
}: {
  variant: DecorVariant;
  className?: string;
  subdued?: boolean;
}) {
  return (
    <div
      className={`section-decor section-decor--${variant}${subdued ? " section-decor--subdued" : ""} ${className}`}
      aria-hidden="true"
    >
      <div className="decor-blob decor-blob--upper" />
      <div className="decor-blob decor-blob--side" />
      <div className="decor-blob decor-blob--ground" />
      <img className="decor-wash" src={assetUrl("assets/story/decor/organic-wash.png")} alt="" decoding="async" />
      <img className="decor-path decor-path--upper" src={assetUrl("assets/story/decor/node-arc.png")} alt="" decoding="async" />
      <svg className="decor-path decor-path--side" viewBox="0 0 400 140" fill="none">
        <path d="M8 103C97 90 135 17 222 40S331 115 398 74" stroke="currentColor" strokeWidth="1.4" strokeDasharray="5 8" strokeLinecap="round" />
        <circle cx="8" cy="103" r="5" fill="#b7c8a9" />
        <circle cx="166" cy="42" r="6" fill="#e8c894" />
        <circle cx="336" cy="90" r="4" fill="#d6ad91" />
      </svg>
      {accents[variant].map((src, index) => (
        <img
          key={`${variant}-${index}`}
          className={`decor-accent decor-accent--${index + 1}`}
          src={assetUrl(src)}
          alt=""
          decoding="async"
          draggable={false}
        />
      ))}
    </div>
  );
}
