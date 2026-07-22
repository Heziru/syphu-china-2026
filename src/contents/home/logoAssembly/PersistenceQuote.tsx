import { useEffect, useRef, useState } from "react";
import { heroCopy } from "../homeCopy";
import {
  QUOTE_DELAY_MS,
  QUOTE_FADE_MS,
  QUOTE_HOLD_MS,
} from "./shardTypes";

type Props = {
  /** Start after logo reveal completes. */
  active: boolean;
  reducedMotion: boolean;
  onFinished: () => void;
};

/**
 * Typewriter for the persistence couplet — runs once per mount cycle.
 */
export function PersistenceQuote({
  active,
  reducedMotion,
  onFinished,
}: Props) {
  const full = heroCopy.persistence;
  const [visible, setVisible] = useState("");
  const [mode, setMode] = useState<"idle" | "typing" | "hold" | "fade" | "gone">(
    "idle",
  );
  const startedRef = useRef(false);
  const onFinishedRef = useRef(onFinished);
  onFinishedRef.current = onFinished;

  useEffect(() => {
    if (!active || startedRef.current) return;
    startedRef.current = true;

    const timers: number[] = [];
    const clearAll = () => {
      for (const id of timers) window.clearTimeout(id);
    };

    const schedule = (fn: () => void, ms: number) => {
      timers.push(window.setTimeout(fn, ms));
    };

    if (reducedMotion) {
      schedule(() => {
        setVisible(full);
        setMode("hold");
      }, QUOTE_DELAY_MS);
      schedule(() => setMode("fade"), QUOTE_DELAY_MS + 3000);
      schedule(() => {
        setMode("gone");
        onFinishedRef.current();
      }, QUOTE_DELAY_MS + 3000 + QUOTE_FADE_MS);
      return clearAll;
    }

    schedule(() => {
      setMode("typing");
      let i = 0;
      const step = () => {
        if (i >= full.length) {
          setMode("hold");
          schedule(() => setMode("fade"), QUOTE_HOLD_MS);
          schedule(() => {
            setMode("gone");
            onFinishedRef.current();
          }, QUOTE_HOLD_MS + QUOTE_FADE_MS);
          return;
        }
        const ch = full[i]!;
        i += 1;
        setVisible(full.slice(0, i));
        let wait = 42 + Math.random() * 8;
        if (ch === "." || ch === "\n") wait += 220;
        schedule(step, wait);
      };
      step();
    }, QUOTE_DELAY_MS);

    return clearAll;
  }, [active, full, reducedMotion]);

  if (mode === "idle" || mode === "gone") return null;

  return (
    <>
      <p
        className={`mototype-persistence-copy${mode === "fade" ? " is-fading" : ""}${mode === "typing" ? " is-typing" : ""}`}
        aria-hidden="true"
      >
        {visible}
        {mode === "typing" && <span className="mototype-persistence-caret">|</span>}
      </p>
      {mode === "hold" || mode === "fade" ? (
        <p className="home-sr-only" aria-live="polite">
          {full.replace("\n", " ")}
        </p>
      ) : null}
    </>
  );
}
