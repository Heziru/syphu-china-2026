import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "./hooks/useReducedMotion";
import "./nocturneDiagnostic.css";

/** Mirrors nocturne_memory diagnostic / boot landing (frontend_builder.py). */
type BuildState = "checking" | "installing" | "building" | "ready";

type StatusSnapshot = {
  state: BuildState;
  step: string;
  progress: number;
  description: string;
};

const BOOT_SEQUENCE: StatusSnapshot[] = [
  {
    state: "checking",
    step: "Checking frontend package.json",
    progress: 12,
    description:
      "First launch installs dependencies and builds the admin dashboard. This page refreshes automatically when ready.",
  },
  {
    state: "installing",
    step: "Installing npm dependencies…",
    progress: 38,
    description:
      "First launch installs dependencies and builds the admin dashboard. This page refreshes automatically when ready.",
  },
  {
    state: "building",
    step: "Building admin dashboard (vite build)…",
    progress: 72,
    description:
      "First launch installs dependencies and builds the admin dashboard. This page refreshes automatically when ready.",
  },
  {
    state: "ready",
    step: "Frontend build succeeded — entering dashboard…",
    progress: 100,
    description: "Redirecting you into the project…",
  },
];

const MANUAL_CMD = "cd frontend && npm install && npm run build";

export function NocturneSplash() {
  const reducedMotion = useReducedMotion();
  const [snap, setSnap] = useState<StatusSnapshot>(
    reducedMotion ? BOOT_SEQUENCE[3]! : BOOT_SEQUENCE[0]!,
  );
  const [retrying, setRetrying] = useState(false);
  const [toast, setToast] = useState("");
  const toastTimer = useRef<number | null>(null);
  const seqIndex = useRef(0);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 2000);
  }, []);

  const pollBoot = useCallback(() => {
    if (reducedMotion) return;
    seqIndex.current = Math.min(seqIndex.current + 1, BOOT_SEQUENCE.length - 1);
    setSnap(BOOT_SEQUENCE[seqIndex.current]!);
    setRetrying(false);
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;
    const id = window.setInterval(pollBoot, 1500);
    return () => window.clearInterval(id);
  }, [pollBoot, reducedMotion]);

  useEffect(
    () => () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    },
    [],
  );

  const copyCommand = () => {
    void navigator.clipboard.writeText(MANUAL_CMD).then(() => {
      showToast("Command copied to clipboard");
    });
  };

  const triggerRetry = () => {
    setRetrying(true);
    seqIndex.current = 0;
    setSnap({
      state: "checking",
      step: "Preparing rebuild retry…",
      progress: 10,
      description:
        "First launch installs dependencies and builds the admin dashboard. This page refreshes automatically when ready.",
    });
    window.setTimeout(pollBoot, 800);
  };

  const enterProject = () => {
    document.getElementById("home-story")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const badgeLabel =
    snap.state === "ready"
      ? "READY"
      : snap.state === "checking"
        ? "BUILDING"
        : "BUILDING";

  const badgeClass =
    snap.state === "ready"
      ? "nocturne-diag__badge--ready"
      : "nocturne-diag__badge--building";

  return (
    <section className="nocturne-diag" aria-label="Nocturne-style initialization">
      <div className="nocturne-diag__container">
        <div className="nocturne-diag__header">
          <div className="nocturne-diag__brand">
            <div className="nocturne-diag__logo-icon" aria-hidden="true">
              N
            </div>
            <div>
              <h1>Nocturne Memory</h1>
              <p className="nocturne-diag__brand-sub">Admin Dashboard Initialization</p>
            </div>
          </div>
          <div className={`nocturne-diag__badge ${badgeClass}`}>
            <div className="nocturne-diag__pulse-dot" aria-hidden="true" />
            <span>{badgeLabel}</span>
          </div>
        </div>

        <div className="nocturne-diag__status-section">
          <div className="nocturne-diag__status-title">{snap.step}</div>
          <p className="nocturne-diag__status-desc">{snap.description}</p>

          {snap.state !== "ready" || retrying ? (
            <div className="nocturne-diag__progress-container">
              <div
                className="nocturne-diag__progress-bar"
                style={{ width: `${snap.progress}%` }}
              />
            </div>
          ) : (
            <div className="nocturne-diag__progress-container">
              <div className="nocturne-diag__progress-bar" style={{ width: "100%" }} />
            </div>
          )}
        </div>

        <div className="nocturne-diag__guidance">
          <div className="nocturne-diag__code-box">
            <div className="nocturne-diag__code-header">
              <span>Manual Build Command</span>
              <button
                type="button"
                className="nocturne-diag__btn nocturne-diag__btn--secondary nocturne-diag__btn--small"
                onClick={copyCommand}
              >
                Copy
              </button>
            </div>
            <pre>
              <code>{MANUAL_CMD}</code>
            </pre>
          </div>

          <div className="nocturne-diag__actions">
            <button
              type="button"
              className="nocturne-diag__btn nocturne-diag__btn--primary"
              onClick={snap.state === "ready" ? enterProject : triggerRetry}
              disabled={retrying}
            >
              {snap.state === "ready"
                ? "Enter dashboard"
                : retrying
                  ? "⏳ Rebuilding…"
                  : "🔄 Retry build check"}
            </button>
            <button
              type="button"
              className="nocturne-diag__btn nocturne-diag__btn--secondary"
              onClick={() => window.location.reload()}
            >
              Refresh page
            </button>
          </div>
        </div>
      </div>

      <div
        className={`nocturne-diag__toast${toast ? " is-show" : ""}`}
        role="status"
        aria-live="polite"
      >
        {toast}
      </div>
    </section>
  );
}
