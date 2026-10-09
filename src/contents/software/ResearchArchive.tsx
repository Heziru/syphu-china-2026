import { Link } from "react-router-dom";
import { assetUrl } from "../../utils/assetUrl";
import { CodeBlock, DataTable } from "../drylab/ResearchPrimitives";
import { researchAsset } from "../drylab/researchAssets";
const dryLabAsset = (file: string) => assetUrl("assets/dry-lab/" + file);
export function ResearchArchive() {
  return (
    <article className="sw-archive-content">
      <p>
        The <Link to="/model">Model page</Link> develops the questions,
        equations and results. This page records the software workflow: which
        files support each figure, how to repeat the analyses, and which tools
        are needed to run new simulations.
      </p>

      <h2>Download the research package</h2>
      <p>
        <a href={researchAsset("syphu-drylab-research.zip")} download>
          Download the reproducibility package (.zip)
        </a>
        . The archive preserves the repository directory layout and contains the
        scripts, deposited coordinates, docking poses, protein trajectories,
        numerical tables, figures, source records and licenses. It also includes
        a pinned Python requirements file and a minimal package.json for browser
        rendering.
      </p>
      <p>
        <a href={researchAsset("REPRODUCIBILITY.txt")} download>
          Read the complete run instructions
        </a>{" "}
        and{" "}
        <a href={researchAsset("research-bundle-manifest.json")} download>
          inspect the SHA-256 manifest
        </a>
        . Every archive member except the manifest itself is covered by a
        recorded size and checksum. Virtual environments, HDOCK binaries,
        private working documents and full-solvent trajectories are excluded.
      </p>

      <DataTable
        caption="Analysis modules and downloadable records. Full source directories are preserved in the ZIP."
        headers={["Module", "Code and methods", "Saved data"]}
        rows={[
          [
            "Deposited structures",
            <>
              <a href={researchAsset("analyze_structures.py")} download>
                Coordinate analysis
              </a>
              <br />
              <a href={researchAsset("render_structures.mjs")} download>
                Browser rendering
              </a>
              <br />
              <a href={researchAsset("plot_structures.py")} download>
                Figure generation
              </a>
            </>,
            <>
              <a href={researchAsset("structure-summary.json")} download>
                Structure summary
              </a>
              <br />
              <a href={researchAsset("2rel-pairwise-rmsd.csv")} download>
                Pairwise comparisons
              </a>
              <br />
              <a
                href={researchAsset(
                  "1fle-minimum-heavy-atom-distance-matrix.csv",
                )}
                download
              >
                Distance matrix
              </a>
            </>,
          ],
          [
            "Reference binding kinetics",
            <a href={researchAsset("binding_kinetics.py")} download>
              binding_kinetics.py
            </a>,
            <>
              <a href={researchAsset("binding-summary.json")} download>
                Parameters and checks
              </a>
              <br />
              <a href={researchAsset("binding-trajectories.csv")} download>
                Time courses
              </a>
              <br />
              <a href={researchAsset("binding-isotherms.csv")} download>
                Isotherms
              </a>
            </>,
          ],
          [
            "Ecology and spatial transport",
            <>
              <a href={researchAsset("research_models.py")} download>
                research_models.py
              </a>
              <br />
              <a href={researchAsset("research-report.md")} download>
                Derivations and methods
              </a>
            </>,
            <>
              <a href={researchAsset("research-summary.json")} download>
                Summary and checks
              </a>
              <br />
              <a href={researchAsset("parameter-ensemble.csv")} download>
                Sampled scenarios
              </a>
              <br />
              <a href={researchAsset("space-convergence.csv")} download>
                Spatial refinement
              </a>
            </>,
          ],
          [
            "Surface retention",
            <>
              <a href={dryLabAsset("adhesion/retention_model.py")} download>
                retention_model.py
              </a>
              <br />
              <a href={dryLabAsset("adhesion/README.md")} download>
                Boundary conditions and methods
              </a>
            </>,
            <>
              <a href={dryLabAsset("adhesion/retention-summary.json")} download>
                Verification summary
              </a>
              <br />
              <a href={dryLabAsset("adhesion/retention-curves.csv")} download>
                Complete time courses
              </a>
              <br />
              <a
                href={dryLabAsset("adhesion/retention-animation.json")}
                download
              >
                Saved replay frames
              </a>
            </>,
          ],
          [
            "Particle trajectories",
            <>
              <a href={dryLabAsset("adhesion/particle-transport.py")} download>
                particle_transport.py
              </a>
              <br />
              <a href={dryLabAsset("adhesion/particle-README.md")} download>
                Solver, display mapping and checks
              </a>
            </>,
            <>
              <a href={dryLabAsset("adhesion/particle-summary.json")} download>
                Parameters and verification
              </a>
              <br />
              <a href={dryLabAsset("adhesion/particle-counts.csv")} download>
                Complete cohort counts
              </a>
              <br />
              <a href={dryLabAsset("adhesion/particle-replay.json")} download>
                Fixed-ID position frames
              </a>
            </>,
          ],
          [
            "Docking calculations",
            <>
              <code>scripts/drylab/atomistic/</code> in the ZIP
              <br />
              <a href={dryLabAsset("atomistic/README.md")} download>
                Solver setup and methods
              </a>
              <br />
              <a
                href={dryLabAsset("atomistic/render_docking_closeup.mjs")}
                download
              >
                Molecular close-up renderer
              </a>
            </>,
            <>
              <a href={dryLabAsset("atomistic/docking-summary.json")} download>
                Docking summary
              </a>
              <br />
              <a
                href={dryLabAsset(
                  "atomistic/docking/1fle-redocking/pose-metrics.csv",
                )}
                download
              >
                Redocking pose metrics
              </a>
              <br />
              <a
                href={dryLabAsset(
                  "atomistic/docking/human-ne-elafin/pose-metrics.csv",
                )}
                download
              >
                Cross-docking pose metrics
              </a>
              <br />
              <a href={dryLabAsset("atomistic/closeup-contacts.csv")} download>
                Close-up atom separations
              </a>
            </>,
          ],
          [
            "Atomistic trajectory pilot",
            <>
              <code>scripts/drylab/atomistic/</code> in the ZIP
              <br />
              <a href={dryLabAsset("atomistic/README.md")} download>
                Run environment and analysis
              </a>
            </>,
            <>
              <a href={dryLabAsset("atomistic/md-summary.json")} download>
                Trajectory analysis summary
              </a>
              <br />
              <a
                href={dryLabAsset(
                  "atomistic/md/replica-1/protein-coordinates.npz",
                )}
                download
              >
                Replica 1 coordinates (NPZ)
              </a>
              <br />
              <a
                href={dryLabAsset("atomistic/md/replica-1/thermodynamics.csv")}
                download
              >
                Replica 1 run log
              </a>
              <br />
              All replicas, DCDs and serialized states are in the ZIP.
            </>,
          ],
          [
            "Diagrams and source records",
            <>
              <a href={dryLabAsset("illustrations/draw_pathway.py")} download>
                Editable SVG generator
              </a>
              <br />
              <a href={researchAsset("plot_overview.py")} download>
                Overview figure script
              </a>
            </>,
            <>
              <a
                href={dryLabAsset("illustrations/project-pathway.svg")}
                download
              >
                Pathway schematic (SVG)
              </a>
              <br />
              <a
                href={dryLabAsset("literature-2026/data-sources.json")}
                download
              >
                Data-source register
              </a>
              <br />
              <a
                href={dryLabAsset(
                  "literature-2026/wiki-presentation-audit.json",
                )}
                download
              >
                Wiki presentation review
              </a>
            </>,
          ],
        ]}
      />

      <h2>Reanalyse the archived inputs</h2>
      <p>
        Extract the ZIP into its own directory. Python 3.12.7 was used for the
        recorded calculations; the pinned analysis dependencies are NumPy,
        SciPy, Matplotlib and Pillow. The molecular renderer additionally uses
        Playwright with Chromium, Edge or Chrome and the bundled local 3Dmol.js.
        OpenMM and HDOCK are not required to reanalyse the saved trajectories
        and docking poses.
      </p>
      <CodeBlock
        title="Install the analysis dependencies"
        language="bash"
        sourceUrl={researchAsset("requirements-research.txt")}
      >
        {`python -m pip install -r requirements-research.txt

# Only for browser-rendered molecular figures:
npm install
npx playwright install chromium`}
      </CodeBlock>
      <p>
        Run the following from the extracted package root, in the shown order.
        The renderer can also use an existing browser; the README describes the
        BROWSER_CHANNEL option.
      </p>
      <CodeBlock
        title="Recompute analyses and figures"
        language="bash"
        sourceUrl={researchAsset("REPRODUCIBILITY.txt")}
      >
        {`python scripts/drylab/analyze_structures.py
node scripts/drylab/render_structures.mjs
python scripts/drylab/plot_structures.py
python scripts/drylab/binding_kinetics.py
python scripts/drylab/research_models.py
python scripts/drylab/plot_overview.py
python scripts/drylab/adhesion/retention_model.py --output-dir public/assets/dry-lab/adhesion
python scripts/drylab/adhesion/particle_transport.py --output-dir public/assets/dry-lab/adhesion
python scripts/drylab/atomistic/analyze_docking.py
node scripts/drylab/atomistic/render_docking.mjs
node scripts/drylab/atomistic/render_docking_closeup.mjs
python scripts/drylab/atomistic/analyze_md.py
python scripts/drylab/atomistic/plot_atomistic.py
python scripts/drylab/atomistic/validate_atomistic.py
python scripts/drylab/draw_pathway.py`}
      </CodeBlock>
      <p>
        Generated tables and figures overwrite their counterparts under
        public/assets/dry-lab; intermediate arrays are created under outputs.
        The original Elafin-IBD directory is not an input to these commands.
        Seeds, parameters, units and numerical checks are recorded beside the
        relevant outputs. JSON and CSV files retain numerical precision beyond
        the rounded values shown in figure labels.
      </p>
      <p>
        The particle replay draws 600 fixed IDs and reports counts for all 4,000
        simulated particles. Its colon outline is a schematic mapping of
        strip-coordinate trajectories, not an organ CFD mesh. Exited and shed
        particles remain in the cumulative counts and are hidden from the
        channel view. The molecular close-up uses saved coordinates and records
        each displayed atom pair in its downloadable CSV.
      </p>

      <h2>Running new atomistic calculations</h2>
      <p>
        Saved-coordinate analysis and a fresh simulation are separate workflows.
        New MD runs require OpenMM 8.6.1 and a working CPU or OpenCL platform;
        the{" "}
        <a href={dryLabAsset("atomistic/requirements-md.txt")} download>
          MD requirements file
        </a>{" "}
        records the dependencies. The{" "}
        <a href={dryLabAsset("atomistic/README.md")}>atomistic methods file</a>{" "}
        documents the environment and preparation sequence. The runner checks
        preparation metadata before reusing completed runs; archive existing
        replica folders in a separate working copy before a fresh run.
        Stochastic trajectories need not be bitwise identical across platforms.
      </p>
      <p>
        Fresh docking requires a separately obtained HDOCKlite installation and
        Linux or WSL. Its executable is not redistributed in the download. The
        complete saved pose sets remain available for analysis without that
        solver. Protein-only trajectories and serialized simulation states are
        included; the much larger full-solvent trajectories are not part of the
        web package.
      </p>

      <h2>Inputs, provenance and licenses</h2>
      <ul className="research-file-list">
        <li>
          <a href={dryLabAsset("structures/1fle.pdb")} download>
            1FLE.pdb
          </a>{" "}
          and{" "}
          <a href={dryLabAsset("structures/2rel.pdb")} download>
            2REL.pdb
          </a>{" "}
          are deposited experimental coordinate records. The NMR model indices
          in 2REL are not simulation time points. New docking outputs and the MD
          pilot are stored separately under atomistic.
        </li>
        <li>
          <a href={dryLabAsset("atomistic/inputs/2z7f-original.pdb")} download>
            2Z7F original coordinates
          </a>{" "}
          and the per-case input-provenance.json files preserve the new docking
          input provenance.
        </li>
        <li>
          <a href={dryLabAsset("uniprot-P19957.json")} download>
            UniProt P19957
          </a>{" "}
          and{" "}
          <a href={dryLabAsset("tissue-context-gtex-v8-full.json")} download>
            the archived GTEx response
          </a>{" "}
          retain their source records. The data-source register distinguishes
          used inputs from candidate datasets not analysed here.
        </li>
        <li>
          <a href={researchAsset("references.json")} download>
            References
          </a>{" "}
          and{" "}
          <a href={researchAsset("THIRD-PARTY-NOTICES.txt")} download>
            third-party notices
          </a>{" "}
          accompany the package. The repository license does not replace the
          terms attached to external tools or database records.
        </li>
      </ul>
      <p>
        The editable SVG diagram has a reproducible generator. The illustrated
        bitmap overview is an archived design asset with its prompt, not a
        numerical output or a deterministic image-generation step. The Peking
        2025 wiki is credited for article organization; its models, figures and
        data are not incorporated into these calculations.
      </p>
      <h2>What a successful run establishes</h2>
      <p>
        Conservation checks, convergence tests and agreement with reference
        calculations test the implementation. They do not establish biological
        validation. Deposited structures, model predictions, assumed scenarios
        and the short trajectory pilot retain the distinct status recorded in
        their methods and metadata.
      </p>
    </article>
  );
}
