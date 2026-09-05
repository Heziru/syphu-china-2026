export const STORY_STEPS = [
  {
    title: "Inside the gut",
    label: "01 · CONTEXT",
    model: "digestive-system",
    summary: "A connected system. A local challenge.",
    text: "IBD is the disease context for our design. The model locates the stomach, small intestine and colon before moving into the intestinal environment.",
    details: [
      [
        "Stomach",
        "The oesophagus enters the stomach; the narrowed pyloric outlet continues into the duodenum. The stomach provides orientation, rather than being presented as the project’s treatment target.",
      ],
      [
        "Small intestine",
        "A continuous coiled tube represents the jejunum and ileum. The terminal ileum meets the cecum. Loop number and organ dimensions are simplified.",
      ],
      [
        "Colon",
        "The ascending colon appears on the viewer’s left in this anterior view, followed by the transverse, descending and sigmoid colon, then the rectum. The small side branch is the appendix.",
      ],
    ],
    source:
      "https://www.niddk.nih.gov/health-information/digestive-diseases/digestive-system-how-it-works",
  },
  {
    title: "A local environment",
    label: "02 · INTESTINAL WALL",
    model: "colon-section",
    summary: "Tissue, lumen and environmental signals.",
    text: "This opened colon segment separates the wall layers from the lumen. Warm markers represent an inflammation-associated ROS signal; violet markers represent the bile-acid environment.",
    details: [
      [
        "Wall layers",
        "The cut edges distinguish mucosa, submucosa and two muscle layers. Thicknesses are enlarged for readability. The serosal surface is simplified.",
      ],
      [
        "Crypts",
        "The recessed openings represent colonic crypts. The colon is not covered with the finger-like villi found in the small intestine. Pale cells indicate mucus-producing goblet cells.",
      ],
      [
        "Environment",
        "Marker shapes and colours are a visual key, not molecular structures or measured concentrations. Signal distribution is illustrative and does not depict active bacterial navigation.",
      ],
    ],
    source: "https://www.ncbi.nlm.nih.gov/books/NBK54098/",
  },
  {
    title: "Survival, under conditions",
    label: "03 · ENGINEERED EcN",
    model: "engineered-ecn",
    summary: "ROS sensing → PspA complementation.",
    text: "The design links an inflammation-associated input to PspA complementation. Survival is intended to depend on this response together with the bile-acid environment.",
    details: [
      [
        "Envelope",
        "The opened rod distinguishes an outer membrane, a thin peptidoglycan layer and an inner membrane. This is a Gram-negative cell cutaway, with layer spacing exaggerated.",
      ],
      [
        "Inside EcN",
        "The folded dark strand represents the nucleoid; the violet loop represents an engineered plasmid. Small teal particles represent ribosomes. These are structural symbols, not sequence-derived reconstructions.",
      ],
      [
        "PspA",
        "Violet markers beside the inner membrane represent PspA association with membrane protection. Their number, shape and placement are illustrative. The design still requires experimental validation.",
      ],
    ],
    source: "https://pubmed.ncbi.nlm.nih.gov/19555453/",
  },
  {
    title: "A therapeutic payload",
    label: "04 · ELAFIN",
    model: "engineered-ecn",
    summary: "Production and release are distinct.",
    text: "Elafin is designed for constitutive expression. Yellow symbols distinguish the payload from the cell’s structural components. Extracellular availability depends on cell state and requires validation.",
    details: [
      [
        "Production",
        "Yellow intracellular symbols represent Elafin accumulation. They do not represent a newly proposed ROS-controlled Elafin expression switch.",
      ],
      [
        "Release",
        "Moving yellow markers illustrate possible extracellular availability. This is not evidence for an active secretion system or a measured release rate.",
      ],
      [
        "Evidence",
        "The schematic separates the intended payload from results. Quantitative output, release pathways and therapeutic effects belong in the relevant experiments and results pages.",
      ],
    ],
  },
  {
    title: "An exit with a timeline",
    label: "05 · WITHDRAWAL",
    model: "engineered-ecn",
    summary: "Signal falls. Protection responds later.",
    text: "Scroll to advance illustrative time. The signal decreases first, the PspA marker fades later, and the cell population representation then recedes under the assumed exit conditions.",
    details: [
      [
        "Signal",
        "The warm ROS markers fade first. This distinguishes an input change from the slower change in existing protection.",
      ],
      [
        "Protection",
        "The PspA markers change after a delay. These intervals are animation timing, not measured protein half-lives or calibrated model outputs.",
      ],
      [
        "Clearance",
        "The receding cell represents a design expectation under relevant environmental and clearance conditions, rather than proven complete elimination or zero escape.",
      ],
    ],
  },
] as const;
