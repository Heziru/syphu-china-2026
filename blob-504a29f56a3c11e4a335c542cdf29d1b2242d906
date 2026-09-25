# Researcher reconstruction

Reference: `docs/references/people.png`. The editable factory is `researcherGeometry.ts`; the original public import is preserved. This is a static stylised approximation, not a scanned mesh or a rigged character.

The model has a continuous head, scalp shell, swept bangs, bun, glasses, eyes and smile; open coat, lapels, pockets, sleeves, hands, trousers, shoes and clipboard. Own left is +X. Height is 1.7 scene units; bounds are approximately 0.602 × 1.700 × 0.435. It has 26,420 triangles and 73 meshes before render batching.

Continuation fixes correct the swept hair/sleeve winding, remove thin lapel bevel overlaps and relax the bent sleeve curve. Finite coordinates, bounds, floor contact and raycasting checks pass. Front, side and rear browser views have been inspected.

The img2threejs quality workflow is **not fully certified**. Its self-intersection diagnostic still flags two inner-coat shoulder samples and six bent-sleeve samples. These remain unresolved rather than being labelled a pass. Fine folds, hand anatomy and sleeve/shoulder junctions remain approximations. No animation-ready claim is made. Local outputs/researcher folders retain the captures and diagnostic evidence for further refinement.
