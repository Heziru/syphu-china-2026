import { useId, type CSSProperties } from "react";
import { smooth } from "../journey/storyTimeline";
import "./scienceAnatomy.css";

const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const colonPath =
  "M246 471 C233 471 233 439 237 409 L237 294 C231 243 271 233 314 254 C377 285 426 288 486 252 C532 225 574 237 574 286 L574 453 C576 501 548 519 511 506 C470 491 446 516 454 555 L457 595";
const smallIntestinePath =
  "M353 283 C385 280 477 291 504 315 C527 343 486 351 469 336 C451 320 346 304 317 321 C285 340 332 370 377 354 C414 342 477 354 504 377 C530 403 493 425 471 409 C447 391 350 381 318 396 C285 414 327 449 367 432 C406 415 466 436 491 451 C516 471 483 493 453 476 C419 457 373 470 353 484 C317 509 285 482 276 467";
const haustra = [
  [236, 316, 0],
  [236, 353, 0],
  [236, 390, 0],
  [236, 429, 0],
  [278, 251, -65],
  [320, 270, -76],
  [367, 284, -86],
  [413, 282, -102],
  [461, 268, -115],
  [515, 246, -98],
  [574, 312, 0],
  [574, 351, 0],
  [574, 392, 0],
  [574, 433, 0],
  [563, 476, 28],
  [515, 507, 84],
];

/** Illustrated anatomy uses an anterior view: the ascending colon is on the viewer's left.
 * Sources: NIDDK digestive-system overview; OpenStax A&P 23.5 (colon crypts, not villi).
 * Organic paths are original schematic artwork, not measured anatomical reconstructions.
 */
function DigestiveSystem({
  id,
  selected,
  inspect,
}: {
  id: string;
  selected: number;
  inspect: number;
}) {
  return (
    <g>
      <path
        d="M300 62 Q400 29 502 63 L551 163 Q635 244 627 382 L622 508 Q550 629 402 638 Q258 621 195 510 L187 372 Q180 254 258 167Z"
        fill={`url(#${id}-body)`}
        stroke="#c4d2c9"
        strokeWidth="1.5"
        opacity=".45"
      />
      <g filter={`url(#${id}-shadow)`}>
        {/* The oesophagus, cardia, stomach and proximal duodenum share one
            continuous outline. The narrowing pyloric canal flows into a
            C-shaped duodenum; its distal join is posterior to the colon. */}
        <path
          d="M395 28 Q395 18 405 18 Q415 18 415 28 C415 63 413 99 420 121 C426 137 449 138 465 122 C493 95 540 115 549 149 C563 194 541 228 505 246 C477 263 447 262 424 247 C407 236 391 224 373 226 C350 228 335 233 329 249 C323 260 338 267 355 269 L351 289 C319 286 304 277 306 255 C307 228 331 209 365 207 C388 207 411 220 423 202 C433 189 431 174 420 163 C404 147 395 134 395 110Z"
          fill={`url(#${id}-stomach)`}
          stroke="#b48f7a"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path
          d="M401 31V107 C401 131 408 145 419 155 M474 130 C498 113 526 130 535 151 M365 216 C340 218 318 233 318 255 C318 267 332 275 350 279"
          fill="none"
          stroke="#f8e1c6"
          strokeWidth="5"
          strokeLinecap="round"
          opacity=".65"
        />
        <path
          d="M460 161 Q496 149 510 171 M443 180 Q485 164 518 186 M424 204 Q471 186 507 207 M424 220 Q457 208 481 226"
          fill="none"
          stroke="#c9977d"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity=".65"
        />
        <path
          d={smallIntestinePath}
          fill="none"
          stroke="#bf947e"
          strokeWidth="32"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={smallIntestinePath}
          fill="none"
          stroke={`url(#${id}-intestine)`}
          strokeWidth="26"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={smallIntestinePath}
          fill="none"
          stroke="#f9e7ce"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".45"
          transform="translate(-2 -5)"
        />
        <path
          d="M243 482 Q262 507 249 531"
          stroke="#a1b9a9"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d={colonPath}
          fill="none"
          stroke="#6b9587"
          strokeWidth="53"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={colonPath}
          fill="none"
          stroke={`url(#${id}-colon)`}
          strokeWidth="47"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={colonPath}
          fill="none"
          stroke="#d9e7cf"
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity=".45"
          transform="translate(-9 -3)"
        />
        {haustra.map(([x, y, a], i) => (
          <g key={i} transform={`translate(${x} ${y}) rotate(${a})`}>
            <path
              d="M-21-5 Q-5 3 21-4"
              fill="none"
              stroke="#739c8a"
              strokeWidth="2.5"
              opacity=".66"
            />
            <path
              d="M-17-8 Q0-2 17-7"
              fill="none"
              stroke="#e0e8cf"
              strokeWidth="2.5"
              opacity=".66"
            />
          </g>
        ))}
      </g>
      <g opacity={selected}>
        <path
          d="M574 343 L574 418"
          fill="none"
          stroke="#cf8c75"
          strokeWidth="48"
          strokeLinecap="round"
        />
        <path
          d="M563 349 L563 412"
          fill="none"
          stroke="#f9dec2"
          strokeWidth="9"
          strokeLinecap="round"
          opacity=".7"
        />
        <path
          d="M554 366 Q574 376 595 366 M554 393 Q574 402 595 393"
          stroke="#b57566"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M608 346 h13 v71 h-13"
          fill="none"
          stroke="#688e83"
          strokeWidth="1.5"
        />
        <text x="635" y="385" className="science-label">
          COLON
        </text>
      </g>
      <g opacity={inspect * (1 - selected * 0.7)} className="science-labels">
        <path d="M542 167H638" />
        <text x="650" y="172">
          STOMACH
        </text>
        <path d="M335 399H122" />
        <text x="108" y="395" textAnchor="end">
          SMALL
        </text>
        <text x="108" y="414" textAnchor="end">
          INTESTINE
        </text>
      </g>
    </g>
  );
}

function ColonSection({ id, inspect }: { id: string; inspect: number }) {
  return (
    <g filter={`url(#${id}-shadow)`}>
      {/* Haustral bulges identify the colon. A removed longitudinal sector
          connects the visible mucosal lining to the cut end and lumen. */}
      <path
        d="M214 271 C239 211 269 181 310 180 C324 148 352 137 375 146 C407 114 445 104 473 115 C507 87 543 95 566 116 C603 104 640 128 651 160 C674 184 672 224 655 257 C678 286 660 320 637 335 C639 374 608 406 568 413 C552 448 516 470 483 467 C450 492 407 506 365 498 L262 482 C195 456 173 401 183 354Z"
        fill={`url(#${id}-colon)`}
        stroke="#72998a"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M311 182 C351 213 374 266 357 332 M375 148 C409 187 433 231 438 276 M565 119 C579 154 599 191 629 217 M638 336 C605 335 586 323 575 306 M568 413 Q539 403 526 382"
        fill="none"
        stroke="#739b87"
        strokeWidth="4"
        strokeLinecap="round"
        opacity=".64"
      />
      <path
        d="M319 184 Q338 160 364 158 M388 150 Q425 118 460 129 M481 119 Q519 95 553 124"
        fill="none"
        stroke="#dae6c6"
        strokeWidth="7"
        strokeLinecap="round"
        opacity=".65"
      />
      <path
        d="M443 177 C472 153 505 143 535 150 C569 157 595 178 607 204 Q615 217 606 234 L572 282 Q552 309 496 328 C496 264 478 219 443 177Z"
        fill="#d9aa8e"
        stroke="#b98974"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M461 181 C487 164 513 159 532 165 C558 172 581 189 594 212 Q599 220 590 236 L552 277 Q529 296 507 306 C507 254 488 211 461 181Z"
        fill={`url(#${id}-lumen)`}
      />
      <path
        d="M464 177 C487 160 514 156 535 162 Q575 177 598 211"
        fill="none"
        stroke="#f2d6b5"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M489 192 Q526 195 558 228 M505 221 Q538 222 563 245 M515 252 Q535 260 550 276"
        fill="none"
        stroke="#a9b69a"
        strokeWidth="3"
        strokeLinecap="round"
        opacity=".7"
      />
      <ellipse
        cx="355"
        cy="368"
        rx="193"
        ry="146"
        transform="rotate(-13 355 368)"
        fill="#c99480"
        stroke="#a77a69"
        strokeWidth="2"
      />
      <ellipse
        cx="355"
        cy="368"
        rx="179"
        ry="132"
        transform="rotate(-13 355 368)"
        fill="#e6bda3"
        stroke="#efd3b8"
        strokeWidth="4"
      />
      <ellipse
        cx="355"
        cy="368"
        rx="163"
        ry="115"
        transform="rotate(-13 355 368)"
        fill="#f0d6b9"
      />
      <ellipse
        cx="355"
        cy="368"
        rx="150"
        ry="102"
        transform="rotate(-13 355 368)"
        fill="#c88573"
        stroke="#d5967f"
        strokeWidth="7"
      />
      <ellipse
        cx="355"
        cy="368"
        rx="136"
        ry="88"
        transform="rotate(-13 355 368)"
        fill={`url(#${id}-lumen)`}
      />
      <path
        d="M228 363 Q241 283 382 288 Q467 292 487 336"
        fill="none"
        stroke="#efd3b5"
        strokeWidth="7"
        strokeLinecap="round"
        opacity=".8"
      />
      {Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2;
        const x = 355 + 157 * Math.cos(a);
        const y = 368 + 112 * Math.sin(a);
        return (
          <path
            key={i}
            d={`M${x} ${y}l${5 * Math.cos(a)} ${5 * Math.sin(a)}`}
            stroke="#b87967"
            strokeWidth="2"
            transform="rotate(-13 355 368)"
            opacity=".55"
          />
        );
      })}
      <path
        d="M357 458 Q410 460 457 430"
        stroke="#e4b398"
        strokeWidth="20"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M357 451 Q410 453 454 422"
        stroke="#81aa96"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <g className="science-labels science-section-labels">
        <text
          x="433"
          y="75"
          textAnchor="middle"
          className="science-section-title"
        >
          COLON · CUT SECTION
        </text>
        <path d="M361 355L640 323" />
        <text x="650" y="328">
          LUMEN
        </text>
        <path d="M433 438L653 428" />
        <text x="666" y="433">
          MUCOSA
        </text>
        <g opacity={inspect} className="science-extra-labels">
          <path d="M439 479L620 535" />
          <text x="628" y="540">
            MUSCLE
          </text>
        </g>
      </g>
    </g>
  );
}

const crypts = [190, 400, 610];
const tissueSurface =
  "M60 303 H145 Q154 303 154 323 V402 Q154 445 190 445 Q226 445 226 402 V323 Q226 303 235 303 H355 Q364 303 364 323 V402 Q364 445 400 445 Q436 445 436 402 V323 Q436 303 445 303 H565 Q574 303 574 323 V402 Q574 445 610 445 Q646 445 646 402 V323 Q646 303 655 303 H748";

function Mucosa({
  id,
  inspect,
  opacity,
  cellFocus,
}: {
  id: string;
  inspect: number;
  opacity: number;
  cellFocus: number;
}) {
  return (
    <g opacity={opacity}>
      <g filter={`url(#${id}-shadow)`}>
        <path d="M60 480 H748 L771 452 V558 L748 580 H60Z" fill="#c5957c" />
        <path d="M60 469 H748 V516 H60Z" fill="#d8af93" />
        <path d="M60 516 H748 V547 H60Z" fill="#d39983" />
        <path d="M60 547 H748 V570 H60Z" fill="#b98271" />
        {Array.from({ length: 19 }, (_, i) => (
          <path
            key={i}
            d={`M${74 + i * 36} 550v17`}
            stroke="#e2b499"
            strokeWidth="2"
            opacity=".65"
          />
        ))}
        <path
          d={`${tissueSurface} V479 H60Z`}
          fill={`url(#${id}-tissue)`}
          stroke="#d8a48d"
          strokeWidth="2"
        />
        <path
          d={tissueSurface}
          stroke="#c58a78"
          strokeWidth="33"
          fill="none"
          strokeLinejoin="round"
        />
        <path
          d={tissueSurface}
          stroke="#efd0b2"
          strokeWidth="27"
          fill="none"
          strokeLinejoin="round"
        />
        <path
          d={tissueSurface}
          stroke="#f8dfc2"
          strokeWidth="3"
          fill="none"
          transform="translate(0 -13)"
          opacity=".85"
        />
        {crypts.map((x, ci) => (
          <g key={x}>
            {[-1, 1].map((side) =>
              Array.from({ length: 7 }, (_, i) => (
                <g
                  key={`${side}-${i}`}
                  transform={`translate(${x + side * 36} ${323 + i * 12})`}
                >
                  <ellipse
                    rx="4"
                    ry="3"
                    fill={ci === 2 ? "#b57e75" : "#bc947e"}
                  />
                  <path
                    d={`M${-side * 13} 6h${side * 25}`}
                    stroke="#cead93"
                    strokeWidth="1"
                  />
                </g>
              )),
            )}
            {Array.from({ length: 7 }, (_, i) => {
              const a = (i / 6) * Math.PI;
              return (
                <ellipse
                  key={i}
                  cx={x + 33 * Math.cos(a)}
                  cy={404 + 39 * Math.sin(a)}
                  rx="3.8"
                  ry="3"
                  fill="#b28b7a"
                  transform={`rotate(${i * 30} ${x + 33 * Math.cos(a)} ${404 + 39 * Math.sin(a)})`}
                />
              );
            })}
            <path
              d={`M${x - 31} 343 q-14-6-12-15 q3-10 12-8 q8 4 4 11z`}
              fill="#fff1d3"
              stroke="#d3b69a"
              strokeWidth="1.3"
            />
            <path
              d={`M${x + 32} 391 q14-5 12-15 q-3-10-12-8 q-8 4-4 11z`}
              fill="#fff1d3"
              stroke="#d3b69a"
              strokeWidth="1.3"
            />
            <path
              d={`M${x - 50} 474q17-34 11-60m11 39q-5 2-9-12m27 41q25-12 32-27`}
              stroke="#bd9a84"
              strokeWidth="2"
              fill="none"
              opacity=".4"
            />
          </g>
        ))}
        {[
          ...Array.from({ length: 6 }, (_, i) => 70 + i * 13),
          ...Array.from({ length: 8 }, (_, i) => 250 + i * 13),
          ...Array.from({ length: 8 }, (_, i) => 460 + i * 13),
          ...Array.from({ length: 6 }, (_, i) => 667 + i * 13),
        ].map((x) => (
          <g key={x}>
            <ellipse cx={x} cy="304" rx="3" ry="4" fill="#bb927e" />
            <path d={`M${x + 6} 291v25`} stroke="#d4ac92" strokeWidth="1" />
          </g>
        ))}
        <path
          d="M60 270 Q154 255 246 271 T426 272 T607 270 Q680 261 748 274 L748 287 Q672 281 607 284 T426 287 T246 285 Q145 276 60 286Z"
          fill="#b8d5c0"
          opacity=".6"
        />
        <path
          d="M68 267 Q150 254 244 269 T426 270 T606 268 Q677 260 744 271"
          stroke="#d3e1ca"
          strokeWidth="3"
          fill="none"
        />
      </g>
      {[
        [134, 223, -18],
        [286, 189, 17],
        [600, 206, -22],
        [697, 231, 12],
      ].map(([x, y, a], i) => (
        <g
          key={i}
          transform={`translate(${x} ${y}) rotate(${a})`}
          opacity={0.8 - cellFocus * 0.65}
        >
          <rect
            x="-21"
            y="-8"
            width="42"
            height="16"
            rx="8"
            fill="#99ba9e"
            stroke="#57877a"
            strokeWidth="2"
          />
          <path
            d="M-11-4H10"
            stroke="#e8ebc9"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
      ))}
      {Array.from({ length: 9 }, (_, i) => (
        <g
          key={i}
          transform={`translate(${452 + (i % 3) * 64} ${117 + Math.floor(i / 3) * 43})`}
          opacity=".8"
        >
          <circle r="4" fill="#cd886d" />
          <circle cx="5" cy="-2" r="2.7" fill="#e8bfa0" />
        </g>
      ))}
      {[
        [93, 165],
        [319, 258],
        [661, 162],
      ].map(([x, y], i) => (
        <path
          key={i}
          d={`M${x} ${y - 5}l5 5-5 5-5-5z`}
          fill="#a297ba"
          stroke="#837997"
          strokeWidth="1"
        />
      ))}
      <g className="science-labels" opacity={inspect}>
        <path d="M54 271H10" />
        <text x="58" y="245">
          MUCUS
        </text>
        <path d="M205 391L288 386" />
        <text x="251" y="374">
          CRYPT
        </text>
        <path d="M645 469L729 472" />
        <text x="733" y="498" textAnchor="end">
          WALL LAYERS
        </text>
      </g>
    </g>
  );
}

function Payload({
  x,
  y,
  size = 1,
  opacity = 1,
}: {
  x: number;
  y: number;
  size?: number;
  opacity?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${size})`} opacity={opacity}>
      <path
        d="M-5 0 C-11-7-1-13 3-6 C8-10 14-2 7 2 C11 11 1 13-3 7 C-12 10-14 1-5 0Z"
        fill="#d2aa60"
        stroke="#a57c3d"
        strokeWidth="1"
      />
      <path
        d="M-4-2Q0-7 3-3"
        fill="none"
        stroke="#fff1c7"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </g>
  );
}

function Bacterium({
  id,
  p,
  inspect,
}: {
  id: string;
  p: number;
  inspect: number;
}) {
  const payload = smooth(0.615, 0.648, p);
  const signal = 1 - smooth(0.714, 0.738, p);
  const protection = 1 - smooth(0.742, 0.769, p);
  return (
    <g>
      <g filter={`url(#${id}-shadow)`}>
        <rect
          x="-241"
          y="-109"
          width="482"
          height="218"
          rx="109"
          fill={`url(#${id}-cell)`}
          stroke="#6b9584"
          strokeWidth="5"
        />
        <rect
          x="-229"
          y="-97"
          width="458"
          height="194"
          rx="97"
          fill="#dfe0b0"
          stroke="#eaf0cf"
          strokeWidth="6"
        />
        <rect
          x="-218"
          y="-87"
          width="436"
          height="174"
          rx="87"
          fill={`url(#${id}-cytosol)`}
          stroke="#619986"
          strokeWidth="5"
        />
        {Array.from({ length: 28 }, (_, i) => (
          <g key={i} opacity=".7">
            <path
              d={`M${-139 + i * 10} -94v-8m0 196v8`}
              stroke="#65947f"
              strokeWidth="1.5"
            />
            <circle cx={-139 + i * 10} cy="-105" r="2" fill="#e6eed0" />
            <circle cx={-139 + i * 10} cy="105" r="2" fill="#e6eed0" />
          </g>
        ))}
        <path
          d="M-157-3 C-143-40-115 33-97-3 S-61-39-49-2 S-10 28 5-6 S32-36 47-1 S74 26 88-10 M-155 4 C-140 43-115-31-96 2 S-66 39-49 4 S-9-27 4 5 S32 35 48 3 S76-28 91-5"
          fill="none"
          stroke="#6b9684"
          strokeWidth="5"
          strokeLinecap="round"
          opacity=".85"
        />
        <path
          d="M123 13 C113-11 165-26 183 0 C202 31 145 47 123 13Z"
          fill="none"
          stroke="#948da5"
          strokeWidth="3"
        />
        {Array.from({ length: 17 }, (_, i) => {
          const x = -171 + (i % 8) * 45;
          const y = i < 8 ? -48 : 49 + Math.sin(i * 2) * 9;
          return (
            <g key={i} transform={`translate(${x} ${y}) rotate(${i * 51})`}>
              <ellipse rx="5" ry="3.5" fill="#b4c8a7" />
              <ellipse cx="3" cy="-3" rx="3" ry="2.5" fill="#789d85" />
            </g>
          );
        })}
        {/* PspA markers are associated with the inner membrane, not drawn as an invented pore. */}
        {[-123, -73, -23, 27, 77, 127].map((x, i) => (
          <path
            key={x}
            d={`M${x - 9} 67q4 9 9 0t9 0`}
            fill="none"
            stroke="#789788"
            strokeWidth="4"
            strokeLinecap="round"
            opacity={protection * (0.7 + Math.sin(i) * 0.1)}
          />
        ))}
        {[
          [-137, 23],
          [-82, -56],
          [-32, 40],
          [40, -46],
          [81, 35],
          [145, -37],
          [187, 13],
        ].map(([x, y], i) => (
          <Payload
            key={i}
            x={x}
            y={y}
            size={0.43 + payload * 0.2}
            opacity={0.45 + payload * 0.55}
          />
        ))}
        <path
          d="M-141-108 C-272-110-272 108-141 109 L-87 108 C-162 51-166-42-89-107Z"
          className="science-cell-shell"
          fill={`url(#${id}-cell)`}
          opacity={mix(0.9, 0.26, inspect)}
          stroke="#699280"
          strokeWidth="2"
        />
        <path
          d="M-156-96Q-220-89-226-30"
          fill="none"
          stroke="#dfebc9"
          strokeWidth="7"
          strokeLinecap="round"
          opacity=".8"
        />
      </g>
      {Array.from({ length: 10 }, (_, i) => (
        <g
          key={i}
          transform={`translate(${-163 + i * 36} ${-157 - Math.sin(i * 2.39) * 22})`}
          opacity={signal}
        >
          <circle r="4" fill="#cd886d" />
          <circle cx="5" cy="-2" r="2.5" fill="#e8bfa0" />
        </g>
      ))}
      {[
        [-285, -32],
        [267, 74],
        [-204, 143],
      ].map(([x, y], i) => (
        <path
          key={i}
          d={`M${x} ${y - 5}l5 5-5 5-5-5z`}
          fill="#a297ba"
          stroke="#837997"
          strokeWidth="1"
        />
      ))}
      {Array.from({ length: 22 }, (_, i) => {
        const age = Math.max(0, smooth(0.641, 0.704, p) - i * 0.028);
        const theta = ((i * 0.87) % 2.7) - 1.35;
        const x = 171 + age * (108 + Math.cos(theta) * 128);
        const y = 15 + Math.sin(i * 2.4) * 45 + Math.sin(theta) * age * 135;
        return (
          <Payload
            key={i}
            x={x}
            y={y}
            size={0.45 + (i % 3) * 0.05}
            opacity={
              Math.min(1, age * 9) *
              (1 - age * 0.75) *
              (1 - smooth(0.723, 0.754, p))
            }
          />
        );
      })}
      <g className="science-labels" opacity={inspect}>
        <path d="M-153-91L-196-187H-256" />
        <text x="-259" y="-197">
          ENVELOPE
        </text>
        <path d="M13 76L13 154H98" />
        <text x="104" y="159">
          PspA
        </text>
        <path d="M130 14L199 153H257" />
        <text x="263" y="158">
          PLASMID
        </text>
      </g>
    </g>
  );
}

export function ScienceAnatomy({
  progress: p,
  inspection = 0,
}: {
  progress: number;
  inspection?: number;
}) {
  const id = useId().replace(/:/g, "");
  const arrival = smooth(0.295, 0.333, p);
  const segment = smooth(0.401, 0.435, p);
  const mucosa = smooth(0.454, 0.48, p);
  const cell = smooth(0.512, 0.556, p);
  const departure = 1 - smooth(0.776, 0.798, p);
  const anatomyAlpha = arrival * (1 - smooth(0.409, 0.435, p));
  const sectionAlpha = smooth(0.412, 0.432, p) * (1 - smooth(0.46, 0.481, p));
  const mucosaAlpha = smooth(0.458, 0.479, p) * (1 - smooth(0.533, 0.555, p));
  const heroAlpha = smooth(0.477, 0.49, p) * departure;
  const phase =
    p < 0.418
      ? "digestive-system"
      : p < 0.47
        ? "colon-section"
        : p < 0.54
          ? "colonic-mucosa"
          : p < 0.625
            ? "engineered-ecn"
            : p < 0.71
              ? "elafin"
              : "withdrawal";
  const label =
    p < 0.418
      ? "DIGESTIVE SYSTEM"
      : p < 0.47
        ? "COLON SECTION"
        : p < 0.54
          ? "COLONIC MUCOSA"
          : p < 0.625
            ? "ENGINEERED EcN"
            : p < 0.71
              ? "ELAFIN"
              : "SIGNAL → PROTECTION → EXIT";
  return (
    <div
      className="science-atlas"
      data-science-phase={phase}
      style={
        { opacity: departure, "--inspection": inspection } as CSSProperties
      }
    >
      <svg
        viewBox="0 0 820 670"
        className="science-atlas-art"
        role="img"
        aria-labelledby={`${id}-title ${id}-desc`}
      >
        <title id={`${id}-title`}>{label}</title>
        <desc id={`${id}-desc`}>
          An original layered anatomical schematic: the stomach and coiled small
          intestine sit inside the colon, a highlighted colon segment becomes a
          tissue section with recessed crypts, and one rod-shaped EcN is
          enlarged to reveal the cell envelope and the proposed therapeutic
          mechanism. Molecular shapes and timing are illustrative, not measured
          results.
        </desc>
        <defs>
          <filter
            id={`${id}-shadow`}
            x="-30%"
            y="-35%"
            width="170%"
            height="185%"
          >
            <feDropShadow
              dx="0"
              dy="13"
              stdDeviation="12"
              floodColor="#748a79"
              floodOpacity=".13"
            />
          </filter>
          <linearGradient id={`${id}-body`} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#f4efe0" />
            <stop offset="1" stopColor="#e5eadb" />
          </linearGradient>
          <linearGradient id={`${id}-stomach`} x1="0" y1="0" x2=".7" y2="1">
            <stop stopColor="#f2d4b7" />
            <stop offset=".5" stopColor="#deb196" />
            <stop offset="1" stopColor="#c58e78" />
          </linearGradient>
          <linearGradient id={`${id}-intestine`} x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#edc8a9" />
            <stop offset=".6" stopColor="#dfb394" />
            <stop offset="1" stopColor="#c99c83" />
          </linearGradient>
          <linearGradient id={`${id}-colon`} x1="0" y1="0" x2="1" y2=".8">
            <stop stopColor="#d8e2be" />
            <stop offset=".4" stopColor="#a8c4ab" />
            <stop offset="1" stopColor="#729e90" />
          </linearGradient>
          <radialGradient id={`${id}-lumen`} cx=".6" cy=".25">
            <stop stopColor="#9fae98" />
            <stop offset=".7" stopColor="#688a7d" />
            <stop offset="1" stopColor="#507b70" />
          </radialGradient>
          <linearGradient id={`${id}-tissue`} x2="0" y2="1">
            <stop stopColor="#efdabf" />
            <stop offset="1" stopColor="#e4c4a7" />
          </linearGradient>
          <linearGradient id={`${id}-cell`} x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#cfddb0" />
            <stop offset=".45" stopColor="#9fbc94" />
            <stop offset="1" stopColor="#75a48a" />
          </linearGradient>
          <linearGradient id={`${id}-cytosol`} x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#f5ecd0" />
            <stop offset="1" stopColor="#d9dec0" />
          </linearGradient>
        </defs>
        <ellipse
          cx="420"
          cy="590"
          rx="235"
          ry="21"
          fill="#9aa68b"
          opacity={0.08 * (1 - cell)}
        />
        <g
          opacity={anatomyAlpha}
          transform={`translate(${mix(0, -365, segment)} ${mix(0, -340, segment)}) scale(${1 + segment * 0.9})`}
        >
          <DigestiveSystem
            id={id}
            selected={smooth(0.36, 0.388, p)}
            inspect={inspection}
          />
        </g>
        <g
          opacity={sectionAlpha}
          transform={`translate(${mix(67, -70, mucosa)} ${mix(24, -85, mucosa)}) scale(${0.9 + mucosa * 0.38})`}
        >
          <ColonSection id={id} inspect={inspection} />
        </g>
        <g
          transform={`translate(${cell * -70} ${cell * 95}) scale(${1 + cell * 0.14})`}
        >
          <Mucosa
            id={id}
            inspect={inspection}
            opacity={mucosaAlpha}
            cellFocus={cell}
          />
        </g>
        <g
          opacity={heroAlpha}
          transform={`translate(${mix(421, 411, cell)} ${mix(210, 328, cell)}) rotate(${mix(-17, -12, cell)}) scale(${mix(0.105, 1.02, cell)})`}
        >
          <Bacterium id={id} p={p} inspect={inspection * cell} />
        </g>
        {p > 0.71 && (
          <g opacity={smooth(0.71, 0.731, p)}>
            {Array.from({ length: 6 }, (_, i) => (
              <g
                key={i}
                opacity={
                  (1 - smooth(0.749 + i * 0.003, 0.774 + i * 0.003, p)) *
                  departure
                }
                transform={`translate(${225 + i * 66} ${539 + (i % 2) * 15}) rotate(${-22 + i * 8})`}
              >
                <rect
                  x="-21"
                  y="-8"
                  width="42"
                  height="16"
                  rx="8"
                  fill="#9bb596"
                  stroke="#7c9f8a"
                  strokeWidth="1.5"
                />
                <path
                  d="M-11-4H10"
                  stroke="#e2e9c6"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </g>
            ))}
          </g>
        )}
      </svg>
      <div className="science-atlas-key">
        <span>{label}</span>
        <i />{" "}
        <span>{p < 0.535 ? "ANATOMICAL SCHEMATIC" : "DESIGN HYPOTHESIS"}</span>
        {p < 0.535 && (
          <a
            href={
              p < 0.43
                ? "https://www.niddk.nih.gov/health-information/digestive-diseases/digestive-system-how-it-works"
                : "https://openstax.org/books/anatomy-and-physiology/pages/23-5-the-small-and-large-intestines"
            }
            target="_blank"
            rel="noreferrer"
            aria-label={
              p < 0.43
                ? "Digestive anatomy reference: NIDDK"
                : "Colon anatomy reference: OpenStax"
            }
          >
            SOURCE ↗
          </a>
        )}
      </div>
    </div>
  );
}
