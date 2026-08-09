# Contributing

Ma capacité is intentionally small and browser-only. Prefer simple changes that improve behavior or maintainability without adding unnecessary dependencies, abstractions or services.

## Setup

Requirements: Node.js `>=24 <25` and npm.

```bash
git clone https://github.com/Rafache/capacity.git
cd capacity
npm ci
npm run dev
```

## Development workflow

1. Keep each issue and pull request focused on one coherent objective.
2. Create a descriptive branch from the latest `main`.
3. Make the smallest change that solves the problem.
4. Run the full validation suite:

   ```bash
   npm run check
   ```

5. For UI or build changes, verify the Cloudflare pull-request preview and the relevant behavior on mobile and desktop.

## Code conventions

- Code, identifiers, tests, comments, JSDoc, issues and pull requests are written in English.
- User-facing application text remains French and belongs in `src/i18n/`.
- Prefer pure domain functions, native browser APIs and existing dependencies.
- Remove dead code before introducing a new abstraction.
- Preserve keyboard behavior, focus handling and accessible names when changing interactive UI.
- Add JSDoc only when a public domain rule, invariant or compatibility constraint is not obvious from the code.

## Data compatibility

Application data is local to the browser.

- Incompatible `localStorage` changes must use a new storage key; old formats are intentionally not migrated.
- CSV changes must remain compatible with the current export or increment the format marker.
- Never commit personal exports, credentials, secrets or production data.

## Commits

Use a lightweight [Conventional Commits](https://www.conventionalcommits.org/) format:

```text
<type>: <description>
```

Allowed types:

- `feat` — user-facing capability;
- `fix` — bug fix;
- `refactor` — internal change without a functional change;
- `test` — tests only;
- `ci` — CI or GitHub Actions;
- `docs` — documentation only;
- `style` — formatting only;
- `chore` — maintenance that does not fit another type.

Write the description in English, in imperative form, lowercase, without a trailing period. Scopes are optional and should only be used when they improve clarity.

Examples:

```text
feat: add annual working days column
fix: display full school holiday names
refactor: simplify capacity calculation
ci: split tests into dedicated job
```

When useful, reference an issue in the commit footer:

```text
Refs: #42
```

Use `Closes #42` in the pull request description when merging the pull request should close the issue.

Use `!` for an intentional breaking change, for example `feat!: change stored capacity format`, and explain the compatibility impact.

## Pull requests and merge history

Development commits may be temporary, but clean the branch before merge. Fold `WIP`, typo fixes, test fixes and review-only corrections into the logical commit they belong to.

Keep multiple commits when they represent distinct changes worth preserving. Each final commit must be understandable on its own and follow the commit convention above.

- Prefer **Rebase and merge** for several clean, logical commits.
- Use **Squash and merge** for one logical change or disposable intermediate history.
- Avoid merge commits on `main` unless there is a specific reason to preserve one.

The pull request template contains the final checklist. CI must be green before merge.

## Issues

Use the matching template for bugs, features or technical improvements. Prefix the title with `[P0]` for blocking work or `[P1]` for high-priority work when the priority is known.

## Project map

```text
src/components/   UI components and interactions
src/data/         school calendar data
src/domain/       business rules, storage and CSV
src/hooks/        application state hooks
src/i18n/         French text and formatters
src/views/        monthly and annual screens
tests/            focused automated tests
public/_headers   Cloudflare headers
```
