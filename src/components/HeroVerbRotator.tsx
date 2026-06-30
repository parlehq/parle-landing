import { useEffect, useState } from "react";
import { Rotator } from "performative-ui";

const HERO_VERBS = ["negotiate", "talk", "work"];

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

export default function HeroVerbRotator() {
  const reducedMotion = usePrefersReducedMotion();

  if (reducedMotion) {
    return (
      <span className="inline-flex w-full justify-center whitespace-nowrap text-fg">
        talk
      </span>
    );
  }

  return (
    <Rotator
      words={HERO_VERBS}
      typeMs={78}
      deleteMs={34}
      holdMs={1450}
      className="!inline-flex w-full justify-center whitespace-nowrap text-fg"
      cursor="_"
    />
  );
}
