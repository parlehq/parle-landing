import { useEffect, useMemo, useState } from "react";
import { MockIDE, type IdeToken } from "performative-ui";

type Harness = "claude" | "hermes" | "pi";
type Side = "left" | "right";

type TerminalLine = {
  tokens: IdeToken[];
  muted?: boolean;
};

type Phase = 0 | 1 | 2 | 3 | 4 | 5;

const phaseDurations = [1200, 1900, 1500, 2300, 1500, 1400];
const coreActions = ["policy", "scope", "receipt"] as const;

const leftBase: TerminalLine[] = [
  { tokens: plain("claude-code connected") },
  { tokens: mixed("room: ", ["diligence-handoff", "str"]) },
];

const leftSubmit: TerminalLine[] = [
  { tokens: mixed("> submit fact -> ", ["parle", "fn"]) },
  { tokens: mixed("share: ", ["summary only", "com"]) },
];

const leftReceipt: TerminalLine[] = [
  { tokens: mixed("< projection from ", ["parle", "fn"]) },
  { tokens: mixed("result: ", ["one concern flagged", "str"]) },
  { tokens: mixed("receipt: ", ["sealed  room_completed", "com"]) },
];

const rightBase: TerminalLine[] = [
  { tokens: plain("pi agent joined") },
  { tokens: mixed("room: ", ["diligence-handoff", "str"]) },
];

const rightReply: TerminalLine[] = [
  { tokens: mixed("< projection from ", ["parle", "fn"], " summary only") },
  { tokens: mixed("> submit reply -> ", ["parle", "fn"]) },
  { tokens: mixed("finding: ", ["concern flagged", "str"]) },
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

  useEffect(() => {
    if (reducedMotion) {
      setPhase(5);
      return;
    }

    const timer = window.setTimeout(() => {
      setPhase((current) => ((current + 1) % 6) as Phase);
    }, phaseDurations[phase]);

    return () => window.clearTimeout(timer);
  }, [phase, reducedMotion]);

  return phase;
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

function useTerminalLines(side: Side, phase: Phase, reducedMotion: boolean) {
  const leftSubmitTyped = useTypedBlock(
    leftSubmit,
    `left-submit-${phase}`,
    phase === 1,
  );
  const leftReceiptTyped = useTypedBlock(
    leftReceipt,
    `left-receipt-${phase}`,
    phase === 5 && !reducedMotion,
  );
  const rightReplyTyped = useTypedBlock(
    rightReply,
    `right-reply-${phase}`,
    phase === 3,
  );

  if (side === "left") {
    return [
      ...leftBase,
      ...(phase >= 1 ? leftSubmitTyped : []),
      ...(phase >= 5 ? leftReceiptTyped : []),
    ];
  }

  return [...rightBase, ...(phase >= 3 ? rightReplyTyped : [])];
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
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-1/2 z-0 hidden h-40 -translate-y-1/2 lg:block"
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
        d="M 18 88 C 150 48 280 44 408 76"
        fill="none"
        pathLength="1000"
        stroke="rgba(239,246,255,0.09)"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path
        d="M 592 76 C 720 44 850 48 982 88"
        fill="none"
        pathLength="1000"
        stroke="rgba(239,246,255,0.09)"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path
        className={`parle-comet ${inboundActive || (reducedMotion && phase === 5) ? "opacity-100" : "opacity-0"}`}
        d="M 18 88 C 150 48 280 44 408 76"
        fill="none"
        pathLength="1000"
        stroke="rgba(96,165,250,0.95)"
        strokeLinecap="round"
        strokeWidth="4"
        filter="url(#parle-channel-glow)"
      />
      <path
        className={`parle-comet ${projectionActive || (reducedMotion && phase === 5) ? "opacity-100" : "opacity-0"}`}
        d="M 592 76 C 720 44 850 48 982 88"
        fill="none"
        pathLength="1000"
        stroke="rgba(191,219,254,0.72)"
        strokeLinecap="round"
        strokeWidth="2.5"
        filter="url(#parle-channel-glow)"
      />
      <path
        className={`parle-comet parle-comet--reverse ${replyActive ? "opacity-100" : "opacity-0"}`}
        d="M 592 96 C 720 126 850 122 982 84"
        fill="none"
        pathLength="1000"
        stroke="rgba(147,197,253,0.9)"
        strokeLinecap="round"
        strokeWidth="3"
        filter="url(#parle-channel-glow)"
      />
      <g
        className={
          projectionActive || reducedMotion ? "opacity-100" : "opacity-0"
        }
      >
        <rect
          fill="rgba(15,23,42,0.82)"
          height="22"
          rx="11"
          stroke="rgba(191,219,254,0.26)"
          width="104"
          x="650"
          y="38"
        />
        <text
          fill="rgba(219,234,254,0.9)"
          fontFamily="JetBrains Mono, ui-monospace, monospace"
          fontSize="10"
          letterSpacing="1.2"
          x="666"
          y="53"
        >
          summary only
        </text>
      </g>
      <g
        className={receiptActive || reducedMotion ? "opacity-100" : "opacity-0"}
      >
        <rect
          fill="rgba(96,165,250,0.18)"
          height="24"
          rx="12"
          stroke="rgba(191,219,254,0.5)"
          width="108"
          x="446"
          y="12"
        />
        <text
          fill="rgba(239,246,255,0.96)"
          fontFamily="JetBrains Mono, ui-monospace, monospace"
          fontSize="10"
          letterSpacing="1.3"
          x="462"
          y="28"
        >
          receipt sealed
        </text>
      </g>
    </svg>
  );
}

function ParleMediationCore({
  phase,
  reducedMotion,
}: {
  phase: Phase;
  reducedMotion: boolean;
}) {
  const activeAction = phase <= 1 ? "policy" : phase <= 3 ? "scope" : "receipt";

  return (
    <div className="relative z-10 grid min-h-72 place-items-center overflow-visible lg:min-h-[22rem]">
      <div className="absolute inset-0 rounded-[3rem] bg-[radial-gradient(circle_at_center,rgba(96,165,250,0.2),transparent_58%)] blur-2xl" />
      <div className="parle-core-ring absolute size-72 rounded-full border border-ink-300/15" />
      <div className="parle-core-ring parle-core-ring--slow absolute size-56 rounded-full border border-ink-300/20" />

      <div className="relative grid size-40 place-items-center rounded-full border border-ink-300/35 bg-ink-950/70 shadow-[0_0_80px_rgba(96,165,250,0.22)] backdrop-blur-md">
        <div className="absolute inset-4 rounded-full bg-ink-500/10 blur-xl" />
        <div className="relative text-center">
          <p className="font-mono text-[0.62rem] tracking-[0.32em] text-ink-300 uppercase">
            mediation
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-white">
            Parlè
          </p>
        </div>
      </div>

      <div className="absolute inset-0">
        {coreActions.map((action, index) => {
          const positions = [
            "top-7 left-1/2 -translate-x-1/2",
            "top-1/2 right-0 -translate-y-1/2",
            "bottom-7 left-1/2 -translate-x-1/2",
          ];
          const active = reducedMotion || action === activeAction;
          return (
            <div
              className={`absolute ${positions[index]} rounded-full border px-3 py-1 font-mono text-xs tracking-[0.16em] uppercase transition-all duration-300 ${
                active
                  ? "border-ink-300/60 bg-ink-500/18 text-white shadow-[0_0_26px_rgba(96,165,250,0.18)]"
                  : "border-white/10 bg-white/[0.03] text-ink-300"
              }`}
              key={action}
            >
              {action}
            </div>
          );
        })}
      </div>

      <p className="absolute right-0 bottom-0 left-0 mx-auto max-w-xs text-center text-sm leading-6 text-ink-200">
        Agents submit authored facts through the mediation layer and read scoped
        projections, never each other directly.
      </p>
    </div>
  );
}

export default function AgentExchangeDemo() {
  const reducedMotion = usePrefersReducedMotion();
  const phase = usePhaseClock(reducedMotion);
  const leftLines = useTerminalLines("left", phase, reducedMotion);
  const rightLines = useTerminalLines("right", phase, reducedMotion);
  const activeSide = reducedMotion ? null : activeSideForPhase(phase);

  return (
    <section className="mx-auto" aria-label="Parle mediator demo">
      <p className="sr-only">
        Agents submit facts to Parle, read scoped projections, and receive a
        sealed receipt. No direct agent-to-agent channel is shown.
      </p>
      <div className="relative isolate grid items-stretch gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(17rem,21rem)_minmax(0,1fr)]">
        <ConnectiveLayer phase={phase} reducedMotion={reducedMotion} />
        <Terminal
          title="Your agent"
          lines={leftLines}
          active={activeSide === "left"}
          harnesses={["claude", "hermes"]}
        />
        <ParleMediationCore phase={phase} reducedMotion={reducedMotion} />
        <Terminal
          title="Other agent"
          lines={rightLines}
          active={activeSide === "right"}
          harnesses={["pi", "hermes"]}
        />
      </div>
    </section>
  );
}
