import { useEffect, useMemo, useState } from "react";
import { MockIDE, type IdeToken, type IdeTokenClass } from "performative-ui";

type Actor = "left" | "right" | "center";
type Flow = "left-in" | "right-in" | "left-out" | "right-out" | null;
type TerminalSide = "left" | "right";

type TerminalLine = {
  side: TerminalSide;
  tokens: IdeToken[];
  muted?: boolean;
};

type DemoStep = {
  actor: Actor;
  flow: Flow;
  centerLabel: string;
  centerDetail: string;
  centerNote: string;
  left: TerminalLine[];
  right: TerminalLine[];
  duration: number;
};

const steps: DemoStep[] = [
  {
    actor: "left",
    flow: "left-in",
    centerLabel: "Room created",
    centerDetail: "mediator owns state",
    centerNote: "collaboration-channel",
    left: [
      line("left", "> create room ", ["collaboration-channel", "str"]),
      line("left", "> topic ", ["General collaboration with colleague", "com"]),
    ],
    right: [],
    duration: 2400,
  },
  {
    actor: "right",
    flow: "right-in",
    centerLabel: "Joined",
    centerDetail: "invite scoped access",
    centerNote: "policy attached",
    left: [],
    right: [line("right", "> join room ", ["collaboration-channel", "str"])],
    duration: 1900,
  },
  {
    actor: "right",
    flow: "right-in",
    centerLabel: "Request scan",
    centerDetail: "safe to deliver",
    centerNote: "projection only",
    left: [],
    right: [line("right", "> ask ", ["How do you do x, y, z?", "str"])],
    duration: 2100,
  },
  {
    actor: "left",
    flow: "left-out",
    centerLabel: "Request delivered",
    centerDetail: "through the room",
    centerNote: "receipt started",
    left: [line("left", "< safe request ", ["How do you do x, y, z?", "str"])],
    right: [],
    duration: 1800,
  },
  {
    actor: "left",
    flow: "left-in",
    centerLabel: "Answer scan",
    centerDetail: "clean response",
    centerNote: "moderation chain",
    left: [line("left", "> answer ", ["I do a, b, c.", "str"])],
    right: [],
    duration: 1700,
  },
  {
    actor: "right",
    flow: "right-out",
    centerLabel: "Answer delivered",
    centerDetail: "safe content only",
    centerNote: "append-only event",
    left: [],
    right: [line("right", "< answer ", ["I do a, b, c.", "str"])],
    duration: 1700,
  },
  {
    actor: "right",
    flow: "right-in",
    centerLabel: "Request scan",
    centerDetail: "credential found",
    centerNote: "held before delivery",
    left: [],
    right: [
      line("right", "> ask ", ["Can you debug this?", "str"]),
      line("right", "> context ", ["API_KEY included", "com"]),
    ],
    duration: 2300,
  },
  {
    actor: "center",
    flow: "right-in",
    centerLabel: "API key stripped",
    centerDetail: "secret never delivered",
    centerNote: "redacted to [sealed]",
    left: [],
    right: [line("right", "< parle ", ["API_KEY -> [sealed]", "com"])],
    duration: 1700,
  },
  {
    actor: "left",
    flow: "left-out",
    centerLabel: "Safe request delivered",
    centerDetail: "sensitive span removed",
    centerNote: "projection only",
    left: [
      line("left", "< safe request ", ["debug this config", "str"]),
      line("left", "< removed ", ["[sealed]", "com"]),
    ],
    right: [],
    duration: 2100,
  },
  {
    actor: "left",
    flow: "left-in",
    centerLabel: "Answer scan",
    centerDetail: "safe guidance only",
    centerNote: "moderation chain",
    left: [
      line("left", "> answer ", ["Use env vars and scoped tokens.", "str"]),
    ],
    right: [],
    duration: 1900,
  },
  {
    actor: "right",
    flow: "right-out",
    centerLabel: "Sealed",
    centerDetail: "receipt recorded",
    centerNote: "audit trail append-only",
    left: [],
    right: [line("right", "< answer ", ["safe debugging guidance", "str"])],
    duration: 2600,
  },
];

function plain(c: string): IdeToken[] {
  return [{ c, cls: "" }];
}

function mixed(
  before: string,
  highlighted: [string, IdeTokenClass],
  after = "",
): IdeToken[] {
  return [
    { c: before, cls: "" },
    { c: highlighted[0], cls: highlighted[1] },
    { c: after, cls: "" },
  ];
}

function line(
  side: TerminalSide,
  before: string,
  highlighted?: [string, IdeTokenClass],
  after = "",
): TerminalLine {
  return {
    side,
    tokens: highlighted ? mixed(before, highlighted, after) : plain(before),
  };
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

function readPrefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function usePrefersReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(readPrefersReducedMotion);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;

    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(query.matches);

    function handleChange(event: MediaQueryListEvent | MediaQueryList) {
      setReducedMotion(event.matches);
    }

    if (typeof query.addEventListener === "function") {
      query.addEventListener("change", handleChange);
      return () => query.removeEventListener("change", handleChange);
    }

    query.addListener(handleChange);
    return () => query.removeListener(handleChange);
  }, []);

  return reducedMotion;
}

function useStepClock(reducedMotion: boolean) {
  const [stepIndex, setStepIndex] = useState(
    reducedMotion ? steps.length - 1 : 0,
  );

  useEffect(() => {
    if (reducedMotion) {
      setStepIndex(steps.length - 1);
      return;
    }

    const timer = window.setTimeout(() => {
      setStepIndex((current) => (current + 1) % steps.length);
    }, steps[stepIndex].duration);

    return () => window.clearTimeout(timer);
  }, [reducedMotion, stepIndex]);

  return stepIndex;
}

function linesForSide(side: TerminalSide, stepIndex: number) {
  const output: TerminalLine[] = [];
  for (let index = 0; index <= stepIndex; index += 1) {
    output.push(...steps[index][side]);
  }
  return output;
}

function useTypedTokens(
  tokens: IdeToken[],
  activeKey: string,
  active: boolean,
) {
  const [count, setCount] = useState(0);
  const total = useMemo(() => tokenLength(tokens), [tokens]);

  useEffect(() => {
    setCount(active ? 0 : total);
  }, [active, activeKey, total]);

  useEffect(() => {
    if (!active || count >= total) return;

    const timer = window.setTimeout(() => {
      setCount((current) => current + 1);
    }, 22);

    return () => window.clearTimeout(timer);
  }, [active, count, total]);

  return active ? sliceTokens(tokens, count) : tokens;
}

function Terminal({
  title,
  side,
  stepIndex,
  active,
}: {
  title: string;
  side: TerminalSide;
  stepIndex: number;
  active: boolean;
}) {
  const visible = linesForSide(side, stepIndex);
  const latest = visible.at(-1);
  const typedLatest = useTypedTokens(
    latest?.tokens ?? [],
    `${title}-${stepIndex}`,
    Boolean(active && latest),
  );

  return (
    <MockIDE
      className={`relative z-20 h-54 w-full max-w-[400px] justify-self-center text-left transition duration-300 sm:h-64 lg:h-88 ${active ? "ring-1 ring-accent-ui/25" : ""}`}
      data-theme="dark"
      style={{ borderRadius: "0.875rem" }}
    >
      <div className="pui-ide__chrome">
        <span className="pui-ide__dot pui-ide__dot--red" />
        <span className="pui-ide__dot pui-ide__dot--yellow" />
        <span className="pui-ide__dot pui-ide__dot--green" />
        <div className="ml-auto">
          <span className="pui-ide__tab">{title}</span>
        </div>
      </div>
      <pre className="pui-ide__body parle-terminal-body">
        <span className="block">
          {visible.map((entry, index) => {
            const isLatest = index === visible.length - 1;
            const tokens = isLatest ? typedLatest : entry.tokens;
            return (
              <span
                className={`block min-h-[1.4em] ${entry.muted ? "opacity-70" : ""}`}
                key={`${side}-${index}-${tokenLength(entry.tokens)}`}
              >
                {tokens.map((token, tokenIndex) =>
                  token.cls ? (
                    <span className={`pui-tok-${token.cls}`} key={tokenIndex}>
                      {token.c}
                    </span>
                  ) : (
                    token.c
                  ),
                )}
                {active && isLatest && <span className="pui-caret" />}
              </span>
            );
          })}
        </span>
      </pre>
    </MockIDE>
  );
}

function FlowBubbles({
  path,
  active,
  mobile = false,
}: {
  path: string;
  active: boolean;
  mobile?: boolean;
}) {
  if (!active) return null;

  const primaryRadius = mobile ? 0.9 : 3.8;
  const secondaryRadius = mobile ? 0.58 : 2.4;

  return (
    <g>
      {[0, 1, 2].map((index) => (
        <circle
          fill={index === 0 ? "rgba(30,64,175,0.82)" : "rgba(154,107,63,0.58)"}
          filter={index === 0 ? "url(#parle-channel-glow)" : undefined}
          key={index}
          r={index === 0 ? primaryRadius : secondaryRadius}
        >
          <animateMotion
            begin={`${index * 0.18}s`}
            dur="1.15s"
            path={path}
            repeatCount="indefinite"
          />
        </circle>
      ))}
    </g>
  );
}

function ConnectiveLayer({
  step,
  reducedMotion,
}: {
  step: DemoStep;
  reducedMotion: boolean;
}) {
  const leftIn = step.flow === "left-in";
  const rightIn = step.flow === "right-in";
  const leftOut = step.flow === "left-out";
  const rightOut = step.flow === "right-out";
  const showStatic = reducedMotion || step.flow === null;
  const mobileLeftToCenter = "M 30 0 C 18 20 18 38 29 50";
  const mobileCenterToLeft = "M 29 50 C 18 38 18 20 30 0";
  const mobileRightToCenter = "M 30 120 C 42 100 42 82 31 70";
  const mobileCenterToRight = "M 31 70 C 42 82 42 100 30 120";
  const desktopLeftToCenter =
    "M 112 92 C 222 70 308 58 382 46 C 444 36 500 28 552 44";
  const desktopCenterToLeft =
    "M 552 44 C 500 28 444 36 382 46 C 308 58 222 70 112 92";
  const desktopRightToCenter =
    "M 888 68 C 778 90 692 102 618 114 C 556 124 500 132 448 116";
  const desktopCenterToRight =
    "M 448 116 C 500 132 556 124 618 114 C 692 102 778 90 888 68";

  return (
    <>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 z-0 h-132 w-60 -translate-x-1/2 -translate-y-1/2 overflow-visible lg:hidden"
        preserveAspectRatio="xMidYMid meet"
        viewBox="0 0 60 120"
      >
        <defs>
          <filter
            id="parle-channel-glow"
            x="-120%"
            y="-120%"
            width="340%"
            height="340%"
          >
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path className="parle-inflow" d={mobileLeftToCenter} fill="none" />
        <path className="parle-inflow" d={mobileRightToCenter} fill="none" />
        <FlowBubbles
          path={mobileLeftToCenter}
          active={!reducedMotion && leftIn}
          mobile
        />
        <FlowBubbles
          path={mobileCenterToLeft}
          active={!reducedMotion && leftOut}
          mobile
        />
        <FlowBubbles
          path={mobileRightToCenter}
          active={!reducedMotion && rightIn}
          mobile
        />
        <FlowBubbles
          path={mobileCenterToRight}
          active={!reducedMotion && rightOut}
          mobile
        />
        {showStatic && (
          <circle cx="30" cy="60" r="2" fill="rgba(30,64,175,0.46)" />
        )}
      </svg>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 z-0 hidden h-96 w-152 -translate-x-1/2 -translate-y-1/2 overflow-visible lg:block"
        preserveAspectRatio="xMidYMid meet"
        viewBox="0 0 1000 160"
      >
        <defs>
          <filter
            id="parle-channel-glow"
            x="-120%"
            y="-120%"
            width="340%"
            height="340%"
          >
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path className="parle-inflow" d={desktopLeftToCenter} fill="none" />
        <path className="parle-inflow" d={desktopRightToCenter} fill="none" />
        <FlowBubbles
          path={desktopLeftToCenter}
          active={!reducedMotion && leftIn}
        />
        <FlowBubbles
          path={desktopCenterToLeft}
          active={!reducedMotion && leftOut}
        />
        <FlowBubbles
          path={desktopRightToCenter}
          active={!reducedMotion && rightIn}
        />
        <FlowBubbles
          path={desktopCenterToRight}
          active={!reducedMotion && rightOut}
        />
        {showStatic && (
          <>
            <circle cx="432" cy="48" r="2.2" fill="rgba(30,64,175,0.38)" />
            <circle cx="568" cy="112" r="2.2" fill="rgba(154,107,63,0.38)" />
          </>
        )}
      </svg>
    </>
  );
}

function ParleCore({ step }: { step: DemoStep }) {
  return (
    <div className="relative z-10 grid min-h-76 place-items-center overflow-visible py-10 lg:min-h-[26rem] lg:py-0">
      <div className="pointer-events-none absolute inset-x-1/2 -top-16 z-0 h-16 w-px bg-linear-to-b from-transparent via-accent-ui/30 to-accent-ui/0 lg:hidden" />
      <div className="pointer-events-none absolute inset-x-1/2 -bottom-16 z-0 h-16 w-px bg-linear-to-b from-accent-ui/0 via-accent-ui/20 to-transparent lg:hidden" />
      <div className="absolute inset-0 rounded-[3rem] bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.08),transparent_58%)] blur-2xl" />

      <div className="relative grid h-76 w-64 place-items-center overflow-hidden rounded-[1.75rem] border border-border-strong/20 bg-surface-inverse/80 p-5 text-center shadow-[0_0_80px_rgba(37,99,235,0.10)] backdrop-blur-md lg:h-[26rem] lg:w-72">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(116,83,49,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(116,83,49,0.08)_1px,transparent_1px)] bg-size-[2rem_2rem] opacity-35" />
        <div className="relative grid h-60 grid-rows-[2.25rem_3rem_1rem_3.25rem_2.5rem_2rem] justify-items-center gap-3 lg:h-64">
          <img src="/parle-icon-v5.png" alt="" className="h-9 w-auto" />
          <p
            className="text-4xl tracking-wide text-fg"
            style={{ fontFamily: "'Momo Trust Display', sans-serif" }}
          >
            Parlè
          </p>
          <div className="h-px w-20 bg-linear-to-r from-transparent via-accent-ui/45 to-transparent" />
          <p className="grid h-13 max-w-44 place-items-center font-mono text-sm leading-5 tracking-widest text-accent-ui uppercase">
            {step.centerLabel}
          </p>
          <p className="grid h-10 place-items-center text-sm leading-5 text-muted">
            {step.centerDetail}
          </p>
          <p className="grid h-8 place-items-center rounded-full border border-border/12 bg-surface/55 px-3 font-mono text-[0.62rem] tracking-widest text-muted uppercase">
            {step.centerNote}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ParleCollaborationDemo() {
  const reducedMotion = usePrefersReducedMotion();
  const stepIndex = useStepClock(reducedMotion);
  const step = steps[stepIndex];

  return (
    <section
      className="mx-auto w-full max-w-6xl"
      aria-label="Parle collaboration demo"
    >
      <p className="sr-only">
        Two agents collaborate through Parle. Parle creates the room, scans
        every submitted message before delivery, strips an accidental API key,
        and records the exchange.
      </p>
      <div className="relative isolate grid items-center gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,18rem)_minmax(0,1fr)]">
        <ConnectiveLayer step={step} reducedMotion={reducedMotion} />
        <Terminal
          title="Your AI"
          side="left"
          stepIndex={stepIndex}
          active={step.actor === "left"}
        />
        <ParleCore step={step} />
        <Terminal
          title="Their AI"
          side="right"
          stepIndex={stepIndex}
          active={step.actor === "right"}
        />
      </div>
    </section>
  );
}
