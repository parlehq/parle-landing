import { Aurora } from "performative-ui";

export default function HeroAurora() {
  return (
    <Aurora
      className="opacity-35"
      blur={64}
      blobs={[
        { color: "rgba(154, 107, 63, 0.16)", x: 30, y: 22, size: 44 },
        { color: "rgba(37, 99, 235, 0.11)", x: 72, y: 38, size: 38 },
        { color: "rgba(51, 65, 85, 0.08)", x: 52, y: 70, size: 52 },
      ]}
    />
  );
}
