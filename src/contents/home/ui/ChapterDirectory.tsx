import { Link } from "react-router-dom";
import { CHAPTER_LIST } from "../data/chapters";

export function ChapterDirectory() {
  return (
    <nav className="lab-directory" aria-label="Wiki chapters">
      <p className="lab-directory__title">Chapters</p>
      <ul>
        {CHAPTER_LIST.map((chapter) => {
          return (
            <li key={chapter.id}>
              <Link to={chapter.path} className="lab-directory__link">
                <span>{chapter.nameZh}</span>
                <small>{chapter.name}</small>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
