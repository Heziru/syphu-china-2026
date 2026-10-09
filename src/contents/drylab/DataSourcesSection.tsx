import { assetUrl } from "../../utils/assetUrl";
import { DataTable } from "./ResearchPrimitives";
import catalogue from "../../../public/assets/dry-lab/literature-2026/data-sources.json";

export default function DataSourcesSection() {
  return (
    <section id="data-sources">
      <h2>Data sources and current literature</h2>
      <p>
        Data are selected for the question they can answer. The coordinate records
        below enter our calculations; the cohort resources are candidates for
        independent biological context. None supplies a measured release rate,
        adhesion rate or therapeutic concentration for our construct.
      </p>
      <DataTable caption="External inputs and resources reviewed on 9 October 2026."
        headers={["Source", "Role in this project", "Status and limits"]}
        rows={catalogue.sources.map(source => [
          <><a href={source.url} target="_blank" rel="noreferrer">{source.name}</a><br />{source.type}</>,
          <>{source.use}{source.local && <><br /><a href={assetUrl(source.local)} download>Local input</a></>}</>,
          <><strong>{source.status}.</strong> {source.boundary}</>,
        ])} />
      <h3>What recent work changes about the interpretation</h3>
      <p>
        Muto and colleagues report PI3 among transcripts in a colonic metaplastic
        epithelial compartment. For our project, this argues for separating
        cell composition from expression when interpreting bulk tissue data.
        It does not establish that every inflamed colon lacks Elafin.{" "}
        <a href={catalogue.recentPapers[0].url} target="_blank" rel="noreferrer">Muto et al., 2026</a>.
      </p>
      <p>
        Stojkovic and colleagues connect metatranscriptomic analysis to protein
        function and epithelial-barrier measurements. That evidence chain is
        relevant to our validation strategy; their BMG-1 results cannot be
        treated as results for Elafin or engineered EcN.{" "}
        <a href={catalogue.recentPapers[1].url} target="_blank" rel="noreferrer">Stojkovic et al., 2026</a>.
      </p>
      <p>
        A useful next comparison would keep colon and ileum separate, account
        for disease activity and treatment, and reserve an independent cohort
        for validation. Single-cell analyses should aggregate at donor level.
        We have not run those cohort analyses or used them to fit the current
        ecological model.
      </p>
      <ol className="research-source-references">
        {catalogue.recentPapers.map(paper => <li key={paper.doi}>
          {paper.authors} ({paper.year}). <a href={paper.url} target="_blank" rel="noreferrer">{paper.title}</a>. <em>{paper.journal}</em>.
        </li>)}
      </ol>
      <p><a href={assetUrl("assets/dry-lab/literature-2026/data-sources.json")} download>Download the source catalogue and accessions</a></p>
    </section>
  );
}
