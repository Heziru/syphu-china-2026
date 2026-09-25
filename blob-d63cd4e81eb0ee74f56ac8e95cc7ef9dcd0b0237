import { furnitureById } from "../laboratory/roomPlacement";
import { transformPoint } from "../laboratory/layoutMath";
import type { CameraShot } from "../types/laboratory";

export const EQUIPMENT_DETAILS: Record<
  string,
  {
    name: string;
    description: string;
    path?: string;
    citation?: string;
    doi?: string;
  }
> = {
  balance: {
    name: "Sample preparation",
    description:
      "An analytical balance sits on a separate preparation bench beside organised consumables.",
  },
  computer: {
    name: "Dry Lab workstation",
    description:
      "A dedicated desk for modelling, data analysis and documenting the project.",
  },
  microscope: {
    name: "Microscopy station",
    description:
      "The central bench brings observation, sample racks and experimental notes together.",
  },
  researcher: {
    name: "Meet the team",
    description:
      "Our researcher carries a clipboard between the laboratory workstations.",
  },
  "storage-a": {
    name: "Laboratory archive",
    description:
      "Labelled supplies and records have a permanent home beside the working benches.",
  },
  device: {
    name: "Bioreactor",
    description:
      "The engineering area groups the culture vessel, tubing and controller together.",
  },
  "laminar-hood": {
    name: "Clean bench",
    description:
      "A freestanding clean bench faces into its working aisle. Its own stand keeps the enclosure clear of neighbouring worktops.",
  },
  fridge: {
    name: "Laboratory refrigerator",
    description:
      "Cold storage sits along the equipment wall, with room to approach the door.",
  },
  nitrogen: {
    name: "Cryogenic storage vessel",
    description:
      "An insulated storage vessel with a neck cap and carrying handles.",
  },
  "coat-rack": {
    name: "Lab coat station",
    description:
      "A pair of coats hangs near the entrance, separate from the active work surfaces.",
  },
  centrifuge: {
    name: "Benchtop centrifuge",
    description:
      "A compact centrifuge with a covered rotor and front controls.",
  },
  ultrasonic: {
    name: "Ultrasonic processor",
    description:
      "The probe, support stand and vessel are grouped as one instrument.",
  },
  shaker: {
    name: "Orbital shaker",
    description:
      "A small platform holds a set of culture vessels beside the wet-lab instruments.",
  },
  "supply-cart": {
    name: "Laboratory supplies",
    description:
      "Reagent kits, tip boxes, tube racks and spare bottles are organised on a three-tier trolley.",
  },
  "paper-rubens": {
    name: "Synthetic mixed-signal computation",
    description:
      "A project-library display on synthetic gene circuits that combine analogue sensing with digital decision-making in living cells.",
    citation: "Rubens, Selvaggio & Lu · Nature Communications · 2016",
    doi: "https://doi.org/10.1038/ncomms11658",
  },
  "paper-wang": {
    name: "Proton motive force and antibiotic tolerance",
    description:
      "This study connects active maintenance of proton motive force with starvation-induced antibiotic tolerance in Escherichia coli.",
    citation: "Wang et al. · Communications Biology · 2021",
    doi: "https://doi.org/10.1038/s42003-021-02612-1",
  },
  "paper-teng": {
    name: "Engineered E. coli Nissle 1917",
    description:
      "A probiotic engineering study in which E. coli Nissle 1917 expresses elafin to protect against inflammation and restore gut microbiota.",
    citation: "Teng et al. · Frontiers in Microbiology · 2022",
    doi: "https://doi.org/10.3389/fmicb.2022.819336",
  },
};

export function equipmentShot(id: string, mobile: boolean): CameraShot {
  const spec = furnitureById(id);
  const focus = spec.size[1] * 0.56;
  const distance =
    Math.max(2, spec.size[1] * 2.4, spec.size[0] * 2.3) * (mobile ? 1.35 : 1);
  return {
    position: transformPoint(spec, [
      distance * 0.17,
      focus + distance * 0.26,
      distance,
    ]),
    target: transformPoint(spec, [0, focus, 0]),
  };
}
