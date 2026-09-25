import { useId } from "react";
import "../science/scienceAnatomy.css";

/** Original rounded silhouette, following the user's simple large-head reference.
 * The abdominal cue is a location guide, not a diagnostic symptom map. */
export function PersonScene() {
  const id = useId().replace(/:/g, "");
  const contour =
    "M250 45 C189 45 157 86 160 137 C161 170 177 190 200 202 L201 213 C186 218 174 228 161 242 L109 290 C93 306 110 327 128 316 L184 280 L177 374 L165 523 C162 547 182 560 204 554 C217 551 223 539 225 524 L249 410 L273 524 C277 548 290 559 311 554 C327 550 334 537 331 521 L319 374 L311 280 L363 315 C382 327 399 306 383 291 L332 243 C317 227 307 220 294 215 L295 202 C321 190 339 168 341 137 C345 86 313 45 250 45Z";
  return (
    <div className="journey-person journey-person--abstract">
      <svg viewBox="0 0 500 620" role="img" aria-labelledby={`${id}-title`}>
        <title id={`${id}-title`}>
          IBD can interrupt everyday life. An abstract person with a highlighted
          abdomen.
        </title>
        <defs>
          <linearGradient id={`${id}-fill`} x1="0" y1="0" x2=".9" y2="1">
            <stop stopColor="#f6f0da" />
            <stop offset=".55" stopColor="#e5e7cd" />
            <stop offset="1" stopColor="#b6cbb3" />
          </linearGradient>
          <radialGradient id={`${id}-abdomen`}>
            <stop stopColor="#d7a185" stopOpacity=".6" />
            <stop offset=".55" stopColor="#e4b69a" stopOpacity=".3" />
            <stop offset="1" stopColor="#e4b69a" stopOpacity="0" />
          </radialGradient>
          <filter
            id={`${id}-shadow`}
            x="-30%"
            width="160%"
            y="-30%"
            height="175%"
          >
            <feDropShadow
              dx="0"
              dy="12"
              stdDeviation="13"
              floodColor="#819481"
              floodOpacity=".17"
            />
          </filter>
        </defs>
        <ellipse
          cx="250"
          cy="570"
          rx="113"
          ry="14"
          fill="#9cae97"
          opacity=".11"
        />
        <path
          d={contour}
          fill={`url(#${id}-fill)`}
          stroke="#799c8d"
          strokeWidth="3"
          strokeLinejoin="round"
          filter={`url(#${id}-shadow)`}
        />
        <path
          d="M181 131Q180 78 232 65M181 250L123 305M190 382L179 522"
          fill="none"
          stroke="#fff9e6"
          strokeWidth="7"
          strokeLinecap="round"
          opacity=".8"
        />
        <ellipse
          cx="249"
          cy="336"
          rx="84"
          ry="87"
          fill={`url(#${id}-abdomen)`}
        />
        <g opacity=".52" strokeLinecap="round" fill="none">
          <path
            d="M253 277v13q-1 13 12 15 15 1 20-11 12 5 10 18-4 18-29 13-18-7-24 2"
            stroke="#ba907b"
            strokeWidth="6"
          />
          <path
            d="M219 367v-27q0-12 12-10 28 8 48-2 10-4 11 9v29q0 12-14 10-16-3-22 10v10"
            stroke="#729b85"
            strokeWidth="9"
          />
          <path
            d="M237 343q39-5 39 5t-36 8q-6 10 30 9"
            stroke="#cba48a"
            strokeWidth="5"
          />
        </g>
        <g className="person-leader">
          <path d="M185 321Q136 308 91 324" />
          <path d="M297 353Q348 344 403 363" />
          <path d="M307 167Q351 137 397 150" />
        </g>
        <g className="person-symptom">
          <text x="90" y="302" textAnchor="middle">
            ABDOMINAL
          </text>
          <text x="90" y="318" textAnchor="middle">
            PAIN
          </text>
          <text x="408" y="380" textAnchor="middle">
            DIARRHOEA
          </text>
          <text x="399" y="139" textAnchor="middle">
            FATIGUE
          </text>
        </g>
        <circle cx="185" cy="321" r="2.5" fill="#b69179" />
        <circle cx="297" cy="353" r="2.5" fill="#b69179" />
        <circle cx="307" cy="167" r="2.5" fill="#a1b497" />
      </svg>
      <span>IBD · Crohn’s disease & ulcerative colitis</span>
    </div>
  );
}
