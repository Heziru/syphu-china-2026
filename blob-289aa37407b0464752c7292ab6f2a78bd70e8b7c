import { useState } from "react";
import { Link } from "react-router-dom";
import { ProjectSymbol } from "../components/ProjectSymbol";
import { sceneCopy } from "../homeCopy";

export function ExploreScene() {
  const c = sceneCopy.explore;
  const [active, setActive] = useState<string | null>(null);

  return (
    <section className="nc-scene nc-scene--static nc-explore" aria-label="Explore the project">
      <div className="nc-scene__stage">
        <p className="nc-explore__zh">{c.chineseOnce}</p>
        <nav className="nc-explore__nav" aria-label="Primary project pages">
          {c.links.map((link) => {
            const on = active === link.label;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`nc-explore__link${on ? " is-active" : ""}`}
                onMouseEnter={() => setActive(link.label)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(link.label)}
                onBlur={() => setActive(null)}
              >
                <span className="nc-explore__label">{link.label}</span>
                <span className="nc-explore__blurb">{link.blurb}</span>
                <span className="nc-explore__arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            );
          })}
        </nav>
        <div
          className={`nc-explore__symbol${active ? " is-visible" : ""}`}
          aria-hidden="true"
        >
          <ProjectSymbol size="mark" />
        </div>
      </div>
    </section>
  );
}
