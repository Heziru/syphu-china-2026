import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import {
  advisors,
  principalInvestigator as pi,
  groupName,
  type TeamPerson,
} from "./teamData";
import { Portrait } from "./Portrait";
import { useReducedMotion } from "../home/hooks/useReducedMotion";

const topics = [
  {
    name: "Metabolic engineering",
    line: "Reimagine what a cell can make.",
    detail:
      "Engineering microbial metabolism for the production of pharmaceutical compounds.",
    mark: "01",
  },
  {
    name: "Biosynthetic pathways",
    line: "Follow the chemistry of life.",
    detail:
      "Investigating the pathways and mechanisms by which microorganisms make medicines.",
    mark: "02",
  },
  {
    name: "Living biotherapeutics",
    line: "Explore the possibilities of living systems.",
    detail:
      "Applying synthetic biology to the research of living biotherapeutic products.",
    mark: "03",
  },
];
const papers = [
  {
    year: "2025",
    journal: "Microbial Cell Factories",
    title: "Engineering gentamicin biosynthesis",
    full: "Improving activity of GenB3 and GenB4 in gentamicin dideoxygenation biosynthesis by semi-rational engineering",
    doi: "10.1186/s12934-025-02678-0",
  },
  {
    year: "2025",
    journal: "Frontiers in Pharmacology",
    title: "Expanding molecular possibilities",
    full: "Combinatorial biosynthesis of novel gentamicin derivatives with nonsense mutation readthrough activity and low cytotoxicity",
    doi: "10.3389/fphar.2025.1575840",
  },
  {
    year: "2024",
    journal: "Journal of Controlled Release",
    title: "Responsive drug delivery",
    full: "An adaptive drug-releasing contact lens for personalized treatment of ocular infections and injuries",
    doi: "10.1016/j.jconrel.2024.03.040",
  },
];
const tabs = ["Research", "Journey", "Selected work"] as const;

function ResearchMark({ topic }: { topic: number }) {
  return (
    <svg
      className={`mentor-research-mark topic-${topic}`}
      viewBox="0 0 240 170"
      fill="none"
      aria-hidden="true"
    >
      <path
        className="mentor-orbit orbit-one"
        d="M30 115C-5 15 185-3 210 57S83 194 30 115Z"
      />
      <path
        className="mentor-orbit orbit-two"
        d="M60 13C140-18 246 85 184 138S-18 42 60 13Z"
      />
      <path className="mentor-path" d="M32 110Q70 32 115 80T209 50" />
      <circle className="mentor-node node-one" cx="32" cy="110" r="9" />
      <circle className="mentor-node node-two" cx="115" cy="80" r="19" />
      <circle className="mentor-node node-three" cx="209" cy="50" r="9" />
      <circle className="mentor-node-ring" cx="115" cy="80" r="32" />
    </svg>
  );
}

export function MentorSection({
  onSelect,
}: {
  onSelect: (person: TeamPerson, element: HTMLElement) => void;
}) {
  const [tab, setTab] = useState(0);
  const [topic, setTopic] = useState(0);
  const section = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const root = section.current;
    if (!root || reduced) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).dataset.mentorVisible = "true";
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    root
      .querySelectorAll("[data-mentor-reveal]")
      .forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [reduced]);
  function tabKeys(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft")
      next = (index + tabs.length - 1) % tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    else return;
    event.preventDefault();
    setTab(next);
    section.current
      ?.querySelector<HTMLButtonElement>(`#mentor-tab-${next}`)
      ?.focus();
  }
  return (
    <section
      className="team-mentors"
      id="team-guidance"
      aria-labelledby="team-guidance-title"
      ref={section}
    >
      <header className="mentor-heading" data-mentor-reveal>
        <div>
          <p className="team-eyebrow">GUIDANCE, AT EVERY STEP.</p>
          <h2 id="team-guidance-title">
            ROOTED IN
            <br />
            CURIOSITY.
          </h2>
        </div>
        <p>
          Ideas grow through people.
          <br />
          And through what we pass on.
        </p>
      </header>

      <article
        className="mentor-pi"
        data-mentor-reveal
        aria-labelledby="mentor-pi-name"
      >
        <button
          className="mentor-pi-photo"
          aria-label="Meet Professor Xianpu Ni"
          onClick={(e) => onSelect(pi, e.currentTarget)}
        >
          <Portrait person={pi} large />
          <span className="mentor-pi-badge">PRINCIPAL INVESTIGATOR</span>
          <span className="mentor-photo-caption">
            MEET OUR PI <span>↗</span>
          </span>
        </button>
        <div className="mentor-pi-main">
          <div className="mentor-pi-intro">
            <p className="team-eyebrow">{pi.credential}</p>
            <h3 id="mentor-pi-name">
              XIANPU NI<span>, PhD</span>
            </h3>
            <p>
              School of Life Sciences and Biopharmaceutics
              <br />
              Shenyang Pharmaceutical University
            </p>
          </div>
          <div
            className="mentor-tabs"
            role="tablist"
            aria-label="Explore Professor Ni's work"
          >
            {tabs.map((name, index) => (
              <button
                key={name}
                role="tab"
                id={`mentor-tab-${index}`}
                aria-selected={tab === index}
                aria-controls="mentor-panel"
                tabIndex={tab === index ? 0 : -1}
                onClick={() => setTab(index)}
                onKeyDown={(e) => tabKeys(e, index)}
              >
                {name}
              </button>
            ))}
          </div>
          <div
            className="mentor-panel"
            id="mentor-panel"
            role="tabpanel"
            aria-labelledby={`mentor-tab-${tab}`}
            tabIndex={0}
          >
            <div className="mentor-panel-content" key={tab}>
              {tab === 0 ? (
                <>
                  <div
                    className="mentor-topic-controls"
                    role="group"
                    aria-label="Research directions"
                  >
                    {topics.map((item, index) => (
                      <button
                        key={item.name}
                        aria-pressed={topic === index}
                        onClick={() => setTopic(index)}
                      >
                        <span>{item.mark}</span>
                        {item.name}
                        <span className="mentor-topic-arrow">↗</span>
                      </button>
                    ))}
                  </div>
                  <div className="mentor-research-focus">
                    <ResearchMark topic={topic} />
                    <div
                      className="mentor-topic-copy"
                      aria-live="polite"
                    >
                      <h4>{topics[topic].line}</h4>
                      <p>{topics[topic].detail}</p>
                    </div>
                  </div>
                </>
              ) : tab === 1 ? (
                <ol className="mentor-journey">
                  {pi.milestones?.map((item) => (
                    <li key={item.year}>
                      <span>{item.year}</span>
                      <div>
                        <h4>{item.title}</h4>
                        <p>{item.text}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="mentor-work">
                  <p className="mentor-work-caption">
                    A selection of co-authored research.
                  </p>
                  {papers.map((paper) => (
                    <a
                      key={paper.doi}
                      href={`https://doi.org/${paper.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${paper.full} — open DOI in a new tab`}
                    >
                      <span className="mentor-paper-year">{paper.year}</span>
                      <span>
                        <small>{paper.journal}</small>
                        <strong>{paper.title}</strong>
                        <span className="mentor-paper-full">{paper.full}</span>
                      </span>
                      <span className="mentor-doi">DOI ↗</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="mentor-pi-links">
            <a
              href="https://sls.syphu.edu.cn/info/1111/12513.htm"
              target="_blank"
              rel="noopener noreferrer"
            >
              UNIVERSITY PROFILE ↗
            </a>
            <a
              href="https://grs.syphu.edu.cn/info/1103/9443.htm"
              target="_blank"
              rel="noopener noreferrer"
            >
              RESEARCH PROFILE ↗
            </a>
          </div>
        </div>
      </article>

      <div className="mentor-passing" data-mentor-reveal>
        <div>
          <p className="team-eyebrow">EXPERIENCE, SHARED.</p>
          <h3>
            ONCE TEAMMATES.
            <br />
            NOW GUIDES.
          </h3>
        </div>
        <div className="mentor-years" aria-label="From 2025 to 2026">
          <span>2025</span>
          <svg viewBox="0 0 200 44" aria-hidden="true">
            <path d="M0 22H190m-17-15 17 15-17 15" />
          </svg>
          <strong>2026</strong>
        </div>
      </div>
      <div className="mentor-advisors">
        {advisors.map((person, index) => (
          <article
            key={person.id}
            data-mentor-reveal
            style={{ animationDelay: `${index * 90}ms` }}
          >
            <button
              className="mentor-advisor-photo"
              onClick={(e) => onSelect(person, e.currentTarget)}
              aria-label={`Meet ${person.name}, advisor`}
            >
              <Portrait person={person} large />
              <span className="mentor-advisor-number">{person.number}</span>
              <span className="mentor-advisor-open" aria-hidden="true">
                ↗
              </span>
            </button>
            <div className="mentor-advisor-copy">
              <p>{person.groups.map(groupName).join(" / ")} Advisor</p>
              <h4>{person.name}</h4>
              <span>
                {person.previousYear} · {person.previousRole}
              </span>
            </div>
          </article>
        ))}
      </div>
      <div className="mentor-credits">
        <p>
          Portraits and previous roles: SYPHU-China 2025. Haibo's image is the
          avatar used in the 2025 Wiki.
        </p>
        <a
          href="https://2025.igem.wiki/syphu-china/members"
          target="_blank"
          rel="noopener noreferrer"
        >
          MEET THE 2025 TEAM ↗
        </a>
      </div>
    </section>
  );
}
