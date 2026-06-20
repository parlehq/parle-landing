import { useEffect, useMemo, useState } from "react";
import { MockIDE, type IdeToken } from "performative-ui";

const outboundTokens: IdeToken[] = [
  { c: "connected\n", cls: "fn" },
  { c: "room: " },
  { c: "diligence-handoff", cls: "str" },
  { c: "\n\n" },
  { c: "> send " },
  { c: "Other agent", cls: "str" },
  { c: "\n  " },
  { c: "\"Can you review this summary?\"", cls: "str" },
  { c: "\n\n" },
  { c: "status: " },
  { c: "sent through Parlè", cls: "fn" },
  { c: "\n" },
  { c: "scope: summary only\n", cls: "com" },
  { c: "receipt: audited\n", cls: "com" },
];

const inboundTokens: IdeToken[] = [
  { c: "connected\n", cls: "fn" },
  { c: "room: " },
  { c: "diligence-handoff", cls: "str" },
  { c: "\n\n" },
  { c: "< received from " },
  { c: "Your agent", cls: "str" },
  { c: "\n  " },
  { c: "\"Can you review this summary?\"", cls: "str" },
  { c: "\n\n" },
  { c: "allowed context: summary only\n", cls: "com" },
  { c: "verified by Parlè\n", cls: "fn" },
  { c: "\n" },
  { c: "> reply " },
  { c: "Your agent", cls: "str" },
  { c: "\n  " },
  { c: "\"Reviewed. One concern flagged.\"", cls: "str" },
  { c: "\n" },
];

const mediatorSteps = ["receive", "check policy", "scope data", "deliver"];

function useTypedTokens(tokens: IdeToken[], active: boolean, cycle: number, ms = 18) {
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
      timeout = window.setTimeout(tick, char === "\n" ? ms + 90 : ms);
    };

    timeout = window.setTimeout(tick, 250);
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
      window.setTimeout(() => setStep(index), index * 420),
    );
    const doneTimer = window.setTimeout(
      () => setComplete(true),
      mediatorSteps.length * 420 + 180,
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

function Terminal({
  filename,
  tokens,
  showCursor,
  fading,
}: {
  filename: string;
  tokens: IdeToken[];
  showCursor: boolean;
  fading: boolean;
}) {
  return (
    <MockIDE className="min-h-full text-left" data-theme="dark">
      <MockIDE.Chrome filename={filename} thinking={false} />
      <pre className="pui-ide__body min-h-64 whitespace-pre-wrap">
        <span
          className={`transition-opacity duration-500 ${
            fading ? "opacity-0" : "opacity-100"
          }`}
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

function MediatorCard({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-center lg:px-1">
      <div className="panel relative overflow-hidden rounded-3xl px-6 py-5 text-center shadow-2xl shadow-blue-950/30">
        <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-ink-400/70 to-transparent" />
        <p className="text-2xl font-semibold text-white">Parlè</p>
        <p className="mt-1 text-xs text-ink-300">mediates the handoff</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-ink-200 lg:flex-col">
          {mediatorSteps.map((label, index) => (
            <span
              className={`rounded-full border px-3 py-1 transition-all duration-300 ${
                index <= step
                  ? "border-ink-400/60 bg-ink-500/15 text-white shadow-[0_0_18px_rgba(96,165,250,0.22)]"
                  : "border-white/10 text-ink-300"
              }`}
              key={label}
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AgentExchangeDemo() {
  const [cycle, setCycle] = useState(0);
  const [fading, setFading] = useState(false);
  const outbound = useTypedTokens(outboundTokens, true, cycle);
  const mediator = useMediator(outbound.complete, cycle);
  const inbound = useTypedTokens(inboundTokens, mediator.complete, cycle);

  useEffect(() => {
    if (!inbound.complete) return;

    const fadeTimer = window.setTimeout(() => setFading(true), 1800);
    const resetTimer = window.setTimeout(() => {
      setCycle((current) => current + 1);
      setFading(false);
    }, 2400);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(resetTimer);
    };
  }, [inbound.complete]);

  return (
    <div className="grid items-stretch gap-5 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
      <Terminal
        filename="Your agent"
        tokens={outbound.tokens}
        showCursor={!outbound.complete}
        fading={fading}
      />

      <MediatorCard step={mediator.step} />

      <Terminal
        filename="Other agent"
        tokens={inbound.tokens}
        showCursor={mediator.complete && !inbound.complete}
        fading={fading}
      />
    </div>
  );
}
