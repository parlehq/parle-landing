import { useEffect, useMemo, useState } from "react";
import { MockIDE, type IdeToken } from "performative-ui";

type Harness = "claude" | "hermes" | "pi";
type Side = "left" | "right";

type TerminalLine = {
  tokens: IdeToken[];
  muted?: boolean;
};

type DialogueStep =
  | { kind: "line"; side: Side; line: TerminalLine }
  | { kind: "parle"; index: number; duration?: number };

type Concept = {
  eyebrow: string;
  title: string;
  description: string;
  leftTitle: string;
  rightTitle: string;
  leftHarnesses: Harness[];
  rightHarnesses: Harness[];
  parleTitle: string;
  parleSubtitle: string;
  parleSteps: string[];
  parleFootnote: string;
  staticDemo?: boolean;
  script: DialogueStep[];
};

const concepts: Concept[] = [
  {
    eyebrow: "Primary flow",
    title: "A request enters Parle before another agent sees it.",
    description:
      "Both agents talk to Parle first. Parle opens a bounded room, exchanges terms, redacts data, and commits the agreement with a receipt.",
    leftTitle: "Your agent",
    rightTitle: "Other agent",
    leftHarnesses: ["claude", "hermes"],
    rightHarnesses: ["pi", "hermes"],
    parleTitle: "Parle mediation layer",
    parleSubtitle: "bounded room",
    parleSteps: [
      "open room",
      "exchange terms",
      "redact data",
      "commit agreement",
    ],
    parleFootnote:
      "Agents can negotiate inside Parle while policy and data boundaries stay attached to every turn.",
    script: [
      line("left", plain("claude-code connected")),
      line("left", mixed("room: ", ["diligence-handoff", "str"])),
      line("left", mixed("> ask ", ["parle", "fn"], " for mediated review")),
      line("left", mixed("share: ", ["summary only", "com"])),
      parle(0),
      parle(1),
      parle(2),
      line("right", plain("pi agent connected")),
      line("right", mixed("< from ", ["parle", "fn"], " via allowed scope")),
      line("right", mixed("context: ", ["summary only", "com"])),
      line("right", mixed("> reply via ", ["Parle", "fn"], " concern flagged")),
      parle(3),
      line("left", mixed("< reply from ", ["parle", "fn"])),
      line("left", mixed("result: ", ["one concern flagged", "str"])),
      line("left", mixed("receipt: ", ["sealed", "com"])),
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

function line(side: Side, tokens: IdeToken[], muted = false): DialogueStep {
  return { kind: "line", side, line: { tokens, muted } };
}

function parle(index: number, duration = 520): DialogueStep {
  return { kind: "parle", index, duration };
}

function tokenLength(tokens: IdeToken[]) {
  return tokens.reduce((sum, token) => sum + token.c.length, 0);
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

function useDialogue(script: DialogueStep[], reducedMotion: boolean) {
  const [cycle, setCycle] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    if (reducedMotion) return;
    const step = script[stepIndex];

    if (!step) {
      const reset = window.setTimeout(() => {
        setStepIndex(0);
        setCharIndex(0);
        setCycle((current) => current + 1);
      }, 1500);
      return () => window.clearTimeout(reset);
    }

    if (step.kind === "parle") {
      const timer = window.setTimeout(() => {
        setStepIndex((current) => current + 1);
        setCharIndex(0);
      }, step.duration ?? 520);
      return () => window.clearTimeout(timer);
    }

    const total = tokenLength(step.line.tokens);
    if (charIndex >= total) {
      const pause = window.setTimeout(() => {
        setStepIndex((current) => current + 1);
        setCharIndex(0);
      }, 180);
      return () => window.clearTimeout(pause);
    }

    const text = step.line.tokens.map((token) => token.c).join("");
    const timer = window.setTimeout(
      () => setCharIndex((current) => current + 1),
      text[charIndex - 1] === " " ? 16 : 26,
    );
    return () => window.clearTimeout(timer);
  }, [charIndex, cycle, reducedMotion, script, stepIndex]);

  return useMemo(() => {
    const visibleSteps = reducedMotion
      ? script
      : script.slice(0, stepIndex + 1);
    const left: TerminalLine[] = [];
    const right: TerminalLine[] = [];
    let parleStep = reducedMotion ? maxParleStep(script) : -1;
    let activeSide: Side | null = null;

    visibleSteps.forEach((step, index) => {
      if (step.kind === "parle") {
        parleStep = Math.max(parleStep, step.index);
        return;
      }

      const isActive = !reducedMotion && index === stepIndex;
      const lineToShow = isActive
        ? { ...step.line, tokens: sliceTokens(step.line.tokens, charIndex) }
        : step.line;
      if (step.side === "left") left.push(lineToShow);
      if (step.side === "right") right.push(lineToShow);
      if (isActive) activeSide = step.side;
    });

    return { left, right, parleStep, activeSide };
  }, [charIndex, reducedMotion, script, stepIndex]);
}

function maxParleStep(script: DialogueStep[]) {
  return script.reduce(
    (max, step) => (step.kind === "parle" ? Math.max(max, step.index) : max),
    -1,
  );
}

function tailLines(lines: TerminalLine[], count = 7) {
  return lines.slice(Math.max(0, lines.length - count));
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
      className="h-[13.5rem] text-left sm:h-[16rem] lg:h-[22rem]"
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

function ParleMediatorCard({
  concept,
  step,
}: {
  concept: Concept;
  step: number;
}) {
  return (
    <div className="panel relative flex h-full min-h-72 flex-col justify-between overflow-hidden rounded-3xl p-5 text-left lg:min-h-[22rem]">
      <div className="absolute inset-x-8 top-16 h-28 rounded-full bg-ink-500/20 blur-3xl" />
      <div className="relative">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <p className="text-[0.65rem] font-semibold tracking-[0.28em] text-ink-300 uppercase">
              {concept.parleSubtitle}
            </p>
            <h3 className="mt-2 text-lg font-semibold text-white">
              {concept.parleTitle}
            </h3>
          </div>
          <span className="rounded-full border border-ink-300/30 bg-ink-500/10 px-3 py-1 font-mono text-xs text-ink-100">
            Parlè
          </span>
        </div>

        <div className="mt-5 space-y-3">
          {concept.parleSteps.map((label, index) => (
            <div
              className={`grid grid-cols-[1.75rem_1fr] items-stretch overflow-hidden rounded-xl border transition-all duration-300 ${
                index <= step
                  ? "border-ink-300/60 bg-ink-500/15 text-white shadow-[0_0_28px_rgba(96,165,250,0.18)]"
                  : "border-white/10 bg-white/[0.03] text-ink-300"
              }`}
              key={label}
            >
              <span
                className={`flex items-center justify-center border-r text-[0.65rem] ${
                  index <= step ? "border-ink-300/40" : "border-white/10"
                }`}
              >
                {index + 1}
              </span>
              <span className="px-3 py-2.5 text-sm">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="relative mt-5 text-sm leading-6 text-ink-200">
        {concept.parleFootnote}
      </p>
    </div>
  );
}

function ConceptBlock({ concept }: { concept: Concept }) {
  const reducedMotion = usePrefersReducedMotion();
  const dialogue = useDialogue(
    concept.script,
    reducedMotion || Boolean(concept.staticDemo),
  );

  return (
    <div>
      <div className="grid items-stretch gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(17rem,21rem)_minmax(0,1fr)]">
        <Terminal
          title={concept.leftTitle}
          lines={dialogue.left}
          active={dialogue.activeSide === "left"}
          harnesses={concept.leftHarnesses}
        />
        <ParleMediatorCard concept={concept} step={dialogue.parleStep} />
        <Terminal
          title={concept.rightTitle}
          lines={dialogue.right}
          active={dialogue.activeSide === "right"}
          harnesses={concept.rightHarnesses}
        />
      </div>
    </div>
  );
}

export default function AgentExchangeDemo() {
  return (
    <section
      className="mx-auto space-y-10"
      aria-label="Parle mediator concepts"
    >
      <p className="sr-only">
        Two concept demos show agents typing to Parle first. Parle mediates
        policy, context, negotiation, and receipts before an agent receives a
        request.
      </p>
      {concepts.map((concept) => (
        <ConceptBlock concept={concept} key={concept.title} />
      ))}
    </section>
  );
}
