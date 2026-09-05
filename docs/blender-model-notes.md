# Blender 模型与本轮审核说明

本轮实际调用本机 `D:/blender.exe`（Blender 5.2.1 LTS），生成六个模型、六份可编辑 `.blend` 文件、六个网页 `.glb` 资产及十二张 Cycles 渲染图。每个模型提供正面和三分之四视角；网页采用同一几何资产和较轻的实时光照。

## 查看与重新生成

- 网页：http://127.0.0.1:5174/syphu-china/
- Blender 源文件、渲染图及部件清单：`outputs/blender/`
- 网页资产：`public/assets/models/`
- 生成脚本：`scripts/blender/build_review_assets.py`

在项目根目录运行 PowerShell：

```powershell
& 'D:/blender.exe' --background --factory-startup --python scripts/blender/build_review_assets.py
```

只重新生成指定模型时，在命令末尾追加 `-- library`、`-- clean-bench` 等模型名称。脚本仅向本项目的资产与输出目录写入文件；不会修改 Blender 用户配置。完整重建会覆盖上述同名生成文件。

## 六个模型的设计依据

1. **library**：以提供的 `docs/references/school.jpg` 为立面依据，保留对称红墙、米色线脚、柱廊、三角山花、三联拱窗、中央穹顶与尖顶。补足窗框、窗台、栏杆、柱头、入口踏步和两侧阶梯挡墙。建筑背面与进深为风格化补全，未声称实测复原。网页把完整地块细分后贴合球面；建筑、入口及步道共用一个中心轴，避免各自弯曲造成错位。
2. **research-building**：保留现有南校区实验楼的卡通表达，补足塔柱、层间线脚、窗框、门把手、入口雨棚和五级踏步。外观比例用于校园叙事，未把装饰布局当作校园测绘结果。
3. **digestive-system**：从食管连续连接胃、十二指肠、小肠及盲肠，结肠依次显示升结肠、横结肠、降结肠、乙状结肠和直肠，盲肠附有阑尾。前视图中升结肠在观众左侧。胃用于建立解剖位置，不表达为项目治疗靶点；肠袢数量、器官尺寸与表面细节经过简化。
4. **colon-section**：纵向打开的结肠壁，切边区分黏膜、黏膜下层及两层肌层。底部放大黏膜隐窝的凹陷开口与浅色杯状细胞；未在结肠上添加小肠绒毛。层厚和隐窝比例为可读性放大，浆膜简化。橙色信号和紫色胆汁酸标记是图例，不是分子结构或浓度数据。
5. **engineered-ecn**：杆状革兰阴性菌剖面区分外膜、薄肽聚糖层与内膜；深色折叠闭合线代表拟核，紫色环代表工程质粒，青色颗粒代表核糖体。内膜附近的紫色符号用于说明 PspA，黄色符号用于说明组成型表达的 Elafin。符号形状、数量及位置均为机制示意，未依据序列生成真实蛋白结构。
6. **clean-bench**：补齐机壳、侧衬、背衬、工作台面密封、后挡边及角部封接；增加过滤器扩散格栅、工作灯、玻璃窗与滑轨、操作键、螺钉、前格栅、支架横梁和脚轮。零件用来说明结构及连接关系；外观模型不代表设备气流性能或认证结论。

## 交互与内容

开场恒星位于轨道中心，校园星球作为独立行星从轨道上出发。轨道和行星中心使用相同椭圆方程。镜头依次靠近校园星球、查看第一栋建筑、退回并沿屏幕平面旋转，再查看第二栋建筑。进入实验室后滚轮继续控制实验室缩放。

项目介绍由屏幕进入，按“消化道位置 → 结肠环境 → 工程菌 → Elafin → 退出过程”推进。小窗口默认折叠，展开后可查看每个部件的用途和解释。退出时先减弱 ROS 图例，再延迟减弱 PspA 图例，最后使菌体表示后退；这些间隔仅为动画时间，未填写未经验证的半衰期、清除率或临床效果。返回实验室后恢复设备探索，并显示 Design、Experiments、Model、Results、Safety 入口。

## 资料

- [NIDDK：消化系统结构与功能](https://www.niddk.nih.gov/health-information/digestive-diseases/digestive-system-how-it-works)
- [NCBI Bookshelf：Gastrointestinal Function](https://www.ncbi.nlm.nih.gov/books/NBK54098/)
- [PspA 相关研究，PMID 19555453](https://pubmed.ncbi.nlm.nih.gov/19555453/)

项目回路内容沿用现有项目叙事；未新增未经项目材料支持的分泌系统、趋化导航或疗效结论。

## 验证

`scripts/validate-blender-assets.mjs` 实际解析六个 GLB，检查几何有效性、部件标记、尺寸及材质合批后的几何保留。`scripts/validate-journey.mjs` 检查轨道约束、镜头连续性、建筑互斥和球面接触。另运行 TypeScript、ESLint、布局校验与生产构建。浏览器检查包含建筑近景、五段项目叙事、展开说明、回到实验室及设备选择。
