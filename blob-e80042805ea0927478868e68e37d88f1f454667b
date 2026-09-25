import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { useLaboratoryStore } from "./store/laboratoryStore";
import { SceneErrorBoundary } from "./ui/SceneErrorBoundary";
import "./projectStory.css";
import { ScienceModel } from "./science/ScienceModel";
import { STORY_STEPS as STEPS } from "./science/storyContent";

const LINKS = [
  ["Design", "/description"],
  ["Experiments", "/experiments"],
  ["Model", "/model"],
  ["Results", "/results"],
  ["Safety", "/safety-and-security"],
];

function StoryIsland({ step }: { step: number }) {
  const item = STEPS[step];
  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState(0);
  return (
    <aside className={"story-island" + (open ? " is-open" : "")}>
      <button
        className="story-island-toggle"
        aria-expanded={open}
        aria-controls="story-island-body"
        onClick={() => setOpen(!open)}
      >
        <span>
          <small>{item.label}</small>
          <strong id="project-story-title">{item.title}</strong>
        </span>
        <span aria-hidden="true" className="story-island-plus">
          {open ? "−" : "+"}
        </span>
      </button>
      <div id="story-island-body" hidden={!open}>
        <p>{item.text}</p>
        <nav aria-label="Model details">
          {item.details.map(([title], i) => (
            <button
              key={title}
              aria-pressed={detail === i}
              onClick={() => setDetail(i)}
            >
              {title}
            </button>
          ))}
        </nav>
        <p className="story-island-detail">{item.details[detail][1]}</p>
        {"source" in item && (
          <a href={item.source} target="_blank" rel="noreferrer">
            Reference ↗
          </a>
        )}
      </div>
    </aside>
  );
}

export function ProjectStory({
  reduced,
  running,
  onRunning,
}: {
  reduced: boolean;
  running: boolean;
  onRunning: (v: boolean) => void;
}) {
  const phase = useLaboratoryStore((s) => s.phase);
  const simple = useLaboratoryStore((s) => s.simpleMode);
  const dialog = useRef<HTMLDialogElement>(null),
    scroller = useRef<HTMLDivElement>(null),
    trigger = useRef<HTMLButtonElement>(null);
  const [canvasReady, setCanvasReady] = useState(false);
  const [step, setStep] = useState(0),
    [t, setT] = useState(0),
    [closing, setClosing] = useState(false),
    [completed, setCompleted] = useState(false),
    [failed, setFailed] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    [],
  );
  useEffect(() => {
    if (running && (phase === "inspecting" || simple || phase === "fallback")) {
      if (!dialog.current?.open) {
        dialog.current?.showModal();
        // A hidden dialog has no scroll layout. Reset after opening so replay
        // cannot restore the previous chapter, including after a viewport resize.
        scroller.current?.scrollTo({ top: 0, behavior: "instant" });
      }
    }
  }, [running, phase, simple]);
  useEffect(() => {
    if (running && phase === "idle" && closing) {
      onRunning(false);
      setClosing(false);
      setCompleted(true);
      trigger.current?.focus({ preventScroll: true });
    }
  }, [phase, running, closing, onRunning]);
  const start = () => {
    setStep(0);
    setT(0);
    setClosing(false);
    setCanvasReady(reduced);
    onRunning(true);
    if (scroller.current) scroller.current.scrollTop = 0;
    if (!simple && phase !== "fallback")
      useLaboratoryStore.getState().inspect("computer");
  };
  const close = () => {
    if (closing) return;
    setClosing(true);
    closeTimer.current = setTimeout(
      () => {
        dialog.current?.close();
        if (simple || useLaboratoryStore.getState().phase === "fallback") {
          onRunning(false);
          setClosing(false);
          setCompleted(true);
          trigger.current?.focus({ preventScroll: true });
        } else useLaboratoryStore.getState().closeInspection();
      },
      reduced ? 0 : 420,
    );
  };
  const jump = (i: number) => {
    const node = scroller.current;
    if (!node) return;
    node.scrollTo({
      top: (node.scrollHeight - node.clientHeight) * (i / STEPS.length + 0.025),
      behavior: reduced ? "instant" : "smooth",
    });
  };
  const item = STEPS[step];
  return (
    <>
      <div className="project-story-launch" hidden={running}>
        <button
          ref={trigger}
          onClick={start}
          disabled={!["idle", "fallback"].includes(phase)}
        >
          {completed ? "Replay project" : "Project"} <span>↗</span>
        </button>
        {completed && (
          <nav aria-label="Project evidence">
            {LINKS.map(([label, path]) => (
              <Link key={label} to={path}>
                {label} ↗
              </Link>
            ))}
          </nav>
        )}
      </div>
      {createPortal(
        <dialog
          ref={dialog}
          className={`project-story${closing ? " is-closing" : ""}`}
          aria-labelledby="project-story-title"
          onAnimationEnd={(e) => {
            if (e.animationName === "story-expand") setCanvasReady(true);
          }}
          onCancel={(e) => {
            e.preventDefault();
            close();
          }}
        >
          <button className="project-story-close" onClick={close}>
            Back to lab ↙
          </button>
          <div
            ref={scroller}
            className="project-story-scroll"
            onScroll={(e) => {
              const n = e.currentTarget;
              const p = Math.min(
                0.999,
                n.scrollTop / Math.max(1, n.scrollHeight - n.clientHeight),
              );
              setStep(Math.floor(p * STEPS.length));
              setT((p * STEPS.length) % 1);
            }}
          >
            <div className="project-story-runway">
              <div className="project-story-sticky">
                <div className="story-scene-note">
                  <span>LBP-MOTOTYPE</span>
                  <p>{item.summary}</p>
                </div>
                <div
                  className="project-story-model"
                  aria-label={
                    item.title + " — interactive anatomical schematic"
                  }
                >
                  {running && canvasReady && !failed ? (
                    <SceneErrorBoundary onError={() => setFailed(true)}>
                      <Canvas
                        orthographic
                        camera={{ position: [0, 0, 15], zoom: 65 }}
                        dpr={[1, 1.5]}
                        gl={{ alpha: true }}
                      >
                        <ScienceModel step={step} t={t} reduced={reduced} />
                      </Canvas>
                    </SceneErrorBoundary>
                  ) : (
                    <div className="project-story-static">{item.summary}</div>
                  )}
                </div>
                <p className="story-schematic-label">
                  Anatomical schematic · Design hypothesis
                </p>
                <StoryIsland key={step} step={step} />
                <div className="project-story-controls">
                  <span>Scroll to explore ↓</span>
                  <nav aria-label="Mechanism steps">
                    {STEPS.map((s, i) => (
                      <button
                        key={s.label}
                        aria-label={s.title}
                        aria-current={step === i ? "step" : undefined}
                        onClick={() => jump(i)}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </button>
                    ))}
                  </nav>
                  <button
                    onClick={() =>
                      step < STEPS.length - 1 ? jump(step + 1) : close()
                    }
                  >
                    {step < STEPS.length - 1
                      ? "Continue →"
                      : "Back to the lab ↙"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </dialog>,
        document.body,
      )}
    </>
  );
}
