import { SectionDecor } from "./SectionDecor";

interface HeaderProps {
  title: string;
  lead: string;
}

export function Header({ title, lead }: HeaderProps) {
  return (
    <header className="wiki-page-header">
      <SectionDecor variant="research" subdued className="wiki-page-header__decor" />
      <div className="container h-100">
        <div className="row h-100 align-items-center">
          <div className="col-lg-12">
            <h1>{title}</h1>
            {lead && <p>{lead}</p>}
          </div>
        </div>
      </div>
    </header>
  );
}
