import { useEffect, useId, useRef, useState, type PointerEvent } from "react";
import "./capsuleGuide.css";

// This route follows the existing anterior-view illustration. It represents a
// visitor's reading path, not chemotaxis, a dose simulation or clinical transit.
const ROUTE =
  "M405 36 C405 86 400 127 436 147 C469 109 525 140 511 185 C502 223 460 236 425 221 C391 198 355 215 332 227 C296 259 333 281 353 283 C385 280 477 291 504 315 C527 343 486 351 469 336 C451 320 346 304 317 321 C285 340 332 370 377 354 C414 342 477 354 504 377 C530 403 493 425 471 409 C447 391 350 381 318 396 C285 414 327 449 367 432 C406 415 466 436 491 451 C516 471 483 493 453 476 C419 457 373 470 353 484 C317 509 285 482 276 467 L246 471 C233 471 233 439 237 409 L237 294 C231 243 271 233 314 254 C377 285 426 288 486 252 C532 225 574 237 574 286 L574 382";
const STOPS = [
  {
    name: "The journey begins",
    short: "Start",
    x: 405,
    y: 36,
    text: "Follow the capsule through this schematic. Explore the places and conditions behind our design.",
  },
  {
    name: "Through the stomach",
    short: "Transit",
    x: 511,
    y: 185,
    text: "An oral living therapeutic faces a demanding journey. Reaching the intestine is a challenge in its own right.",
  },
  {
    name: "A changing environment",
    short: "Intestine",
    x: 377,
    y: 354,
    text: "Bile acids and other local conditions shape bacterial survival. The gut is far from a uniform environment.",
  },
  {
    name: "Respond at the site",
    short: "Local signal",
    x: 574,
    y: 382,
    text: "Our design connects ROS sensing to PspA complementation. Elafin production remains constitutive. Explore the cell to see the distinction.",
  },
];
type Point = { x: number; y: number; t: number };

export function CapsuleGuide({ onContinue }: { onContinue?: () => void }) {
  const id = useId();
  const routeRef = useRef<SVGPathElement>(null);
  const samples = useRef<Point[]>([]);
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [pose, setPose] = useState<Point>({ ...STOPS[0], t: 0 });
  const [offRoute, setOffRoute] = useState(false);
  const [pointerInside, setPointerInside] = useState(false);
  const [ready, setReady] = useState(false);
  const drag = useRef(false);
  const [target, setTarget] = useState<Point | null>(null);
  const asset = (mood: string) =>
    `${import.meta.env.BASE_URL}assets/story/mascot-${mood}.svg`;
  useEffect(() => {
    let cancelled = false;
    Promise.all(
      ["neutral", "happy", "upset"].map(
        (mood) =>
          new Promise<boolean>((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = asset(mood);
          }),
      ),
    ).then((loaded) => {
      if (!cancelled) setReady(loaded.every(Boolean));
    });
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
    if (!active || !routeRef.current) return;
    const path = routeRef.current;
    const length = path.getTotalLength();
    samples.current = Array.from({ length: 501 }, (_, i) => {
      const point = path.getPointAtLength((length * i) / 500);
      return { x: point.x, y: point.y, t: i / 500 };
    });
  }, [active]);
  const nearest = (x: number, y: number) =>
    samples.current.reduce(
      (best, point) =>
        Math.hypot(point.x - x, point.y - y) <
        Math.hypot(best.x - x, best.y - y)
          ? point
          : best,
      samples.current[0] ?? { x: 405, y: 36, t: 0 },
    );
  const choose = (index: number) => {
    setStep(index);
    setPose(nearest(STOPS[index].x, STOPS[index].y));
    setOffRoute(false);
    setTarget(null);
    setPointerInside(false);
  };
  const move = (e: PointerEvent<SVGSVGElement>) => {
    if (e.pointerType !== "mouse" && !drag.current) return;
    const matrix = e.currentTarget.getScreenCTM();
    if (!matrix) return;
    const local = new DOMPoint(e.clientX, e.clientY).matrixTransform(
      matrix.inverse(),
    );
    const point = nearest(local.x, local.y);
    const outside = Math.hypot(point.x - local.x, point.y - local.y) > 30;
    setPointerInside(true);
    setOffRoute(outside);
    setTarget(outside ? point : null);
    setPose({ x: local.x, y: local.y, t: point.t });
    if (!outside) {
      const found = STOPS.findIndex(
        (stop) => Math.hypot(stop.x - local.x, stop.y - local.y) < 36,
      );
      if (found !== -1) setStep(found);
    }
  };
  const atStop =
    !offRoute &&
    Math.hypot(pose.x - STOPS[step].x, pose.y - STOPS[step].y) < 38;
  const mood = offRoute ? "upset" : atStop && step > 0 ? "happy" : "neutral";
  return (
    <div
      className={`capsule-guide${active ? " is-active" : ""}`}
      data-mood={mood}
    >
      {active && (
        <svg
          className={`capsule-guide-map${ready && pointerInside ? " has-cursor" : ""}`}
          viewBox="0 0 820 670"
          role="group"
          aria-label="Guide the capsule along the digestive tract"
          onPointerMove={move}
          onPointerDown={(e) => {
            drag.current = true;
            e.currentTarget.setPointerCapture(e.pointerId);
            move(e);
          }}
          onPointerUp={(e) => {
            drag.current = false;
            if (e.currentTarget.hasPointerCapture(e.pointerId))
              e.currentTarget.releasePointerCapture(e.pointerId);
          }}
          onPointerCancel={() => {
            drag.current = false;
            setPointerInside(false);
          }}
          onLostPointerCapture={() => {
            drag.current = false;
          }}
          onPointerLeave={() => {
            if (!drag.current) {
              setPointerInside(false);
              setOffRoute(false);
              setTarget(null);
            }
          }}
        >
          <path
            d={ROUTE}
            fill="none"
            stroke="#fff2cd"
            strokeWidth="7"
            opacity=".4"
          />
          <path
            ref={routeRef}
            d={ROUTE}
            className="capsule-guide-trail"
            pathLength="1"
          />
          <path
            d={ROUTE}
            className="capsule-guide-travelled"
            pathLength="1"
            strokeDasharray={`${pose.t} 1`}
          />
          {STOPS.map((stop, i) => (
            <g
              key={stop.short}
              className="capsule-guide-stop"
              data-current={i === step}
              transform={`translate(${stop.x} ${stop.y})`}
            >
              <circle r="15" />
              <text textAnchor="middle" y="4">
                {i + 1}
              </text>
            </g>
          ))}
          {target && (
            <path
              d={`M${pose.x} ${pose.y}L${target.x} ${target.y}`}
              className="capsule-guide-return"
            />
          )}
          {ready ? (
            <image
              href={asset(mood)}
              x={pose.x - 30}
              y={pose.y - 54}
              width="60"
              height="108"
              aria-hidden="true"
            />
          ) : (
            <g transform={`translate(${pose.x} ${pose.y})`} aria-hidden="true">
              <rect
                x="-12"
                y="-24"
                width="24"
                height="48"
                rx="12"
                fill="#f8e7bd"
                stroke="#537d70"
              />
              <path d="M-12 0H12" stroke="#537d70" />
            </g>
          )}
        </svg>
      )}
      <div className="capsule-guide-console">
        {!active ? (
          <button
            className="capsule-guide-launch"
            onClick={() => setActive(true)}
          >
            Guide the capsule <span>↗</span>
          </button>
        ) : (
          <>
            <div className="capsule-guide-heading">
              <span>FOLLOW THE CAPSULE</span>
              <button
                onClick={() => {
                  setActive(false);
                  drag.current = false;
                }}
                aria-label="Close capsule guide"
              >
                ×
              </button>
            </div>
            <div
              id={id}
              className="capsule-guide-story"
              aria-live="polite"
              aria-atomic="true"
            >
              <strong>
                {offRoute ? "A little closer to the path." : STOPS[step].name}
              </strong>
              <p>
                {offRoute
                  ? "Follow the dotted line back. Your last stop is still here."
                  : STOPS[step].text}
              </p>
            </div>
            <nav aria-label="Capsule checkpoints">
              {STOPS.map((stop, i) => (
                <button
                  key={stop.short}
                  aria-label={stop.short}
                  aria-current={i === step ? "step" : undefined}
                  onClick={() => choose(i)}
                >
                  {String(i + 1).padStart(2, "0")}
                </button>
              ))}
            </nav>
            <div className="capsule-guide-actions">
              <small>Drag, move, or choose a stop.</small>
              {step < STOPS.length - 1 ? (
                <button onClick={() => choose(step + 1)}>Next →</button>
              ) : (
                onContinue && (
                  <button onClick={onContinue}>Look inside →</button>
                )
              )}
            </div>
            <small className="capsule-guide-note">
              A guided schematic, not bacterial navigation.
            </small>
          </>
        )}
      </div>
    </div>
  );
}
