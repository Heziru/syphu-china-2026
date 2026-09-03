# Repo paths (asset pipeline)

| Concern | Path |
|---------|------|
| Object data | `src/contents/home/data/labObjects.ts` |
| Model registry | `src/contents/home/data/modelRegistry.ts` |
| Station contract | `src/contents/home/types/labStation.ts` |
| Interaction shell | `src/contents/home/laboratory/InteractiveObject.tsx` (**do not change API**) |
| Mesh switch | `src/contents/home/laboratory/PlaceholderObject.tsx` |
| Canvas / scene | `LaboratoryCanvas.tsx`, `LaboratoryScene.tsx` (single Canvas) |
| Chapters / routes | `src/contents/home/data/chapters.ts` |
| Example module | `src/contents/home/laboratory/microscope/` |

## New asset folder pattern

```text
src/contents/home/laboratory/<id>/
  create<Name>Model.ts
  <Name>Model.tsx
  reviewShots.ts      # optional
  reference.png       # optional
```

Register in `MODEL_REGISTRY` and `LAB_OBJECTS`; render from `PlaceholderObject` by `id`.
