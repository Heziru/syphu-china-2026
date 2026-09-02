import { Link } from "react-router-dom";
import { CHAPTER_LIST } from "../data/chapters";

type Props = {
  message?: string;
};

export function LaboratoryFallback({ message }: Props) {
  return (
    <div className="lab-fallback">
      <div className="lab-fallback__poster" aria-hidden="true">
        <span className="lab-fallback__window" />
        <span className="lab-fallback__bench" />
        <span className="lab-fallback__dot lab-fallback__dot--a" />
        <span className="lab-fallback__dot lab-fallback__dot--b" />
        <span className="lab-fallback__dot lab-fallback__dot--c" />
      </div>
      <div className="lab-fallback__copy">
        <p>{message ?? "3D laboratory is unavailable. Use the chapter list below."}</p>
        <ul>
          {CHAPTER_LIST.map((chapter) => (
            <li key={chapter.id}>
              <Link to={chapter.path}>
                {chapter.nameZh} · {chapter.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
