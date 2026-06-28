# Parle Landing

Minimal Astro landing site for Parle.

## Commands

```sh
pnpm install
pnpm dev
pnpm build
```

## Deployment

Forgejo Actions deploys this site to Cloudflare Pages.

- `main` deploys to `https://parle.sh`.
- `feature/*`, `feat/*`, and `agent/*` branches deploy previews, for example `https://feature-example.parle-landing.pages.dev`.
- The workflow fetches Cloudflare credentials from Infisical path `/forgejo/parle-landing-ci` using the shared `INFISICAL_CENTOPS_CI_ACCESS_TOKEN` bootstrap secret and the runner-local tailnet URL `https://parle-vault.quoll-altair.ts.net`.

One time setup still required before the first run:

1. Create the Cloudflare Pages deploy token scoped to the Parle account. It must be able to create or update the `parle-landing` Pages project and attach `parle.sh` plus `www.parle.sh`.
2. Store `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` in Infisical at `/forgejo/parle-landing-ci`.
3. Store the Infisical machine token as the Forgejo Actions secret `INFISICAL_CENTOPS_CI_ACCESS_TOKEN` on `parlehq/parle-landing`.

DNS for `parle.sh` and the `parlehq.com` redirects are managed in `parlehq/centops` under `infra/cloudflare/dns`.
