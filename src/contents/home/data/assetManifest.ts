/** 实验室资源清单。不引用仓库中不存在的 GLB。 */
export const LAB_ASSET_MANIFEST = {
  room: {
    kind: "placeholder" as const,
    note: "房间壳仍为灰模；仅中央实验台进入程序化精修。",
  },
  objects: {
    computer: { kind: "placeholder" as const, note: "灰模对照，尚未精修。" },
    microscope: {
      kind: "placeholder" as const,
      note: "结构清晰的程序化占位：底座、弯臂、双目、转盘、载物台、旋钮、底灯。不是授权 GLB，也不是精细工业模型。",
    },
    researcher: { kind: "placeholder" as const, note: "基础几何体占位，不是角色资产。" },
    bookshelf: { kind: "placeholder" as const, note: "灰模对照，尚未精修。" },
    device: { kind: "placeholder" as const, note: "灰模对照，尚未精修。" },
  },
};

/** 后续正式资产交付清单（当前仓库无 Blender / GLB）。 */
export const MODEL_HANDOFF = [
  {
    id: "microscope",
    format: "GLB",
    style: "cartoon hard-surface",
    triangles: "<12k",
    origin: "底座中心，Y-up，单位米",
    materials: "白壳 / 深灰结构 / 金属旋钮 / 暖色底灯",
    license: "需可放入 iGEM wiki 的授权，避免禁止再分发的资产",
  },
  {
    id: "researcher",
    format: "GLB",
    style: "stylized character",
    triangles: "<15k",
    notes: "白大褂、头发、手臂、自然站姿；与实验室卡通硬表面统一",
  },
  {
    id: "workstation",
    format: "GLB or procedural",
    notes: "显示器支架、键盘、鼠标、主机、少量线缆",
  },
  {
    id: "device",
    format: "GLB",
    notes: "可识别的实验装置结构，避免圆柱+球体",
  },
] as const;

export function resolvePublicAsset(path: string) {
  const base = import.meta.env.BASE_URL.endsWith("/")
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  return `${base}${path.replace(/^\//, "")}`;
}
