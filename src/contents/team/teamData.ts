import roster from "./teamRoster.json";
import mentorProfiles from "./mentorProfiles.json";
import { assetUrl } from "../../utils/assetUrl";

export type GroupId = "wet" | "dry" | "art" | "hp" | "wiki";
export interface TeamPerson {
  id: string;
  name: string;
  number: string;
  kind: "student" | "advisor" | "pi";
  role: string;
  groups: GroupId[];
  photo: string;
  focal: number[];
  bio: string;
  contribution: string;
  major: string;
  cohort: string;
  school: string;
  interests: string;
  funFact: string;
  motto: string;
  photoKind?: "avatar";
  credential?: string;
  previousRole?: string;
  previousYear?: string;
  researchAreas?: string[];
  milestones?: { year: string; title: string; text: string }[];
  sourceLinks?: { label: string; url: string }[];
  imageCredit?: string;
}
export const members = roster.members as TeamPerson[];
// The source workbook remains reproducible; verified public biographies are an overlay.
const mentorDetails = mentorProfiles as Record<string, Partial<TeamPerson>>;
export const advisors = roster.advisors.map((p) => ({
  ...p,
  ...mentorDetails[p.id],
})) as TeamPerson[];
export const principalInvestigator = {
  ...roster.pi,
  ...mentorDetails.pi,
} as TeamPerson;
export const teamAsset = (name: string) => assetUrl(`assets/team/${name}`);
export const groups: {
  id: GroupId;
  name: string;
  short: string;
  line: string;
  photo: string;
  color: string;
}[] = [
  {
    id: "wet",
    name: "Wet Lab",
    short: "Wet Lab",
    line: "Ideas, tested.",
    photo: "wet.webp",
    color: "#a7c4b6",
  },
  {
    id: "dry",
    name: "Dry Lab",
    short: "Dry Lab",
    line: "Patterns, understood.",
    photo: "dry-lab.webp",
    color: "#b3b3d3",
  },
  {
    id: "art",
    name: "Art & Design",
    short: "Art",
    line: "Science, made visible.",
    photo: "art.webp",
    color: "#e7baab",
  },
  {
    id: "hp",
    name: "Human Practices",
    short: "HP",
    line: "Listening comes first.",
    photo: "hp.webp",
    color: "#e7ce93",
  },
  {
    id: "wiki",
    name: "Wiki",
    short: "Wiki",
    line: "A story, brought together.",
    photo: "",
    color: "#a9c8d1",
  },
];
export const groupName = (id: GroupId) =>
  groups.find((g) => g.id === id)?.name ?? "";
export const personLabel = (p: TeamPerson) => p.name || "To be announced";

// One canonical roster drives every repeated visual instance.
export const galleryOrder = [
  0, 1, 2, 5, 3, 9, 4, 10, 6, 11, 7, 12, 8, 14, 13, 16, 15, 17, 18, 20, 19, 21,
  22, 23, 24,
].map((i) => members[i]);
