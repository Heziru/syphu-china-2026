import { assetUrl } from "../../../utils/assetUrl";
import { smooth } from "./storyTimeline";
import "./scienceStoryboard.css";

const panels = [
  {
    end: 0.535,
    eyebrow: "01 / LOCAL SURFACE",
    heading: "Mucus · crypts · wall",
    note: "The intestinal setting",
    artwork: "local-surface.png",
  },
  {
    end: 0.625,
    eyebrow: "02 / CONDITIONAL SUPPORT",
    heading: "ROS signal → PspA",
    note: "Bile acids remain part of the setting",
    artwork: "ros-pspa.png",
  },
  {
    end: 0.71,
    eyebrow: "03 / PAYLOAD",
    heading: "Elafin, constitutive by design",
    note: "Outside availability still needs testing",
    artwork: "elafin-payload.png",
  },
  {
    end: 0.785,
    eyebrow: "04 / RESPONSE WINDOW",
    heading: "Designed to taper",
    note: "Persistence and clearance need testing",
    artwork: "response-window.png",
  },
] as const;

export function ScienceStoryboard({ progress }: { progress: number }) {
  const phase = Math.max(
    0,
    panels.findIndex((panel) => progress < panel.end),
  );
  const panel = panels[phase];
  const visible =
    smooth(0.43, 0.446, progress) * (1 - smooth(0.76, 0.785, progress));

  return (
    <div className="science-storyboard" aria-hidden="true">
      <div
        className="science-storyboard__panel"
        style={{
          opacity: visible,
          transform: `translateY(${(1 - visible) * 12}px)`,
        }}
      >
        <p className="science-storyboard__eyebrow">{panel.eyebrow}</p>
        <strong>{panel.heading}</strong>
        <span>{panel.note}</span>
        {panels.map(({ artwork }, index) => (
          <img
            key={artwork}
            className="science-storyboard__art"
            src={assetUrl(`assets/story/storyboard/${artwork}`)}
            width="2172"
            height="724"
            alt=""
            decoding="async"
            style={{ opacity: phase === index ? 1 : 0 }}
          />
        ))}
      </div>
    </div>
  );
}
