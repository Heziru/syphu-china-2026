# Lab asset status

SYPHU-China 2026 Interactive 3D Wiki — production board.
Update this file after Phase 6 Acceptance for each asset.

## completed

- microscope
- computer
- bioreactor

### computer (approved)

| field | value |
| --- | --- |
| id | computer |
| route | /model |
| category | workstation |
| revision | 6 |
| status | approved |
| tris | 2132 |
| materials | 6 |
| meshes | 34 |
| FPS | 61 |

Accepted design decisions (Phase 6):

- Simplified solid key deck (hero viewing distance; laptop silhouette first).
- Monitor teal biological network + laptop coral data marks (Dry Lab biological computation identity; not code-UI glyphs).
- No mug / notepad / pencil / chair (keep hero asset uncluttered).

Production wiring: `PlaceholderObject` → `ComputerModel` → `InteractiveObject` → `/model`.
Review remains available at `?labReview=computer` (does not block production).

### bioreactor (approved)

| field | value |
| --- | --- |
| id | bioreactor |
| runtime | device |
| route | /description |
| category | device |
| revision | 6 |
| status | approved |
| tris | 1140 |
| materials | 6 |
| meshes | 30 |
| FPS | 61 |
| draw calls | 60 |

Accepted design decisions (Phase 6):

- BioFlo 类 benchtop controller silhouette
- white rounded industrial shell
- top screen + vertical three blue pumps
- side ports retained
- low-poly warm cartoon style
- no branding / no readable text
- procedural model preferred over external GLB

Phase 5.3 review evidence: 3/4 + side + back; Silhouette 8/10, Functional identity 8/10, Industrial feel 8/10.

Production wiring: `device` → `InteractiveObject` → `PlaceholderObject` → `BioreactorModel` → `/description`.
Review remains available at `?labReview=bioreactor` (does not block production).

## pending

- researcher
- bookshelf

## notes

- Scene id for bioreactor / prototype station is `device` in `LAB_OBJECTS` (design asset: bioreactor).
- Microscope: procedural `concept` style shipped; visual polish may continue under the same id.
- Never mark complete without review evidence (tris/materials + 3/4/side/back).
