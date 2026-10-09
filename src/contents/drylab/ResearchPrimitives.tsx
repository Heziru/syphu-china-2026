import { useId, type ReactNode } from "react";
import katex from "katex";
import hljs from "highlight.js/lib/core";
import python from "highlight.js/lib/languages/python";
import bash from "highlight.js/lib/languages/bash";
import "katex/dist/katex.min.css";
import { researchAsset } from "./researchAssets";
import references from "../../../public/assets/dry-lab/research/references.json";
import figureDimensions from "../../../public/assets/dry-lab/research/figure-dimensions.json";

hljs.registerLanguage("python", python);
hljs.registerLanguage("bash", bash);

export function Cite({ id }: { id: string }) {
  const index = references.findIndex((reference) => reference.id === id);
  if (index < 0) throw new Error("Unknown research reference: " + id);
  return (
    <sup className="research-cite">
      <a href={"#ref-" + id} aria-label={"Reference " + (index + 1)}>
        [{index + 1}]
      </a>
    </sup>
  );
}
export function M({ children }: { children: string }) {
  return (
    <span
      dangerouslySetInnerHTML={{
        __html: katex.renderToString(children, {
          throwOnError: true,
          trust: false,
          output: "htmlAndMathml",
        }),
      }}
    />
  );
}
export function Equation({ n, children }: { n: number; children: string }) {
  return (
    <div className="research-equation" id={"eq-" + n}>
      <div
        className="research-math-scroll"
        tabIndex={0}
        aria-label={"Equation " + n}
        dangerouslySetInnerHTML={{
          __html: katex.renderToString(children, {
            displayMode: true,
            throwOnError: true,
            trust: false,
            output: "htmlAndMathml",
          }),
        }}
      />
      <a
        className="research-equation-number"
        href={"#eq-" + n}
        aria-label={"Link to equation " + n}
      >
        ({n})
      </a>
    </div>
  );
}
export function Figure({
  n,
  file,
  title,
  children,
  data,
  svg = true,
}: {
  n: number;
  file: string;
  title: string;
  children: ReactNode;
  data?: string;
  svg?: boolean;
}) {
  const dimensions = (figureDimensions as Record<string, number[]>)[file];
  return (
    <figure className="research-figure" id={"fig-" + n}>
      <a
        href={researchAsset(file + (svg ? ".svg" : ".png"))}
        target="_blank"
        rel="noreferrer"
        aria-label={"Open Figure " + n + " at full size"}
      >
        <img
          src={researchAsset(file + ".png")}
          width={dimensions?.[0]}
          height={dimensions?.[1]}
          alt={title}
          loading={n < 2 ? "eager" : "lazy"}
          decoding="async"
        />
      </a>
      <figcaption>
        <strong>
          Figure {n}. {title}
        </strong>{" "}
        {children}
      </figcaption>
      <div className="research-figure-files">
        <a href={researchAsset(file + (svg ? ".svg" : ".png"))} target="_blank" rel="noreferrer">Full size ↗</a>
        <a href={researchAsset(file + ".png")} download>
          PNG
        </a>
        {svg && (
          <>
            <a href={researchAsset(file + ".svg")} download>
              SVG
            </a>
            <a href={researchAsset(file + ".pdf")} download>
              PDF
            </a>
          </>
        )}
        {data && (
          <a href={researchAsset(data)} download>
            Source data
          </a>
        )}
      </div>
    </figure>
  );
}
export function DataTable({
  caption,
  headers,
  rows,
}: {
  caption: string;
  headers: string[];
  rows: ReactNode[][];
}) {
  const captionId = useId();
  return (
    <div className="research-table-block">
      <p className="research-table-caption" id={captionId}>{caption}</p>
    <div className="research-table-scroll" tabIndex={0} aria-label={caption}>
      <table aria-labelledby={captionId}>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header} scope="col">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
  );
}
export function CodeBlock({
  title,
  file,
  sourceUrl,
  language = "python",
  children,
}: {
  title: string;
  file?: string;
  sourceUrl?: string;
  language?: "python" | "bash";
  children: string;
}) {
  const downloadUrl = sourceUrl || (file ? researchAsset(file) : undefined);
  return (
    <div className="research-code">
      <div className="research-code-header">
        <span>{title}</span>
        {downloadUrl && <a href={downloadUrl} download>Source ↓</a>}
      </div>
      <pre tabIndex={0} aria-label={title}>
        <code className={"hljs language-" + language}
          dangerouslySetInnerHTML={{ __html: hljs.highlight(children, { language }).value }} />
      </pre>
    </div>
  );
}
export function References() {
  return (
    <ol className="research-references">
      {references.map((reference) => (
        <li id={"ref-" + reference.id} key={reference.id}>
          {reference.authors} ({reference.year}).{" "}
          <a href={reference.url} target="_blank" rel="noreferrer">
            {reference.title}
          </a>{" "}
          <em>{reference.journal}.</em>
          {reference.doi && <> DOI: {reference.doi}.</>}
        </li>
      ))}
    </ol>
  );
}
