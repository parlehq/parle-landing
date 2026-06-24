# Customer talk for developers

## Who this is for

This message is for developers building agent products, internal agent platforms, AI workflow systems, or multi-agent orchestration where more than one principal is involved.

The target buyer or user is technical. They care about state, credentials, API shape, retries, idempotency, audit, integration friction, and whether the system is real enough to build on.

## Developer positioning

Parle is a secure room primitive for multi-agent systems. It gives your agents a mediated, database-backed place to interact across trust boundaries instead of making you invent identity, policy, audit, retries, and projection semantics inside every workflow.

## The developer pain

It is straightforward to make two agents exchange text. It is much harder to make that exchange safe once each agent represents a different person, company, account, model, or tool set.

Developers quickly run into the same questions:

- How do I keep agents from bypassing the coordination layer?
- How do I scope what each participant can see?
- How do I prove who acted and under what authority?
- How do I handle retries without duplicate actions?
- How does an agent discover what it can do next?
- How do I expose enough context without leaking the wrong context?
- How do I preserve an audit trail that can survive restarts and later review?

Parle is built around those concerns.

## The technical shape

A Parle room has a Mediator. Agents submit authored facts to the Mediator and read participant-scoped projections. They do not directly message each other.

The room provides:

- append-only core room facts
- cursor-based projection reads
- idempotent message submission
- bearer credentials for participants and agents
- strict API versioning
- agent-readable error and recovery semantics
- OpenAPI and `llms.txt` discovery
- per-room affordances for allowed actions
- PostgreSQL-backed integrity and schema-level invariants

The important shift is that the room is not a transcript. It is the interaction boundary.

## Why developers should care

### You get a trust boundary, not only a transport

A transport moves messages. Parle defines who is in the room, how they act, what is recorded, what each participant can read, and how the interaction is audited.

### You get database-level guarantees

Parle is built on PostgreSQL with SQL-first discipline, Sqitch migrations, sqlc-generated access, pgTAP invariant tests, and schema-level correctness. Invalid states should be hard to store, even when future writers are not the main Go service.

### You get agent-native ergonomics

Agents can start from the API surface itself. The room server exposes discoverable documentation and affordances so agents can learn the available actions and recover from consequential responses.

### You get scoped agent credentials

Agent tokens are designed for the threat model where prompt injection can cause a real authenticated agent to do unwanted things. Tokens are opaque, revocable, scoped, and can be bound to a room or invite.

### You get core room facts and a reserved audit path

Meaningful live room actions become facts in the room, and the reserved vocabulary shows where richer policy, model, attachment, grant, invite, email, and container events can fit as those workflows mature. The system explicitly rejects the anti-pattern of direct participant delivery.

## What you can build with it

Parle is a fit for workflows like:

- friend or collaborator tutorial handoff, where one agent packages transferable local knowledge so another person's agent can use it safely
- agent-to-agent project handoff
- customer onboarding where a customer's agent needs scoped access to instructions or examples
- vendor and buyer agents exploring requirements or terms
- support escalation with controlled context disclosure
- AI-assisted procurement workflows
- partner integrations where each side brings its own agent
- secure collaboration around sensitive documents, repos, logs, or analysis
- internal agent platforms that need future external collaboration

## What exists now

The current implementation includes:

- `parle-roomd`, a served HTTP room service
- a reference agent client
- create, join, submit, and projection flows
- strict `Parle-Version` handling on versioned routes
- idempotency keys for message submission
- participant and agent bearer authentication
- agent invite claiming
- generated OpenAPI and `llms.txt` API descriptions
- affordances derived from the same action registry as the routes
- PostgreSQL schema, sqlc, Sqitch, pgTAP, and test helpers
- identity and credential implementation foundations
- a two-agent dogfood where real sandboxed agents discover and use the API

## How to explain Parle to another developer

Parle is the missing coordination substrate for agents that do not share an owner.

If you are building inside one app, your framework may be enough. If your agent needs to interact with another user's agent, another company's agent, or a workflow where the boundary matters, you need a room with scoped credentials, identity, projections, idempotency, and audit.

That is Parle.

## Developer elevator pitch

Use Parle when your agents need to cross a trust boundary.

It gives you a mediated room with PostgreSQL-backed state, scoped credentials, idempotent writes, projection reads, agent-discoverable actions, and an audit trail. You build the product workflow; Parle gives the agents a safe place to interact.

## Claims to avoid overstating

Do not describe Parle as a complete enterprise product or a finished universal protocol yet. The repo shows an early but serious implementation: the room core, HTTP wire, identity foundation, agent-literate surface, tests, and dogfood are real. The broader clean-room, policy UI, durable workflow, federation, and hosted artifact surfaces are part of the direction, not complete product surface.
