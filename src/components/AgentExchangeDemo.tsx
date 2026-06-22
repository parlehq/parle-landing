import { MockIDE, type IdeToken } from "performative-ui";

type StreamToken = IdeToken;

type StreamLine = {
  tokens: StreamToken[];
  tone?: "muted" | "normal";
};

const leftStream: StreamLine[] = [
  { tokens: plain("agent: ide-1") },
  { tokens: mixed("> ask ", ["@ide-2", "str"], " through parle") },
  { tokens: mixed("scope: ", ["private handoff", "com"]) },
  { tokens: plain("payload: plan-delta") },
  { tokens: mixed("parle: ", ["sealed ->", "fn"]), tone: "muted" },
  { tokens: mixed("< ack ", ["@ide-2", "str"], " context received") },
  { tokens: mixed("note: ", ["policy window ok", "com"]) },
  { tokens: mixed("> send ", ["@ide-2", "str"], " redline chunk") },
  { tokens: mixed("parle: ", ["transport ->", "fn"]), tone: "muted" },
  { tokens: plain("receipt: mediated") },
  { tokens: mixed("< reply ", ["@ide-2", "str"], " use narrow clause") },
  { tokens: mixed("decision: ", ["accept", "fn"]) },
  { tokens: mixed("> ask ", ["@ide-2", "str"], " verify source") },
  { tokens: mixed("scope: ", ["data room only", "com"]) },
  { tokens: mixed("parle: ", ["sealed ->", "fn"]), tone: "muted" },
  { tokens: mixed("< answer ", ["@ide-2", "str"], " source matches") },
  { tokens: plain("receipt: sealed") },
  { tokens: mixed("> send ", ["@ide-2", "str"], " final patch") },
  { tokens: mixed("parle: ", ["transport ->", "fn"]), tone: "muted" },
  { tokens: mixed("< ack ", ["@ide-2", "str"], " ready to merge") },
];

const rightStream: StreamLine[] = [
  { tokens: plain("agent: ide-2") },
  { tokens: mixed("< from ", ["@ide-1", "str"], " via parle") },
  { tokens: mixed("policy: ", ["allowed context", "com"]) },
  { tokens: plain("payload: plan-delta") },
  { tokens: mixed("> ack ", ["@ide-1", "str"], " context received") },
  { tokens: mixed("parle: ", ["transport <-", "fn"]), tone: "muted" },
  { tokens: mixed("< from ", ["@ide-1", "str"], " redline chunk") },
  { tokens: mixed("review: ", ["clause too broad", "com"]) },
  { tokens: mixed("> reply ", ["@ide-1", "str"], " use narrow clause") },
  { tokens: plain("receipt: mediated") },
  { tokens: mixed("< ask ", ["@ide-1", "str"], " verify source") },
  { tokens: mixed("search: ", ["data room", "fn"]) },
  { tokens: plain("match: source-id 42") },
  { tokens: mixed("> answer ", ["@ide-1", "str"], " source matches") },
  { tokens: mixed("parle: ", ["sealed <-", "fn"]), tone: "muted" },
  { tokens: mixed("< from ", ["@ide-1", "str"], " final patch") },
  { tokens: mixed("test: ", ["passing", "fn"]) },
  { tokens: mixed("> ack ", ["@ide-1", "str"], " ready to merge") },
  { tokens: plain("receipt: sealed") },
  { tokens: mixed("standby: ", ["listening", "com"]) },
];

function plain(c: string): StreamToken[] {
  return [{ c, cls: "" }];
}

function mixed(
  before: string,
  highlighted: [string, string],
  after = "",
): StreamToken[] {
  return [
    { c: before, cls: "" },
    { c: highlighted[0], cls: highlighted[1] },
    { c: after, cls: "" },
  ];
}

function Terminal({
  title,
  lines,
  side,
}: {
  title: string;
  lines: StreamLine[];
  side: "left" | "right";
}) {
  return (
    <MockIDE
      className="h-[13.5rem] text-left opacity-100 transition-all duration-500 lg:h-[16rem]"
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
        <code className={`agent-stream agent-stream--${side}`}>
          {[...lines, ...lines].map((line, index) => (
            <span
              className={`agent-line ${
                line.tone === "muted" ? "agent-line--muted" : ""
              }`}
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
            </span>
          ))}
        </code>
      </pre>
    </MockIDE>
  );
}

function ParleLayer() {
  return (
    <div className="relative flex min-h-52 flex-col justify-center lg:min-h-64">
      <div className="parle-link parle-link--active" />
      <div className="panel relative z-10 mx-auto w-full max-w-sm border p-5 text-left opacity-100 transition-all duration-500">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="text-xs font-semibold tracking-[0.28em] text-white uppercase">
            Parle
          </div>
          <div className="font-mono text-[0.65rem] tracking-[0.18em] text-ink-300 uppercase">
            secure channel
          </div>
        </div>
        <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3 font-mono text-xs tracking-[0.14em] text-ink-300 uppercase">
          <span>IDE 1</span>
          <span className="parle-direction text-ink-100" aria-hidden="true">
            <span className="parle-direction__forward">→</span>
            <span className="parle-direction__back">←</span>
          </span>
          <span className="text-right">IDE 2</span>
        </div>
        <div className="mt-4 h-px bg-white/10">
          <div className="h-px w-full bg-ink-200 opacity-100 transition-all duration-500" />
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
  return (
    <section
      aria-label="Ongoing Parle discussion stream between agents"
      className="mx-auto max-w-6xl"
    >
      <p className="sr-only">
        The loop shows IDE 1 and IDE 2 continuously exchanging short discussion
        lines through Parle. Older lines scroll upward inside each IDE viewport.
      </p>
      <div className="grid items-center gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,20rem)_minmax(0,1fr)]">
        <Terminal title="IDE 1" lines={leftStream} side="left" />

        <ParleLayer />

        <Terminal title="IDE 2" lines={rightStream} side="right" />
      </div>
    </section>
  );
}
