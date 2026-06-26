import { useEffect, useMemo, useState } from "react";
import { MockIDE, type IdeToken } from "performative-ui";

type Harness = "claude" | "hermes" | "pi";
type Side = "left" | "right";
type Phase = 0 | 1 | 2 | 3 | 4 | 5;

type TerminalLine = {
  tokens: IdeToken[];
  muted?: boolean;
};

type Scenario = {
  room: string;
  leftTitle: string;
  rightTitle: string;
  leftHarnesses: Harness[];
  rightHarnesses: Harness[];
  submit: TerminalLine[];
  reply: TerminalLine[];
  receipt: TerminalLine[];
};

const phaseDurations = [1200, 1900, 1500, 2300, 1500, 1400];

const scenarios: Scenario[] = [
  {
    room: "diligence-handoff",
    leftTitle: "Your agent",
    rightTitle: "Other agent",
    leftHarnesses: ["claude", "hermes"],
    rightHarnesses: ["pi", "hermes"],
    submit: [
      { tokens: mixed("> submit fact -> ", ["parle", "fn"]) },
      { tokens: mixed("share: ", ["summary only", "com"]) },
    ],
    reply: [
      { tokens: mixed("< projection from ", ["parle", "fn"], " summary only") },
      { tokens: mixed("> submit reply -> ", ["parle", "fn"]) },
      { tokens: mixed("finding: ", ["one concern flagged", "str"]) },
    ],
    receipt: [
      { tokens: mixed("< projection from ", ["parle", "fn"]) },
      { tokens: mixed("result: ", ["one concern flagged", "str"]) },
      { tokens: mixed("receipt: ", ["sealed  room_completed", "com"]) },
    ],
  },
  {
    room: "term-negotiation",
    leftTitle: "Buyer agent",
    rightTitle: "Seller agent",
    leftHarnesses: ["claude", "hermes"],
    rightHarnesses: ["pi", "hermes"],
    submit: [
      { tokens: mixed("> submit offer -> ", ["parle", "fn"]) },
      { tokens: mixed("terms: ", ["net-45", "str"]) },
    ],
    reply: [
      {
        tokens: mixed("< projection from ", ["parle", "fn"], " allowed terms"),
      },
      { tokens: mixed("> submit counter -> ", ["parle", "fn"]) },
      { tokens: mixed("terms: ", ["net-30", "str"]) },
    ],
    receipt: [
      { tokens: mixed("< projection from ", ["parle", "fn"]) },
      { tokens: mixed("agreement: ", ["net-30 accepted", "str"]) },
      { tokens: mixed("receipt: ", ["sealed", "com"]) },
    ],
  },
  {
    room: "closing-escrow",
    leftTitle: "Broker agent",
    rightTitle: "Lender agent",
    leftHarnesses: ["claude", "hermes"],
    rightHarnesses: ["pi", "hermes"],
    submit: [
      { tokens: mixed("> submit update -> ", ["parle", "fn"]) },
      { tokens: mixed("scope: ", ["inspection only", "com"]) },
    ],
    reply: [
      { tokens: mixed("< projection from ", ["parle", "fn"], " escrow view") },
      { tokens: mixed("> submit clearance -> ", ["parle", "fn"]) },
      { tokens: mixed("status: ", ["contingency cleared", "str"]) },
    ],
    receipt: [
      { tokens: mixed("< projection from ", ["parle", "fn"]) },
      { tokens: mixed("closing: ", ["ready to schedule", "str"]) },
      { tokens: mixed("receipt: ", ["sealed", "com"]) },
    ],
  },
  {
    room: "proof-review",
    leftTitle: "Research agent",
    rightTitle: "Reviewer agent",
    leftHarnesses: ["claude", "hermes"],
    rightHarnesses: ["pi", "hermes"],
    submit: [
      { tokens: mixed("> submit sketch -> ", ["parle", "fn"]) },
      { tokens: mixed("claim: ", ["lemma 3", "str"]) },
    ],
    reply: [
      { tokens: mixed("< projection from ", ["parle", "fn"], " proof notes") },
      { tokens: mixed("> submit check -> ", ["parle", "fn"]) },
      { tokens: mixed("verdict: ", ["lemma 3 holds", "str"]) },
    ],
    receipt: [
      { tokens: mixed("< projection from ", ["parle", "fn"]) },
      { tokens: mixed("next: ", ["attack theorem 2", "str"]) },
      { tokens: mixed("receipt: ", ["sealed", "com"]) },
    ],
  },
];

function plain(c: string): IdeToken[] {
  return [{ c, cls: "" }];
}

function mixed(
  before: string,
  highlighted: [string, string],
  after = "",
): IdeToken[] {
  return [
    { c: before, cls: "" },
    { c: highlighted[0], cls: highlighted[1] },
    { c: after, cls: "" },
  ];
}

function baseLines(role: string, room: string): TerminalLine[] {
  return [
    { tokens: plain(`${role} joined`) },
    { tokens: mixed("room: ", [room, "str"]) },
  ];
}

function tokenLength(tokens: IdeToken[]) {
  return tokens.reduce((sum, token) => sum + token.c.length, 0);
}

function lineLength(lines: TerminalLine[]) {
  return lines.reduce((sum, line) => sum + tokenLength(line.tokens), 0);
}

function sliceTokens(tokens: IdeToken[], count: number) {
  let remaining = count;
  const output: IdeToken[] = [];

  for (const token of tokens) {
    if (remaining <= 0) break;
    const c = token.c.slice(0, remaining);
    output.push({ ...token, c });
    remaining -= c.length;
  }

  return output;
}

function sliceLines(lines: TerminalLine[], count: number) {
  let remaining = count;
  const output: TerminalLine[] = [];

  for (const line of lines) {
    if (remaining <= 0) break;

    const length = tokenLength(line.tokens);
    output.push({
      ...line,
      tokens:
        remaining >= length ? line.tokens : sliceTokens(line.tokens, remaining),
    });
    remaining -= length;
  }

  return output;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reduced;
}

function usePhaseClock(reducedMotion: boolean) {
  const [phase, setPhase] = useState<Phase>(0);
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    if (reducedMotion) {
      setPhase(5);
      return;
    }

    const timer = window.setTimeout(() => {
      setPhase((current) => {
        const next = ((current + 1) % 6) as Phase;
        if (next === 0) setCycle((value) => value + 1);
        return next;
      });
    }, phaseDurations[phase]);

    return () => window.clearTimeout(timer);
  }, [phase, reducedMotion]);

  return { phase, cycle };
}

function useTypedBlock(
  lines: TerminalLine[],
  activeKey: string,
  active: boolean,
) {
  const [count, setCount] = useState(0);
  const total = useMemo(() => lineLength(lines), [lines]);

  useEffect(() => {
    setCount(active ? 0 : total);
  }, [active, activeKey, total]);

  useEffect(() => {
    if (!active || count >= total) return;

    const timer = window.setTimeout(() => {
      setCount((current) => current + 1);
    }, 24);

    return () => window.clearTimeout(timer);
  }, [active, count, total]);

  return active ? sliceLines(lines, count) : lines;
}

function useTerminalLines(
  side: Side,
  phase: Phase,
  scenario: Scenario,
  scenarioIndex: number,
  reducedMotion: boolean,
) {
  const submitTyped = useTypedBlock(
    scenario.submit,
    `submit-${scenarioIndex}-${phase}`,
    phase === 1,
  );
  const receiptTyped = useTypedBlock(
    scenario.receipt,
    `receipt-${scenarioIndex}-${phase}`,
    phase === 5 && !reducedMotion,
  );
  const replyTyped = useTypedBlock(
    scenario.reply,
    `reply-${scenarioIndex}-${phase}`,
    phase === 3,
  );

  if (side === "left") {
    return [
      ...baseLines("claude-code", scenario.room),
      ...(phase >= 1 ? submitTyped : []),
      ...(phase >= 5 ? receiptTyped : []),
    ];
  }

  return [
    ...baseLines("pi agent", scenario.room),
    ...(phase >= 3 ? replyTyped : []),
  ];
}

function tailLines(lines: TerminalLine[], count = 7) {
  return lines.slice(Math.max(0, lines.length - count));
}

function activeSideForPhase(phase: Phase): Side | null {
  if (phase === 1 || phase === 5) return "left";
  if (phase === 3) return "right";
  return null;
}

function Terminal({
  title,
  lines,
  active,
  harnesses,
}: {
  title: string;
  lines: TerminalLine[];
  active: boolean;
  harnesses: Harness[];
}) {
  const visible = tailLines(lines, 5);

  return (
    <MockIDE
      className="relative z-10 h-[13.5rem] text-left sm:h-[16rem] lg:h-[22rem]"
      data-theme="dark"
      style={{ borderRadius: "0.875rem" }}
    >
      <div className="pui-ide__chrome">
        <span className="pui-ide__dot pui-ide__dot--red" />
        <span className="pui-ide__dot pui-ide__dot--yellow" />
        <span className="pui-ide__dot pui-ide__dot--green" />
        <span className="pui-ide__tab">{title}</span>
        <div className="ml-auto flex items-center gap-1.5">
          {harnesses.map((harness) => (
            <HarnessBadge harness={harness} key={harness} />
          ))}
        </div>
      </div>
      <pre className="pui-ide__body relative h-[10rem] overflow-hidden whitespace-pre-wrap text-xs leading-6 sm:h-[12.5rem] sm:text-sm lg:h-[18.5rem]">
        <span className="absolute right-5 bottom-24 left-5 block space-y-1.5 sm:bottom-26 sm:space-y-2 lg:bottom-28">
          {visible.map((line, index) => (
            <span
              className={`block min-h-[1.4em] ${line.muted ? "opacity-70" : ""}`}
              key={index}
            >
              {line.tokens.map((token, tokenIndex) =>
                token.cls ? (
                  <span className={`pui-tok-${token.cls}`} key={tokenIndex}>
                    {token.c}
                  </span>
                ) : (
                  token.c
                ),
              )}
              {active && index === visible.length - 1 && (
                <span className="pui-caret" />
              )}
            </span>
          ))}
        </span>
      </pre>
    </MockIDE>
  );
}

function HarnessBadge({ harness }: { harness: Harness }) {
  const config = {
    claude: { mark: "◇", label: "Claude", color: "text-orange-200" },
    hermes: { mark: "☤", label: "Hermes", color: "text-cyan-200" },
    pi: { mark: "π", label: "Pi", color: "text-violet-200" },
  }[harness];

  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[0.65rem] text-ink-200">
      <span className={config.color}>{config.mark}</span>
      <span className="hidden sm:inline">{config.label}</span>
    </span>
  );
}

function ConnectiveLayer({
  phase,
  reducedMotion,
}: {
  phase: Phase;
  reducedMotion: boolean;
}) {
  const inboundActive = phase === 1;
  const projectionActive = phase === 2;
  const replyActive = phase === 3;
  const receiptActive = phase === 4;

  return (
    <>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-1/2 z-0 w-28 -translate-x-1/2 lg:hidden"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <path
          d="M 50 0 C 40 18 40 30 50 42"
          fill="none"
          pathLength="1000"
          stroke="rgba(239,246,255,0.1)"
          strokeLinecap="round"
          strokeWidth="1.5"
        />
        <path
          d="M 50 58 C 60 70 60 84 50 100"
          fill="none"
          pathLength="1000"
          stroke="rgba(239,246,255,0.1)"
          strokeLinecap="round"
          strokeWidth="1.5"
        />
        <path
          className={`parle-comet ${inboundActive || (reducedMotion && phase === 5) ? "opacity-100" : "opacity-0"}`}
          d="M 50 0 C 40 18 40 30 50 42"
          fill="none"
          pathLength="1000"
          stroke="rgba(96,165,250,0.95)"
          strokeLinecap="round"
          strokeWidth="4"
        />
        <path
          className={`parle-comet ${projectionActive || (reducedMotion && phase === 5) ? "opacity-100" : "opacity-0"}`}
          d="M 50 58 C 60 70 60 84 50 100"
          fill="none"
          pathLength="1000"
          stroke="rgba(191,219,254,0.72)"
          strokeLinecap="round"
          strokeWidth="2"
        />
        <path
          className={`parle-comet parle-comet--reverse ${replyActive ? "opacity-100" : "opacity-0"}`}
          d="M 50 58 C 60 70 60 84 50 100"
          fill="none"
          pathLength="1000"
          stroke="rgba(147,197,253,0.85)"
          strokeLinecap="round"
          strokeWidth="2.7"
        />
        <path
          className={`parle-comet parle-comet--reverse ${receiptActive ? "opacity-100" : "opacity-0"}`}
          d="M 50 0 C 40 18 40 30 50 42"
          fill="none"
          pathLength="1000"
          stroke="rgba(191,219,254,0.9)"
          strokeLinecap="round"
          strokeWidth="2.5"
        />
      </svg>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-1/2 z-0 hidden h-44 -translate-y-1/2 lg:block"
        preserveAspectRatio="none"
        viewBox="0 0 1000 160"
      >
        <defs>
          <filter
            id="parle-channel-glow"
            x="-20%"
            y="-80%"
            width="140%"
            height="260%"
          >
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d="M 18 88 C 148 40 278 42 408 76"
          fill="none"
          pathLength="1000"
          stroke="rgba(239,246,255,0.09)"
          strokeLinecap="round"
          strokeWidth="2"
        />
        <path
          d="M 592 76 C 722 42 852 40 982 88"
          fill="none"
          pathLength="1000"
          stroke="rgba(239,246,255,0.09)"
          strokeLinecap="round"
          strokeWidth="2"
        />
        <path
          className={`parle-comet ${inboundActive || (reducedMotion && phase === 5) ? "opacity-100" : "opacity-0"}`}
          d="M 18 88 C 148 40 278 42 408 76"
          fill="none"
          pathLength="1000"
          stroke="rgba(96,165,250,0.98)"
          strokeLinecap="round"
          strokeWidth="5"
          filter="url(#parle-channel-glow)"
        />
        <path
          className={`parle-comet ${projectionActive || (reducedMotion && phase === 5) ? "opacity-100" : "opacity-0"}`}
          d="M 592 76 C 722 42 852 40 982 88"
          fill="none"
          pathLength="1000"
          stroke="rgba(191,219,254,0.7)"
          strokeLinecap="round"
          strokeWidth="2.2"
          filter="url(#parle-channel-glow)"
        />
        <path
          className={`parle-comet parle-comet--reverse ${replyActive ? "opacity-100" : "opacity-0"}`}
          d="M 592 98 C 722 128 852 124 982 84"
          fill="none"
          pathLength="1000"
          stroke="rgba(147,197,253,0.9)"
          strokeLinecap="round"
          strokeWidth="3"
          filter="url(#parle-channel-glow)"
        />
        <path
          className={`parle-comet parle-comet--reverse ${receiptActive ? "opacity-100" : "opacity-0"}`}
          d="M 18 104 C 148 126 278 118 408 88"
          fill="none"
          pathLength="1000"
          stroke="rgba(191,219,254,0.9)"
          strokeLinecap="round"
          strokeWidth="2.7"
          filter="url(#parle-channel-glow)"
        />
        <g
          className={
            projectionActive || reducedMotion ? "opacity-100" : "opacity-0"
          }
        >
          <circle cx="688" cy="48" fill="rgba(191,219,254,0.72)" r="3" />
          <circle cx="716" cy="45" fill="rgba(191,219,254,0.5)" r="2" />
          <circle cx="738" cy="44" fill="rgba(191,219,254,0.32)" r="1.5" />
        </g>
        <g
          className={
            receiptActive || reducedMotion ? "opacity-100" : "opacity-0"
          }
        >
          <circle
            cx="500"
            cy="80"
            fill="none"
            r="44"
            stroke="rgba(96,165,250,0.55)"
            strokeWidth="2"
          />
          <path
            d="M 488 81 L 497 90 L 515 68"
            fill="none"
            stroke="rgba(239,246,255,0.95)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4"
          />
        </g>
      </svg>
    </>
  );
}

function ParleMediationCore({
  phase,
  reducedMotion,
}: {
  phase: Phase;
  reducedMotion: boolean;
}) {
  const activeNode = phase <= 1 ? 0 : phase <= 3 ? 1 : 2;

  return (
    <div className="relative z-10 grid min-h-64 place-items-center overflow-visible py-10 lg:min-h-[22rem] lg:py-0">
      <div className="pointer-events-none absolute inset-x-1/2 top-[-4rem] z-0 h-16 w-px bg-gradient-to-b from-transparent via-ink-300/30 to-ink-300/0 lg:hidden" />
      <div className="pointer-events-none absolute inset-x-1/2 bottom-[-4rem] z-0 h-16 w-px bg-gradient-to-b from-ink-300/0 via-ink-300/20 to-transparent lg:hidden" />
      <div className="absolute inset-0 rounded-[3rem] bg-[radial-gradient(circle_at_center,rgba(96,165,250,0.2),transparent_58%)] blur-2xl" />
      <div className="parle-core-ring absolute size-72 rounded-full border border-ink-300/15 sm:size-80" />
      <div className="parle-core-ring parle-core-ring--slow absolute size-52 rounded-full border border-ink-300/20 sm:size-60" />

      {[0, 1, 2].map((index) => {
        const positions = [
          "top-8 left-1/2 -translate-x-1/2",
          "top-1/2 right-8 -translate-y-1/2",
          "bottom-8 left-1/2 -translate-x-1/2",
        ];
        const active = reducedMotion || index === activeNode;
        return (
          <span
            className={`absolute ${positions[index]} size-2 rounded-full transition-all duration-300 ${
              active
                ? "bg-ink-100 shadow-[0_0_22px_rgba(147,197,253,0.8)]"
                : "bg-ink-300/25"
            }`}
            key={index}
          />
        );
      })}

      <div className="relative grid size-40 place-items-center rounded-full border border-ink-300/35 bg-ink-950/70 shadow-[0_0_80px_rgba(96,165,250,0.22)] backdrop-blur-md sm:size-44">
        <div className="absolute inset-4 rounded-full bg-ink-500/10 blur-xl" />
        <div className="relative text-center">
          <p className="font-mono text-[0.62rem] tracking-[0.32em] text-ink-300 uppercase">
            mediation
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-white">
            Parlè
          </p>
          <p className="mt-2 h-4 font-mono text-[0.62rem] tracking-[0.18em] text-ink-300 uppercase">
            {activeNode === 0 ? "policy" : activeNode === 1 ? "scope" : "seal"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AgentExchangeDemo() {
  const reducedMotion = usePrefersReducedMotion();
  const { phase, cycle } = usePhaseClock(reducedMotion);
  const scenarioIndex = reducedMotion ? 0 : cycle % scenarios.length;
  const scenario = scenarios[scenarioIndex];
  const leftLines = useTerminalLines(
    "left",
    phase,
    scenario,
    scenarioIndex,
    reducedMotion,
  );
  const rightLines = useTerminalLines(
    "right",
    phase,
    scenario,
    scenarioIndex,
    reducedMotion,
  );
  const activeSide = reducedMotion ? null : activeSideForPhase(phase);

  return (
    <section className="mx-auto" aria-label="Parle mediator demo">
      <p className="sr-only">
        Agents submit facts to Parle, read scoped projections, and receive a
        sealed receipt. No direct agent-to-agent channel is shown.
      </p>
      <div className="relative isolate grid items-stretch gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(15rem,18rem)_minmax(0,1fr)]">
        <ConnectiveLayer phase={phase} reducedMotion={reducedMotion} />
        <Terminal
          title="My AI"
          lines={leftLines}
          active={activeSide === "left"}
          harnesses={scenario.leftHarnesses}
        />
        <ParleMediationCore phase={phase} reducedMotion={reducedMotion} />
        <Terminal
          title="Your AI"
          lines={rightLines}
          active={activeSide === "right"}
          harnesses={scenario.rightHarnesses}
        />
      </div>
    </section>
  );
}
