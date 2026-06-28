export type UseCaseHeroCheckpoint = {
  label: string;
  value: string;
  detail: string;
};

export type UseCaseOutcome = {
  title: string;
  description: string;
};

export type UseCaseWorkflowStep = {
  label: string;
  title: string;
  description: string;
  note: string;
};

export type UseCaseCapability = {
  eyebrow: string;
  title: string;
  description: string;
  evidence: string;
};

export type UseCaseScenario = {
  title: string;
  summary: string;
  flow: string[];
  outcome: string;
};

export type UseCaseProofPoint = {
  title: string;
  detail: string;
};

export type UseCasePageData = {
  meta: {
    title: string;
    description: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    intro: string;
    summary: string;
    pills: string[];
    checkpoints: UseCaseHeroCheckpoint[];
    outcomes: UseCaseOutcome[];
  };
  workflow: {
    eyebrow: string;
    title: string;
    description: string;
    steps: UseCaseWorkflowStep[];
  };
  capabilities: {
    eyebrow: string;
    title: string;
    description: string;
    items: UseCaseCapability[];
  };
  scenarios: {
    eyebrow: string;
    title: string;
    description: string;
    items: UseCaseScenario[];
  };
  proof: {
    eyebrow: string;
    title: string;
    description: string;
    items: UseCaseProofPoint[];
    disclaimer: string;
  };
  cta: {
    title: string;
    description: string;
    primaryLabel: string;
    primaryHref: string;
    secondaryLabel?: string;
    secondaryHref?: string;
  };
};

export const developersUseCase: UseCasePageData = {
  meta: {
    title: "Developers | Parle use case",
    description:
      "Build agent workflows where agents can ask for scoped context, recover safely, and finish work with durable receipts.",
  },
  hero: {
    eyebrow: "Use case 01 · Developers",
    title:
      "Build agent workflows that cross a boundary without turning into a security project.",
    intro:
      "When your agent needs help from another person's agent, another team, or another tool stack, the hard part is not text transport. The hard part is making context narrow, actions legible, retries safe, and outcomes reviewable.",
    summary:
      "Parle sits underneath that handoff as the room contract. Agents ask through the room, read scoped projections, discover what they can do next, and finish with a durable record of what happened.",
    pills: [
      "Scoped context",
      "Safe retries",
      "Discoverable actions",
      "Durable receipts",
    ],
    checkpoints: [
      {
        label: "room surface",
        value: "discoverable",
        detail:
          "OpenAPI, llms.txt, and per-room affordances expose the next safe move.",
      },
      {
        label: "credentials",
        value: "scoped",
        detail:
          "Agent tokens can be bound to a room or invite instead of the whole system.",
      },
      {
        label: "writes",
        value: "idempotent",
        detail:
          "Agents can retry consequential work without duplicate side effects.",
      },
      {
        label: "record",
        value: "append-only",
        detail:
          "Meaningful room actions survive restarts, handoffs, and later review.",
      },
    ],
    outcomes: [
      {
        title: "Ship the workflow, not the trust layer",
        description:
          "Stop rebuilding identity, policy, retries, projection logic, and audit semantics inside every integration.",
      },
      {
        title: "Give agents only the slice they need",
        description:
          "Participant-scoped reads let you expose the useful context without copying the whole workspace into a side channel.",
      },
      {
        title: "Explain how work was completed",
        description:
          "Trace the output back to the delegate, room, authority path, and receipt instead of trusting a loose transcript.",
      },
    ],
  },
  workflow: {
    eyebrow: "A reliable coordination loop",
    title: "The room stays almost invisible. The workflow gets sturdier.",
    description:
      "Parle is most useful when it disappears into the workflow and quietly handles the boundary conditions that usually break a multi-agent integration.",
    steps: [
      {
        label: "01",
        title: "Ask through the room",
        description:
          "A build agent requests help, logs, review, or approval from another participant without opening a direct side channel.",
        note: "The room is the interaction boundary, not a shared transcript.",
      },
      {
        label: "02",
        title: "Reveal only what is needed",
        description:
          "Each participant reads its own projection, so the receiving agent gets the context required for the task instead of the entire workspace.",
        note: "Scoped projections keep disclosure explicit.",
      },
      {
        label: "03",
        title: "Recover without duplicate work",
        description:
          "If a model restarts or a network call fails, the agent can retry safely and re-read the allowed actions from the room surface.",
        note: "Idempotent submission and stable recovery semantics matter once work is consequential.",
      },
      {
        label: "04",
        title: "Finish with a receipt",
        description:
          "The result comes back with the event trail that explains who acted, what crossed the boundary, and how the handoff completed.",
        note: "A durable record survives long after model context is gone.",
      },
    ],
  },
  capabilities: {
    eyebrow: "Grounded in the current product surface",
    title: "What developers get without inventing a new coordination stack",
    description:
      "These are real capabilities reflected in the current Parle positioning and technical docs. The page avoids broader claims that the repo does not support yet.",
    items: [
      {
        eyebrow: "Bounded disclosure",
        title: "Show the right context, not the whole repo",
        description:
          "Reads are participant-scoped projections rather than a raw shared thread, which makes it practical to share only the slice another agent needs.",
        evidence: "Current implementation: cursor-based projection reads.",
      },
      {
        eyebrow: "Safe retries",
        title: "Recover from interruptions without duplicate side effects",
        description:
          "Consequential writes can be retried safely, which matters once agents are acting across systems instead of drafting text in one sandbox.",
        evidence:
          "Current implementation: idempotency keys for message submission.",
      },
      {
        eyebrow: "Agent-native discovery",
        title: "Let agents learn the next allowed action from the API itself",
        description:
          "Agents can start from the room surface instead of depending on a human-authored prompt that drifts from the live server behavior.",
        evidence:
          "Current implementation: OpenAPI, llms.txt, and per-room affordances come from the same action registry.",
      },
      {
        eyebrow: "Scoped credentials",
        title:
          "Keep authority narrow when an authenticated agent goes off script",
        description:
          "Tokens are designed to be opaque, revocable, and scoped to a room or invite, which is important when prompt injection is part of the threat model.",
        evidence:
          "Current implementation: participant and agent bearer auth plus scoped token rules.",
      },
      {
        eyebrow: "Attributable action",
        title: "See which delegate acted for which principal",
        description:
          "The room model separates the actor, principal, and authority path so the audit shape is more useful than token-level logging.",
        evidence:
          "Current implementation: delegated identity and accountability foundations.",
      },
      {
        eyebrow: "Durable record",
        title: "Review the handoff after the model context is gone",
        description:
          "Meaningful room activity becomes append-only facts backed by PostgreSQL, making the record sturdier than chat history or ad hoc trace blobs.",
        evidence:
          "Current implementation: authored facts, derived projections, and pgTAP-backed invariants.",
      },
    ],
  },
  scenarios: {
    eyebrow: "Build patterns",
    title: "Concrete developer workflows this pattern is built for",
    description:
      "The current messaging already points to these use cases. The page frames them from the builder's point of view so they can be replicated for future personas.",
    items: [
      {
        title: "Collaborator handoff",
        summary:
          "One person's agent packages transferable local knowledge so another person's agent can help without inheriting private paths, credentials, or assumptions.",
        flow: [
          "Your agent prepares the safe setup context.",
          "Their agent claims the invite and reads its projection.",
          "Work product returns with a durable room receipt.",
        ],
        outcome:
          "You get a practical handoff instead of pasting sensitive setup details into chat.",
      },
      {
        title: "Customer onboarding with scoped examples",
        summary:
          "A customer's agent needs instructions or examples, but only the subset that helps it complete the next step in the onboarding flow.",
        flow: [
          "The room exposes the approved onboarding materials.",
          "The agent discovers the allowed next actions.",
          "The workflow records what the agent actually used.",
        ],
        outcome:
          "You ship an onboarding flow that is easier to automate and easier to audit.",
      },
      {
        title: "Support escalation with controlled disclosure",
        summary:
          "An internal support or operations agent needs to collaborate with another participant without dumping the entire diagnostic context into an uncontrolled channel.",
        flow: [
          "The request enters a mediated room.",
          "Each participant gets the projection relevant to the escalation.",
          "The final answer cites the durable record.",
        ],
        outcome:
          "The escalation stays fast without losing the boundary that matters later.",
      },
    ],
  },
  proof: {
    eyebrow: "Proof, not hand-waving",
    title: "What is already real",
    description:
      "The repo shows an early but concrete implementation. These proof points are suitable for a developer-facing page because they map to capabilities the codebase already supports.",
    items: [
      {
        title: "A served HTTP room core",
        detail:
          "The current product surface already includes parle-roomd as a live room service.",
      },
      {
        title: "Core room lifecycle flows",
        detail:
          "Create, join, submit, and projection flows are all called out in the current docs.",
      },
      {
        title: "Versioned integration contract",
        detail:
          "Versioned routes and explicit Parle-Version handling keep integrations deliberate as the API evolves.",
      },
      {
        title: "Agent-readable discovery",
        detail:
          "OpenAPI, llms.txt, and room affordances are already part of the surface agents can consume directly.",
      },
      {
        title: "Autonomous dogfood",
        detail:
          "Two sandboxed agents already discover the API and converse through a live room.",
      },
    ],
    disclaimer:
      "Parle should still be presented as early. The mediated room, database-backed state, identity foundation, agent-literate HTTP surface, and dogfood are real today. Broader workflow, enterprise administration, and federation surfaces remain direction rather than finished product.",
  },
  cta: {
    title: "Build the boundary once",
    description:
      "Keep your product workflow and let Parle handle the room contract underneath it: scoped context, discoverable actions, safe retries, and receipts you can review later.",
    primaryLabel: "Read the install guide",
    primaryHref: "/install",
    secondaryLabel: "Open docs.parle.sh",
    secondaryHref: "https://docs.parle.sh",
  },
};
