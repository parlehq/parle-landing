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
const pipelineSteps = [
  "open room",
  "submit facts",
  "scope projection",
  "commit",
  "receipt",
];

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
      tokens: remaining >= length ? line.tokens : sliceTokens(line.tokens, remaining),
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

function useTypedBlock(lines: TerminalLine[], activeKey: string, active: boolean) {
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
  const leftSubmitTyped = useTypedBlock(leftSubmit, `left-submit-${phase}`, phase === 1);
  const leftReceiptTyped = useTypedBlock(
    leftReceipt,
    `left-receipt-${phase}`,
    phase === 5 && !reducedMotion,
  );
  const rightReplyTyped = useTypedBlock(rightReply, `right-reply-${phase}`, phase === 3);

  if (side === "left") {
    return [
      ...leftBase,
      ...(phase >= 1 ? leftSubmitTyped : []),
      ...(phase >= 5 ? leftReceiptTyped : []),
    ];
  }

  return [
    ...rightBase,
    ...(phase >= 3 ? rightReplyTyped : []),
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

function ConnectiveLayer({ phase, reducedMotion }: { phase: Phase; reducedMotion: boolean }) {
  const leftActive = phase === 1;
  const rightOutActive = phase === 2;
  const rightInActive = phase === 3;
  const receiptActive = phase === 4;

  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-1/2 z-0 hidden h-28 -translate-y-1/2 lg:block"
      preserveAspectRatio="none"
      viewBox="0 0 1000 120"
    >
      <defs>
        <filter id="parle-channel-glow" x="-20%" y="-80%" width="140%" height="260%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d="M 20 72 C 170 24 330 26 500 60"
        fill="none"
        pathLength="1000"
        stroke="rgba(239,246,255,0.1)"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path
        d="M 500 60 C 670 94 830 96 980 48"
        fill="none"
        pathLength="1000"
        stroke="rgba(239,246,255,0.1)"
        strokeLinecap="round"
        strokeWidth="2"
      />
      <path
        className={`parle-comet ${leftActive || (reducedMotion && phase === 5) ? "opacity-100" : "opacity-0"}`}
        d="M 20 72 C 170 24 330 26 500 60"
        fill="none"
        pathLength="1000"
        stroke="rgba(96,165,250,0.95)"
        strokeLinecap="round"
        strokeWidth="4"
        filter="url(#parle-channel-glow)"
      />
      <path
        className={`parle-comet ${rightOutActive || (reducedMotion && phase === 5) ? "opacity-100" : "opacity-0"}`}
        d="M 500 60 C 670 94 830 96 980 48"
        fill="none"
        pathLength="1000"
        stroke="rgba(191,219,254,0.75)"
        strokeLinecap="round"
        strokeWidth="2.5"
        filter="url(#parle-channel-glow)"
      />
      <path
        className={`parle-comet parle-comet--reverse ${rightInActive ? "opacity-100" : "opacity-0"}`}
        d="M 500 60 C 670 94 830 96 980 48"
        fill="none"
        pathLength="1000"
        stroke="rgba(147,197,253,0.9)"
        strokeLinecap="round"
        strokeWidth="3"
        filter="url(#parle-channel-glow)"
      />
      <g className={rightOutActive || reducedMotion ? "opacity-100" : "opacity-0"}>
        <rect
          fill="rgba(15,23,42,0.85)"
          height="22"
          rx="11"
          stroke="rgba(191,219,254,0.28)"
          width="104"
          x="610"
          y="75"
        />
        <text
          fill="rgba(219,234,254,0.9)"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          fontSize="10"
          letterSpacing="1.2"
          x="626"
          y="90"
        >
          summary only
        </text>
      </g>
      <g className={receiptActive || reducedMotion ? "opacity-100" : "opacity-0"}>
        <rect
          fill="rgba(96,165,250,0.18)"
          height="24"
          rx="12"
          stroke="rgba(191,219,254,0.5)"
          width="108"
          x="446"
          y="18"
        />
        <text
          fill="rgba(239,246,255,0.96)"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          fontSize="10"
          letterSpacing="1.3"
          x="462"
          y="34"
        >
          receipt sealed
        </text>
      </g>
    </svg>
  );
}

function ParleMediatorCard({ phase, reducedMotion }: { phase: Phase; reducedMotion: boolean }) {
  const settledStep = phase >= 5 ? pipelineSteps.length - 1 : Math.min(phase, 4);

  return (
    <div className="panel relative z-10 flex h-full min-h-72 flex-col justify-between overflow-hidden rounded-3xl p-5 text-left lg:min-h-[22rem]">
      <div className="absolute inset-x-8 top-16 h-28 rounded-full bg-ink-500/20 blur-3xl" />
      <div className="relative">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <p className="text-[0.65rem] font-semibold tracking-[0.28em] text-ink-300 uppercase">
              mediator room
            </p>
            <h3 className="mt-2 text-lg font-semibold text-white">
              Parle mediation layer
            </h3>
          </div>
          <span className="rounded-full border border-ink-300/30 bg-ink-500/10 px-3 py-1 font-mono text-xs text-ink-100">
            Parlè
          </span>
        </div>

        <div className="relative mt-5 space-y-3 pl-1">
          <div className="absolute top-6 bottom-6 left-[1.08rem] w-px bg-white/10" />
          <div
            className="absolute left-[1.08rem] w-px bg-ink-300/70 transition-all duration-500"
            style={{ top: "1.5rem", height: `${Math.max(0, settledStep) * 3.25}rem` }}
          />
          {pipelineSteps.map((label, index) => {
            const active = !reducedMotion && index === settledStep && phase !== 5;
            const complete = reducedMotion || index <= settledStep;
            return (
              <div
                className={`relative grid grid-cols-[2.25rem_1fr] items-center overflow-hidden rounded-xl border transition-all duration-300 ${
                  active
                    ? "border-ink-300/70 bg-ink-500/18 text-white shadow-[0_0_28px_rgba(96,165,250,0.18)]"
                    : complete
                      ? "border-ink-300/35 bg-ink-500/10 text-white"
                      : "border-white/10 bg-white/[0.03] text-ink-300"
                }`}
                key={label}
              >
                <span className="relative z-10 flex h-full items-center justify-center">
                  <span
                    className={`grid size-5 place-items-center rounded-full border text-[0.58rem] ${
                      complete
                        ? "border-ink-300/60 bg-ink-500/30 text-ink-100"
                        : "border-white/15 bg-ink-950 text-ink-400"
                    }`}
                  >
                    {complete ? "✓" : index + 1}
                  </span>
                </span>
                <span className="px-3 py-2.5 text-sm">{label}</span>
              </div>
            );
          })}
        </div>

        <div
          className={`mt-4 inline-flex rounded-full border border-ink-300/40 bg-ink-500/15 px-3 py-1 font-mono text-xs text-ink-100 transition-opacity duration-300 ${
            phase >= 4 || reducedMotion ? "opacity-100" : "opacity-0"
          }`}
        >
          receipt sealed
        </div>
      </div>

      <p className="relative mt-5 text-sm leading-6 text-ink-200">
        Agents submit authored facts to the Mediator and read scoped projections,
        never each other directly.
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
        <ParleMediatorCard phase={phase} reducedMotion={reducedMotion} />
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
