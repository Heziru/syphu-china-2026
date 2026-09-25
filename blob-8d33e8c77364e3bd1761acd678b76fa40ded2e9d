import { useState } from "react";
import { Link } from "react-router-dom";
import { CHAPTER_LIST } from "../data/chapters";

export function ChapterDirectory() {
  const [open, setOpen] = useState(false);

  return (
    <nav
      className={`lab-directory${open ? " is-open" : ""}`}
      aria-label="Wiki chapters"
    >
      <button
        type="button"
        className="lab-directory__toggle"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span>Chapters</span>
      </button>
      {open ? (
        <ul>
          {CHAPTER_LIST.map((chapter) => (
            <li key={chapter.id}>
              <Link to={chapter.path} className="lab-directory__link">
                <span>{chapter.nameZh}</span>
                <small>{chapter.name}</small>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </nav>
  );
}
