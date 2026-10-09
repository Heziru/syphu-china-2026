import { assetUrl } from "../../../utils/assetUrl";
import { smooth } from "./storyTimeline";
import { SectionDecor } from "../../../components/SectionDecor";
import { ScienceSteps } from "../science/ScienceSteps";
import "./homeHeroLanding.css";

export function HomeHeroLanding({ progress, onExplore, onNavigate }: {
  progress?: number;
  onExplore: () => void;
  onNavigate?: (progress: number) => void;
}) {
  const opacity = progress === undefined ? 1 : smooth(0.467, 0.474, progress) * (1 - smooth(0.533, 0.54, progress));
  const hidden = opacity < 0.01;
  return <section id={progress === undefined ? "home-surface" : undefined}
    className={`heroLanding${progress === undefined ? " heroLanding--static" : ""}`}
    style={{ opacity }} aria-hidden={hidden} inert={hidden}>
    <SectionDecor variant="local" className="heroLanding__decor" />
    <div className="heroContent">
      <p className="heroLanding__eyebrow">02 / THE LOCAL ENVIRONMENT</p>
      <h2>A living barrier<span>.</span></h2>
      <p className="heroLanding__subtitle">Where host and microbes meet.</p>
    </div>
    <div className="heroVisual">
      <img className="heroMucosa" src={assetUrl("assets/story/within/colonic-mucosa.png")}
        width={1902} height={827} alt="Colonic mucosa with a mucus layer, a single epithelial layer and three downward crypts" />
      <svg className="heroVisual__labels" viewBox="0 0 1000 440" aria-hidden="true">
        <g><path d="M840 90 L930 38 H966" /><circle cx="840" cy="90" r="4" /><text x="970" y="42">Mucus</text></g>
        <g><path d="M913 166 L955 130 H966" /><circle cx="913" cy="166" r="4" /><text x="970" y="134">Epithelium</text></g>
        <g><path d="M820 298 L930 316 H966" /><circle cx="820" cy="298" r="4" /><text x="970" y="320">Crypt</text></g>
      </svg>
    </div>
    <img className="heroScientist" src={assetUrl("assets/story/hero/scientist-mascot.png")}
      width={1122} height={1402} alt="The SYPHU researcher studies the local environment" />
    <ScienceSteps active={1} onNavigate={onNavigate} />
    <button className="heroLanding__follow" type="button" onClick={onExplore}>Follow the signal <span aria-hidden="true">↗</span></button>
  </section>;
}

