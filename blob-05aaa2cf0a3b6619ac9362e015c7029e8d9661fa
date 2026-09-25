import { type CSSProperties } from "react";
import {
  type TeamPerson,
  groupName,
  groups,
  personLabel,
  teamAsset,
} from "./teamData";

export function Portrait({
  person,
  large = false,
  eager = false,
}: {
  person: TeamPerson;
  large?: boolean;
  eager?: boolean;
}) {
  const color =
    groups.find((g) => g.id === person.groups[0])?.color ?? "#c6c5b9";
  return (
    <div
      className={`team-portrait ${person.photo ? "" : "is-placeholder"} ${person.photoKind === "avatar" ? "is-avatar" : ""}`}
      style={{ "--portrait-accent": color } as CSSProperties}
    >
      {person.photo ? (
        <img
          src={teamAsset(`${person.photo}${large ? "" : "-small"}.webp`)}
          alt={
            person.photoKind === "avatar"
              ? `${personLabel(person)} — profile avatar`
              : personLabel(person)
          }
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          draggable={false}
          style={{ objectPosition: `${person.focal[0]}% ${person.focal[1]}%` }}
        />
      ) : (
        <>
          <span className="team-placeholder-orbit" aria-hidden="true" />
          <span className="team-placeholder-number" aria-hidden="true">
            {person.number}
          </span>
          <span className="team-photo-pending">Portrait to come</span>
        </>
      )}
    </div>
  );
}

export function PersonCard({
  person,
  eager = false,
}: {
  person: TeamPerson;
  eager?: boolean;
}) {
  return (
    <>
      <Portrait person={person} eager={eager} />
      <span className="team-card-caption">
        <span>
          <strong>{personLabel(person)}</strong>
          <small>
            {person.kind === "student"
              ? person.groups.map(groupName).join(" / ")
              : person.role}
          </small>
        </span>
        <span className="team-card-number">{person.number}</span>
      </span>
    </>
  );
}
