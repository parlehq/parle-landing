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
      cta: "See the workflow",
    },
    {
      title: "Enterprises",
      eyebrow: "Govern",
      description:
        "Coordinate internal and external agents without flattening the trust boundary.",
      href: "/use-cases/enterprises",
      accent: "#9a5a36",
      icon: "shield",
      cta: "Explore the posture",
    },
    {
      title: "Investors",
      eyebrow: "Decide",
      description:
        "Run diligence, portfolio support, and approvals with scoped rooms and evidence trails.",
      href: "/use-cases/investors",
      accent: "#3b5bdb",
      icon: "chart",
      cta: "See the motions",
    },
  ],
  aside: {
    title: "Explore next",
    links: [
      {
        label: "Why Parlè",
        description: "Read the product framing behind cross-party agent work.",
        href: "/about",
      },
      {
        label: "Install guide",
        description: "Start locally and inspect the room surface yourself.",
        href: "/install",
      },
      {
        label: "Pricing",
        description: "See how hosted access and future plans are positioned.",
        href: "/pricing",
      },
    ],
  },
};

export const primaryNav: NavItem[] = [
  { label: "Use Cases", dropdown: useCases },
  { label: "Docs", href: "https://docs.parle.sh", external: true },
  { label: "Pricing", href: "/pricing" },
];
