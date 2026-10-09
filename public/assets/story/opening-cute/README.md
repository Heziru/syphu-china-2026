# Approved cute opening assets

Created with the built-in Image tool on 2026-09-30, using the user-approved two-panel preview as style reference. Each PNG has genuine transparent alpha; no website copy or navigation is baked into an image.

- earth.png: standalone complete mint-and-cream illustrated globe, 1254 × 1254.
- orbital-accents.png: separate tilted gold orbit with a yellow moon and peach ringed planet, 1659 × 948.
- nebula.png: translucent sage-teal wisps and fine stardust, 1659 × 948.

## Prompt set

Earth: Extract/recreate only the complete Earth from the approved upper-panel mockup. Rounded painted illustration, mint/teal oceans, cream/sage continents, curled ivory clouds, restrained luminous rim. Match the Americas, Europe and Africa view. Transparent square cutout with safe margin; no planets, orbit, stars, text, UI, or opaque background.

Orbital accents: Separate transparent wide accent layer matching the approved mockup. A fine tilted gold orbital ellipse, loosely spaced luminous beads, small buttery-yellow moon on the left and peach ringed planet on the right. Sparse miniature four-point stars. Keep the central area empty for the separately rendered Earth. No Earth, text, UI, fog, or background.

Nebula: A separate wide translucent sage-teal atmospheric wisp with fine pale gold stardust. Soft painted lower-corner wisps and diagonal visual flow; center mostly empty. Fade alpha at the edges. No planets, orbit lines, text, UI, or opaque background.

## Implementation

GalaxyOpening renders images as separate layers and live HTML text. The Earth moves as a whole into the cream world view. At story progress .153–.174 it hands off to the original Three.js data globe; the actual regional data, heat colors, relief, year interpolation, and source remain intact. Generated artwork is decorative and never encodes the heatmap. The year transition interpolates 1990 and 2019 endpoints, not annual measurements.

Nunito is self-hosted in assets/fonts with its SIL OFL license. The existing deployment base is respected through assetUrl and Vite's font URL resolution. The static/reduced-motion branch uses separate static views, with no drift animation.
