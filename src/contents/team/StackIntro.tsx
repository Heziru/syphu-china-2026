import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "../home/hooks/useReducedMotion";
import { galleryOrder } from "./teamData";
import { PersonCard } from "./Portrait";

gsap.registerPlugin(ScrollTrigger);

// Four passes reverse their travel at the three intermediate poses.
const poses = [
  {
    at: 0,
    x: -0.42,
    y: 0.1,
    spread: 1.8,
    slope: 0.95,
    bend: 0.1,
    phase: 0,
    roll: -24,
    fan: 90,
    rx: -17,
    ry: -42,
    depth: 220,
  },
  {
    at: 0.22,
    x: 0.42,
    y: -0.025,
    spread: 2.2,
    slope: -0.85,
    bend: 0.16,
    phase: 1.4,
    roll: 76,
    fan: -115,
    rx: 28,
    ry: 18,
    depth: 330,
  },
  {
    at: 0.45,
    x: -0.4,
    y: 0.02,
    spread: 1.9,
    slope: 0.75,
    bend: 0.13,
    phase: 3.3,
    roll: -64,
    fan: 120,
    rx: -27,
    ry: -38,
    depth: 180,
  },
  {
    at: 0.68,
    x: 0.4,
    y: -0.06,
    spread: 1.9,
    slope: -0.7,
    bend: 0.1,
    phase: 5,
    roll: 60,
    fan: -95,
    rx: 24,
    ry: 24,
    depth: 340,
  },
  {
    at: 0.91,
    x: -0.03,
    y: 0.1,
    spread: 1.45,
    slope: 0.1,
    bend: 0.02,
    phase: 6.3,
    roll: -6,
    fan: 28,
    rx: 0,
    ry: 0,
    depth: 70,
  },
] as const;
const stories = [
  {
    number: "01",
    label: "CURIOSITY",
    first: "DIFFERENT MINDS.",
    second: "ONE DIRECTION.",
    line: "25 people. A world of perspectives.",
    from: 0,
    until: 0.225,
  },
  {
    number: "02",
    label: "CONNECTION",
    first: "SHARED",
    second: "QUESTIONS.",
    line: "Across disciplines. Around one table.",
    from: 0.255,
    until: 0.465,
  },
  {
    number: "03",
    label: "COLLABORATION",
    first: "IDEAS",
    second: "TAKE SHAPE.",
    line: "We build. We test. We learn together.",
    from: 0.495,
    until: 0.805,
  },
] as const;
const clamp = (value: number) => Math.min(1, Math.max(0, value));
const smooth = (value: number) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};

export function StackIntro() {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  useLayoutEffect(() => {
    if (!root.current || reduced) return;
    const section = root.current;
    const stage = section.querySelector<HTMLElement>(".team-intro-stage")!;
    const cards = Array.from(
      section.querySelectorAll<HTMLElement>(".team-stack-card"),
    );
    const copies = Array.from(
      section.querySelectorAll<HTMLElement>(".team-intro-copy"),
    );
    const indicators = Array.from(
      section.querySelectorAll<HTMLElement>(".team-intro-chapter"),
    );
    const last = section.querySelector<HTMLElement>(".team-intro-last")!;
    const top = section.querySelector<HTMLElement>(".team-intro-top")!;
    const progress = section.querySelector<HTMLElement>(
      ".team-intro-progress-fill",
    )!;
    const normalized = cards.map(
      (_, index) => index / (cards.length - 1) - 0.5,
    );
    let width = stage.clientWidth,
      height = stage.clientHeight;
    function render(p: number) {
      const next = poses.findIndex((pose) => p < pose.at);
      const leg = next === -1 ? poses.length - 2 : Math.max(0, next - 1);
      const a = poses[leg];
      const b = poses[leg + 1];
      const t = smooth((p - a.at) / (b.at - a.at));
      const value = (key: Exclude<keyof typeof a, "at">) =>
        a[key] + (b[key] - a[key]) * t;
      const centerX = value("x") * width;
      const centerY = value("y") * height;
      const span = value("spread") * Math.max(width, 600);
      const slope = value("slope") * height;
      const bend = value("bend") * height;
      const phase = value("phase");
      const roll = value("roll");
      const fan = value("fan");
      const rx = value("rx");
      const ry = value("ry");
      const depth = value("depth");
      cards.forEach((card, i) => {
        const n = normalized[i];
        const wave = n * Math.PI * 2 + phase;
        const x = centerX + n * span + Math.sin(wave) * width * 0.055;
        const y = centerY + n * slope + Math.cos(wave) * bend;
        const z = Math.cos(n * Math.PI) * depth - 210 + Math.sin(wave) * 65;
        card.style.transform = `translate(-50%, -50%) translate3d(${x}px, ${y}px, ${z}px) rotateX(${rx + n * 12}deg) rotateY(${ry + n * 28}deg) rotateZ(${roll + n * fan}deg)`;
      });
      copies.forEach((copy, i) => {
        const story = stories[i];
        const arrive = i === 0 ? 1 : smooth((p - story.from) / 0.045);
        const leave = smooth((p - (story.until - 0.045)) / 0.045);
        const opacity = arrive * (1 - leave);
        copy.style.opacity = String(opacity);
        copy.style.visibility = opacity > 0.001 ? "visible" : "hidden";
        copy.style.transform = `translate3d(0, ${(1 - arrive) * 34 - leave * 26}px, 0)`;
        indicators[i].style.setProperty(
          "--chapter-progress",
          String(clamp((p - story.from) / (story.until - story.from))),
        );
        indicators[i].classList.toggle(
          "is-current",
          p >= story.from && p <= story.until,
        );
      });
      last.style.opacity = String(smooth((p - 0.87) / 0.085));
      last.style.transform = `translateY(${(1 - smooth((p - 0.87) / 0.085)) * 30}px)`;
      section.style.setProperty(
        "--stack-fade",
        String(smooth((p - 0.83) / 0.13)),
      );
      top.classList.toggle("is-on-paper", p > 0.91);
      progress.style.transform = `scaleX(${p})`;
    }
    render(0);
    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top 56px",
      end: "bottom bottom",
      onUpdate: (s) => render(s.progress),
      onRefresh: (s) => {
        width = stage.clientWidth;
        height = stage.clientHeight;
        render(s.progress);
      },
    });
    render(trigger.progress);
    return () => {
      trigger.kill();
      cards.forEach((card) => card.style.removeProperty("transform"));
      copies.forEach((copy) => {
        copy.style.removeProperty("opacity");
        copy.style.removeProperty("visibility");
        copy.style.removeProperty("transform");
      });
      indicators.forEach((indicator) => {
        indicator.style.removeProperty("--chapter-progress");
        indicator.classList.remove("is-current");
      });
      last.style.removeProperty("opacity");
      last.style.removeProperty("transform");
      top.classList.remove("is-on-paper");
      progress.style.removeProperty("transform");
      section.style.removeProperty("--stack-fade");
    };
  }, [reduced]);
  return (
    <section
      className={`team-intro ${reduced ? "team-intro-reduced" : ""}`}
      ref={root}
      aria-label="Meet SYPHU-China"
    >
      <div className="team-intro-stage">
        <div className="team-intro-atmosphere" aria-hidden="true" />
        <div className="team-intro-top">
          <span>SYPHU-CHINA / 2026</span>
          <a href="#team-explore">Meet the people ↗</a>
        </div>
        {stories.map((story, index) => (
          <div
            className={`team-intro-copy team-intro-copy-${index + 1}`}
            key={story.number}
          >
            <span className="team-eyebrow">
              {story.number} / {story.label}
            </span>
            {index === 0 ? (
              <h1>
                {story.first}
                <br />
                {story.second}
              </h1>
            ) : (
              <h2>
                {story.first}
                <br />
                {story.second}
              </h2>
            )}
            <p>{story.line}</p>
          </div>
        ))}
        <div className="team-stack" aria-hidden="true">
          {galleryOrder.map((p) => (
            <div className="team-stack-card" key={p.id}>
              <PersonCard person={p} eager />
            </div>
          ))}
        </div>
        <div className="team-intro-last">
          <p>BEHIND EVERY IDEA.</p>
          <h2>
            THERE'S
            <br />A PERSON.
          </h2>
        </div>
        <div className="team-intro-bottom">
          <span>SCROLL TO UNFOLD ↓</span>
          <div className="team-intro-chapters" aria-hidden="true">
            {stories.map((story) => (
              <span className="team-intro-chapter" key={story.number}>
                <i />
                {story.number}
              </span>
            ))}
          </div>
          <span>25 STUDENTS · 3 ADVISORS · 1 PI</span>
        </div>
        <div className="team-intro-progress" aria-hidden="true">
          <div className="team-intro-progress-fill" />
        </div>
      </div>
    </section>
  );
}
