import { Aurora } from "performative-ui";

export default function HeroAurora() {
  return (
    <Aurora
      className="opacity-60"
      blur={56}
      blobs={[
        { color: "rgba(96, 165, 250, 0.34)", x: 28, y: 24, size: 42 },
        { color: "rgba(147, 197, 253, 0.22)", x: 72, y: 34, size: 36 },
        { color: "rgba(30, 58, 138, 0.38)", x: 52, y: 72, size: 50 },
      ]}
    />
  );
}
