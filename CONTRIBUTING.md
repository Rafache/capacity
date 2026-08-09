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

## Commit conventions

Use a lightweight Conventional Commits format:

```text
<type>: <description>
```

Allowed types:

- `feat`: new user-facing behavior or capability;
- `fix`: bug fix;
- `refactor`: internal change without a functional change;
- `test`: tests only;
- `ci`: CI or GitHub Actions changes;
- `docs`: documentation only;
- `style`: formatting-only changes;
- `chore`: maintenance that does not fit another type.

Commit descriptions are written in English, use the imperative mood, start with a lowercase letter and do not end with a period. Keep them concise and specific. Scopes such as `feat(calendar): ...` are optional and should only be used when they make the commit clearer.

Examples:

```text
feat: add annual working days column
fix: display full school holiday names
refactor: simplify annual capacity calculation
test: cover annual working days calculation
ci: split tests into dedicated job
docs: document contribution workflow
```

When a commit is related to an existing issue, add the reference as a footer instead of putting the issue number in the subject:

```text
feat: add annual working days column

Refs: #42
```

Use `Refs: #123` when the commit is related to an issue but should not close it. Prefer `Closes #123` in the pull request description when the pull request fully resolves the issue, so the issue is closed when the pull request is merged.

Use `!` for an intentional breaking change, for example `feat!: change stored capacity data format`, and explain the compatibility impact in the commit body or `BREAKING CHANGE:` footer when needed.

## Commit history and merging

Commits created during development may be temporary, but the branch history must be cleaned before merge. Remove or combine `WIP`, `fix typo`, `fix tests`, review-fix and similar intermediate commits with the logical commit they belong to.

Keep multiple commits when they represent distinct, coherent changes that are useful to preserve. Each final commit should be understandable on its own and follow the commit convention above.

Prefer rebasing a feature branch onto the latest `main` instead of merging `main` into the feature branch.

For the final merge:

- prefer **Rebase and merge** when the pull request contains several clean, logical commits worth preserving;
- use **Squash and merge** when the pull request represents a single logical change or its intermediate history has no lasting value;
- avoid creating merge commits on `main` unless there is a specific reason to preserve one.

When using Squash and merge, make sure the resulting commit title also follows the Conventional Commits format.

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

## Issues

Use the appropriate template in `.github/ISSUE_TEMPLATE/`:

- `Bug report` for a reproducible defect;
- `Feature request` for a user-facing improvement;
- `Technical improvement` for refactoring, performance, security, tooling, or CI work.

Prefix issue titles with `[P0]` for blocking or critical work, or `[P1]` for high-priority work. Keep each issue focused on one coherent objective.

## Pull requests

Use a descriptive branch and keep one coherent objective per pull request. Use `.github/PULL_REQUEST_TEMPLATE.md` and explain the behavior, compatibility impact, checks run and any preview observations. For refactoring, include before/after measurements for lines, hooks, listeners, bundle size and check duration when relevant.

Reference the related issue when one exists. Use `Closes #123` when the pull request fully resolves it, or `Refs #123` when the relationship is informational only.

Before merging, clean the branch history according to the commit rules above. A pull request may keep several commits when they represent distinct logical changes; it does not need to be reduced to a single commit.

Cloudflare creates a preview for the branch. Check the generated site and its response headers before merging into `main`.

## Language

Repository artifacts—including code, identifiers, tests, comments, documentation, issues and pull requests—are written in English. User-facing application text remains French and belongs in the translation catalogue.
