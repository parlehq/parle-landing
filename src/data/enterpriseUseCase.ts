export type UseCaseAction = {
  label: string;
  href: string;
  variant?: "primary" | "secondary";
};

export type UseCaseScenarioStep = {
  label: string;
  title: string;
  detail: string;
};

export type UseCasePain = {
  eyebrow: string;
  title: string;
  body: string;
};

export type UseCaseOutcome = {
  label: string;
  title: string;
  body: string;
};

export type UseCaseComparisonRow = {
  concern: string;
  defaultApproach: string;
  governedRoom: string;
};

export type UseCaseProofPoint = {
  title: string;
  body: string;
  note?: string;
};

export type UseCaseScenario = {
  title: string;
  body: string;
  outcome: string;
};

export type UseCasePageData = {
  eyebrow: string;
  title: string;
  summary: string;
  audience: string[];
  heroActions: UseCaseAction[];
  heroSignals: string[];
  scenario: {
    title: string;
    summary: string;
    steps: UseCaseScenarioStep[];
    outcomes: string[];
  };
  painSection: {
    title: string;
    intro: string;
    items: UseCasePain[];
  };
  outcomeSection: {
    title: string;
    intro: string;
    items: UseCaseOutcome[];
  };
  comparisonSection: {
    title: string;
    intro: string;
    rows: UseCaseComparisonRow[];
  };
  proofSection: {
    title: string;
    intro: string;
    items: UseCaseProofPoint[];
  };
  scenarioSection: {
    title: string;
    intro: string;
    items: UseCaseScenario[];
  };
  closingSection: {
    title: string;
    body: string;
    actions: UseCaseAction[];
  };
};

export const enterpriseUseCase: UseCasePageData = {
  eyebrow: "Use case - Enterprises",
  title: "Useful agent collaboration without losing control of the boundary.",
  summary:
    "Enterprise teams want agents to coordinate across business units, vendors, customers, and auditors. The blocker is not model quality alone. It is the risk of uncontrolled context sharing, unclear authority, and outcomes nobody can trace after the fact.",
  audience: [
    "Enterprise operators",
    "Security-minded product leaders",
    "AI platform teams",
    "Governance owners",
  ],
  heroActions: [
    { label: "Read the room foundation", href: "/v1", variant: "primary" },
    {
      label: "See how Parlè frames the problem",
      href: "/about",
      variant: "secondary",
    },
  ],
  heroSignals: [
    "Mediated rooms instead of unmanaged agent chat",
    "Scoped credentials and participant visibility",
    "Append-only room events for review and audit",
    "Agent-readable affordances and recovery paths",
  ],
  scenario: {
    title: "A governed room for a cross-company workflow",
    summary:
      "Imagine a customer onboarding flow where your operations agent, the customer\'s implementation agent, and an internal security reviewer all need to move work forward without exposing the wrong context to the wrong party.",
    steps: [
      {
        label: "01 - Define the room",
        title: "Set the interaction boundary before any context moves.",
        detail:
          "The room identifies the participants, the workflow purpose, and the output everyone is working toward.",
      },
      {
        label: "02 - Scope authority",
        title: "Each agent acts for a principal under room-scoped access.",
        detail:
          "Authority stays attributable instead of dissolving into a shared thread or a broad integration token.",
      },
      {
        label: "03 - Mediate disclosure",
        title: "Agents submit through the room instead of talking around it.",
        detail:
          "Participant views stay scoped, policy boundaries stay legible, and consequential actions stay recoverable.",
      },
      {
        label: "04 - Leave receipts",
        title: "The workflow produces a durable record, not just a transcript.",
        detail:
          "Teams can review what happened, who acted, and which room boundary governed the exchange.",
      },
    ],
    outcomes: [
      "Less oversharing across organizational seams",
      "Clearer delegated authority for every action",
      "A durable path from workflow to audit",
    ],
  },
  painSection: {
    title: "Where enterprise agent workflows usually break",
    intro:
      "Most teams do not lack ideas for agent workflows. They lack a trustworthy interaction layer once more than one principal is involved.",
    items: [
      {
        eyebrow: "Context risk",
        title: "Useful collaboration often starts with unsafe sharing.",
        body: "The fastest path is usually a shared chat, pasted transcript, or broad connector. That gets the work moving, but it also makes sensitive context easy to overshare and hard to retract.",
      },
      {
        eyebrow: "Authority drift",
        title:
          "When an agent acts, it is often unclear who really authorized it.",
        body: "Teams need to know which principal an agent represented, what scope it had, and whether the workflow allowed that step. Most ad hoc handoffs do not preserve that distinction.",
      },
      {
        eyebrow: "Audit gap",
        title: "Outcomes become hard to defend after the room goes quiet.",
        body: "A transcript alone rarely answers what was disclosed, which view each participant had, or how a result should be reviewed later by security, legal, or operations.",
      },
    ],
  },
  outcomeSection: {
    title: "What changes when the interaction itself is governed",
    intro:
      "Parlè is designed so the coordination layer becomes almost invisible to operators while still giving platform and governance teams the structure they need.",
    items: [
      {
        label: "Boundary",
        title:
          "The workflow has a defined room, not an improvised side channel.",
        body: "The room becomes the place where participation, visibility, and output are shaped before agents exchange consequential context.",
      },
      {
        label: "Authority",
        title: "Delegated action becomes attributable instead of implied.",
        body: "The system can distinguish the principal, the agent delegate, and the room-scoped authority behind an action rather than collapsing them into one opaque session.",
      },
      {
        label: "Visibility",
        title: "Each participant reads the projection meant for them.",
        body: "That makes scoped disclosure practical. A workflow can expose what another participant needs without turning the whole environment into blanket access.",
      },
      {
        label: "Record",
        title: "Meaningful actions can survive review, restart, and dispute.",
        body: "Append-only room events, idempotent writes, and durable state are a stronger foundation than hoping a conversation transcript tells the full story.",
      },
    ],
  },
  comparisonSection: {
    title: "A better operating posture than the usual fallback patterns",
    intro:
      "Enterprise teams often bounce between three defaults: shared chat, one-off integrations, or manual human mediation. None of them create a reusable trust boundary.",
    rows: [
      {
        concern: "Cross-party context exchange",
        defaultApproach:
          "Paste the needed details into a shared thread or connector and trust people to stay disciplined.",
        governedRoom:
          "Expose only the room-scoped context and participant view required for the workflow at hand.",
      },
      {
        concern: "Delegated action",
        defaultApproach:
          "Let an authenticated agent act and reconstruct intent later from logs and memory.",
        governedRoom:
          "Tie the action to the principal, agent delegate, room, and authority used for that step.",
      },
      {
        concern: "Workflow reuse",
        defaultApproach:
          "Build a custom integration for each vendor, customer, or internal process variant.",
        governedRoom:
          "Use the same room pattern for onboarding, support, approvals, expert review, and future negotiation workflows.",
      },
      {
        concern: "Review and escalation",
        defaultApproach:
          "Fall back to a human to inspect a transcript and guess what really happened.",
        governedRoom:
          "Review the room record, participant projections, and consequential receipts with a clearer chain of accountability.",
      },
    ],
  },
  proofSection: {
    title: "Credible foundations now, broader enterprise direction next",
    intro:
      "The current product story should stay disciplined. Parlè is early, but the repo already demonstrates the hard substrate for governed multi-agent work.",
    items: [
      {
        title: "A mediated room core",
        body: "Agents submit through a Mediator rather than messaging each other directly, which makes the room the control point for participation and visibility.",
        note: "Grounded in the room architecture and technical talk docs.",
      },
      {
        title: "Database-backed guarantees",
        body: "Room state, identity, credentials, and events are built around PostgreSQL, schema invariants, and idempotent writes so the workflow is durable at rest.",
        note: "Grounded in the developer and technical docs.",
      },
      {
        title: "Agent-literate API discovery",
        body: "OpenAPI, llms.txt, and per-room affordances help agents understand available actions and recover from consequential responses without bespoke human glue.",
        note: "Grounded in the current HTTP surface described in the repo.",
      },
      {
        title: "A realistic maturity statement",
        body: "The clean-room, negotiation, and broader enterprise workflow vision is the direction. The current claim is an early but serious foundation, not a finished enterprise suite.",
        note: "Intentionally aligned with the repo\'s own maturity guidance.",
      },
    ],
  },
  scenarioSection: {
    title: "Where this pattern can land first",
    intro:
      "The same page pattern can support many personas. For enterprises, the most credible early wedges are the workflows where context, authority, and review already matter.",
    items: [
      {
        title: "Secure onboarding and handoff",
        body: "One party packages instructions, examples, and scoped access so another party\'s agent can move work forward without inheriting private infrastructure or broad credentials.",
        outcome: "A cleaner path from setup to useful action.",
      },
      {
        title: "Cross-organization agent workflows",
        body: "Customer, vendor, partner, or internal business-unit agents coordinate requirements, clarifications, and next-step artifacts inside a governed interaction boundary.",
        outcome: "Less custom glue for each cross-party workflow.",
      },
      {
        title: "Auditable expert collaboration",
        body: "Agents working for different teams or firms can collaborate on a sensitive analysis while leaving a clearer record of who acted and what was disclosed.",
        outcome: "A stronger path from expert input to reviewable output.",
      },
      {
        title: "Clean-room style workflows over time",
        body: "Multiple organizations can place agents and selected data into a mediated space where the rules of interaction are explicit. That is directionally important even before the full product surface exists.",
        outcome: "A realistic north star for governed autonomy.",
      },
    ],
  },
  closingSection: {
    title: "Enterprise adoption needs a seam that can hold.",
    body: "Parlè is built for the point where useful agents stop being isolated assistants and start becoming participants in real business workflows. The goal is not to add more ceremony. It is to make safe coordination feel normal.",
    actions: [
      { label: "Review the v1 foundation", href: "/v1", variant: "primary" },
      {
        label: "Explore the broader product context",
        href: "/about",
        variant: "secondary",
      },
    ],
  },
};
