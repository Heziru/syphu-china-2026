import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { LITERATURE } from "../data/literature";
import { assetUrl } from "../../../utils/assetUrl";
import {
  galleryOffset,
  galleryCurvePose,
  nearestGalleryPosition,
} from "./literatureGalleryMotion";

const EDITIONS: Record<
  string,
  { title: string; accent: string; glyph: string }
> = {
  rubens: { title: "Cells that sense.", accent: "#729d95", glyph: "signal" },
  wang: {
    title: "The energy to survive.",
    accent: "#71948e",
    glyph: "membrane",
  },
  teng: { title: "A living delivery.", accent: "#b9957d", glyph: "payload" },
  begley: {
    title: "Bacteria meet bile.",
    accent: "#94a682",
    glyph: "environment",
  },
  inda: { title: "Signals from within.", accent: "#8b9ba6", glyph: "signal" },
  andersen: { title: "A response in time.", accent: "#b7a378", glyph: "time" },
  simmonds: {
    title: "Reading inflammation.",
    accent: "#bc8e7d",
    glyph: "environment",
  },
  hoffmann: {
    title: "Designing boundaries.",
    accent: "#889886",
    glyph: "membrane",
  },
};

/** Editorial motifs identify topics; they do not reproduce paper figures. */
function PaperMotif({ type }: { type: string }) {
  return (
    <svg
      viewBox="0 0 240 150"
      aria-hidden="true"
      className="literature-gallery__motif"
    >
      <ellipse
        cx="120"
        cy="132"
        rx="73"
        ry="6"
        fill="currentColor"
        opacity=".09"
      />
      {type === "signal" && (
        <>
          <path
            d="M22 82h39l17-42 23 74 20-47 16 15h81"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <circle cx="120" cy="77" r="47" fill="currentColor" opacity=".11" />
          <circle cx="195" cy="82" r="7" fill="currentColor" />
        </>
      )}
      {type === "membrane" && (
        <>
          <rect
            x="52"
            y="33"
            width="139"
            height="87"
            rx="43.5"
            fill="currentColor"
            opacity=".13"
          />
          <rect
            x="63"
            y="44"
            width="117"
            height="65"
            rx="32.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
          {[0, 1, 2, 3, 4].map((i) => (
            <circle
              key={i}
              cx={88 + i * 16}
              cy={78 + Math.sin(i * 1.7) * 13}
              r="4"
              fill="currentColor"
            />
          ))}
        </>
      )}
      {type === "payload" && (
        <>
          <rect
            x="65"
            y="35"
            width="75"
            height="97"
            rx="37.5"
            transform="rotate(-25 105 78)"
            fill="currentColor"
            opacity=".17"
          />
          <rect
            x="75"
            y="46"
            width="54"
            height="76"
            rx="27"
            transform="rotate(-25 105 78)"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
          {[0, 1, 2, 3].map((i) => (
            <circle
              key={i}
              cx={154 + i * 13}
              cy={83 - i * 12}
              r={6 - i * 0.6}
              fill="currentColor"
              opacity={0.9 - i * 0.15}
            />
          ))}
        </>
      )}
      {type === "environment" && (
        <>
          <path
            d="M28 106q23-47 46-4t46-4 46-4 46-4v29H28Z"
            fill="currentColor"
            opacity=".17"
          />
          <path
            d="M28 99q23-47 46-4t46-4 46-4 46-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
          {[0, 1, 2, 3, 4].map((i) => (
            <circle
              key={i}
              cx={49 + i * 35}
              cy={35 + (i % 2) * 21}
              r="6"
              fill="currentColor"
              opacity=".75"
            />
          ))}
        </>
      )}
      {type === "time" && (
        <>
          <circle cx="120" cy="77" r="48" fill="currentColor" opacity=".12" />
          <path
            d="M120 34a43 43 0 1 1-37 21"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M120 47v31l22 13"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx="120" cy="77" r="5" fill="currentColor" />
        </>
      )}
    </svg>
  );
}

export function CurveLiteratureGallery({
  initial,
  onClose,
}: {
  initial: number;
  onClose: () => void;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLElement | null)[]>([]);
  const motion = useRef({ value: initial, target: initial, lastInput: 0 });
  const drag = useRef({
    start: 0,
    startY: 0,
    target: 0,
    down: false,
    moved: false,
  });
  const [focused, setFocused] = useState(initial);
  const [indexOpen, setIndexOpen] = useState(false);
  const total = LITERATURE.length;

  const goTo = useCallback(
    (index: number) => {
      motion.current.target = nearestGalleryPosition(
        index,
        motion.current.target,
        total,
      );
      motion.current.lastInput = performance.now();
      setIndexOpen(false);
    },
    [total],
  );
  const step = (direction: number) => {
    motion.current.target = Math.round(motion.current.target) + direction;
    motion.current.lastInput = performance.now();
  };

  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
    let width = element.clientWidth;
    let frame = 0,
      previous = performance.now(),
      lastFocused = initial;
    const observer = new ResizeObserver(() => {
      width = element.clientWidth;
    });
    observer.observe(element);
    const animate = (now: number) => {
      const delta = Math.min((now - previous) / 1000, 0.05);
      previous = now;
      const m = motion.current;
      if (!drag.current.down && now - m.lastInput > 180)
        m.target = Math.round(m.target);
      m.value +=
        (m.target - m.value) *
        (reduceMotion.matches ? 1 : 1 - Math.exp(-7.2 * delta));
      // Normalize entire revolutions without changing any frame's position.
      if (Math.abs(m.value) > total * 100) {
        const turn = Math.trunc(m.value / total) * total;
        m.value -= turn;
        m.target -= turn;
      }
      const active = ((Math.round(m.value) % total) + total) % total;
      if (active !== lastFocused) {
        setFocused(active);
        lastFocused = active;
      }
      cards.current.forEach((card, i) => {
        if (!card) return;
        const offset = galleryOffset(i, m.value, total);
        const pose = galleryCurvePose(offset, m.value, total, width);
        card.style.transform = `translate(-50%, -50%) translate3d(${pose.x}px, ${pose.y}px, ${pose.z}px) rotateY(${pose.rotateY}deg) rotateZ(${pose.rotateZ}deg) scale(${pose.scale})`;
        card.style.opacity = pose.visible ? "1" : "0";
        card.style.setProperty("--paper-fog", String(pose.fog));
        card.style.visibility = pose.visible ? "visible" : "hidden";
        card.style.pointerEvents = pose.visible ? "auto" : "none";
        card.style.zIndex = String(100 - Math.round(Math.abs(offset) * 10));
        card.dataset.focused = String(i === active);
        // Off-curve editions remain reachable through the complete index.
        const link = card.querySelector<HTMLAnchorElement>(
          ".literature-gallery__doi",
        );
        if (link) link.tabIndex = i === active ? 0 : -1;
        card.setAttribute("aria-hidden", String(!pose.visible));
      });
      frame = requestAnimationFrame(animate);
    };
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
      const delta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX
          : event.deltaY;
      const pixels =
        delta *
        (event.deltaMode === 1
          ? 16
          : event.deltaMode === 2
            ? element.clientHeight
            : 1);
      motion.current.target += Math.max(-0.7, Math.min(0.7, pixels / 180));
      motion.current.lastInput = performance.now();
    };
    element.addEventListener("wheel", wheel, { passive: false });
    frame = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      element.removeEventListener("wheel", wheel);
    };
  }, [initial, total]);

  const pointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    drag.current = {
      start: event.clientX,
      startY: event.clientY,
      target: motion.current.target,
      down: true,
      moved: false,
    };
  };
  const pointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag.current.down) return;
    const distanceX = event.clientX - drag.current.start;
    const distanceY = event.clientY - drag.current.startY;
    const distance =
      Math.abs(distanceX) > Math.abs(distanceY) ? distanceX : distanceY;
    if (Math.abs(distance) > 7) {
      drag.current.moved = true;
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    if (drag.current.moved) {
      motion.current.target = drag.current.target - distance / 250;
      motion.current.lastInput = performance.now();
    }
  };

  return (
    <div
      className="literature-gallery__room"
      onWheel={(event) => {
        event.stopPropagation();
      }}
      onKeyDown={(event) => {
        if (["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) {
          if (
            (event.target as HTMLElement).closest(".literature-gallery__index")
          )
            return;
          event.preventDefault();
          event.stopPropagation();
          if (event.key === "Home") goTo(0);
          else if (event.key === "End") goTo(total - 1);
          else {
            motion.current.target =
              Math.round(motion.current.target) +
              (event.key === "ArrowRight" ? 1 : -1);
            motion.current.lastInput = performance.now();
          }
        }
      }}
    >
      <header className="literature-gallery__header">
        <div>
          <span className="literature-gallery__eyebrow">Research library</span>
          <h2 id="reading-title">Ideas in orbit.</h2>
        </div>
        <button
          className="literature-gallery__return"
          onClick={onClose}
          autoFocus
        >
          Back to lab <span aria-hidden="true">↙</span>
        </button>
      </header>
      <div
        className="literature-gallery__stage"
        ref={stage}
        aria-label="Curved literature gallery. Scroll or use the arrow keys to browse. Tap a frame to open its DOI."
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={() => {
          drag.current.down = false;
        }}
        onPointerCancel={() => {
          drag.current.down = false;
        }}
        onClickCapture={(event) => {
          if (drag.current.moved) {
            event.preventDefault();
            event.stopPropagation();
            drag.current.moved = false;
          }
        }}
      >
        <div className="literature-gallery__floor" aria-hidden="true" />
        <div className="literature-gallery__curve">
          {LITERATURE.map((paper, i) => {
            const edition = EDITIONS[paper.id];
            return (
              <article
                key={paper.id}
                className="literature-gallery__frame"
                ref={(node) => {
                  cards.current[i] = node;
                }}
                aria-label={paper.title}
                style={{ "--paper-accent": edition.accent } as CSSProperties}
                title={paper.title}
              >
                <div className="literature-gallery__edition">
                  <span>{paper.category}</span>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                </div>
                {"image" in paper ? (
                  <div className="literature-gallery__page">
                    <img
                      src={assetUrl(
                        `assets/laboratory/literature/${paper.image.replace(".webp", "-small.webp")}`,
                      )}
                      srcSet={`${assetUrl(`assets/laboratory/literature/${paper.image.replace(".webp", "-small.webp")}`)} 600w, ${assetUrl(`assets/laboratory/literature/${paper.image}`)} 1200w`}
                      sizes="(max-width: 600px) 240px, (max-height: 640px) 220px, 365px"
                      alt={`First page of ${paper.title}`}
                      draggable={false}
                      decoding="async"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="literature-gallery__unavailable">
                    <PaperMotif type={edition.glyph} />
                    <h3>{paper.title}</h3>
                    <span>Read the original via DOI</span>
                  </div>
                )}
                <div className="literature-gallery__caption">
                  <span className="literature-gallery__mini-motif">
                    <PaperMotif type={edition.glyph} />
                  </span>
                  <div>
                    <strong>{edition.title}</strong>
                    <span>
                      {paper.author} · {paper.year}
                      {"previewVersion" in paper ? " · Archive" : ""}
                    </span>
                  </div>
                </div>
                <div className="literature-gallery__paper-foot">
                  <span>REF. {paper.ref}</span>
                  <span className="literature-gallery__doi-slot">
                    <a
                      className="literature-gallery__doi"
                      href={paper.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      draggable={false}
                      aria-label={`${paper.title}. ${paper.author}, ${paper.year}. Open DOI in a new tab.`}
                      onFocus={() => goTo(i)}
                    >
                      DOI <span aria-hidden="true">↗</span>
                    </a>
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
      <div className="literature-gallery__footer">
        <span className="literature-gallery__hint">
          Scroll to browse · Tap to read
        </span>
        <nav className="literature-gallery__steps" aria-label="Browse papers">
          <button aria-label="Previous paper" onClick={() => step(-1)}>
            ←
          </button>
          <span aria-live="polite" aria-atomic="true">
            {String(focused + 1).padStart(2, "0")}{" "}
            <span>/ {String(total).padStart(2, "0")}</span>
          </span>
          <button aria-label="Next paper" onClick={() => step(1)}>
            →
          </button>
        </nav>
        <button
          className="literature-gallery__index-toggle"
          aria-expanded={indexOpen}
          aria-controls="literature-index"
          onClick={() => setIndexOpen(!indexOpen)}
        >
          All papers <span aria-hidden="true">{indexOpen ? "−" : "+"}</span>
        </button>
      </div>
      <nav
        id="literature-index"
        className="literature-gallery__index"
        aria-label="All eight project references"
        hidden={!indexOpen}
      >
        {LITERATURE.map((paper, i) => (
          <div key={paper.id}>
            <button onClick={() => goTo(i)} aria-label={`Focus ${paper.title}`}>
              <span>{String(i + 1).padStart(2, "0")}</span>
              <strong>{paper.title}</strong>
              <small>{paper.year}</small>
            </button>
            <a
              href={paper.source}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open DOI: ${paper.title}`}
            >
              DOI ↗
            </a>
          </div>
        ))}
      </nav>
    </div>
  );
}
