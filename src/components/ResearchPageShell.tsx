import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { assetUrl } from "../utils/assetUrl";
import "./researchPageShell.css";

type ContentsEntry = readonly [id: string, label: string];

interface ResearchPageShellProps {
  title: ReactNode;
  eyebrow?: string;
  subtitle?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  contents?: readonly ContentsEntry[];
  sidebarExtra?: ReactNode;
  artwork?: { src: string; alt: string };
  className?: string;
  children: ReactNode;
}

/** Shared article layout. Explicit contents preserve a page's established anchors. */
export function ResearchPageShell({
  title,
  eyebrow = "SYPHU-China · Research",
  subtitle,
  description,
  actions,
  contents,
  sidebarExtra,
  artwork,
  className = "",
  children,
}: ResearchPageShellProps) {
  const body = useRef<HTMLDivElement>(null);
  const [discovered, setDiscovered] = useState<ContentsEntry[]>([]);
  useEffect(() => {
    if (contents || !body.current) return;
    const used = new Set<string>();
    const entries: ContentsEntry[] = [];
    for (const heading of body.current.querySelectorAll<HTMLHeadingElement>("h2")) {
      if (heading.closest("[data-research-toc-ignore], [role='dialog']")) continue;
      const section = heading.closest("section");
      // Nested tool/report sections do not become top-level article chapters.
      if (section?.parentElement?.closest("section")) continue;
      const label = heading.textContent?.trim();
      if (!label) continue;
      let id = heading.id || section?.id;
      if (!id || used.has(id)) {
        const stem = "chapter-" + (label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "section");
        id = stem;
        let suffix = 2;
        while (used.has(id) || (document.getElementById(id) && document.getElementById(id) !== heading)) id = `${stem}-${suffix++}`;
        heading.id = id;
      }
      used.add(id);
      entries.push([id, label]);
    }
    setDiscovered(entries);
  }, [contents, title]);

  const chapters = contents ?? discovered;
  const pageName = typeof title === "string" ? title : "Page";
  const pageArtwork = artwork ?? (
    eyebrow.startsWith("WET LAB")
      ? { src: assetUrl("assets/research-identity/wet-lab.png"), alt: "Symbolic illustration of SYPHU-China's EcN character for Wet Lab; not a measurement" }
      : pageName === "Software"
        ? { src: assetUrl("assets/research-identity/software.png"), alt: "Symbolic illustration of SYPHU-China's EcN character for Software; not a measurement" }
        : pageName === "Model"
          ? { src: assetUrl("assets/research-identity/model.png"), alt: "Symbolic illustration of SYPHU-China's EcN character for Model; not a measurement" }
          : { src: assetUrl("assets/story/artist/ecn-original.png"), alt: "Symbolic illustration of SYPHU-China's original EcN character; not a measurement" }
  );
  const navigation = (
    <nav aria-label={`${pageName} contents`}>
      <ol>
        {chapters.map(([id, label], index) => (
          <li key={id}>
            <a href={`#${id}`}>
              <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              {label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );

  return (
    <main className={`research-shell ${className}`}>
      <header className={`research-shell-header${pageName.length > 14 ? " research-shell-header--long-title" : ""}`}>
        <div className="research-shell-header-inner">
          <div className="research-shell-meta">
            <span>{eyebrow}</span>
            <span>SYPHU-China · iGEM 2026</span>
          </div>
          <div className="research-shell-hero">
            <div className="research-shell-hero-copy">
              <h1>{title}</h1>
              {subtitle && <p className="research-shell-subtitle">{subtitle}</p>}
              {(description || actions) && (
                <div className="research-shell-header-bottom">
                  {description && <div className="research-shell-description">{description}</div>}
                  {actions && <div className="research-shell-actions">{actions}</div>}
                </div>
              )}
            </div>
            <div className="research-shell-artwork">
              <img src={pageArtwork.src} alt={pageArtwork.alt} width="600" height="600" fetchPriority="high" />
            </div>
          </div>
        </div>
      </header>
      <div className={`research-shell-layout${chapters.length ? "" : " research-shell-layout--without-contents"}`}>
        {chapters.length > 0 && (
          <aside className="research-shell-sidebar">
            <p>On this page</p>
            {navigation}
            {sidebarExtra && <div className="research-shell-sidebar-extra">{sidebarExtra}</div>}
          </aside>
        )}
        <div className="research-shell-body" ref={body}>
          {chapters.length > 0 && (
            <details className="research-shell-mobile-contents">
              <summary>On this page</summary>
              {navigation}
              {sidebarExtra && <div className="research-shell-sidebar-extra">{sidebarExtra}</div>}
            </details>
          )}
          {children}
        </div>
      </div>
    </main>
  );
}
