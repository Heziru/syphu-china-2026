---
name: img2threejs-lab-workflow
description: >-
  Builds modular laboratory 3D props from reference images into React Three Fiber
  components for the SYPHU-China 2026 iGEM Interactive 3D Wiki home lab. Use when
  the user mentions img2threejs, image to threejs, generate 3D object, create
  laboratory model, create GLTF/GLB object, Three.js model, React Three Fiber
  object, interactive laboratory object, microscope model, computer model, or
  bioreactor model; also when manually invoked for lab prop sculpting.
---

# img2threejs Lab Workflow

Project skill for SYPHU-China 2026 iGEM Interactive 3D Wiki home laboratory construction.

## Purpose

- 根据参考图片生成实验室 3D 物件
- 将物件拆分为适合 Three.js 的模块
- 生成 React Three Fiber 可用组件
- 保留 InteractiveObject 点击系统
- 用于 SYPHU-China 2026 iGEM Interactive 3D Wiki 首页实验室建设

## Pipeline

```text
Reference Image
↓
Object Analysis
↓
Structure Decomposition
↓
Three.js Component Generation
↓
React Three Fiber Integration
↓
Interactive Wiki Object
```

## Hard constraints

- 不假设 img2threejs 已安装，使用前先检查环境。
- 不生成一个巨大不可维护的完整实验室模型。
- 优先拆分为独立物件。
- 每次只精修一个主要设备。
- 必须考虑正面、侧面、背面结构。
- 必须保留 object id，方便点击交互。
- 生成物件必须能接入现有 React Three Fiber Canvas。
- 保持与 iGEM Wiki 风格一致：
  - warm cartoon laboratory
  - low-poly / stylized 3D
  - clean scientific atmosphere
- 避免：
  - cyberpunk
  - neon
  - excessive realism
  - unnecessary geometry complexity

## Acceptance criteria

生成的物件必须满足：

1. 视觉上接近参考图
2. 结构上可建模
3. WebGL性能可接受
4. 可以作为 InteractiveObject 使用
5. 可以未来替换为 GLB/GLTF 模型

## Workflow

Copy and track:

```text
Task Progress:
- [ ] 0. Check img2threejs environment
- [ ] 1. Analyze reference image
- [ ] 2. Decompose into parts
- [ ] 3. Generate modular Three.js factory
- [ ] 4. Wrap as R3F component
- [ ] 5. Wire InteractiveObject / LabObjectDef
- [ ] 6. Front / side / back visual review
- [ ] 7. Report tris / materials / FPS; build check
```

### 0. Check img2threejs environment

Before any forge call:

1. Look for installed skill under project / user skill roots (`img2threejs`, `SKILL.md`, `forge/`).
2. If missing: say clearly it is not installed; do **not** pretend to call `forge/next.py`.
3. If present: read its `SKILL.md` and follow that pipeline for analysis/spec/passes.
4. Either way, still obey this skill's hard constraints and repo integration.

### 1–2. Analyze and decompose

- Identify silhouette, proportions, materials, identity-defining parts.
- Split into named modules (base, arm, stage, knobs, …) — one station, not the whole room.
- Note what the single view hides; verify side and back later.

### 3–4. Generate and integrate

- Prefer a code factory that returns `THREE.Group` + stats, then a thin R3F `<primitive>` wrapper.
- Design the wrapper so a future GLB/GLTF path can replace the procedural mesh without changing `id` / hitbox / camera.
- Hook into the **existing** Canvas only — no second renderer or camera system.

Repo paths and wiring: [repo-integration.md](repo-integration.md).

### 5–7. Interaction and acceptance

- Keep / assign stable `LabObjectDef.id`; do not break click → chapter navigation.
- Review at reference angle plus side and back (`?labReview=<id>` when available).
- Report triangle count, material count, meshes, FPS, draw calls.
- `npm run build` pass ≠ visual acceptance. Fix silhouette/proportions before starting another device.

## Style target

Warm cartoon laboratory, low-poly / stylized, clean scientific atmosphere. Prefer readable forms over dense CAD detail.
