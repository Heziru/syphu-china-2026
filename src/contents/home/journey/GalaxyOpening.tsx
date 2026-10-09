import { useEffect, useRef, useState, type CSSProperties } from "react";
import { assetUrl } from "../../../utils/assetUrl";
import { smooth } from "./storyTimeline";
import "./galaxyOpening.css";

/** One image travels into the world chapter, keeping its silhouette continuous. */
export function GalaxyOpening({
  progress = 0, staticView = false, worldView = false,
}: { progress?: number; staticView?: boolean; worldView?: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(true);
  useEffect(() => {
    if (!staticView || !ref.current) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.intersectionRatio > 0.01), {
      rootMargin: "-56px 0px 0px", threshold: [0, 0.01],
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [staticView]);
  const travel = staticView ? Number(worldView) : smooth(0.032, 0.112, progress);
  const daylight = staticView ? Number(worldView) : smooth(0.045, 0.105, progress);
  const details = staticView ? 0 : smooth(0.14, 0.164, progress);
  const dataGlobe = staticView ? 0 : smooth(0.153, 0.174, progress);
  const opacity = staticView ? 1 : 1 - smooth(0.232, 0.259, progress);
  const titleOpacity = staticView ? Number(!worldView) : 1 - smooth(0.025, 0.062, progress);
  const worldOpacity = staticView ? Number(worldView) : smooth(0.075, 0.115, progress);
  return (
    <section ref={ref}
      className={"galaxy-opening" + (staticView ? " galaxy-opening--static" : "")}
      data-theme={daylight < 0.55 && inView ? "dark" : "light"}
      data-world={worldView || travel === 1 ? "true" : "false"}
      style={{ opacity, "--opening-travel": travel, "--opening-daylight": daylight, "--opening-details": details, "--opening-data": dataGlobe } as CSSProperties}
      aria-label={worldView ? "One world. Many lives." : "LBP–MOTOTYPE"}>
      <div className="galaxy-opening__night" aria-hidden="true" />
      <img className="galaxy-opening__wash" src={assetUrl("assets/story/decor/organic-wash.png")} alt="" />
      <img className="galaxy-opening__nebula" src={assetUrl("assets/story/opening-cute/nebula.png")} alt="" />
      <img className="galaxy-opening__stars" src={assetUrl("assets/story/solar/painted-stars-wide.png")} alt="" />
      <div className="galaxy-opening__cosmos" aria-hidden="true">
        <img className="galaxy-opening__orbit" src={assetUrl("assets/story/opening-cute/orbital-accents.png")} alt="" />
      </div>
      <div className="galaxy-opening__painted" aria-hidden="true">
        <div className="galaxy-opening__cosmos">
          <img className="galaxy-opening__globe"
            src={assetUrl("assets/story/opening-cute/earth.png")} width="1254" height="1254"
            alt="" fetchPriority={worldView ? "auto" : "high"} />
        </div>
      </div>
      <h1 className="galaxy-opening__wordmark" style={{ opacity: titleOpacity }} aria-hidden={titleOpacity < 0.05}>
        LBP–MOTOTYPE
      </h1>
      <h2 className="galaxy-opening__world-title" style={{ opacity: worldOpacity }} aria-hidden={worldOpacity < 0.05}>
        One world.<br />Many lives<span>.</span>
      </h2>
    </section>
  );
}

