# 实验室首页：布局与渲染维护

本轮参考 `docs/references/iGEM Lab.png` 的暖白、鼠尾草绿、木质点缀、深色台面和柔和日光。空间分区遵循已有布局方案：左斜墙 Dry Lab、后墙左侧 Wet Lab、后墙中央 Storage、后墙右侧 Engineering、中央岛台和前部研究员。参考图用于风格，不替换为二维背景，也不改变既有章节路由。

## 单一布局来源

- `src/contents/home/laboratory/layoutMath.ts`：房间六边形边界、墙面锚点、局部到世界坐标、带高度的碰撞校验、实际边缘距离、通道校验。尺寸始终为 `[width, height, depth]`，原点位于对象底部。
- `roomPlacement.ts`：六个分组坐标系、25 个主要家具/仪器的尺寸和局部坐标、安装高度、座椅间距、交互映射。修改布置首先改这里。
- `roomComposition.tsx`：按分组渲染布局数据，不另算世界坐标。
- `data/labObjects.ts`：交互区域和特写相机由同一布局派生，保留原对象 ID 与章节目标。
- `ModelAsset.tsx`：将已有模型按比例装入预留空间，统一底部接触面。独立模型审阅模式仍可使用。

墙面锚点包含半墙厚和内侧间隙；两只储物柜使用连续排布而不是互相独立的百分比定位。台面设备的底部直接引用支撑台面高度。电脑不再额外带一层桌板，超净台已移到右侧，使用完整自带底架独立落地，反应器仍为落地设备。

## 继续细化模型

家具的柜体、门板、抽屉、把手、脚座和台面由 `labFurnitureSystem.tsx` 独立构成；中央台面细节在 `CentralBench.tsx`。植物、试管架、培养皿、实验凳在 `RoomAccents.tsx`。反应器容器、支架、管道和控制器在 `FloorBioreactor.tsx`。

模型细化时保留预留尺寸和底部原点约定。改变尺寸或座椅位置后运行布局校验，不能只把碰撞框缩小来隐藏重叠。当前自动校验覆盖主要家具/仪器及通道；小型台面装饰仍需截图检查。

`StaticBatch.tsx` 只合并运行时的静态不透明网格，不删除建模源节点；透明玻璃独立绘制，交互命中框仍在外层。后续增加活动抽屉、机械动画时，应把活动部分移出静态合并，并让其阴影重新更新。

## 风格和性能

- `labPalette.ts`：主要颜色。
- `Lighting.tsx` / `SceneEnvironment.tsx`：日光、环境反射、静态阴影；不请求远程 HDR。
- `RoomShell.tsx` / `roomSurfaces.ts`：开口窗、百叶、低前墙、连续房间轮廓和本地生成的石材纹理。
- `data/cameraPresets.ts`：根据房间边界和视口宽高比计算概览相机，手机不会硬套桌面距离。

开发页面可加 `?labLayoutDebug=1` 显示主要占位和通道。开发版 Canvas 的 `data-layout-report` 保存布局结果和实际模型尺寸；`data-render-stats` 保存有限帧采样。生产版不会产生这些调试信息。

桌面浏览器验证：优化后采样约 374 draw calls、519,672 triangles，25 FPS；该数值只反映本次测试设备和环境，不是手机性能保证。场景仍有约 1.07 MB 的 JS 分块，Vite 会提示大于 500 kB。

## 检查命令

```sh
npm run test:layout
npm run build
npm run lint
```

布局测试覆盖墙端点反转、台面支撑接触、旋转包围盒、柜体重叠、边界、最小间距、四张座椅与通道占用。另检查桌面/375px 画面、场景点击、章节入口、离开后返回 Home，避免只验证 TypeScript。

## 设备扩充与穿模回归

窗台的开口尺寸和伸出深度统一由 `roomPlacement.ts` 的 `WINDOW_OPENING` 定义，`WINDOW_SILL` 参与碰撞检查；Dry Lab 整组保持相同局部坐标关系，电脑在桌内向前留出间距。测试同时复现旧电脑碰窗台并确认当前布置无碰撞。

`LabEquipment.tsx` 提供离心机、超声破碎仪、摇床、冰箱、液氮罐、衣架、悬挂白大褂、烧杯和量筒。新增独立设备经 `ModelAsset` 统一归一化底部与预留包围盒。前方通道不摆设备，右侧服务区设备略转向室内，保持正面可读。

## Lived-in lab and close-up inspection

Right-wall equipment faces its working aisle (-X), not the overview camera. The new left preparation bench, analytical balance, supply trolley, duplicate tip boxes, pipettes, stacked reagent kits, bottles and racks enrich each workstation without expanding the room or occupying the main circulation lanes.

Visual inventory sources, not operating protocols:

- https://www.addgene.org/protocols/pipetting/
- https://www.thermofisher.com/uk/en/home/life-science/lab-plasticware-supplies/lab-organization-cleaning-safety/lab-organization-supplies.html

An entrance low wall carries the iGEM Lab sign, with plants and supplies behind it. The original logo is copied byte-for-byte to public/assets/laboratory/project-logo.png, displayed at its native 971:874 ratio on a rear-wall plaque; no cropping, tinting or artwork editing.

Equipment metadata lives in data/equipmentDetails.ts. Close-up cameras derive from the same furniture transform. The interaction is idle -> focusing -> inspecting -> returning -> idle. A compact translucent native dialog contains keyboard focus and supports Escape. Chapter navigation requires an explicit button. A small equipment selector supplies keyboard access. Reduced motion skips the camera tween. Closing restores the overview; effect cleanup kills camera tweens.

Collision validation covers major furniture, devices and the window sill. Small decorative vessels are visually checked, not individually certified by the layout validator. See researcher-rebuild.md for character fidelity limitations.

## Project literature wall

Three portrait shadow-box frames on the right wall reproduce complete first pages from papers cited in the project proposal. Each frame participates in the same close-up camera flow as laboratory equipment; its detail panel carries an explicit DOI link rather than making the whole 3D surface an external navigation target.

- Rubens, Selvaggio & Lu (2016), _Synthetic mixed-signal computation in living cells_, https://doi.org/10.1038/ncomms11658 — CC BY 4.0.
- Wang et al. (2021), _Active maintenance of proton motive force mediates starvation-induced bacterial antibiotic tolerance in Escherichia coli_, https://doi.org/10.1038/s42003-021-02612-1 — CC BY 4.0.
- Teng et al. (2022), _Probiotic Escherichia coli Nissle 1917 Expressing Elafin Protects Against Inflammation and Restores the Gut Microbiota_, https://doi.org/10.3389/fmicb.2022.819336 — CC BY 4.0.

The displayed WebP files are reduced-resolution first-page reproductions for identification and citation. Their portrait aspect is preserved; no page content is cropped or rewritten.
