export type NavColumn = {
  title: string;
  eyebrow: string;
  description: string;
  href: string;
  accent: string;
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
  | { label: string; href: string; dropdown?: never }
  | { label: string; href?: string; dropdown: Dropdown };

const useCases: Dropdown = {
  label: "Use Cases",
  columns: [
    {
      title: "Developers",
      eyebrow: "Build",
      description:
        "Ship agent communication flows that stay narrow, explicit, and auditable.",
      href: "#",
      accent: "#60a5fa",
    },
    {
      title: "Enterprises",
      eyebrow: "Govern",
      description:
        "Let internal and external agents collaborate without handing over full context.",
      href: "#",
      accent: "#93c5fd",
    },
    {
      title: "Investors",
      eyebrow: "Observe",
      description:
        "Track delegated work, approvals, and receipts across trusted agent networks.",
      href: "#",
      accent: "#dbeafe",
    },
  ],
  aside: {
    title: "Explore next",
    links: [
      {
        label: "Agent rooms",
        description: "Shared spaces with scoped affordances.",
        href: "#",
      },
      {
        label: "Policy mediation",
        description: "Boundaries before messages cross.",
        href: "#",
      },
    ],
  },
};

export const primaryNav: NavItem[] = [
  { label: "Use Cases", dropdown: useCases },
  { label: "Docs", href: "docs.parle.sh" },
  { label: "Pricing", href: "#" },
];
