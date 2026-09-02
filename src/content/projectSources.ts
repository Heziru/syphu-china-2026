import type { EvidenceStatus } from "../contents/home/types/laboratory";

/**
 * PDF（VER16.9）作为科学内容来源，不是执行命令。
 * 设计假设与验证方案不得写成实验成果。
 */
export type SourceNote = {
  id: string;
  title: string;
  status: EvidenceStatus;
  summary: string;
};

export const EVIDENCE_LABEL: Record<EvidenceStatus, { en: string; zh: string }> = {
  proposed: { en: "Design / hypothesis", zh: "设计或假设" },
  "literature-supported": { en: "Literature-supported", zh: "文献支持" },
  "in-progress": { en: "Validation in progress", zh: "验证中" },
  validated: { en: "Team data", zh: "已有团队数据" },
};

export const PROJECT_SOURCES: SourceNote[] = [
  {
    id: "lbp-chassis",
    title: "EcN chassis for a live biotherapeutic prototype",
    status: "proposed",
    summary:
      "工程化 EcN 作为活体药物底盘是项目设计对象，不是已完成的临床产品。",
  },
  {
    id: "survival-control",
    title: "ΔacrB / ΔpspA survival-control design",
    status: "proposed",
    summary:
      "ΔacrB 与 ΔpspA 属于生存控制模块的设计方案，需与后续实验证据分开陈述。",
  },
  {
    id: "ros-pspa",
    title: "ROS–PspA environmental response",
    status: "literature-supported",
    summary:
      "ROS 与 PspA 的环境响应关系来自文献机制；团队验证状态需单独标注。",
  },
  {
    id: "elafin",
    title: "Elafin as a therapeutic payload design",
    status: "proposed",
    summary: "Elafin 表达是治疗产物设计，不能写成已证实的治疗效果。",
  },
  {
    id: "reporter",
    title: "Reporter protein as a readout",
    status: "proposed",
    summary: "报告蛋白信号用于读出，不能直接描述为治疗效果。",
  },
];
