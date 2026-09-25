# Homepage revision 2 — 2026-09-05

This revision implements the requested cartoon-planet sequence and progressively repairs the existing laboratory. It remains a review build; facade dimensions and unobserved elevations are stylized approximations.

## Review route

1. The main mint-colored fictional planet is present from the first frame, among pastel orbit lines. No geographic Earth texture is used.
2. Scroll to the library, approach and hold to inspect, retreat to the wide view, then rotate in the screen plane. The library leaves the frame before the research building enters. Repeat the approach for the research building.
3. Continue or choose Skip. The laboratory docks: wheel events now zoom the room, with no return to the opening. The small replay arrow is the explicit way to replay the opening.
4. Project approaches the workstation and opens the mechanism viewer. Return to laboratory restores the camera and equipment exploration; Design / Experiments / Model / Results / Safety appear below.
5. Equipment opens a compact picker; clicking objects still opens their inspection views. Display options are under the ellipsis.

## Geometry and rendering

- Both campus sites are deformed onto the same spherical surface, including steps, paths and vegetation. Wide meshes are subdivided so roofs, walls and windows remain aligned after deformation. There is no detached site slab or globe overlay ring.
- The library dome and spire have been adjusted. The research building retains the four reference-based raised towers and cream facade bands.
- Clean bench revision 8: thick side shells, control backing, aligned front slope, opening returns, outward-facing top/back/side-cap faces, connected interior liners and worktop, continuous ribbed exhaust, supported underframe, and grounded casters.
- White/sage materials, more neutral lighting and antialiasing carry the exterior palette into the room. The existing room arrangement and other established models are retained.

## Reference investigation

- User library illustration: docs/references/school.jpg.
- University library: https://www.syphu.edu.cn/info/1065/5044.htm
- University laboratory: https://www.syphu.edu.cn/info/1065/5045.htm
- Animation reference: https://themonolithproject.net/
- Public frontend inspected: https://themonolithproject.net/assets/index-Dqw2FXdk.js

The reference's interactive page timed out in the available browser. I did not visually verify every animation frame. The accessible frontend confirms that its SceneMonolith uses three eased camera intervals, Z-axis rotation during the middle interval, small pointer-driven view offsets, banded lighting, outlines and atmospheric particles. The supplied screenshots establish the soft illustrated appearance. This implementation adapts those motion principles; it does not reuse the site's code, models or artwork.

## Remaining limits

- The exterior-to-lab transition uses zoom and crossfade. The mechanism viewer uses a centered screen-style expansion/contraction, without exact monitor-corner registration.
- Scientific states are mechanism schematics and design hypotheses. The animation does not establish treatment efficacy, release quantities or clearance times.
- Design links to the existing Description page.
- The pre-existing .img2threejs/school production fidelity checklist remains incomplete; this revision does not claim final reference fidelity.

## Verification

- TypeScript/Vite build, ESLint, existing room layout regression checks.
- scripts/validate-journey.mjs checks continuous transforms over four aspect ratios, exclusive building visibility, spherical ground contact, and the repaired hood shell and chamber joins.
- Browser review covers the orbit opening, both building approaches, lab wheel zoom, project return, restored equipment controls and narrow-screen framing.
