import { HOME_ASSETS } from "../homeAssets";

type Props = {
  className?: string;
  size?: "hero" | "scene" | "mark";
};

/** Cropped project symbol — circular mark only, no baked wordmark. */
export function ProjectSymbol({ className = "", size = "scene" }: Props) {
  return (
    <div
      className={`mototype-symbol-crop mototype-symbol-crop--${size}${className ? ` ${className}` : ""}`}
      aria-hidden="true"
    >
      <img
        src={HOME_ASSETS.projectLogo}
        alt=""
        width={971}
        height={870}
        decoding="async"
      />
    </div>
  );
}
