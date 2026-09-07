import { useEffect, useMemo, useState } from "react";
import { StackIntro } from "./StackIntro";
import { InfinitePeople } from "./InfinitePeople";
import {
  GroupPortraits,
  PhotoViewer,
  TeamMoments,
  type PhotoSelection,
} from "./TeamPhotos";
import { TeamProfile } from "./TeamProfile";
import { MentorSection } from "./MentorSection";
import { Portrait } from "./Portrait";
import {
  members,
  galleryOrder,
  groups,
  groupName,
  teamAsset,
  type TeamPerson,
  type GroupId,
} from "./teamData";
import "./team.css";
import "./mentors.css";

type View = "people" | "groups" | "moments";
export function TeamPage() {
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id !== "team-explore" && id !== "team-guidance") return;
    const frame = requestAnimationFrame(() =>
      document.getElementById(id)?.scrollIntoView(),
    );
    return () => cancelAnimationFrame(frame);
  }, []);
  const [view, setView] = useState<View>("people");
  const [filter, setFilter] = useState<GroupId | "all">("all");
  const [index, setIndex] = useState(false);
  const [query, setQuery] = useState("");
  const [selection, setSelection] = useState<{
    person: TeamPerson;
    origin: DOMRect | null;
  } | null>(null);
  const [photo, setPhoto] = useState<PhotoSelection | null>(null);
  const people = useMemo(
    () =>
      galleryOrder.filter(
        (p) =>
          (filter === "all" || p.groups.includes(filter)) &&
          p.name.toLowerCase().includes(query.toLowerCase().trim()),
      ),
    [filter, query],
  );
  function select(person: TeamPerson, element: HTMLElement) {
    setSelection({
      person,
      origin:
        element.querySelector(".team-portrait")?.getBoundingClientRect() ??
        null,
    });
  }
  function step(direction: number) {
    if (selection)
      setSelection({
        person:
          members[
            (members.findIndex((p) => p.id === selection.person.id) +
              direction +
              members.length) %
              members.length
          ],
        origin: null,
      });
  }
  return (
    <main className="team-page">
      <StackIntro />
      <section className="team-together" aria-labelledby="team-together-title">
        <div>
          <p className="team-eyebrow">SAME QUESTION. DIFFERENT PERSPECTIVES.</p>
          <h2 id="team-together-title">
            ALL
            <br />
            OF US.
          </h2>
          <p>
            A team brought together
            <br />
            by the possibilities of biology.
          </p>
          <span className="team-together-count">
            25 <small>STUDENTS</small>
          </span>
        </div>
        <button
          className="team-together-photo"
          onClick={() =>
            setPhoto({ src: "team-2.webp", title: "SYPHU-China 2026" })
          }
          aria-label="Enlarge the team photograph"
        >
          <img
            src={teamAsset("team-2.webp")}
            alt="SYPHU-China team gathered on the campus steps"
            loading="lazy"
          />
          <span>
            SHENYANG PHARMACEUTICAL UNIVERSITY <span>↗</span>
          </span>
        </button>
      </section>
      <section
        className="team-explore"
        id="team-explore"
        aria-labelledby="team-explore-title"
      >
        <div className="team-explore-heading">
          <div>
            <p className="team-eyebrow">THE PEOPLE BEHIND THE PROJECT</p>
            <h2 id="team-explore-title">
              FIND YOUR
              <br />
              PEOPLE.
            </h2>
          </div>
          <div
            className="team-view-switch"
            role="group"
            aria-label="Explore the team"
          >
            {(["people", "groups", "moments"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                aria-pressed={view === v}
              >
                {v.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        {view === "people" ? (
          <>
            <div className="team-people-toolbar">
              <div
                className="team-filters"
                role="group"
                aria-label="Filter people by group"
              >
                <button
                  onClick={() => setFilter("all")}
                  aria-pressed={filter === "all"}
                >
                  All 25
                </button>
                {groups.map((g) => (
                  <button
                    onClick={() => setFilter(g.id)}
                    aria-pressed={filter === g.id}
                    key={g.id}
                  >
                    {g.short}
                  </button>
                ))}
              </div>
              <button
                className="team-index-toggle"
                onClick={() => {
                  if (index) setQuery("");
                  setIndex((v) => !v);
                }}
                aria-pressed={index}
              >
                {index ? "GALLERY ↗" : "NAME INDEX +"}{" "}
              </button>
            </div>
            {index && (
              <label className="team-search">
                FIND A PERSON
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name"
                />
              </label>
            )}
            {!people.length ? (
              <p className="team-no-results">
                No matching names.{" "}
                <button
                  onClick={() => {
                    setFilter("all");
                    setQuery("");
                  }}
                >
                  Show everyone ↗
                </button>
              </p>
            ) : index ? (
              <div className="team-name-index">
                {[...people]
                  .sort((a, b) => Number(a.number) - Number(b.number))
                  .map((p) => (
                    <button
                      key={p.id}
                      onClick={(e) => select(p, e.currentTarget)}
                    >
                      <span>{p.number}</span>
                      <Portrait person={p} />
                      <strong>{p.name}</strong>
                      <small>{p.groups.map(groupName).join(" / ")}</small>
                      <span>↗</span>
                    </button>
                  ))}
              </div>
            ) : (
              <InfinitePeople people={people} onSelect={select} />
            )}
          </>
        ) : view === "groups" ? (
          <GroupPortraits onSelect={select} onPhoto={setPhoto} />
        ) : (
          <TeamMoments onPhoto={setPhoto} />
        )}
      </section>
      <MentorSection onSelect={select} />
      <div className="team-endnote">
        <span>SYPHU-CHINA · iGEM 2026</span>
        <a href="#team-explore">BACK TO THE PEOPLE ↑</a>
      </div>
      {selection && (
        <TeamProfile
          person={selection.person}
          origin={selection.origin}
          onClose={() => setSelection(null)}
          onStep={step}
        />
      )}
      {photo && <PhotoViewer photo={photo} onClose={() => setPhoto(null)} />}
    </main>
  );
}
