import { useEffect, useRef, useState } from "react";
import {
  groups,
  members,
  teamAsset,
  type TeamPerson,
  type GroupId,
} from "./teamData";

export interface PhotoSelection {
  src: string;
  title: string;
}
export function GroupPortraits({
  onSelect,
  onPhoto,
}: {
  onSelect: (p: TeamPerson, el: HTMLElement) => void;
  onPhoto: (photo: PhotoSelection) => void;
}) {
  const [active, setActive] = useState<GroupId>("wet");
  const group = groups.find((g) => g.id === active)!;
  const people = members
    .filter((p) => p.groups.includes(active))
    .sort(
      (a, b) =>
        Number(b.role.includes("Lead")) - Number(a.role.includes("Lead")),
    );
  return (
    <div className="team-group-view">
      <div
        className="team-group-tabs"
        role="group"
        aria-label="Choose a working group"
      >
        {groups.map((g) => (
          <button
            key={g.id}
            onClick={() => setActive(g.id)}
            aria-pressed={active === g.id}
          >
            {g.name}
            <sup>
              {members
                .filter((p) => p.groups.includes(g.id))
                .length.toString()
                .padStart(2, "0")}
            </sup>
          </button>
        ))}
      </div>
      <div className="team-group-layout" key={active}>
        {group.photo ? (
          <button
            className="team-group-photo"
            onClick={() => onPhoto({ src: group.photo, title: group.name })}
            aria-label={`Enlarge ${group.name} group photo`}
          >
            <img
              src={teamAsset(group.photo)}
              alt={`${group.name} group at Shenyang Pharmaceutical University`}
              loading="lazy"
            />
            <span>VIEW PHOTO ↗</span>
          </button>
        ) : (
          <div className="team-wiki-portrait">
            <span>
              FROM
              <br />
              IDEAS
              <br />
              TO PIXELS.
            </span>
            <span aria-hidden="true">↗</span>
          </div>
        )}
        <div className="team-group-copy">
          <p className="team-eyebrow">
            {people.length.toString().padStart(2, "0")} PEOPLE / {group.name}
          </p>
          <h3>{group.line}</h3>
          <div>
            {people.map((p) => (
              <button
                className="team-group-person"
                key={p.id}
                onClick={(e) => onSelect(p, e.currentTarget)}
              >
                <span>
                  {p.name}
                  <small>{p.role === "Team Member" ? "" : p.role}</small>
                </span>
                <span>↗</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const moments = [
  { src: "team-2.webp", title: "Together, at SYPHU.", tag: "THE TEAM" },
  { src: "team-1.webp", title: "Where our story begins.", tag: "ON CAMPUS" },
  { src: "wet.webp", title: "The experiment starts with us.", tag: "WET LAB" },
  { src: "art.webp", title: "A shared eye for ideas.", tag: "ART & DESIGN" },
  {
    src: "dry-lab.webp",
    title: "Different perspectives. One question.",
    tag: "DRY LAB",
  },
  {
    src: "hp.webp",
    title: "Science is a conversation.",
    tag: "HUMAN PRACTICES",
  },
];
export function TeamMoments({
  onPhoto,
}: {
  onPhoto: (photo: PhotoSelection) => void;
}) {
  return (
    <div className="team-moments">
      {moments.map((p, i) => (
        <button key={p.src} onClick={() => onPhoto(p)}>
          <span className="team-moment-label">
            {p.tag}
            <span>{String(i + 1).padStart(2, "0")} ↗</span>
          </span>
          <img src={teamAsset(p.src)} alt={p.title} loading="lazy" />
          <span className="team-moment-caption">{p.title}</span>
        </button>
      ))}
    </div>
  );
}

export function PhotoViewer({
  photo,
  onClose,
}: {
  photo: PhotoSelection;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const node = dialog.current!;
    const previous = document.activeElement as HTMLElement | null;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    node.showModal();
    return () => {
      node.close();
      document.body.style.overflow = oldOverflow;
      previous?.focus({ preventScroll: true });
    };
  }, []);
  return (
    <dialog
      className="team-photo-viewer"
      ref={dialog}
      onCancel={onClose}
      aria-label={photo.title}
    >
      <div>
        <span>{photo.title}</span>
        <button autoFocus onClick={onClose} aria-label="Close photograph">
          CLOSE ×
        </button>
      </div>
      <img src={teamAsset(photo.src)} alt={photo.title} />
    </dialog>
  );
}
