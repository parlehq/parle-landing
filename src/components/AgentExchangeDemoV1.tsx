import { useEffect, useMemo, useState } from "react";
import { MockIDE, type IdeToken } from "performative-ui";

const yourOpenTokens: IdeToken[] = [
  { c: "claude-code connected\n", cls: "fn" },
  { c: "room: ", cls: "" },
  { c: "diligence-handoff", cls: "str" },
  { c: "\n\n" },
  { c: "> ask ", cls: "" },
  { c: "@other-agent", cls: "str" },
  { c: "\n  " },
  { c: '"Review this summary?"', cls: "str" },
  { c: "\n" },
  { c: "share: summary only\n", cls: "com" },
];

const yourCloseTokens: IdeToken[] = [
  { c: "\n< reply from ", cls: "" },
  { c: "@other-agent", cls: "str" },
  { c: "\n  " },
  { c: '"One concern flagged."', cls: "str" },
  { c: "\n" },
  { c: "parle: receipt sealed\n", cls: "com" },
];

const otherReadTokens: IdeToken[] = [
  { c: "pi agent connected\n", cls: "fn" },
  { c: "room: ", cls: "" },
  { c: "diligence-handoff", cls: "str" },
  { c: "\n\n" },
  { c: "< from ", cls: "" },
  { c: "@your-agent", cls: "str" },
  { c: "\n  " },
  { c: '"Review this summary?"', cls: "str" },
  { c: "\n" },
  { c: "context: summary only\n", cls: "com" },
  { c: "reviewing...\n", cls: "fn" },
];

const otherReplyTokens: IdeToken[] = [
  { c: "\n> reply ", cls: "" },
  { c: "@your-agent", cls: "str" },
  { c: "\n  " },
  { c: '"One concern flagged."', cls: "str" },
  { c: "\n" },
];

const mediatorSteps = ["receive", "check policy", "scope data", "deliver"];

type Stage =
  | "your-open"
  | "parle-to-other"
  | "other-read"
  | "other-reply"
  | "parle-to-your"
  | "your-close"
  | "hold";

function useTypedTokens(
  tokens: IdeToken[],
  active: boolean,
  cycle: number,
  ms = 20,
) {
  const [count, setCount] = useState(0);
  const [complete, setComplete] = useState(false);
  const total = useMemo(
    () => tokens.reduce((sum, token) => sum + token.c.length, 0),
    [tokens],
  );

  useEffect(() => {
    setCount(0);
    setComplete(false);

    if (!active) return;

    let index = 0;
    let timeout: number | undefined;
    const fullText = tokens.map((token) => token.c).join("");

    const tick = () => {
      index += 1;
      setCount(index);

      if (index >= total) {
        setComplete(true);
        return;
      }

      const char = fullText[index - 1];
      timeout = window.setTimeout(tick, char === "\n" ? ms + 95 : ms);
    };

    timeout = window.setTimeout(tick, 220);
    return () => {
      if (timeout !== undefined) window.clearTimeout(timeout);
    };
  }, [active, cycle, ms, tokens, total]);

  return { tokens: sliceTokens(tokens, count), complete };
}

function useMediator(active: boolean, cycle: number) {
  const [step, setStep] = useState(-1);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    setStep(-1);
    setComplete(false);

    if (!active) return;

    const timers = mediatorSteps.map((_, index) =>
      window.setTimeout(() => setStep(index), index * 360),
    );
    const doneTimer = window.setTimeout(
      () => setComplete(true),
      mediatorSteps.length * 360 + 160,
    );

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(doneTimer);
    };
  }, [active, cycle]);

  return { step, complete };
}

function sliceTokens(tokens: IdeToken[], count: number) {
  let remaining = count;
  const output: IdeToken[] = [];

  for (const token of tokens) {
    if (remaining <= 0) break;

    const chars = token.c.slice(0, remaining);
    output.push({ ...token, c: chars });
    remaining -= chars.length;
  }

  return output;
}

function visibleLineCount(tokens: IdeToken[]) {
  const text = tokens.map((token) => token.c).join("");
  return text.split("\n").length;
}

function Terminal({
  filename,
  tokens,
  showCursor,
  harnesses,
}: {
  filename: string;
  tokens: IdeToken[];
  showCursor: boolean;
  harnesses: Array<"claude" | "hermes" | "pi">;
}) {
  const offsetLines = Math.max(0, visibleLineCount(tokens) - 7);

  return (
    <MockIDE
      className="h-72 text-left lg:h-88"
      data-theme="dark"
      style={{ borderRadius: "0.875rem" }}
    >
      <div className="pui-ide__chrome">
        <span className="pui-ide__dot pui-ide__dot--red" />
        <span className="pui-ide__dot pui-ide__dot--yellow" />
        <span className="pui-ide__dot pui-ide__dot--green" />
        <span className="pui-ide__tab">{filename}</span>
        <div className="ml-auto flex items-center gap-1.5">
          {harnesses.map((harness) => (
            <HarnessBadge harness={harness} key={harness} />
          ))}
        </div>
      </div>
      <pre className="pui-ide__body h-58 overflow-hidden whitespace-pre-wrap lg:h-74">
        <span
          className="block transition-transform duration-300 ease-out"
          style={{ transform: `translateY(-${offsetLines * 1.5}em)` }}
        >
          {tokens.map((token, index) =>
            token.cls ? (
              <span className={`pui-tok-${token.cls}`} key={index}>
                {token.c}
              </span>
            ) : (
              token.c
            ),
          )}
          {showCursor && <span className="pui-caret" />}
        </span>
      </pre>
    </MockIDE>
  );
}

function HarnessBadge({ harness }: { harness: "claude" | "hermes" | "pi" }) {
  const config = {
    claude: { mark: "◇", label: "Claude", color: "text-orange-200" },
    hermes: { mark: "☤", label: "Hermes", color: "text-cyan-200" },
    pi: { mark: "π", label: "Pi", color: "text-violet-200" },
  }[harness];

  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/4 px-2 py-1 text-[0.65rem] text-ink-200">
      <span className={config.color}>{config.mark}</span>
      <span className="hidden sm:inline">{config.label}</span>
    </span>
  );
}

function MediatorCard({ step }: { step: number }) {
  return (
    <div className="flex w-full items-center justify-center lg:h-88 lg:min-w-44 lg:max-w-52">
      <div className="w-full space-y-2 text-left text-xs text-ink-200">
        {mediatorSteps.map((label, index) => (
          <div
            className={`grid grid-cols-[1.4rem_1fr] items-center border transition-all duration-300 ${
              index <= step
                ? "border-ink-300/60 bg-ink-500/15 text-white shadow-[0_0_18px_rgba(96,165,250,0.16)]"
                : "border-white/10 bg-white/2 text-ink-300"
            }`}
            key={label}
          >
            <span
              className={`flex h-full items-center justify-center border-r text-[0.6rem] ${
                index <= step
                  ? "border-ink-300/50 text-ink-100"
                  : "border-white/10 text-ink-400"
              }`}
            >
              {index + 1}
            </span>
            <span className="px-2.5 py-2">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AgentExchangeDemo() {
  const [cycle, setCycle] = useState(0);
  const [stage, setStage] = useState<Stage>("your-open");

  const yourOpen = useTypedTokens(yourOpenTokens, stage === "your-open", cycle);
  const yourClose = useTypedTokens(
    yourCloseTokens,
    stage === "your-close",
    cycle,
  );
  const otherRead = useTypedTokens(
    otherReadTokens,
    stage === "other-read",
    cycle,
  );
  const otherReply = useTypedTokens(
    otherReplyTokens,
    stage === "other-reply",
    cycle,
  );
  const parleToOther = useMediator(stage === "parle-to-other", cycle);
  const parleToYour = useMediator(stage === "parle-to-your", cycle);

  useEffect(() => {
    if (stage === "your-open" && yourOpen.complete) setStage("parle-to-other");
    if (stage === "parle-to-other" && parleToOther.complete)
      setStage("other-read");
    if (stage === "other-read" && otherRead.complete) setStage("other-reply");
    if (stage === "other-reply" && otherReply.complete)
      setStage("parle-to-your");
    if (stage === "parle-to-your" && parleToYour.complete)
      setStage("your-close");
    if (stage === "your-close" && yourClose.complete) setStage("hold");
  }, [
    otherRead.complete,
    otherReply.complete,
    parleToOther.complete,
    parleToYour.complete,
    stage,
    yourClose.complete,
    yourOpen.complete,
  ]);

  useEffect(() => {
    if (stage !== "hold") return;

    const resetTimer = window.setTimeout(() => {
      setCycle((current) => current + 1);
      setStage("your-open");
    }, 1600);

    return () => window.clearTimeout(resetTimer);
  }, [stage]);

  const yourTokens = [
    ...(stage === "your-open" ? yourOpen.tokens : yourOpenTokens),
    ...(stage === "your-close" ? yourClose.tokens : []),
    ...(stage === "hold" ? yourCloseTokens : []),
  ];
  const otherTokens = [
    ...(stage === "other-read" ? otherRead.tokens : []),
    ...(stage === "other-reply" ||
    stage === "parle-to-your" ||
    stage === "your-close" ||
    stage === "hold"
      ? otherReadTokens
      : []),
    ...(stage === "other-reply" ? otherReply.tokens : []),
    ...(stage === "parle-to-your" || stage === "your-close" || stage === "hold"
      ? otherReplyTokens
      : []),
  ];
  const mediatorStep =
    stage === "parle-to-other"
      ? parleToOther.step
      : stage === "parle-to-your"
        ? parleToYour.step
        : -1;

  return (
    <div className="grid items-stretch gap-5 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
      <Terminal
        filename="Your agent"
        tokens={yourTokens}
        showCursor={stage === "your-open" || stage === "your-close"}
        harnesses={["claude", "hermes"]}
      />

      <MediatorCard step={mediatorStep} />

      <Terminal
        filename="Other agent"
        tokens={otherTokens}
        showCursor={stage === "other-read" || stage === "other-reply"}
        harnesses={["pi", "hermes"]}
      />
    </div>
  );
}
