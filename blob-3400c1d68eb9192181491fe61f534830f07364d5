# Best Wiki 实施与审核记录

2026-09-06 · SYPHU-China · LBP-MOTOTYPE

本轮目标是让视觉、交互与项目证据形成完整的阅读体验，持续向 Best Wiki 的要求靠近。此记录描述实际已实现的内容，不代表获奖保证。文中相对路径均以当前仓库根目录为准。

## 本轮已实现

- **连续首页故事。** 星场与轨道 → 星轨聚拢、项目名显现与消退 → 数据地球 → 日常与 IBD → 胃肠 → 肠段与肠壁 → 黏膜 → 工程菌、释放与退出 → 校园星球 → 图书馆 → 实验楼 → 实验室。标题遮罩与镜头由滚动驱动，可回退。主标题统一为 Arial 粗体、奶油色填充和细描边，辅助信息保持清楚的深色小字；数据地球与校园建筑使用按住互动、松开回弹；科学剖面保持单击 TAP。
- **星球与校园接地。** 行星位置和轨道使用同一套轨道计算，并加入多个宽高比下的投影间距检查。校园地表改为一张连续球面网格，通过局部调整形成缓坡；取消独立的厚绿色地台，建筑保持自身形状。图书馆与实验楼分别展示，拉回后再转向下一栋建筑。
- **有依据的身体与胃肠展示。** 人体轮廓简化；整体胃肠、逐层剖面与工程菌均使用原创分层 SVG，结合光影、遮罩和镜头运动形成连续的 2D／2.5D 展示。整体、选中肠段和放大结构共享视觉标识，避免每次放大变成另一套对象。解剖关系参考 [NIDDK 消化系统说明](https://www.niddk.nih.gov/health-information/digestive-diseases/digestive-system-how-it-works)及 [OpenStax 小肠与大肠章节](https://openstax.org/books/anatomy-and-physiology/pages/23-5-the-small-and-large-intestines)。既有胃肠、肠壁与工程菌 Blender 文件仍保留用于模型审核和继续优化；不能将当前首页描述成全程 3D 解剖模拟。
- **实验室精修与单层查看。** Blender 导出了连续墙体、墙顶压边和踢脚线，转角使用连续圆弧；超净台补充连续工作腔、下部封板、台面前沿及连接结构。点击设备切换观察视角，显示一份精简说明；切换设备不会叠加多层弹窗。关闭查看回到原视角，实验室滚轮用于缩放。删除 Simple mode 入口；设备能力不足时提供清楚的章节入口。
- **文献墙变成文献画廊。** 采用 CSS 3D 曲面排列、缓动、中心聚焦和循环浏览，借鉴 [Curve Gallery 演示](https://tympanus.net/Tutorials/CurveGallery/)与[公开源代码](https://github.com/gaspoorf/curve-gallery)的空间浏览思路。八篇精选文献循环出现，序号始终对应八条真实记录。六张框展示经核对的真实论文首页，配短标题、作者年份与 DOI；Begley、Simmonds 未取得可用首页，保留明确区分的题名与 DOI 卡。画廊沿闭合起伏曲线移动，以指数缓动呈现近大远小的纵深；不将运动曲线标为科学数据。直接点击文献框或 DOI 即打开原始 DOI；完整标题可在文献索引查看。支持滚轮、拖动、触屏、方向键和 Escape，退出后保留实验室镜头。
- **五个核心证据页面。** Design、Experiments、Model、Results、Safety 已替换原模板说明，共用简洁排版、章节导航与可追溯引用。首页可直接到项目背景、设计与验证安排。Model 提供三个定性信号场景；Results 明确区分文献依据、设计假说和待补充的本队实验结果。

## 数据与科学表达的边界

### 本次小范围精修

保留既有配色、字体、叙事顺序与实验室布局，仅修正下列细节：

- 地球、图书馆与实验楼改为按住观察、松开恢复。地球放大并持续旋转，建筑轻微改变观察角度并展开校园照片。鼠标移出后松开、触摸取消、键盘松开及页面失焦均结束互动；肠道与机制仍为单击。
- 食管、胃贲门、胃体和十二指肠起始段使用连续轮廓；结肠剖面补充结肠袋外观、沿管壁展开的观察窗口和简短的腔／黏膜标识，移除左上角小缩略图。
- 文献沿闭合起伏曲线循环移动。六篇提供真实论文第一页，原始 PDF、版本和页码记录在 `public/assets/laboratory/literature/preview-sources.json`。两篇尚无可用首页的文献保留题名与 DOI，未伪造页面。
- 校徽、队伍与项目标识分别按有效非透明区域取景、保留纵横比，再统一可见图案高度；原始图片不受损。

首帧地球曾在等待地图文件及现场网格细分时为空。基准检查发现，旧算法的单年份网格约含 736 万个非索引顶点，两年份计算在本机耗时约 8 秒；因此不能简单归因于网络。现在离线生成共享索引网格，两年高度使用平滑插值。陆地顶点降为 185,668 个，保留来源地图的海岸点；压缩网格约 2.05 MB。首帧先呈现内嵌世界轮廓，精细数据失败时仍保留这颗地球。

再生成网格使用 `node scripts/build-globe-geometry.mjs`，输入为 `public/assets/cosmic/ibd-regions.json`，输出为同目录的 manifest／二进制文件以及 `globePreviewData.ts`。这一步在修改地理数据时运行，不在浏览器中执行。`outputs/globe-geometry-benchmark.json` 记录网格规模；本机测量不等于所有设备的实际帧率。

数据地球保持真实世界轮廓，使用 1990／2019 年的 GBD **区域年龄标化患病率**，单位为每十万人。图形表达的是区域统计，不是逐国测量，也不是患者密度。数据依据为 [BMJ Open 研究](https://doi.org/10.1136/bmjopen-2022-065186)，地理轮廓来自 [Natural Earth](https://www.naturalearthdata.com/downloads/50m-cultural-vectors/50m-admin-0-countries-2/)。

项目内容依据用户指定的 VER16.9；提取文本为 `outputs/story-sources/project-ver16.9.txt`。网站明确区分：ROS／pKatG／OxyR 控制 PspA；Elafin 与 sfGFP 属于另设的组成型表达安排，不能画成 ROS 直接打开治疗蛋白。mCherry 不是 PspA 绝对含量，sfGFP 释放量也不等同于 Elafin 生物活性。

释放粒子、信号变化及三种 Model 场景属于机制示意，未冒充拟合结果或实测时间曲线。VER16.9 中循环阶段与退出阶段的 H 规则仍需统一，页面保留这一待确认点。本队原始数据与分析图尚未在 Results 建立完整证据链；当前页面不声称“零逃逸”“完全清除”或已证明临床疗效。

文献画廊保留项目书参考编号，并已补齐三条原先仅指向 PubMed 的 DOI：[Begley 2005](https://doi.org/10.1016/j.femsre.2004.09.003)、[Andersen 1998](https://doi.org/10.1128/AEM.64.6.2240-2246.1998)、[Simmonds 1992](<https://doi.org/10.1016/0016-5085(92)91112-h>)。Hoffmann 的酵母生物封闭研究作为设计参考，不当作本项目 EcN 的验证结果。

## 实际参考与取舍

[The Monolith Project](https://themonolithproject.net/)用于研究短句、留白、轮廓字体和滚动叙事；[Bruno Simon 的公开仓库](https://github.com/brunosimon/folio-2025)用于研究对象交互、镜头状态和 Blender 到网页的资源组织。当前实现使用本项目自己的场景与资料，未整站照搬这些作品。奖项方向以 [iGEM 官方 Special Prizes](https://competition.igem.org/judging/special-prizes)及[历年 Best Wiki 结果入口](https://competition.igem.org/results/2025?tab=special-prizes#best-wiki)为核对入口；精致的首页仍需可靠的科研内容、完整导航、可访问性和性能支撑。

## 核验与审核文件

最终整合回归还验证了：TAP 与键盘切换、数据年份切换、标题遮罩反向复原、详情页返回实验室、直接访问 `/#laboratory`、刷新后实验室定位，以及重播清除实验室定位链接。

本次精修另以独立浏览器检查了几何下载中断、HTTP 200 错误 HTML、截断二进制三种回退；均保留可见的首帧地球。原始 gzip 与服务器自动解压两种响应均可加载完整模型。按住后的实际缩放、旋转和松开恢复，以及鼠标移出、键盘和触摸取消均通过；桌面与移动端无横向溢出，记录见 `outputs/refinement-review/verification.json`。

已完成构建、文献循环与链接映射检查，以及五个核心页面的路由、引用锚点、模型选项和移动端溢出检查。现有集成报告的 errors 数组均为空：`outputs/best-wiki-review/review.json`、`outputs/lab-focus-review/verification.json`。后者记录了设备切换、单层说明、滚轮缩放、画廊滚轮隔离、镜头恢复及移动端缩放窗口时画廊持续打开。它们是已采样场景的验证记录，不是对所有设备或所有中间帧的保证。

在仓库中可复现：

```text
npm run build
npm run lint
npm run test:layout
node scripts/check-orbital-clearance.mjs
node scripts/validate-blender-assets.mjs
node scripts/check-literature-gallery.mjs
node scripts/check-lab-focus.mjs
node scripts/review-best-wiki.mjs
node scripts/check-refinements.mjs
node scripts/check-lab-logos.mjs
```

浏览器检查脚本需要本地预览服务。构建仍存在较大分块提示；后续应结合真实移动设备继续检查加载耗时和帧率。

关键审核材料：

- 首页各阶段：`outputs/best-wiki-review/`；实验室设备近景与移动端：`outputs/lab-focus-review/`。
- 本次首帧预览、地球按住互动、校园近景与解剖精修：`outputs/refinement-review/`；三标识对照：`outputs/lab-logo-review/`。
- 文献墙：`outputs/gallery-review/gallery-desktop.png`、`gallery-mobile.png`、`gallery-index.png`。
- 五页排版：`outputs/evidence-review/`，包含桌面五页及 `design-mobile.png`。
- 墙体源模型：`outputs/blender/laboratory-shell.blend`；网页模型：`public/assets/models/laboratory-shell.glb`；渲染审核：`outputs/blender/laboratory-shell-front-corner.png` 和 `laboratory-shell-rear-corner.png`。
- 超净台源模型：`outputs/blender/clean-bench.blend`；网页模型：`public/assets/models/clean-bench.glb`；连接细节：`outputs/blender/clean-bench-chamber-junction.png`。墙体 JSON 记录的三个连续部件均为零非流形边，此项不替代视觉检查。

本轮完成的是上述已核验范围；后续仍需团队补齐真实实验数据、结果图、审批与材料记录，审阅其余专题页内容，并完成上线前全站检查。Best Wiki 是持续审核和完善的目标。
