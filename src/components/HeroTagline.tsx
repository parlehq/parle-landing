import { Rotator } from "performative-ui";

const words = [
  "your other agents",
  "your colleague's agents",
  "your bank's agents",
  "any other agents",
];

export default function HeroTagline() {
  return (
    <p className="mt-5 text-lg font-light leading-8 text-ink-100/78 sm:text-xl">
      Your agents can securely talk to{" "}
      <Rotator
        className="font-normal text-ink-100"
        words={words}
        typeMs={55}
        deleteMs={35}
        holdMs={1500}
      />
    </p>
  );
}
