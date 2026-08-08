# Contributing

Ma capacité is intentionally small and browser-only. Contributions should reduce complexity or improve a user-visible guarantee without introducing an unnecessary framework or service.

## Prerequisites

- Node.js `>=22 <23`
- npm

## Install and run

```bash
git clone https://github.com/Rafache/capacity.git
cd capacity
npm ci
npm run dev
```

## Required checks

Run the complete check before opening a pull request:

```bash
npm run check
```

The check covers formatting, ESLint, application and test type checking, unit tests and the production build.

Manually verify the preview for:

- monthly and annual navigation;
- half-day and part-time input limits;
- persistence after reload;
- CSV export, clear and re-import;
- year and school-zone changes;
- keyboard operation of the actions panel and confirmation dialog;
- mobile and desktop layouts with reduced motion enabled.

## Code conventions

- Application code, identifiers, test names, comments and JSDoc are written in English.
- User-facing text belongs in the French catalogue under `src/i18n/`.
- Exported domain functions receive useful English JSDoc when their invariants or versioning are not obvious.
- Prefer pure domain functions, native browser APIs and CSS over new dependencies.
- Delete dead code before extracting a new abstraction.
- Every button that is not a form submit has an explicit `type="button"`.
- Keep focus behavior and accessible names intact when changing interactive components.

## Data formats

Changes to `localStorage` must use a new storage key when the current document is no longer compatible. The application intentionally does not migrate older local formats. CSV changes must update the format marker or remain compatible with current exports. Never commit personal entries, CSV exports, credentials or production data.

## Project structure

```text
src/
  components/       reusable UI and interactions
  data/             school calendar data
  domain/           pure business rules and persistence boundary
  hooks/            small application stores
  i18n/             French labels and shared formatters
  views/            monthly and annual screens
tests/              focused domain and format checks
public/_headers     Cloudflare response headers
```

## Pull requests

Use a descriptive branch and keep one coherent objective per pull request. The description should explain the behavior, compatibility impact, checks run and any preview observations. For refactoring, include before/after measurements for lines, hooks, listeners, bundle size and check duration when relevant.

Cloudflare creates a preview for the branch. Check the generated site and its response headers before merging into `main`.
