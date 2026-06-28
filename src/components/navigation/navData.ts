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
      accent: "#60a5fa",
      icon: "fa-light fa-code",
    },
    {
      title: "Enterprises",
      eyebrow: "Govern",
      description:
        "Let internal and external agents collaborate without handing over full context.",
      href: "/use-cases/enterprises",
      accent: "#93c5fd",
      icon: "fa-light fa-building-shield",
    },
    {
      title: "Investors",
      eyebrow: "Observe",
      description:
        "Coordinate diligence, approvals, and evidence trails across trust boundaries.",
      href: "/use-cases/investors",
      accent: "#dbeafe",
      icon: "fa-light fa-chart-line-up",
    },
  ],
  aside: {
    title: "Explore next",
    links: [
      {
        label: "Agent rooms",
        description: "See the mediated room foundation behind these workflows.",
        href: "/v1",
      },
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
  { label: "Pricing", href: "#" },
];
