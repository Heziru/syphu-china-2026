import { Link } from "react-router-dom";
import { CHAPTER_LIST } from "../data/chapters";

type Props = {
  message?: string;
};

export function LaboratoryFallback({ message }: Props) {
  return (
    <div className="lab-fallback">
      <img
        className="lab-fallback__image"
        src={`${import.meta.env.BASE_URL}assets/laboratory/simple-lab-reference.png`}
        alt="Illustrated overview of the SYPHU-China laboratory"
      />
      <div className="lab-fallback__shade" aria-hidden="true" />
      <div className="lab-fallback__copy">
        <span className="lab-fallback__eyebrow">
          SYPHU-CHINA · LABORATORY ATLAS
        </span>
        <h2>Explore the lab</h2>
        <p>
          {message ??
            "A lightweight map of our laboratory and its research areas."}
        </p>
        <ul>
          {CHAPTER_LIST.map((chapter) => (
            <li key={chapter.id}>
              <Link to={chapter.path}>
                <span>{chapter.name}</span>
                <small>{chapter.nameZh}</small>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
