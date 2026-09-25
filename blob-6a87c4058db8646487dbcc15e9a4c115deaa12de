import { furnitureById } from "../laboratory/roomPlacement";
import { transformPoint } from "../laboratory/layoutMath";
import type { CameraShot } from "../types/laboratory";

export const EQUIPMENT_DETAILS: Record<
  string,
  {
    name: string;
    description: string;
    path?: string;
    linkLabel?: string;
    citation?: string;
    doi?: string;
  }
> = {
  balance: {
    name: "Analytical balance",
    description: "Careful measurements begin at the balance.",
    path: "/experiments#validation-plan",
    linkLabel: "Experiments",
  },
  computer: {
    name: "Model workstation",
    description: "Explore the assumptions behind conditional survival.",
    path: "/model#model-framework",
    linkLabel: "Model",
  },
  microscope: {
    name: "Microscope",
    description: "Observation connects our questions to experiments.",
    path: "/experiments#validation-plan",
    linkLabel: "Experiments",
  },
  researcher: {
    name: "Meet the team",
    description: "Meet the people behind LBP-Mototype.",
    path: "/team",
    linkLabel: "Team",
  },
  "storage-a": {
    name: "Keep a record",
    description: "Follow the decisions that shaped our design.",
    path: "/engineering",
    linkLabel: "Engineering",
  },
  device: {
    name: "Bioreactor",
    description: "Culture conditions become part of the design.",
    path: "/description#project-design",
    linkLabel: "Design",
  },
  "laminar-hood": {
    name: "Clean bench",
    description: "A prepared workspace for careful sample handling.",
    path: "/safety-and-security#containment",
    linkLabel: "Safety",
  },
  fridge: {
    name: "Cold storage",
    description: "A place for temperature-sensitive laboratory materials.",
    path: "/experiments#validation-plan",
    linkLabel: "Experiments",
  },
  nitrogen: {
    name: "Preserve a sample",
    description: "Sample storage is part of responsible laboratory work.",
    path: "/safety-and-security#containment",
    linkLabel: "Safety",
  },
  "coat-rack": {
    name: "Before we begin",
    description: "Preparation starts before the experiment.",
    path: "/safety-and-security#containment",
    linkLabel: "Safety",
  },
  centrifuge: {
    name: "Centrifuge",
    description: "Sample preparation makes the next observation possible.",
    path: "/experiments#validation-plan",
    linkLabel: "Experiments",
  },
  ultrasonic: {
    name: "Ultrasonic processor",
    description: "Each preparation step needs a defined purpose.",
    path: "/experiments#validation-plan",
    linkLabel: "Experiments",
  },
  shaker: {
    name: "Orbital shaker",
    description: "Explore how culture conditions enter the experiments.",
    path: "/experiments#validation-plan",
    linkLabel: "Experiments",
  },
  "supply-cart": {
    name: "Ready to work",
    description: "Small tools support careful, repeatable work.",
    path: "/experiments#validation-plan",
    linkLabel: "Experiments",
  },
  "paper-rubens": {
    name: "Synthetic mixed-signal computation",
    description:
      "A project-library display on synthetic gene circuits that combine analogue sensing with digital decision-making in living cells.",
    citation: "Rubens, Selvaggio & Lu · Nature Communications · 2016",
    doi: "https://doi.org/10.1038/ncomms11658",
  },
  "dry-desk": {
    name: "Think it through",
    description: "From a biological question to a model.",
    path: "/model#model-framework",
    linkLabel: "Model",
  },
  "wet-bench": {
    name: "Test the idea",
    description: "See how our design is evaluated.",
    path: "/experiments#validation-plan",
    linkLabel: "Experiments",
  },
  "central-bench": {
    name: "From question to evidence",
    description: "Follow the project through its experimental work.",
    path: "/results#evidence-status",
    linkLabel: "Results",
  },
  "preparation-bench": {
    name: "Begin with care",
    description: "Preparation gives each experiment a reliable starting point.",
    path: "/experiments#validation-plan",
    linkLabel: "Experiments",
  },
  "engineering-bench": {
    name: "Build and learn",
    description: "Design choices become testable questions.",
    path: "/engineering",
    linkLabel: "Engineering",
  },
  "engineering-cabinet": {
    name: "Everything in place",
    description: "Organised tools keep the work flowing.",
    path: "/experiments#validation-plan",
    linkLabel: "Experiments",
  },
  "storage-b": {
    name: "A shared archive",
    description: "Keep the methods, materials and decisions connected.",
    path: "/engineering",
    linkLabel: "Engineering",
  },
  "dry-chair": {
    name: "A place to think",
    description: "There is room for another perspective.",
  },
  "wet-stool": {
    name: "Take a closer look",
    description: "A quiet place beside the bench.",
  },
  "central-stool-front-right": {
    name: "Work together",
    description: "Good questions grow through conversation.",
  },
  "central-stool-rear-left": {
    name: "Another perspective",
    description: "Research is a shared effort.",
  },
  "tube-rack": {
    name: "One sample at a time",
    description: "Clear organisation supports traceable experiments.",
    path: "/experiments#validation-plan",
    linkLabel: "Experiments",
  },
  glassware: {
    name: "Make it measurable",
    description: "The vessels are simple; the questions are precise.",
    path: "/experiments#validation-plan",
    linkLabel: "Experiments",
  },
  "petri-dishes": {
    name: "Petri dishes",
    description: "A small stage for a biological question.",
    path: "/experiments#validation-plan",
    linkLabel: "Experiments",
  },
  "tip-boxes": {
    name: "Ready for the next step",
    description: "Organised consumables support careful handling.",
    path: "/experiments#validation-plan",
    linkLabel: "Experiments",
  },
  "bench-plant": {
    name: "Room to grow",
    description: "A little green beside the work.",
  },
  notebook: {
    name: "Leave a trail",
    description: "Every result starts with a recorded question.",
    path: "/engineering",
    linkLabel: "Engineering",
  },
};

export const DETAIL_ANCHORS: Record<
  string,
  {
    parent: string;
    offset: [number, number, number];
    hitSize: [number, number, number];
  }
> = {
  "tube-rack": {
    parent: "central-bench",
    offset: [-0.91, 0.98, -0.18],
    hitSize: [0.5, 0.26, 0.3],
  },
  glassware: {
    parent: "central-bench",
    offset: [-1.05, 1.01, 0.4],
    hitSize: [0.16, 0.31, 0.16],
  },
  "petri-dishes": {
    parent: "central-bench",
    offset: [0.75, 0.93, 0.3],
    hitSize: [0.27, 0.15, 0.27],
  },
  "tip-boxes": {
    parent: "central-bench",
    offset: [0.76, 0.98, -0.25],
    hitSize: [0.42, 0.25, 0.34],
  },
  "bench-plant": {
    parent: "central-bench",
    offset: [1.12, 1.06, -0.48],
    hitSize: [0.27, 0.4, 0.27],
  },
  notebook: {
    parent: "central-bench",
    offset: [-0.5, 0.88, 0.45],
    hitSize: [0.26, 0.04, 0.2],
  },
};
export function equipmentShot(
  id: string,
  mobile: boolean,
  aspect = mobile ? 0.65 : 1.65,
): CameraShot {
  const anchor = DETAIL_ANCHORS[id];
  const spec = furnitureById(anchor?.parent ?? id);
  const focus = anchor ? anchor.offset[1] : spec.size[1] * 0.56;
  const distance =
    (anchor ? 1.75 : Math.max(2, spec.size[1] * 2.4, spec.size[0] * 2.3)) *
    Math.max(1, (mobile ? 0.4 : 0.82) / aspect) *
    (mobile ? 1.15 : 1);
  const centerX = anchor?.offset[0] ?? 0;
  const centerZ = anchor?.offset[2] ?? 0;
  const position = transformPoint(spec, [
    centerX + distance * 0.17,
    focus + distance * 0.28,
    centerZ + distance,
  ]);
  const target = transformPoint(spec, [centerX, focus, centerZ]);
  // Leave clear space for the caption without changing the object's geometry.
  if (mobile) target[1] -= distance * 0.13;
  else {
    const dx = position[0] - target[0],
      dz = position[2] - target[2],
      length = Math.hypot(dx, dz);
    target[0] -= (dz / length) * distance * 0.14;
    target[2] += (dx / length) * distance * 0.14;
  }
  return {
    position,
    target,
  };
}
