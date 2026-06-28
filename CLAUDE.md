# parle-landing

Minimal Parle marketing site.

## Stack

- Astro 5
- Tailwind CSS 4
- pnpm
- Node 22 via mise

## Commands

```sh
pnpm dev
pnpm build
pnpm format
```

## Deployment

Cloudflare Pages via Forgejo Actions. Pipeline: `.forgejo/workflows/deploy.yaml`.

- Push to `main` deploys production at `https://parle.sh`.
- Push to `feature/*`, `feat/*`, or `agent/*` deploys a branch preview. Cloudflare normalizes the branch name into a Pages hostname, for example `feature-homepage-copy.parle-landing.pages.dev`.
- Build: `pnpm build`. Output: `dist/`.
- Deploy: `pnpm exec wrangler pages deploy dist --project-name=parle-landing --branch="$GITHUB_REF_NAME"`.
- The workflow ensures the Cloudflare Pages project and production domains `parle.sh` and `www.parle.sh` exist before deploy.
- Runtime deploy secrets are fetched from Infisical path `/forgejo/parle-landing-ci` using the shared Forgejo Actions bootstrap secret `INFISICAL_CENTOPS_CI_ACCESS_TOKEN` and the runner-local tailnet URL `https://parle-vault.quoll-altair.ts.net`.

## Conventions

- Keep the site intentionally minimal.
- Prefer static pages and simple Astro components.
- Validate with `pnpm build` before handoff.
- No em dashes in file output.

### Styling

- Inline Tailwind utility classes are the default. `src/styles/global.css` is sparing-use-only (theme tokens, base document styles, third-party overrides that need specificity, keyframes, reduced-motion). See the docstring at the top of that file.
- Prefer canonical Tailwind scale utilities over arbitrary bracket values. Snap to the nearest standard utility, for example `tracking-widest` instead of `tracking-[0.18em]`, `h-64` instead of `h-[16rem]`, `-top-32` instead of `top-[-8rem]`, `bg-white/4` instead of `bg-white/[0.04]`. This keeps spacing, sizing, and typography consistent across the site.
- Arbitrary bracket values are acceptable only when there is genuinely no close canonical equivalent and the value is doing real visual work: gradients, masks, box-shadows with rgba, `clamp()` display type, bespoke `grid-template` / `minmax()` layouts, and em-based sizes tied to typography. Do not reach for arbitrary values for basic layout or spacing.
