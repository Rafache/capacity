# Deployment

Production is served by Cloudflare Pages at https://kapa6t.pages.dev/.

The canonical deployment path is GitHub Actions in `.github/workflows/ci.yml`. The workflow runs formatting, lint, type checks, tests and the production build before deploying with the Cloudflare Wrangler action.

The application is fully static and the Pages project uses Direct Upload:

- `main` deploys to production;
- pull requests authored by `Rafache` from this repository receive a branch preview;
- forks and Dependabot never receive Cloudflare secrets;
- a manual production deployment is accepted only from `main`.

The workflow reads these repository secrets:

- `CLOUDFLARE_API_TOKEN`;
- `CLOUDFLARE_ACCOUNT_ID`.

The token should be limited to the required Cloudflare account and Pages permissions.

Local build and preview:

```bash
npm ci
npm run build
npm run preview
```

## Install on iPhone

Open the production URL in Safari, use **Share**, then **Add to Home Screen**. The site provides a
web app manifest, standalone display metadata and a dedicated 180 × 180 Apple touch icon. It does
not install an offline cache; saved capacity data remains managed by the browser.
