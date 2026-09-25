import { Link } from "react-router-dom";

type Props = {
  message?: string;
};

export function LaboratoryFallback({ message }: Props) {
  return (
    <div className="lab-unavailable" role="status">
      <h1>Explore the research.</h1>
      <p>{message}</p>
      <nav aria-label="Research pages">
        <Link to="/description">Design ↗</Link>
        <Link to="/experiments">Experiments ↗</Link>
        <Link to="/model">Model ↗</Link>
        <Link to="/results">Results ↗</Link>
        <Link to="/safety-and-security">Safety ↗</Link>
      </nav>
    </div>
  );
}
