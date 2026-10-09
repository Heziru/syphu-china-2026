import { type CSSProperties } from "react";
import { assetUrl } from "../../../utils/assetUrl";
import { clamp, smooth } from "./storyTimeline";
import "../science/scienceAnatomy.css";
import "./personSceneModular.css";

const vignettes = [
  { name: "meal", file: "04_life-meal.png", at: 0 },
  { name: "transit", file: "05_life-transit.png", at: 0.12 },
  { name: "rest", file: "06_life-rest.png", at: 0.24 },
] as const;

export function PersonScene({ progress = 0.26 }: { progress?: number }) {
  const local = clamp((progress - 0.245) / 0.075);
  return (
    <div
      className="journey-person journey-person--abstract journey-person--modular"
      data-life-complete={local >= 0.36}
    >
      <picture className="journey-person__figure">
        <source
          srcSet={assetUrl(
            "assets/story/within/why-human-digestive-mascot.webp",
          )}
          type="image/webp"
        />
        <img
          src={assetUrl("assets/story/within/why-human-digestive-mascot.png")}
          width={1086}
          height={1448}
          alt="A human figure with the digestive system illustrated inside"
          decoding="async"
        />
      </picture>
      <div className="journey-person__vignettes" aria-hidden="true">
        {vignettes.map(({ name, file, at }) => {
          const appear = smooth(at, at + 0.12, local);
          return (
            <img
              key={name}
              className={`journey-person__vignette journey-person__vignette--${name}`}
              src={assetUrl(`assets/story/modular/${file}`)}
              alt=""
              width={1280}
              height={1280}
              draggable={false}
              style={
                {
                  "--life-opacity": appear,
                  "--life-rise": `${(1 - appear) * 8}px`,
                } as CSSProperties
              }
            />
          );
        })}
      </div>
      <span>IBD · Crohn’s disease & ulcerative colitis</span>
    </div>
  );
}
