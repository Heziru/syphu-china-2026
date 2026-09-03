---
name: lab-asset-production-pipeline
description: >-
  Manages the full laboratory asset production pipeline for the SYPHU-China 2026
  iGEM Interactive 3D Wiki—from concept-art analysis through procedural Three.js
  models, R3F integration, review, optimization, and registry updates. Use when
  the user mentions create next laboratory asset, generate next 3D object,
  continue laboratory modeling, optimize laboratory scene, add new interactive
  object, or build next iGEM wiki asset; also when sequencing multiple lab
  stations after the microscope.
---

# Lab Asset Production Pipeline

管理 SYPHU-China 2026 iGEM Interactive 3D Wiki 的完整实验室资产生产流程。

## Goal

从实验室概念图开始，自动拆分所有可交互物件，并按照统一流程完成：

```text
Reference Analysis
↓
Asset Specification
↓
Implementation Plan
↓
Three.js Procedural Model
↓
React Three Fiber Integration
↓
Review
↓
Optimization
↓
Registry Update
```

## Applies to

- microscope
- computer
- bioreactor
- researcher
- bookshelf
- experimental equipment
- environment props

## Work rules

1. 不一次生成整个实验室。

2. 永远一次处理一个 asset。

3. 每个 asset 必须经过：

Phase 1:
Reference analysis

Phase 2:
Design specification

Phase 3:
File modification plan

Phase 4:
Implementation

Phase 5:
Review

Phase 6:
Acceptance

4. 所有 asset 必须：

- 有唯一 id
- 接入 LAB_OBJECTS
- 接入 modelRegistry
- 支持 InteractiveObject
- 支持 future GLB replacement

5. 保持统一视觉：

- warm cartoon laboratory
- low poly stylized 3D
- rounded shapes
- semi matte materials

6. 性能标准：

单 asset:
- tris < 25000
- materials <= 6

整体场景：
- 控制 draw calls
- 避免重复 geometry

7. 验收完成后：

自动更新：

[asset-status.md](asset-status.md)

记录：

completed:
- microscope

pending:
- computer
- bioreactor
- researcher
- bookshelf

8. 禁止：

- 修改 InteractiveObject API
- 创建第二 Canvas
- 创建第二套 camera
- 破坏现有 registry 架构

## Phase checklist

Copy and track **one** asset at a time:

```text
Asset: <id>
- [ ] Phase 1 Reference analysis
- [ ] Phase 2 Design specification (no code yet)
- [ ] Phase 3 File modification plan (no code yet)
- [ ] Phase 4 Implementation
- [ ] Phase 5 Review (?labReview=<id>, 3/4 + side + back; report gaps only first)
- [ ] Phase 6 Acceptance + update asset-status.md
```

Stop at phase boundaries when the user asks for plan-only or review-only.

## Implementation notes

- Prefer modular factories under `src/contents/home/laboratory/<id>/`.
- Wire meshes via `PlaceholderObject` / `modelRegistry`; keep `InteractiveObject` untouched.
- `metadata.route` must match `CHAPTERS[chapterId].path`.
- For image→procedural sculpt details, also follow [img2threejs-lab-workflow](../img2threejs-lab-workflow/SKILL.md).
- Repo paths and GLB swap: [repo-paths.md](repo-paths.md).

## After acceptance

1. Mark the asset under `completed` in [asset-status.md](asset-status.md).
2. Remove it from `pending` (or leave notes if polish remains).
3. Do **not** start the next asset until the user confirms.
