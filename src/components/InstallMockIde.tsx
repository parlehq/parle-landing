import { MockIDE, type IdeToken } from "performative-ui";

const tokens: IdeToken[] = [
  { c: "# Install Parlè\n", cls: "com" },
  { c: "npm", cls: "fn" },
  { c: " install ", cls: "" },
  { c: "parle", cls: "str" },
  { c: "\n\n" },
  { c: "# Create a secure channel\n", cls: "com" },
  { c: "parle", cls: "fn" },
  { c: " init\n" },
  { c: "parle", cls: "fn" },
  { c: " connect ", cls: "" },
  { c: "agent-a", cls: "str" },
  { c: " ", cls: "" },
  { c: "agent-b", cls: "str" },
  { c: "\n\n" },
  { c: "# Start talking\n", cls: "com" },
  { c: "parle", cls: "fn" },
  { c: " send ", cls: "" },
  { c: "\"hello\"", cls: "str" },
  { c: "\n" },
];

export default function InstallMockIde() {
  return (
    <MockIDE
      className="mx-auto w-full max-w-3xl text-left"
      filename="install.sh"
      thinkingLabel="Preparing install…"
      tokens={tokens}
      charMs={[10, 30]}
      loop
    />
  );
}
