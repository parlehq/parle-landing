import { useEffect, useMemo, useState } from "react";
import { MockIDE, type IdeToken } from "performative-ui";

const ideOneTokens: IdeToken[] = [
  { c: "agent: ", cls: "" },
  { c: "ide-1", cls: "fn" },
  { c: "\n" },
  { c: "> ask ", cls: "" },
  { c: "@ide-2", cls: "str" },
  { c: " through parle\n", cls: "" },
  { c: "scope: private handoff\n", cls: "com" },
  { c: "payload: xyz\n", cls: "" },
];

const ideOneCompleteTokens: IdeToken[] = [
  ...ideOneTokens,
  { c: "\n< reply ", cls: "" },
  { c: "@ide-2", cls: "str" },
  { c: "\nanswer: ready\n", cls: "" },
  { c: "receipt: sealed", cls: "com" },
];

const ideTwoTokens: IdeToken[] = [
  { c: "agent: ", cls: "" },
  { c: "ide-2", cls: "fn" },
  { c: "\n" },
  { c: "< from ", cls: "" },
  { c: "@ide-1", cls: "str" },
  { c: " via parle\n", cls: "" },
  { c: "policy: allowed context only\n", cls: "com" },
  { c: "payload: xyz\n", cls: "" },
];

const ideTwoCompleteTokens: IdeToken[] = [
  ...ideTwoTokens,
  { c: "\n> reply ", cls: "" },
  { c: "@ide-1", cls: "str" },
  { c: "\nanswer: ready", cls: "" },
];

const sequence = [0, 1, 2, 3, 4, 5] as const;
type Stage = (typeof sequence)[number];

type Direction = "forward" | "back" | "idle";

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(query.matches);

    const onChange = () => setReduced(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

function useTypedTokens(tokens: IdeToken[], count: number) {
  return useMemo(() => sliceTokens(tokens, count), [tokens, count]);
}

function tokenLength(tokens: IdeToken[]) {
  return tokens.reduce((sum, token) => sum + token.c.length, 0);
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

function Terminal({
  title,
  tokens,
  active,
  dimmed,
  showCursor,
}: {
  title: string;
  tokens: IdeToken[];
  active: boolean;
  dimmed: boolean;
  showCursor: boolean;
}) {
  return (
    <MockIDE
      className={`h-[13.5rem] text-left transition-all duration-500 lg:h-[16rem] ${
        active ? "translate-y-0 opacity-100" : "translate-y-2 opacity-35"
      } ${dimmed ? "saturate-75" : "saturate-100"}`}
      data-theme="dark"
      style={{ borderRadius: "0.25rem" }}
    >
      <div className="pui-ide__chrome">
        <span className="pui-ide__dot pui-ide__dot--red" />
        <span className="pui-ide__dot pui-ide__dot--yellow" />
        <span className="pui-ide__dot pui-ide__dot--green" />
        <span className="pui-ide__tab">{title}</span>
        <span className="ml-auto border border-white/10 px-2 py-0.5 text-[0.62rem] text-ink-200">
          agent
        </span>
      </div>
      <pre className="pui-ide__body h-[10rem] overflow-hidden whitespace-pre-wrap text-sm lg:h-[12.5rem]">
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
      </pre>
    </MockIDE>
  );
}

function ParleLayer({ stage }: { stage: Stage }) {
  const active = stage === 1 || stage === 3;
  const direction: Direction =
    stage === 1 ? "forward" : stage === 3 ? "back" : "idle";
  const settled = stage === 4;

  return (
    <div className="relative flex min-h-52 flex-col justify-center lg:min-h-64">
      <div
        className={`parle-link ${active ? "parle-link--active" : ""} ${
          direction === "back" ? "parle-link--back" : ""
        }`}
      />
      <div
        className={`panel relative z-10 mx-auto w-full max-w-sm border p-5 text-left transition-all duration-500 ${
          stage === 0 || stage === 5
            ? "translate-y-2 opacity-45"
            : "translate-y-0 opacity-100"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="text-xs font-semibold tracking-[0.28em] text-white uppercase">
            Parle
          </div>
          <div className="font-mono text-[0.65rem] tracking-[0.18em] text-ink-300 uppercase">
            secure channel
          </div>
        </div>
        <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3 font-mono text-xs uppercase tracking-[0.14em] text-ink-300">
          <span>IDE 1</span>
          <span className="text-ink-100">
            {direction === "back" ? "←" : "→"}
          </span>
          <span className="text-right">IDE 2</span>
        </div>
        <div className="mt-4 h-px bg-white/10">
          <div
            className={`h-px bg-ink-200 transition-all duration-500 ${
              active || settled ? "w-full opacity-100" : "w-0 opacity-0"
            } ${direction === "back" ? "ml-auto" : ""}`}
          />
        </div>
        <p className="mt-4 text-sm leading-6 text-ink-200">
          Identity, policy, mediation, persona, private negotiation, and
          data-room context travel as one controlled layer.
        </p>
      </div>
    </div>
  );
}

export default function AgentExchangeDemo() {
  const reducedMotion = useReducedMotion();
  const [stage, setStage] = useState<Stage>(0);
  const [cycle, setCycle] = useState(0);
  const [leftCount, setLeftCount] = useState(0);
  const [rightCount, setRightCount] = useState(0);

  useEffect(() => {
    if (reducedMotion) {
      setStage(4);
      setLeftCount(tokenLength(ideOneCompleteTokens));
      setRightCount(tokenLength(ideTwoCompleteTokens));
      return;
    }

    setStage(0);
    setLeftCount(0);
    setRightCount(0);

    const timers: number[] = [];
    const leftTotal = tokenLength(ideOneTokens);
    const rightTotal = tokenLength(ideTwoTokens);

    for (let index = 0; index < leftTotal; index += 1) {
      timers.push(
        window.setTimeout(() => setLeftCount(index + 1), 120 + index * 24),
      );
    }

    timers.push(window.setTimeout(() => setStage(1), 1450));
    timers.push(window.setTimeout(() => setStage(2), 2500));

    for (let index = 0; index < rightTotal; index += 1) {
      timers.push(
        window.setTimeout(() => setRightCount(index + 1), 2580 + index * 24),
      );
    }

    timers.push(window.setTimeout(() => setStage(3), 3900));
    timers.push(window.setTimeout(() => setStage(4), 4950));
    timers.push(
      window.setTimeout(
        () => setLeftCount(tokenLength(ideOneCompleteTokens)),
        5050,
      ),
    );
    timers.push(
      window.setTimeout(
        () => setRightCount(tokenLength(ideTwoCompleteTokens)),
        5050,
      ),
    );
    timers.push(window.setTimeout(() => setStage(5), 6500));
    timers.push(
      window.setTimeout(() => setCycle((current) => current + 1), 7250),
    );

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [cycle, reducedMotion]);

  const leftTokens = useTypedTokens(ideOneCompleteTokens, leftCount);
  const rightTokens = useTypedTokens(ideTwoCompleteTokens, rightCount);

  return (
    <section
      aria-label="Simple Parle message flow from one agent to another"
      className="mx-auto max-w-6xl"
    >
      <p className="sr-only">
        The loop shows IDE 1, Parle, IDE 2, Parle, then both IDEs connected
        before the animation resets.
      </p>
      <div className="grid items-center gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,20rem)_minmax(0,1fr)]">
        <Terminal
          title="IDE 1"
          tokens={leftTokens}
          active={stage === 0 || stage === 4}
          dimmed={stage === 2 || stage === 3 || stage === 5}
          showCursor={stage === 0}
        />

        <ParleLayer stage={stage} />

        <Terminal
          title="IDE 2"
          tokens={rightTokens}
          active={stage === 2 || stage === 4}
          dimmed={stage === 0 || stage === 1 || stage === 5}
          showCursor={stage === 2}
        />
      </div>
    </section>
  );
}
