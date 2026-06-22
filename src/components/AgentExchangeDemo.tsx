import { useEffect, useMemo, useState } from "react";
import { MockIDE, type IdeToken } from "performative-ui";

const askText = `> ask @other-agent xyz\nvia: parle\n`;
const askTokens: IdeToken[] = [
  { c: "> ask ", cls: "" },
  { c: "@other-agent", cls: "str" },
  { c: " xyz", cls: "" },
  { c: "\nvia: parle", cls: "com" },
  { c: "\n" },
];

const receivedTokens: IdeToken[] = [
  { c: "parle channel open\n", cls: "fn" },
  { c: "from: ", cls: "" },
  { c: "@your-agent", cls: "str" },
  { c: "\n\n" },
  { c: "ask: xyz\n", cls: "" },
  { c: "context: allowed packet only\n", cls: "com" },
];

const replyTokens: IdeToken[] = [
  { c: "\n> reply @your-agent\n", cls: "" },
  { c: "xyz received. answer ready.\n", cls: "str" },
];

const closeTokens: IdeToken[] = [
  { c: "\n< @other-agent\n", cls: "" },
  { c: "xyz received. answer ready.\n", cls: "str" },
  { c: "parle: sealed receipt", cls: "com" },
];

const capabilities = [
  "mediation",
  "security guarantees",
  "personas",
  "closed-door negotiation",
  "data-room diligence",
  "sealed receipts",
];

type Stage = 0 | 1 | 2 | 3 | 4 | 5;

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
  showCursor,
  visible = true,
}: {
  title: string;
  tokens: IdeToken[];
  showCursor: boolean;
  visible?: boolean;
}) {
  return (
    <MockIDE
      className={`h-[13.5rem] text-left transition-all duration-700 lg:h-[16rem] ${
        visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
      }`}
      data-theme="dark"
      style={{ borderRadius: "0.875rem" }}
    >
      <div className="pui-ide__chrome">
        <span className="pui-ide__dot pui-ide__dot--red" />
        <span className="pui-ide__dot pui-ide__dot--yellow" />
        <span className="pui-ide__dot pui-ide__dot--green" />
        <span className="pui-ide__tab">{title}</span>
        <span className="ml-auto rounded-full border border-white/10 px-2 py-0.5 text-[0.62rem] text-ink-200">
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

function ParleLayer({
  stage,
  activeCapability,
}: {
  stage: Stage;
  activeCapability: number;
}) {
  const visible = stage >= 1;
  const sweeping = stage === 1 || stage === 3 || stage === 4;

  return (
    <div
      className={`relative flex min-h-56 flex-col justify-center transition-all duration-700 lg:min-h-64 ${
        visible ? "scale-100 opacity-100" : "scale-95 opacity-0"
      }`}
    >
      <div className={`parle-link ${sweeping ? "parle-link--active" : ""}`} />
      <div className="panel relative z-10 mx-auto w-full max-w-sm rounded-3xl p-4 text-center">
        <div className="mx-auto mb-3 inline-flex items-center rounded-full border border-ink-300/30 bg-ink-500/10 px-3 py-1 text-xs font-medium tracking-[0.24em] text-ink-100 uppercase">
          Parle
        </div>
        <p className="text-sm text-ink-200">Secure agent to agent channel.</p>
        <div className="mt-4 grid grid-cols-2 gap-2 text-left text-[0.7rem] sm:text-xs lg:grid-cols-1">
          {capabilities.map((capability, index) => {
            const lit = stage > 2 || (stage === 2 && index <= activeCapability);
            return (
              <div
                className={`rounded-full border px-3 py-2 transition-all duration-200 ${
                  lit
                    ? "border-ink-300/60 bg-ink-500/20 text-white shadow-[0_0_18px_rgba(96,165,250,0.22)]"
                    : "border-white/10 bg-white/[0.025] text-ink-300"
                }`}
                key={capability}
              >
                <span className="mr-2 text-ink-400">✦</span>
                {capability}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function AgentExchangeDemo() {
  const reducedMotion = useReducedMotion();
  const [stage, setStage] = useState<Stage>(0);
  const [cycle, setCycle] = useState(0);
  const [typedCount, setTypedCount] = useState(0);
  const [activeCapability, setActiveCapability] = useState(-1);

  useEffect(() => {
    if (reducedMotion) {
      setStage(5);
      setTypedCount(askText.length);
      setActiveCapability(capabilities.length - 1);
      return;
    }

    setStage(0);
    setTypedCount(0);
    setActiveCapability(-1);

    const timers: number[] = [];
    askText.split("").forEach((_, index) => {
      timers.push(
        window.setTimeout(() => setTypedCount(index + 1), 120 + index * 42),
      );
    });

    timers.push(window.setTimeout(() => setStage(1), 1400));
    timers.push(window.setTimeout(() => setStage(2), 2300));
    capabilities.forEach((_, index) => {
      timers.push(
        window.setTimeout(() => setActiveCapability(index), 2350 + index * 130),
      );
    });
    timers.push(window.setTimeout(() => setStage(3), 3300));
    timers.push(window.setTimeout(() => setStage(4), 4400));
    timers.push(window.setTimeout(() => setStage(5), 5600));
    timers.push(
      window.setTimeout(() => setCycle((current) => current + 1), 7400),
    );

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [cycle, reducedMotion]);

  const leftTokens = [
    ...useTypedTokens(askTokens, typedCount),
    ...(stage >= 5 ? closeTokens : []),
  ];
  const rightTokens = [
    ...(stage >= 3 ? receivedTokens : []),
    ...(stage >= 4 ? replyTokens : []),
  ];

  return (
    <section
      aria-label="Simple Parle message flow from one agent to another"
      className="mx-auto max-w-6xl"
    >
      <p className="sr-only">
        Your agent asks another agent through Parle. Parle opens a secure
        channel, applies optional capabilities, delivers the message, and
        carries the reply back.
      </p>
      <div className="grid items-center gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,20rem)_minmax(0,1fr)]">
        <Terminal
          title="IDE 1"
          tokens={leftTokens}
          showCursor={stage === 0 || stage === 5}
        />

        <ParleLayer stage={stage} activeCapability={activeCapability} />

        <Terminal
          title="IDE 2"
          tokens={rightTokens}
          showCursor={stage === 3 || stage === 4}
          visible={stage >= 3}
        />
      </div>
    </section>
  );
}
