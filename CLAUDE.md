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

- Push to `main` deploys production at `https://parlehq.com`.
- Push to `feature/*`, `feat/*`, or `agent/*` deploys a branch preview. Cloudflare normalizes the branch name into a Pages hostname, for example `feature-homepage-copy.parle-landing.pages.dev`.
- Build: `pnpm build`. Output: `dist/`.
- Deploy: `pnpm exec wrangler pages deploy dist --project-name=parle-landing --branch="$GITHUB_REF_NAME"`.
- The workflow ensures the Cloudflare Pages project and production domains `parlehq.com` and `www.parlehq.com` exist before deploy.
- Runtime deploy secrets are fetched from Infisical path `/forgejo/parle-landing-ci` using the shared Forgejo Actions bootstrap secret `INFISICAL_CENTOPS_CI_ACCESS_TOKEN` and the runner-local tailnet URL `https://parle-vault.quoll-altair.ts.net`.

## Conventions

- Keep the site intentionally minimal.
- Prefer static pages and simple Astro components.
- Validate with `pnpm build` before handoff.
- No em dashes in file output.
