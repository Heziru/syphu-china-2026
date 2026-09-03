# Lab asset status

SYPHU-China 2026 Interactive 3D Wiki — production board.
Update this file after Phase 6 Acceptance for each asset.

## completed

- microscope
- computer

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

## pending

- bioreactor
- researcher
- bookshelf

## notes

- Scene id for bioreactor / prototype station is currently `device` in `LAB_OBJECTS`.
- Microscope: procedural `concept` style shipped; visual polish may continue under the same id.
- Never mark complete without review evidence (tris/materials + 3/4/side/back).
