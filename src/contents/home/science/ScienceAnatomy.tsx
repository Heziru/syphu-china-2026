import { Link } from "react-router-dom";
import { smooth } from "../journey/storyTimeline";
import { assetUrl } from "../../../utils/assetUrl";
import { SectionDecor } from "../../../components/SectionDecor";
import { ScienceSteps } from "./ScienceSteps";
import "./scienceAnatomy.css";

export function ScienceAnatomy({ progress: p, onNavigate, staticView = false }: {
  progress: number;
  inspection?: number;
  onNavigate?: (progress: number) => void;
  staticView?: boolean;
}) {
  const colon = p < 0.467;
  const payload = p >= 0.625 && p < 0.71;
  const withdrawal = p >= 0.71;
  const phase = colon ? "colon-section" : withdrawal ? "withdrawal" : payload ? "elafin" : "engineered-ecn";
  const start = colon ? 0.436 : withdrawal ? 0.71 : payload ? 0.625 : 0.54;
  const end = colon ? 0.467 : withdrawal ? 0.785 : payload ? 0.71 : 0.625;
  const opacity = staticView ? 1 : smooth(start, start + 0.006, p) * (1 - smooth(end - 0.005, end, p));
  const hidden = opacity < 0.01;
  return (
    <section className={`science-atlas ${colon ? "science-atlas--colon" : "science-atlas--response"}`}
      data-science-phase={phase} style={{ opacity }} aria-hidden={hidden} inert={hidden}>
      <SectionDecor variant={colon ? "local" : "cell"} subdued />
      <div className="science-atlas__copy">
        <p className="science-atlas__eyebrow">{colon ? "01 / A CLOSER LOOK" : payload ? "04 / THE PAYLOAD" : withdrawal ? "05 / THE BOUNDARY" : "03 / A LIVING RESPONSE"}</p>
        <h2>{colon ? <>A closer<br />look.</> : payload ? <>Elafin,<br />from within.</> : withdrawal ? <>A gradual<br />exit.</> : <>Designed to<br />respond.</>}</h2>
        <p className="science-atlas__subtitle">{colon ? "From the colon to its living surface." : payload ? "Constitutive production, by design." : withdrawal ? "Clearance still needs testing." : "A proposed ROS–PspA response."}</p>
        {!colon && <div className="science-atlas__mechanism">
          <p className="science-atlas__signal">{payload ? <>EcN <span aria-hidden="true">→</span> Elafin</> : withdrawal ? <>Signal falls <span aria-hidden="true">→</span> Support wanes</> : <>ROS signal <span aria-hidden="true">→</span> PspA support</>}</p>
          <p>{payload ? "Production is separate from ROS sensing." : withdrawal ? "Persistence and escape remain experimental questions." : "Within a bile-acid environment."}</p>
          <Link to={withdrawal ? "/safety-and-security" : payload ? "/experiments" : "/description#project-design"}>{withdrawal ? "Containment & limitations" : "Our design hypothesis"} <span aria-hidden="true">↗</span></Link>
        </div>}
      </div>
      {colon ? <div className="science-atlas__colonVisual">
        <picture className="science-atlas__colonArt">
          <source srcSet={assetUrl("assets/story/within/within-colon-cutaway.webp")} type="image/webp" />
          <img src={assetUrl("assets/story/within/within-colon-cutaway.png")} width={1536} height={1024}
            alt="Colon cutaway showing the lumen and the layers of its wall" />
        </picture>
        <button className="science-atlas__locator" type="button" onClick={() => onNavigate?.(0.5)}
          aria-label="Look inside the colonic surface" disabled={!onNavigate}><span /><span className="story-sr-only">Look inside</span></button>
        <svg className="science-atlas__leader" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M33 59 Q44 91 69 82" /></svg>
        <a className="science-atlas__inset" href="#home-surface" onClick={(e) => { if (onNavigate) { e.preventDefault(); onNavigate(0.5); } }}>
          <img src={assetUrl("assets/story/within/colonic-mucosa.png")} alt="Magnified colonic surface with downward crypts" />
          <span>Look inside <span aria-hidden="true">↗</span></span>
        </a>
      </div> : <div className="science-atlas__ip">
        <img src={assetUrl("assets/story/artist/ecn-original.png")} width={1200} height={1200}
          alt="The team's original EcN mascot with a yellow crown, three pale yellow spots and cyan DNA motifs" />
        {!payload && !withdrawal && <span className="science-atlas__signalDots" aria-hidden="true"><i /><i /><i /></span>}
      </div>}
      <ScienceSteps active={colon ? 0 : 2} onNavigate={onNavigate} />
      <span className="science-atlas__note">{colon ? "Anatomical schematic" : "Research concept · not a demonstrated outcome"}</span>
    </section>
  );
}
