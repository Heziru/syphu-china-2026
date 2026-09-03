import { CHAPTERS } from "./chapters";
import type { LabObjectDef } from "../types/laboratory";
import { assertMetadataRoute } from "../types/labStation";

export const LAB_OBJECTS: LabObjectDef[] = [
  {
    id: "computer",
    name: "Workstation",
    nameZh: "电脑",
    description: "进入 Dry Lab / Model：模型框架与模拟解释。",
    chapterId: "model",
    position: [-3.35, 0, -0.15],
    rotation: [0, 0.35, 0],
    scale: 1,
    hitSize: [1.6, 1.5, 1.2],
    hitOffset: [0, 1.05, 0],
    camera: {
      desktop: { position: [-1.1, 2.4, 2.6], target: [-3.35, 1.15, -0.15] },
      mobile: { position: [-0.4, 2.7, 3.4], target: [-3.35, 1.2, -0.15] },
    },
    hoverAnim: "highlight",
    clickAnim: "pulse",
    placeholder: "geometry",
    modelSource: "placeholder",
    category: "workstation",
    metadata: {
      id: "computer",
      name: "Dry Lab",
      route: "/model",
      category: "workstation",
      description: "Dry lab workstation",
    },
  },
  {
    id: "microscope",
    name: "Microscope",
    nameZh: "显微镜",
    description: "进入 Wet Lab / Experiments：实验设计与验证进展。",
    chapterId: "experiments",
    position: [0.05, 0, 0.35],
    rotation: [0, -0.12, 0],
    scale: 1,
    hitSize: [1.5, 1.7, 1.3],
    hitOffset: [0, 1.15, 0],
    camera: {
      desktop: { position: [1.05, 1.68, 1.82], target: [0.05, 1.22, 0.38] },
      mobile: { position: [0.85, 1.95, 2.25], target: [0.05, 1.24, 0.38] },
    },
    hoverAnim: "highlight",
    clickAnim: "pulse",
    placeholder: "geometry",
    modelSource: "procedural",
    category: "equipment",
    metadata: {
      id: "microscope",
      name: "Wet Lab",
      route: "/experiments",
      category: "equipment",
      description: "Laboratory microscope",
    },
  },
  {
    id: "researcher",
    name: "Researcher",
    nameZh: "研究员",
    description: "进入 Team：成员与分工。",
    chapterId: "team",
    position: [-4.25, 0, 1.55],
    rotation: [0, 0.95, 0],
    scale: 1,
    hitSize: [0.9, 1.85, 0.8],
    hitOffset: [0, 0.95, 0],
    camera: {
      desktop: { position: [-1.9, 2.1, 3.6], target: [-4.25, 1.1, 1.55] },
      mobile: { position: [-1.4, 2.4, 4.3], target: [-4.25, 1.15, 1.55] },
    },
    hoverAnim: "scale",
    clickAnim: "pulse",
    placeholder: "geometry",
    modelSource: "placeholder",
    category: "character",
    metadata: {
      id: "researcher",
      name: "Team",
      route: "/team",
      category: "character",
      description: "Laboratory researcher",
    },
  },
  {
    id: "bookshelf",
    name: "Archive",
    nameZh: "书架与访谈文件",
    description: "进入 Human Practices：调研与设计影响。",
    chapterId: "human-practices",
    position: [2.55, 0, -2.55],
    rotation: [0, -0.08, 0],
    scale: 1,
    hitSize: [1.7, 2.2, 0.7],
    hitOffset: [0, 1.15, 0],
    camera: {
      desktop: { position: [2.55, 2.4, 1.6], target: [2.55, 1.3, -2.55] },
      mobile: { position: [2.55, 2.8, 2.4], target: [2.55, 1.35, -2.55] },
    },
    hoverAnim: "highlight",
    clickAnim: "pulse",
    placeholder: "geometry",
    modelSource: "placeholder",
    category: "archive",
    metadata: {
      id: "bookshelf",
      name: "Human Practices",
      route: "/human-practices",
      category: "archive",
      description: "Archive shelf and interview files",
    },
  },
  {
    id: "device",
    name: "Prototype",
    nameZh: "实验装置",
    description: "进入 Project：总览并链接 Design、Engineering、Results 与 Safety。",
    chapterId: "description",
    position: [3.25, 0, 0.55],
    rotation: [0, -0.4, 0],
    scale: 1,
    hitSize: [1.4, 1.8, 1.2],
    hitOffset: [0, 1.1, 0],
    camera: {
      desktop: { position: [1.2, 2.5, 3.3], target: [3.25, 1.15, 0.55] },
      mobile: { position: [0.6, 2.8, 4.0], target: [3.25, 1.2, 0.55] },
    },
    hoverAnim: "highlight",
    clickAnim: "pulse",
    placeholder: "geometry",
    modelSource: "placeholder",
    category: "device",
    metadata: {
      id: "device",
      name: "Project",
      route: "/description",
      category: "device",
      description: "Laboratory prototype / bioreactor station",
    },
  },
];

for (const def of LAB_OBJECTS) {
  assertMetadataRoute(def, CHAPTERS[def.chapterId]);
}

export function labObjectById(id: string) {
  return LAB_OBJECTS.find((item) => item.id === id);
}

export function chapterForObject(id: string) {
  const obj = labObjectById(id);
  return obj ? CHAPTERS[obj.chapterId] : undefined;
}
