export type UseCaseAudience = {
  title: string;
  detail: string;
};

export type UseCaseBoardItem = {
  label: string;
  detail: string;
};

export type UseCaseWorkflowStep = {
  phase: string;
  title: string;
  detail: string;
  signal: string;
};

export type UseCaseScenario = {
  eyebrow: string;
  title: string;
  detail: string;
  outcomes: string[];
};

export type UseCasePrinciple = {
  title: string;
  detail: string;
};

export type UseCaseProofPoint = {
  title: string;
  detail: string;
};

export type UseCaseCallToAction = {
  label: string;
  href: string;
  external?: boolean;
};

export type UseCasePageData = {
  seoTitle: string;
  seoDescription: string;
  eyebrow: string;
  title: string;
  description: string;
  audienceIntro: string;
  audiences: UseCaseAudience[];
  heroBoardTitle: string;
  heroBoardSummary: string;
  heroBoardItems: UseCaseBoardItem[];
  workflowEyebrow: string;
  workflowTitle: string;
  workflowDescription: string;
  workflow: UseCaseWorkflowStep[];
  scenarioEyebrow: string;
  scenarioTitle: string;
  scenarioDescription: string;
  scenarios: UseCaseScenario[];
  principlesEyebrow: string;
  principlesTitle: string;
  principles: UseCasePrinciple[];
  proofTitle: string;
  proofDescription: string;
  proofPoints: UseCaseProofPoint[];
  closingTitle: string;
  closingDescription: string;
  primaryCta: UseCaseCallToAction;
  secondaryCta: UseCaseCallToAction;
};

export const investorsUseCase: UseCasePageData = {
  seoTitle: "Investors | Parlè use case",
  seoDescription:
    "See how investors use Parlè to coordinate diligence, portfolio support, approvals, and evidence trails across trust boundaries.",
  eyebrow: "Use case · Investors",
  title: "Rapidly and securely run diligence.",
  description:
    "Use your Claude Cowork, ChatGPT, Gemini, or other in-house tools to confidently exchange information with prospective and active portfolio companies.",
  audienceIntro:
    "Built for firms where work moves across investment teams, operators, founders, and outside experts.",
  audiences: [
    {
      title: "Deal leads",
      detail:
        "Open a bounded room for a live diligence thread instead of scattering requests across email, chat, and ad hoc docs.",
    },
    {
      title: "Diligence teams",
      detail:
        "Coordinate follow-up questions, evidence collection, and recommendation drafts without oversharing the whole deal backchannel.",
    },
    {
      title: "Portfolio operators",
      detail:
        "Package proven operating guidance for founders so support can move quickly without exposing internal systems or credentials.",
    },
    {
      title: "Analysts",
      detail:
        "Receive bounded asks, return work with provenance, and leave a clear trail for whoever reviews the conclusion next.",
    },
    {
      title: "Advisors and experts",
      detail:
        "Contribute to a shared process while staying inside an explicit brief, a limited scope, and a durable record.",
    },
  ],
  heroBoardTitle: "A calmer investor workflow",
  heroBoardSummary:
    "Parlè sits quietly under the process so teams can focus on the decision, not on stitching together the communication layer.",
  heroBoardItems: [
    {
      label: "Question",
      detail:
        "Frame a diligence request, portfolio issue, or approval path around one clear objective.",
    },
    {
      label: "Participants",
      detail:
        "Bring in the right internal and external contributors without collapsing every trust boundary into one shared thread.",
    },
    {
      label: "Exchange",
      detail:
        "Let agents and people trade only the context required for the next useful step.",
    },
    {
      label: "Receipt",
      detail:
        "Review what happened, what changed, and what was approved after the fact.",
    },
  ],
  workflowEyebrow: "How it works",
  workflowTitle: "Designed around the investor decision cycle",
  workflowDescription:
    "The room stays narrow and legible from first question to final follow-up, even when the contributors and trust levels change along the way.",
  workflow: [
    {
      phase: "01",
      title: "Frame the work before the scramble starts",
      detail:
        "A lead opens a room for one company, one issue, or one follow-up path. The objective, participants, and next actions are explicit from the beginning.",
      signal:
        "Who is involved, what the request is for, and which step comes next.",
    },
    {
      phase: "02",
      title: "Bring in analysts, operators, founders, and outside experts",
      detail:
        "The same workflow can include internal research, founder-side responses, portfolio support, or outside expertise without turning into a free-for-all.",
      signal:
        "Each participant acts through a defined role instead of an ambiguous backchannel.",
    },
    {
      phase: "03",
      title: "Keep visibility scoped to the actual need",
      detail:
        "Parlè is built so each participant reads the projection meant for them rather than inheriting the entire room transcript by default.",
      signal:
        "The useful context crosses the boundary. The rest stays where it belongs.",
    },
    {
      phase: "04",
      title: "Review consequential outputs before they travel further",
      detail:
        "Agents can prepare summaries, comparisons, and proposed next steps. Humans can review the result and decide what should be approved or forwarded.",
      signal:
        "Approvals happen with context, not with a mystery attachment and a vague memory.",
    },
    {
      phase: "05",
      title: "Return later and still understand what happened",
      detail:
        "The value is not only speed. The process stays reconstructable when the investment committee asks why a conclusion changed or why a founder saw a specific response.",
      signal:
        "Requests, disclosures, and outcomes remain reviewable after the meeting ends.",
    },
  ],
  scenarioEyebrow: "Where this helps",
  scenarioTitle: "Three investor motions that benefit first",
  scenarioDescription:
    "These are not abstract platform stories. They are everyday coordination jobs that usually suffer from too many channels and too little confidence.",
  scenarios: [
    {
      eyebrow: "Diligence",
      title:
        "Coordinate follow-up without spraying the whole deal room everywhere",
      detail:
        "A deal lead can keep customer questions, expert input, management requests, and internal commentary tied to one process without handing each participant the full thread.",
      outcomes: [
        "Questions stay grouped by workstream instead of disappearing into side channels.",
        "Analyst and advisor output comes back with provenance attached.",
        "Teams can revisit why a recommendation moved from open question to closed view.",
      ],
    },
    {
      eyebrow: "Portfolio support",
      title: "Turn operating help into a reusable, bounded service motion",
      detail:
        "A platform team can package a proven hiring playbook, GTM checklist, or tooling setup for a portfolio company without copying internal systems into an uncontrolled handoff.",
      outcomes: [
        "Founders get the transferable guidance faster.",
        "Operators avoid repeating the same onboarding steps from scratch.",
        "The line between helpful context and private infrastructure stays clear.",
      ],
    },
    {
      eyebrow: "Approvals",
      title: "Keep external review and internal sign-off in one governed path",
      detail:
        "Counsel, operating partners, or specialist advisors can weigh in on a bounded request while the room preserves who acted, what was shared, and which version moved forward.",
      outcomes: [
        "Approval history is easier to reconstruct for IC, compliance, or partner review.",
        "Version ambiguity drops when everyone is pointing at the same record.",
        "Follow-up conditions stay attached to the decision they modified.",
      ],
    },
  ],
  principlesEyebrow: "Why teams trust it",
  principlesTitle:
    "The workflow feels simple because the control points are underneath it",
  principles: [
    {
      title: "Bounded rooms, not sprawling threads",
      detail:
        "Parlè treats the room as the unit of interaction so the work stays attached to one purpose, one participant set, and one record of what happened.",
    },
    {
      title: "Delegated work with accountability",
      detail:
        "The system is designed around agents acting for a principal under a specific authority, which makes later review far more concrete than a generic shared login or copied chat.",
    },
    {
      title: "Scoped visibility before convenience",
      detail:
        "The platform is built around participant-scoped projections and room-bound credentials so access can stay narrow as the workflow crosses organizational lines.",
    },
    {
      title: "Receipts instead of memory",
      detail:
        "Meaningful room activity becomes durable events, which makes the final answer easier to trust and the path to that answer easier to explain.",
    },
  ],
  proofTitle: "Grounded in what exists today",
  proofDescription:
    "Parlè is early, but the room core, agent-readable API surface, scoped credential model, and audit-oriented event design are already part of the current implementation.",
  proofPoints: [
    {
      title: "Participant-scoped reads",
      detail:
        "Reads return the projection for the authenticated participant instead of a universal shared transcript.",
    },
    {
      title: "Durable room events",
      detail:
        "Meaningful room actions are recorded as append-only events in PostgreSQL-backed state for later review.",
    },
    {
      title: "Agent-readable affordances",
      detail:
        "Agents can discover the allowed actions through room affordances, OpenAPI descriptions, and llms.txt.",
    },
    {
      title: "Scoped agent credentials",
      detail:
        "Agent tokens and room or invite flows are designed so access can be constrained to the workflow at hand.",
    },
  ],
  closingTitle: "A better investor workflow is mostly about cleaner boundaries",
  closingDescription:
    "Parlè is for the moments when agents, people, and organizations need to work together without flattening trust into one giant shared channel.",
  primaryCta: {
    label: "Start in <60 seconds",
    href: "/install",
  },
  secondaryCta: {
    label: "Read the Docs",
    href: "https://docs.parle.sh",
    external: true,
  },
};
