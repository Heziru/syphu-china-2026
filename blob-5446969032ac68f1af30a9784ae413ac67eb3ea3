import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { Portrait } from "./Portrait";
import { type TeamPerson, groupName, personLabel } from "./teamData";
import { useReducedMotion } from "../home/hooks/useReducedMotion";

export function TeamProfile({
  person,
  origin,
  onClose,
  onStep,
}: {
  person: TeamPerson;
  origin: DOMRect | null;
  onClose: () => void;
  onStep: (direction: number) => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const portrait = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  useLayoutEffect(() => {
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
  useLayoutEffect(() => {
    const node = dialog.current!;
    node.scrollTop = 0;
    const photo = portrait.current!;
    const target = photo.getBoundingClientRect();
    const ctx = gsap.context(() => {
      if (!reduced && origin)
        gsap.fromTo(
          photo,
          {
            x: origin.x - target.x,
            y: origin.y - target.y,
            scaleX: origin.width / target.width,
            scaleY: origin.height / target.height,
            transformOrigin: "top left",
          },
          {
            x: 0,
            y: 0,
            scaleX: 1,
            scaleY: 1,
            duration: 0.7,
            ease: "power3.inOut",
          },
        );
      if (!reduced)
        gsap.fromTo(
          node.querySelector(".team-profile-copy"),
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.5, delay: origin ? 0.18 : 0 },
        );
    }, node);
    return () => ctx.revert();
  }, [person.id, origin, reduced]);
  return (
    <dialog
      className="team-profile"
      ref={dialog}
      onCancel={onClose}
      aria-labelledby="team-profile-name"
    >
      <div className="team-profile-top">
        <span>SYPHU-CHINA / {person.number}</span>
        <button onClick={onClose} autoFocus aria-label="Close profile">
          BACK TO TEAM ↙ <span>×</span>
        </button>
      </div>
      <div className="team-profile-layout">
        <div className="team-profile-visual" ref={portrait}>
          <Portrait person={person} large eager />
          <span className="team-profile-photo-label">
            {person.name || "PRINCIPAL INVESTIGATOR"}
            <span>{person.number}</span>
          </span>
        </div>
        <div className="team-profile-copy">
          <p className="team-eyebrow">{person.role}</p>
          <h2 id="team-profile-name" aria-live="polite">
            {personLabel(person)}
          </h2>
          {person.credential && (
            <p className="team-profile-credential">{person.credential}</p>
          )}
          <p className="team-profile-groups">
            {person.groups.map(groupName).join(" / ")}
          </p>
          {person.motto && <blockquote>“{person.motto}”</blockquote>}
          {person.bio && <p className="team-profile-bio">{person.bio}</p>}
          {person.previousRole && (
            <div className="team-profile-history">
              <small>PREVIOUS CHAPTER · {person.previousYear}</small>
              <span>{person.previousRole} · SYPHU-China</span>
            </div>
          )}
          {person.researchAreas && (
            <div className="team-profile-research">
              {person.researchAreas.map((area) => (
                <span key={area}>{area}</span>
              ))}
            </div>
          )}
          {person.milestones && (
            <div className="team-profile-milestones">
              {person.milestones.map((item) => (
                <div key={item.year}>
                  <strong>{item.year}</strong>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>
          )}
          {person.contribution && (
            <section>
              <h3>WHAT I BRING</h3>
              <p>{person.contribution}</p>
            </section>
          )}
          {(person.major || person.school || person.cohort) && (
            <div className="team-profile-study">
              <span>{person.major}</span>
              <span>{person.school}</span>
              {person.cohort && <span>Entry year {person.cohort}</span>}
            </div>
          )}
          {person.interests && (
            <section>
              <h3>OFF THE CLOCK</h3>
              <p>{person.interests}</p>
            </section>
          )}
          {person.funFact && (
            <section>
              <h3>A LITTLE MORE</h3>
              <p>{person.funFact}</p>
            </section>
          )}
          {!person.bio && !person.contribution && !person.major && (
            <p className="team-profile-empty">More to come.</p>
          )}
          {person.sourceLinks && (
            <div className="team-profile-sources">
              {person.sourceLinks.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.label} ↗
                </a>
              ))}
            </div>
          )}
          {person.imageCredit && (
            <p className="team-profile-credit">{person.imageCredit}</p>
          )}
        </div>
      </div>
      {person.kind === "student" && (
        <nav className="team-profile-navigation" aria-label="Member profiles">
          <button onClick={() => onStep(-1)} aria-label="Previous member">
            ←
          </button>
          <span>{person.number} / 25</span>
          <button onClick={() => onStep(1)} aria-label="Next member">
            →
          </button>
        </nav>
      )}
    </dialog>
  );
}
