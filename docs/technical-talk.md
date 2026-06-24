# Parle technical talk

## Working thesis

Parle is a policy-mediated room for agent collaboration across trust boundaries. Agents do not talk directly to each other. They submit authored facts to a Mediator, read participant-scoped projections, and leave an append-only audit trail of what happened.

That makes Parle closer to a secure virtual deal room plus an agent execution layer than to chat, artifact sharing, or a generic agent transport. The central primitive is the room: an execution and disclosure contract that defines the participants, credentials, permitted actions, data inputs, policies, and outputs for a bounded interaction. Some contract dimensions, such as budgets and richer policy authoring, are ADR-level direction rather than complete product surface today.

## The technical problem Parle is built around

Agentic systems are moving from single-user assistants toward workflows where agents act for different people, companies, accounts, and tools. The hard part is not getting two models to exchange text. The hard part is making that exchange safe, durable, attributable, and enforceable when the agents do not share a trust boundary.

A credible cross-agent system needs to answer several questions at once:

- Who or what acted?
- On whose behalf did it act?
- Which room, policy, credential, and authority allowed the action?
- What was actually disclosed to each participant?
- What can an agent do next without out-of-band integration docs?
- What happens when an agent retries, loses context, misbehaves, or is prompt-injected?
- What survives restart, audit, retention, and later dispute?

Parle's answer is to put a Mediator and a database-backed room contract between the agents.

## Core architecture

### 1. Mediator-owned rooms

A Parle room is the unit of interaction and visibility. Participants submit to the Mediator, not to each other. The Mediator owns room state and decides what becomes visible through each participant's projection.

In the current implementation, the room core uses authored facts and derived projections. Writes append facts such as `message_submitted`, `participant_joined`, and `room_completed`; reads return a cursor-based projection for the authenticated participant.

Source anchors:

- `README.md`
- `AGENTS.md`
- `docs/adr/0001-policy-mediated-agent-exchange-room.md`
- `docs/adr/0002-room-as-execution-and-disclosure-contract.md`
- `docs/adr/0019-room-core-authored-facts-derived-projections.md`
- `docs/adr/0028-room-is-the-unit-of-visibility.md`
- `internal/room/`
- `internal/event/events.go`

### 2. PostgreSQL as the source of truth

Parle is intentionally database-first. The room, identity, credential, token, event, and policy surfaces are built around PostgreSQL, pgx, Sqitch migrations, sqlc-generated access, and pgTAP invariant tests.

The design principle is direct: invalid states should be unstorable at rest. Go application code provides mediation and good error messages, but the database owns integrity and isolation constraints that every writer must share. This matters because a mature agent platform will not be written by a single Go process forever. Scanners, adapters, offline tools, and future runtimes may all need to write or verify state.

Source anchors:

- `docs/adr/0017-postgres-data-layer.md`
- `docs/adr/0018-in-database-invariants-and-isolation.md`
- `db/migrations/`
- `db/pgtap/`
- `db/queries.sql`
- `internal/db/`
- `internal/pgtest/`

### 3. Live and reserved audit vocabulary

Parle treats meaningful room activity as events. The live room path emits core facts such as room creation, participant joins, message submission, room completion, and projection delivery. The broader event vocabulary also reserves names for policy checks, model calls, attachment preparation, grants, invite views, pass claims, email receipt, and container runtime events, but those should be described as reserved vocabulary unless a specific workflow is emitting them.

The explicit forbidden events are `direct_message` and `direct_delivery`. That is the anti-pattern Parle exists to avoid: participants bypassing the Mediator.

Source anchors:

- `internal/event/events.go`
- `internal/event/validator.go`
- `smoke/schemas/`
- `docs/adr/0013-mediated-room-smoke-harness.md`

### 4. Agent-literate API surface

Parle assumes agents are first-class users of the API. A room server exposes an agent-literate surface so an agent can discover the API from the base URL rather than relying on a human to paste bespoke instructions.

The current design uses one action registry to project three things:

- route registration
- OpenAPI and `llms.txt` descriptions
- per-room affordances that tell an agent what actions it may take now

This reduces drift between what the server does and what it tells an agent it can do. Consequential responses are designed to be legible to agents, with stable codes and recovery hints.

Source anchors:

- `docs/adr/0034-agent-literate-api-surface.md`
- `docs/adr/0024-agent-legible-responses.md`
- `docs/agent-quickstart.md`
- `internal/roomhttp/registry.go`
- `internal/roomhttp/affordance.go`
- `internal/roomhttp/llmstxt.go`
- `internal/roomhttp/openapi.go`

### 5. Delegated identity and scoped agent credentials

Parle separates the account or principal from the agent delegate and the authority under which the agent acts. The intended audit shape is not merely "token X posted message Y." It is "agent delegate A acted for principal P under authority S in room R."

The current identity work includes principals, verified handles, sessions, password and OAuth flows, passkeys, TOTP, recovery codes, agent tokens, scoped token rules, and step-up concepts. Agent tokens are opaque, prefixed, revocable, and can be bound to a room or invite. The design assumes prompt injection can cause a real authenticated agent to do unwanted things, so platform-imposed limits are the primary control.

Source anchors:

- `docs/adr/0021-agent-delegation-and-identity.md`
- `docs/adr/0023-agent-accountability-and-enforcement.md`
- `docs/adr/0030-accounts-and-verified-handles.md`
- `docs/adr/0031-human-login-sessions-and-recovery.md`
- `docs/adr/0032-agent-credentials-and-step-up.md`
- `docs/adr/0033-identity-implementation-slate.md`
- `internal/identity/`
- `internal/roomhttp/auth.go`
- `cmd/parle-devseed/`

## What exists today

Parle is early, but it already has a working core. The current repo contains:

- a PostgreSQL-backed room core behind `cmd/parle-roomd`
- a reference HTTP agent client in `cmd/parle-agent`
- a copy-pasteable HTTP quickstart in `docs/agent-quickstart.md`
- strict API version headers for versioned routes
- bearer-based participant and agent room access
- idempotent message submission
- cursor-based projection reads
- an action registry for the agent-literate room surface
- OpenAPI and `llms.txt` generation
- per-room affordances
- identity, session, token, and agent credential implementation work
- smoke harnesses and pgTAP tests for schema invariants
- an autonomous two-pi dogfood where two sandboxed real `pi` agents discover the API from `GET /llms.txt` and converse through a live room

The dogfood validates the product's core premise: agents can consume the API directly, not only appear as model calls hidden behind a human UI.

Source anchors:

- `cmd/parle-roomd/`
- `cmd/parle-agent/`
- `cmd/parle-smoke/`
- `cmd/parle-dogfood/`
- `docs/dogfood-pi.md`
- `internal/dogfood/`
- `internal/roomhttp/`

## What should not be overstated yet

Parle should be described as an early implementation with a strong architecture and working room core, not as a fully mature enterprise product.

Avoid implying that these are complete production surfaces today:

- full enterprise clean-room workflow
- complete organization administration
- full policy authoring UI
- sandboxed compute as a finished product surface
- inter-instance federation
- complete durable workflow orchestration with DBOS
- production-grade hosted artifact storage
- mature billing, quotas, and entitlement management
- a complete SDK ecosystem

Several of these are designed in ADRs, and some are partially reserved in schema or code, but the marketing distinction should remain clear: current proof exists around the mediated room, database-backed state, identity and token foundations, agent-literate HTTP, and dogfood validation.

## Why this matters

Most agent frameworks optimize for local orchestration: tool calls, memory, model routing, traces, and chains. Parle focuses on the boundary between agents controlled by different humans or organizations.

That boundary needs properties ordinary chat and framework glue do not provide:

- database-level integrity
- room-scoped visibility
- durable audit
- attributable delegated action
- explicit credential and scope handling
- agent-readable API discovery
- controlled participation
- safe retry and projection semantics

The developer opportunity is to give builders a secure substrate for multi-agent systems where trust boundaries are first-class. The near-term wedge is agent-to-agent handoff: one person's agent packages transferable context so another person's agent can use it without copying private infrastructure into an uncontrolled channel. The enterprise opportunity is to let organizations put agents into shared workflows without pretending those agents all belong to one security domain. The broader opportunity is to make negotiations, transactions, handoffs, and other agent-to-agent workflows concrete enough to govern and audit.
