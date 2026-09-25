# Team page — source and editing notes

## Source workbook

The supplied workbook `何子濡.xlsx` is read only. The first sheet has the member roster in rows 2–26, headers in row 1, and the responsibility matrix in rows 28–35. The file itself and its contact column are not copied into public assets.

- B: preferred English display name; C: embedded photograph; D: iGEM role; E: group; F: contribution; G: major; H: entry cohort; I: school; J: biography; K: interests; L: fun fact; M: motto.
- Missing preferred English names are transliterated from the supplied Chinese names, in given-name / surname order. These can be replaced by members' preferred spellings later. No fictional English names are assigned.
- The responsibility matrix fills gaps in the upper roster: Wet Lab 11, Dry Lab 6, Art & Design 3, Human Practices 4, Wiki 1.
- Yellow fill `FFFFFF00` at D30, E30 and G30 identifies Lirong Zhang, Yixin Liu and Haibo Li as advisors, separate from the 25 students. D30 and E30 advise Wet Lab; G30 advises Dry Lab.
- Lead assignments come from B29, D29, G29, I29 and K29. A supplied contribution is translated and shortened without adding accomplishments. Existing English biographies remain the member's own text.
- The workbook export keeps the original empty PI record. Verified public information in `mentorProfiles.json` supplies Professor Xianpu Ni's name, portrait and biography when the site renders. This overlay survives re-exporting the workbook. Other unfilled student fields remain empty.

## Photographs

Twelve embedded images are mapped by their drawing anchor to worksheet rows 2, 4, 5, 6, 8, 9, 10, 15, 17, 20, 21 and 24. A visual contact sheet was reviewed before choosing each portrait's `focal` position. Portraits use uniform 3:4 containers with individual object positions; neither faces nor backgrounds are generated or replaced. The originals in the workbook remain unchanged.

`scripts/prepare-team-assets.py` makes EXIF-oriented, metadata-free WebP derivatives and a small thumbnail for each supplied portrait. Pass the source workbook path explicitly. The script does not discover or scan other personal directories. The focal coordinates are deliberately reviewable, rather than dependent on a face detector that might choose the wrong subject.

Group images are sourced only from `docs/references/photos/`: `Art.jpg`, `Dry-Lab.jpg`, `HP.jpg`, `Wet.jpg`, `Team-1.jpg` and `Team-2.jpg`. The whole frame is retained when opening a photo. Group membership comes from the table, not from identifying faces in a group photograph. No event dates or identities are inferred from the pictures.

## Interaction references

- [Codrops — 3D Stack Motion](https://tympanus.net/Development/3DStackMotion/) / [source](https://github.com/codrops/3DStackMotion): scroll-driven transforms, depth, overlapping cards and a rotating stream. Our card coordinates, React lifecycle, adaptive layout and transition into the team photographs are implemented for this site. No demo photographs are reused.
- [Palmer Draggable Grid](https://tympanus.net/Tutorials/PalmerDraggableGrid/) / [source](https://github.com/joffreysp/draggable-grid): staggered portraits, drag inertia and focus on a selected card. Our field repeats the canonical team roster and uses a bounded pool of DOM elements instead of growing a page indefinitely.

The reference repositories carry MIT licenses. The implementation is independently written; no source files or media from either demo are vendored.

### Extended opening

The intro now spans 720svh on desktop and 540svh on mobile. Four interpolated poses reverse horizontal travel at 22%, 45% and 68% of scroll progress while varying roll, slope and depth. Three text beats connect curiosity, connection and collaboration; the final pose opens into the full-team photograph. Twenty-five canonical cards are reused, with no extra portrait downloads. The skip link and complete reduced-motion story remain available.

## Verified mentor enrichment — 7 September 2026

The 2026 advisor assignments remain those in the supplied spreadsheet. The [2025 team page](https://2025.igem.wiki/syphu-china/members) provides historical context: Lirong Zhang and Yixin Liu were Wet Lab members, and Haibo Li was Human Practices Leader. Its separate "Our Advisors" section contains different people and is not used as the 2026 roster.

Four image URLs are taken from the named cards on that page. That Wiki states a CC BY 4.0 content license. Credit and the original profile link are shown on this Team page. Haibo's source image is a cartoon avatar, explicitly labeled as such; no substitute human portrait is inferred.

- [Lirong Zhang portrait](https://static.igem.wiki/teams/5630/team/lirong-zhang-new.webp)
- [Yixin Liu portrait](https://static.igem.wiki/teams/5630/team/yixin-liu.webp)
- [Haibo Li profile avatar](https://static.igem.wiki/teams/5630/team/haibo-li.webp)
- [Xianpu Ni portrait](https://static.igem.wiki/teams/5630/team/xianpuni.webp)

`scripts/prepare-mentor-assets.py` downloads these four explicit URLs and creates local, metadata-free WebP derivatives. Focal framing is reviewed visually. No external image host is needed at runtime.

Current PI credentials are checked against the [School of Life Sciences and Biopharmaceutics profile](https://sls.syphu.edu.cn/info/1111/12513.htm) and [graduate-school research profile](https://grs.syphu.edu.cn/info/1103/9443.htm). Both list Professor and Associate Dean; the older 2025 Wiki's Associate Professor title is superseded. The university sources support the research directions, 2011 PhD/faculty milestone, 2016–17 Freiburg visit, and teaching information. Birth date and personal contact details are not imported.

The inline Selected Work view links three co-authored papers, verified through their publishers or PubMed:

- [GenB3/GenB4 engineering — Microbial Cell Factories, 2025](https://link.springer.com/article/10.1186/s12934-025-02678-0)
- [Combinatorial gentamicin biosynthesis — Frontiers in Pharmacology, 2025](https://www.frontiersin.org/journals/pharmacology/articles/10.3389/fphar.2025.1575840/full)
- [Adaptive drug-releasing contact lens — Journal of Controlled Release, 2024](https://pubmed.ncbi.nlm.nih.gov/38521167/)

Short display titles are editorial summaries; full publication titles are retained beside the DOI links. These are the PI's co-authored publications, not claims of 2026 team achievements. Decorative research diagrams are abstract navigation artwork, not experimental results or chemical structures. No quotations or awards are invented.

## Maintenance

`src/contents/team/teamRoster.json` is the workbook-derived roster; `mentorProfiles.json` contains only verified public mentor enrichment. `teamData.ts` merges them and owns group labels and display order. Update a member once; their intro, gallery, index, group membership and profile update together. Add a portrait with both normal and `-small` WebP derivatives, then set `photo` and visually review `focal`. A deliberate placeholder is preferable to an invented biography or photograph.

The default gallery repeats people spatially; it does not inflate the stated team size. The name index contains every student exactly once. Group photographs, member profiles and full-size photographs use a single view at a time. Vertical touch gestures scroll the page; horizontal gestures explore the gallery. Arrow buttons and the name index provide non-drag alternatives. Reduced-motion preferences replace the animated opening with a static composition and remove inertia.

Run `node scripts/validate-team-data.mjs`, `npm run lint` and `npm run build` after updates.
