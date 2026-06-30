import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const css = readFileSync("src/styles/global.css", "utf8");
const cssWithoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
const errors = [];

const requiredAliases = {
  page: "page",
  fg: "fg",
  muted: "muted",
  subtle: "subtle",
  surface: "surface",
  "surface-strong": "surface-strong",
  "surface-inverse": "surface-inverse",
  border: "border",
  "border-strong": "border-strong",
  "accent-ui": "accent",
  "accent-fg": "accent-fg",
  "accent-subtle": "accent-subtle",
  "nav-bg": "nav-bg",
  "button-bg": "button-bg",
  "button-hover": "button-hover",
  "input-bg": "input-bg",
  ring: "ring",
};

function walk(dir) {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const scopedSourceFiles = walk("src").filter((file) =>
  /\.(astro|tsx|ts|js)$/.test(file),
);

const themeBlocks = cssWithoutComments.matchAll(
  /(?:^|\n)[^{]*data-theme[^{]*\{[\s\S]*?\n\}/g,
);
for (const block of themeBlocks) {
  const forbidden = block[0].match(/--color-(?:ink|sand)-[\w-]+\s*:/g) ?? [];
  for (const token of forbidden) {
    errors.push(`Primitive palette token redefined in theme block: ${token}`);
  }
}

if (/--color-line\s*:/.test(css)) {
  errors.push(
    "Use --theme-border instead of the old semantic --color-line token.",
  );
}

const inlineTheme = css.match(/@theme\s+inline\s*\{[\s\S]*?\n\}/)?.[0] ?? "";
for (const [alias, themeToken] of Object.entries(requiredAliases)) {
  const token = `--color-${alias}: var(--theme-${themeToken});`;
  if (!inlineTheme.includes(token)) {
    errors.push(`Missing @theme inline alias: ${token}`);
  }
}

const layout = readFileSync("src/layouts/Layout.astro", "utf8");
if (
  !/parle-theme/.test(layout) ||
  !/try\s*\{[\s\S]*localStorage\.getItem/.test(layout)
) {
  errors.push(
    "Layout.astro must include a try/catch pre-paint parle-theme initializer.",
  );
}

const primitiveUtilityPattern =
  /(?:^|[\s"'`])(?:[a-z]+:)*(?:bg|border|text|ring|from|via|to|placeholder|divide|decoration|outline)-(?:ink|sand|white|black)[^\s"'`\]}]*/g;

for (const file of scopedSourceFiles) {
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, index) => {
    const previous = lines[index - 1] ?? "";
    if (
      line.includes("theme-primitive-ok") ||
      previous.includes("theme-primitive-ok")
    ) {
      return;
    }
    const matches = line.match(primitiveUtilityPattern) ?? [];
    for (const match of matches) {
      errors.push(
        `${file}:${index + 1}: use semantic theme utilities, found ${match.trim()}`,
      );
    }
  });
}

if (errors.length > 0) {
  console.error("Theme convention check failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Theme convention check passed.");
