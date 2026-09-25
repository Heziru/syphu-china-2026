import { heroCopy } from "./homeCopy";
import { ArchiveStarsCanvas } from "./opening/ArchiveStarsCanvas";
import "./nocturneArchive.css";

/**
 * Nocturne-Memory-Core dashboard gate — archive-stars + archive-hero
 * @see https://github.com/Pyruslili/Nocturne-Memory-Core dashboard.html
 */
export function NocturneSplash() {
  const enter = () => {
    document.getElementById("home-story")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="nocturne-archive">
      <div className="nocturne-archive__grain" aria-hidden="true" />
      <div className="nocturne-archive__cosmic" aria-hidden="true" />

      <header className="nocturne-archive__topbar">
        <div className="nocturne-archive__brand">
          <svg className="nocturne-archive__brand-mark" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="0.7" />
            <path d="M12 5 A12 12 0 0 0 12 27 A9 9 0 0 1 12 5 Z" fill="currentColor" />
            <circle cx="25" cy="8" r="0.5" fill="currentColor" />
            <circle cx="27" cy="12" r="0.4" fill="currentColor" />
          </svg>
          <span className="nocturne-archive__brand-name">{heroCopy.title}</span>
          <span className="nocturne-archive__brand-sep">/</span>
          <span className="nocturne-archive__stats-line">SYPHU-CHINA · iGEM 2026</span>
        </div>
      </header>

      <section className="nocturne-archive__hero" aria-label="Opening">
        <ArchiveStarsCanvas />
        <div className="nocturne-archive__hero-vignette" aria-hidden="true" />

        <div className="nocturne-archive__hero-copy">
          <div className="nocturne-archive__kicker">
            MEMORY OBSERVATORY / CONTINUITY 01
          </div>
          <h1 className="nocturne-archive__title">
            A private archive
            <em>for what stayed.</em>
          </h1>
          <p className="nocturne-archive__subtitle">
            Fragments, breaths, and signals still in orbit.
          </p>
          <div className="nocturne-archive__ledger">{heroCopy.persistenceZh}</div>
        </div>

        <button
          type="button"
          className="nocturne-archive__scroll-cue"
          onClick={enter}
        >
          Enter quietly
        </button>
      </section>
    </div>
  );
}
