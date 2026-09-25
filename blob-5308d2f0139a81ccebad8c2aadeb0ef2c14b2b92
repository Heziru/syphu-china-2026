import { createPortal } from "react-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { LITERATURE, openLiterature } from "../data/literature";
import { CurveLiteratureGallery } from "./CurveLiteratureGallery";
import "./literatureGallery.css";

export function LiteratureLibrary({
  visible = true,
  onOpenChange,
}: {
  visible?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const [opened, setOpened] = useState(false);
  const [initial, setInitial] = useState(0);
  useEffect(() => {
    onOpenChange?.(opened);
  }, [opened, onOpenChange]);
  const close = useCallback(() => {
    dialog.current?.close();
    setOpened(false);
  }, []);

  useEffect(() => {
    const open = (event: Event) => {
      lastFocus.current = document.activeElement as HTMLElement;
      const id = (event as CustomEvent<string>).detail;
      setInitial(
        Math.max(
          0,
          LITERATURE.findIndex((paper) => paper.id === id),
        ),
      );
      setOpened(true);
    };
    addEventListener("lab:literature", open);
    return () => removeEventListener("lab:literature", open);
  }, []);

  useEffect(() => {
    if (!opened) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current?.showModal();
    return () => {
      document.body.style.overflow = previousOverflow;
      if (lastFocus.current?.isConnected)
        lastFocus.current.focus({ preventScroll: true });
    };
  }, [opened]);

  return (
    <>
      <button
        hidden={!visible}
        className="lab-literature-launch"
        onClick={() => openLiterature()}
      >
        Literature <span aria-hidden="true">↗</span>
      </button>
      {createPortal(
        <dialog
          className="literature-gallery"
          ref={dialog}
          aria-labelledby="reading-title"
          onCancel={(event) => {
            event.preventDefault();
            close();
          }}
          onClose={() => {
            if (!dialog.current?.open) setOpened(false);
          }}
        >
          {opened && (
            <CurveLiteratureGallery
              key={initial}
              initial={initial}
              onClose={close}
            />
          )}
        </dialog>,
        document.body,
      )}
    </>
  );
}
