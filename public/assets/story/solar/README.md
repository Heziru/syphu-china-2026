# Approved painted solar opening

Integrated on 2026-09-08 after the user explicitly selected the earlier solar color proof.

- `painted-planets.png` is a byte-for-byte copy of `outputs/art-direction-v2/solar-color-proof.png`. SHA-256: `c30f58f34df20609917e866625f967fc7fbc64c29d836e5dbf58f2d478e2d4c4`.
- `paper-stardust.png` was made with the built-in image editing tool, using that proof as the sole reference. The edit removed the sun, six planets, rings and thin orbit strokes; it retained the cream/mint paper, broad stardust ribbons and gold stars for the background layer. Output source: `exec-8b873a7a-c742-43f3-9883-c7a1f343b303.png` in the task's generated-images folder.
- `solarArtwork.ts` records the original pixel windows. The shaders sample these windows onto the visible spherical surfaces; the original bitmap is not cut or overwritten. These are illustrated surfaces, not newly reconstructed physical planet textures.
- The ringed planet uses the unringed lavender surface with a live Three.js ring, avoiding two superimposed rings. The campus globe blends back to its existing material before the buildings come into view.
- All planets and orbit lines retain the existing live positions and Earth transition. The paper backdrop fades out as the Earth chapter begins. Portrait presentation rotates the background plate rather than stretching the drawn stars.

Review: `scripts/review-painted-opening.mjs`; screenshots and verified local asset loads are in `outputs/painted-opening/`.
