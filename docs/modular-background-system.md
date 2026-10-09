# SYPHU-China modular backgrounds

The artwork is assembled from independent transparent PNGs. No section uses an atmospheric poster as its background. SectionDecor owns only decoration; text, primary scientific illustrations, the existing 3D models and the scroll state machine remain separate.

## Home simplification — 28 September

The home page now applies `homeArtDirection.css` on top of this shared system; inner pages retain the fuller arrangements below. Home hides decorative paths, corner stickers and extra organic fields. Only a quiet PNG wash, pale footing and occasional faint cellular accent remain. `storyTypography.css` groups each scene into one heading and one supporting line, removing the duplicate upper-right words and floating scientific thumbnail cards. Full scientific context remains in accessible and reduced-motion reading content.

The opening uses a deep teal field, an independent transparent globe and two small planet cutouts. The visible copy is the project name, one sentence and one entry button. Local Surface keeps the main mucosa and scientist as separate complete images; the duplicate card, extra microbes, leaves and petri dish are no longer rendered there.

Research owns its heading, photo and a single opaque researcher in `ResearchCollage`. Observe / Test are native buttons; they change the image only on user input and preserve the selected activity while scrolling within the chapter. The full-opacity interval is 0.925–0.969 in scene progress. A 0.20 elapsed hold expands the 0.925–0.965 reading interval to approximately 10.5% of the total scroll range, with no timer or scroll lock. The campus camera settles at 0.932 and stays still through 0.965; a 1.45-unit downward offset separates the building from the researcher and caption. Entry and exit stay continuous in both directions.

Product copy now shows the concept heading and a concise qualified statement at each beat. Static mode keeps the fuller explanation. Preview artifacts for this revision are in `outputs/home-direction-review`, `outputs/opening-rework-review`, and `outputs/research-interaction-review`.

## Files and composition

- `src/components/SectionDecor.tsx` selects care, cell, local, research, world, life, product or lab accents.
- `src/components/sectionDecor.css` owns the positions, sizes and breakpoints. `subdued` is for compact illustration vignettes inside text-heavy pages.
- `.decor-blob--upper`, `--side`, `--ground` are restrained CSS organic shapes. Their shared placement connects consecutive sections without adding another large bitmap.
- `.decor-wash` is a transparent organic PNG, confined to one corner or the researcher vignette.
- `.decor-path--upper` is an independent node-arc PNG. `--side` is a thin decorative dashed SVG curve, not a scientific diagram or a route through anatomy.
- `.decor-accent--1` through `--4` are independently placed contextual PNGs. They do not intercept input and have empty alt text inside an `aria-hidden` layer.

## Layer, size and opacity rules

- Parent: positioned container. Cream base `#faf8ef`. Background wrapper z-index 0; the parent's foreground belongs at 1 or above.
- Within the wrapper: organic fields at 0, guide paths at 1, identifiable assets at 2. Typical asset width is 7–15% of the section, with complete subjects rendered using `object-fit: contain`.
- Organic fields use roughly 20–40% opacity; paths 30–55%; PNG accents 45–82%. People remain in the foreground at full opacity except their existing scene entry/exit transitions.
- Campus exception: two foliage accents sit above the existing canvas ground at z-index 3 but below text at 4. This keeps leaves from being hidden by the opaque 3D ground. Their placement avoids the photo and bottom caption.
- There is no random placement or automatic particle field. Accent positions are deliberate per variant.

## Scene layouts

- Research/campus: original single researcher above the building; book at right; small science nodes above it; leaves along the bottom. A pale wash supports the researcher. Title, campus photo and building keep separate areas.
- Local surface: reuse the existing separate mucosal surface, scientist, leaves, microbes and dish. SectionDecor contributes only light fields and guide paths to avoid duplicating those assets. Dense full-frame particle overlay removed.
- Cell: cell trio above the left-to-right reading path; one rod below the central gap, clear of the lower-left caption; small dish on the lower right.
- Care/EcN: book/dish or cell accents around the main original illustration, leaving large text clear.
- Delivery: subdued local atmosphere inside the delivery card; the original capsule motion and calibrated anatomy coordinates are unchanged.
- Product: quiet book, rod and foliage outside the product and narrative columns.
- Opening: GalaxyOpening separately composes a transparent globe, two small planet atlas viewports, sparse orbit guides and pale organic shapes. No full-image star wallpaper. Existing title, CTA and scroll thresholds are unchanged.
- Inner pages: shared Header gets a book and subtle shapes; five evidence pages use compact decorated illustration vignettes away from paragraphs. Team ALL OF US uses the same research visual language, with protected photo/title space.

## Responsive behavior

- Desktop above 1050px: complete purposeful composition, generally 2–4 small accents.
- Tablet 701–1050px: hide accents 3/4; narrow the side path. Portrait campus photo moves upward to avoid the building.
- Phone up to 700px: keep one contextual accent, a short upper node arc and bottom footing. Elements get new positions instead of proportionally shrinking a desktop layout. Local surface hides secondary microbes/dish, preserving the main researcher and leaves.
- Reduced motion: decorative layers are static; existing page reading mode remains available. No internal organ animation or invented anatomical deformation is introduced.

## Assets copied from user outputs

- `16_lab-notebook.png` → `public/assets/story/decor/research-book.png`
- `15_lab-petri-dish.png` → `public/assets/story/decor/culture-dish.png`
- `image-gen-2(7).png` → `public/assets/story/decor/node-arc.png`
- `image-gen-4(7).png` → `public/assets/story/decor/cell-trio.png`
- `image-gen-7(3).png` → `public/assets/story/decor/organic-wash.png`
- `03_world-globe.png` → `public/assets/story/modular/03_world-globe.png`

Existing botanical leaves, microbial rod and the original primary illustrations are reused. Source PNGs and alpha are copied without modification. Assets resolve through `assetUrl` under the configured `/syphu-china/` base.

## New generated asset

`public/assets/story/decor/science-nodes.png` was created with built-in ImageGen, transparent output enabled. It is a decorative connection motif, not a claimed chemical structure. The generator output was copied into the repository unchanged.

Prompt:

> Use case: illustration-story. Asset type: one isolated transparent PNG decorative science node cluster for a soft cream-and-sage educational website. Create a small hand-painted flat editorial illustration: a single off-center pale cream circular node gently connected to three smaller muted sage and pale apricot round nodes by very thin muted green stems. An abstract connection motif, not a particular molecule or chemical formula. Understated botanical softness, delicate sage outlines, subtle opaque pale fills, minimal shading, elegant adult scientific publication illustration. Center the complete compact cluster, generous transparent margin of 12 percent all sides. Palette deep sage #698c76, pale sage #cbd6be, cream #f6f0dc, one pale gold accent #e4c589. Actual alpha transparent background outside the illustration. No paper sheet, no scenery, no whole background, no rectangular backdrop, no text, no letters, no watermark, no large shadow, no glow, no photorealism. Crisp clean cutout edge; must remain recognizable at 80 pixels wide.

## Checking a later edit

Use `npm run build`, the existing timeline validator and browser screenshots at 1440×900, 768×1024 and 390×844. Check full subjects, PNG alpha, negative space around titles/buttons, campus photo/building spacing, and reduced-motion reading mode. Current review artifacts are under `outputs/modular-background-review` and `outputs/inner-decor-review`.
