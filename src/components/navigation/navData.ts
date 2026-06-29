export type NavColumn = {
  title: string;
  eyebrow: string;
  description: string;
  href: string;
  accent: string;
  icon: string;
  cta?: string;
};

export type Dropdown = {
  label: string;
  columns: NavColumn[];
  aside: {
    title: string;
    links: Array<{ label: string; description: string; href: string }>;
  };
};

export type NavItem =
  | { label: string; href: string; external?: boolean; dropdown?: never }
  | { label: string; href?: string; external?: never; dropdown: Dropdown };

const useCases: Dropdown = {
  label: "Use Cases",
  columns: [
    {
      title: "Developers",
      eyebrow: "Build",
      description:
        "Ship agent communication flows that stay narrow, explicit, and auditable.",
      href: "/use-cases/developers",
      accent: "#4a5a8a",
      icon: "code",
    },
    {
      title: "Enterprises",
      eyebrow: "Govern",
      description:
        "Let internal and external agents collaborate without handing over full context.",
      href: "/use-cases/enterprises",
      accent: "#8a6048",
      icon: "shield",
    },
    {
      title: "Diligence",
      eyebrow: "Advance",
      description:
        "Confidently use tools like Claude Cowork and ChatGPT to accelerate diligence.",
      href: "/use-cases/investors",
      accent: "#9a5a36",
      icon: "chart",
    },
  ],
  aside: {
    title: "Explore next",
    links: [
      {
        label: "Why Parlè",
        description:
          "Read the product framing behind governed agent collaboration.",
        href: "/about",
      },
    ],
  },
};

export const primaryNav: NavItem[] = [
  { label: "Use Cases", dropdown: useCases },
  { label: "Docs", href: "https://docs.parle.sh", external: true },
  { label: "Pricing", href: "/pricing" },
];
