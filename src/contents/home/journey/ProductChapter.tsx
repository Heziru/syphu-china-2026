import {
  lazy,
  Suspense,
  useCallback,
  useId,
  useState,
  type CSSProperties,
} from "react";
import { assetUrl } from "../../../utils/assetUrl";
import { SectionDecor } from "../../../components/SectionDecor";
import { SceneErrorBoundary } from "../ui/SceneErrorBoundary";
import { clamp, smooth } from "./storyTimeline";
import type { ProductSequence } from "./ProductModel";
import "./productChapter.css";

const loadModel = () => import("./ProductModel");
const ProductModel = lazy(loadModel);
const posterUrl = assetUrl("assets/product/product-transparent.png");
let warming: Promise<void> | undefined;

/** Call on approach; reuse the same module and useGLTF cache when mounted. */
// eslint-disable-next-line react-refresh/only-export-components -- Shared entry point keeps Three.js out of the initial chapter bundle.
export function warmProduct() {
  if (typeof window === "undefined") return Promise.resolve();
  if (!warming) {
    const poster = new Image();
    poster.src = posterUrl;
    warming = loadModel()
      .then(({ preloadProductModel }) => preloadProductModel())
      .catch(() => {
        warming = undefined;
      });
  }
  return warming;
}

const beats = [
  {
    label: "Idea",
    text: "Designed around\nthe gut.",
    description:
      "A living-medicine concept that connects persistence, payload and exit through one environmental control axis.",
    detail: "Local conditions. A shared design logic.",
    summary: "A living-medicine concept shaped by local conditions.",
    start: 0.02,
    end: 0.32,
  },
  {
    label: "Response",
    text: "Protection with\nconditions.",
    description:
      "ROS-responsive PspA support is intended to shape EcN survival under bile-acid stress. The aim is to make persistence depend on the setting.",
    detail: "A proposed survival difference, to be measured.",
    summary: "ROS-responsive support, designed to make persistence conditional.",
    start: 0.32,
    end: 0.65,
  },
  {
    label: "Purpose",
    text: "A purpose.\nA boundary.",
    description:
      "Elafin is the proposed payload, produced separately from ROS sensing. As protective support wanes, we ask whether persistence can become limited.",
    detail: "Payload activity and eventual clearance need testing.",
    summary: "Elafin as the payload. Persistence and clearance still to be tested.",
    start: 0.65,
    end: 1,
  },
];

/** Mount only near this chapter: the poster is immediate and the GLB is deferred. */
export function ProductChapter({
  progress,
  reduced = false,
  onStageChange,
}: {
  progress: number;
  reduced?: boolean;
  onStageChange?: (progress: number) => void;
}) {
  const id = useId();
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  const onError = useCallback(() => setFailed(true), []);
  const p = clamp(progress);
  const exit = smooth(0.96, 1, p);
  const visible = reduced ? 1 : smooth(0, 0.07, p) * (1 - exit);
  const live = ready && !failed && !reduced;
  const sequence: ProductSequence = {
    bottle: smooth(0.32, 0.4, p),
    capsule: smooth(0.65, 0.73, p),
    pairAlignment: smooth(0.29, 0.37, p),
    // Small changes of view keep the original front labels readable throughout.
    rotation:
      (Math.PI / 45) *
      (smooth(0.05, 0.29, p) + smooth(0.4, 0.62, p) + smooth(0.73, 0.95, p)),
  };
  const activeBeat = p < 0.32 ? 0 : p < 0.65 ? 1 : 2;
  const stage = ["carton", "bottle", "capsule"][activeBeat];

  return (
    <section
      className={`product-chapter${reduced ? " product-chapter--static" : ""}`}
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-description`}
      aria-hidden={visible < 0.01}
      data-model={
        failed ? "fallback" : reduced ? "static" : ready ? "ready" : "loading"
      }
      data-product-stage={reduced || failed ? "overview" : stage}
      data-product-turn={(sequence.rotation / (Math.PI * 2)).toFixed(3)}
      data-bottle-reveal={sequence.bottle.toFixed(3)}
      data-capsule-reveal={sequence.capsule.toFixed(3)}
      style={
        {
          opacity: visible,
          "--product-arrival": reduced ? 1 : smooth(0, 0.26, p),
        } as CSSProperties
      }
    >
      <SectionDecor variant="product" />
      <h2 className="product-chapter__accessible" id={`${id}-title`}>
        LBP-Mototype. A living-medicine concept designed around local
        conditions.
      </h2>
      <p className="product-chapter__accessible" id={`${id}-description`}>
        {beats
          .map(({ text, description }) => `${text} ${description}`)
          .join(" ")}{" "}
        Research concept with illustrative packaging. Performance and clearance
        remain to be tested.
      </p>
      <div className="product-chapter__layout">
        <div
          className="product-chapter__art"
          role="img"
          aria-label="Illustrative SYPHU-China bottle, carton and capsule packaging in the project’s blue and green colors"
        >
          <img
            className="product-chapter__poster"
            src={posterUrl}
            alt=""
            aria-hidden="true"
            decoding="async"
            style={{ opacity: live ? 0 : 1 }}
          />
          {!reduced && !failed && (
            <div
              className="product-chapter__model"
              aria-hidden="true"
              style={{ opacity: live ? 1 : 0 }}
            >
              <SceneErrorBoundary onError={onError}>
                <Suspense fallback={null}>
                  <ProductModel
                    sequence={sequence}
                    onReady={onReady}
                    onError={onError}
                  />
                </Suspense>
              </SceneErrorBoundary>
            </div>
          )}
        </div>
        <div className="product-chapter__copy" aria-hidden="true">
          <p className="product-chapter__identity">
            LBP-Mototype
            {!reduced && <span> / 0{activeBeat + 1}</span>}
          </p>
          <div className="product-chapter__narrative">
            {beats.map(
              ({ label, text, description, detail, summary }, index) => {
                if (!reduced && index !== activeBeat) return null;
                return (
                  <div
                    className="product-chapter__beat"
                    key={label}
                  >
                    <p className="product-chapter__word">{text}</p>
                    <p className="product-chapter__description">
                      {reduced ? description : summary}
                    </p>
                    {reduced && <p className="product-chapter__detail">{detail}</p>}
                  </div>
                );
              },
            )}
          </div>
        </div>
      </div>
      <footer className="product-chapter__footer">
        {!reduced && (
          <nav className="product-chapter__steps" aria-label="Product concept stages">
            {beats.map(({ label, start, end }, index) =>
              onStageChange ? (
                <button
                  type="button"
                  key={label}
                  aria-label={label}
                  aria-current={index === activeBeat ? "step" : undefined}
                  onClick={() => onStageChange((start + end) / 2)}
                >
                  {label}
                </button>
              ) : (
                <span key={label} aria-current={index === activeBeat ? "step" : undefined}>
                  {label}
                </span>
              ),
            )}
          </nav>
        )}
        <p className="product-chapter__concept">
          A research concept by SYPHU-China
        </p>
      </footer>
    </section>
  );
}
