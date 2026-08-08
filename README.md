# Ma capacité

Ma capacité is a small React/Vite application for planning developer capacity over a fiscal year from July to June. It provides monthly and annual views for working time, paid leave, RTT, training and other absences.

Production: <https://capacity-a59.pages.dev/>

## Privacy and data

- All entries stay in the browser `localStorage` for the current origin.
- No account, backend or analytics service is used.
- CSV import/export is the portable backup mechanism.
- Local storage is not encrypted. Any script running on the same origin could read it, so never use the application for secrets.
- The **Clear all data** action removes the current application data from the device.

## Development

The project requires Node.js `>=22 <23`.

```bash
npm ci
npm run dev
```

Validation and production build:

```bash
npm run check
npm run preview
```

`npm run check` runs Prettier, ESLint with zero warnings, TypeScript, the focused Node test suite, and the Vite production build.

## Data formats

- Local data is stored as `ma-capacite-v3`.
- Earlier local formats are ignored rather than migrated.
- Exported CSV files use stable English identifiers and the `# capacity;version=3` marker.
- CSV import accepts only the current format exported by the application.

The CSV is a semicolon-separated UTF-8 file containing its version marker, an exact
English header and twelve ordered rows from July to June. The available capacity is
exported for readability and recalculated when importing.

## Architecture

- `src/domain/` contains calendar, capacity, storage and CSV rules.
- `src/data/` contains language-independent school-calendar data.
- `src/i18n/` contains the French catalogue and shared `Intl` formatters.
- `src/components/` contains small interactive and presentation components.
- `src/views/` contains the monthly and annual screens.
- `tests/` contains focused domain, CSV, calendar, storage and formatting tests.

The browser reads `localStorage` once, then writes after each explicit action. Domain
functions normalize monthly values, cap absences and derive the monthly and annual
statistics consumed by the views. There is no server, authentication layer or remote
data request.

The calendar covers metropolitan France, national public holidays and school zones A,
B and C. Local Alsace-Moselle and overseas rules are outside the current scope.

## Deployment

Cloudflare Pages builds `main` automatically and creates a preview for pull requests. The build is static and does not require a server-side runtime. `public/_headers` defines the browser security and cache policies copied to the deployment output.

The application remains installable through its manifest, but it does not ship a custom offline cache. A network connection is required to load a fresh deployment.
