import type { ChapterDef, ChapterId } from "../types/laboratory";

/** 章节路由独立配置，物件与降级页都引用这里。 */
export const CHAPTERS: Record<ChapterId, ChapterDef> = {
  model: {
    id: "model",
    path: "/model",
    name: "Dry Lab",
    nameZh: "计算建模",
    summary: "模型框架、变量关系与结果解释。",
  },
  experiments: {
    id: "experiments",
    path: "/experiments",
    name: "Wet Lab",
    nameZh: "实验设计",
    summary: "实验设计、方法与验证进展。",
  },
  team: {
    id: "team",
    path: "/team",
    name: "Team",
    nameZh: "团队",
    summary: "成员分工，并链接 Attributions。",
  },
  "human-practices": {
    id: "human-practices",
    path: "/human-practices",
    name: "Human Practices",
    nameZh: "人文实践",
    summary: "问题调研、利益相关者反馈与设计影响。",
  },
  description: {
    id: "description",
    path: "/description",
    name: "Project",
    nameZh: "项目总览",
    summary: "项目概述，并链接 Design、Engineering、Results 与 Safety。",
  },
};

export const CHAPTER_LIST = Object.values(CHAPTERS);
