# Repo integration (SYPHU-China wiki)

## Layout

| Role | Path |
|------|------|
| Lab scene | `src/contents/home/laboratory/LaboratoryScene.tsx` |
| Canvas | `src/contents/home/laboratory/LaboratoryCanvas.tsx` |
| Interaction shell | `src/contents/home/laboratory/InteractiveObject.tsx` |
| Mesh switch | `src/contents/home/laboratory/PlaceholderObject.tsx` |
| Object data | `src/contents/home/data/labObjects.ts` |
| Types | `src/contents/home/types/laboratory.ts` |
| Example module | `src/contents/home/laboratory/microscope/` |

## New station pattern

```text
src/contents/home/laboratory/<objectId>/
  create<Name>Model.ts   # Three.js Group factory + stats + REVISION
  <Name>Model.tsx        # R3F wrapper → <primitive>
  reviewShots.ts         # optional ?labReview= camera shots
  reference.png          # optional comparison asset
```

1. Add / update `LabObjectDef` in `labObjects.ts` (`id`, hitbox, `camera`, `chapterId`).
2. Render mesh from `PlaceholderObject` by `id`.
3. Keep `InteractiveObject` as the only click / hover shell.
4. Do not invent a parallel scene graph outside `LaboratoryScene`.

## Mapping (current)

| id | Chapter intent |
|----|----------------|
| `computer` | Dry Lab / Model |
| `microscope` | Wet Lab / Experiments |
| `researcher` | Team |
| `bookshelf` | Human Practices |
| `device` | Project / Description → Results |

## Swap path for GLB later

Keep the R3F component API stable (`<Name>Model` under the same `id`). Internally switch from `create*Model()` to `useGLTF` without changing `InteractiveObject` or `LAB_OBJECTS` ids.
