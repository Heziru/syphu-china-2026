import {
  useEffect,
  useLayoutEffect,
  useId,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import "./deliveryJourney.css";

const artwork = `${import.meta.env.BASE_URL}assets/story/artist/`;
const segments = [
  "M 860 73 C 930 73 927 150 929 260 C 929 460 960 675 972 828 C 981 947 998 1007 1050 1080",
  "M 1050 1080 C 1130 996 1235 1037 1237 1135 C 1240 1227 1130 1300 1010 1280 C 900 1264 815 1240 782 1188 C 760 1157 706 1167 727 1220 C 751 1281 825 1378 853 1440",
  "M 853 1440 C 956 1402 1153 1440 1120 1500 C 1090 1552 782 1493 754 1550 C 715 1629 1154 1542 1158 1620 C 1162 1695 774 1600 776 1686 C 778 1761 1037 1678 1049 1742 C 1063 1818 801 1790 716 1751 C 664 1728 632 1692 625 1650",
  "M 625 1650 C 604 1590 595 1510 603 1440 C 610 1376 590 1324 624 1315 C 717 1331 816 1388 940 1392 C 1070 1395 1195 1345 1305 1290 C 1343 1350 1305 1460 1315 1570 C 1321 1633 1315 1682 1292 1710",
];
const routeData =
  segments[0] +
  segments
    .slice(1)
    .map((s) => s.replace(/^M\s+[\d.]+\s+[\d.]+/, ""))
    .join("");
const stops = [
  {
    name: "Esophagus",
    title: "The way in.",
    copy: "Follow the capsule into the digestive tract. Each stop introduces a different part of the delivery challenge.",
  },
  {
    name: "Stomach",
    title: "Through the stomach.",
    copy: "An oral living therapeutic must pass through a demanding environment before reaching the intestine.",
  },
  {
    name: "Small intestine",
    title: "A changing environment.",
    copy: "Bile acids and other local conditions influence bacterial survival. The gut is not a uniform environment.",
  },
  {
    name: "Colon",
    title: "Look closer.",
    copy: "Here, the view moves from the whole organ toward the local conditions behind our design.",
  },
  {
    name: "Local environment",
    title: "Two separate branches.",
    copy: "Our design links oxidative sensing to PspA complementation. Elafin expression is constitutive; these are separate branches.",
  },
];
const clamp = (value: number) => Math.min(1, Math.max(0, value));
type Mode = "scroll" | "paused" | "playing" | "seeking" | "dragging";
type Camera = "auto" | "overview" | "follow";
type Controller = {
  scroll: (value: number) => void;
  toggle: () => void;
  replay: () => void;
  scrub: (value: number) => void;
  stop: (index: number) => void;
  view: (view: Camera) => void;
  pointer: (phase: "start" | "move" | "end", x: number, y: number) => void;
};

/** The team's original bitmap and a schematic route share one progress value.
 * Local drag search deliberately cannot jump between crossing intestinal loops. */
export function DeliveryJourney({
  progress,
  reduced = false,
  onContinue,
  onProgress,
  readProgress,
}: {
  progress: number;
  reduced?: boolean;
  onContinue?: () => void;
  onProgress?: (progress: number) => void;
  readProgress?: () => number;
}) {
  const id = useId();
  const sectionRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const trailRef = useRef<SVGPathElement>(null);
  const cameraRef = useRef<SVGGElement>(null);
  const capsuleRef = useRef<SVGGElement>(null);
  const rangeRef = useRef<HTMLInputElement>(null);
  const counterRef = useRef<HTMLOutputElement>(null);
  const controller = useRef<Controller | null>(null);
  const latestProgress = useRef(progress);
  const progressCallback = useRef(onProgress);
  const progressReader = useRef(readProgress);
  const [active, setActive] = useState(0);
  const [mode, setMode] = useState<Mode>("scroll");
  const [view, setView] = useState<Camera>("auto");
  const [offRoute, setOffRoute] = useState(false);

  useEffect(() => {
    latestProgress.current = progress;
    controller.current?.scroll(progress);
  }, [progress]);
  useEffect(() => {
    progressCallback.current = onProgress;
    progressReader.current = readProgress;
  }, [onProgress, readProgress]);

  useLayoutEffect(() => {
    const path = pathRef.current;
    const stage = sectionRef.current;
    if (!path || !stage) return;
    const total = path.getTotalLength();
    const lengths = segments.map((d) => {
      const part = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path",
      );
      part.setAttribute("d", d);
      return part.getTotalLength();
    });
    const stopPositions = [
      0,
      lengths[0] / total,
      (lengths[0] + lengths[1]) / total,
      (lengths[0] + lengths[1] + lengths[2]) / total,
      0.96,
    ];
    const samples = Array.from({ length: 1001 }, (_, i) =>
      path.getPointAtLength((i / 1000) * total),
    );
    let value = clamp(latestProgress.current),
      scrollTarget = value,
      lastScroll = value;
    let currentMode: Mode = "scroll",
      cameraMode: Camera = "auto",
      selected = -1;
    let animation = 0,
      lastTime = 0,
      visible = true;
    let cameraX = 995,
      cameraY = 1025,
      cameraScale = 1;
    let seek: {
      from: number;
      to: number;
      elapsed: number;
      duration: number;
    } | null = null;
    let dragging = false,
      feedback = false;
    let externalScroll = false;

    const changeMode = (next: Mode) => {
      currentMode = next;
      setMode(next);
    };
    const setFeedback = (next: boolean) => {
      if (feedback !== next) {
        feedback = next;
        setOffRoute(next);
      }
    };
    const interrupt = () => {
      seek = null;
      dragging = false;
      setFeedback(false);
    };
    const syncManualProgress = () => {
      value = Math.min(0.998, Math.max(0.002, value));
      externalScroll = false;
      lastScroll = value;
      scrollTarget = value;
      progressCallback.current?.(value);
    };
    const requestFrame = () => {
      if (!animation && visible && !document.hidden)
        animation = requestAnimationFrame(tick);
    };
    function paint() {
      const at = path!.getPointAtLength(value * total);
      const before = path!.getPointAtLength(Math.max(0, value * total - 12));
      const after = path!.getPointAtLength(Math.min(total, value * total + 12));
      const lean = Math.max(-15, Math.min(15, (after.x - before.x) * 0.65));
      capsuleRef.current?.setAttribute(
        "transform",
        `translate(${at.x} ${at.y}) rotate(${-lean})`,
      );
      if (trailRef.current)
        trailRef.current.style.strokeDasharray = `${value * total} ${total}`;
      let index = 0;
      stopPositions.forEach((position, i) => {
        if (value >= position - 0.004) index = i;
      });
      if (selected !== index) {
        selected = index;
        setActive(index);
      }
      if (rangeRef.current) {
        rangeRef.current.value = String(Math.round(value * 1000));
        rangeRef.current.setAttribute(
          "aria-valuetext",
          `${Math.round(value * 100)} percent, ${stops[index].name}`,
        );
      }
      if (counterRef.current)
        counterRef.current.textContent = `${String(Math.round(value * 100)).padStart(2, "0")}%`;
      return at;
    }
    function tick(now: number) {
      animation = 0;
      // Use elapsed time, so slower devices do not turn a short seek into a long one.
      // Visibility handlers reset lastTime before resuming a suspended page.
      const dt = lastTime ? (now - lastTime) / 1000 : 0;
      lastTime = now;
      if (seek) {
        seek.elapsed += dt;
        const t = Math.min(1, seek.elapsed / seek.duration);
        value = seek.from + (seek.to - seek.from) * t * t * (3 - 2 * t);
        if (t === 1) {
          seek = null;
          syncManualProgress();
          changeMode("paused");
        }
      } else if (currentMode === "playing") {
        value = Math.min(0.998, value + dt / 42);
        if (value === 0.998) {
          syncManualProgress();
          changeMode("paused");
        }
      } else if (currentMode === "scroll") {
        value +=
          (scrollTarget - value) * (reduced ? 1 : 1 - Math.exp(-dt * 14));
        if (Math.abs(scrollTarget - value) < 0.00001) value = scrollTarget;
      }
      const at = paint();
      const autoFollow = reduced ? 0 : clamp((value - 0.025) / 0.12);
      const follow =
        cameraMode === "follow"
          ? 1
          : cameraMode === "overview"
            ? 0
            : autoFollow;
      const targetX = 995 + (at.x - 995) * follow;
      const targetY = 1025 + (at.y - 1025) * follow;
      const targetScale = 1 + follow * 0.85;
      const ease = reduced ? 1 : 1 - Math.exp(-Math.max(dt, 0.016) * 5);
      cameraX += (targetX - cameraX) * ease;
      cameraY += (targetY - cameraY) * ease;
      cameraScale += (targetScale - cameraScale) * ease;
      cameraRef.current?.setAttribute(
        "transform",
        `translate(995 1025) scale(${cameraScale}) translate(${-cameraX} ${-cameraY})`,
      );
      const unsettled =
        Math.abs(cameraX - targetX) +
          Math.abs(cameraY - targetY) +
          Math.abs(cameraScale - targetScale) >
        0.02;
      if (
        seek ||
        currentMode === "playing" ||
        unsettled ||
        (currentMode === "scroll" && value !== scrollTarget)
      )
        requestFrame();
      else lastTime = 0;
    }
    controller.current = {
      scroll(next) {
        // React can deliver an older render after several animation frames.
        // Read the document's current position before deciding that the user moved.
        next = clamp(progressReader.current?.() ?? next);
        if (!externalScroll && Math.abs(next - lastScroll) <= 0.0005) return;
        if (externalScroll && Math.abs(next - lastScroll) < 0.000001) return;
        externalScroll = false;
        lastScroll = next;
        scrollTarget = next;
        interrupt();
        changeMode("scroll");
        requestFrame();
      },
      toggle() {
        const pause =
          currentMode === "playing" ||
          currentMode === "seeking" ||
          currentMode === "dragging";
        interrupt();
        if (pause) syncManualProgress();
        if (!pause && value >= 0.998) {
          value = 0.002;
          syncManualProgress();
        }
        changeMode(pause ? "paused" : "playing");
        lastTime = 0;
        requestFrame();
      },
      replay() {
        interrupt();
        value = 0.002;
        syncManualProgress();
        changeMode("playing");
        lastTime = 0;
        requestFrame();
      },
      scrub(next) {
        interrupt();
        value = clamp(next);
        syncManualProgress();
        changeMode("paused");
        paint();
        requestFrame();
      },
      stop(index) {
        interrupt();
        const to = Math.min(0.998, Math.max(0.002, stopPositions[index]));
        seek = {
          from: value,
          to,
          elapsed: 0,
          duration: Math.min(3, Math.max(0.6, Math.abs(to - value) * 3.5)),
        };
        changeMode("seeking");
        lastTime = 0;
        requestFrame();
      },
      view(next) {
        cameraMode = next;
        setView(next);
        requestFrame();
      },
      pointer(phase, x, y) {
        if (phase === "end") {
          if (dragging) {
            dragging = false;
            syncManualProgress();
            changeMode("paused");
          }
          setFeedback(false);
          return;
        }
        if (phase === "start") {
          interrupt();
          dragging = true;
          changeMode("dragging");
          return;
        }
        if (!dragging) return;
        const matrix = cameraRef.current?.getScreenCTM();
        if (!matrix) return;
        const point = new DOMPoint(x, y).matrixTransform(matrix.inverse());
        // Search only +/- 3% around the last accepted position, never the full crossed route.
        const current = Math.round(value * 1000);
        let nearest = current,
          distance = Infinity;
        for (
          let i = Math.max(0, current - 30);
          i <= Math.min(1000, current + 30);
          i++
        ) {
          const candidate = samples[i];
          const d = Math.hypot(candidate.x - point.x, candidate.y - point.y);
          if (d < distance) {
            distance = d;
            nearest = i;
          }
        }
        const screenDistance = distance * Math.hypot(matrix.a, matrix.b);
        setFeedback(screenDistance > 40);
        if (screenDistance <= 40) {
          value = nearest / 1000;
          paint();
          requestFrame();
        }
      },
    };
    const visibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(animation);
        animation = 0;
        lastTime = 0;
      } else requestFrame();
    };
    const beginExternalScroll = () => {
      if (currentMode !== "scroll") {
        // Hand the current route position back before the browser applies its
        // next wheel/touch movement. No document layout work is needed per frame.
        syncManualProgress();
        interrupt();
        changeMode("paused");
      }
      externalScroll = true;
    };
    const scrollKey = (event: KeyboardEvent) => {
      if (
        ![
          "ArrowUp",
          "ArrowDown",
          "PageUp",
          "PageDown",
          "Home",
          "End",
          " ",
        ].includes(event.key)
      )
        return;
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest("input,textarea,select,[contenteditable='true']"))
        return;
      if (event.key === " " && target?.closest("button,[role='button']"))
        return;
      beginExternalScroll();
    };
    const scrollTouch = (event: TouchEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      if (!target?.closest(".delivery-journey__capsule,input"))
        beginExternalScroll();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) requestFrame();
      else {
        cancelAnimationFrame(animation);
        animation = 0;
        lastTime = 0;
      }
    });
    observer.observe(stage);
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("wheel", beginExternalScroll, {
      passive: true,
      capture: true,
    });
    window.addEventListener("keydown", scrollKey, true);
    window.addEventListener("touchmove", scrollTouch, {
      passive: true,
      capture: true,
    });
    paint();
    requestFrame();
    return () => {
      controller.current = null;
      cancelAnimationFrame(animation);
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("wheel", beginExternalScroll, true);
      window.removeEventListener("keydown", scrollKey, true);
      window.removeEventListener("touchmove", scrollTouch, true);
    };
  }, [reduced]);

  function handlePointer(
    event: PointerEvent<SVGGElement>,
    phase: "start" | "move" | "end",
  ) {
    if (phase === "start") {
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    controller.current?.pointer(phase, event.clientX, event.clientY);
    if (
      phase === "end" &&
      event.currentTarget.hasPointerCapture(event.pointerId)
    )
      event.currentTarget.releasePointerCapture(event.pointerId);
  }
  const isMoving =
    mode === "playing" || mode === "seeking" || mode === "dragging";
  return (
    <section
      ref={sectionRef}
      className={`delivery-journey${offRoute ? " delivery-journey--off-route" : ""}`}
      aria-labelledby={`${id}-title`}
    >
      <div className="delivery-journey__story">
        <span className="delivery-journey__eyebrow">A living delivery</span>
        <h2 id={`${id}-title`}>{stops[active].title}</h2>
        <p aria-live="polite" aria-atomic="true">
          {stops[active].copy}
        </p>
      </div>
      <div className="delivery-journey__camera" aria-label="Camera view">
        <button
          type="button"
          aria-pressed={view === "auto"}
          onClick={() => controller.current?.view("auto")}
        >
          Auto
        </button>
        <button
          type="button"
          aria-pressed={view === "overview"}
          onClick={() => controller.current?.view("overview")}
        >
          Overview
        </button>
        <button
          type="button"
          aria-pressed={view === "follow"}
          onClick={() => controller.current?.view("follow")}
        >
          Follow
        </button>
      </div>
      <svg
        ref={svgRef}
        className="delivery-journey__art"
        viewBox="440 -70 1110 2190"
        aria-label="Capsule journey through the original illustrated digestive tract"
      >
        <g ref={cameraRef}>
          <image
            href={`${artwork}gut-original.png`}
            width="2051"
            height="2051"
            className="delivery-journey__gut"
          />
          <path
            ref={pathRef}
            d={routeData}
            className="delivery-journey__route"
          />
          <path
            ref={trailRef}
            d={routeData}
            className="delivery-journey__trail"
          />
          <g
            ref={capsuleRef}
            className="delivery-journey__capsule"
            role="button"
            tabIndex={0}
            aria-label="Drag the capsule along the dotted route, or press Enter to play or pause"
            onPointerDown={(e) => handlePointer(e, "start")}
            onPointerMove={(e) => handlePointer(e, "move")}
            onPointerUp={(e) => handlePointer(e, "end")}
            onPointerCancel={(e) => handlePointer(e, "end")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                controller.current?.toggle();
              }
            }}
          >
            <ellipse className="delivery-journey__halo" rx="89" ry="126" />
            <svg
              x="-61"
              y="-117"
              width="122"
              height="234"
              viewBox="224 105 247 475"
              overflow="visible"
            >
              <image
                href={`${artwork}capsule-original.png`}
                width="777"
                height="777"
                className="delivery-journey__capsule-image"
              />
            </svg>
          </g>
        </g>
      </svg>
      <div className="delivery-journey__cue" aria-live="polite">
        {offRoute ? "Back to the dotted route" : "Drag the capsule to explore"}
      </div>
      <span className="delivery-journey__schematic">
        Schematic journey · not to scale
      </span>
      <div className="delivery-journey__dock">
        <div className="delivery-journey__stops" aria-label="Journey stops">
          {stops.map((stop, i) => (
            <button
              key={stop.name}
              type="button"
              aria-pressed={active === i}
              onClick={() => controller.current?.stop(i)}
            >
              <span>{String(i + 1).padStart(2, "0")}</span>
              {stop.name}
            </button>
          ))}
        </div>
        <div className="delivery-journey__transport">
          <button
            className="delivery-journey__play"
            type="button"
            aria-label={isMoving ? "Pause journey" : "Play journey"}
            onClick={() => controller.current?.toggle()}
          >
            {isMoving ? "Ⅱ" : "▶"}
          </button>
          <button
            className="delivery-journey__replay"
            type="button"
            aria-label="Replay journey"
            onClick={() => controller.current?.replay()}
          >
            <span aria-hidden="true">↺</span>
            <span>Replay</span>
          </button>
          <label className="delivery-journey__range">
            <span>
              {mode === "scroll"
                ? "Scroll or drag to explore"
                : mode === "seeking"
                  ? "Moving to stop"
                  : mode === "playing"
                    ? "Playing"
                    : mode === "dragging"
                      ? "Following your lead"
                      : "Continue scrolling to move on"}
            </span>
            <input
              ref={rangeRef}
              type="range"
              min="0"
              max="1000"
              step="1"
              defaultValue={Math.round(progress * 1000)}
              aria-label="Capsule journey progress"
              onInput={(e) =>
                controller.current?.scrub(Number(e.currentTarget.value) / 1000)
              }
            />
          </label>
          <output
            ref={counterRef}
            className="delivery-journey__counter"
            aria-hidden="true"
          >
            00%
          </output>
          {onContinue && active === 4 && (
            <button
              type="button"
              className="delivery-journey__continue"
              onClick={onContinue}
            >
              Look inside ↗
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
