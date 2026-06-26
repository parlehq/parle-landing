import { useEffect, useMemo, useRef, useState } from "react";
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

const phaseDurations = [800, 1900, 1100, 2300, 1100, 1400];
const flowDelays: Partial<Record<Phase, number>> = {
  1: 520,
  3: 1080,
};

const guaranteeWords = [
  "policy",
  "scope",
  "seal",
  "audit",
  "identity",
  "consent",
  "grant",
  "revoke",
  "redact",
  "refuse",
  "accept",
  "retain",
  "expire",
  "budget",
  "meter",
  "projection",
  "provenance",
  "quarantine",
  "invite",
  "pass",
  "affordance",
  "idempotency",
  "sandbox",
  "receipt",
];

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

function feedBreak(): TerminalLine[] {
  return [{ tokens: plain("") }, { tokens: plain("") }];
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

function completedLines(side: Side, scenario: Scenario): TerminalLine[] {
  if (side === "left") {
    return [
      ...baseLines("claude-code", scenario.room),
      ...scenario.submit,
      ...scenario.receipt,
    ];
  }

  return [...baseLines("pi agent", scenario.room), ...scenario.reply];
}

function useTerminalLines(
  side: Side,
  phase: Phase,
  scenarioIndex: number,
  cycle: number,
  reducedMotion: boolean,
) {
  const scenario = scenarios[scenarioIndex];
  const role = side === "left" ? "claude-code" : "pi agent";
  const introTyped = useTypedBlock(
    baseLines(role, scenario.room),
    `intro-${side}-${scenarioIndex}-${cycle}`,
    phase === 0 && !reducedMotion,
  );
  const introLines =
    phase === 0 && !reducedMotion ? introTyped : baseLines(role, scenario.room);
  const submitTyped = useTypedBlock(
    scenario.submit,
    `submit-${scenarioIndex}-${cycle}`,
    phase === 1,
  );
  const receiptTyped = useTypedBlock(
    scenario.receipt,
    `receipt-${scenarioIndex}-${cycle}`,
    phase === 5 && !reducedMotion,
  );
  const replyTyped = useTypedBlock(
    scenario.reply,
    `reply-${scenarioIndex}-${cycle}`,
    phase === 3,
  );

  const startCycle = Math.max(0, cycle - 3);
  const history: TerminalLine[] = [];
  for (let itemCycle = startCycle; itemCycle < cycle; itemCycle += 1) {
    if (history.length > 0) history.push(...feedBreak());
    history.push(
      ...completedLines(side, scenarios[itemCycle % scenarios.length]),
    );
  }
  if (history.length > 0) history.push(...feedBreak());

  if (side === "left") {
    return [
      ...history,
      ...introLines,
      ...(phase >= 1 ? submitTyped : []),
      ...(phase >= 5 ? receiptTyped : []),
    ];
  }

  return [...history, ...introLines, ...(phase >= 3 ? replyTyped : [])];
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
}: {
  title: string;
  lines: TerminalLine[];
  active: boolean;
}) {
  return (
    <MockIDE
      className="relative z-20 h-54 text-left sm:h-64 lg:h-88"
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
          {lines.map((line, index) => (
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
              {active && index === lines.length - 1 && (
                <span className="pui-caret" />
              )}
            </span>
          ))}
        </span>
      </pre>
    </MockIDE>
  );
}

type OrbitParticle = {
  side: Side;
  theta: number;
  radius: number;
  speed: number;
  decay: number;
  size: number;
  lane: number;
};

function makeOrbitParticle(side: Side, index: number): OrbitParticle {
  const left = side === "left";
  const seed = index * 0.73 + (left ? 0.2 : 1.1);
  const theta = left
    ? Math.PI * (0.82 + (seed % 0.42))
    : Math.PI * (-0.18 + (seed % 0.42));

  return {
    side,
    theta,
    radius: 0.72 + ((seed * 1.37) % 0.28),
    speed: (left ? 0.34 : -0.34) + ((seed % 0.18) - 0.09),
    decay: 0.018 + ((seed * 0.37) % 0.012),
    size: 1.1 + ((seed * 1.9) % 2.2),
    lane: ((seed * 1.31) % 1) - 0.5,
  };
}

function respawnParticle(particle: OrbitParticle, burstSide?: Side) {
  const side = burstSide ?? particle.side;
  const left = side === "left";
  particle.side = side;
  particle.theta = left
    ? Math.PI * (0.86 + Math.random() * 0.28)
    : Math.PI * (-0.14 + Math.random() * 0.28);
  particle.radius = 0.86 + Math.random() * 0.22;
  particle.speed = (left ? 0.42 : -0.42) + (Math.random() - 0.5) * 0.16;
  particle.decay = 0.018 + Math.random() * 0.014;
  particle.size = 1 + Math.random() * 2.2;
  particle.lane = Math.random() - 0.5;
}

function OrbitField({
  phase,
  reducedMotion,
  mobile = false,
}: {
  phase: Phase;
  reducedMotion: boolean;
  mobile?: boolean;
}) {
  const refs = useRef<SVGCircleElement[]>([]);
  const burstRefs = useRef<SVGCircleElement[]>([]);
  const burstRef = useRef<OrbitParticle | null>(null);
  const previousPhase = useRef<Phase>(phase);
  const particles = useMemo(
    () =>
      Array.from({ length: mobile ? 14 : 18 }, (_, index) =>
        makeOrbitParticle(index % 2 === 0 ? "left" : "right", index),
      ),
    [mobile],
  );

  useEffect(() => {
    if (reducedMotion) return;
    let frame = 0;
    let last = performance.now();
    const centerX = mobile ? 30 : 500;
    const centerY = mobile ? 60 : 80;
    const outerX = mobile ? 22 : 248;
    const outerY = mobile ? 52 : 86;
    const inner = mobile ? 0.16 : 0.18;

    const drawParticle = (
      circle: SVGCircleElement | undefined,
      particle: OrbitParticle,
      glow = false,
    ) => {
      if (!circle) return;
      const squash = 0.5 + particle.radius * 0.18;
      const laneOffset = particle.lane * (mobile ? 5 : 14);
      const x = centerX + Math.cos(particle.theta) * outerX * particle.radius;
      const y =
        centerY +
        Math.sin(particle.theta) * outerY * particle.radius * squash +
        laneOffset;
      const fadeIn = Math.min(1, (1.04 - particle.radius) / 0.16);
      const fadeOut = Math.min(1, (particle.radius - inner) / 0.32);
      const opacity = Math.max(0, Math.min(1, fadeIn, fadeOut));
      circle.setAttribute("cx", x.toFixed(2));
      circle.setAttribute("cy", y.toFixed(2));
      const particleScale = mobile ? (glow ? 0.28 : 0.2) : 1.35;
      circle.setAttribute("r", (particle.size * particleScale).toFixed(2));
      circle.setAttribute(
        "opacity",
        (opacity * (glow ? 0.95 : 0.64)).toFixed(3),
      );
    };

    const tick = (now: number) => {
      const dt = Math.min(48, now - last) / 1000;
      last = now;

      particles.forEach((particle, index) => {
        particle.theta += particle.speed * dt;
        particle.radius -= particle.decay * dt * 7;
        if (particle.radius < inner) respawnParticle(particle);
        drawParticle(refs.current[index], particle);
      });

      if (burstRef.current) {
        const burst = burstRef.current;
        burst.theta += burst.speed * dt * 1.45;
        burst.radius -= burst.decay * dt * 16;
        [0, 1, 2].forEach((_, index) => {
          const clone = {
            ...burst,
            theta: burst.theta - index * 0.05,
            radius: burst.radius + index * 0.035,
            size: burst.size - index * 0.8,
          };
          drawParticle(burstRefs.current[index], clone, true);
        });
        if (burst.radius < inner * 0.9) burstRef.current = null;
      } else {
        burstRefs.current.forEach((circle) =>
          circle?.setAttribute("opacity", "0"),
        );
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [mobile, particles, reducedMotion]);

  useEffect(() => {
    if (reducedMotion || previousPhase.current === phase) {
      previousPhase.current = phase;
      return;
    }

    let timer = 0;
    if (phase === 1 || phase === 3) {
      const side: Side = phase === 3 ? "right" : "left";
      const runBurst = () => {
        particles.slice(0, 7).forEach((particle, index) => {
          respawnParticle(particle, side);
          particle.radius = 0.96 + index * 0.018;
          particle.decay = 0.024 + index * 0.002;
          particle.size = 1.4 + (index % 3) * 0.65;
        });
        const particle = makeOrbitParticle(side, phase * 11);
        respawnParticle(particle, side);
        particle.radius = 1.06;
        particle.size = 4.1;
        particle.decay = 0.026;
        particle.speed = side === "left" ? 0.72 : -0.72;
        burstRef.current = particle;
      };
      timer = window.setTimeout(runBurst, flowDelays[phase] ?? 0);
    }
    previousPhase.current = phase;
    return () => window.clearTimeout(timer);
  }, [particles, phase, reducedMotion]);

  if (reducedMotion) {
    const staticDots = mobile
      ? [
          [21, 32, 0.42],
          [37, 44, 0.54],
          [40, 76, 0.36],
          [22, 88, 0.48],
        ]
      : [
          [342, 66, 1.8],
          [432, 44, 2.2],
          [574, 116, 1.5],
          [662, 92, 2],
        ];
    return (
      <g>
        {staticDots.map(([cx, cy, r], index) => (
          <circle
            cx={cx}
            cy={cy}
            fill="rgba(191,219,254,0.42)"
            key={index}
            r={r}
          />
        ))}
      </g>
    );
  }

  return (
    <g>
      {particles.map((_, index) => (
        <circle
          fill="rgba(191,219,254,0.86)"
          key={index}
          ref={(node) => {
            if (node) refs.current[index] = node;
          }}
        />
      ))}
      {[0, 1, 2].map((_, index) => (
        <circle
          fill={
            index === 0 ? "rgba(239,246,255,0.98)" : "rgba(147,197,253,0.56)"
          }
          filter={index === 0 ? "url(#parle-channel-glow)" : undefined}
          key={`burst-${index}`}
          ref={(node) => {
            if (node) burstRefs.current[index] = node;
          }}
        />
      ))}
    </g>
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
  const replyActive = phase === 3;
  const receiptActive = phase === 4;
  const inboundDelay = `${flowDelays[1] ?? 0}ms`;
  const replyDelay = `${flowDelays[3] ?? 0}ms`;

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
          <radialGradient id="parle-flow-core-mobile" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(191,219,254,0.2)" />
            <stop offset="100%" stopColor="rgba(96,165,250,0)" />
          </radialGradient>
        </defs>
        <ellipse
          cx="30"
          cy="60"
          rx="23"
          ry="52"
          fill="url(#parle-flow-core-mobile)"
          opacity="0.72"
        />
        <path
          className={`parle-inflow ${inboundActive ? "parle-inflow--active" : ""}`}
          d="M 30 0 C 18 20 18 38 29 50"
          fill="none"
          style={{ animationDelay: inboundActive ? inboundDelay : "0ms" }}
        />
        <path
          className={`parle-inflow ${replyActive ? "parle-inflow--active" : ""}`}
          d="M 30 120 C 42 100 42 82 31 70"
          fill="none"
          style={{ animationDelay: replyActive ? replyDelay : "0ms" }}
        />
        <OrbitField phase={phase} reducedMotion={reducedMotion} mobile />
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
          <radialGradient id="parle-flow-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(191,219,254,0.24)" />
            <stop offset="58%" stopColor="rgba(96,165,250,0.08)" />
            <stop offset="100%" stopColor="rgba(96,165,250,0)" />
          </radialGradient>
        </defs>
        <ellipse
          cx="500"
          cy="80"
          rx="238"
          ry="84"
          fill="url(#parle-flow-core)"
          opacity="0.78"
        />
        <path
          className={`parle-inflow ${inboundActive ? "parle-inflow--active" : ""}`}
          d="M 112 92 C 222 70 308 58 382 46 C 444 36 500 28 552 44"
          fill="none"
          style={{ animationDelay: inboundActive ? inboundDelay : "0ms" }}
        />
        <path
          className={`parle-inflow ${replyActive ? "parle-inflow--active" : ""}`}
          d="M 888 68 C 778 90 692 102 618 114 C 556 124 500 132 448 116"
          fill="none"
          style={{ animationDelay: replyActive ? replyDelay : "0ms" }}
        />
        <OrbitField phase={phase} reducedMotion={reducedMotion} />
        <g
          className={
            receiptActive || reducedMotion ? "opacity-100" : "opacity-0"
          }
        >
          <circle
            cx="500"
            cy="80"
            fill="none"
            r="48"
            stroke="rgba(96,165,250,0.46)"
            strokeWidth="1.5"
          />
          <path
            d="M 488 81 L 497 90 L 515 68"
            fill="none"
            stroke="rgba(239,246,255,0.9)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3.4"
          />
        </g>
      </svg>
    </>
  );
}

function ParleMediationCore({
  phase,
  cycle,
  reducedMotion,
}: {
  phase: Phase;
  cycle: number;
  reducedMotion: boolean;
}) {
  const activeNode: Side = phase <= 2 ? "left" : "right";
  const guaranteeWord =
    guaranteeWords[(cycle * 6 + phase) % guaranteeWords.length];

  return (
    <div className="relative z-10 grid min-h-64 place-items-center overflow-visible py-10 lg:min-h-88 lg:py-0">
      <div className="pointer-events-none absolute inset-x-1/2 -top-16 z-0 h-16 w-px bg-linear-to-b from-transparent via-ink-300/30 to-ink-300/0 lg:hidden" />
      <div className="pointer-events-none absolute inset-x-1/2 -bottom-16 z-0 h-16 w-px bg-linear-to-b from-ink-300/0 via-ink-300/20 to-transparent lg:hidden" />
      <div className="absolute inset-0 rounded-[3rem] bg-[radial-gradient(circle_at_center,rgba(96,165,250,0.2),transparent_58%)] blur-2xl" />
      <div className="parle-core-circle absolute size-72 rounded-full border border-ink-300/12 sm:size-80" />
      <div className="parle-core-circle parle-core-circle--inner absolute size-52 rounded-full border border-ink-300/14 sm:size-60" />

      {[
        {
          side: "left" as const,
          position:
            "top-8 left-1/2 -translate-x-1/2 lg:top-1/2 lg:left-8 lg:translate-x-0 lg:-translate-y-1/2",
        },
        {
          side: "right" as const,
          position:
            "bottom-8 left-1/2 -translate-x-1/2 lg:top-1/2 lg:right-8 lg:bottom-auto lg:left-auto lg:translate-x-0 lg:-translate-y-1/2",
        },
      ].map((node) => {
        const active = node.side === (reducedMotion ? "left" : activeNode);
        return (
          <span
            className={`absolute ${node.position} size-2 rounded-full transition-all duration-300 ${
              active
                ? "bg-ink-100 shadow-[0_0_22px_rgba(147,197,253,0.8)]"
                : "bg-ink-300/25"
            }`}
            key={node.side}
          />
        );
      })}

      <div className="relative grid size-40 place-items-center rounded-full border border-ink-300/35 bg-ink-950/70 shadow-[0_0_80px_rgba(96,165,250,0.22)] backdrop-blur-md sm:size-44">
        <div className="absolute inset-4 rounded-full bg-ink-500/10 blur-xl" />
        <div className="relative text-center">
          <p
            className="text-4xl tracking-wide text-white"
            style={{ fontFamily: "'Momo Trust Display', sans-serif" }}
          >
            Parlè
          </p>
          <p className="mt-2 h-4 font-mono text-[0.62rem] tracking-widest text-ink-300 uppercase">
            {guaranteeWord}
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
    scenarioIndex,
    cycle,
    reducedMotion,
  );
  const rightLines = useTerminalLines(
    "right",
    phase,
    scenarioIndex,
    cycle,
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
        />
        <ParleMediationCore
          phase={phase}
          cycle={cycle}
          reducedMotion={reducedMotion}
        />
        <Terminal
          title="Your AI"
          lines={rightLines}
          active={activeSide === "right"}
        />
      </div>
    </section>
  );
}
