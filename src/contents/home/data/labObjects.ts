import { CHAPTERS } from "./chapters";
import type {
  LabObjectDef,
  LabObjectId,
  ChapterId,
  LabObjectCategory,
  CameraShot,
} from "../types/laboratory";
import { assertMetadataRoute } from "../types/labStation";
import { INTERACTIVE_FURNITURE } from "../laboratory/roomPlacement";
import { transformPoint } from "../laboratory/layoutMath";
function station(
  id: LabObjectId,
  chapterId: ChapterId,
  category: LabObjectCategory,
): LabObjectDef {
  const spec = INTERACTIVE_FURNITURE[id],
    chapter = CHAPTERS[chapterId];
  const focus = spec.size[1] * 0.55;
  const shot = (mobile: boolean): CameraShot => ({
    position: transformPoint(spec, [
      mobile ? 0.4 : 0.55,
      focus + (mobile ? 0.85 : 0.65),
      mobile ? 3.4 : 2.8,
    ]),
    target: transformPoint(spec, [0, focus, 0]),
  });
  return {
    id,
    name: chapter.name,
    nameZh: chapter.nameZh,
    description: chapter.summary,
    chapterId,
    position: spec.position,
    rotation: [0, spec.rotationY, 0],
    scale: 1,
    hitSize: spec.size,
    hitOffset: [0, spec.size[1] / 2, 0],
    camera: { desktop: shot(false), mobile: shot(true) },
    hoverAnim: "highlight",
    clickAnim: "pulse",
    placeholder: "geometry",
    modelSource: "procedural",
    category,
    metadata: {
      id,
      name: chapter.name,
      route: chapter.path,
      category,
      description: chapter.summary,
    },
  };
}
export const LAB_OBJECTS: LabObjectDef[] = [
  station("computer", "model", "workstation"),
  station("microscope", "experiments", "equipment"),
  station("researcher", "team", "character"),
  station("bookshelf", "human-practices", "archive"),
  station("device", "description", "device"),
];
for (const def of LAB_OBJECTS)
  assertMetadataRoute(def, CHAPTERS[def.chapterId]);
export const labObjectById = (id: string) =>
  LAB_OBJECTS.find((o) => o.id === id);
export function chapterForObject(id: string) {
  const obj = labObjectById(id);
  return obj ? CHAPTERS[obj.chapterId] : undefined;
}
