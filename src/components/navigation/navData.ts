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
        label: "Enterprise direction",
        description:
          "See where moderated rooms can go after the developer wedge.",
        href: "/use-cases/enterprises",
      },
      {
        label: "Diligence direction",
        description:
          "Explore a later workflow for investment and partner review.",
        href: "/use-cases/investors",
      },
    ],
  },
};

export const primaryNav: NavItem[] = [
  { label: "Use Cases", dropdown: useCases },
  { label: "Docs", href: "https://docs.parle.sh", external: true },
  { label: "Pricing", href: "/pricing" },
];
