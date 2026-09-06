export const LITERATURE = [
  {
    id: "rubens",
    category: "Sensing",
    ref: 139,
    year: 2016,
    author: "Rubens, Selvaggio & Lu",
    title: "Synthetic mixed-signal computation in living cells",
    source: "https://doi.org/10.1038/ncomms11658",
    image: "rubens-2016.webp",
    role: "How can a cell interpret a signal?",
    relevance:
      "Supports the sensing and circuit-design context in §5.1.3. Published circuit responses are context-specific, not calibrated parameters of our EcN strain.",
    boundary:
      "Synthetic circuit study; does not validate this project's complete survival circuit.",
  },
  {
    id: "wang",
    category: "Survival",
    ref: 131,
    year: 2021,
    author: "Wang et al.",
    title:
      "Active maintenance of proton motive force mediates starvation-induced bacterial antibiotic tolerance in Escherichia coli",
    source: "https://doi.org/10.1038/s42003-021-02612-1",
    image: "wang-2021.webp",
    role: "Why study membrane protection?",
    relevance:
      "Connects PspA, membrane energetics and survival in the evidence discussion of §5.1.2.",
    boundary:
      "Starvation and antibiotic-tolerance conditions; effects must not be assumed to transfer quantitatively to anaerobic EcN in bile acids.",
  },
  {
    id: "teng",
    category: "Payload",
    ref: 25,
    year: 2022,
    author: "Teng et al.",
    title:
      "Probiotic Escherichia coli Nissle 1917 Expressing Elafin Protects Against Inflammation and Restores the Gut Microbiota",
    source: "https://doi.org/10.3389/fmicb.2022.819336",
    image: "teng-2022.webp",
    role: "Why consider EcN and Elafin?",
    relevance:
      "An experimental precedent for the chassis–payload pairing discussed in §2.6.",
    boundary:
      "Preclinical colitis and cell-model evidence; not a clinical result or a validation of our engineered strain.",
  },
  {
    id: "begley",
    category: "Environment",
    ref: 7,
    year: 2005,
    author: "Begley, Gahan & Hill",
    title: "The interaction between bacteria and bile",
    source: "https://doi.org/10.1016/j.femsre.2004.09.003",
    role: "What does the environment contribute?",
    relevance:
      "Background for the bile-acid environment and bacterial envelope interactions in the project rationale.",
    boundary: "Review evidence spans different species and bile compositions.",
  },
  {
    id: "inda",
    category: "Sensing",
    ref: 137,
    year: 2023,
    author: "Inda-Webb et al.",
    title:
      "Sub-1.4 cm³ capsule for detecting labile inflammatory biomarkers in situ",
    source: "https://doi.org/10.1038/s41586-023-06369-x",
    image: "inda-2023.webp",
    previewVersion: "NSF archived article",
    role: "Can an intestinal signal be recorded?",
    relevance:
      "An in vivo sensing precedent discussed in §5.1.3, using a bacterial–electronic capsule.",
    boundary:
      "Different device and circuit architecture; not evidence of our survival-control performance.",
  },
  {
    id: "andersen",
    category: "Survival",
    ref: 149,
    year: 1998,
    author: "Andersen et al.",
    title:
      "New unstable variants of green fluorescent protein for studies of transient gene expression in bacteria",
    source: "https://doi.org/10.1128/AEM.64.6.2240-2246.1998",
    image: "andersen-1998.webp",
    role: "How can a response change over time?",
    relevance: "Provides the degradation-tag context cited in §2.4.2.",
    boundary:
      "Published GFP-tag kinetics do not establish the half-life of the project's tagged PspA.",
  },
  {
    id: "simmonds",
    category: "Environment",
    ref: 3,
    year: 1992,
    author: "Simmonds et al.",
    title:
      "Chemiluminescence assay of mucosal reactive oxygen metabolites in inflammatory bowel disease",
    source: "https://doi.org/10.1016/0016-5085(92)91112-h",
    role: "Why look at oxidative signals?",
    relevance: "Supports the oxidative-environment rationale in §1.",
    boundary:
      "Assay-dependent evidence; not a spatially resolved concentration map for this animation.",
  },
  {
    id: "hoffmann",
    category: "Safety",
    ref: 39,
    year: 2024,
    author: "Hoffmann & Cai",
    title:
      "Engineering stringent genetic biocontainment of yeast with a protein stability switch",
    source: "https://doi.org/10.1038/s41467-024-44988-8",
    image: "hoffmann-2024.webp",
    role: "Which escape routes need attention?",
    relevance:
      "A background source in the project's discussion of nutrient-dependent containment and cross-feeding.",
    boundary:
      "Yeast protein-stability control; a distinct organism and switch. It provides safety-design context, not evidence of EcN containment or zero escape.",
  },
] as const;
export const LITERATURE_CATEGORIES = [
  "All",
  "Environment",
  "Sensing",
  "Survival",
  "Payload",
  "Safety",
] as const;
export function openLiterature(id = "rubens") {
  window.dispatchEvent(new CustomEvent("lab:literature", { detail: id }));
}
