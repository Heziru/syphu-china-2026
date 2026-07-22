export const heroCopy = {
  title: "LBP-Mototype",
  persistence:
    "A decision does not take shape at once.\nOnly what is sustained can become real.",
} as const;

export const sceneCopy = {
  challenge: {
    title: "IBD is not a single target.",
    subtitle: "It is a changing inflammatory environment.",
    words: ["INFLAMMATION", "BARRIER", "MICROENVIRONMENT"] as const,
  },
  living: {
    title: "EcN becomes a living interface.",
    subtitle: "Not merely a carrier, but a platform that acts within the gut.",
    verbs: ["SENSE", "PRODUCE", "PRESENT", "RELEASE"] as const,
  },
  mototype: {
    title: "When the environment becomes part of the circuit.",
    closing: "This living platform is designed to respond, act and leave.",
    labels: ["ROS", "EcN", "SURVIVE", "RELEASE", "CLEAR"] as const,
  },
  explore: {
    chineseOnce: "基于 IBD 治疗与 EcN 探索现代活体药物范式雏形",
    links: [
      {
        label: "Description",
        blurb: "Why IBD and EcN.",
        to: "/description",
      },
      {
        label: "Engineering",
        blurb: "How the prototype is built.",
        to: "/engineering",
      },
      {
        label: "Experiments",
        blurb: "Wet-lab plans.",
        to: "/experiments",
      },
      {
        label: "Model",
        blurb: "Population and control.",
        to: "/model",
      },
      {
        label: "Human Practices",
        blurb: "Responsibility in design.",
        to: "/human-practices",
      },
      {
        label: "Team",
        blurb: "People behind Mototype.",
        to: "/team",
      },
    ] as const,
  },
} as const;
